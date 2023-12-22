import { ResourceItemRecord } from "@/xata";
import { SelectedPick } from "@xata.io/client";

export type DatasourceMetadata = {
  originalJsonData?: Array<object>;
  originalJsonDataUrl: string;
  originalInitialUrl: string;
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
