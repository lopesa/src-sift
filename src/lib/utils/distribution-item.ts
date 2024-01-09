import { DistributionItem, DistributionItemRecord } from "@/xata";
import { JSONData } from "@xata.io/client";

export const getDistributionItem = async (
  resourceId: string,
  distributionItem: DistributionItem
): Promise<JSONData<DistributionItemRecord> | { error: string }> => {
  const searchString = `?resourceId=${resourceId}&distributionUrl=${
    distributionItem.downloadURL
      ? encodeURIComponent(distributionItem.downloadURL)
      : distributionItem.accessURL
      ? encodeURIComponent(distributionItem.accessURL)
      : ""
    // distributionItem.downloadURL || distributionItem.accessURL
  }`;
  // get any distribution items with this resource_item id and resource_url
  const existingDistributionItemRes = await fetch(
    `/api/distribution-item${searchString}`
  ).catch((e) => undefined);
  const existingDistributionItem = await existingDistributionItemRes?.json();
  return existingDistributionItem;
};

export const createDistributionItem = async (
  resourceId: string,
  distributionItem: DistributionItem
): Promise<JSONData<DistributionItemRecord> | { error: string }> => {
  const createdDistributionItemRes = await fetch(`/api/distribution-item`, {
    method: "POST",
    body: JSON.stringify({
      resourceId,
      distributionItem,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  }).catch((e) => e);
  const createdDistributionItem = await createdDistributionItemRes?.json();
  return createdDistributionItem;
};

export const deleteDistributionItem = async (
  distributionItemId: string
): Promise<JSONData<DistributionItemRecord> | { error: string }> => {
  const deletedDistributionItemRes = await fetch(`/api/distribution-item`, {
    method: "DELETE",
    body: JSON.stringify({
      id: distributionItemId,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  }).catch((e) => e);
  const deletedDistributionItem = await deletedDistributionItemRes?.json();
  return deletedDistributionItem;
};
