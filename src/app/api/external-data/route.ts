import { getFileExtension } from "@/lib/utils/data";
import { NextRequest, NextResponse } from "next/server";
import validator from "validator";
import PapaParse from "papaparse";
import http from "http";
import https from "https";
import fs, { WriteStream, promises } from "fs";
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
  if (
    fileExtension === -1 ||
    (!fileExtension.includes("csv") &&
      !fileExtension.includes("xls") &&
      !fileExtension.includes("json"))
  ) {
    return returnErrorResponse(`Invalid file type, got: ${fileExtension}`);
  }

  // function streamToString(stream: http.IncomingMessage) {
  //   const chunks: any[] = [];
  //   return new Promise((resolve, reject) => {
  //     debugger;
  //     stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
  //     stream.on("error", (err) => reject(err));
  //     stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  //   });
  // }

  if (true) {
    // const request = https.get(url, function (response) {
    //   response.pipe(file);
    // });
    // const requestedFileStream: fs.WriteStream = await new Promise((resolve) => {
    const response = await fetch(url).catch((e) => {
      // debugger;
    });

    if (!response?.ok) {
      return returnErrorResponse("Error fetching data");
      // debugger;
    }

    const jsonData = await response?.json().catch((e) => {
      // debugger;
    });
    // debugger;
    // const requestedFileStream = await new Promise((resolve) => {
    //   const file = fs.createWriteStream("/tmp/data.csv");
    //   https
    //     .get(url, async (response) => {
    //       debugger;
    //       // const string = await streamToString(response);
    //       // debugger;
    //       // return string;

    //       response.pipe(file);
    //       file.on("finish", async () => {
    //         file.close();
    //         // debugger;

    //         resolve(file);
    //       });
    //     })
    //     .on("error", (err) => {
    //       debugger;
    //       fs.unlink(url, () => {}); // Delete the file on error
    //       console.error(`Error downloading file: ${err.message}`);
    //     });
    // });

    // debugger;

    // let fileContent = await fs.promises.readFile("/tmp/data.csv").catch((e) => {
    //   debugger;
    // });

    // // const test = fileContent ? new Uint8Array(fileContent) : [];

    // debugger;

    // const test = await streamToString(requestedFileStream as WriteStream).catch(
    //   (e) => {
    //     debugger;
    //   }
    // );

    // debugger;

    // let fileContentArray = fileContent ? fileContent : [];
    // let fileContentArray = fileContent ? fileContent.toJSON() : [];
    // let fileContentArray = fileContent ? new Uint8Array(fileContent) : [];

    // debugger;
    // let requestedFileStreamString;
    // if (requestedFileStream) {
    //   debugger;
    //   // requestedFileStreamString = await streamToString(requestedFileStream);
    // }
    // debugger;
    return NextResponse.json({
      data: jsonData,
      // fileContent
      //   ? {
      //       data: fileContent.toJSON().data,
      //     }
      //   : {
      //       error: "Error fetching data",
      //     }
    });
  }

  /**
  // @TODO: check how large the file is before starting to download
  // implement a max size to try to download

  // @TODO: all http (not s) requests are failing
  // now the headers seem not necessary
  const response = await fetch(url, {
    method: "GET",
    // headers: {
    //   "Content-Type": "text/csv",
    //   "Accept-Encoding": "gzip, deflate, br",
    //   Origin: "http://localhost:3001",
    //   // Accept: "text/csv",
    // },
    // mode: "no-cors",
  }).catch((e) => {
    // const proxiedRequestUrl = `http://proxy:8080/${url}`;
    // const proxiedRequestUrl = `http://localhost:8080/${url}`;
    // const response = await fetch(proxiedRequestUrl).catch((e) => {
    // debugger;
  });

  if (!response?.ok) {
    return returnErrorResponse("Error fetching data");
  }

  if (fileExtension === "json") {
    const data = await response.json();
    return NextResponse.json({
      data,
      totalRows: data.length,
    });
  }

  let data;
  let totalRows;
  let dataSubset;
  let parsedCsvData: PapaParse.ParseResult<string[]> | undefined;

  if (fileExtension.includes("csv")) {
    data = await response.text();

    parsedCsvData = PapaParse.parse(data);

    const testSlice = parsedCsvData.data.slice(0, 5);
    const testSliceString = testSlice.join("\r\n");

    // var stream = ss.createStream();
    // stream.write(buffer);
    // debugger;
    // const buffer = Buffer.from(data);
    const blob = new Blob([testSliceString], { type: "text/csv" });

    // debugger;

    // const vizSuggestions = await getVisualizationSuggestions(blob);

    // parsedCsvData = PapaParse.parse(data);
    // const vizSuggestions = await getVisualizationSuggestions(
    //   parsedCsvData.data.join("\r\n")
    // );

    // this point should be the clean csv document
    // debugger;

    totalRows = parsedCsvData?.data?.length;
    dataSubset = parsedCsvData?.data?.slice(
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
  }
  */
}
