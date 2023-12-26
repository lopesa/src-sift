import { NextRequest, NextResponse } from "next/server";

import { getXataClient } from "@/xata";

const xata = getXataClient();

export async function GET(req: NextRequest, res: NextResponse) {
  const params = req.nextUrl.searchParams;
  const id = params.get("id");

  if (!id) {
    return NextResponse.json({
      error: "Invalid request body",
    });
  }

  const xata = getXataClient();
  let data = await xata.db.resource_item
    .filter({ id })
    .getFirst({ consistency: "eventual" })
    .catch((err) => {
      throw err;
    });

  if (!data) {
    return NextResponse.json({
      error: "Error fetching data",
    });
  }

  return NextResponse.json({
    data: data.toSerializable(),
  });
}
