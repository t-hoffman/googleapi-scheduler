import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEvents, getShowTimes, maxDate, timeZone } from "../hooks/useEvents";
import ScheduleForm from "./ScheduleForm";
import { toZonedTime } from "date-fns-tz";
import { format, isSameDay } from "date-fns";
import { checkWeekend } from "./Scheduler";
import TimeList from "./TimeList";

export default function ShowTimes({
  query = useEvents(),
  selectedDate,
  setSelectedDate,
}) {
  // console.log("<SHOWTIMES />");
  const [selectedTime, setSelectedTime] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const navigater = useNavigate();
  const navigate = (loc) => navigater(loc, { state: location.state });
  let { month, day, year } = useParams();

  const date =
    selectedDate || new Date(Number(year), Number(month) - 1, Number(day));
  const minDate = toZonedTime(new Date(), timeZone);
  const showTimes = getShowTimes(date.toDateString(), query);

  useEffect(() => {
    if (
      isNaN(date) ||
      (date < minDate && !isSameDay(date, minDate)) ||
      (date > maxDate && !isSameDay(date, maxDate)) ||
      checkWeekend(date) ||
      (!showTimes && !isSubmitting)
    ) {
      navigate("/");
    }
  }, [date, minDate, maxDate, isSubmitting, showTimes]);

  const handleBackButton = () => {
    if (!selectedTime) {
      setSelectedDate
        ? setSelectedDate(null)
        : navigate(location.state?.prevPath || "/");
    } else {
      setSelectedTime(false);
      setIsSubmitting(false);
    }
  };

  return (
    !isNaN(date) && (
      <div className="container schedule-w-356">
        {!selectedTime && (
          <div className="row show-times-container">
            <div
              className="text-center p-2 show-times-title"
              style={{ fontSize: "1.5rem", fontWeight: "500" }}
            >
              <span style={{ fontSize: "1rem" }}>
                {format(date, "MMMM do")}
              </span>
            </div>
            <div className="show-times">
              <TimeList
                showTimes={showTimes}
                setSelectedTime={setSelectedTime}
              />
            </div>
          </div>
        )}
        <div className="row">
          {selectedTime && (
            <ScheduleForm
              date={date}
              selectedTime={selectedTime}
              onSubmitForm={() => setIsSubmitting(true)}
              setSelectedDate={setSelectedDate}
            />
          )}
        </div>
        <button className="mt-4 btn btn-secondary" onClick={handleBackButton}>
          Back
        </button>
      </div>
    )
  );
}
