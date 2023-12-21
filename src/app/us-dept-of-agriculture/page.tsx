import { DataSources } from "@/lib/const";
import { getXataClient } from "@/xata";

const USDeptOfAgriculturePage = async () => {
  //   debugger;
  const xata = getXataClient();
  let dataSourceEntry = await xata.db.resource_source
    .filter({ name: DataSources.DEPARTMENT_OF_AGRICULTURE })
    // .filter({ name: "cats" }) // trow error
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
    .getAll()
    .catch((err) => {
      throw err;
    });
  if (!data.length) {
    throw new Error("Problem getting data");
  }

  debugger;

  return (
    <div>
      {/* <h1>Welcome to Us Department of Agriculture Data Page!</h1> */}
    </div>
  );
};

export default USDeptOfAgriculturePage;
