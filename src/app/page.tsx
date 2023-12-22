import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex w-full min-h-screen flex-col items-center justify-between p-24">
      <div className="mx-auto my-0">
        <h1 className="text-xl mb-6">Choose a Resource:</h1>
        <Link href="/resource-page/us-dept-of-agriculture">
          <h3 className="text-base">US Department of Agriculture</h3>
        </Link>
      </div>
    </main>
  );
}
