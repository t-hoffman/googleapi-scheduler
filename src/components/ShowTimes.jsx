import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toZonedTime } from "date-fns-tz";
import { format, isSameDay } from "date-fns";
import { useEvents, getShowTimes, maxDate, timeZone } from "../hooks/useEvents";
import ScheduleForm from "./ScheduleForm";
import { isWeekend } from "./Scheduler";
import TimeList from "./TimeList";
import { BackIcon } from "./Icons";

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
      isWeekend(date) ||
      (!showTimes && !isSubmitting)
    ) {
      if (month && day && year) {
        navigate("/");
      } else {
        setSelectedDate(null);
      }
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

  return !isNaN(date) ? (
    <div className="show-times-container schedule-w-356">
      <div className="text-center show-times-title">
        {!selectedTime ? (
          <span>{format(date, "MMMM do")}</span>
        ) : (
          <React.Fragment>
            Schedule Consultation
            <br />
            {format(date, "M/d/yyyy")} @{" "}
            <b className="text-primary">{selectedTime}</b>
          </React.Fragment>
        )}
      </div>
      <div className={!selectedTime ? "show-times" : "schedule-form"}>
        {!selectedTime ? (
          <TimeList showTimes={showTimes} setSelectedTime={setSelectedTime} />
        ) : (
          <ScheduleForm
            date={date}
            selectedTime={selectedTime}
            onSubmitForm={() => setIsSubmitting(true)}
            setSelectedDate={setSelectedDate}
          />
        )}
        <BackButton onClick={handleBackButton} />
      </div>
    </div>
  ) : null;
}

export const BackButton = ({ onClick }) => (
  <div
    className={`d-flex align-items-center justify-content-center fit-content pt-4`}
    style={{ cursor: "pointer", margin: "0 auto" }}
    onClick={onClick}
  >
    <BackIcon width="15px" height="15px" style={{ fill: "#a1a1aa" }} />
    <div className="px-1">
      <b style={{ color: "#a1a1aa", fontSize: "1rem" }}>Go Back</b>
    </div>
  </div>
);
