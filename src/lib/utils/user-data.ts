import { UserResourceRecord } from "@/xata";
import { InternalApiResponse, isSuccessfulInternalApiResponse } from "../types";
import { createUserResourceParams } from "@/app/api/user-resource/route";
import { z } from "zod";

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
  ).catch((e) => e);

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

/**
 * create a single user data item
 * @param param
 * @returns
 */

export const createUserDataItem = async (
  args: z.infer<typeof createUserResourceParams>
) => {
  const postBody = createUserResourceParams.safeParse(args);

  if (!postBody.success) {
    return undefined;
  }
  const userDataItemRes = await fetch(`/api/user-resource`, {
    method: "POST",
    body: JSON.stringify(postBody.data),
    headers: {
      "Content-Type": "application/json",
    },
  }).catch((e) => {
    console.error(e);
  });

  if (!userDataItemRes?.ok) {
    return undefined;
  }

  const userDataItem: InternalApiResponse<UserResourceRecord> =
    await userDataItemRes?.json();

  // if (!isSuccessfulInternalApiResponse(userDataItem)) {
  //   return undefined;
  // }

  return userDataItem.data ? userDataItem.data : undefined;
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

export const doUserAuthTempUserCleanup = async (
  authUserId: string,
  tempUserId: string
) => {
  debugger;
  // get all user resources for each user
  const [authUserResources, tempUserResources] = await Promise.all([
    getUserDataItem({ userId: authUserId, tempUser: false }),
    getUserDataItem({ userId: tempUserId, tempUser: true }),
  ]);

  // add non-repeated resources to auth user from temp user
  const tempUserResourcesToAdd = tempUserResources.filter(
    (tempUserResource) => {
      return !authUserResources.includes(tempUserResource);
    }
  );

  const additionPromises = tempUserResourcesToAdd.map((tempUserResource) => {
    return () => {
      let args: z.infer<typeof createUserResourceParams> = {
        // TODO, proper typing should prevent this || ''
        resourceId: tempUserResource?.resource?.id || "",
        userId: authUserId,
        tempUser: false,
      };
      if (tempUserResource.resource) {
        args.resourceId = tempUserResource.resource.id;
      }
      if (tempUserResource.distribution_item) {
        args.distributionItemId = tempUserResource.distribution_item.id;
      }
      return createUserDataItem(args);
    };
  });

  const additions = await Promise.all(additionPromises);
  debugger;
  // delete temp user user resources
  // delete temp user
};
