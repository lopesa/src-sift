import { ResourceItemRecord } from "@/xata";
import { SelectedPick } from "@xata.io/client";
import { Session } from "next-auth";

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

export type DistributionItem = DataGovDistibutionItem;

export type DataGovDistibutionItem = {
  "@type"?: string;
  downloadURL?: string;
  accessURL?: string;
  forma?: string;
  mediaType?: string;
  title?: string;
};

export interface Saved {
  isSaved?: boolean;
}

export type DataItemsAccordionItem = Readonly<
  SelectedPick<ResourceItemRecord, ["*"]>
> &
  Saved;

type SessionUserWithId = Session["user"] & { id?: string };
export type SessionWithUserId = Session & { user?: SessionUserWithId };
