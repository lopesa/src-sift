import IndexDataList from "@/components/IndexDataList";
import { DataSources } from "@/lib/const";
import { AppFinalResourceItem } from "@/lib/types";
import { getDataTypesByFileExtension } from "@/lib/utils/data";
import { ResourceItemRecord, getXataClient } from "@/xata";
import { RecordArray, SelectedPick } from "@xata.io/client";

const USDeptOfAgriculturePage = async () => {
  const xata = getXataClient();
  let dataSourceEntry = await xata.db.resource_source
    .filter({ name: DataSources.DEPARTMENT_OF_AGRICULTURE })
    .getFirst()
    .catch((err) => {
      throw err;
    });

  const dataSourceID = dataSourceEntry?.id;

  if (!dataSourceID) {
    throw new Error("Problem getting data source entry");
  }

  let data = await xata.db.resource_item
    .filter({ "source.id": dataSourceID })
    .getAll({ consistency: "eventual" })
    // .getMany({ consistency: "eventual" })
    // .getPaginated({ pagination: {
    //   size: 100, offset: 0 }
    // })
    .catch((err) => {
      throw err;
    });

  if (!data.length) {
    throw new Error("Problem getting data");
  }
  // const serializedData = data.toSerializable();
  const serializedData = JSON.parse(JSON.stringify(data));

  return <div>{data && <IndexDataList data={serializedData} />}</div>;
};

export default USDeptOfAgriculturePage;
