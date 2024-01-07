import { DistributionItem } from "../types";

export const deleteUserDataItem = async (
  userId: string,
  resourceId: string,
  tempUser: boolean
) => {
  const deleted = await fetch(`/api/user-resource`, {
    method: "DELETE",
    body: JSON.stringify({
      userId,
      resourceId,
      tempUser,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  }).catch((e) => {
    // console.log(e);
  });
  return deleted;
};

export type SaveUserDataItemArgs = {
  userId: string;
  resourceId: string;
  tempUser: boolean;
  distributionItem?: DistributionItem;
};

export const saveUserDataItem = async ({
  userId,
  resourceId,
  tempUser,
  distributionItem,
}: SaveUserDataItemArgs) => {
  const userDataItem = await fetch(`/api/user-resource`, {
    method: "POST",
    body: JSON.stringify({
      userId,
      resourceId,
      tempUser,
      distributionItem,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  }).catch((e) => {
    // console.log(e);
  });
  return userDataItem;
};
