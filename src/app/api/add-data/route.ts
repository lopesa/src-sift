import { DataSources } from "@/lib/const";
import {
  fetchNewData,
  mapFetchedDataToSchema,
  parseArrayToCsv,
} from "@/lib/utils/data";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  const requestBody = await req.json().catch((error) => {
    return NextResponse.json({
      error: "Invalid request body",
    });
  });

  const { source } = requestBody;

  if (!Object.values(DataSources).includes(source?.toUpperCase())) {
    return NextResponse.json({
      error: "Invalid source",
    });
  }

  const jsonData = await fetchNewData(source).catch((error) => {
    return NextResponse.json({
      error: "Error fetching data from source",
    });
  });

  const mappedData = mapFetchedDataToSchema(jsonData?.dataset, source);

  if (!mappedData) {
    return NextResponse.json({
      error: "Error mapping data",
    });
  }

  debugger;

  // const csv = parseArrayToCsv(mappedData);
  // debugger;

  return NextResponse.json({
    // result,
    cats: "meow",
  });
}
