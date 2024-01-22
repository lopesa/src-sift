export type SavedUserItems = {
  initComplete: boolean;
  // resourceItemIds: string[];
  resourceItemIds: [string, string][]; // [resourceId, userResourceId]
  distributionItemIds: [string, string][]; // [distributionItemId, userResourceId]
};

export type SavedUserItemsAction = {
  type:
    | "setInitComplete"
    | "addDistributionItem"
    | "removeDistributionItem"
    | "addResourceItem"
    | "removeResourceItem";
  id?: string;
  resourceAndUserResourceIds?: [string, string];
  distributionItemAndUserResourceIds?: [string, string];
  initComplete?: boolean;
};

const SavedUserItemsReducer = (
  savedUserItems: SavedUserItems,
  action: SavedUserItemsAction
): SavedUserItems => {
  switch (action.type) {
    case "setInitComplete":
      return {
        initComplete: action.initComplete as boolean,
        resourceItemIds: [...savedUserItems.resourceItemIds],
        distributionItemIds: [...savedUserItems.distributionItemIds],
      };
    case "addDistributionItem":
      return {
        initComplete: savedUserItems.initComplete,
        resourceItemIds: [...savedUserItems.resourceItemIds],
        distributionItemIds: [
          ...savedUserItems.distributionItemIds,
          action.distributionItemAndUserResourceIds as [string, string],
        ],
      };
    case "removeDistributionItem":
      return {
        initComplete: savedUserItems.initComplete,
        resourceItemIds: [...savedUserItems.resourceItemIds],
        distributionItemIds: savedUserItems.distributionItemIds.filter(
          (savedIdTuple) => savedIdTuple[0] !== action.id
        ),
      };
    case "addResourceItem":
      return {
        initComplete: savedUserItems.initComplete,
        resourceItemIds: [
          ...savedUserItems.resourceItemIds,
          action.resourceAndUserResourceIds as [string, string],
        ],
        distributionItemIds: [...savedUserItems.distributionItemIds],
      };
    case "removeResourceItem":
      return {
        initComplete: savedUserItems.initComplete,
        resourceItemIds: savedUserItems.resourceItemIds.filter(
          (savedIdTuple) => savedIdTuple[0] !== action.id
        ),
        distributionItemIds: [...savedUserItems.distributionItemIds],
      };
    default:
      return savedUserItems;
  }
};
export default SavedUserItemsReducer;
