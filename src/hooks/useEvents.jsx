import { useContext } from "react";
import { isSameDay } from "date-fns";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";
import { EventsContext } from "../context/EventsContext";

// Scheduler configuration settings
const scheduleConfig = {
  startTime: "09:00",
  endTime: "12:00",
  openSaturday: true,
  openSunday: true,
  timeBuffer: 30,
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

// Set maximum selection for today + end of next month
const today = new Date();
const maxDate = new Date(
  today.getFullYear(),
  today.getMonth() + 2,
  0,
  23,
  59,
  59
);

// Set the time on the Date object and return timestamp from selectedTime slot
function setTimeOnDate(date, selectedTime) {
  const [start, end] = selectedTime.split(" - "); // Split start and end times

  const createDateTime = (timeStr) => {
    const time = timeStr.slice(0, -2);
    const period = timeStr.slice(-2);
    let [hours, minutes] = time.split(":").map(Number); // Extract hours and minutes

    if (period === "PM" && hours !== 12) hours += 12; // Convert to 24-hour format
    if (period === "AM" && hours === 12) hours = 0; // Handle midnight case

    const newDate = new Date(date); // Create a copy of the date
    newDate.setHours(hours, minutes, 0, 0); // Set hours, minutes, and reset seconds/milliseconds

    if (userTimeZone !== timeZone) {
      const zonedTime = fromZonedTime(newDate, timeZone);
      return zonedTime.toISOString();
    }

    return newDate.toISOString();
  };

  return {
    startDate: createDateTime(start),
    endDate: createDateTime(end),
  };
}

// Helper function to convert time to minutes since midnight
function timeToMinutes(time) {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
}

// Convert to 12-hour format
function timeToHours(minutes) {
  const totalMinutes = minutes % 1440; // Handle overflow past midnight
  const hours = Math.floor(totalMinutes / 60) % 12 || 12; // Convert to 12-hour format
  const formattedMinutes = String(totalMinutes % 60).padStart(2, "0");
  const period = totalMinutes >= 720 ? "PM" : "AM"; // Determine AM/PM

  return `${hours}:${formattedMinutes}${period}`;
}

function createFullDay(date) {
  const chunks = [];
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const isToday = isSameDay(date, new Date());
  const currentMinutes = timeToMinutes(
    formatInTimeZone(new Date(), timeZone, "HH:mm")
  );

  for (let i = start; i <= end - 15; i += 15) {
    if (isToday && i < currentMinutes) continue;
    chunks.push(`${timeToHours(i)} - ${timeToHours(i + 15)}`);
  }

  return chunks;
}

// Map out the events on the calendar with the date as the key and event(s) as the value
const mapEvents = (events) => {
  const eventMap = new Map();

  events?.forEach((event) => {
    const endDate = toZonedTime(
      new Date(event.end.dateTime || event.end.date),
      timeZone
    ).toDateString();

    eventMap.set(endDate, [...(eventMap.get(endDate) || []), event]);
  });

  return eventMap;
};

// Function to find available 15-minute chunks & manage disabledDates
// Create a map for organizing the available time slots by date (Date > [Slots])
function sortDatesTimes(eventMap) {
  const sortedTimes = new Map();
  const disabledDates = [];
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const endMinutes = end - timeBuffer;
  const currentMinutes = timeToMinutes(
    formatInTimeZone(new Date(), timeZone, "HH:mm")
  );

  eventMap.forEach((events, day) => {
    const chunks = [];
    const isToday = isSameDay(day, toZonedTime(new Date(), timeZone));

    // Create an array of booked times
    const bookedTimes = events.map((event) => ({
      start: event.start.dateTime
        ? timeToMinutes(
            formatInTimeZone(event.start.dateTime, timeZone, "HH:mm")
          )
        : start,
      end: event.end.dateTime
        ? timeToMinutes(formatInTimeZone(event.end.dateTime, timeZone, "HH:mm"))
        : end,
    }));

    // Check each 15-minute slot
    for (let i = start; i <= end - 15; i += 15) {
      // Skip past chunks if today or in the past
      if (
        isToday &&
        (i <= currentMinutes || i - currentMinutes <= timeBuffer)
      ) {
        continue;
      }

      // Check for overlaps with booked times
      const isAvailable = !bookedTimes.some(
        (e) => i < e.end && i + 15 > e.start
      );

      if (isAvailable) {
        chunks.push(`${timeToHours(i)} - ${timeToHours(i + 15)}`);
      }
    }

    // Insert date into the disabledDates array if no available slots
    if (chunks.length === 0) {
      disabledDates.push(new Date(day));
    } else {
      sortedTimes.set(day, chunks);
    }
  });

  if (currentMinutes > endMinutes || endMinutes - currentMinutes <= 15) {
    disabledDates.push(toZonedTime(new Date(), timeZone));
  }

  return { disabledDates, sortedTimes };
}

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
