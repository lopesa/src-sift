import { NextRequest, NextResponse } from "next/server";

import { UserResourceRecord, getXataClient } from "@/xata";
import { JSONData } from "@xata.io/client";

export type UserResourceAPIRequestBody = Promise<
  | NextResponse<{
      error: string;
    }>
  | NextResponse<JSONData<UserResourceRecord> | undefined>
>;

export async function GET(req: NextRequest, res: NextResponse) {
  const params = req.nextUrl.searchParams;

  const userId = params.get("userId");
  const tempUser = params.get("temporary");
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
    .select(getFullResourceItem ? ["*", "resource.*"] : ["*"])
    .filter(filter)
    .getAll()
    .catch((e) => undefined);

  return NextResponse.json(JSON.parse(JSON.stringify(data)));
}

export async function POST(req: NextRequest, res: NextResponse) {
  const requestBody = await req.json().catch((error) => {
    return NextResponse.json({
      error: "Invalid request body",
    });
  });

  const { resourceId, distributionItem, userId, tempUser } = requestBody;

  if (distributionItem) {
    return NextResponse.json({
      message: "TO DO: special treatment for a distribution item",
    });
  }

  const recordData: {
    resource: string;
    user?: string;
    temp_user?: string;
  } = {
    resource: resourceId,
  };
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
 * DELETE a resource_item or a distribution_item
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

  const { resourceId, userId, tempUser } = requestBody;

  const filter = !!tempUser
    ? { "temp_user.id": userId, "resource.id": resourceId }
    : { "user.id": userId, "resource.id": resourceId };

  const xata = getXataClient();
  const recordToDelete = await xata.db.user_resource
    .filter(filter)
    .getFirst()
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
