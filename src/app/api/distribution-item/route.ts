import { NextRequest, NextResponse } from "next/server";

import { DistributionItemRecord, getXataClient } from "@/xata";
import { JSONData, SelectedPick } from "@xata.io/client";

const xata = getXataClient();

/**
 * get a SINGLE distribution item
 * either by id or by resource id plus distribution url
 * @param req
 * @param res
 * @returns
 */
export async function GET(
  req: NextRequest,
  res: NextResponse
): Promise<
  | NextResponse<JSONData<DistributionItemRecord>>
  | NextResponse<{ error: string }>
> {
  const params = req.nextUrl.searchParams;

  const id = params.get("id");
  const resourceId = params.get("resourceId");
  const distributionUrl = params.get("distributionUrl");

  const getFilter = () => {
    if (id) {
      return { id };
    }
    if (resourceId && distributionUrl) {
      return {
        resource_item: resourceId,
        $any: [
          { downloadURL: distributionUrl },
          { accessURL: distributionUrl },
        ],
      };
    }
    return false;
  };

  let filter = getFilter();

  if (!filter) {
    return NextResponse.json({
      error: "Invalid request body",
    });
  }

  const xata = getXataClient();
  let data = await xata.db.distribution_item
    .filter(filter)
    .getFirst({ consistency: "eventual" })
    .catch((err) => {
      throw err;
    });

  if (!data) {
    return NextResponse.json({
      error: "Error fetching data",
    });
  }

  return NextResponse.json(data.toSerializable());
}

/**
 * create a new distribution item
 * @param req
 * @param res
 * @returns
 */
export async function POST(
  req: NextRequest,
  res: NextResponse
): Promise<
  | NextResponse<JSONData<DistributionItemRecord>>
  | NextResponse<{ error: string }>
> {
  const requestBody = await req.json().catch((error) => {
    return NextResponse.json({
      error: "Invalid request body",
    });
  });

  const { resourceId, distributionItem } = requestBody;

  if (!resourceId || !distributionItem) {
    return NextResponse.json({
      error: "Invalid request body",
    });
  }

  const xata = getXataClient();
  const { title, downloadURL, accessURL, mediaType, format, description } =
    distributionItem;

  const record = await xata.db.distribution_item
    .create({
      resource_item: resourceId,
      title,
      downloadURL,
      accessURL,
      mediaType,
      format,
      description,
    })
    .catch((e) => {
      return undefined;
    });

  if (!record) {
    return NextResponse.json({
      error: "Error creating record",
    });
  }

  return NextResponse.json(record?.toSerializable());
}

/**
 * delete a distribution item by id
 * @param req
 * @param res
 */
export async function DELETE(req: NextRequest, res: NextResponse) {
  const requestBody = await req.json().catch((error) => {
    return NextResponse.json({
      error: "Invalid request body",
    });
  });

  const { id } = requestBody;

  if (!id) {
    return NextResponse.json({
      error: "Invalid request body",
    });
  }

  const xata = getXataClient();
  const record = await xata.db.distribution_item.delete({ id }).catch((e) => e);

  return NextResponse.json(record?.toSerializable());
}
