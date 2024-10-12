import React from "react";
import { useEvents } from "../hooks/useEvents";
import { useNavigate, useParams } from "react-router-dom";

export default function ShowTimes({ queryKey }) {
  //   console.log("<SHOWTIMES />");
  const { dateId } = useParams();
  const navigate = useNavigate();

  const date = new Date(Number(dateId));
  const endDate = date.toDateString();

  const { showTimes } = useEvents({ queryKey, endDate, date });

  return (
    <>
      <h1>ShowTimes for {date.toDateString()}</h1>
      <ul>
        {showTimes?.map((time, idx) => {
          return <li key={idx}>{time}</li>;
        })}
      </ul>
      <button className="btn btn-primary" onClick={() => navigate("/")}>
        Back
      </button>
    </>
  );
}
