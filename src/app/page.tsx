"use client";

import IndexDataList from "@/components/IndexDataList";
import Search from "@/components/search";
import SiftLoader from "@/components/sift-loader";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DataSourceMetadataRecord } from "@/lib/const";
import { SearchResults } from "@/lib/types";
import { ResourceItemRecord } from "@/xata";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [searchResults, setSearchResults] = useState<SearchResults | null>(
    null
  );
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<Error | null>(null);
  const onSearchSuccess = (data: SearchResults) => {
    setSearchResults(data);
  };
  return (
    <main className="flex w-full min-h-screen flex-col items-center p-14">
      {/* INTRO */}
      <h2 className="text-4xl mt-14 text-cyan-800">Src Sift</h2>
      <h2 className="text-2xl text-center mt-2 mb-12 text-cyan-800 font-light">
        Browse Easily. Preview. Save. Ask AI.
      </h2>
      <SiftLoader className="mb-6 mx-auto w-14 h-14" active={false} />

      {/* BROWSE RESOURCES */}
      <h1 className="text-xl text-cyan-800 font-bold mb-4">
        Browse a Source Provider
      </h1>
      {Object.values(DataSourceMetadataRecord).map((record) => {
        return (
          <Button
            asChild
            variant="hoveredGhost"
            key={record.displayName}
            className="text-slate-700 min-w-80 my-1"
          >
            <Link href={`/resource-page/${record.route}`}>
              {record.displayName}
            </Link>
          </Button>
        );
      })}

      {/* <Separator className="my-10" /> */}
      {/* <SiftLoader className="mt-14 mb-6 mx-auto w-14 h-14" active={false} /> */}

      {/* SEARCH */}
      <h1 className="text-xl font-bold text-cyan-800 mb-4 mt-24">
        Search All Source Providers
      </h1>
      <Search
        className="w-72"
        onSearchLoading={() => {
          setSearchLoading(true);
        }}
        onSearchFail={() => {
          setSearchLoading(false);
          setSearchError(new Error("Search failed"));
        }}
        onSearchSuccess={(data) => {
          setSearchLoading(false);
          onSearchSuccess(data);
        }}
      />

      {/* SEARCH RESULTS */}
      {searchLoading && <SiftLoader className="mt-10 mb-4 mx-auto" />}
      {searchError && <p>Error: {searchError.message}</p>}
      {searchResults?.results?.records && (
        <>
          <Button
            variant="link"
            className="text-xs underline mb-2"
            onClick={() => {
              setSearchResults(null);
            }}
          >
            Clear Search
          </Button>
          <IndexDataList
            data={searchResults?.results?.records as ResourceItemRecord[]}
            title="Search Results"
          />
        </>
      )}

      <div className="grow flex flex-col justify-end">
        <Link href="/about" className="text-xs underline pt-14">
          about
        </Link>
      </div>
    </main>
  );
}
