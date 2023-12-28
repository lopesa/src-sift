"use client";

import { TemporaryUsersRecord } from "@/xata";
import { JSONData } from "@xata.io/client";
import { ReactNode, createContext, useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";

export const TemporaryUserContext = createContext<
  JSONData<TemporaryUsersRecord> | undefined
>(undefined);

type TemporaryUserIdProviderProps = {
  children: ReactNode;
};

export default function TemporaryUserIdProvider({
  children,
}: TemporaryUserIdProviderProps) {
  const [temporaryUser, setTemporaryUser] = useLocalStorage<
    JSONData<TemporaryUsersRecord> | undefined
  >("temporaryUser", undefined);

  // this doesn't work because it is reflected in React cycles
  // changing it to directly use the localstorage api keeps it synchronous
  // const [gettingTemporaryUser, setGettingTemporaryUser] = useLocalStorage(
  //   "gettingTemporaryUser",
  //   false
  // );

  useEffect(() => {
    const inProgress = window.localStorage.getItem("gettingTemporaryUser");

    if (temporaryUser || inProgress) {
      return;
    }

    window.localStorage.setItem("gettingTemporaryUser", "true");

    const creatAndSetTempUserId = async () => {
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

        // window.onbeforeunload = () => {
        //   debugger;
        //   fetch("/api/temporary-user", {
        //     method: "DELETE",
        //     headers: {
        //       "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({
        //       temporaryUserId: tempUserJson.id,
        //     }),
        //   });
        // };
      }
      window.localStorage.setItem("gettingTemporaryUser", "false");
    };

    creatAndSetTempUserId().catch((e) => {
      // console.log(e);
    });
  }, [temporaryUser, setTemporaryUser]);

  return (
    <TemporaryUserContext.Provider value={temporaryUser}>
      {children}
    </TemporaryUserContext.Provider>
  );
}
