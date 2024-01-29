import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const headers = request?.headers;
  const host = headers?.get("host");
  if (
    process.env.NODE_ENV !== "development" &&
    host !== "srcsift.io" &&
    host !== "www.srcsift.io"
  ) {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/api/chatgpt",
};
