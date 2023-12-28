import IndexDataList from "@/components/IndexDataList";
import { DataSources, getDataSourceFromRoute } from "@/lib/const";
import { getXataClient } from "@/xata";

const ResourcePage = async ({ params }: { params: { id: string } }) => {
  const dataSource = getDataSourceFromRoute(params.id);

  if (!dataSource) {
    throw new Error("Problem getting data source");
  }

  const xata = getXataClient();
  let dataSourceEntry = await xata.db.resource_source
    .filter({ name: DataSources[dataSource] })
    .getFirst()
    .catch((err) => {
      throw err;
    });

  const dataSourceID = dataSourceEntry?.id;

  if (!dataSourceID) {
    throw new Error("Problem getting data source entry");
  }

  let data = await xata.db.resource_item
    .select(["title", "description"])
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

  return <div>{serializedData && <IndexDataList data={serializedData} />}</div>;
};

export default ResourcePage;
