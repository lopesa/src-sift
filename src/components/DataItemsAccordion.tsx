"use client";

import { useEffect, useState } from "react";
// import LoginSignupDialog from "components/LoginSignupDialog";

import { sanitize } from "isomorphic-dompurify";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import DataItemDialog from "./DataItemDialog";
import { DataItemsAccordionItem } from "@/lib/types";
import SaveIconComponent from "./saveIcon";
import FindSimilar from "./find-similar";
import { AccordionHeader } from "@radix-ui/react-accordion";

interface DataItemsAccordionProps {
  dataItems: DataItemsAccordionItem[];
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
              {/* <AccordionTrigger className="text-sm text-left py-2 [&>svg]:ml-6"> */}
              <AccordionHeader className="text-sm text-left py-2 flex [&>h3]:flex-1">
                <SaveIconComponent
                  resourceId={dataItem.id}
                  // className="absolute left-5"
                />
                <DataItemDialog
                  key={index}
                  resourceId={dataItem?.id}
                  triggerButtonType="zoom-icon"
                  // className="absolute left-10"
                />
                <AccordionTrigger className="py-0">
                  <div className="pl-2 text-left pr-4 w-full">
                    {dataItem.title}
                  </div>
                </AccordionTrigger>
              </AccordionHeader>

              <AccordionContent className="text-xs pt-1 mb-2 pr-4 pl-12">
                {dataItem.description ? (
                  <div
                    // className="w-full min-w-full"
                    dangerouslySetInnerHTML={{
                      __html: sanitize(dataItem.description),
                    }}
                  ></div>
                ) : (
                  <div>No description available</div>
                )}
                {/* <DataItemDialog
                  key={index}
                  resourceId={dataItem?.id}
                  className="mt-4"
                /> */}
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
    </>
  );
};

export default DataItemsAccordion;
