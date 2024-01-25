import {
  DistributionItemRecord,
  ResourceItemRecord,
  UserResourceRecord,
} from "@/xata";
import {
  JSONData,
  SearchXataRecord,
  SelectedPick,
  TotalCount,
} from "@xata.io/client";
import { Session } from "next-auth";
import { z } from "zod";
import { zodEnumFromObjKeys } from "./utils/zod";
import { DataSources } from "./const";

export type InternalApiResponse<T> = {
  data?: T;
  error?: string;
};

export type DatasourceMetadata = {
  originalJsonData?: Array<object>;
  originalJsonDataUrl: { name: string; url: string }[];
  originalInitialUrl: string;
  route: string;
  displayName: string;
};

export type IntakeTypeForResourceItem = {
  source: string;
  title: string;
  description: string;
  keywords: string[];
  distribution: any;
  full_data: any;
  data_types_by_file_extension?: string[];
};

export type AppFinalResourceItem = Readonly<
  SelectedPick<ResourceItemRecord, ["*"]>
> & {
  dataTypesByFileExtension?: string[];
};

// export type DistributionItem = DataGovDistibutionItem;

// export type DataGovDistibutionItem = {
//   "@type"?: string;
//   downloadURL?: string;
//   accessURL?: string;
//   forma?: string;
//   mediaType?: string;
//   title?: string;
// };

export interface Saved {
  isSaved?: boolean;
}

export type DataItemsAccordionItem = Readonly<
  SelectedPick<ResourceItemRecord, ["*"]>
> &
  Saved;

type SessionUserWithId = Session["user"] & { id?: string };
export type SessionWithUserId = Session & { user?: SessionUserWithId };

export type SearchResults = {
  results: {
    records: SearchXataRecord<SelectedPick<ResourceItemRecord, ["*"]>>[];
  } & TotalCount;
};

// const scope = z.object({
//   resources: z.array(z.string()),
//   distributionItems: z.array(z.string()),
// });
export const aiQuestionFormat = z.object({
  question: z.string(),
  rules: z.array(z.string()).optional(),
  searchType: z.enum(["keyword", "vector"]).optional(),
  // scope: z.array(z.string()), // not really panning out, probably remove
});

// export const ZodUserResourceRecord = z.object(<UserResourceRecord>);

export function isValidDistributionItemRecord(
  item: any
): item is DistributionItemRecord {
  return item && item.id;
}

export function isValidUserResourceRecord(
  item: any
): item is UserResourceRecord {
  return item && item.id;
}

export function isSuccessfulInternalApiResponse(item: {
  data?: any;
  error?: any;
}): item is { data: any } {
  return item && item.data && !item.error;
}

/**\
 * route handler types
 */

export const addResourceBody = z.object({
  // @TODO make optional and if no source, add all
  source: zodEnumFromObjKeys(DataSources),
});

export const DeleteTemporaryUserBodySchema = z.string();

export const createUserResourceParams = z.object({
  resourceId: z.string(),
  userId: z.string(),
  distributionItemId: z.string().optional(),
  tempUser: z.boolean().optional(),
});
export const createUserResourcesParams = z.object({
  userId: z.string(),
  tempUser: z.boolean().optional(),
  resources: z.array(
    z.object({
      resourceId: z.string(),
      distributionItemId: z.string().optional(),
    })
  ),
});
export const UserResourcePostBodySchema = z.union([
  createUserResourceParams,
  createUserResourcesParams,
]);

export const DeleteUserResourceBodySchema = z.union([
  z.string(),
  z.array(z.string()),
]);
