import React from "react";
import { timeZone, useDeleteEvent } from "../hooks/useEvents";
import { BarLoader } from "react-spinners";
import { CALENDAR_ID } from "../constants";
import { formatInTimeZone } from "date-fns-tz";

export function EventList({ query, user, consult }) {
  const { data } = query;
  let eventCount = 0;

  return data.events.map((event) => {
    let noTime;
    if (event.start.date) {
      const [year, month, day] = event.start.date.split("-").map(Number);
      noTime = new Date(year, month - 1, day);
      noTime.setHours(0, 0, 1);
    }
    const dateObj = new Date(noTime || event.start.dateTime);

    /*

    REVIEW THIS FOR DATES WITH ALL DAY EVENTS IN PERTH AUS TZ

    */
    const date = formatInTimeZone(dateObj, timeZone, "EEE MMM dd yyyy");
    const isConsult = event.summary.toLowerCase().includes("consult");

    if (
      (consult === true && isConsult) ||
      (consult === false && !isConsult) ||
      consult === undefined ||
      consult === null
    ) {
      eventCount++;
      return (
        <Event
          date={date}
          event={event}
          user={user}
          isEven={eventCount % 2 === 0}
          key={event.id}
        />
      );
    }

    return null;
  });
}

export function Event({ date, event, isEven, user }) {
  const { mutate, isPending } = useDeleteEvent(event.id);
  const isConsult = event.summary.toLowerCase().includes("consult");

  return (
    <div
      className="row border-bottom border-secondary rounded-end-3 mt-2 pb-1"
      style={{ "--bs-border-opacity": 0.5 }}
    >
      <div className="col">
        <b className={`opacity-75 ${isEven && "text-secondary"}`}>
          {event.summary}
          <br />
          <span style={{ fontSize: "8pt" }}>{date}</span>
        </b>
      </div>
      {user && user.email === CALENDAR_ID && isConsult && (
        <div className="col-auto align-self-center">
          <button
            className="btn btn-danger opacity-75"
            disabled={isPending}
            style={{ width: "75px" }}
            onClick={mutate}
          >
            {!isPending ? (
              "Delete"
            ) : (
              <BarLoader
                color="#fff"
                width={50}
                height={5}
                cssOverride={{
                  borderRadius: "50px",
                  position: "relative",
                  top: -3,
                }}
              />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
