"use client";
// import * as d3 from "d3";
// import { DSVParsedArray, DSVRowString } from "d3";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import SkewLoader from "react-spinners/SkewLoader";

interface PreviewDataProps {
  url: string;
}
const PreviewData = ({ url }: PreviewDataProps) => {
  const [dataSubset, setDataSubset] = useState<string[][]>([]);
  const [dataKeys, setDataKeys] = useState<string[]>();
  const [totalRowsAvailable, setTotalRowsAvailable] = useState<number>(0);
  const [showDataPreview, setShowDataPreview] = useState<boolean>(false);

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

      if (!data?.data?.length) {
        return;
      }
      setDataKeys(data?.data[0]);
      setDataSubset(data?.data.slice(1) || []);
      setTotalRowsAvailable(data?.totalRows || 0);
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
        <div className="w-full">
          <div>Data Preview</div>
          <div>
            Total preview rows: {dataSubset.length} / {totalRowsAvailable} total
            rows
          </div>
          {(dataSubset.length && (
            <div className="w-full max-h-[500px] overflow-auto">
              <table className="w-full border-collapse border-spacing-0 [&>*:nth-child(odd)]:bg-sky-200 [&>*:nth-child(even)]:bg-sky-300">
                {dataKeys && (
                  <tr>
                    {/* <tr className={styles.DataTableHeader}> */}
                    {dataKeys.map((key) => (
                      <th
                        key={key}
                        className="p-2.5 text-lg text-left border-b border-solid"
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
                          className="p-2.5 text-sm text-left border-b border-solid"
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
        </div>
      )}
    </>
  );
};
export default PreviewData;
