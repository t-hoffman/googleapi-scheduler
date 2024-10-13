import { useContext } from "react";
import { isSameDay } from "date-fns";
import { EventsContext } from "../context/EventsContext";
import data from "../events.json";

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

// Set disabled dates array & start/end time
// const disabledDates = [];
const startTime = "09:00";
const endTime = "12:00";
const timeLimiter = 30;

// Helper function to convert time to minutes since midnight
function timeToMinutes(time) {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
}

// Convert to 12-hour format
function formatTime(minutes) {
  const totalMinutes = minutes % 1440; // Handle overflow past midnight
  const hours = Math.floor(totalMinutes / 60) % 12 || 12; // Convert to 12-hour format
  const formattedMinutes = String(totalMinutes % 60).padStart(2, "0");
  const period = totalMinutes >= 720 ? "PM" : "AM"; // Determine AM/PM

  return `${hours}:${formattedMinutes}${period}`;
}

// Set the time on the Date object and return timestamp from selectedTime slot
function setTimeOnDate(date, selectedTime) {
  const createDateTime = (timeStr) => {
    const period = timeStr.slice(-2);
    const time = timeStr.slice(0, -2);
    let [hours, minutes] = time.split(":").map(Number); // Extract hours and minutes
    if (period === "PM" && hours !== 12) hours += 12; // Convert to 24-hour format
    if (period === "AM" && hours === 12) hours = 0; // Handle midnight case

    const newDate = new Date(date); // Create a copy of the date
    newDate.setHours(hours, minutes, 0, 0); // Set hours, minutes, and reset seconds/milliseconds
    return newDate.getTime();
  };

  const [start, end] = selectedTime.split(" - "); // Split start and end times
  return {
    startDate: createDateTime(start),
    endDate: createDateTime(end),
  };
}

function createFullDay(date) {
  const chunks = [];
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const isToday = isSameDay(date, new Date());
  const currentMinutes = timeToMinutes(new Date().toTimeString().slice(0, 5));

  for (let i = start; i <= end - 15; i += 15) {
    const chunkStart = i;
    const chunkEnd = i + 15;

    if (isToday && chunkStart < currentMinutes) continue;

    chunks.push(`${formatTime(chunkStart)} - ${formatTime(chunkEnd)}`);
  }

  return chunks;
}

// Map out the events on the calendar with the date as the key and event(s) as the value
function mapEvents(data) {
  const eventMap = new Map();
  // const { data } = useEvents(queryKey);

  data?.forEach((event) => {
    const endDate = new Date(
      event.end.dateTime || event.end.date
    ).toDateString();

    eventMap.set(endDate, [...(eventMap.get(endDate) || []), event]);
  });

  return eventMap;
}

// Function to find available 15-minute chunks & manage disabledDates
// Create a map for organizing the available time slots by date (Date > [Slots])
function sortDatesTimes(eventMap) {
  const sortedTimes = new Map();
  const disabledDates = [];
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const currentMinutes = timeToMinutes(new Date().toTimeString().slice(0, 5));

  for (let [day, events] of eventMap) {
    const chunks = [];
    const isToday = isSameDay(day, new Date());

    // Create an array of booked times
    const bookedTimes = events.map((event) => ({
      start: timeToMinutes(
        `${new Date(event.start.dateTime).getHours()}:${new Date(
          event.start.dateTime
        ).getMinutes()}`
      ),
      end: timeToMinutes(
        `${new Date(event.end.dateTime).getHours()}:${new Date(
          event.end.dateTime
        ).getMinutes()}`
      ),
    }));

    // Check each 15-minute slot
    for (let i = start; i <= end - 15; i += 15) {
      const chunkStart = i;
      const chunkEnd = i + 15;

      // Skip past chunks if today or in the past
      if (isToday && chunkStart < currentMinutes) continue;

      // Check for overlaps with booked times
      const isAvailable = !bookedTimes.some(
        (e) => chunkStart < e.end && chunkEnd > e.start
      );

      if (isAvailable) {
        chunks.push(`${formatTime(chunkStart)} - ${formatTime(chunkEnd)}`);
      }
    }

    // Insert date into the disabledDates array if no available slots
    if (chunks.length === 0) {
      disabledDates.push(new Date(day));
    } else {
      sortedTimes.set(day, chunks);
    }
  }

  if (currentMinutes > end - timeLimiter) {
    disabledDates.push(new Date());
  }

  return { disabledDates, sortedTimes };
}

function useEvents() {
  return useContext(EventsContext);
}

export {
  createFullDay,
  mapEvents,
  maxDate,
  setTimeOnDate,
  sortDatesTimes,
  useEvents,
};
