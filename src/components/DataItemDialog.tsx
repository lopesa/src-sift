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

import { Button } from "@/components/ui/button";
import DOMPurify from "dompurify";
import { useState } from "react";
import { Separator } from "./ui/separator";
import PreviewData from "./PreviewData";
import { getFileExtension } from "@/lib/utils/data";
import SaveIconComponent from "./saveIcon";
import Link from "next/link";
import SiftLoader from "./sift-loader";
import { RefreshCw, ZoomIn } from "lucide-react";
import GetFurtherReading from "./get-further-reading";
import { sendGtagEvent } from "@/lib/utils/logging";

interface DataItemDialogProps {
  triggerCopy?: string;
  resourceId: string;
  triggerButtonType?: "button" | "zoom-icon" | "recircle";
}

const DataItemDialog = ({
  resourceId,
  triggerCopy,
  triggerButtonType,
}: DataItemDialogProps) => {
  const DO_NOT_PRINT_DATA_KEYS = ["id", "xata"];
  const PREVIEWABLE_DATA_TYPES = ["csv", "json", "xml", "xls", "xlsx"];

  const [resourceData, setResourceData] = useState<ResourceItemRecord | null>();

  const onOpenChange = async (open: boolean) => {
    if (!open || !!resourceData) {
      return;
    }

    if (!resourceId) {
      // throw new Error("Problem getting resource id");
    }

    sendGtagEvent("openDataItemDialog", { resourceId });

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
      PREVIEWABLE_DATA_TYPES.includes(extension);

    return (
      shouldOfferPreviewData && (
        <div>
          <PreviewData url={url} />
        </div>
      )
    );
  };

  const getTriggerButton = (triggerButtonType?: string) => {
    switch (triggerButtonType) {
      case "zoom-icon":
        return (
          <ZoomIn className="cursor-pointer text-gray-500 ml-2" size={16} />
        );
      case "recircle":
        return (
          <Button size="xs" className="mt-2" variant="hoveredGhost">
            <RefreshCw className="mr-2" size={14} />
            {triggerCopy || "Original Resource"}
          </Button>
        );
      case "button":
      default:
        return (
          <Button size="xs" className="bg-stone-600 hover:bg-stone-800">
            {triggerCopy || "Details"}
          </Button>
        );
    }
  };

  const getResourceDataOriginalDataHTML = (
    resourceData: ResourceItemRecord
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
      return !DO_NOT_PRINT_DATA_KEYS.includes(key) && getDataPointHTML(key);
    });
  };

  const getDistributionUrl = (distributionItem: DistributionItem) => {
    return distributionItem?.downloadURL || distributionItem?.accessURL;
  };

  const getFurtherReadingProps = (resourceData: ResourceItemRecord) => {
    const { title = "", description = "" } = resourceData;
    return {
      title,
      description,
    } as {
      title: string;
      description: string;
    };
  };

  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {getTriggerButton(triggerButtonType)}
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

                {/* FURTHER READING */}
                <GetFurtherReading
                  current={getFurtherReadingProps(resourceData)}
                />

                <Separator className="mt-4 mb-6" />

                {/* RESOURCE ITEMS */}

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
