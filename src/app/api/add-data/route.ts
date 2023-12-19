import { DataSources } from "@/lib/const";
import {
  fetchNewData,
  mapFetchedDataToSchema,
  parseArrayToCsv,
} from "@/lib/utils/data";
import { NextRequest, NextResponse } from "next/server";

import { ResourceItemRecord, getXataClient } from "@/xata";
import { SelectedPick, SelectableColumn, EditableData } from "@xata.io/client";
import { ResourceSourceUpdatesRecord } from "@/xata";

import { diff_hours } from "@/lib/utils";

const xata = getXataClient();
// const DataSourceRefreshTime = 336; // in hours (2 weeks)

// const fields: SelectableColumn<ResourceSourceUpdatesRecord>[] = [
//   "xata.updatedAt",
// ];
// type ResourceLastUpdatedRecord = SelectedPick<
//   ResourceSourceUpdatesRecord,
//   typeof fields
// >;

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

  let dataSourceEntry = await xata.db.resource_source
    .filter({ name: source })
    .getFirst();

  debugger;

  if (!dataSourceEntry) {
    dataSourceEntry = await xata.db.resource_source.create({
      name: source,
    });
  }

  if (!dataSourceEntry) {
    return NextResponse.json({
      error: "Error with data source",
    });
  }

  let data = await xata.db.resource_item.getAll();

  if (data && data.length) {
    return NextResponse.json({
      data,
    });
  }

  // delete all data in the resource_item table
  // if (data) {
  //   const mappedToDelete = data.reduce((acc: any, cur: any) => {
  //     return [...acc, cur.id];
  //   }, []);
  //   debugger;

  //   const deleted = await xata.db.resource_item.delete(mappedToDelete);

  //   debugger;

  //   return NextResponse.json({
  //     success: "deleted records",
  //   });
  // }

  // debugger;

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

  const insertedData:
    | Readonly<SelectedPick<ResourceItemRecord, ["*"]>>[]
    | Error = await xata.db.resource_item.create(mappedData).catch((e) => {
    return e || new Error("Error fetching data");
  });

  debugger;

  if (insertedData instanceof Error || !insertedData?.length) {
    return NextResponse.json({
      error: "Error inserting data",
    });
  }

  return NextResponse.json({
    data: insertedData,
  });

  // const updates = await xata.db.resource_source_updates
  //   .select(["xata.updatedAt"])
  //   .filter({ "resource_source.id": "dataSourceEntry.id" })
  //   .sort("xata.updatedAt", "desc")
  //   .getMany();

  // if (!updates) { // no updates so first time getting this data ever

  // }

  // debugger;

  // const lastUpdate = updates[0];

  // const hoursSinceLastUpdate =
  //   lastUpdate && diff_hours(new Date(lastUpdate).getTime(), Date.now());
  // const hoursSinceLastUpdate =
  //   dataSourceEntry &&
  //   diff_hours(new Date(dataSourceEntry.xata.updatedAt).getTime(), Date.now());

  // debugger;
  // if (hoursSinceLastUpdate < DataSourceRefreshTime) {
  //   return NextResponse.json({
  //     error: `Data source updated less than ${DataSourceRefreshTime} hours ago`,
  //   });
  // }

  // debugger;

  // add the data source to the datasource table, if it doesn't exist (to get an id for linked tables)

  // add the data to the data table, with the link

  // update the xata.updatedAt field for the data source
}
