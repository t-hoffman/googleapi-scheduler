import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEvents, createFullDay } from "../hooks/useEvents";
import ScheduleForm from "./ScheduleForm";

export default function ShowTimes() {
  //   console.log("<SHOWTIMES />");
  const [showForm, setShowForm] = useState({ selectedTime: false });
  const { dateId } = useParams();
  const navigate = useNavigate();

  const date = new Date(Number(dateId));
  const endDate = date.toDateString();
  const { isLoading, refetch, sortedTimes } = useEvents();

  const getTimes = sortedTimes?.get(endDate);
  const showTimes = isLoading ? [] : getTimes || createFullDay(date);

  const navigateBack = () => {
    refetch();
    navigate("/", {
      state: { defaultView: date },
    });
  };

  return (
    <>
      {!showForm.selectedTime && (
        <>
          <h1>ShowTimes for {date.toDateString()}</h1>
          <TimeList showTimes={showTimes} setShowForm={setShowForm} />
        </>
      )}
      {showForm.selectedTime && (
        <ScheduleForm date={date} selectedTime={showForm.selectedTime} />
      )}
      <p>&nbsp;</p>
      <button
        className="btn btn-secondary"
        onClick={() =>
          showForm.selectedTime
            ? setShowForm({ selectedTime: false })
            : navigateBack()
        }
      >
        Back
      </button>
    </>
  );
}

function TimeList({ showTimes, setShowForm }) {
  return (
    <ul style={{ listStyle: "none" }}>
      {showTimes?.map((time, idx) => {
        return (
          <li className="mt-3" key={idx}>
            <button
              className="btn btn-primary"
              onClick={() =>
                setShowForm((prevState) => ({
                  ...prevState,
                  selectedTime: time,
                }))
              }
            >
              {time}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
