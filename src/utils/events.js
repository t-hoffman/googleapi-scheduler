import { format, isSameDay, setHours, setMinutes } from "date-fns";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";
import {
  endTime,
  startTime,
  timeZone,
  timeBuffer,
  userTimeZone,
} from "../hooks/useEvents";

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
export function setTimeOnDate(date, selectedTime) {
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

// Unified function to generate available slots or full day slots
function generateAvailableSlots(day, events = []) {
  const slots = [];
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const today =
    userTimeZone === timeZone ? new Date() : toZonedTime(new Date(), timeZone);
  const currentMinutes = timeToMinutes(format(today, "HH:mm"));
  const isToday = isSameDay(day, today);
  const earliestStart = currentMinutes + timeBuffer;

  // Map event times if events are provided
  const bookedTimes = events.map((event) => ({
    start: event.start.date
      ? start
      : timeToMinutes(
          formatInTimeZone(event.start.dateTime, timeZone, "HH:mm")
        ),
    end: event.end.date
      ? end
      : timeToMinutes(formatInTimeZone(event.end.dateTime, timeZone, "HH:mm")),
  }));

  for (let i = start; i <= end - 15; i += 15) {
    const slotStart = minutesToTimeString(i);
    const slotEnd = minutesToTimeString(i + 15);

    let x = 0;
    // Logic for "Today" with buffer and current time considerations
    if (isToday && (i <= currentMinutes || i <= earliestStart)) continue;

    // Check if the time slot conflicts with any booked events
    const isAvailable = !bookedTimes.some(
      ({ start, end }) => i < end && i + 15 > start
    );

    // If available or if no events are passed (full day slots), push the slot
    if (isAvailable || events.length === 0) {
      slots.push(`${slotStart} - ${slotEnd}`);
    }
  }

  return slots;
}

// Helper function to display available time slots for a given day
export const getShowTimes = (date, query) => {
  const { disabledDates, sortedTimes } = query.data;
  const timesForDate = sortedTimes?.get(date) || [];
  const isDisabled = disabledDates.some((dDate) => isSameDay(dDate, date));

  if (isDisabled) return false; // Return false if the date is disabled
  if (!query.isFetched) return timesForDate; // Return times or empty array if loading

  // If there are no time slots left/avail today, return false and not an empty array for navigate
  const generatedDates = generateAvailableSlots(date);
  if (!generatedDates.length) return false;

  return timesForDate.length ? timesForDate : generatedDates; // Return times or full day slots
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
export function sortDatesTimes(events) {
  const eventMap = mapEvents(events);
  const sortedTimes = new Map();
  const disabledDates = [];

  eventMap.forEach((events, day) => {
    const slots = generateAvailableSlots(day, events);

    if (slots.length > 0) {
      sortedTimes.set(day, slots); // there is availability for this day, map it
    } else {
      disabledDates.push(new Date(day)); // no availability, add to disabledDates
    }
  });

  // If the current time is after endTime (inc. buffer) or there isn't 15 min left
  // before end time for another slot insert today in disabledDates
  const today =
    userTimeZone === timeZone ? new Date() : toZonedTime(new Date(), timeZone);
  const currentMinutes = timeToMinutes(format(today, "HH:mm"));
  const endBufferMinutes = timeToMinutes(endTime) - timeBuffer;

  if (
    currentMinutes >= endBufferMinutes ||
    endBufferMinutes - currentMinutes <= 15
  ) {
    disabledDates.push(today);
  }

  const currentDate = new Date();
  const zonedDay = Number(formatInTimeZone(currentDate, timeZone, "i"));
  const localDay = Number(format(currentDate, "i"));

  if (zonedDay < localDay) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayMinutes =
      formatInTimeZone(new Date(), timeZone, "i") - timeBuffer;

    // Get available slots for yesterday
    const yesterdayEvents = eventMap.get(yesterday.toDateString());
    const yesterdaySlots = generateAvailableSlots(yesterday, yesterdayEvents);
    if (yesterdaySlots.length < 1 || currentMinutes < yesterdayMinutes) {
      disabledDates.push(yesterday); // Still valid slots for yesterday
    }
  }

  return { disabledDates, sortedTimes };
}
