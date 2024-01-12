import { UserResourceRecord } from "@/xata";
import { isSuccessfulInternalApiResponse } from "../types";

type GetUserDataItemArgs = {
  userId: string;
  tempUser: boolean;
  resourceId?: string;
  distributionItemId?: string;
  getFullDataItem?: boolean;
};

/**
 * get all user data items
 * @TODO pass in an id and get a single item
 * @param userId
 * @param resourceId
 * @param distributionItemId
 */
export const getUserDataItem = async ({
  userId,
  tempUser,
  getFullDataItem,
}: // resourceId,
// distributionItemId,
GetUserDataItemArgs) => {
  const params = new URLSearchParams();

  if (userId) {
    params.append("userId", userId);
  }

  // see note in route handler
  // will need these to implement get one record
  // if (resourceId) {
  //   params.append("resourceId", resourceId);
  // }
  // if (distributionItemId) {
  //   params.append("distributionItemId", distributionItemId);
  // }
  if (getFullDataItem) {
    params.append("getFullDataItem", getFullDataItem.toString());
  }
  params.append("tempUser", (!!tempUser).toString());

  const userDataItemRes = await fetch(
    `/api/user-resource?${params.toString()}`
  );

  const userDataItem = await userDataItemRes?.json();

  if (!isSuccessfulInternalApiResponse(userDataItem)) {
    return [] as UserResourceRecord[];
  }
  return userDataItem.data as UserResourceRecord[];
};

type DeleteUserDataItemArgs = {
  userId: string;
  resourceId: string;
  distributionItemId?: string;
  tempUser: boolean;
};

export const deleteUserDataItem = async ({
  userId,
  resourceId,
  distributionItemId,
  tempUser,
}: DeleteUserDataItemArgs) => {
  const deleted = await fetch(`/api/user-resource`, {
    method: "DELETE",
    body: JSON.stringify({
      userId,
      resourceId,
      distributionItemId,
      tempUser,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  }).catch((e) => e);
  return await deleted?.json();
};

export type CreateUserDataItemArgs = {
  userId: string;
  resourceId?: string;
  tempUser?: boolean;
  distributionItemId?: string;
};

export const createUserDataItem = async ({
  userId,
  resourceId,
  tempUser,
  distributionItemId,
}: CreateUserDataItemArgs) => {
  const userDataItem = await fetch(`/api/user-resource`, {
    method: "POST",
    body: JSON.stringify({
      userId,
      resourceId,
      tempUser,
      distributionItemId,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  }).catch((e) => e);

  return await userDataItem?.json();
};

export const getUserResourcesWithDistributionItem = async (
  distributionItemId: string
) => {
  const params = new URLSearchParams();
  params.append("distributionItemId", distributionItemId);
  const userResourcesResponse = await fetch(
    `/api/user-resource/by-distribution-item?${params.toString()}`
  ).catch((e) => e);
  const userResources = await userResourcesResponse?.json();
  return userResources;
};
