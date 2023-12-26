"use client";

import { useEffect, useState } from "react";
// import LoginSignupDialog from "components/LoginSignupDialog";

import DOMPurify from "dompurify";
import { SelectedPick } from "@xata.io/client";
import { ResourceItemRecord } from "@/xata";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import DataItemDialog from "./DataItemDialog";

interface DataItemsAccordionProps {
  dataItems: Readonly<SelectedPick<ResourceItemRecord, ["*"]>>[];
  openAll?: boolean | "indeterminate";
}

const DataItemsAccordion = ({
  dataItems,
  openAll,
}: DataItemsAccordionProps) => {
  // const localBookmarks = useAppSelector(selectBookmarks);
  // const activeDataset = useSelector(selectDatasetSelected);
  // const [getRemoteBookmarks, { data: remoteBookmarks, isLoading, error }] =
  //   useLazyGetBookmarksQuery();
  const [value, setValue] = useState<string[]>([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
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

  // useEffect(() => {
  //   if (token) {
  //     getRemoteBookmarks();
  //   }
  // }, [token, getRemoteBookmarks]);

  useEffect(() => {
    if (openAll) {
      setValue(dataItems.map((item) => item.id));
    } else {
      setValue([]);
    }
  }, [dataItems, openAll]);

  // const isBookmarked = (id: string) => {
  //   return (
  //     bookmarks &&
  //     bookmarks.find((bookmark) =>
  //       token
  //         ? (bookmark as InitialBookmarkIndexDataItem).originalId === id
  //         : bookmark.id === id
  //     )
  //   );
  // };

  // const onClickBookmark = async (e: React.MouseEvent<SVGElement>) => {
  //   e.preventDefault();
  //   if (!token && !hasSeenMakeAccountSuggestionDialog) {
  //     setDialogOpen(true);
  //     dispatch(setHasSeenMakeAccountSuggestionDialog(true));
  //   }

  //   const id = e.currentTarget.dataset.itemId;
  //   if (!id) {
  //     return;
  //   }

  //   const fullDataItemFromId = dataItems.find((item) =>
  //     isInitialBookmarkIndexDataItem(item) ? item.originalId : item.id === id
  //   );

  //   if (!fullDataItemFromId) {
  //     return;
  //   }

  //   if (token) {
  //     if (!isBookmarked(id)) {
  //       const bookmarks = [
  //         { dataItemUuid: id, datasetId: fullDataItemFromId.datasetId },
  //       ];
  //       const result = await addBookmarks(bookmarks)
  //         .unwrap()
  //         .catch((error) => {
  //           // debugger;
  //           // setServerError(true);
  //           // @TODO: setServerErrors, after getting a better response back from the server
  //           // actually, keeping this simple for now, just showing a generic error message
  //         });
  //     } else {
  //       // debugger;
  //       const result = await removeBookmark(id)
  //         .unwrap()
  //         .catch((error) => {
  //           // debugger;
  //           // setServerError(true);
  //         });
  //     }
  //     getRemoteBookmarks();
  //   } else {
  //     isBookmarked(id)
  //       ? dispatch(removeBookmarkLocal(fullDataItemFromId))
  //       : dispatch(addBookmark(fullDataItemFromId));
  //   }
  // };

  // const isInitialBookmarkIndexDataItem = (
  //   indexItem: InitialBookmarkIndexDataItem | InitialIndexDataItem
  // ): indexItem is InitialBookmarkIndexDataItem => {
  //   return (indexItem as InitialBookmarkIndexDataItem).originalId !== undefined;
  // };

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
                {dataItem.title}

                {/* <div className={styles.BookmarkContainer}>
                  {isBookmarked(
                    isInitialBookmarkIndexDataItem(dataItem)
                      ? dataItem.originalId
                      : dataItem.id
                  ) ? (
                    <BookmarkFilledIcon
                      data-item-id={
                        isInitialBookmarkIndexDataItem(dataItem)
                          ? dataItem.originalId
                          : dataItem.id
                      }
                      onClick={onClickBookmark}
                    />
                  ) : (
                    <BookmarkIcon
                      data-item-id={dataItem.id}
                      onClick={onClickBookmark}
                    />
                  )}
                </div> */}
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
