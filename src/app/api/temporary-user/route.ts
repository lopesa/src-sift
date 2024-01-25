import { NextRequest, NextResponse } from "next/server";

import { TemporaryUsersRecord, getXataClient } from "@/xata";
import { z } from "zod";
import { SelectableColumn } from "@xata.io/client";
import { DeleteTemporaryUserBodySchema } from "@/lib/types";

const xata = getXataClient();

export async function POST(req: NextRequest, res: NextResponse) {
  const tempUser = await xata.db.temporary_users.create({}).catch((e) => {
    return undefined;
  });

  if (!tempUser) {
    return NextResponse.json({
      error: "Error creating temporary user",
    });
  }

  return NextResponse.json(tempUser.toSerializable());
}

/**
 * DELETE a temporary user record
 *
 * @param req DeleteUserResourceBodySchema
 * @param res
 * @returns the deleted record(s)
 */

export async function DELETE(req: NextRequest, res: NextResponse) {
  const body = DeleteTemporaryUserBodySchema.safeParse(await req.json());

  if (!body.success) {
    return NextResponse.json(
      { error: "Invalid body" },
      {
        status: 400,
      }
    );
  }

  const xata = getXataClient();

  const deletedRecord = await xata.db.temporary_users
    .delete(body.data as SelectableColumn<TemporaryUsersRecord, []>)
    .catch((e) => e);

  if (!deletedRecord) {
    return NextResponse.json({
      error: "Error deleting temporary user",
    });
  }

  return NextResponse.json({ data: deletedRecord?.toSerializable() });
}

// export async function DELETE(req: NextRequest, res: NextResponse) {
//   debugger;
//   const requestBody = await req.json().catch((error) => {
//     return NextResponse.json({
//       error: "Invalid request body",
//     });
//   });

//   const { userId } = requestBody;

//   const deleted = await xata.db.temporary_users.delete(userId).catch((e) => {
//     return null;
//   });

//   if (!deleted) {
//     return NextResponse.json({
//       error: "Error deleting temporary user",
//     });
//   }

//   return NextResponse.json(deleted.toSerializable());
// }
