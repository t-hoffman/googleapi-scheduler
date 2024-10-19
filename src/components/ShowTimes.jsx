import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEvents, getShowTimes, maxDate, timeZone } from "../hooks/useEvents";
import ScheduleForm from "./ScheduleForm";
import { toZonedTime } from "date-fns-tz";
import { format, isSameDay } from "date-fns";

export default function ShowTimes() {
  // console.log("<SHOWTIMES />");
  const [showForm, setShowForm] = useState({ selectedTime: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  let { month, day, year } = useParams();
  const navigate = useNavigate();
  const query = useEvents();

  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const selectedDate = date.toDateString();
  const minDate = toZonedTime(new Date(), timeZone);
  const showTimes = getShowTimes(selectedDate, query);

  useEffect(() => {
    if (
      (date < minDate && !isSameDay(date, minDate)) ||
      (date > maxDate && !isSameDay(date, maxDate)) ||
      (!showTimes && !isSubmitting)
    ) {
      navigate("/");
    }
  }, [date, minDate, maxDate, isSubmitting, showTimes]);

  const backButton = () => {
    if (!showForm.selectedTime) {
      navigate("/");
    } else {
      setShowForm({ selectedTime: false });
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {!showForm.selectedTime && (
        <>
          <h1>ShowTimes {format(date, "MMM do, yyyy")}</h1>
          <TimeList showTimes={showTimes} setShowForm={setShowForm} />
        </>
      )}
      {showForm.selectedTime && (
        <ScheduleForm
          date={date}
          selectedTime={showForm.selectedTime}
          onSubmitForm={() => {
            setIsSubmitting(true);
          }}
        />
      )}
      <p>&nbsp;</p>
      <button className="btn btn-secondary" onClick={backButton}>
        Back
      </button>
    </>
  );
}

/*

  REFACTOR: MOVE <ScheduleForm /> TO THIS COMPONENT

*/
function TimeList({ showTimes, setShowForm }) {
  return (
    showTimes && (
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
        ) : (
          <>Loading ...</>
        )}
      </ul>
    )
  );
}
