"usae client";

import { SaveIcon } from "lucide-react";
import { SavedUserItemsContext } from "@/context/savedUserItemsProvider";
import { cn } from "@/lib/utils";
import { useContext, useEffect, useState } from "react";
import { DistributionItem } from "@/xata";

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
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const { toggleItemIsSaved, getItemIsSaved } = useContext(
    SavedUserItemsContext
  );

  useEffect(() => {
    const getIsSaved = async () => {
      const isSaved = await getItemIsSaved(resourceId, distributionItem);
      setIsSaved(isSaved);
    };
    getIsSaved();
  }, [setIsSaved, getItemIsSaved, resourceId, distributionItem]);

  const onClickSave = async (e: React.MouseEvent<SVGElement>) => {
    e.preventDefault();

    const curState = isSaved;

    // preemptive
    setIsSaved(!isSaved);

    const saveSuccess = await toggleItemIsSaved(resourceId, distributionItem);
    setIsSaved(await getItemIsSaved(resourceId, distributionItem));
    postUpdateResourceItemAction?.();
  };

  return (
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
  );
};

export default SaveIconComponent;
