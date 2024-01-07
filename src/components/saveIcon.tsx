"usae client";

import { SaveIcon } from "lucide-react";
import { SavedUserItemsContext } from "@/context/savedUserItemsProvider";
import { cn } from "@/lib/utils";
import { useCallback, useContext } from "react";
import { useSession } from "next-auth/react";
import { DistributionItem, SessionWithUserId } from "@/lib/types";
import { TemporaryUserContext } from "@/context/temporaryUserProvider";
import { deleteUserDataItem, saveUserDataItem } from "@/lib/utils/user-data";

export type SaveIconProps = {
  resourceId: string;
  distributionItem?: DistributionItem;
  postUpdateResourceItemAction?: () => void;
  className?: string;
};

const SaveIconComponent = ({
  resourceId,
  distributionItem,
  postUpdateResourceItemAction,
  className,
}: SaveIconProps) => {
  const { data: session, status } = useSession();
  const temporaryUser = useContext(TemporaryUserContext);

  const {
    savedUserItems,
    setSavedUserItems,
    addLocalStorageDistributionItem,
    removeLocalStorageDistributionItem,
    addLocalStorageResourceItem,
    removeLocalStorageResourceItem,
  } = useContext(SavedUserItemsContext);

  const resourceItemIsSaved = () => {
    return (
      savedUserItems.resourceItemIds.length &&
      savedUserItems.resourceItemIds.includes(resourceId)
    );
  };

  const distributionItemIsSaved = () => {
    return false;
  };

  const isSaved = () => {
    if (resourceId && !distributionItem) {
      return resourceItemIsSaved();
    } else if (resourceId && distributionItem) {
      return distributionItemIsSaved();
    }
    return false;
  };

  const getUserId = useCallback(() => {
    if (status === "authenticated") {
      return (session as SessionWithUserId)?.user?.id;
    }
    return temporaryUser?.id;
  }, [session, status, temporaryUser]);

  const onClickSave = async (e: React.MouseEvent<SVGElement>) => {
    e.preventDefault();

    const userId = getUserId();

    if (!userId) {
      return;
    }

    if (resourceId && !distributionItem) {
      const itemIsSaved = resourceItemIsSaved();

      // preemtively set the state
      if (itemIsSaved) {
        removeLocalStorageResourceItem(resourceId);
      } else {
        addLocalStorageResourceItem(resourceId);
      }

      if (itemIsSaved) {
        const deleted = await deleteUserDataItem(
          userId,
          resourceId,
          status === "unauthenticated"
        );
        if (!deleted) {
          // failed remotely, undo preemtive state change
          addLocalStorageResourceItem(resourceId);
        }
        postUpdateResourceItemAction?.();
      } else {
        const savedItem = await saveUserDataItem({
          userId,
          resourceId,
          tempUser: status === "unauthenticated",
          distributionItem,
        });
        if (!savedItem) {
          // failed remotely, undo preemtive state change
          removeLocalStorageResourceItem(resourceId);
        }
        postUpdateResourceItemAction?.();
      }
    } else if (resourceId && distributionItem) {
    }
  };

  return (
    <SaveIcon
      size={16}
      data-item-id={resourceId}
      className={cn(
        isSaved() ? "text-emerald-700" : "text-gray-300",
        "cursor-pointer",
        className
      )}
      onClick={(e) => {
        onClickSave(e);
      }}
    />
  );
};

export default SaveIconComponent;
