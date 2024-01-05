import { NextRequest, NextResponse } from "next/server";

import { getXataClient } from "@/xata";

const xata = getXataClient();

export async function GET(req: NextRequest, res: NextResponse) {
  const params = req.nextUrl.searchParams;
  const searchText = params.get("searchText");

  if (!searchText) {
    return NextResponse.json({
      error: "Invalid request body",
    });
  }

  const xata = getXataClient();

  const results = await xata.db.resource_item
    .search(searchText)
    .catch((err) => {
      throw err;
    });

  if (!results) {
    return NextResponse.json({
      error: "Error getting search results",
    });
  }

  return NextResponse.json({
    results,
  });
}
