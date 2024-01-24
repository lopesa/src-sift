"use client";

import { UserResourceRecord } from "@/xata";
import { useSession } from "next-auth/react";
import { useCallback, useContext, useEffect, useState } from "react";
import { DataItemsAccordionItem, SessionWithUserId } from "@/lib/types";
import { TemporaryUserContext } from "@/context/temporaryUserProvider";
import IndexDataList from "./IndexDataList";
import { SavedUserItemsContext } from "@/context/savedUserItemsProvider";
import DistributionItemsAccordion from "./DistributionItemsAccordion";
import { getUserDataItem } from "@/lib/utils/user-data";
import { Button } from "./ui/button";
import Link from "next/link";

const Workspace = () => {
  const { data: session, status } = useSession();
  const { temporaryUser } = useContext(TemporaryUserContext);

  const { savedUserItems, getUserId } = useContext(SavedUserItemsContext);

  const [userResourceRecordIds, setUserResourceRecordIds] = useState<string[]>(
    []
  );

  const [finalResourceDataItems, setFinalResourceDataItems] = useState<
    DataItemsAccordionItem[]
  >([]);

  const [finalDistributionDataItems, setFinalDistributionDataItems] = useState<
    UserResourceRecord[]
  >([]);

  const hasData = () => {
    return (
      !!finalResourceDataItems.length || !!finalDistributionDataItems.length
    );
  };

  const getAndSetUserData = useCallback(async () => {
    const userId = getUserId();
    if (!userId) {
      return;
    }
    const userDataJson = await getUserDataItem({
      userId,
      tempUser: status === "unauthenticated",
      getFullResourceItem: true,
    });

    // if (!userDataJson?.length) {
    //   return;
    // }

    let resourceData = userDataJson
      .filter((item) => !!item.resource && !item.distribution_item)
      .map((item) => item.resource as DataItemsAccordionItem);

    let distributionData = userDataJson.filter(
      (item) => !!item.distribution_item
    );
    // should move this up into the provider
    setUserResourceRecordIds(userDataJson.map((item) => item.id));
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

  useEffect(() => {
    if (!savedUserItems?.initComplete) {
      return;
    }
    getAndSetUserData().catch((e) => e);
  }, [savedUserItems]);

  return (
    <div>
      {hasData() && (status === "unauthenticated" || !session) && (
        <div className="mt-12 px-12 py-6 bg-red-300 flex items-center justify-center">
          <Button asChild variant="link" className="px-1">
            <Link href="/api/auth/signin">
              Sign in or create a free account
            </Link>
          </Button>
          <div className="text-sm">to keep your saved items</div>
        </div>
      )}
      <h1 className="text-2xl mb-1 mt-10 text-center">Saved Items</h1>
      <div className="mx-auto my-0 max-w-[95vw] w-[760px]">
        {savedUserItems?.initComplete && !!finalResourceDataItems.length && (
          <IndexDataList data={finalResourceDataItems} />
        )}
      </div>
      {savedUserItems?.initComplete && !!finalDistributionDataItems.length && (
        <DistributionItemsAccordion
          dataItems={finalDistributionDataItems}
          openAll={true}
        />
      )}
      {!hasData() && (
        <div className="mt-12 px-12 py-6 bg-gray-300 flex items-center justify-center">
          <div className="text-sm">No saved items</div>
        </div>
      )}
      {/* {!!userResourceRecordIds.length && <AiChat />} */}
    </div>
  );
};

export default Workspace;
