import { useMemo } from "react";
import { isSameDay, setHours, setMinutes } from "date-fns";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";
import { useQuery, useQueryClient } from "react-query";

// Scheduler configuration settings
const scheduleConfig = {
  startTime: "09:00",
  endTime: "12:00",
  openSaturday: false,
  openSunday: false,
  timeBuffer: 30, // Buffer time before/after events
  timeZone: "America/Los_Angeles",
  userTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  queryStaleTime: 1000 * 60 * 0.25,
};
const {
  startTime,
  endTime,
  openSaturday,
  openSunday,
  queryStaleTime,
  timeBuffer,
  timeZone,
  userTimeZone,
} = scheduleConfig;

// Maximum selection for today + end of next month
const today = new Date();
const maxDate = new Date(
  today.getFullYear(),
  today.getMonth() + 2,
  0,
  23,
  59,
  59
);

// Utility: Convert time string ("HH:mm") to total minutes since midnight
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Utility: Convert minutes to a 12-hour format ("HH:mm AM/PM")
const minutesToTimeString = (minutes) => {
  const hours = Math.floor(minutes / 60) % 12 || 12;
  const mins = String(minutes % 60).padStart(2, "0");
  const period = minutes >= 720 ? "PM" : "AM";
  return `${hours}:${mins}${period}`;
};

// Set time on a specific date and adjust for time zone differences
function setTimeOnDate(date, selectedTime) {
  const [start, end] = selectedTime.split(" - ");

  const parseTime = (timeStr) => {
    const time = timeStr.slice(0, -2); // Extract "HH:mm"
    const period = timeStr.slice(-2); // Extract "AM/PM"
    let [hours, minutes] = time.split(":").map(Number);

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    const newDate = setMinutes(setHours(new Date(date), hours), minutes);
    return userTimeZone !== timeZone
      ? fromZonedTime(newDate, timeZone).toISOString()
      : newDate.toISOString();
  };

  return {
    startDate: parseTime(start),
    endDate: parseTime(end),
  };
}

// Create available time slots for a specific day
function createFullDay(date) {
  const slots = [];
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const currentMinutes = timeToMinutes(
    formatInTimeZone(new Date(), timeZone, "HH:mm")
  );
  const isToday = isSameDay(date, today);

  for (let i = start; i <= end - 15; i += 15) {
    if (isToday && i < currentMinutes) continue;
    slots.push(`${minutesToTimeString(i)} - ${minutesToTimeString(i + 15)}`);
  }

  return slots;
}

// Helper function to display available time slots for a given day
const getShowTimes = (date, { sortedTimes, disabledDates, isLoading }) => {
  const timesForDate = sortedTimes?.get(date) || [];
  const isDisabled = disabledDates.some((dDate) => isSameDay(dDate, date));

  if (isDisabled) return false; // Return false if the date is disabled
  if (isLoading) return timesForDate; // Return times or empty array if loading
  return timesForDate.length ? timesForDate : createFullDay(date); // Return times or full day
};

// Map events to their respective dates (date as key, events as value)
function mapEvents(events) {
  const eventMap = new Map();

  events?.forEach((event) => {
    const endDate = toZonedTime(
      new Date(event.end.dateTime || event.end.date),
      timeZone
    ).toDateString();
    eventMap.set(endDate, [...(eventMap.get(endDate) || []), event]);
  });

  return eventMap;
}

// Find available 15-minute chunks and manage disabled dates
function sortDatesTimes(eventMap) {
  const sortedTimes = new Map();
  const disabledDates = [];
  const endBufferMinutes = timeToMinutes(endTime) - timeBuffer;
  const currentMinutes = timeToMinutes(
    formatInTimeZone(new Date(), timeZone, "HH:mm")
  );

  eventMap.forEach((events, day) => {
    const slots = getAvailableSlots(day, events, currentMinutes);

    if (slots.length > 0) {
      sortedTimes.set(day, slots); // there is availability for this day, map it
    } else {
      disabledDates.push(new Date(day)); // no availability, add to disabledDates
    }
  });

  // If the current time is after endTime (inc. buffer) or there isn't 15 min left
  // before end time for another slot insert today in disabledDates
  if (
    currentMinutes >= endBufferMinutes ||
    endBufferMinutes - currentMinutes <= 15
  ) {
    disabledDates.push(toZonedTime(new Date(), timeZone));
  }

  return { disabledDates, sortedTimes };
}

// Return available time slots for a given day
function getAvailableSlots(day, events, currentMinutes) {
  const slots = [];
  const isToday = isSameDay(day, toZonedTime(new Date(), timeZone));
  const bookedTimes = events.map((event) => ({
    start: event.start.date
      ? timeToMinutes(startTime)
      : timeToMinutes(
          formatInTimeZone(event.start.dateTime, timeZone, "HH:mm")
        ),
    end: event.end.date
      ? timeToMinutes(endTime)
      : timeToMinutes(formatInTimeZone(event.end.dateTime, timeZone, "HH:mm")),
  }));

  for (
    let i = timeToMinutes(startTime);
    i <= timeToMinutes(endTime) - 15;
    i += 15
  ) {
    // Skip unavailable slots based on today's time and buffer
    if (isToday && (i <= currentMinutes || i - currentMinutes <= timeBuffer))
      continue;

    const isAvailable = !bookedTimes.some(
      ({ start, end }) => i < end && i + 15 > start
    );

    if (isAvailable)
      slots.push(`${minutesToTimeString(i)} - ${minutesToTimeString(i + 15)}`);
  }

  return slots;
}

// Hook to access events & getEvents function for react-query
const getEvents = async () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const response = await fetch(`${apiUrl}/events/`);
  return await response.json();
};

function useEvents() {
  const queryClient = useQueryClient();
  const query = useQuery({
      queryKey: ["events"],
      queryFn: getEvents,
      staleTime: queryStaleTime,
      refetchInterval: queryStaleTime,
    }),
    { data, dataUpdatedAt, isLoading } = query;

  const defaultEventsData = { disabledDates: [], sortedTimes: new Map() };

  const eventsData = useMemo(() => {
    if (isLoading || !data || data.length < 1) return defaultEventsData;

    const cachedSortedTimes = queryClient.getQueryData(["sortedEvents"]);
    const cachedUpdatedAt = queryClient.getQueryData(["sortedEventsUpdatedAt"]);
    const useCache = cachedUpdatedAt === dataUpdatedAt && cachedSortedTimes;

    // Return sorted events from cache if it is up to date
    if (useCache) return cachedSortedTimes;

    console.log("sorting...");

    const eventMap = mapEvents(data);
    const newSortedEventsData = sortDatesTimes(eventMap);

    // Cache the new sorted events and their updated timestamp
    queryClient.setQueryData(["sortedEvents"], newSortedEventsData);
    queryClient.setQueryData(["sortedEventsUpdatedAt"], dataUpdatedAt);

    return newSortedEventsData;
  }, [data, dataUpdatedAt]);

  return { ...query, ...eventsData };
}

export {
  createFullDay,
  getShowTimes,
  mapEvents,
  maxDate,
  openSaturday,
  openSunday,
  setTimeOnDate,
  sortDatesTimes,
  timeZone,
  useEvents,
  userTimeZone,
};
