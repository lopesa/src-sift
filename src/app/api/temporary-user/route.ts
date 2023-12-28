import { NextRequest, NextResponse } from "next/server";

import { getXataClient } from "@/xata";

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
