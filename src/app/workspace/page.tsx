import { UserResourcesRecord, getXataClient } from "@/xata";
import { Metadata } from "next";
import { getServerSession, AuthOptions, Session } from "next-auth";
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
      .filter({ "user.id": persistentUserId })
      .getAll({ consistency: "eventual" })
      // .getMany({ consistency: "eventual" })
      // .getPaginated({ pagination: {
      //   size: 100, offset: 0 }
      // })
      .catch((err) => {
        // throw err;
      });
  }

  // if (!data?.length) {
  //   throw new Error("Problem getting data");
  // }

  // const serializedData = data.toSerializable();
  const serializedData = JSON.parse(JSON.stringify(resouceData));

  // if (session?.user?.email) {
  //   const user = await xata.db.nextauth_users    user.findUnique({
  //     where: { email: session.user.email },
  //   });
  // }

  // debugger;

  // if (!session) {
  //   throw new Error("Problem getting session");
  // }

  // let data = await xata.db.user_resources
  //   // let data = await xata.db.resource_item
  //   // .select(["title", "description"])
  //   // .filter({ "source.id": dataSourceID })
  //   // .getAll({ consistency: "eventual" })
  //   // // .getMany({ consistency: "eventual" })
  //   // // .getPaginated({ pagination: {
  //   // //   size: 100, offset: 0 }
  //   // // })
  //   .catch((err) => {
  //     throw err;
  //   });

  return (
    <main className="flex w-6/12 flex-col items-center p-4">
      <WorkspaceComponent dataItems={serializedData} />
      {/* <h1 className="text-2xl">Workspace</h1> */}
      {!session && (
        <Button>
          <Link href="/api/auth/signin">Sign In</Link>
        </Button>
      )}
    </main>
  );
};

export default Workspace;
