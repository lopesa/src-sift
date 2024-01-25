import { getFileExtension } from "@/lib/utils/data";
import { NextRequest, NextResponse } from "next/server";
import validator from "validator";
import PapaParse from "papaparse";
import xlsx from "node-xlsx";

export async function GET(req: NextRequest, res: NextResponse) {
  const returnErrorResponse = (message: string) => {
    return NextResponse.json({
      error: message,
    });
  };

  const params = req.nextUrl.searchParams;
  const url = params.get("url");
  const returnAmount = Number(params.get("returnAmount"));
  const DEFAULT_RETURN_AMOUNT = 100;
  const USABLE_FILETYPES = ["csv", "xls", "json", "xml", "xlx", "xlsx"];

  if (!url) {
    return returnErrorResponse("Invalid request body");
  }

  const fileExtension = getFileExtension(url);
  if (!validator.isURL(url)) {
    return returnErrorResponse("Invalid url");
  }
  if (fileExtension === -1 || !USABLE_FILETYPES.includes(fileExtension)) {
    return returnErrorResponse(`Invalid file type, got: ${fileExtension}`);
  }

  const response = await fetch(url).catch((e) => {
    // debugger;
  });

  const headers = response?.headers;
  const contentType = headers?.get("content-type");
  // const contentLength = headers?.get("content-length");
  // const contentEncoding = headers?.get("content-encoding");
  // const contentDisposition = headers?.get("content-disposition");
  // const redirected = response?.redirected;

  if (!response?.ok) {
    return returnErrorResponse("Error fetching data");
  }

  switch (fileExtension) {
    case "csv":
      if (
        contentType !== "text/csv" &&
        contentType !== "application/csv" &&
        contentType !== "binary/octet-stream" &&
        contentType !== "application/octet-stream"
      ) {
        return returnErrorResponse(
          `Not csv content type, got: ${contentType}. Likely a redirect to an html page.`
        );
      }
      const data = await response.text();
      const parsedCsvData = PapaParse.parse(data);
      const totalRows = parsedCsvData?.data?.length;
      const dataSubset = parsedCsvData?.data?.slice(
        0,
        returnAmount || DEFAULT_RETURN_AMOUNT
      );

      if (!dataSubset || !totalRows) {
        return returnErrorResponse("Error fetching data");
      }

      return NextResponse.json({
        data: dataSubset,
        totalRows: totalRows,
      });
    case "json":
      const jsonData = await response.json().catch((e) => {
        // debugger;
      });

      return NextResponse.json({
        data: jsonData,
      });
    case "xml":
      const xmlData = await response.text().catch((e) => {
        // debugger;
      });

      return NextResponse.json({
        data: xmlData,
      });
    case "xls":
    case "xlsx":
      const xlsDataBuffer = await response.arrayBuffer().catch((e) => {
        // debugger;
      });
      const xlxData = xlsDataBuffer && xlsx.parse(xlsDataBuffer);
      return NextResponse.json({
        data: xlxData,
      });
    default:
      break;
  }
}
