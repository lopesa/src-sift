"use client";

import IndexDataList from "@/components/IndexDataList";
import Search from "@/components/search";
import { Button } from "@/components/ui/button";
import { SearchResults } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [searchResults, setSearchResults] = useState<SearchResults | null>(
    null
  );
  const onSearchSuccess = (data: SearchResults) => {
    console.log(data);
    debugger;
    setSearchResults(data);
  };
  return (
    <main className="flex w-full min-h-screen flex-col items-center p-24">
      <div className="w-60">
        <Search
          label="Search all resources"
          className="mb-8"
          onSearchSuccess={onSearchSuccess}
        />
      </div>
      {searchResults?.results?.records && (
        <IndexDataList
          data={searchResults?.results?.records}
          title="Search Results"
        />
      )}
      {!searchResults?.results?.records && (
        <>
          <div>or</div>
          <div className="mx-auto my-0">
            <h1 className="text-xl mb-1">Browse a Resource:</h1>
            <Link href="/resource-page/us-department-of-agriculture">
              <Button variant="link" className="text-base">
                US Department of Agriculture
              </Button>
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
