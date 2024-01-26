import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav";
import NextAuthProvider from "@/context/nextAuthProvider";
import TemporaryUserProvider from "@/context/temporaryUserProvider";
import SavedUserItemsProvider from "@/context/savedUserItemsProvider";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Src Sift",
  description: "Browse Easily. Preview. Save. Ask AI.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* <!-- Google tag (gtag.js) --> */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-V9J9266ML6"
        ></Script>
        <Script id="google-analytics">
          {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-V9J9266ML6');`}
        </Script>
      </head>
      <body
        className={`${inter.className} flex relative flex-col items-center justify-center`}
      >
        <NextAuthProvider>
          <TemporaryUserProvider>
            <SavedUserItemsProvider>
              <Nav />
              {children}
            </SavedUserItemsProvider>
          </TemporaryUserProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
