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
import SkewLoader from "react-spinners/SkewLoader";
import { cn } from "@/lib/utils";
import SaveIconComponent from "./saveIcon";
import Link from "next/link";

interface DataItemDialogProps {
  triggerCopy?: string;
  resourceId: string;
  className?: string;
}

const onClickDownloadXls = (e: React.MouseEvent<HTMLButtonElement>) => {
  console.log(e.currentTarget.value);
  debugger;
};

const DataItemDialog = ({
  resourceId,
  className,
  triggerCopy,
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
        extension.includes("xml"));
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
        <Button
          // asChild
          size="xs"
          className="bg-stone-600 hover:bg-stone-800"
        >
          {triggerCopy || "Details"}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[90vw] max-w-[90vw] h-[90vh] p-7 pt-10">
        <div className="h-full overflow-scroll">
          {!resourceData && (
            <SkewLoader loading={true} size={10} color="#38bdf8" />
          )}

          {resourceData && (
            <>
              {resourceData?.title && (
                <DialogHeader className="h-[50px]">
                  <DialogTitle className="text-xl font-light pr-10 flex items-center">
                    <SaveIconComponent
                      resourceId={resourceData.id}
                      className="mr-2"
                    />
                    {resourceData.title as string}
                  </DialogTitle>
                </DialogHeader>
              )}

              <div
                className={cn(
                  resourceData?.title ? "h-[calc(100%-50px)]" : "h-full",
                  "overflow-scroll"
                )}
              >
                {resourceData.keywords && (
                  <DialogDescription className="flex flex-wrap pr-20">
                    <span style={{ fontWeight: "bold" }}>Keywords:</span>&nbsp;
                    {(resourceData.keywords as string[]).map((keyword) => {
                      return <div key={keyword}>• {keyword}</div>;
                    })}
                  </DialogDescription>
                )}

                {resourceData.description && (
                  <DialogDescription className="pr-20">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(
                          resourceData.description as string
                        ),
                      }}
                    ></div>
                  </DialogDescription>
                )}

                <h3 className="mt-6 mb-2 font-bold">Distribution:</h3>
                {resourceData.distribution &&
                  resourceData.distribution.map(
                    (distribution: DistributionItem, index: number) => {
                      return (
                        <div key={index} className="mb-6">
                          <DialogDescription>
                            <SaveIconComponent
                              resourceId={resourceData.id}
                              className="mr-2"
                              distributionItem={distribution}
                            />
                            <div className="text-bold">
                              • {distribution.title || "no title available"}
                            </div>

                            {!!getDistributionUrl(distribution) && (
                              <Link
                                href={
                                  getDistributionUrl(distribution) as string
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="underline"
                              >
                                {getDistributionUrl(distribution)}
                              </Link>
                            )}
                          </DialogDescription>
                          {getPreviewDataLink(distribution)}
                        </div>
                      );
                    }
                  )}

                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="cursor-pointer underline ml-2.5 text-xs">
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
