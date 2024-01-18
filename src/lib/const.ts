import { DatasourceMetadata } from "./types";

export const DataSources = {
  DEPARTMENT_OF_AGRICULTURE: "DEPARTMENT_OF_AGRICULTURE",
  DEPARTMENT_OF_ENERGY: "DEPARTMENT_OF_ENERGY",
  DEPARTMENT_OF_TREASURY: "DEPARTMENT_OF_TREASURY",
  US_ENVIRONMENTAL_PROTECTION_AGENCY: "US_ENVIRONMENTAL_PROTECTION_AGENCY",
  US_CONSUMER_PRODUCT_SAFETY_COMMISSION:
    "US_CONSUMER_PRODUCT_SAFETY_COMMISSION",
  US_DEPARTMENT_OF_EDUCATION: "US_DEPARTMENT_OF_EDUCATION",
  //   INTERNATIONAL_COFFEE_ORGANIZATION,
} as const;

export type DataSourcesKeys = keyof typeof DataSources;

export const DataSourceMetadataRecord: Record<
  DataSourcesKeys,
  DatasourceMetadata
> = {
  [DataSources.DEPARTMENT_OF_AGRICULTURE]: {
    originalJsonDataUrl: [
      {
        name: "",
        url: "https://www.usda.gov/sites/default/files/documents/data.json",
      },
    ],
    originalInitialUrl: "https://data.gov/metrics.html",
    route: "us-department-of-agriculture",
    displayName: "US Department of Agriculture",
  },
  [DataSources.DEPARTMENT_OF_ENERGY]: {
    originalJsonDataUrl: [
      {
        name: "",
        url: "https://www.energy.gov/sites/default/files/2023-01/pdl010123.json",
      },
    ],
    originalInitialUrl: "https://data.gov/metrics.html",
    route: "us-department-of-energy",
    displayName: "US Department of Energy",
  },
  [DataSources.DEPARTMENT_OF_TREASURY]: {
    originalJsonDataUrl: [
      { name: "", url: "http://www.treasury.gov/data.json" },
    ],
    originalInitialUrl: "https://catalog.data.gov/harvest/about/treasury-json",
    route: "us-department-of-treasury",
    displayName: "US Department of Treasury",
  },
  [DataSources.US_ENVIRONMENTAL_PROTECTION_AGENCY]: {
    originalJsonDataUrl: [
      { name: "EPA ScienceHub", url: "https://pasteur.epa.gov/metadata.json" },
      {
        name: "EPA Pub Central",
        url: "https://edg.epa.gov/data/Public/ORD/NHEERL/metadata/PubCentral.json",
      },
    ],
    originalInitialUrl:
      "https://catalog.data.gov/harvest/?_organization_limit=0&organization=epa-gov",
    route: "us-environmental-protection-agency",
    displayName: "US Environmental Protection Agency",
  },
  [DataSources.US_CONSUMER_PRODUCT_SAFETY_COMMISSION]: {
    originalJsonDataUrl: [{ name: "", url: "https://www.cpsc.gov/data.json" }],
    originalInitialUrl:
      "https://catalog.data.gov/harvest/?_organization_limit=0&organization=cpsc-gov",
    route: "us-consumer-product-safety-commission",
    displayName: "US Consumer Product Safety Commission",
  },
  [DataSources.US_DEPARTMENT_OF_EDUCATION]: {
    originalJsonDataUrl: [{ name: "", url: "https://www2.ed.gov/data.json" }],
    originalInitialUrl:
      "https://catalog.data.gov/harvest/?_organization_limit=0&organization=ed-gov",
    route: "us-department-of-education",
    displayName: "US Department of Education",
  },
};

export const getDataSourceFromRoute = (route: string) => {
  const dataSource = Object.keys(DataSourceMetadataRecord).find(
    (key: string) =>
      DataSourceMetadataRecord[key as DataSourcesKeys].route === route
  );
  return dataSource as DataSourcesKeys;
};

export const UserStatus = {
  AUTHENTICATED: "authenticated",
  UNAUTHENTICATED: "unauthenticated",
  LOADING: "loading",
} as const;
