import { NextRequest, NextResponse } from "next/server";

import { UserResourceRecord, getXataClient } from "@/xata";
import { JSONData } from "@xata.io/client";

export type UserResourceAPIRequestBody = Promise<
  | NextResponse<{
      error: string;
    }>
  | NextResponse<JSONData<UserResourceRecord> | undefined>
>;

/**
 * GET all user_resource records for a user
 * @TODO: if passed parameter, get one user_resource record
 *
 * @param req
 * @param res
 * @returns the user_resource records
 */
export async function GET(req: NextRequest, res: NextResponse) {
  const params = req.nextUrl.searchParams;

  const userId = params.get("userId");
  const tempUser = params.get("tempUser");
  const resourceId = params.get("resourceId");
  const distributionItemId = params.get("distributionItemId");
  const getFullResourceItem = params.get("getFullResourceItem");

  if (!userId) {
    return NextResponse.json({
      error: "Invalid request body",
    });
  }

  const filter =
    tempUser === "true" ? { "temp_user.id": userId } : { "user.id": userId };

  const xata = getXataClient();
  const data = await xata.db.user_resource
    .select(
      getFullResourceItem ? ["*", "resource.*", "distribution_item.*"] : ["*"]
    )
    .filter(filter)
    .getAll({ consistency: "eventual" })
    .catch((e) => undefined);

  return NextResponse.json(JSON.parse(JSON.stringify(data)));
}

/**
 * create a user resource record
 * @param req
 * @param res
 * @returns the created record
 */
export async function POST(req: NextRequest, res: NextResponse) {
  const requestBody = await req.json().catch((error) => {
    return NextResponse.json({
      error: "Invalid request body",
    });
  });

  const { resourceId, distributionItemId, userId, tempUser } = requestBody;

  if ((!distributionItemId && !resourceId) || !userId) {
    return NextResponse.json({
      error: "Invalid request body",
    });
  }

  const recordData: {
    resource?: string;
    distribution_item?: string;
    user?: string;
    temp_user?: string;
  } = {};

  if (distributionItemId) {
    recordData.distribution_item = distributionItemId;
  }

  if (!distributionItemId && resourceId) {
    recordData.resource = resourceId;
  }

  if (tempUser) {
    recordData.temp_user = userId;
  } else {
    recordData.user = userId;
  }

  const xata = getXataClient();
  const record = await xata.db.user_resource.create(recordData).catch((e) => {
    return undefined;
  });

  return NextResponse.json(record?.toSerializable());
}

/**
 * DELETE a user_resource record
 *
 * @param req
 * @param res
 * @returns the deleted record
 */
export async function DELETE(req: NextRequest, res: NextResponse) {
  const requestBody = await req.json().catch((error) => {
    return NextResponse.json({
      error: "Invalid request body",
    });
  });

  const { resourceId, distributionItemId, userId, tempUser } = requestBody;

  if (!userId || (!distributionItemId && !resourceId)) {
    return NextResponse.json({
      error: "Invalid request body",
    });
  }

  const filter: {
    "user.id"?: string;
    "temp_user.id"?: string;
    "resource.id"?: string;
    "distribution_item.id"?: string;
  } = !!tempUser ? { "temp_user.id": userId } : { "user.id": userId };

  if (distributionItemId) {
    filter["distribution_item.id"] = distributionItemId;
  } else if (resourceId) {
    filter["resource.id"] = resourceId;
  }

  const xata = getXataClient();
  const recordToDelete = await xata.db.user_resource
    .filter(filter)
    .getFirst({ consistency: "eventual" })
    .catch((e) => undefined);

  if (!recordToDelete) {
    return NextResponse.json({
      error: "No record found",
    });
  }

  const deletedRecord = await xata.db.user_resource
    .delete(recordToDelete.id)
    .catch((e) => undefined);

  return NextResponse.json(deletedRecord?.toSerializable());
}
