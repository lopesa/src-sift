"use client";

import IndexDataList from "@/components/IndexDataList";
import AiChat from "@/components/ai-chat";
import Search from "@/components/search";
import SiftLoader from "@/components/sift-loader";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DataSourceMetadataRecord } from "@/lib/const";
import { SearchResults } from "@/lib/types";
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
      {/* BROWSE RESOURCES */}
      <h1 className="text-xl mb-1 mt-10">Browse a Source Provider:</h1>
      {Object.values(DataSourceMetadataRecord).map((record) => {
        return (
          <Button asChild variant="link" key={record.displayName}>
            <Link href={`/resource-page/${record.route}`}>
              {record.displayName}
            </Link>
          </Button>
        );
      })}

      <Separator className="my-10" />

      {/* SEARCH */}
      <h1 className="text-xl mb-1 mt-10">Search All Source Providers:</h1>
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
            data={searchResults?.results?.records}
            title="Search Results"
          />
        </>
      )}

      {/* for debugging the SiftLoader */}
      {/* <SiftLoader className="mt-10 mb-4 mx-auto" /> */}

      {/* AI CHAT */}
      {/* not seeming terribly feasable even over one resource meta-source (USDA - 2k+ entries) */}
      {/* <h1 className="mb-1 mt-10">Ask AI, Considering All Resources</h1> */}
      {/* <AiChat /> */}
    </main>
  );
}
