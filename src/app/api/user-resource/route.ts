import { NextRequest, NextResponse } from "next/server";

import { UserResourceRecord, getXataClient } from "@/xata";
import {
  EditableData,
  Identifiable,
  JSONData,
  SelectableColumn,
} from "@xata.io/client";
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
 * or multiple user resource records
 * @param req
 * @param res
 * @returns the created record
 */
const createUserResourceParams = z.object({
  resourceId: z.string(),
  userId: z.string(),
  distributionItemId: z.string().optional(),
  tempUser: z.boolean().optional(),
});
const createUserResourcesParams = z.object({
  userId: z.string(),
  tempUser: z.boolean().optional(),
  resources: z.array(
    z.object({
      resourceId: z.string(),
      distributionItemId: z.string().optional(),
    })
  ),
});
export const UserResourcePostBodySchema = z.union([
  createUserResourceParams,
  createUserResourcesParams,
]);

export async function POST(req: NextRequest, res: NextResponse) {
  const body = UserResourcePostBodySchema.safeParse(await req.json());

  if (!body.success) {
    return NextResponse.json(
      { error: "Invalid body" },
      {
        status: 400,
      }
    );
  }

  // debugger;

  const xata = getXataClient();

  let recordData, multipleRecordData;

  const singleData = createUserResourceParams.safeParse(body.data);
  const multipleData = createUserResourcesParams.safeParse(body.data);

  if (singleData.success) {
    const { resourceId, distributionItemId, userId, tempUser } =
      singleData.data;

    // @TODO: better type to require user or temp_user, but not both
    recordData = buildCreateRecordParams(
      userId,
      !!tempUser,
      resourceId,
      distributionItemId
    );
  } else if (multipleData.success) {
    const { resources, userId, tempUser } = multipleData.data;

    multipleRecordData = resources.map(({ resourceId, distributionItemId }) => {
      return buildCreateRecordParams(
        userId,
        !!tempUser,
        resourceId,
        distributionItemId
      );
    });
  }

  const recordsToInsert = recordData ? recordData : multipleRecordData;

  if (!recordsToInsert) {
    return NextResponse.json(
      { error: "Invalid body" },
      {
        status: 400,
      }
    );
  }

  const reply = await xata.db.user_resource
    .create(
      recordsToInsert as (Omit<EditableData<UserResourceRecord>, "id"> &
        Partial<Identifiable>)[]
    )
    .catch((e) => {
      console.error(e);
    });

  if (!reply) {
    return NextResponse.json({
      error: "Error creating record",
    });
  }

  return NextResponse.json({
    data: JSON.parse(JSON.stringify(reply)),
  });
}

/**
 * DELETE a user_resource record
 * or multiple user_resource records
 *
 * @param req DeleteUserResourceBodySchema
 * @param res
 * @returns the deleted record(s)
 */
export const DeleteUserResourceBodySchema = z.union([
  z.string(),
  z.array(z.string()),
]);

export async function DELETE(req: NextRequest, res: NextResponse) {
  const body = DeleteUserResourceBodySchema.safeParse(await req.json());

  if (!body.success) {
    return NextResponse.json(
      { error: "Invalid body" },
      {
        status: 400,
      }
    );
  }

  const xata = getXataClient();

  const deletedRecord = await xata.db.user_resource
    .delete(body.data as SelectableColumn<UserResourceRecord, []>)
    .catch((e) => undefined);

  return NextResponse.json(deletedRecord?.toSerializable());
}

/**
 * HELPERS
 */
const buildCreateRecordParams = (
  userId: string,
  tempUser: boolean,
  resourceId: string,
  distributionItemId?: string
) => {
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

  return recordData;
};
