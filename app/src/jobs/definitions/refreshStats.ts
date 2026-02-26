import { defineJob } from "@app/jobs/defineJob";
import * as Stats from "@app/modules/stats";

export default defineJob({
  id: "refreshStats",
  schedule: "0 * * * *", // every hour
  description: "Refreshes guild/user stats and persists to DB",
  run: async (ctx) => {
    await Stats.getOverview(ctx);
    console.log("[job:refreshStats] Stats refreshed");
  },
});
