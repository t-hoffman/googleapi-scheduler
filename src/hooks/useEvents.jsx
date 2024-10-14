import { useContext } from "react";
import { isSameDay, setHours, setMinutes } from "date-fns";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";
import { EventsContext } from "../context/EventsContext";

// Scheduler configuration settings
const scheduleConfig = {
  startTime: "09:00",
  endTime: "12:00",
  openSaturday: true,
  openSunday: false,
  timeBuffer: 30, // Buffer time before/after events
  timeZone: "America/Los_Angeles",
  userTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};
const {
  startTime,
  endTime,
  openSaturday,
  openSunday,
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
        : timeToMinutes(
            formatInTimeZone(event.end.dateTime, timeZone, "HH:mm")
          ),
    }));

    for (
      let i = timeToMinutes(startTime);
      i <= timeToMinutes(endTime) - 15;
      i += 15
    ) {
      if (isToday && (i <= currentMinutes || i - currentMinutes <= timeBuffer))
        continue;

      const isAvailable = !bookedTimes.some(
        (e) => i < e.end && i + 15 > e.start
      );

      if (isAvailable)
        slots.push(
          `${minutesToTimeString(i)} - ${minutesToTimeString(i + 15)}`
        );
    }

    if (slots.length === 0) {
      disabledDates.push(new Date(day));
    } else {
      sortedTimes.set(day, slots);
    }
  });

  if (
    currentMinutes >= endBufferMinutes ||
    endBufferMinutes - currentMinutes <= 15
  ) {
    disabledDates.push(toZonedTime(new Date(), timeZone));
  }

  return { disabledDates, sortedTimes };
}

// Hook to access events
const useEvents = () => useContext(EventsContext);

export {
  createFullDay,
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
