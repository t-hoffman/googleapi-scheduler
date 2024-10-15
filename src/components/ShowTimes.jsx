import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEvents, createFullDay } from "../hooks/useEvents";
import ScheduleForm from "./ScheduleForm";
import { isSameDay } from "date-fns";

export default function ShowTimes() {
  //   console.log("<SHOWTIMES />");
  const [showForm, setShowForm] = useState({ selectedTime: false });
  const { dateId } = useParams();
  const navigate = useNavigate();

  const date = new Date(Number(dateId));
  const selectedDate = date.toDateString();
  const { disabledDates, isLoading, refetch, sortedTimes } = useEvents();

  const getShowTimes = () => {
    const timesForDate = sortedTimes?.get(selectedDate) || [];
    const isDisabled = disabledDates.some((dDate) => isSameDay(dDate, date));

    if (isDisabled) return false; // Return false if the date is disabled
    if (isLoading) return timesForDate; // Return times or empty array if loading
    return timesForDate.length ? timesForDate : createFullDay(date); // Return times or full day
  };

  const showTimes = getShowTimes();

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
          <h1>ShowTimes for {selectedDate}</h1>
          <TimeList showTimes={showTimes} setShowForm={setShowForm} />
        </>
      )}
      {showForm.selectedTime && (
        <ScheduleForm
          date={date}
          selectedTime={showForm.selectedTime}
          refetch={refetch}
        />
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
