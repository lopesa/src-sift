import { NextRequest, NextResponse } from "next/server";

import { UserResourceRecord, getXataClient } from "@/xata";
import { JSONData } from "@xata.io/client";
import { z } from "zod";

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
export async function GET(req: Request, res: NextResponse) {
  // const params = req.nextUrl.searchParams;
  const { searchParams } = new URL(req.url);

  const userId = searchParams.get("userId");
  const tempUser = searchParams.get("tempUser");
  // will need these for the TODO above
  // const resourceId = searchParams.get("resourceId");
  // const distributionItemId = searchParams.get("distributionItemId");
  const getFullResourceItem = searchParams.get("getFullResourceItem");

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
    .getAll({ consistency: "eventual" });
  // .catch((e) => e);

  return NextResponse.json({
    data: JSON.parse(JSON.stringify(data)),
  });
}

/**
 * create a user resource record
 * @param req
 * @param res
 * @returns the created record
 */
export const createUserResourceParams = z.object({
  resourceId: z.string(),
  userId: z.string(),
  distributionItemId: z.string().optional(),
  tempUser: z.boolean().optional(),
});
const POSTBodySchema = z.union([
  createUserResourceParams,
  z.array(createUserResourceParams),
]);

export async function POST(req: NextRequest, res: NextResponse) {
  const body = POSTBodySchema.safeParse(await req.json());

  if (!body.success) {
    return NextResponse.json(
      { error: "Invalid body" },
      {
        status: 400,
      }
    );
  }

  // single
  const single = createUserResourceParams.safeParse(body.data);

  if (single.success) {
    const { resourceId, distributionItemId, userId, tempUser } = single.data;

    // @TODO: better type to require user or temp_user, but not both
    const recordData: {
      resource: string;
      distribution_item?: string;
      user?: string;
      temp_user?: string;
    } = { resource: resourceId };

    if (distributionItemId) {
      recordData.distribution_item = distributionItemId;
    }

    if (tempUser) {
      recordData.temp_user = userId;
    } else {
      recordData.user = userId;
    }

    const xata = getXataClient();
    // const record = await xata.db.user_resource.create(recordData).catch((e) => e);
    const record = await xata.db.user_resource.create(recordData).catch((e) => {
      console.error(e);
    });

    if (!record) {
      return NextResponse.json({
        error: "Error creating record",
      });
    }

    return NextResponse.json({
      data: record.toSerializable(),
    });
  } else {
    return NextResponse.json({
      error: "Only enabled for single right now",
    });
  }
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
