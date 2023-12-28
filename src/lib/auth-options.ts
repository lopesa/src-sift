import { XataAdapter } from "@next-auth/xata-adapter";
import GithubProvider from "next-auth/providers/github";
import { XataClient } from "@/xata";
import { SendVerificationRequestParams } from "next-auth/providers/email";
import { AuthOptions } from "next-auth";

const client = new XataClient();

export const authOptions: AuthOptions = {
  secret: process.env.NEXT_AUTH_SECRET,
  adapter: XataAdapter(client),
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GH_CLIENT_ID || "",
      clientSecret: process.env.GH_CLIENT_SECRET || "",
    }),
    // see discussion here: https://github.com/nextauthjs/next-auth/issues/8125
    // @ts-ignore
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
  callbacks: {
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token and user id from a provider.
      if (session?.user) {
        // @ts-ignore
        session.user.id = user.id;
      }
      return session;
    },
  },
};
