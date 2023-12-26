import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav";
import NextAuthProvider from "@/context/nextAuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Resource Explorer",
  description: "Explore publically available datasets, apis, and more",
};

export default function RootLayout({
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
          <Nav />
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}
