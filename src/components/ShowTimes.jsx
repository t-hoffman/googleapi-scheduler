import React, { useContext } from "react";
import { ScheduleContext } from "../context/ScheduleContext";
import { createFullDay, useEvents, useSortedTimes } from "../hooks/useEvents";
import { useNavigate, useParams } from "react-router-dom";

export default function ShowTimes({ queryKey }) {
  //   console.log("<SHOWTIMES />");
  const { dateId } = useParams();
  const { state } = useContext(ScheduleContext);
  const navigate = useNavigate();

  const date = new Date(Number(dateId));
  const endDate = date.toDateString();
  //   const showTimes = state.sortedTimes?.get(endDate) || createFullDay(date);
  const showTimes = useSortedTimes({ date, endDate, queryKey });

  return (
    <>
      <h1>ShowTimes for {date.toDateString()}</h1>
      <ul>
        {showTimes.map((time, idx) => {
          return <li key={idx}>{time}</li>;
        })}
      </ul>
      <button className="btn btn-primary" onClick={() => navigate("/")}>
        Back
      </button>
    </>
  );
}
