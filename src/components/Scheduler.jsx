import React, { useEffect } from "react";
import Calendar from "react-calendar";
import { useLocation, useNavigate } from "react-router-dom";
import { maxDate, timeZone, useEvents } from "../hooks/useEvents";
import { isBefore, isSameDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import "../Assets/Schedule.css";

export default function Scheduler() {
  // console.log("<SCHEDULER />");
  const location = useLocation();
  const defaultView = location.state?.defaultView || new Date();
  const navigate = useNavigate();
  const { disabledDates } = useEvents();

  const handleClick = (e) => {
    navigate(`/schedule/${e.getTime()}`, {
      state: { defaultView },
    });
  };

  const tileDisabled = ({ date, view }) =>
    view === "month" && disabledDates.find((dDate) => isSameDay(dDate, date));

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      if (
        !disabledDates.find((hDate) => isSameDay(hDate, date)) &&
        isBefore(new Date().setDate(new Date().getDate() - 1), date) &&
        isBefore(date, maxDate)
      ) {
        return "btn btn-primary border-3 border-dark";
      }
    }
  };

  // For Chrome browser since it persist BrowserHistory (useLocation) state between sessions
  useEffect(() => {
    const handleRefresh = () =>
      navigate(location.pathname, { state: { defaultView: new Date() } });

    window.addEventListener("beforeunload", handleRefresh);

    return () => window.removeEventListener("beforeunload", handleRefresh);
  }, []);

  return (
    <div>
      <h2>Please select a time:</h2>
      <Calendar
        maxDate={maxDate}
        minDate={toZonedTime(new Date(), timeZone)}
        onChange={handleClick}
        tileClassName={tileClassName}
        tileDisabled={tileDisabled}
        defaultValue={defaultView}
      />
    </div>
  );
}
