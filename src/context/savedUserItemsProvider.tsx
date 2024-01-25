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
  createUserData,
  deleteUserDataItem,
  getUserDataItem,
  getUserResourcesWithDistributionItem,
} from "@/lib/utils/user-data";
import { DistributionItem } from "@/xata";
import { useSession } from "next-auth/react";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import savedUserItemsReducer, { SavedUserItems } from "./savedUserItemsReducer";
import { TemporaryUserContext } from "./temporaryUserProvider";

type SavedUserItemsContextT = {
  savedUserItems: SavedUserItems;
  toggleItemIsSaved: (
    resourceId: string,
    distributionItem?: DistributionItem
  ) => Promise<boolean>;
  getItemIsSavedForUser: (
    resourceId: string,
    distributionItem?: DistributionItem
  ) => Promise<boolean | undefined | string>;
  getUserId: () => string | undefined;
  initLocalContext: () => Promise<boolean>;
};

export const SavedUserItemsContext = createContext<SavedUserItemsContextT>({
  savedUserItems: {
    resourceItemIds: [] as [string, string][], // [resourceId, userResourceId]
    distributionItemIds: [] as [string, string][],
    initComplete: false,
  },
  toggleItemIsSaved: () => Promise.resolve(false),
  getItemIsSavedForUser: () => Promise.resolve(false),
  getUserId: () => undefined,
  initLocalContext: () => Promise.resolve(false),
});

export default function SavedUserItemsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { data: session, status } = useSession();
  const { temporaryUser, tempUserAuthed } = useContext(TemporaryUserContext);
  const [savedUserItems, dispatch] = useReducer(savedUserItemsReducer, {
    resourceItemIds: [],
    distributionItemIds: [],
    initComplete: false,
  });

  const setInitComplete = (initComplete: boolean) => {
    dispatch({
      type: "setInitComplete",
      initComplete,
    });
  };

  const addDistributionItemToContext = (
    distributionItemAndUserResourceIds: [string, string]
  ) => {
    dispatch({
      type: "addDistributionItem",
      distributionItemAndUserResourceIds,
    });
  };
  const removeDistributionItemFromContext = (id: string) => {
    dispatch({
      type: "removeDistributionItem",
      id: id,
    });
  };
  const addResourceItemToContext = (
    resourceAndUserResourceIds: [string, string]
  ) => {
    dispatch({
      type: "addResourceItem",
      resourceAndUserResourceIds,
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
    return !!savedUserItems.resourceItemIds.length &&
      savedUserItems.resourceItemIds
        .map((tuple) => tuple[0])
        .includes(resourceId)
      ? savedUserItems.resourceItemIds.find(
          (tuple) => tuple[0] === resourceId
        )?.[1]
      : false;
  };

  const distributionItemIsSavedForUser = (
    distributionItemId: string,
    savedUserItems: SavedUserItems
  ) => {
    return !!savedUserItems.distributionItemIds.length &&
      savedUserItems.distributionItemIds
        .map((tuple) => tuple[0])
        .includes(distributionItemId)
      ? savedUserItems.distributionItemIds.find(
          (tuple) => tuple[0] === distributionItemId
        )?.[1]
      : false;
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
    const savedUserResourceId = await getItemIsSavedForUser(
      resourceId,
      distributionItem
    );

    if (!userId) {
      return false;
    }

    if (!distributionItem) {
      // do regular resource item stuff and return
      if (savedUserResourceId) {
        const deletedUserResource = await deleteUserDataItem(
          savedUserResourceId
        );

        if (!deletedUserResource) {
          return false;
        }

        removeResourceItemFromContext(resourceId);
        return true;
      } else {
        const createdUserResource = await createUserData({
          userId,
          resourceId,
          tempUser: status !== "authenticated",
        });

        if (!createdUserResource) {
          return false;
        }

        // add it to the local saved user resources
        addResourceItemToContext([resourceId, createdUserResource.id]);

        return true;
      }
    }

    // item is a distribution item below here
    const existingDistributionItem = await getDistributionItem(
      resourceId,
      distributionItem
    );

    if (savedUserResourceId) {
      if (!isValidDistributionItemRecord(existingDistributionItem)) {
        return false;
      }
      // delete the user_resource
      const deletedUserResource = await deleteUserDataItem(savedUserResourceId);

      if (!deletedUserResource) {
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
      const createdUserResource = await createUserData({
        userId,
        resourceId,
        distributionItemId,
        tempUser: status !== "authenticated",
      });

      if (!createdUserResource) {
        return false;
      }

      // add it to the local saved user resources
      addDistributionItemToContext([
        distributionItemId,
        createdUserResource.id,
      ]);

      return true;
    }
  };

  const initLocalContext = useCallback(async () => {
    // debugger;
    if (savedUserItems.initComplete) {
      return false;
    }
    // debugger;
    const userId = getUserId();
    if (!userId) {
      return false;
    }
    const userDataJson = await getUserDataItem({
      userId,
      tempUser: status !== "authenticated",
    });

    if (userDataJson?.length) {
      userDataJson.forEach((item) => {
        if (item.resource && !item.distribution_item) {
          addResourceItemToContext([item.resource.id, item.id]);
        }
        if (item.distribution_item) {
          addDistributionItemToContext([item.distribution_item.id, item.id]);
        }
      });
    }
    // debugger;
    setInitComplete(true);
    return true;
  }, [savedUserItems, getUserId, status]);

  // initial load of local context
  useEffect(() => {
    if (status === "loading") {
      return;
    }
    initLocalContext().catch((e) => {
      // console.log(e);
    });
    return;
  }, [status, initLocalContext]);

  useEffect(() => {
    // debugger;
    if (tempUserAuthed) {
      // debugger;
      setInitComplete(false);
      initLocalContext().catch((e) => {
        // console.log(e);
      });
    }
  }, [tempUserAuthed, initLocalContext]);

  return (
    <SavedUserItemsContext.Provider
      value={{
        savedUserItems,
        toggleItemIsSaved,
        getItemIsSavedForUser,
        getUserId,
        initLocalContext,
      }}
    >
      {children}
    </SavedUserItemsContext.Provider>
  );
}
