import { defineJob } from "@app/jobs/defineJob";
import * as StaticData from "@app/modules/staticData";

export default defineJob({
  id: "resetPoeScarabsStaticData",
  schedule: "*/20 * * * *", // every 20 minutes
  description: "Clear cached PoE scarab prices",
  productionOnly: false,
  run: async (ctx) => {
    await StaticData.deleteByType(ctx, "poeScarabs");
  },
});
