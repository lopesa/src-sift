"use client";

import { ResourceItemRecord, UserResourcesRecord } from "@/xata";
import { SelectedPick } from "@xata.io/client";
import { useSession } from "next-auth/react";
import { useCallback, useContext, useEffect, useState } from "react";
import { DataItemsAccordionItem, SessionWithUserId } from "@/lib/types";
import { TemporaryUserContext } from "@/context/temporaryUserProvider";
import IndexDataList from "./IndexDataList";

export type WorkspaceProps = {
  dataItems?: Readonly<SelectedPick<ResourceItemRecord, ["*"]>>[];
};

const Workspace = ({ dataItems }: WorkspaceProps) => {
  const { data: session, status } = useSession();
  const temporaryUser = useContext(TemporaryUserContext);

  const [finalDataItems, setFinalDataItems] = useState<
    DataItemsAccordionItem[]
  >([]);

  const getUserData = useCallback(async () => {
    const varUrl =
      status === "authenticated" && (session as SessionWithUserId)?.user?.id
        ? `userId=${(session as SessionWithUserId)?.user?.id}`
        : `userId=${temporaryUser?.id}&temporary=true`;

    const url = `/api/user-resource?${varUrl}&getFullResourceItem=true`;

    const userData = await fetch(url).catch((e) => {
      // console.log(e);
    });
    const userDataJson: SelectedPick<
      UserResourcesRecord,
      ("*" | "resource.*")[]
    >[] = await userData?.json();

    let data = userDataJson.map(
      (item) => item.resource as DataItemsAccordionItem
    );

    setFinalDataItems(data);
  }, [session, status, temporaryUser]);

  useEffect(() => {
    if (!(session as SessionWithUserId)?.user?.id && !temporaryUser?.id) {
      return;
    }
    // if the temp user's items have already been fetched, don't fetch again
    if (dataItems?.length) {
      return;
    }

    getUserData().catch((e) => {
      // console.log(e);
    });
  }, [getUserData, status, temporaryUser, dataItems, setFinalDataItems]);

  return (
    <div>
      <h1>Workspace</h1>
      <div className="mx-auto my-0 max-w-[95vw] w-[760px]">
        {!!finalDataItems.length && (
          <IndexDataList
            data={finalDataItems}
            postSaveOrDeleteResourceItemAction={getUserData}
          />
        )}
      </div>
    </div>
  );
};

export default Workspace;
