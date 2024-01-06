"use client";
import SkewLoader from "react-spinners/SkewLoader";
export default function Loading() {
  return (
    <div className="flex justify-center items-start h-screen h-[calc(100vh-3.5rem)]">
      <SkewLoader loading={true} className="mt-24" color="#38bdf8" />
    </div>
  );
}
