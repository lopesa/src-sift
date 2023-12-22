import {
  fetchNewData,
  getOrCreateDataSourceEntry,
  mapFetchedDataToSchema,
} from "@/lib/utils/data";
import { NextRequest, NextResponse } from "next/server";

import { getXataClient } from "@/xata";

const xata = getXataClient();

export async function POST(req: NextRequest, res: NextResponse) {
  const requestBody = await req.json().catch((error) => {
    return NextResponse.json({
      error: "Invalid request body",
    });
  });

  const { source } = requestBody;

  const dataSourceEntry = await getOrCreateDataSourceEntry(source);

  if (!dataSourceEntry) {
    return NextResponse.json({
      error: "Error with data source",
    });
  }

  const jsonData = await fetchNewData(source).catch((error) => {
    return error || new Error("Error fetching data");
  });

  const mappedData = mapFetchedDataToSchema(
    jsonData?.dataset,
    dataSourceEntry.id
  );

  if (!mappedData) {
    return NextResponse.json({
      error: "Error mapping data",
    });
  }

  const insertedData = await xata.db.resource_item
    .create(mappedData)
    .catch((e) => {
      return undefined;
    });

  if (!insertedData?.length) {
    return NextResponse.json({
      error: "Error inserting data",
    });
  }

  return NextResponse.json({
    success: "inserted records",
  });
}
