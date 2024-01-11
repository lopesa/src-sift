export type SavedUserItems = {
  initComplete: boolean;
  resourceItemIds: string[];
  distributionItemIds: string[];
};

export type SavedUserItemsAction = {
  type:
    | "setInitComplete"
    | "addDistributionItem"
    | "removeDistributionItem"
    | "addResourceItem"
    | "removeResourceItem";
  id?: string;
};

const SavedUserItemsReducer = (
  savedUserItems: SavedUserItems,
  action: SavedUserItemsAction
): SavedUserItems => {
  switch (action.type) {
    case "setInitComplete":
      return {
        initComplete: true,
        resourceItemIds: [...savedUserItems.resourceItemIds],
        distributionItemIds: [...savedUserItems.distributionItemIds],
      };
    case "addDistributionItem":
      return {
        initComplete: savedUserItems.initComplete,
        resourceItemIds: [...savedUserItems.resourceItemIds],
        distributionItemIds: [
          ...savedUserItems.distributionItemIds,
          action.id as string,
        ],
      };
    case "removeDistributionItem":
      return {
        initComplete: savedUserItems.initComplete,
        resourceItemIds: [...savedUserItems.resourceItemIds],
        distributionItemIds: savedUserItems.distributionItemIds.filter(
          (savedId) => savedId !== action.id
        ),
      };
    case "addResourceItem":
      return {
        initComplete: savedUserItems.initComplete,
        resourceItemIds: [
          ...savedUserItems.resourceItemIds,
          action.id as string,
        ],
        distributionItemIds: [...savedUserItems.distributionItemIds],
      };
    case "removeResourceItem":
      return {
        initComplete: savedUserItems.initComplete,
        resourceItemIds: savedUserItems.resourceItemIds.filter(
          (savedId) => savedId !== action.id
        ),
        distributionItemIds: [...savedUserItems.distributionItemIds],
      };
    default:
      return savedUserItems;
  }
};
export default SavedUserItemsReducer;
