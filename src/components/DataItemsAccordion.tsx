"use client";

import { useEffect, useState, useContext } from "react";
// import LoginSignupDialog from "components/LoginSignupDialog";

import DOMPurify from "dompurify";
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
}

const DataItemsAccordion = ({
  dataItems,
  openAll,
}: DataItemsAccordionProps) => {
  const { data: session, status } = useSession();
  const [value, setValue] = useState<string[]>([]);
  const [savedItemIds, setSavedItemIds] = useState<string[]>([]);
  const temporaryUser = useContext(TemporaryUserContext);

  // useEffect(() => {
  //   // if authenticated data comes down with the page
  //   if (status === "authenticated") {
  //     const getUserData = async () => {
  //       const userData = await fetch(
  //         `/api/get-resources-for-user?userId=${
  //           (session as SessionWithUserId)?.user?.id
  //         }`
  //       ).catch((e) => {
  //         // console.log(e);
  //       });
  //       const userDataJson = await userData?.json();
  //       if (userDataJson) {
  //         setSavedItemIds(userDataJson.map((item: any) => item.id));
  //       }
  //     };
  //     getUserData().catch((e) => {
  //       // console.log(e);
  //     });
  //     return;
  //   }

  //   const getTempUserData = async () => {
  //     const tempUserData = await fetch(
  //       `/api/get-resources-for-user?userId=${temporaryUserId}&temporary=true`
  //     ).catch((e) => {
  //       // console.log(e);
  //     });
  //     const tempUserDataJson = await tempUserData?.json();
  //     if (tempUserDataJson) {
  //       setSavedItemIds(tempUserDataJson.map((item: any) => item.id));
  //     }
  //   };

  //   getTempUserData().catch((e) => {
  //     // console.log(e);
  //   });
  // }, [setSavedItemIds, status]);

  // useEffect(() => {}, [savedItemIds]);

  // const [savedItems, setSavedItems] = useState<Readonly<SelectedPick<ResourceItemRecord, ["*"]>>[]>([]);
  // let bookmarks = token ? remoteBookmarks : localBookmarks;
  // const dispatch = useAppDispatch();

  // const hasSeenMakeAccountSuggestionDialog = useSelector(
  //   selectHasSeenMakeAccountSuggestionDialog
  // );
  // const navigate = useNavigate();

  // const [
  //   addBookmarks,
  //   { isLoading: addBookmarksIsLoading, error: addBookmarksError },
  // ] = useAddBookmarksMutation();

  // const [
  //   removeBookmark,
  //   { isLoading: removeBookmarkIsLoading, error: removeBookmarkError },
  // ] = useRemoveBookmarkMutation();

  useEffect(() => {
    if (openAll) {
      setValue(dataItems.map((item) => item.id));
    } else {
      setValue([]);
    }
  }, [dataItems, openAll]);

  const onClickSave = async (e: React.MouseEvent<SVGElement>, id: string) => {
    e.preventDefault();

    const userId =
      status === "authenticated"
        ? (session as SessionWithUserId)?.user?.id
        : temporaryUser?.id;

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

      deleteUserDataItem().catch((e) => {
        // console.log(e);
      });
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
      saveUserDataItem().catch((e) => {
        // console.log(e);
      });
    }
  };

  const isSaved = (id: string, savedItemIds: string[]) => {
    return savedItemIds && savedItemIds.includes(id);
  };

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
                <SaveIcon
                  size={16}
                  data-item-id={dataItem.id}
                  className={cn(
                    isSaved(dataItem.id, savedItemIds)
                      ? "text-emerald-600"
                      : "text-gray-400"
                  )}
                  onClick={(e) => {
                    onClickSave(e, dataItem.id);
                  }}
                />
                <div className="flex-1 pl-4">{dataItem.title}</div>
              </AccordionTrigger>

              <AccordionContent className="text-xs [&*]:m-0 [&p]:mb-2.5 mb-6 pl-8">
                {dataItem.description ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(dataItem.description),
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
