"usae client";

import { SaveIcon } from "lucide-react";
import { SavedUserItemsContext } from "@/context/savedUserItemsProvider";
import { cn } from "@/lib/utils";
import { useContext, useEffect, useState } from "react";
import { DistributionItem } from "@/xata";
import CreateAccountAlert from "./create-account-alert";
import { useSession } from "next-auth/react";
import { useLocalStorage } from "usehooks-ts";

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
      <CreateAccountAlert
        open={accountAlertOpen}
        controller={setAccountAlertOpen}
      />
      <SaveIcon
        size={16}
        data-item-id={resourceId}
        className={cn(
          isSaved ? "text-emerald-700" : "text-gray-300",
          "cursor-pointer",
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
