"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectedPick } from "@xata.io/client";
import { ResourceItemRecord } from "@/xata";
import DataItemsAccordion from "./DataItemsAccordion";

interface IndexDataListProps {
  data: Readonly<SelectedPick<ResourceItemRecord, ["*"]>>[];
  title?: string;
}

type DataType = "xml" | "csv" | "xls" | "xlsx" | "json";

const IndexDataList = ({ data, title }: IndexDataListProps) => {
  const [filteredData, setFilteredData] = useState(data);
  const [showXml, setShowXml] = useState<boolean | "indeterminate">(false);
  const [showXls, setShowXls] = useState<boolean | "indeterminate">(false);
  const [showCsv, setShowCsv] = useState<boolean | "indeterminate">(false);
  const [showJson, setShowJson] = useState<boolean | "indeterminate">(false);
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
  }, [showXml, showCsv, showXls, showJson, data]);

  return (
    <div className="flex flex-col h-full bg-stone-100 pl-6 pr-8 mx-auto w-full max-w-screen-xl">
      {filteredData && (
        <div className="h-28 pt-10 mb-10">
          {title && <h1 className="text-xl font-light">{title}</h1>}
          <p className="text-xs font-bold">
            <span>Total Num Items: {data.length}</span>/
            {filteredData && (
              <span> Current Num Items: {filteredData.length}</span>
            )}
          </p>
          <form className="flex mt-2 mb-6 [&>label]:mr-2.5 [&>button]:mr-1">
            <Checkbox onCheckedChange={setShowJson} />
            <label className="text-xs">JSON</label>
            <Checkbox onCheckedChange={setShowXml} />
            <label className="text-xs">Xml</label>
            <Checkbox onCheckedChange={setShowXls} />
            <label className="text-xs">Xls</label>
            <Checkbox onCheckedChange={setShowCsv} />
            <label className="text-xs">Csv</label>
            <Checkbox onCheckedChange={setOpenAllAccordions} />
            <label className="text-xs">Open all accordions</label>
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
