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

interface DataItemsAccordionProps {
  dataItems: DataItemsAccordionItem[];
  openAll?: boolean | "indeterminate";
}

const DataItemsAccordion = ({
  dataItems,
  openAll,
}: DataItemsAccordionProps) => {
  const [value, setValue] = useState<string[]>([]);

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
