import { NextRequest, NextResponse } from "next/server";
import { getXataClient } from "@/xata";
import { getOrCreateDataSourceEntry } from "@/lib/utils/data";

export async function POST(req: NextRequest, res: NextResponse) {
  const xata = getXataClient();

  const requestBody = await req.json().catch((error) => {
    return NextResponse.json({
      error: "Invalid request body",
    });
  });

  const { source } = requestBody;

  const dataSourceEntry = await getOrCreateDataSourceEntry(source).catch(
    (e) => {
      return undefined;
    }
  );
  const dataSourceID = dataSourceEntry?.id;

  if (!dataSourceID) {
    return NextResponse.json({
      error: "Error with data source",
    });
  }

  let data = await xata.db.resource_item
    .filter({ "source.id": dataSourceID })
    .getAll({ consistency: "eventual" })
    .catch((e) => {
      return undefined;
    });

  if (!data?.length) {
    return NextResponse.json({
      error: "No data found",
    });
  }

  // delete all data in the resource_item table
  const mappedToDelete = data.reduce((acc: any, cur: any) => {
    return [...acc, cur.id];
  }, []);

  const deleted = await xata.db.resource_item
    .delete(mappedToDelete)
    .catch((e) => {
      return undefined;
    });

  return deleted?.length
    ? NextResponse.json({
        success: "deleted records",
      })
    : NextResponse.json({
        error: "Error deleting data",
      });
}
