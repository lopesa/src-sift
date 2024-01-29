import { getFurtherReadingSchema } from "@/lib/types";
import { useState } from "react";
import { z } from "zod";
import { Button } from "./ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Microscope } from "lucide-react";
import SiftLoader from "./sift-loader";
import { sendGtagEvent } from "@/lib/utils/logging";
import DOMPurify from "dompurify";

type GetFurtherReadingProps = {
  current: z.infer<typeof getFurtherReadingSchema>;
};

const GetFurtherReading = ({ current }: GetFurtherReadingProps) => {
  const [furtherReading, setFurtherReading] = useState<string | null>(null);
  const [gettingFurtherReading, setGettingFurtherReading] =
    useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const doGetFurtherReading = async () => {
    sendGtagEvent("doGetFurtherReading", {
      title: current.title,
    });

    setGettingFurtherReading(true);
    const response = await fetch("/api/chatgpt", {
      method: "POST",
      body: JSON.stringify(current),
    }).catch((err) => err);

    if (!response?.ok) {
      setError(response.statusText);
      setGettingFurtherReading(false);
      return;
    }

    const data = await response.json();
    setFurtherReading(data.data);
    setGettingFurtherReading(false);
  };

  return (
    <>
      {!furtherReading && (
        <Button
          size="xs"
          className="mt-2"
          onClick={doGetFurtherReading}
          variant="hoveredGhost"
        >
          <Microscope className="mr-2" size={14} />
          Ask chatGPT for Further Reading
        </Button>
      )}
      {gettingFurtherReading && <SiftLoader className="mt-10 mb-4 w-14 h-14" />}
      {error && <div className="text-red-500">{error}</div>}
      {furtherReading && (
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger className="justify-start items-start">
              <div className="text-xs text-gray-500 font-bold mb-1 pl-2">
                Further Reading ...
              </div>
            </AccordionTrigger>
            <AccordionContent className="w-full mt-4">
              <div>
                <ul
                  className="list-disc list-inside [&>li]:mt-2 [&_a]:underline"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(furtherReading as string, {
                      ADD_ATTR: ["target"],
                    }),
                  }}
                ></ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </>
  );
};
export default GetFurtherReading;
