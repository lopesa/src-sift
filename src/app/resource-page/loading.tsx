"use client";
import SkewLoader from "react-spinners/SkewLoader";
export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  // return <div>Loading...</div>;
  return (
    <div className="flex justify-center items-start h-screen">
      <SkewLoader loading={true} color="gray" className="mt-10" />
    </div>
  );
}
