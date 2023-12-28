import { NextRequest, NextResponse } from "next/server";

import { getXataClient } from "@/xata";

// const xata = getXataClient();

export async function POST(req: NextRequest, res: NextResponse) {
  const requestBody = await req.json().catch((error) => {
    return NextResponse.json({
      error: "Invalid request body",
    });
  });

  const { resourceId, userId, tempUser } = requestBody;

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
  const record = await xata.db.user_resources.create(recordData).catch((e) => {
    return undefined;
  });

  return NextResponse.json(record?.toSerializable());
}

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
  const recordToDelete = await xata.db.user_resources
    .filter(filter)
    .getFirst()
    .catch((e) => undefined);

  if (!recordToDelete) {
    return NextResponse.json({
      error: "No record found",
    });
  }

  const deletedRecord = await xata.db.user_resources
    .delete(recordToDelete.id)
    .catch((e) => undefined);

  return NextResponse.json(deletedRecord?.toSerializable());
  // const deletedUserResource = await xata.db.user_resources.deleteOne
}
