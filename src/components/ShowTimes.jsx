import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEvents, createFullDay, getShowTimes } from "../hooks/useEvents";
import ScheduleForm from "./ScheduleForm";
import { isSameDay } from "date-fns";

export default function ShowTimes() {
  //   console.log("<SHOWTIMES />");
  const [showForm, setShowForm] = useState({ selectedTime: false });
  const { dateId } = useParams();
  const navigate = useNavigate();

  const date = new Date(Number(dateId));
  const selectedDate = date.toDateString();
  const query = useEvents();
  const { disabledDates, isLoading, sortedTimes } = query;

  const showTimes = getShowTimes(selectedDate, query);

  return (
    <>
      {!showForm.selectedTime && (
        <>
          <h1>ShowTimes for {selectedDate}</h1>
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
  const navigate = useNavigate();

  useEffect(() => {
    if (!showTimes) navigate("/");
  }, [showTimes]);

  if (!showTimes) {
    return null;
  }

  return (
    <ul style={{ listStyle: "none" }}>
      {showTimes.length > 0 ? (
        showTimes.map((time, idx) => (
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
        ))
      ) : showTimes.length === 0 ? (
        <>Loading ...</>
      ) : (
        <>
          <h3>Sorry, but there are no more times left.</h3>If you are not
          automatically redirected please <Link to="/">click here</Link>.
        </>
      )}
    </ul>
  );
}
