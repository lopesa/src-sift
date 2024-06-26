"use client";

import { useEffect, useState } from "react";
import { sanitize } from "isomorphic-dompurify";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import DataItemDialog from "./DataItemDialog";
import SaveIconComponent from "./saveIcon";
import FindSimilar from "./find-similar";
import { ResourceItemRecord } from "@/xata";
import { sendGtagEvent } from "@/lib/utils/logging";
import { set } from "zod";

interface DataItemsAccordionProps {
  dataItems: ResourceItemRecord[];
  openAll?: boolean | "indeterminate";
}

const DataItemsAccordion = ({
  dataItems,
  openAll,
}: DataItemsAccordionProps) => {
  const [value, setValue] = useState<string[]>([]);
  const [shouldFindSimilar, setShouldFindSimilar] = useState(false);

  useEffect(() => {
    if (openAll) {
      setValue(dataItems.map((item) => item.id));
    } else {
      setValue([]);
    }
  }, [dataItems, openAll]);

  return (
    <Accordion
      type="multiple"
      value={value}
      onValueChange={(value) => {
        sendGtagEvent("dataItemAccordionOpened", {
          dataItem: value[0],
        });
        setValue(value);
      }}
      className="[&>*:nth-child(odd)]:bg-stone-50 [&>*:nth-child(even)]:bg-stone-100"
    >
      {!!dataItems?.length &&
        dataItems.map((dataItem, index) => (
          <AccordionItem key={index} value={dataItem.id}>
            <div className="text-sm text-left py-2 px-4 flex [&>h3]:flex-1">
              <SaveIconComponent resourceId={dataItem.id} />
              <DataItemDialog
                key={index}
                resourceId={dataItem?.id}
                triggerButtonType="zoom-icon"
              />
              <AccordionTrigger className="py-0">
                <div className="pl-2 text-left pr-4 w-full">
                  {dataItem.title}
                </div>
              </AccordionTrigger>
            </div>

            <AccordionContent className="text-xs pt-1 mb-2 pr-4 pl-12">
              {dataItem.description ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: sanitize(dataItem.description),
                  }}
                ></div>
              ) : (
                <div>No description available</div>
              )}
              {/* {dataItem.description && (
                  <FindSimilar
                    className="mt-4"
                    description={dataItem.description}
                  />
                )} */}
            </AccordionContent>
          </AccordionItem>
        ))}
    </Accordion>
  );
};

export default DataItemsAccordion;
