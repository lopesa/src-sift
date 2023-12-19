import { DataSourceMetadataRecord, DataSources } from "../const";
import PapaParse from "papaparse";

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
  dataSource: DataSources
) => {
  const mappedData = fetchedData?.map((data: any) => {
    const mappedData = {
      title: data.title,
      description: data.description,
      keywords: data.keyword,
      distribution: JSON.stringify(data.distribution),
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
