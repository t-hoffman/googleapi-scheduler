import { toZonedTime } from "date-fns-tz";

// Scheduler configuration settings
const scheduleConfig = {
  startTime: "10:00",
  endTime: "13:00",
  openSaturday: false,
  openSunday: false,
  timeBuffer: 30, // Buffer time before/after events
  timeZone: "America/Los_Angeles",
  userTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  queryStaleTime: 1000 * 60 * 1,
  apiUrl: import.meta.env.VITE_API_URL,
};

export const {
  startTime,
  endTime,
  openSaturday,
  openSunday,
  timeBuffer,
  timeZone,
  userTimeZone,
  queryStaleTime,
  apiUrl,
} = scheduleConfig;

// Maximum selection for today + end of next month
const today =
  userTimeZone !== timeZone ? toZonedTime(new Date(), timeZone) : new Date();

export const maxDate = new Date(
  today.getFullYear(),
  today.getMonth() + 2,
  0,
  23,
  59,
  59
);
