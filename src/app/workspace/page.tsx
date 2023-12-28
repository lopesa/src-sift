import { UserResourcesRecord, getXataClient } from "@/xata";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SelectedPick } from "@xata.io/client";
import WorkspaceComponent from "@/components/workspace";
import { SessionWithUserId } from "@/lib/types";

export const metadata: Metadata = {
  title: "Resource Explorer - Workspace",
  description: "Investigate data from multiple sources",
};

const Workspace = async () => {
  let resouceData: void | Readonly<SelectedPick<UserResourcesRecord, ["*"]>>[] =
    [];

  const xata = getXataClient();

  const session: SessionWithUserId | null = await getServerSession(
    authOptions
  ).catch((err) => {
    return null;
  });

  const persistentUserId = session?.user?.id;

  if (persistentUserId) {
    resouceData = await xata.db.user_resources
      .select(["*", "resource.*"])
      .filter({ "user.id": persistentUserId })
      .getAll({ consistency: "eventual" })
      .catch((err) => {
        // throw err;
      });
  }

  const serializedData = JSON.parse(JSON.stringify(resouceData));

  return (
    <main className="flex w-6/12 flex-col items-center p-4">
      <WorkspaceComponent dataItems={serializedData} />
      {!session && (
        <Button>
          <Link href="/api/auth/signin">Sign In</Link>
        </Button>
      )}
    </main>
  );
};

export default Workspace;
