import { getFileExtension } from "@/lib/utils/data";
import { NextRequest, NextResponse } from "next/server";
import validator from "validator";
import PapaParse from "papaparse";

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
    (!fileExtension.includes("csv") && !fileExtension.includes("xls"))
  ) {
    return returnErrorResponse(`Invalid file type, got: ${fileExtension}`);
  }

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
}
