"use client";

import { UserResourceRecord } from "@/xata";
import { useSession } from "next-auth/react";
import { useCallback, useContext, useEffect, useState } from "react";
import { DataItemsAccordionItem, SessionWithUserId } from "@/lib/types";
import { TemporaryUserContext } from "@/context/temporaryUserProvider";
import IndexDataList from "./IndexDataList";
import { SavedUserItemsContext } from "@/context/savedUserItemsProvider";
import DistributionItemsAccordion from "./DistributionItemsAccordion";

const Workspace = () => {
  const { data: session, status } = useSession();
  const temporaryUser = useContext(TemporaryUserContext);

  const { savedUserItems, getUserData } = useContext(SavedUserItemsContext);

  const [finalResourceDataItems, setFinalResourceDataItems] = useState<
    DataItemsAccordionItem[]
  >([]);

  const [finalDistributionDataItems, setFinalDistributionDataItems] = useState<
    UserResourceRecord[]
  >([]);

  const getAndSetUserData = useCallback(async () => {
    const userDataJson = await getUserData();

    if (!userDataJson?.length) {
      return;
    }

    let resourceData = userDataJson
      .filter((item) => !!item.resource && !item.distribution_item)
      .map((item) => item.resource as DataItemsAccordionItem);

    let distributionData = userDataJson.filter(
      (item) => !!item.distribution_item
    );
    setFinalResourceDataItems(resourceData);
    setFinalDistributionDataItems(distributionData);
  }, [session, status, temporaryUser]);

  useEffect(() => {
    if (
      status === "loading" ||
      (!(session as SessionWithUserId)?.user?.id && !temporaryUser?.id)
    ) {
      return;
    }
    getAndSetUserData().catch((e) => e);
  }, [getAndSetUserData, temporaryUser, session]);

  return (
    <div>
      <h1>Workspace</h1>
      <div className="mx-auto my-0 max-w-[95vw] w-[760px]">
        {savedUserItems?.initComplete && finalResourceDataItems.length && (
          <IndexDataList
            data={finalResourceDataItems}
            postUpdateResourceItemAction={getAndSetUserData}
          />
        )}
      </div>
      {savedUserItems?.initComplete && finalDistributionDataItems.length && (
        <DistributionItemsAccordion
          dataItems={finalDistributionDataItems}
          openAll={true}
          postUpdateResourceItemAction={getAndSetUserData}
        />
      )}
    </div>
  );
};

export default Workspace;
