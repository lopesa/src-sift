type HtmlDataTableProps = {
  data: string[][];
  totalRowsAvailable?: number;
};

const HtmlDataTable = ({ data, totalRowsAvailable }: HtmlDataTableProps) => {
  return (
    <>
      {totalRowsAvailable && (
        <div className="text-sm mb-2">
          Total preview rows: {data.length} / {totalRowsAvailable} total rows
        </div>
      )}
      <div className="w-full max-h-[400px] overflow-auto">
        <table className="w-full border-collapse border-spacing-0 [&>*:nth-child(odd)]:bg-stone-100 [&>*:nth-child(even)]:bg-stone-200 text-stone-800 pt-1">
          {/* {dataKeys && (
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
          )} */}
          {data.map((row, index) => {
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
  );
};
export default HtmlDataTable;
