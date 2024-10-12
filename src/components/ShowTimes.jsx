import React, { useEffect, useState } from "react";
import { useEvents } from "../hooks/useEvents";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function ShowTimes({ queryKey }) {
  //   console.log("<SHOWTIMES />");
  const [showForm, setShowForm] = useState({ selectedTime: false });
  const { dateId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const date = new Date(Number(dateId));
  const endDate = date.toDateString();
  const { showTimes } = useEvents({ queryKey, endDate, date });

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
