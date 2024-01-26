"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ResourceItemRecord } from "@/xata";
import DataItemsAccordion from "./DataItemsAccordion";

interface IndexDataListProps {
  data: ResourceItemRecord[];
  title?: string;
}

type DataType = "xml" | "csv" | "xls" | "xlsx" | "json" | "aspx";

const IndexDataList = ({ data, title }: IndexDataListProps) => {
  const [filteredData, setFilteredData] = useState(data);
  const [showXml, setShowXml] = useState<boolean | "indeterminate">(false);
  const [showXls, setShowXls] = useState<boolean | "indeterminate">(false);
  const [showCsv, setShowCsv] = useState<boolean | "indeterminate">(false);
  const [showJson, setShowJson] = useState<boolean | "indeterminate">(false);
  const [showAspx, setShowAspx] = useState<boolean | "indeterminate">(false);
  const [openAllAccordions, setOpenAllAccordions] = useState<
    boolean | "indeterminate"
  >(false);

  useEffect(() => {
    const includesArray: DataType[] = [];
    if (showXml) {
      includesArray.push("xml");
    }
    if (showCsv) {
      includesArray.push("csv");
    }
    if (showXls) {
      includesArray.push("xls");
      includesArray.push("xlsx");
    }
    if (showJson) {
      includesArray.push("json");
    }
    if (showAspx) {
      includesArray.push("aspx");
    }

    // if no filters are set, show everything
    if (!includesArray.length) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter((item: any) => {
      if (!item.data_types_by_file_extension?.length) {
        return false;
      }
      for (let i = 0; i < includesArray.length; i++) {
        if (item.data_types_by_file_extension.includes(includesArray[i])) {
          return true;
        }
      }
      return false;
    });
    setFilteredData(filtered);
  }, [showXml, showCsv, showXls, showJson, showAspx, data]);

  return (
    <div className="flex flex-col h-full pl-6 pr-8 mx-auto w-full">
      {filteredData && (
        <div className="h-28 pt-10 pl-4 mb-6">
          {title && <h1 className="text-2xl font-light mb-1">{title}</h1>}
          <p className="text-xs font-bold">
            <span>Total Num Items: {data.length}</span>/
            {filteredData && (
              <span> Current Num Items: {filteredData.length}</span>
            )}
          </p>
          <form className="flex mt-2 [&>label]:mr-2.5 [&>button]:mr-1">
            <Checkbox
              onCheckedChange={() => {
                setShowJson(!showJson);
              }}
            />
            <label className="text-xs">json</label>

            <Checkbox
              onCheckedChange={() => {
                setShowXml(!showXml);
              }}
            />
            <label className="text-xs">xml</label>

            <Checkbox
              onCheckedChange={() => {
                setShowXls(!showXls);
              }}
            />
            <label className="text-xs">xls</label>

            <Checkbox
              onCheckedChange={() => {
                setShowCsv(!showCsv);
              }}
            />
            <label className="text-xs">csv</label>

            <Checkbox
              onCheckedChange={() => {
                setShowAspx(!showAspx);
              }}
            />
            <label className="text-xs">aspx</label>

            <Checkbox onCheckedChange={setOpenAllAccordions} className="ml-4" />
            <label className="text-xs">open all accordions</label>
          </form>
        </div>
      )}

      {filteredData && (
        <div className="overflow-scroll h-[calc(100%-8rem)]">
          <DataItemsAccordion
            dataItems={filteredData}
            openAll={openAllAccordions}
          />
        </div>
      )}
    </div>
  );
};

export default IndexDataList;
