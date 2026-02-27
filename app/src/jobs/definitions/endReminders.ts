import { defineJob } from "@app/jobs/defineJob";

export default defineJob({
  id: "endReminders",
  schedule: "* * * * *", // every minute
  description: "Ends reminders that are past their due date",
  run: async (_ctx) => {
    console.log("[job:endReminders] Not implemented");
  },
});
