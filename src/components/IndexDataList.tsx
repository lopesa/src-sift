"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
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

  type CheckBoxAndLabelLockupProps = {
    checkChangeMethod: Dispatch<SetStateAction<boolean | "indeterminate">>;
    checkChangeProp: boolean | "indeterminate";
    label: string;
  };

  const CheckBoxAndLabelLockup = ({
    checkChangeMethod,
    checkChangeProp,
    label,
  }: CheckBoxAndLabelLockupProps) => {
    return (
      <div className="flex align-center">
        <Checkbox
          checked={checkChangeProp}
          className="mr-1"
          onCheckedChange={() => {
            checkChangeMethod(!checkChangeProp);
          }}
        />
        <label className="text-xs">{label}</label>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full pl-6 pr-8 mx-auto w-full">
      {filteredData && (
        <div className="pt-10 pl-4 mb-6">
          {title && <h1 className="text-2xl font-light mb-1">{title}</h1>}
          <p className="text-xs font-bold">
            <span>Total Num Items: {data.length}</span>/
            {filteredData && (
              <span> Current Num Items: {filteredData.length}</span>
            )}
          </p>
          <form className="flex flex-row flex-wrap mt-2 [&>button]:mr-1 [&>*]:mr-2 [&>*]:mb-1.5">
            <CheckBoxAndLabelLockup
              checkChangeMethod={setShowJson}
              checkChangeProp={showJson}
              label="json"
            ></CheckBoxAndLabelLockup>

            <CheckBoxAndLabelLockup
              checkChangeMethod={setShowXml}
              checkChangeProp={showXml}
              label="xml"
            ></CheckBoxAndLabelLockup>

            <CheckBoxAndLabelLockup
              checkChangeMethod={setShowXls}
              checkChangeProp={showXls}
              label="xls"
            ></CheckBoxAndLabelLockup>

            <CheckBoxAndLabelLockup
              checkChangeMethod={setShowCsv}
              checkChangeProp={showCsv}
              label="csv"
            ></CheckBoxAndLabelLockup>

            <CheckBoxAndLabelLockup
              checkChangeMethod={setShowAspx}
              checkChangeProp={showAspx}
              label="aspx"
            ></CheckBoxAndLabelLockup>

            <CheckBoxAndLabelLockup
              checkChangeMethod={setOpenAllAccordions}
              checkChangeProp={openAllAccordions}
              label="open all accordions"
            ></CheckBoxAndLabelLockup>
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
