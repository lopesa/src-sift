type SavedUserItems = {
  resourceItemIds: string[];
  distributionItemIds: string[];
};

const SavedUserItemsReducer = (
  savedUserItems: SavedUserItems,
  action: {
    type:
      | "addDistributionItem"
      | "removeDistributionItem"
      | "addResourceItem"
      | "removeResourceItem";
    id: string;
  }
) => {
  switch (action.type) {
    case "addDistributionItem":
      return {
        resourceItemIds: [...savedUserItems.resourceItemIds],
        distributionItemIds: [...savedUserItems.distributionItemIds, action.id],
      };
    case "removeDistributionItem":
      return {
        resourceItemIds: [...savedUserItems.resourceItemIds],
        distributionItemIds: savedUserItems.distributionItemIds.filter(
          (savedId) => savedId !== action.id
        ),
      };
    case "addResourceItem":
      return {
        resourceItemIds: [...savedUserItems.resourceItemIds, action.id],
        distributionItemIds: [...savedUserItems.distributionItemIds],
      };
    case "removeResourceItem":
      return {
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
