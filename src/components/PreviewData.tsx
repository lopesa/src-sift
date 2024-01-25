"use client";

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
import HtmlDataTable from "./html-data-table";
import { ArrowLeftSquare, ArrowRightSquare, ScanEye } from "lucide-react";

const DynamicReactJson = dynamic(() => import("@microlink/react-json-view"), {
  ssr: false,
});

interface PreviewDataProps {
  url: string;
}

const PreviewData = ({ url }: PreviewDataProps) => {
  const [jsonData, setJsonData] = useState<JSON | null>(null);
  const [XMLData, setXMLData] = useState<JSON | null>(null);
  const [xlsData, setXlsData] = useState<{
    sheets: { name: string; data: string[][] }[];
    currentSheet: number;
  } | null>(null);
  const [dataSubset, setDataSubset] = useState<string[][]>([]);
  const [totalRowsAvailable, setTotalRowsAvailable] = useState<number>(0);
  const [showDataPreview, setShowDataPreview] = useState<boolean>(false);
  const [fileExtension, setFileExtension] = useState<string | -1>(
    getFileExtension(url)
  );
  const [dataLoadError, setDataLoadError] = useState("");
  const [dataLoading, setDataLoading] = useState(false);

  const xlsSheetForward = () => {
    if (!xlsData) {
      return;
    }
    if (xlsData.currentSheet + 1 >= xlsData.sheets.length) {
      setXlsData({ ...xlsData, currentSheet: 0 });
      return;
    }
    setXlsData({ ...xlsData, currentSheet: xlsData.currentSheet + 1 });
  };

  const xlsSheetBack = () => {
    if (!xlsData) {
      return;
    }
    if (xlsData.currentSheet - 1 < 0) {
      setXlsData({ ...xlsData, currentSheet: xlsData.sheets.length - 1 });
      return;
    }
    setXlsData({ ...xlsData, currentSheet: xlsData.currentSheet - 1 });
  };

  useEffect(() => {
    if (!showDataPreview || dataSubset.length) {
      return;
    }

    setDataLoading(true);

    const getData = async () => {
      const response = await fetch(
        `/api/external-data?url=${encodeURIComponent(url)}`
      ).catch((e) => e);

      if (!response?.ok) {
        setDataLoadError(response?.statusText || "Error loading data");
        setDataLoading(false);
        return;
      }

      const responseJson = await response?.json();

      if (responseJson?.error || !responseJson?.data) {
        setDataLoadError(responseJson?.error || "Error loading data");
        setDataLoading(false);
        return;
      }

      switch (fileExtension) {
        case "xml":
          setXMLData(responseJson.data);
          break;
        case "json":
          setJsonData(responseJson.data);
          break;
        case "csv":
          setDataSubset(responseJson.data);
          setTotalRowsAvailable(responseJson.totalRows || 0);
          break;
        case "xls":
        case "xlsx":
          debugger;
          setXlsData({ sheets: responseJson.data, currentSheet: 0 });
          break;
      }
      setDataLoading(false);
    };

    getData().catch((e) => {
      setDataLoadError(e.message || "Error loading data");
      setDataLoading(false);
    });
  }, [showDataPreview, dataSubset, url, fileExtension]);

  return (
    <>
      {!showDataPreview && (
        <Button
          size="xs"
          className="mt-2"
          onClick={() => setShowDataPreview(true)}
          variant="hoveredGhost"
        >
          <ScanEye className="mr-2" size={14} />
          Preview Data
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
              {dataLoading && <SiftLoader className="ml-8" />}
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

              {fileExtension === "xls" ||
                (fileExtension === "xlsx" && xlsData && (
                  <>
                    <div className="text-xs ml-1">
                      Sheet Name:{" "}
                      <span className="font-bold">
                        {xlsData.sheets[xlsData.currentSheet].name}
                      </span>
                    </div>
                    {xlsData.sheets.length > 1 && (
                      <div className="flex items-center ml-1 mb-1">
                        <div className="text-xs mr-1">Sheets: </div>
                        <ArrowLeftSquare
                          onClick={xlsSheetBack}
                          className="mr-1 cursor-pointer emerald-400"
                          size={14}
                        />
                        <ArrowRightSquare
                          onClick={xlsSheetForward}
                          className="mr-1 cursor-pointer emerald-400"
                          size={14}
                        />
                        <div className="text-xs">
                          ({xlsData.currentSheet + 1} of {xlsData.sheets.length}
                          )
                        </div>
                      </div>
                    )}
                    <HtmlDataTable
                      data={xlsData.sheets[xlsData.currentSheet].data}
                    />
                  </>
                ))}

              {fileExtension === "csv" && dataSubset && (
                <>
                  {!!dataSubset.length && (
                    <HtmlDataTable
                      data={dataSubset}
                      totalRowsAvailable={totalRowsAvailable}
                    />
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
