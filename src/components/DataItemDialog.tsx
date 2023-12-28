"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

import { ResourceItemRecord, ResourceSource, getXataClient } from "@/xata";

import { Cross2Icon } from "@radix-ui/react-icons";
import { JSONData } from "@xata.io/client";
import { Button } from "@/components/ui/button";
import DOMPurify from "dompurify";
import { useState } from "react";
import { DistributionItem } from "@/lib/types";
import { Separator } from "./ui/separator";

interface DataItemDialogProps {
  resourceId: string;
}

const onClickDownloadXls = (e: React.MouseEvent<HTMLButtonElement>) => {
  console.log(e.currentTarget.value);
  debugger;
};

const DataItemDialog = ({ resourceId }: DataItemDialogProps) => {
  const [resourceData, setResourceData] =
    useState<JSONData<ResourceItemRecord> | null>();

  const onOpenChange = async (open: boolean) => {
    if (!open || !!resourceData) {
      return;
    }

    if (!resourceId) {
      // throw new Error("Problem getting resource id");
    }

    const response = await fetch(`/api/resource-item?id=${resourceId}`).catch(
      (error) => {
        return error;
        // debugger;
        // throw new Error(error);
      }
    );

    const serializedData = await response.json();
    setResourceData(serializedData.data);
  };

  // const getPreviewDataLink = (distributionItem: DistributionItems) => {
  //   const url = distributionItem?.downloadURL || distributionItem?.accessURL;
  //   if (!url) {
  //     return;
  //   }
  //   const extension = getFileExtension(url);
  //   const shouldOfferPreviewData =
  //     typeof extension === "string" &&
  //     (extension.includes("csv") || extension.includes("xls"));

  //   // return shouldOfferPreviewData && <ChartDialog chartItemUrl={url} />;
  //   // return shouldOfferPreviewData && <PreviewData url={url} />;
  //   return (
  //     shouldOfferPreviewData && (
  //       <div className={styles.PreviewDataContainer}>
  //         <PreviewData url={url} />
  //       </div>
  //     )
  //   );

  //   // {distribution.downloadURL &&
  //   //   getFileExtension(distribution.downloadURL) === "xls" && (
  //   //     <div>
  //   //       <button
  //   //         onClick={(e) => {
  //   //           onClickDownloadXls(e);
  //   //         }}
  //   //       >
  //   //         Download xls
  //   //       </button>
  //   //     </div>
  //   //   )}
  // };

  const getResourceDataOriginalDataHTML = (
    resourceData: JSONData<ResourceItemRecord>
  ) => {
    const getDataPointHTML = (key: string) => {
      if (!resourceData || !key) {
        return;
      }
      const value = resourceData[key as keyof typeof resourceData];
      if (value === null) {
        return;
      }
      return (
        <div key={key} style={{ marginBottom: "10px" }}>
          <span style={{ fontWeight: "bold" }}>{`• ${key}: `}</span>
          <span>
            {typeof value === "string" ? value : JSON.stringify(value)}
          </span>
        </div>
      );
    };

    return Object.keys(resourceData).map((key) => {
      return !doNotPrintDataKeys.includes(key) && getDataPointHTML(key);
    });
  };

  const getDistributionUrl = (distributionItem: DistributionItem) => {
    return distributionItem?.downloadURL || distributionItem?.accessURL;
  };

  const doNotPrintDataKeys = ["id", "xata"];

  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger
        asChild
        // onClick={() => {
        //   console.log(dataItem);
        // }}
        // className={styles.DialogTrigger}
      >
        <Button>Details</Button>
      </DialogTrigger>
      <DialogContent className="w-[90vw] max-w-[90vw] h-[90vh] flex flex-col">
        {!resourceData && <div>Loading...</div>}
        {resourceData && (
          <>
            <DialogHeader>
              {resourceData.title && (
                <DialogTitle>{resourceData.title as string}</DialogTitle>
              )}
            </DialogHeader>
            {resourceData.keywords && (
              <div className="flex flex-wrap">
                <span style={{ fontWeight: "bold" }}>Keywords:</span>&nbsp;
                {(resourceData.keywords as string[]).map((keyword) => {
                  return <div key={keyword}>• {keyword}</div>;
                })}
              </div>
            )}

            {resourceData.description && (
              <DialogDescription>
                <div
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      resourceData.description as string
                    ),
                  }}
                ></div>
              </DialogDescription>
            )}

            <h3>Distribution:</h3>
            {resourceData.distribution &&
              resourceData.distribution.map(
                (distribution: DistributionItem, index: number) => {
                  return (
                    <div key={index}>
                      <DialogDescription>
                        {distribution.title && (
                          <div style={{ fontWeight: "bold" }}>
                            {distribution.title}
                          </div>
                        )}
                        <div>
                          <a
                            href={getDistributionUrl(distribution)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {getDistributionUrl(distribution) &&
                              getDistributionUrl(distribution)}
                          </a>
                        </div>
                      </DialogDescription>
                      {/* {getPreviewDataLink(distribution)} */}
                    </div>
                  );
                }
              )}

            <Separator className="h-px ml-7 my-0 mr-2.5 w-5/12 shrink" />

            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger className="cursor-pointer underline ml-2.5 text-xs">
                  All Data
                </AccordionTrigger>
                <AccordionContent className="">
                  {getResourceDataOriginalDataHTML(resourceData)}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DataItemDialog;
