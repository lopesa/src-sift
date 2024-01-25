"usae client";

import { SaveIcon } from "lucide-react";
import { SavedUserItemsContext } from "@/context/savedUserItemsProvider";
import { cn } from "@/lib/utils";
import { useContext, useEffect, useState } from "react";
import { DistributionItem } from "@/xata";
import { useLocalStorage } from "usehooks-ts";
import ControlledAlertDialog from "./controlled-alert-dialog";
import { signIn, useSession } from "next-auth/react";

export type SaveIconProps = {
  resourceId: string;
  distributionItem?: DistributionItem;
  className?: string;
};

const SaveIconComponent = ({
  resourceId,
  distributionItem,
  className,
}: SaveIconProps) => {
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [accountAlertOpen, setAccountAlertOpen] = useState(false);
  const { data: session, status } = useSession();
  const [hasSeenAccountAlert, setHasSeenAccountAlert] = useLocalStorage(
    "hasSeenAccountAlert",
    false
  );

  const { toggleItemIsSaved, getItemIsSavedForUser } = useContext(
    SavedUserItemsContext
  );

  const doToggleSave = async () => {
    // preemptive
    setIsSaved(!isSaved);

    const saveSuccess = await toggleItemIsSaved(resourceId, distributionItem);

    if (!saveSuccess) {
      const isSavedRemotely = await getItemIsSavedForUser(
        resourceId,
        distributionItem
      );
      setIsSaved(!!isSavedRemotely);
    }
  };

  useEffect(() => {
    const getIsSaved = async () => {
      const isSaved = await getItemIsSavedForUser(resourceId, distributionItem);
      setIsSaved(!!isSaved);
    };
    getIsSaved();
  }, [setIsSaved, getItemIsSavedForUser, resourceId, distributionItem]);

  const onClickSave = async (e: React.MouseEvent<SVGElement>) => {
    if (isSaving) return;
    setIsSaving(true);

    e.preventDefault();

    if (status === "unauthenticated" && !hasSeenAccountAlert) {
      setHasSeenAccountAlert(true);
      setAccountAlertOpen(true);
    }

    doToggleSave();
    setIsSaving(false);
  };

  return (
    <>
      <ControlledAlertDialog
        title="Create a Free Account to Save Your Siftings!"
        description="New users can immediately save their findings based on a temporary account, but it&rsquo;s tied to your browser&rsquo;s localstorage, and that makes them easy to lose. Anyway, all temp users will be deleted after one week. If you want to save your findings, please create a free account. Your temporary account&rsquo;s findings will be automatically transferred to your new account."
        open={accountAlertOpen}
        controller={setAccountAlertOpen}
        action={signIn}
      />

      <SaveIcon
        size={16}
        data-item-id={resourceId}
        className={cn(
          isSaved ? "text-emerald-500" : "text-gray-400",
          "cursor-pointer",
          "hover:text-emerald-500",
          className
        )}
        onClick={(e) => {
          onClickSave(e);
        }}
      />
    </>
  );
};

export default SaveIconComponent;
