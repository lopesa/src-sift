import {
  DistributionItemRecord,
  ResourceItemRecord,
  UserResourceRecord,
} from "@/xata";
import { SearchXataRecord, SelectedPick, TotalCount } from "@xata.io/client";
import { Session } from "next-auth";
import { z } from "zod";

export type DatasourceMetadata = {
  originalJsonData?: Array<object>;
  originalJsonDataUrl: string;
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
  // scope: z.array(z.string()), // not really panning out, probably remove
});

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
