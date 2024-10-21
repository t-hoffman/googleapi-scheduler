import React, { useEffect, useRef, useState } from "react";
import Calendar from "react-calendar";
import { useNavigate } from "react-router-dom";
import {
  maxDate,
  openSaturday,
  openSunday,
  timeZone,
  useEvents,
  userTimeZone,
} from "../hooks/useEvents";
import { format, isBefore, isSameDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export default function Scheduler() {
  // console.log("<SCHEDULER />");
  const navigate = useNavigate();
  const query = useEvents(),
    { disabledDates } = query.data;

  const handleClick = (value, event) => {
    const dateParam = format(value, "LL/dd/y");
    navigate(`/schedule/${dateParam}`);
  };

  const checkWeekend = (date) => {
    const dayOfWeek = new Date(date).getDay();
    return (
      (!openSunday && dayOfWeek === 0) || (!openSaturday && dayOfWeek === 6)
    );
  };

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

      return isAvailable && "btn btn-primary border-3 border-dark";
    }
  };

  // useEffect(() => {
  //   // For Chrome browser since it persist BrowserHistory (useLocation) state between sessions
  //   const handleRefresh = () =>
  //     navigate(location.pathname, { state: { defaultView: new Date() } });
  //   window.addEventListener("beforeunload", handleRefresh);

  //   return () => window.removeEventListener("beforeunload", handleRefresh);
  // }, [location.pathname, navigate]);

  return (
    <div>
      <h2>Please select a time:</h2>
      <Calendar
        calendarType="gregory"
        maxDate={maxDate}
        minDate={toZonedTime(new Date(), timeZone)}
        onChange={handleClick}
        tileClassName={tileClassName}
        tileDisabled={tileDisabled}
      />
    </div>
  );
}
