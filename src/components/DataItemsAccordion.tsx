"use client";

import { useEffect, useState, useContext, useCallback } from "react";
// import LoginSignupDialog from "components/LoginSignupDialog";

import { sanitize } from "isomorphic-dompurify";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import DataItemDialog from "./DataItemDialog";
import { useSession } from "next-auth/react";
import { DataItemsAccordionItem, SessionWithUserId } from "@/lib/types";
import { SaveIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TemporaryUserContext } from "@/context/temporaryUserProvider";

interface DataItemsAccordionProps {
  // dataItems: Readonly<SelectedPick<ResourceItemRecord, ["*"]>> & Saved[];
  dataItems: DataItemsAccordionItem[];
  openAll?: boolean | "indeterminate";
  postSaveOrDeleteResourceItemAction?: () => void;
}

const DataItemsAccordion = ({
  dataItems,
  openAll,
  postSaveOrDeleteResourceItemAction,
}: DataItemsAccordionProps) => {
  const { data: session, status } = useSession();
  const [value, setValue] = useState<string[]>([]);
  const [savedItemIds, setSavedItemIds] = useState<string[]>([]);
  // const [savedItems, setSavedItems] = useState<Readonly<SelectedPick<ResourceItemRecord, ["*"]>>[]>([]);
  const temporaryUser = useContext(TemporaryUserContext);

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
      if (userDataJson) {
        const map = userDataJson.map((item: any) => item.resource.id);
        setSavedItemIds(map);
      }
    };

    getUserData().catch((e) => {
      // console.log(e);
    });
    return;
  }, [setSavedItemIds, status, session, temporaryUser, getUserId]);

  useEffect(() => {
    if (openAll) {
      setValue(dataItems.map((item) => item.id));
    } else {
      setValue([]);
    }
  }, [dataItems, openAll]);

  // const hasSeenMakeAccountSuggestionDialog = useSelector(
  //   selectHasSeenMakeAccountSuggestionDialog
  // );

  const onClickSave = async (e: React.MouseEvent<SVGElement>, id: string) => {
    e.preventDefault();

    const userId = getUserId();

    if (!userId) {
      return;
    }

    const itemIsSaved = isSaved(id, savedItemIds);

    // preemtively set the state
    if (itemIsSaved) {
      setSavedItemIds(savedItemIds.filter((savedId) => savedId !== id));
    } else {
      setSavedItemIds([...savedItemIds, id]);
    }

    if (itemIsSaved) {
      // delete remote
      const deleteUserDataItem = async () => {
        const deleted = await fetch(`/api/user-resource`, {
          method: "DELETE",
          body: JSON.stringify({
            userId,
            resourceId: id,
            tempUser: status === "unauthenticated",
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }).catch((e) => {
          // console.log(e);
        });

        if (!deleted) {
          // failed remotely, undo preemtive state change
          setSavedItemIds([...savedItemIds, id]);
        }
      };

      await deleteUserDataItem().catch((e) => {
        // console.log(e);
      });
      postSaveOrDeleteResourceItemAction?.();
    } else {
      const saveUserDataItem = async () => {
        const userDataItem = await fetch(`/api/user-resource`, {
          method: "POST",
          body: JSON.stringify({
            userId,
            resourceId: id,
            tempUser: status === "unauthenticated",
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }).catch((e) => {
          // console.log(e);
        });
        const userDataItemJson = await userDataItem?.json();

        if (!userDataItemJson) {
          // failed remotely, undo preemtive state change
          setSavedItemIds(savedItemIds.filter((savedId) => savedId !== id));
        }
      };
      await saveUserDataItem().catch((e) => {
        // console.log(e);
      });
      postSaveOrDeleteResourceItemAction?.();
    }
  };

  const isSaved = (id: string, savedItemIds: string[]) => {
    return savedItemIds && savedItemIds.includes(id);
  };

  const SaveIconComponent = ({ resourceId }: { resourceId: string }) => (
    <SaveIcon
      size={16}
      data-item-id={resourceId}
      className={cn(
        isSaved(resourceId, savedItemIds) ? "text-emerald-700" : "text-gray-300"
      )}
      onClick={(e) => {
        onClickSave(e, resourceId);
      }}
    />
  );

  return (
    <>
      {/* <LoginSignupDialog
        parentOpen={dialogOpen}
        parentSetOpen={setDialogOpen}
        onSuccess={() => setDialogOpen(false)}
        showNoThanksButton={true}
      /> */}
      <Accordion type="multiple" value={value} onValueChange={setValue}>
        {dataItems?.length &&
          dataItems.map((dataItem, index) => (
            <AccordionItem key={index} value={dataItem.id}>
              <AccordionTrigger className="text-sm text-left py-2 [&>svg]:ml-6">
                <SaveIconComponent resourceId={dataItem.id} />
                <div className="flex-1 pl-4">{dataItem.title}</div>
              </AccordionTrigger>

              <AccordionContent className="text-xs [&*>]:m-0 mb-2.5 mb-6 pl-14 pr-6">
                {dataItem.description ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: sanitize(dataItem.description),
                    }}
                  ></div>
                ) : (
                  <div>No description available</div>
                )}

                <DataItemDialog key={index} resourceId={dataItem?.id} />
              </AccordionContent>
            </AccordionItem>
          ))}
      </Accordion>
    </>
  );
};

export default DataItemsAccordion;
