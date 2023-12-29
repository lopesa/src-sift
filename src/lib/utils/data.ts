import { ResourceItem, getXataClient } from "@/xata";
import {
  DataSourceMetadataRecord,
  DataSources,
  DataSourcesKeys,
} from "../const";
import PapaParse from "papaparse";
import { cleanString } from ".";
import { IntakeTypeForResourceItem } from "../types";

export const fetchNewData = async (dataSource: DataSourcesKeys) => {
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
): IntakeTypeForResourceItem[] => {
  const mappedData = fetchedData?.map((data: any) => {
    const mappedData: IntakeTypeForResourceItem = {
      source: dataSource,
      title: data.title,
      description: cleanString(data.description),
      keywords: data.keyword,
      distribution: data.distribution,
      full_data: data,
    };

    const dataTypesByFileExtension = getDataTypesByFileExtension(
      data.distribution
    );
    if (dataTypesByFileExtension.length) {
      mappedData.data_types_by_file_extension = dataTypesByFileExtension;
    }
    return mappedData;
  });

  return mappedData;
};

/**
 *
 * @param distribution
 * @returns array of file extensions
 */
export const getDataTypesByFileExtension = (distribution: any) => {
  if (typeof distribution !== "object" || !Array.isArray(distribution)) {
    return [];
  }

  let dataTypesByFileExtension: { [key: string]: boolean } = {};
  distribution.forEach((dist) => {
    if (typeof dist === "object" && !Array.isArray(dist)) {
      const distributionObject = dist;
      let distUrl =
        distributionObject["downloadURL"] ||
        distributionObject["accessURL"] ||
        "";

      let fileExtension;

      if (typeof distUrl === "string") {
        fileExtension = getFileExtension(distUrl);
      }

      if (typeof fileExtension === "string") {
        dataTypesByFileExtension[fileExtension] = true;
      }
    }
  });
  return Object.keys(dataTypesByFileExtension);
};

export const getFileExtension = (filename: string) => {
  // some bitshifting magic to get the file extension (stack overflow)
  // return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
  if (!filename.includes(".")) {
    return -1;
  }
  const lastDotIndex = filename.lastIndexOf(".");
  const length = filename.length;
  // @TODO: need to strip off query params
  // I'm not really sure at this point where
  // lastDotIndex > 5 is coming from
  if (length - lastDotIndex > 5) {
    return -1;
  }
  return (
    filename.substring(filename.lastIndexOf(".") + 1, filename.length) || -1
  );
};

export const getOrCreateDataSourceEntry = async (
  dataSource: DataSourcesKeys
) => {
  if (!Object.keys(DataSources).includes(dataSource?.toUpperCase())) {
    return Promise.resolve();
  }

  const xata = getXataClient();

  let dataSourceEntry = await xata.db.resource_source
    .filter({ name: dataSource })
    .getFirst({ consistency: "eventual" });

  if (!dataSourceEntry) {
    dataSourceEntry = await xata.db.resource_source.create({
      name: dataSource,
    });
  }

  if (!dataSourceEntry) {
    return Promise.resolve();
  }

  return Promise.resolve(dataSourceEntry);
};

export const parseArrayToCsv = (array?: any[]) => {
  if (!array) {
    return "";
  }
  return PapaParse.unparse(array);
};
