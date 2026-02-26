import { defineJob } from "@app/jobs/defineJob";
import * as statsModule from "@app/modules/stats";

export default defineJob({
  id: "refreshStats",
  schedule: "0 * * * *", // every hour
  description: "Refreshes guild/user stats and persists to DB",
  run: async (ctx) => {
    await statsModule.getOverview(ctx);
    console.log("[job:refreshStats] Stats refreshed");
  },
});
