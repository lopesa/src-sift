"use client";

import {
  SessionWithUserId,
  isValidDistributionItemRecord,
  isValidUserResourceRecord,
} from "@/lib/types";
import {
  createDistributionItem,
  deleteDistributionItem,
  getDistributionItem,
} from "@/lib/utils/distribution-item";
import {
  createUserDataItem,
  deleteUserDataItem,
  getUserDataItem,
  getUserResourcesWithDistributionItem,
} from "@/lib/utils/user-data";
import {
  DistributionItem,
  DistributionItemRecord,
  TemporaryUsersRecord,
  UserResourceRecord,
} from "@/xata";
import { JSONData } from "@xata.io/client";
import { useSession } from "next-auth/react";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";
import { useLocalStorage } from "usehooks-ts";
import savedUserItemsReducer, {
  SavedUserItems,
  SavedUserItemsAction,
} from "./savedUserItemsReducer";

type SavedUserItemsContextT = {
  savedUserItems: SavedUserItems;
  // setSavedUserItems?: Dispatch<SetStateAction<SavedUserItems>>;
  toggleItemIsSaved: (
    resourceId: string,
    distributionItem?: DistributionItem
  ) => Promise<boolean>;
  getItemIsSavedForUser: (
    resourceId: string,
    distributionItem?: DistributionItem
  ) => Promise<boolean>;
};

export const SavedUserItemsContext = createContext<SavedUserItemsContextT>({
  savedUserItems: {
    resourceItemIds: [] as string[],
    distributionItemIds: [] as string[],
    initComplete: false,
  },
  toggleItemIsSaved: () => Promise.resolve(false),
  getItemIsSavedForUser: () => Promise.resolve(false),
});

type SavedUserItemsProviderProps = {
  children: ReactNode;
};

