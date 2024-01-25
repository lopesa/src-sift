"use client";

import { useEffect, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import DataItemDialog from "./DataItemDialog";
import SaveIconComponent from "./saveIcon";
import { UserResourceRecord } from "@/xata";
import Link from "next/link";

interface DistributionItemsAccordionProps {
  dataItems: UserResourceRecord[];
  openAll?: boolean | "indeterminate";
}

const DistributionItemsAccordion = ({
  dataItems,
  openAll,
}: DistributionItemsAccordionProps) => {
  const [value, setValue] = useState<string[]>([]);

  useEffect(() => {
    if (openAll) {
      let val: string[] = [];
      dataItems.forEach(
        (item) => item.distribution_item && val.push(item.distribution_item.id)
      );
      setValue(val);
    } else {
      setValue([]);
    }
  }, [dataItems, openAll]);

  return (
    <Accordion type="multiple" value={value} onValueChange={setValue}>
      {!!dataItems?.length &&
        dataItems.map(({ distribution_item, resource }, index) => {
          if (!distribution_item || !resource) {
            return null;
          }
          return (
            <AccordionItem key={index} value={distribution_item.id}>
              <div className="text-sm text-left py-2 flex [&>h3]:flex-1">
                <SaveIconComponent
                  resourceId={resource.id}
                  distributionItem={distribution_item}
                />

                <AccordionTrigger className="py-0">
                  <div className="pl-2 text-left pr-4 w-full">
                    {distribution_item.title || "no title available"}
                  </div>
                </AccordionTrigger>
              </div>

              <AccordionContent className="text-xs [&*>]:m-0 mb-2.5 mb-6 pr-6 pl-2">
                <div>{distribution_item.description}</div>
                {distribution_item.mediaType && (
                  <div>
                    <span className="font-bold">Type:</span>{" "}
                    {distribution_item.mediaType}
                  </div>
                )}

                {distribution_item.downloadURL && (
                  <div>
                    <span className="font-bold">Link:</span>{" "}
                    <Link
                      href={distribution_item.downloadURL}
                      className="underline"
                    >
                      {distribution_item.downloadURL}
                    </Link>
                  </div>
                )}
                {distribution_item.accessURL && (
                  <div>
                    <span className="font-bold">Link:</span>{" "}
                    <Link
                      href={distribution_item.accessURL}
                      className="underline"
                    >
                      {distribution_item.accessURL}
                    </Link>
                  </div>
                )}
                <div className="flex-1 pl-2">
                  {resource && (
                    <DataItemDialog
                      key={index}
                      resourceId={resource.id}
                      triggerButtonType="recircle"
                    />
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
    </Accordion>
  );
};

export default DistributionItemsAccordion;
