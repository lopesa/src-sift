"use client";

import { ResourceItemRecord, UserResourceRecord } from "@/xata";
import { SelectedPick } from "@xata.io/client";
import { useSession } from "next-auth/react";
import { useCallback, useContext, useEffect, useState } from "react";
import { DataItemsAccordionItem, SessionWithUserId } from "@/lib/types";
import { TemporaryUserContext } from "@/context/temporaryUserProvider";
import IndexDataList from "./IndexDataList";
import { SavedUserItemsContext } from "@/context/savedUserItemsProvider";

export type WorkspaceProps = {
  dataItems?: Readonly<SelectedPick<ResourceItemRecord, ["*"]>>[];
};

const Workspace = ({ dataItems }: WorkspaceProps) => {
  const { data: session, status } = useSession();
  const temporaryUser = useContext(TemporaryUserContext);

  const { toggleItemIsSaved, getItemIsSavedForUser, savedUserItems } =
    useContext(SavedUserItemsContext);

  const [finalDataItems, setFinalDataItems] = useState<
    DataItemsAccordionItem[]
  >([]);

  const getUserData = useCallback(async () => {
    const varUrl =
      status === "authenticated" && (session as SessionWithUserId)?.user?.id
        ? `userId=${(session as SessionWithUserId)?.user?.id}`
        : `userId=${temporaryUser?.id}&tempUser=true`;

    const url = `/api/user-resource?${varUrl}&getFullResourceItem=true`;

    const userData = await fetch(url).catch((e) => {
      // console.log(e);
    });
    const userDataJson: SelectedPick<
      UserResourceRecord,
      ("*" | "resource.*")[]
    >[] = await userData?.json();

    let data = userDataJson
      .filter((item) => !!item.resource)
      .map((item) => item.resource as DataItemsAccordionItem);

    setFinalDataItems(data);
  }, [session, status, temporaryUser]);

  useEffect(() => {
    if (
      status === "loading" ||
      (!(session as SessionWithUserId)?.user?.id && !temporaryUser?.id)
    ) {
      return;
    }
    // if the temp user's items have already been fetched, don't fetch again
    // if (dataItems?.length) {
    //   return;
    // }

    getUserData().catch((e) => e);
  }, [getUserData, temporaryUser, session]);

  return (
    <div>
      <h1>Workspace</h1>
      <div className="mx-auto my-0 max-w-[95vw] w-[760px]">
        {savedUserItems?.initComplete && (
          <IndexDataList
            data={finalDataItems}
            postUpdateResourceItemAction={getUserData}
          />
        )}
      </div>
    </div>
  );
};

export default Workspace;
