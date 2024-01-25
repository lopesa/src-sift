"use client";
import SiftLoader from "@/components/sift-loader";
export default function Loading() {
  return (
    <div className="flex justify-center items-start h-screen h-[calc(100vh-3.5rem)]">
      <SiftLoader className="mt-10 mb-4 mx-auto w-14 h-14" />
    </div>
  );
}
