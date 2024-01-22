import { UserResourceRecord } from "@/xata";
import { InternalApiResponse, isSuccessfulInternalApiResponse } from "../types";
import { z } from "zod";
import {
  DeleteUserResourceBodySchema,
  UserResourcePostBodySchema,
} from "@/app/api/user-resource/route";

type GetUserDataItemArgs = {
  userId: string;
  tempUser: boolean;
  resourceId?: string;
  distributionItemId?: string;
  getFullResourceItem?: boolean;
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
  getFullResourceItem,
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
  if (getFullResourceItem) {
    params.append("getFullResourceItem", getFullResourceItem.toString());
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

/**
 * delete 1 or more user_data items
 * @param DeleteUserResourceBodySchema
 * @returns
 */
export const deleteUserDataItem = async (
  recordIds: z.infer<typeof DeleteUserResourceBodySchema>
) => {
  const deleted = await fetch(`/api/user-resource`, {
    method: "DELETE",
    body: JSON.stringify(recordIds),
    headers: {
      "Content-Type": "application/json",
    },
  }).catch((e) => {
    debugger;
    return e;
  });
  debugger;

  let json = await deleted?.json();
  debugger;
  return json;
};

/**
 * create a single user data item
 * or a batch or user data items
 * @param param
 * @returns
 */
export const createUserData = async (
  args: z.infer<typeof UserResourcePostBodySchema>
) => {
  const postBody = UserResourcePostBodySchema.safeParse(args);

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

  const authUserResourceByResourceIdSubDistributionId = authUserResources.map(
    (res) => {
      let returnVal = [res.resource?.id || ""];
      if (res.distribution_item) {
        returnVal.push(res.distribution_item.id);
      }
      return returnVal;
    }
  );

  debugger;

  // add non-repeated resources to auth user from temp user
  const tempUserResourcesToAdd = tempUserResources.filter(
    (tempUserResource) => {
      if (
        !!authUserResourceByResourceIdSubDistributionId.find((item) => {
          if (item[0] === tempUserResource.resource?.id) {
            return !!item[1]
              ? !(item[1] === tempUserResource.distribution_item?.id)
              : false;
          }
          return true;
        })
      ) {
        return false;
      } else {
        return true;
      }
    }
  );

  debugger;

  if (tempUserResourcesToAdd.length) {
    const createItemsArgs =
      tempUserResourcesToAdd.length === 1
        ? {
            resourceId: tempUserResourcesToAdd[0].resource?.id || "", // @TODO this is a hack
            distributionItemId: tempUserResourcesToAdd[0].distribution_item?.id,
            userId: authUserId,
            tempUser: false,
          }
        : {
            userId: authUserId,
            tempUser: false,
            resources: tempUserResourcesToAdd.map((tempUserResource) => {
              let resource: {
                resourceId: string;
                distributionItemId?: string;
              } = {
                resourceId: tempUserResource.resource?.id || "",
              };
              if (tempUserResource.distribution_item) {
                resource.distributionItemId =
                  tempUserResource.distribution_item?.id;
              }
              return resource;
            }),
          };

    const itemsCreated = await createUserData(createItemsArgs);
    debugger;
  }

  debugger;
  // delete temp user user resources
  const deletedTempUserItems = await deleteUserDataItem(
    tempUserResources.map((r) => r.id)
  ).catch((e) => {
    debugger;
    return e;
  });

  // debugger;
  // delete temp user
};
