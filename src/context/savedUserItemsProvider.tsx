"use client";

import { SessionWithUserId } from "@/lib/types";
import { TemporaryUsersRecord, UserResourceRecord } from "@/xata";
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
  addLocalStorageDistributionItem: (id: string) => void;
  removeLocalStorageDistributionItem: (id: string) => void;
  addLocalStorageResourceItem: (id: string) => void;
  removeLocalStorageResourceItem: (id: string) => void;
};

export const SavedUserItemsContext = createContext<SavedUserItemsContextT>({
  savedUserItems: { resourceItemIds: [], distributionItemIds: [] },
  addLocalStorageDistributionItem: () => {},
  removeLocalStorageDistributionItem: () => {},
  addLocalStorageResourceItem: () => {},
  removeLocalStorageResourceItem: () => {},
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

  const addLocalStorageDistributionItem = (id: string) => {
    setSavedUserItems({
      resourceItemIds: [...savedUserItems.resourceItemIds],
      distributionItemIds: [...savedUserItems.distributionItemIds, id],
    });
  };
  const removeLocalStorageDistributionItem = (id: string) => {
    setSavedUserItems({
      resourceItemIds: [...savedUserItems.resourceItemIds],
      distributionItemIds: savedUserItems.distributionItemIds.filter(
        (savedId) => savedId !== id
      ),
    });
  };
  const addLocalStorageResourceItem = (id: string) => {
    setSavedUserItems({
      resourceItemIds: [...savedUserItems.resourceItemIds, id],
      distributionItemIds: [...savedUserItems.distributionItemIds],
    });
  };
  const removeLocalStorageResourceItem = (id: string) => {
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

  useEffect(() => {
    const getUserData = async () => {
      const userData = await fetch(
        `/api/user-resource?userId=${getUserId()}&temporary=${
          status !== "authenticated"
        }`
      ).catch((e) => {
        // console.log(e);
      });
      const userDataJson = await userData?.json();

      let newSavedUserItems = savedUserItems;

      if (userDataJson?.savedUserItems) {
        userDataJson.forEach((item: UserResourceRecord) => {
          if (item.resource) {
            newSavedUserItems.resourceItemIds.push(item.resource.id);
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
        addLocalStorageDistributionItem,
        removeLocalStorageDistributionItem,
        addLocalStorageResourceItem,
        removeLocalStorageResourceItem,
      }}
    >
      {children}
    </SavedUserItemsContext.Provider>
  );
}
