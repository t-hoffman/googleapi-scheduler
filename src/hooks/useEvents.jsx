import { useContext, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { isBefore, isSameDay } from "date-fns";
import data from "../events.json";
import { ScheduleContext } from "../context/ScheduleContext";

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

// Helper function to convert time to minutes since midnight
function timeToMinutes(time) {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
}

// Convert to 12-hour format
const formatTime = (minutes) => {
  const totalMinutes = minutes % 1440; // Handle overflow past midnight
  const hours = Math.floor(totalMinutes / 60) % 12 || 12; // Convert to 12-hour format
  const formattedMinutes = String(totalMinutes % 60).padStart(2, "0");
  const period = totalMinutes >= 720 ? "PM" : "AM"; // Determine AM/PM
  return `${hours}:${formattedMinutes} ${period}`;
};

// Function to find available 15-minute chunks & manage disabledDates
// Create a map for organizing the available time slots by date (Date > [Slots])
function sortDatesTimes({ dataUpdatedAt, eventMap, setState }) {
  const sortedSlots = new Map();
  const currentTime = new Date();
  const newDisabledDates = [];
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const currentMinutes = timeToMinutes(currentTime.toTimeString().slice(0, 5));

  for (let [day, events] of eventMap) {
    const chunks = [];
    const isToday = isSameDay(day, currentTime);

    // Create an array of booked times
    const bookedTimes = events.map((event) => {
      const startMinutes = timeToMinutes(
        `${new Date(event.start.dateTime).getHours()}:${new Date(
          event.start.dateTime
        ).getMinutes()}`
      );
      const endMinutes = timeToMinutes(
        `${new Date(event.end.dateTime).getHours()}:${new Date(
          event.end.dateTime
        ).getMinutes()}`
      );
      return { start: startMinutes, end: endMinutes };
    });

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
      newDisabledDates.push(new Date(day));
    } else {
      sortedSlots.set(day, chunks);
    }
  }

  if (currentMinutes > end - timeLimiter) {
    newDisabledDates.push(new Date());
  }

  // if (eventMap.size > 0 || newDisabledDates.length > 0) {
  console.log("setState in sortDatesTimes", dataUpdatedAt);

  setState((prevState) => ({
    ...prevState,
    disabledDates: newDisabledDates,
    sortedTimes: sortedSlots,
    lastUpdated: dataUpdatedAt,
  }));
  // }

  return sortedSlots;
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

function useSortedTimes({ date, endDate, queryKey }) {
  console.log("<useSortedTimes />");
  const { state } = useContext(ScheduleContext);

  useEvents(queryKey);

  return state.sortedTimes?.get(endDate) || createFullDay(date);
}

function useEvents(queryKey) {
  console.log("<useEvents />");
  const {
    state,
    setState,
    state: { lastUpdated },
  } = useContext(ScheduleContext);
  const getEvents = async () => {
    const response = await fetch("http://localhost:3000/events");

    return await response.json();
  };

  const { data, dataUpdatedAt } = useQuery({
    queryKey,
    queryFn: getEvents,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 1,
  });

  useEffect(() => {
    // console.log("useEffect () => (useEvents)");
    if ((!state.sortedTimes && data) || lastUpdated !== dataUpdatedAt) {
      console.log("INSIDE useEffect () => (useEvents)");
      const eventMap = mapEvents(data);
      sortDatesTimes({ eventMap, setState, dataUpdatedAt });
    }
  }, [dataUpdatedAt]);
  console.log("LASTUPDATED:", lastUpdated);
  console.log("DATAUPDATED", dataUpdatedAt);
  console.log(new Date(dataUpdatedAt).toTimeString().slice(0, 8));
  // return { data };
}

export {
  maxDate,
  startTime,
  endTime,
  mapEvents,
  timeToMinutes,
  formatTime,
  sortDatesTimes,
  createFullDay,
  useEvents,
  useSortedTimes,
};
