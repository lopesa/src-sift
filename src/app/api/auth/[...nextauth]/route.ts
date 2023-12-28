import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-options";

// see discussion here: https://github.com/nextauthjs/next-auth/issues/8125
// @ts-ignore
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
