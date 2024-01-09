import { getXataClient } from "@/xata";
import { NextRequest, NextResponse } from "next/server";

/**
 * get all user_resources for a distribution_item
 * @param req
 * @param res
 */
export async function GET(req: NextRequest, res: NextResponse) {
  const params = req.nextUrl.searchParams;
  const distributionItemId = params.get("distributionItemId");

  if (!distributionItemId) {
    return NextResponse.json({
      error: "Invalid request body",
    });
  }

  const xata = getXataClient();
  const data = await xata.db.user_resource
    .filter({ distribution_item: distributionItemId })
    .getAll({ consistency: "eventual" })
    .catch((e) => undefined);

  return NextResponse.json(JSON.parse(JSON.stringify(data)));
}
