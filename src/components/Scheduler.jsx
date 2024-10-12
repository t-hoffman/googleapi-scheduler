import React, { useContext, useEffect, useState } from "react";
import Calendar from "react-calendar";
import "../Assets/Schedule.css";
import { useNavigate } from "react-router-dom";
import { ScheduleContext } from "../context/ScheduleContext";
import { maxDate, useEvents } from "../hooks/useEvents";
import { isBefore, isSameDay } from "date-fns";

export default function Scheduler({ queryKey }) {
  // console.log("<SCHEDULER />");

  // const {
  //   state,
  //   state: { disabledDates },
  // } = useContext(ScheduleContext);

  const navigate = useNavigate();

  const { disabledDates } = useEvents({ queryKey });

  const handleClick = (e) => navigate(`/schedule/${e.getTime()}`);

  const tileDisabled = ({ date, view }) =>
    view === "month" && disabledDates.find((dDate) => isSameDay(dDate, date));

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      if (
        !disabledDates.find((hDate) => isSameDay(hDate, date)) &&
        isBefore(new Date().setDate(new Date().getDate() - 1), date) &&
        isBefore(date, maxDate)
      ) {
        return "btn btn-primary border-3 border-dark";
      }
    }
  };

  return (
    <div>
      <h2>Please select a time:</h2>
      <Calendar
        maxDate={maxDate}
        minDate={new Date()}
        onChange={handleClick}
        tileClassName={tileClassName}
        tileDisabled={tileDisabled}
      />
    </div>
  );
}
