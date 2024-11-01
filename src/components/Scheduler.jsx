import React, { useEffect, useRef, useState } from "react";
import Calendar from "react-calendar";
import {
  maxDate,
  openSaturday,
  openSunday,
  timeZone,
  useEvents,
  userTimeZone,
} from "../hooks/useEvents";
import { isBefore, isSameDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { NextIcon, PrevIcon } from "./Icons";
import ShowTimes from "./ShowTimes";
import "../assets/Scheduler.css";

export const checkWeekend = (date) => {
  const dayOfWeek = new Date(date).getDay();
  return (!openSunday && dayOfWeek === 0) || (!openSaturday && dayOfWeek === 6);
};

export default function Scheduler() {
  // console.log("<SCHEDULER />");
  const [selectedDate, setSelectedDate] = useState(null);
  const [defaultStartDate, setDefaultStartDate] = useState();
  const dateRef = useRef();
  const monthsAvailable = useRef(new Set());
  const query = useEvents();
  const { disabledDates, events } = query.data;

  const tileDisabled = ({ date, view }) =>
    view === "month" &&
    (disabledDates.some((dDate) => isSameDay(dDate, date)) ||
      checkWeekend(date));

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const today = new Date();
      const zonedToday =
        userTimeZone !== timeZone
          ? toZonedTime(today.setDate(today.getDate() - 1), timeZone)
          : today.setDate(today.getDate() - 1);

      const isAvailable =
        !disabledDates.some((hDate) => isSameDay(hDate, date)) &&
        isBefore(zonedToday, date) &&
        isBefore(date, maxDate) &&
        !checkWeekend(date);

      if (isAvailable && events.length) {
        monthsAvailable.current.add(date);
      }

      return isAvailable && "btn btn-primary border-2 border-black";
    }
  };

  useEffect(() => {
    if (monthsAvailable.current.size === 0 && events.length > 0) {
      const now = new Date();
      setDefaultStartDate(new Date(now.getFullYear(), now.getMonth() + 1, 1));
    }
  }, [events.length]);

  if (dateRef.current !== selectedDate && selectedDate !== null) {
    dateRef.current = selectedDate;
  }

  return !selectedDate ? (
    <Calendar
      calendarType="gregory"
      minDate={defaultStartDate || toZonedTime(new Date(), timeZone)}
      maxDate={maxDate}
      onChange={(value) => setSelectedDate(value)}
      tileClassName={tileClassName}
      tileDisabled={tileDisabled}
      nextLabel={<NextIcon />}
      prevLabel={<PrevIcon />}
      defaultActiveStartDate={defaultStartDate || dateRef.current}
    />
  ) : (
    <ShowTimes
      query={query}
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
    />
  );
}
