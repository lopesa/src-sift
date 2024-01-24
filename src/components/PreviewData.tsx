"use client";
// import * as d3 from "d3";
// import { DSVParsedArray, DSVRowString } from "d3";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { getFileExtension } from "@/lib/utils/data";
import XMLViewer from "react-xml-viewer";
import SiftLoader from "./sift-loader";
import dynamic from "next/dynamic";

const DynamicReactJson = dynamic(() => import("@microlink/react-json-view"), {
  ssr: false,
});

interface PreviewDataProps {
  url: string;
}
const PreviewData = ({ url }: PreviewDataProps) => {
  const [jsonData, setJsonData] = useState<JSON | null>(null);
  const [XMLData, setXMLData] = useState<JSON | null>(null);
  const [dataSubset, setDataSubset] = useState<string[][]>([]);
  const [dataKeys, setDataKeys] = useState<string[]>();
  const [totalRowsAvailable, setTotalRowsAvailable] = useState<number>(0);
  const [showDataPreview, setShowDataPreview] = useState<boolean>(false);
  const [fileExtension, setFileExtension] = useState<string | -1>(
    getFileExtension(url)
  );
  const [dataLoadError, setDataLoadError] = useState("");
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (!showDataPreview || dataSubset.length) {
      return;
    }

    setDataLoading(true);

    const getData = async () => {
      const response = await fetch(
        `/api/external-data?url=${encodeURIComponent(url)}`
      ).catch((e) => e);

      const data = await response?.json();

      debugger;

      if (data?.error) {
        setDataLoadError(data?.error);
        setDataLoading(false);
        return;
      }

      if (!data?.data) {
        setDataLoadError("Error loading data");
        setDataLoading(false);
        return;
      }

      switch (fileExtension) {
        case "xml":
          setXMLData(data?.data);
          break;
        case "json":
          setJsonData(data?.data);
          break;
        case "csv":
          setDataKeys(data?.data[0]);
          setDataSubset(data?.data.slice(1) || []);
          setTotalRowsAvailable(data?.totalRows || 0);
          break;
      }
      setDataLoading(false);
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
            <AccordionTrigger className="justify-start items-start">
              <div className="text-xs text-gray-500 font-bold mb-1 pl-2">
                Data Preview
              </div>
            </AccordionTrigger>
            <AccordionContent className="w-full mt-4">
              {dataLoading && <SiftLoader className="mt-10 mb-4 mx-auto" />}
              {dataLoadError && (
                <div className="text-red-500">{dataLoadError}</div>
              )}

              {fileExtension === "xml" && XMLData && (
                <div className="text-[10px]">
                  <XMLViewer xml={XMLData} collapsible={true} />
                </div>
              )}

              {fileExtension === "json" && jsonData && (
                <DynamicReactJson src={jsonData} style={{ fontSize: "10px" }} />
              )}

              {fileExtension === "csv" && dataSubset && (
                <>
                  {!!dataSubset.length && (
                    <>
                      <div className="text-sm mb-2">
                        Total preview rows: {dataSubset.length} /{" "}
                        {totalRowsAvailable} total rows
                      </div>
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
                    </>
                  )}
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
