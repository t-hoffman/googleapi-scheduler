import React from "react";
import Calendar from "react-calendar";
import { useLocation, useNavigate } from "react-router-dom";
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
import { NextIcon, PrevIcon } from "./Icons";
import "../assets/Scheduler.css";

export default function Scheduler() {
  // console.log("<SCHEDULER />");
  const location = useLocation();
  const navigate = useNavigate();
  const query = useEvents(),
    { disabledDates } = query.data;

  const handleClick = (value, event) => {
    const dateParam = format(value, "LL/dd/y");
    navigate(`/schedule/${dateParam}`, {
      state: { prevPath: location.pathname },
    });
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

      return isAvailable && "btn btn-primary border-3 border-black";
    }
  };

  return (
    <div className="container">
      <h2>Please select a time:</h2>
      <Calendar
        calendarType="gregory"
        maxDate={maxDate}
        minDate={toZonedTime(new Date(), timeZone)}
        onChange={handleClick}
        tileClassName={tileClassName}
        tileDisabled={tileDisabled}
        nextLabel={<NextIcon />}
        prevLabel={<PrevIcon />}
      />
    </div>
  );
}
