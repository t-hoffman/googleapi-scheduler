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

export const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return (!openSunday && day === 0) || (!openSaturday && day === 6);
};

export default function Scheduler() {
  // console.log("<SCHEDULER />");
  const [selectedDate, setSelectedDate] = useState(null);
  const [defaultStartDate, setDefaultStartDate] = useState();
  const [currentMonthView, setCurrentMonthView] = useState(null);
  const dateRef = useRef();
  const query = useEvents();

  const viewAvailability = new Set();
  const minDate = toZonedTime(new Date(), timeZone);
  const { disabledDates, events } = query.data;

  const tileDisabled = ({ date, view }) => {
    const isDisabled = disabledDates.some((dDate) => isSameDay(dDate, date));
    if (view === "month" && (isDisabled || isWeekend(date))) {
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
        !isWeekend(date);

      if (isAvailable && events.length) {
        viewAvailability.add(date.toString());
      }

      return isAvailable && "btn btn-primary border-2 border-black";
    }
  };

  const successfulMutations = useMutationState({
    filters: { status: "success" },
    select: (mutation) => mutation.state.variables,
  });

  useEffect(() => {
    if (viewAvailability.size === 0 && events.length > 0 && !selectedDate) {
      const nextMonthStartDate = new Date(
        minDate.getFullYear(),
        minDate.getMonth() + 1,
        1
      );
      setDefaultStartDate(nextMonthStartDate);
    } else if (
      defaultStartDate &&
      defaultStartDate.getMonth() > minDate.getMonth()
    ) {
      const minViewAvailable = successfulMutations.some((event) => {
        const eventMonth = new Date(event.startDate).getMonth();
        const dateIsDisabled = disabledDates.some(
          (dDate) =>
            new Date(dDate).toDateString() ===
            new Date(event.endDate).toDateString()
        );
        return eventMonth === minDate.getMonth() && !dateIsDisabled;
      });

      if (minViewAvailable) setDefaultStartDate(null);
    }
  }, [selectedDate, viewAvailability.size, events.length, currentMonthView]);

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
        setCurrentMonthView(activeStartDate)
      }
      onClickDay={(value) => setSelectedDate(value)}
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
