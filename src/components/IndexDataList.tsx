"use client";
// import DataItemsAccordion from "components/DataItemsAccordion";
import { useEffect, useState } from "react";
// import { DatasetsAvailable } from "types/dataset-index-type";

import { Checkbox } from "@/components/ui/checkbox";
import { AppFinalResourceItem } from "@/lib/types";
import { FC } from "react";
import { JSONData } from "@xata.io/client";
import { ResourceItem } from "@/xata";

interface IndexDataListProps {
  data: JSONData<ResourceItem>[];
  // data: any[];
}

type DataType = "xml" | "csv" | "xls" | "xlsx";

const IndexDataList = ({ data }: IndexDataListProps) => {
  // const IndexDataList: FC<IndexDataListProps> = ({ data }) => {
  const [filteredData, setFilteredData] = useState(data);
  const [showXml, setShowXml] = useState<boolean | "indeterminate">(false);
  const [showXls, setShowXls] = useState<boolean | "indeterminate">(false);
  const [showCsv, setShowCsv] = useState<boolean | "indeterminate">(false);
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

    debugger;

    // if no filters are set, show everything
    if (!includesArray.length) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter((item: any) => {
      if (!item.dataTypesByFileExtension?.length) {
        return false;
      }
      for (let i = 0; i < includesArray.length; i++) {
        if (item.dataTypesByFileExtension.includes(includesArray[i])) {
          return true;
        }
      }
      return false;
    });
    setFilteredData(filtered);
  }, [showXml, showCsv, showXls, data]);

  return (
    <div className="text-left">
      {filteredData && (
        <p className="text-xs font-bold mt-5">
          <span>Total Num Items: {data.length}</span>/
          {filteredData && (
            <span> Current Num Items: {filteredData.length}</span>
          )}
        </p>
      )}
      <form className="flex mb-6 [&>*]:mr-2.5">
        <Checkbox onCheckedChange={setShowXml} />
        <label className="text-xs">Xml</label>
        <Checkbox onCheckedChange={setShowXls} />
        <label className="text-xs">Xls</label>
        <Checkbox onCheckedChange={setShowCsv} />
        <label className="text-xs">Csv</label>
        <Checkbox onCheckedChange={setOpenAllAccordions} />
        <label className="text-xs">Open all accordions</label>
      </form>

      {/* {filteredData && (
        <DataItemsAccordion
          dataItems={filteredData}
          datasetId={DatasetsAvailable.departmentOfAgriculture}
          openAll={openAllAccordions}
        />
      )} */}
    </div>
  );
};

export default IndexDataList;
