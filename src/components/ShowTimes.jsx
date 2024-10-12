import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEvents, createFullDay } from "../hooks/useEvents";

export default function ShowTimes() {
  //   console.log("<SHOWTIMES />");
  const [showForm, setShowForm] = useState({ selectedTime: false });
  const { dateId } = useParams();
  const navigate = useNavigate();
  const date = new Date(Number(dateId));
  const endDate = date.toDateString();
  const { isLoading, sortedTimes } = useEvents();

  const getTimes = sortedTimes?.get(endDate);
  const showTimes =
    !isLoading && getTimes ? getTimes : isLoading ? [] : createFullDay(date);

  return (
    <>
      {!showForm.selectedTime && (
        <>
          <h1>ShowTimes for {date.toDateString()}</h1>
          <TimeList showTimes={showTimes} setShowForm={setShowForm} />
        </>
      )}
      {showForm.selectedTime && <ShowForm date={date} showForm={showForm} />}
      <p>&nbsp;</p>
      <button
        className="btn btn-secondary"
        onClick={() =>
          showForm.selectedTime
            ? setShowForm({ selectedTime: false })
            : navigate("/", {
                state: { defaultView: date },
              })
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

function ShowForm({ date, showForm: { selectedTime } }) {
  return (
    <h1>
      Form for {date.toDateString()}
      <br /> @{selectedTime}
    </h1>
  );
}
