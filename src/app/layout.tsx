import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav";
import NextAuthProvider from "@/context/nextAuthProvider";
import TemporaryUserProvider from "@/context/temporaryUserProvider";
import SavedUserItemsProvider from "@/context/savedUserItemsProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Resource Explorer",
  description: "Explore publically available datasets, apis, and more",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
