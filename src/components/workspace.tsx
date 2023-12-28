"use client";

import { ResourceItemRecord } from "@/xata";
import { SelectedPick } from "@xata.io/client";
import DataItemsAccordion from "./DataItemsAccordion";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { DataItemsAccordionItem } from "@/lib/types";

export type WorkspaceProps = {
  dataItems?: Readonly<SelectedPick<ResourceItemRecord, ["*"]>>[];
};

const Workspace = ({ dataItems }: WorkspaceProps) => {
  const { data: session, status } = useSession();
  const [temporaryUserId, setTemporaryUserId] = useLocalStorage(
    "temporaryUserId",
    ""
  );

  const [finalDataItems, setFinalDataItems] = useState<
    DataItemsAccordionItem[]
  >([]);

  useEffect(() => {
    // if authenticated data comes down with the page
    if (status === "authenticated") {
      if (dataItems?.length) {
        setFinalDataItems(dataItems);
      }
      return;
    }

    if (!temporaryUserId) {
      let uuid = self.crypto.randomUUID();
      setTemporaryUserId(uuid);
      return;
    }

    const getTempUserData = async () => {
      const tempUserData = await fetch(
        `/api/get-resources-for-user?userId=${temporaryUserId}&temporary=true`
      ).catch((e) => {
        // console.log(e);
      });
      const tempUserDataJson = await tempUserData?.json();
      if (tempUserDataJson) {
        setFinalDataItems(tempUserDataJson);
      }
    };

    getTempUserData().catch((e) => {
      // console.log(e);
    });
  }, []);

  return (
    <div>
      <h1>Workspace</h1>
      <div>
        {finalDataItems.length && (
          <DataItemsAccordion dataItems={finalDataItems} />
        )}
      </div>
    </div>
  );
};

export default Workspace;
