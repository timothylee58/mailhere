import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Crawl regulator sources daily at 08:00 MYT (00:00 UTC).
crons.daily(
  "crawl-regulators",
  { hourUTC: 0, minuteUTC: 0 },
  internal.crawler.kickoffAll,
  {},
);

// Email businesses about notices due within 7 days, 09:00 MYT (01:00 UTC).
crons.daily(
  "deadline-reminders",
  { hourUTC: 1, minuteUTC: 0 },
  internal.reminders.dailyDeadlineCheck,
  {},
);

export default crons;
