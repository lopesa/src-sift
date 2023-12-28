import { NextRequest, NextResponse } from "next/server";

import { getXataClient } from "@/xata";

const xata = getXataClient();

export async function GET(req: NextRequest, res: NextResponse) {
  const params = req.nextUrl.searchParams;
  const userId = params.get("userId");
  const temporary = params.get("temporary");

  if (!userId) {
    return NextResponse.json({
      error: "Invalid request body",
    });
  }

  const filter = !!temporary
    ? { "temp_user.id": userId }
    : { "user.id": userId };

  const xata = getXataClient();
  let data = await xata.db.user_resources
    .filter(filter)
    .getAll({ consistency: "eventual" })
    .catch((err) => {
      throw err;
    });

  if (!data) {
    return NextResponse.json({
      error: "Error fetching data",
    });
  }

  return NextResponse.json({
    data: JSON.parse(JSON.stringify(data)),
  });
}
