import { DatasourceMetadata } from "./types";

export const DataSources = {
  DEPARTMENT_OF_AGRICULTURE: "DEPARTMENT_OF_AGRICULTURE",
  DEPARTMENT_OF_ENERGY: "DEPARTMENT_OF_ENERGY",
  DEPARTMENT_OF_TREASURY: "DEPARTMENT_OF_TREASURY",
  //   INTERNATIONAL_COFFEE_ORGANIZATION,
} as const;

export type DataSourcesKeys = keyof typeof DataSources;

export const DataSourceMetadataRecord: Record<
  DataSourcesKeys,
  DatasourceMetadata
> = {
  [DataSources.DEPARTMENT_OF_AGRICULTURE]: {
    originalJsonDataUrl:
      "https://www.usda.gov/sites/default/files/documents/data.json",
    originalInitialUrl: "https://data.gov/metrics.html",
    route: "us-department-of-agriculture",
  },
  [DataSources.DEPARTMENT_OF_ENERGY]: {
    originalJsonDataUrl:
      "https://www.energy.gov/sites/default/files/2023-01/pdl010123.json",
    originalInitialUrl: "https://data.gov/metrics.html",
    route: "us-department-of-energy",
  },
  [DataSources.DEPARTMENT_OF_TREASURY]: {
    originalJsonDataUrl: "http://www.treasury.gov/data.json",
    originalInitialUrl: "https://catalog.data.gov/harvest/about/treasury-json",
    route: "us-department-of-treasury",
  },
  // [DataSources.INTERNATIONAL_COFFEE_ORGANIZATION]: {
  //   originalJsonData: icoDataJson,
  //   originalJsonDataUrl: "https://www.ico.org/new_historical.asp",
  //   originalInitialUrl: "https://www.ico.org/new_historical.asp",
  // },
};

export const getDataSourceFromRoute = (route: string) => {
  const dataSource = Object.keys(DataSourceMetadataRecord).find(
    (key: string) =>
      DataSourceMetadataRecord[key as DataSourcesKeys].route === route
  );
  return dataSource as DataSourcesKeys;
};
