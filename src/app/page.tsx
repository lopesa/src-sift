"use client";

import IndexDataList from "@/components/IndexDataList";
import AiChat from "@/components/ai-chat";
import Search from "@/components/search";
import { Button } from "@/components/ui/button";
import { SearchResults } from "@/lib/types";
import Link from "next/link";
import { useState } from "react";
import SkewLoader from "react-spinners/SkewLoader";

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
    <main className="flex w-full min-h-screen flex-col items-center p-24">
      {/* SEARCH */}
      <div className="w-60">
        <Search
          label="Search all resources"
          className="mb-8"
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
      </div>

      {/* SEARCH RESULTS */}
      {searchLoading && (
        <SkewLoader
          loading={true}
          className="mt-1 mb-4"
          color="#38bdf8"
          size={14}
        />
      )}
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

      {/* AI CHAT */}
      <div className="w-60">
        <AiChat label="Chat with Ai Over All Resources" className="mb-8" />
      </div>

      {/* BROWSE RESOURCES */}
      <div className="mx-auto my-0">
        <h1 className="text-xl mb-1">Browse a Resource:</h1>
        <Link href="/resource-page/us-department-of-agriculture">
          <Button variant="link" className="text-base">
            US Department of Agriculture
          </Button>
        </Link>
      </div>
    </main>
  );
}
