import { getFileExtension } from "@/lib/utils/data";
import { NextRequest, NextResponse } from "next/server";
import validator from "validator";
import PapaParse from "papaparse";
import xlsx from "node-xlsx";
// import http from "http";
// import https from "https";
// import fs, { WriteStream, promises } from "fs";
// const http = require("http");
// const fs = require("fs");

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

  if (!url) {
    return returnErrorResponse("Invalid request body");
  }

  const fileExtension = getFileExtension(url);
  if (!validator.isURL(url)) {
    return returnErrorResponse("Invalid url");
  }
  const usableFileTypes = ["csv", "xls", "json", "xml", "xlx", "xlsx"];
  if (fileExtension === -1 || !usableFileTypes.includes(fileExtension)) {
    return returnErrorResponse(`Invalid file type, got: ${fileExtension}`);
  }

  const response = await fetch(url).catch((e) => {
    // debugger;
  });

  const headers = response?.headers;
  const contentType = headers?.get("content-type");
  const contentLength = headers?.get("content-length");
  const contentEncoding = headers?.get("content-encoding");
  const contentDisposition = headers?.get("content-disposition");
  const redirected = response?.redirected;

  if (!response?.ok) {
    return returnErrorResponse("Error fetching data");
    // debugger;
  }

  debugger;

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
      // const testSlice = parsedCsvData.data.slice(0, 5);
      // const testSliceString = testSlice.join("\r\n");
      // const blob = new Blob([testSliceString], { type: "text/csv" });

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
      break;
    case "json":
      const jsonData = await response?.json().catch((e) => {
        // debugger;
      });

      return NextResponse.json({
        data: jsonData,
      });
    // break;
    case "xml":
      const xmlData = await response?.text().catch((e) => {
        // debugger;
      });

      // debugger;
      return NextResponse.json({
        data: xmlData,
      });
    case "xls":
      const xlsData = await response?.arrayBuffer().catch((e) => {
        debugger;
      });
      const test2 = await response.text().catch((e) => {
        debugger;
      });
      const xlxData = xlsx.parse(xlsData);
      debugger;
      return returnErrorResponse("return error for now");

    case "xlsx":
      const xlsxArrayBuffer = await response?.arrayBuffer().catch((e) => {
        debugger;
      });

      if (!xlsxArrayBuffer) {
        return returnErrorResponse("Error fetching data");
      }

      const xlsxData = xlsx.parse(xlsxArrayBuffer);

      // const test = await response.text().catch((e) => {
      //   debugger;
      // });
      debugger;
      return returnErrorResponse("return error for now");
    default:
      break;
  }

  // if (fileExtension === "xml") {
  //   const optionsResponse = await fetch(url, {
  //     method: "OPTIONS",
  //   }).catch((e) => {
  //     // debugger;
  //   });

  //   const options =
  //     optionsResponse?.ok &&
  //     (await optionsResponse?.json().catch((e) => {
  //       // debugger;
  //     }));

  //   // debugger;

  //   const response = await fetch(url).catch((e) => {
  //     // debugger;
  //   });

  //   if (!response?.ok) {
  //     // debugger;
  //     return returnErrorResponse("Error fetching data");
  //   }

  //   const xmlData = await response?.text().catch((e) => {
  //     // debugger;
  //   });

  //   // debugger;
  //   return NextResponse.json({
  //     data: xmlData,
  //   });
  // }

  // if (fileExtension === "json") {

  //   const response = await fetch(url).catch((e) => {
  //     // debugger;
  //   });

  //   if (!response?.ok) {
  //     return returnErrorResponse("Error fetching data");
  //     // debugger;
  //   }

  //   const jsonData = await response?.json().catch((e) => {
  //     // debugger;
  //   });

  //   return NextResponse.json({
  //     data: jsonData,
  //   });
  // }

  // @TODO: check how large the file is before starting to download
  // implement a max size to try to download

  // @TODO: all http (not s) requests are failing
  // now the headers seem not necessary
  // const response = await fetch(url, {
  //   method: "GET",
  //   // headers: {
  //   //   "Content-Type": "text/csv",
  //   //   "Accept-Encoding": "gzip, deflate, br",
  //   //   Origin: "http://localhost:3001",
  //   //   // Accept: "text/csv",
  //   // },
  //   // mode: "no-cors",
  // }).catch((e) => {
  //   // const proxiedRequestUrl = `http://proxy:8080/${url}`;
  //   // const proxiedRequestUrl = `http://localhost:8080/${url}`;
  //   // const response = await fetch(proxiedRequestUrl).catch((e) => {
  //   // debugger;
  // });

  // if (!response?.ok) {
  //   return returnErrorResponse("Error fetching data");
  // }

  // if (fileExtension === "json") {
  //   const data = await response.json();
  //   return NextResponse.json({
  //     data,
  //     totalRows: data.length,
  //   });
  // }

  // let data;
  // let totalRows;
  // let dataSubset;
  // let parsedCsvData: PapaParse.ParseResult<string[]> | undefined;

  // if (fileExtension.includes("csv")) {
  //   data = await response.text();

  //   parsedCsvData = PapaParse.parse(data);

  //   const testSlice = parsedCsvData.data.slice(0, 5);
  //   const testSliceString = testSlice.join("\r\n");

  // var stream = ss.createStream();
  // stream.write(buffer);
  // debugger;
  // const buffer = Buffer.from(data);
  // const blob = new Blob([testSliceString], { type: "text/csv" });

  // debugger;

  // const vizSuggestions = await getVisualizationSuggestions(blob);

  // parsedCsvData = PapaParse.parse(data);
  // const vizSuggestions = await getVisualizationSuggestions(
  //   parsedCsvData.data.join("\r\n")
  // );

  // this point should be the clean csv document
  // debugger;

  // totalRows = parsedCsvData?.data?.length;
  // dataSubset = parsedCsvData?.data?.slice(
  //   0,
  //   returnAmount || DEFAULT_RETURN_AMOUNT
  // );
  // if (!dataSubset || !totalRows) {
  //   return returnErrorResponse("Error fetching data");
  // }

  // return NextResponse.json({
  //   data: dataSubset,
  //   totalRows: totalRows,
  // });

  // for debugging. Exmaple Native Node
  // http
  //   .get(url, (res) => {
  //     res.on("data", (chunk) => {
  //       debugger;
  //     });

  //     res.on("end", () => {
  //       debugger;
  //     });
  //   })
  //   .on("error", (err) => {
  //     debugger;
  //     console.log("Error: ", err.message);
  //   });
  // }
}
