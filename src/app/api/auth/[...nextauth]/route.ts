import NextAuth, { NextAuthOptions } from "next-auth";
import { XataAdapter } from "@next-auth/xata-adapter";
import GithubProvider from "next-auth/providers/github";
import { XataClient } from "@/xata";
import { SendVerificationRequestParams } from "next-auth/providers/email";

const client = new XataClient();

// export const authOptions: NextAuthOptions = {
export const authOptions = {
  adapter: XataAdapter(client),
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GH_CLIENT_ID || "",
      clientSecret: process.env.GH_CLIENT_SECRET || "",
    }),
    {
      id: "sendgrid",
      type: "email",
      async sendVerificationRequest({
        identifier: email,
        url,
      }: SendVerificationRequestParams) {
        // Call the cloud Email provider API for sending emails
        // See https://docs.sendgrid.com/api-reference/mail-send/mail-send
        const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
          // The body format will vary depending on provider, please see their documentation
          // for further details.
          body: JSON.stringify({
            personalizations: [{ to: [{ email }] }],
            from: { email: "loginToResourceExplorer@em1579.teamtedtile.com" },
            subject: "Sign in to Resource Explorer",
            content: [
              {
                type: "text/plain",
                value: `Please click here to authenticate - ${url}`,
              },
            ],
          }),
          headers: {
            // Authentication will also vary from provider to provider, please see their docs.
            Authorization: `Bearer ${process.env.SENDGRID_API}`,
            "Content-Type": "application/json",
          },
          method: "POST",
        });

        if (!response.ok) {
          const { errors } = await response.json();
          throw new Error(JSON.stringify(errors));
        }
      },
    },
  ],
};

// see discussion here: https://github.com/nextauthjs/next-auth/issues/8125
// @ts-ignore
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
