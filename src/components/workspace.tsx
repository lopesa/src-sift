"use client";

import { ResourceItemRecord, UserResourcesRecord } from "@/xata";
import { SelectedPick } from "@xata.io/client";
import DataItemsAccordion from "./DataItemsAccordion";
import { useSession } from "next-auth/react";
import { useContext, useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { DataItemsAccordionItem } from "@/lib/types";
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

  useEffect(() => {
    // if user is authenticated data comes down with the page
    if (status === "authenticated") {
      if (dataItems?.length) {
        setFinalDataItems(dataItems);
      }
      return;
    }

    const getTempUserData = async () => {
      const tempUserData = await fetch(
        `/api/user-resource?userId=${temporaryUser?.id}&temporary=true&getFullResourceItem=true`
      ).catch((e) => {
        // console.log(e);
      });
      const tempUserDataJson: SelectedPick<
        UserResourcesRecord,
        ("*" | "resource.*")[]
      >[] = await tempUserData?.json();

      let data = tempUserDataJson.map(
        (item) => item.resource as DataItemsAccordionItem
      );

      setFinalDataItems(data);
    };

    temporaryUser?.id &&
      getTempUserData().catch((e) => {
        // console.log(e);
      });
  }, []);

  return (
    <div>
      <h1>Workspace</h1>
      <div className="mx-auto my-0 max-w-[95vw] w-[760px]">
        {!!finalDataItems.length && (
          <IndexDataList data={finalDataItems} />
          // <DataItemsAccordion dataItems={finalDataItems} />
        )}
      </div>
    </div>
  );
};

export default Workspace;
