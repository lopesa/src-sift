import { Metadata } from "next";
import WorkspaceComponent from "@/components/workspace";

export const metadata: Metadata = {
  title: "Src Sift",
  description: "Browse Intuitively. Preview. Save. Ask AI.",
};

const Workspace = async () => {
  return (
    <main className="flex flex-col items-center p-4 w-full max-w-[1200px]">
      <WorkspaceComponent />
    </main>
  );
};

export default Workspace;
