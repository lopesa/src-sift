"use client";
import SiftIcon from "@/components/siftIcon";
import SkewLoader from "react-spinners/SkewLoader";
export default function Loading() {
  return (
    <div className="flex justify-center items-start h-screen h-[calc(100vh-3.5rem)]">
      {/* <SkewLoader loading={true} className="mt-24" color="#38bdf8" /> */}
      <SiftIcon className="mt-10 mb-4 mx-auto" />
    </div>
  );
}
