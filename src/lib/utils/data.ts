import { ResourceItem } from "@/xata";
import { DataSourceMetadataRecord, DataSources } from "../const";
import PapaParse from "papaparse";
import { cleanString } from ".";

export const fetchNewData = async (dataSource: DataSources) => {
  const fetchedData = await fetch(
    DataSourceMetadataRecord[dataSource].originalJsonDataUrl
  ).catch((e) => {
    throw e;
  });
  if (!fetchedData?.ok) {
    throw new Error("Error fetching data from source");
  }

  const fetchedDataJson = await fetchedData.json().catch((e) => {
    throw e;
  });

  return fetchedDataJson;
};

export const mapFetchedDataToSchema = (
  fetchedData: any,
  dataSource: string
) => {
  const mappedData: ResourceItem[] = fetchedData?.map((data: any) => {
    const mappedData = {
      source: dataSource,
      title: data.title,
      description: cleanString(data.description),
      keywords: data.keyword,
      distribution: data.distribution,
      full_data: data,
    };
    return mappedData;
  });

  return mappedData;
};

export const parseArrayToCsv = (array?: any[]) => {
  debugger;
  if (!array) {
    return "";
  }
  return PapaParse.unparse(array);
};
