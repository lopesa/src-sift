import { SaveIcon } from "lucide-react";
import { SavedUserItemsContext } from "@/context/savedUserItemsProvider";
import { cn } from "@/lib/utils";
import { useCallback, useContext } from "react";
import { useSession } from "next-auth/react";
import { SessionWithUserId } from "@/lib/types";
import { TemporaryUserContext } from "@/context/temporaryUserProvider";
import { deleteUserDataItem, saveUserDataItem } from "@/lib/utils/user-data";

export type SaveIconProps = {
  resourceId: string;
  postUpdateResourceItemAction?: () => void;
  className?: string;
};

const SaveIconComponent = ({
  resourceId,
  postUpdateResourceItemAction,
  className,
}: SaveIconProps) => {
  const { data: session, status } = useSession();
  const temporaryUser = useContext(TemporaryUserContext);

  const { savedUserItems, setSavedUserItems } = useContext(
    SavedUserItemsContext
  );

  const isSaved = () => {
    return (
      savedUserItems.resourceItemIds.length &&
      savedUserItems.resourceItemIds.includes(resourceId)
    );
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

    const itemIsSaved = isSaved();

    // preemtively set the state
    if (itemIsSaved) {
      setSavedUserItems?.({
        resourceItemIds: savedUserItems.resourceItemIds.filter(
          (savedId) => savedId !== resourceId
        ),
      });
    } else {
      setSavedUserItems?.({
        resourceItemIds: [...savedUserItems.resourceItemIds, resourceId],
      });
    }

    if (itemIsSaved) {
      const deleted = await deleteUserDataItem(
        userId,
        resourceId,
        status === "unauthenticated"
      );
      if (!deleted) {
        // failed remotely, undo preemtive state change
        setSavedUserItems?.({
          resourceItemIds: [...savedUserItems.resourceItemIds, resourceId],
        });
      }
      postUpdateResourceItemAction?.();
    } else {
      const savedItem = await saveUserDataItem(
        userId,
        resourceId,
        status === "unauthenticated"
      );
      if (!savedItem) {
        // failed remotely, undo preemtive state change
        setSavedUserItems?.({
          resourceItemIds: savedUserItems.resourceItemIds.filter(
            (savedId) => savedId !== resourceId
          ),
        });
      }
      postUpdateResourceItemAction?.();
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
