"use client";
// import * as d3 from "d3";
// import { DSVParsedArray, DSVRowString } from "d3";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import SkewLoader from "react-spinners/SkewLoader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { getFileExtension } from "@/lib/utils/data";
import ReactJson from "@microlink/react-json-view";

interface PreviewDataProps {
  url: string;
}
const PreviewData = ({ url }: PreviewDataProps) => {
  const [jsonData, setJsonData] = useState<JSON | null>(null);
  const [dataSubset, setDataSubset] = useState<string[][]>([]);
  const [dataKeys, setDataKeys] = useState<string[]>();
  const [totalRowsAvailable, setTotalRowsAvailable] = useState<number>(0);
  const [showDataPreview, setShowDataPreview] = useState<boolean>(false);
  const [fileExtension, setFileExtension] = useState<string | -1>(
    getFileExtension(url)
  );

  useEffect(() => {
    if (!showDataPreview || dataSubset.length) {
      return;
    }

    const getData = async () => {
      const response = await fetch(
        `/api/external-data?url=${encodeURIComponent(url)}`
      ).catch((error) => {
        // return error;
      });

      const data = await response?.json();
      // debugger;

      // if (!data?.data?.length) {
      //   return;
      // }
      setJsonData(data?.data);

      // setDataKeys(data?.data[0]);
      // setDataSubset(data?.data.slice(1) || []);
      // setTotalRowsAvailable(data?.totalRows || 0);
    };

    getData().catch((e) => {
      // console.log(e);
    });
  }, [showDataPreview, dataSubset, url]);

  return (
    <>
      {!showDataPreview && (
        <Button
          size="xs"
          className="mt-2 bg-stone-600 hover:bg-stone-800"
          onClick={() => setShowDataPreview(true)}
        >
          Show Data Preview
        </Button>
      )}
      {showDataPreview && (
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger className="[&>svg]:left-0"></AccordionTrigger>
            <AccordionContent className="w-full mt-4">
              <div className="text-sm font-bold mb-1">Data Preview</div>
              {fileExtension === "json" && jsonData && (
                <ReactJson src={jsonData} />
              )}

              {fileExtension === "csv" && (
                <>
                  <div className="text-sm mb-2">
                    Total preview rows: {dataSubset.length} /{" "}
                    {totalRowsAvailable} total rows
                  </div>

                  {(dataSubset.length && (
                    <div className="w-full max-h-[400px] overflow-auto">
                      <table className="w-full border-collapse border-spacing-0 [&>*:nth-child(odd)]:bg-stone-100 [&>*:nth-child(even)]:bg-stone-200 text-stone-800 pt-1">
                        {dataKeys && (
                          <tr className="sticky top-0">
                            {dataKeys.map((key) => (
                              <th
                                key={key}
                                className="p-2.5 text-sm text-left border-b border-solid"
                              >
                                {key}
                              </th>
                            ))}
                          </tr>
                        )}
                        {dataSubset.map((row, index) => {
                          return (
                            <tr key={index}>
                              {row.map((cell, index) => (
                                <td
                                  key={index}
                                  className="p-2.5 text-xs text-left border-b border-solid"
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </table>
                    </div>
                  )) || <SkewLoader />}
                </>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </>
  );
};
export default PreviewData;
