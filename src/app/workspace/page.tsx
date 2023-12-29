import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import WorkspaceComponent from "@/components/workspace";
import { SessionWithUserId } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Resource Explorer - Workspace",
  description: "Investigate data from multiple sources",
};

const Workspace = async () => {
  const session: SessionWithUserId | null = await getServerSession(
    authOptions
  ).catch((err) => {
    return null;
  });

  return (
    <main className="flex w-6/12 flex-col items-center p-4">
      <WorkspaceComponent dataItems={[]} />
      {!session && (
        <Button>
          <Link href="/api/auth/signin">Sign In</Link>
        </Button>
      )}
    </main>
  );
};

export default Workspace;
