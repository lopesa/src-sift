"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

import { DistributionItem, ResourceItemRecord } from "@/xata";

import { JSONData } from "@xata.io/client";
import { Button } from "@/components/ui/button";
import DOMPurify from "dompurify";
import { useState } from "react";
import { Separator } from "./ui/separator";
import PreviewData from "./PreviewData";
import { getFileExtension } from "@/lib/utils/data";
import { cn } from "@/lib/utils";
import SaveIconComponent from "./saveIcon";
import Link from "next/link";
import SiftLoader from "./sift-loader";
import { ZoomIn } from "lucide-react";

interface DataItemDialogProps {
  triggerCopy?: string;
  resourceId: string;
  className?: string;
  triggerButtonType?: "button" | "zoom-icon";
}

const onClickDownloadXls = (e: React.MouseEvent<HTMLButtonElement>) => {
  console.log(e.currentTarget.value);
  debugger;
};

const DataItemDialog = ({
  resourceId,
  className,
  triggerCopy,
  triggerButtonType = "button",
}: DataItemDialogProps) => {
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
      }
    );

    const serializedData = await response.json();
    setResourceData(serializedData.data);
  };

  const getPreviewDataLink = (distributionItem: DistributionItem) => {
    const url = distributionItem?.downloadURL || distributionItem?.accessURL;
    if (!url) {
      return;
    }
    const extension = getFileExtension(url);
    const shouldOfferPreviewData =
      typeof extension === "string" &&
      (extension.includes("csv") ||
        extension.includes("json") ||
        extension.includes("xml") ||
        extension.includes("xls") ||
        extension.includes("xlsx"));
    // const shouldOfferPreviewData =
    //   typeof extension === "string" &&
    //   (extension.includes("csv") || extension.includes("xls"));

    return (
      shouldOfferPreviewData && (
        <div>
          <PreviewData url={url} />
        </div>
      )
    );
  };

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
      <DialogTrigger asChild>
        {triggerButtonType === "zoom-icon" ? (
          <ZoomIn className="cursor-pointer text-gray-500 ml-2" size={16}>
            <Button
              asChild
              onClick={(e) => {
                debugger;
                e.preventDefault();
                e.stopPropagation();
              }}
            />
          </ZoomIn>
        ) : (
          <Button
            // asChild
            size="xs"
            className="bg-stone-600 hover:bg-stone-800"
          >
            {triggerCopy || "Details"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[90vw] max-w-[90vw] h-[90vh] p-7 pt-10">
        <div className="h-full overflow-scroll">
          {!resourceData && <SiftLoader className="mt-10 mb-4 mx-auto" />}

          {resourceData && (
            <>
              {resourceData?.title && (
                <DialogHeader>
                  <DialogTitle className="text-2xl font-light flex items-start justify-start relative mb-6">
                    <div className="w-10">
                      <SaveIconComponent
                        resourceId={resourceData.id}
                        className="mr-2 mt-2"
                      />
                    </div>
                    {resourceData.title as string}
                  </DialogTitle>
                </DialogHeader>
              )}

              {/* <div
                className={cn(
                  resourceData?.title ? "h-[calc(100%-50px)]" : "h-full",
                  "overflow-scroll"
                )}
              > */}

              {/* KEYWORDS */}
              <div>
                {resourceData.keywords && (
                  <DialogDescription className="flex flex-wrap pr-20 mb-6 max-w-screen-xl items-center">
                    <span className="font-bold text-sm">Keywords:</span>&nbsp;
                    {(resourceData.keywords as string[]).map((keyword) => {
                      return (
                        <div key={keyword} className="mr-1.5 text-xs">
                          • {keyword}
                        </div>
                      );
                    })}
                  </DialogDescription>
                )}

                <Separator className="mt-4 mb-6" />

                {/* DESCRIPTION */}
                {resourceData.description && (
                  <DialogDescription className="pr-20 mb-8 max-w-screen-xl">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(
                          resourceData.description as string
                        ),
                      }}
                    ></div>
                  </DialogDescription>
                )}

                <h3 className="mt-6 mb-2 font-bold text-sm">Resource Items:</h3>
                {resourceData.distribution &&
                  resourceData.distribution.map(
                    (distribution: DistributionItem, index: number) => {
                      return (
                        <div key={index} className="mb-6">
                          <DialogDescription>
                            <div className="flex mb-1 items-center">
                              <SaveIconComponent
                                resourceId={resourceData.id}
                                className="mr-2"
                                distributionItem={distribution}
                              />
                              <div className="text-bold">
                                {distribution.title || "no title available"}
                              </div>
                            </div>

                            {!!getDistributionUrl(distribution) && (
                              <div className="overflow-y-scroll">
                                {/* <div className="overflow-y-scroll bg-gradient-to-r from-white from-80% to-gray-300 to-100%"> */}
                                <Link
                                  href={
                                    getDistributionUrl(distribution) as string
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  className="underline text-xs ml-1 text-sky-600"
                                >
                                  {getDistributionUrl(distribution)}
                                </Link>
                              </div>
                            )}
                          </DialogDescription>
                          {getPreviewDataLink(distribution)}
                        </div>
                      );
                    }
                  )}

                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="cursor-pointer underline text-xs">
                      All Data
                    </AccordionTrigger>
                    <AccordionContent>
                      {getResourceDataOriginalDataHTML(resourceData)}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DataItemDialog;
