import React, { useContext, useEffect, useState } from "react";
import Calendar from "react-calendar";
import "../Assets/Schedule.css";
import { useNavigate } from "react-router-dom";
import { ScheduleContext } from "../context/ScheduleContext";
import {
  mapEvents,
  maxDate,
  sortDatesTimes,
  useEvents,
} from "../hooks/useEvents";
import { format, isBefore, isSameDay } from "date-fns";

export default function Scheduler({ queryKey }) {
  // console.log("<SCHEDULER />");

  const {
    state,
    state: { disabledDates },
    setState,
  } = useContext(ScheduleContext);
  // console.log(state);
  const navigate = useNavigate();

  useEvents(queryKey);

  // const { data, dataUpdatedAt } = useEvents(queryKey);

  // useEffect(() => {
  //   // console.log("useEffect - sched");
  //   if (data) {
  //     // console.log("inside useEff - sched");
  //     const eventMap = mapEvents(data);
  //     sortDatesTimes({ eventMap, setState });

  //     // console.log("setstate in useEff");
  //     // setState((prevState) => ({ ...prevState, sortedTimes }));
  //   }
  // }, [data]);
  // console.log(new Date(dataUpdatedAt).toTimeString().slice(0, 8));

  const handleClick = (e) => {
    console.log(e);
    navigate(`/schedule/${e.getTime()}`);
    console.log(e);
  };

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
