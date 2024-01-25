"use client";

import { DeleteTemporaryUserBodySchema, SessionWithUserId } from "@/lib/types";
import { doUserAuthTempUserCleanup } from "@/lib/utils/user-data";
import { TemporaryUsersRecord } from "@/xata";
import { JSONData } from "@xata.io/client";
import { useSession } from "next-auth/react";
import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useLocalStorage } from "usehooks-ts";
import { z } from "zod";

export const TemporaryUserContext = createContext<{
  temporaryUser: JSONData<TemporaryUsersRecord> | undefined;
  tempUserAuthed: boolean;
}>({ temporaryUser: undefined, tempUserAuthed: false });

type TemporaryUserIdProviderProps = {
  children: ReactNode;
};

export default function TemporaryUserIdProvider({
  children,
}: TemporaryUserIdProviderProps) {
  const [temporaryUser, setTemporaryUser] = useLocalStorage<
    JSONData<TemporaryUsersRecord> | undefined
  >("temporaryUser", undefined);
  const [tempUserAuthed, setTempUserAuthed] = useState(false);
  const { data: session, status } = useSession();

  /**
   * create a temporary user and set it in localstorage
   */
  const createAndSetTempUserId = useCallback(async () => {
    const tempUser = await fetch("/api/temporary-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }).catch((e) => e);

    const tempUserJson = await tempUser?.json();

    if (tempUserJson) {
      setTemporaryUser(tempUserJson);
    }
    window.localStorage.removeItem("gettingTemporaryUser");
  }, [setTemporaryUser]);

  /**
   * delete a temporary user
   * @param id delete a temporary user
   */
  const deleteTemporaryUser = useCallback(
    async (id: z.infer<typeof DeleteTemporaryUserBodySchema>) => {
      const deleted = await fetch(`/api/temporary-user`, {
        method: "DELETE",
        body: JSON.stringify(id),
        headers: {
          "Content-Type": "application/json",
        },
      }).catch((e) => e);

      let json = await deleted?.json();
      return json;
    },
    []
  );

  /**
   * status changing to authenticated
   */
  useEffect(() => {
    const LSKEY = "tempUserCleanupInProgress";
    const inProgress = window.localStorage.getItem(LSKEY);

    if (inProgress || status === "unauthenticated" || status === "loading") {
      return;
    }

    // we've already done the update to the authed user
    if (!temporaryUser) {
      return;
    }

    const sessionUserId = (session as SessionWithUserId)?.user?.id;

    if (!sessionUserId) {
      return;
    }

    (async () => {
      window.localStorage.setItem(LSKEY, "true");

      await doUserAuthTempUserCleanup(sessionUserId, temporaryUser.id).catch(
        (e) => e
      );
      setTemporaryUser(undefined);
      deleteTemporaryUser(temporaryUser.id);
      setTempUserAuthed(true); // listened for in the savedUserItemsProvider
      window.localStorage.removeItem(LSKEY);
    })();
  }, [
    status,
    session,
    temporaryUser,
    setTemporaryUser,
    setTempUserAuthed,
    deleteTemporaryUser,
  ]);

  /**
   * setting of an initial temporary user if needed
   */
  useEffect(() => {
    const inProgress = window.localStorage.getItem("gettingTemporaryUser");

    if (
      temporaryUser ||
      inProgress ||
      status === "authenticated" ||
      status === "loading"
    ) {
      return;
    }

    window.localStorage.setItem("gettingTemporaryUser", "true");

    createAndSetTempUserId().catch((e) => e);
  }, [temporaryUser, setTemporaryUser, status, createAndSetTempUserId]);

  return (
    <TemporaryUserContext.Provider value={{ temporaryUser, tempUserAuthed }}>
      {children}
    </TemporaryUserContext.Provider>
  );
}
