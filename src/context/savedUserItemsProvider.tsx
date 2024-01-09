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
} from "react";
import { useLocalStorage } from "usehooks-ts";

type SavedUserItems = {
  resourceItemIds: string[];
  distributionItemIds: string[];
};

type SavedUserItemsContextT = {
  savedUserItems: SavedUserItems;
  setSavedUserItems?: Dispatch<SetStateAction<SavedUserItems>>;
  toggleItemIsSaved: (
    resourceId: string,
    distributionItem?: DistributionItem
  ) => Promise<boolean>;
  getItemIsSaved: (
    resourceId: string,
    distributionItem?: DistributionItem
  ) => Promise<boolean>;
};

export const SavedUserItemsContext = createContext<SavedUserItemsContextT>({
  savedUserItems: { resourceItemIds: [], distributionItemIds: [] },
  toggleItemIsSaved: () => Promise.resolve(false),
  getItemIsSaved: () => Promise.resolve(false),
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

  const [savedUserItems, setSavedUserItems] = useLocalStorage<SavedUserItems>(
    "savedUserItems",
    { resourceItemIds: [], distributionItemIds: [] }
  );

  const addSavedDistributionItem = (id: string) => {
    setSavedUserItems({
      resourceItemIds: [...savedUserItems.resourceItemIds],
      distributionItemIds: [...savedUserItems.distributionItemIds, id],
    });
  };
  const removeSavedDistributionItem = (id: string) => {
    setSavedUserItems({
      resourceItemIds: [...savedUserItems.resourceItemIds],
      distributionItemIds: savedUserItems.distributionItemIds.filter(
        (savedId) => savedId !== id
      ),
    });
  };
  const addSavedResourceItem = (id: string) => {
    setSavedUserItems({
      resourceItemIds: [...savedUserItems.resourceItemIds, id],
      distributionItemIds: [...savedUserItems.distributionItemIds],
    });
  };
  const removeSavedResourceItem = (id: string) => {
    setSavedUserItems({
      resourceItemIds: savedUserItems.resourceItemIds.filter(
        (savedId) => savedId !== id
      ),
      distributionItemIds: [...savedUserItems.distributionItemIds],
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
  const distributionItemIsSavedForUser = (distributionItemId: string) => {
    // check it agains the savedUserItems.distributionItemIds)
    return savedUserItems.distributionItemIds.includes(distributionItemId);
  };

  const getItemIsSaved = async (
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
        ? distributionItemIsSavedForUser(existingDistributionItemId)
        : false;
    }
    return false;
  };

  const toggleItemIsSaved = async (
    resourceId: string,
    distributionItem?: DistributionItem
  ) => {
    const userId = getUserId();

    if (!userId) {
      return false;
    }

    if (!distributionItem) {
      // do regular resource item stuff and return
      return true;
    }

    // item is a distribution item below here
    const existingDistributionItem = await getDistributionItem(
      resourceId,
      distributionItem
    );

    // item is currently saved
    if (isValidDistributionItemRecord(existingDistributionItem)) {
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

      removeSavedDistributionItem(existingDistributionItem.id);

      const remainingUserResources = await getUserResourcesWithDistributionItem(
        existingDistributionItem.id
      ).catch((e) => {
        return {
          error: e.message,
        };
      });

      if (!remainingUserResources?.error && !remainingUserResources?.length) {
        // delete the distribution_item
        const deletedUserResource = await deleteDistributionItem(
          existingDistributionItem.id
        );
      }

      // if its a distribution item and if no other users have it saved, delete it from distribution_items
      return true;
      // item is not currently saved
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
      addSavedDistributionItem(distributionItemId);

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

      let newSavedUserItems = savedUserItems;

      if (userDataJson?.savedUserItems) {
        userDataJson.forEach((item: UserResourceRecord) => {
          if (item.resource) {
            newSavedUserItems.resourceItemIds.push(item.resource.id);
          }
          if (item.distribution_item) {
            newSavedUserItems.distributionItemIds.push(
              item.distribution_item.id
            );
          }
        });
        setSavedUserItems(newSavedUserItems);
      }
    };

    getUserData().catch((e) => {
      // console.log(e);
    });
    return;
  }, [
    status,
    session,
    temporaryUser,
    getUserId,
    savedUserItems,
    setSavedUserItems,
  ]);

  return (
    <SavedUserItemsContext.Provider
      value={{
        savedUserItems,
        setSavedUserItems,
        toggleItemIsSaved,
        getItemIsSaved,
      }}
    >
      {children}
    </SavedUserItemsContext.Provider>
  );
}
