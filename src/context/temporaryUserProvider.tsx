"use client";

import { SessionWithUserId } from "@/lib/types";
import { doUserAuthTempUserCleanup } from "@/lib/utils/user-data";
import { TemporaryUsersRecord } from "@/xata";
import { JSONData } from "@xata.io/client";
import { useSession } from "next-auth/react";
import { ReactNode, createContext, useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

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

  // status changing to authenticated
  useEffect(() => {
    // debugger;

    const lsKey = "tempUserCleanupInProgress";
    const inProgress = window.localStorage.getItem(lsKey);
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
      // debugger;
      window.localStorage.setItem(lsKey, "true");

      await doUserAuthTempUserCleanup(sessionUserId, temporaryUser.id).catch(
        (e) => e
      );
      // debugger;
      setTemporaryUser(undefined);
      setTempUserAuthed(true);
      window.localStorage.removeItem(lsKey);
    })();
  }, [status, session]);

  // the following doesn't work because it is executed in React cycles
  // changing it to directly use the localstorage api keeps it synchronous
  // const [gettingTemporaryUser, setGettingTemporaryUser] = useLocalStorage(
  //   "gettingTemporaryUser",
  //   false
  // );

  useEffect(() => {
    // debugger;
    const inProgress = window.localStorage.getItem("gettingTemporaryUser");

    if (
      temporaryUser ||
      inProgress ||
      status === "authenticated" ||
      status === "loading"
    ) {
      return;
    }

    // debugger;

    window.localStorage.setItem("gettingTemporaryUser", "true");

    const createAndSetTempUserId = async () => {
      const tempUser = await fetch("/api/temporary-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }).catch((e) => {
        // console.log(e);
      });

      const tempUserJson = await tempUser?.json();

      if (tempUserJson) {
        setTemporaryUser(tempUserJson);
      }
      window.localStorage.removeItem("gettingTemporaryUser");
    };

    createAndSetTempUserId().catch((e) => {
      // console.log(e);
    });
  }, [temporaryUser, setTemporaryUser, status]);

  return (
    <TemporaryUserContext.Provider value={{ temporaryUser, tempUserAuthed }}>
      {children}
    </TemporaryUserContext.Provider>
  );
}
