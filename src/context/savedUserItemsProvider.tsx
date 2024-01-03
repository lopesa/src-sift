"use client";

import { SessionWithUserId } from "@/lib/types";
import { TemporaryUsersRecord, UserResourcesRecord } from "@/xata";
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
};

type SavedUserItemsContextT = {
  savedUserItems: SavedUserItems;
  setSavedUserItems?: Dispatch<SetStateAction<SavedUserItems>>;
};

export const SavedUserItemsContext = createContext<SavedUserItemsContextT>({
  savedUserItems: { resourceItemIds: [] },
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
    { resourceItemIds: [] }
  );

  const getUserId = useCallback(() => {
    if (status === "authenticated") {
      return (session as SessionWithUserId)?.user?.id;
    }
    return temporaryUser?.id;
  }, [session, status, temporaryUser]);

  useEffect(() => {
    const userId = getUserId();

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
        userDataJson.forEach((item: UserResourcesRecord) => {
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
      value={{ savedUserItems, setSavedUserItems }}
    >
      {children}
    </SavedUserItemsContext.Provider>
  );
}