export default function SavedUserItemsProvider({
  children,
}: SavedUserItemsProviderProps) {
  const { data: session, status } = useSession();

  const [temporaryUser, setTemporaryUser] = useLocalStorage<
    JSONData<TemporaryUsersRecord> | undefined
  >("temporaryUser", undefined);

  const [savedUserItems, dispatch] = useReducer(savedUserItemsReducer, {
    resourceItemIds: [],
    distributionItemIds: [],
    initComplete: false,
  });

  const setInitComplete = () => {
    dispatch({
      type: "setInitComplete",
    });
  };

  const addDistributionItemToContext = (id: string) => {
    dispatch({
      type: "addDistributionItem",
      id: id,
    });
  };
  const removeDistributionItemFromContext = (id: string) => {
    dispatch({
      type: "removeDistributionItem",
      id: id,
    });
  };
  const addResourceItemToContext = (id: string) => {
    dispatch({
      type: "addResourceItem",
      id: id,
    });
  };
  const removeResourceItemFromContext = (id: string) => {
    dispatch({
      type: "removeResourceItem",
      id: id,
    });
  };

  const getUserId = useCallback(() => {
    if (status === "authenticated") {
      return (session as SessionWithUserId)?.user?.id;
    }
    return temporaryUser?.id;
  }, [session, status, temporaryUser]);

  const resourceItemIsSavedForUser = (resourceId: string) => {
    return (
      !!savedUserItems.resourceItemIds.length &&
      savedUserItems.resourceItemIds.includes(resourceId)
    );
  };
  const distributionItemIsSavedForUser = (
    distributionItemId: string,
    savedUserItems: SavedUserItems
  ) => {
    // check it agains the savedUserItems.distributionItemIds)
    return savedUserItems.distributionItemIds.includes(distributionItemId);
  };

  const getItemIsSavedForUser = async (
    resourceId: string,
    distributionItem?: DistributionItem
  ) => {
    if (resourceId && !distributionItem) {
      return resourceItemIsSavedForUser(resourceId);
    } else if (resourceId && distributionItem) {
      const existingDistributionItem = await getDistributionItem(
        resourceId,
        distributionItem
      );
      const existingDistributionItemId = isValidDistributionItemRecord(
        existingDistributionItem
      )
        ? existingDistributionItem.id
        : undefined;

      return !!existingDistributionItemId
        ? distributionItemIsSavedForUser(
            existingDistributionItemId,
            savedUserItems
          )
        : false;
    }
    return false;
  };

  const toggleItemIsSaved = async (
    resourceId: string,
    distributionItem?: DistributionItem
  ) => {
    const userId = getUserId();
    const isSaved = await getItemIsSavedForUser(resourceId, distributionItem);

    if (!userId) {
      return false;
    }

    if (!distributionItem) {
      // do regular resource item stuff and return
      if (isSaved) {
        const deletedUserResource = await deleteUserDataItem({
          userId,
          resourceId,
          tempUser: status !== "authenticated",
        });

        if (!isValidUserResourceRecord(deletedUserResource)) {
          return false;
        }

        removeResourceItemFromContext(resourceId);
        return true;
      } else {
        const createdUserResource = await createUserDataItem({
          userId,
          resourceId,
          tempUser: status !== "authenticated",
        });

        if (!createdUserResource) {
          return false;
        }

        // add it to the local saved user resources
        addResourceItemToContext(resourceId);

        return true;
      }
    }

    // item is a distribution item below here
    const existingDistributionItem = await getDistributionItem(
      resourceId,
      distributionItem
    );

    if (isSaved) {
      if (!isValidDistributionItemRecord(existingDistributionItem)) {
        return false;
      }
      // delete the user_resource
      const deletedUserResource = await deleteUserDataItem({
        userId,
        resourceId,
        distributionItemId: existingDistributionItem?.id,
        tempUser: status !== "authenticated",
      });

      if (!isValidUserResourceRecord(deletedUserResource)) {
        return false;
      }

      // if its a distribution item (it is at this point)
      // and if no other users have it saved, delete it from distribution_items
      const remainingUserResources = await getUserResourcesWithDistributionItem(
        existingDistributionItem.id
      ).catch((e) => e);

      if (!remainingUserResources?.length) {
        // delete the distribution_item
        const deletedDistributionItem = await deleteDistributionItem(
          existingDistributionItem.id
        ).catch((e) => e);
      }

      // WARNING! THIS HAS TO BE THE LAST THING TO HAPPEN BEFORE RETURNING OUT
      // OF THIS FUNCTION!!!!
      //(I assume in the add case below although I didn't test it)
      // I lost a lot of time to a weird bug where if I do this then make any
      // api call subsequently, the SavedUserItems context REVERTS! back to
      // having the item that I just deleted.
      removeDistributionItemFromContext(existingDistributionItem.id);

      return true;
    } else {
      // create a distribution_item if it doesn't exist
      let createdDistributionItem;

      if (!isValidDistributionItemRecord(existingDistributionItem)) {
        createdDistributionItem = await createDistributionItem(
          resourceId,
          distributionItem
        );
      }

      const distributionItemId = isValidDistributionItemRecord(
        existingDistributionItem
      )
        ? existingDistributionItem.id
        : isValidDistributionItemRecord(createdDistributionItem)
        ? createdDistributionItem.id
        : undefined;

      if (!distributionItemId) {
        return false;
      }
      // create a user_resource
      const createdUserResource = await createUserDataItem({
        userId,
        resourceId,
        distributionItemId,
        tempUser: status !== "authenticated",
      });

      if (!createdUserResource) {
        return false;
      }

      // add it to the local saved user resources
      addDistributionItemToContext(distributionItemId);

      return true;
    }
  };

  useEffect(() => {
    const userId = getUserId();
    if (!userId) {
      return;
    }
    const getUserData = async () => {
      const userDataJson = await getUserDataItem({
        userId,
        tempUser: status !== "authenticated",
      });

      if (userDataJson?.length) {
        userDataJson.forEach((item: UserResourceRecord) => {
          if (item.resource) {
            addResourceItemToContext(item.resource.id);
          }
          if (item.distribution_item) {
            addDistributionItemToContext(item.distribution_item.id);
          }
        });
      }
      setInitComplete();
    };

    getUserData().catch((e) => {
      // console.log(e);
    });
    return;
  }, [status, getUserId]);

  return (
    <SavedUserItemsContext.Provider
      value={{
        savedUserItems,
        toggleItemIsSaved,
        getItemIsSavedForUser,
      }}
    >
      {children}
    </SavedUserItemsContext.Provider>
  );
}
