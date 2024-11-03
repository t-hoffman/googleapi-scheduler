import React, { useEffect, useRef, useState } from "react";
import Calendar from "react-calendar";
import {
  maxDate,
  openSaturday,
  openSunday,
  timeZone,
  userTimeZone,
  useEvents,
} from "../hooks/useEvents";
import { isBefore, isSameDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { useMutationState } from "@tanstack/react-query";
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
  const [monthView, setMonthView] = useState(null);
  const dateRef = useRef();
  const query = useEvents();
  const { disabledDates, events } = query.data;
  const viewAvailability = new Set();
  const minDate = toZonedTime(new Date(), timeZone);

  const tileDisabled = ({ date, view }) => {
    const isDisabled = disabledDates.some((dDate) => isSameDay(dDate, date));
    if (view === "month" && (isDisabled || checkWeekend(date))) {
      viewAvailability.delete(date.toString());
      return true;
    }
  };

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
        viewAvailability.add(date.toString());
      }

      return isAvailable && "btn btn-primary border-2 border-black";
    }
  };

  const mutations = useMutationState({
    filters: { status: "success" },
    select: (mutation) => mutation.state.variables,
  });

  useEffect(() => {
    const minViewAvailable = mutations.some((event) => {
      const minDateMonth = minDate.getMonth();
      const eventMonth = new Date(event.startDate).getMonth();
      return eventMonth === minDateMonth;
    });

    if (viewAvailability.size === 0 && events.length > 0 && !selectedDate) {
      const now = new Date();
      setDefaultStartDate(new Date(now.getFullYear(), now.getMonth() + 1, 1));
    } else if (
      defaultStartDate &&
      minViewAvailable &&
      defaultStartDate.getMonth() > minDate.getMonth()
    ) {
      setDefaultStartDate(null);
    }
  }, [selectedDate, viewAvailability.size, events.length, monthView]);

  if (dateRef.current !== selectedDate && selectedDate !== null) {
    dateRef.current = selectedDate;
  }

  return !selectedDate ? (
    <Calendar
      key={defaultStartDate ? defaultStartDate : events.length}
      calendarType="gregory"
      minDate={defaultStartDate || minDate}
      maxDate={maxDate}
      onActiveStartDateChange={({ _action, activeStartDate }) =>
        setMonthView(activeStartDate)
      }
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
