import React from "react";
import { timeZone, useDeleteEvent, userTimeZone } from "../hooks/useEvents";
import { BarLoader } from "react-spinners";
import { CALENDAR_ID } from "../context/GoogleAuth";
import { formatInTimeZone } from "date-fns-tz";

export function EventList({ query, user, consult }) {
  const { data } = query;
  let consultCount = 0,
    nonConsult = 0;

  return data.events.map((event) => {
    let noTime;
    if (event.start.date) {
      const [year, month, day] = event.start.date.split("-").map(Number);
      noTime = new Date(year, month - 1, day);
      noTime.setHours(0, 0, 1);
    }
    const dateObj = event.start.dateTime
      ? new Date(event.start.dateTime)
      : new Date(noTime);
    const date = formatInTimeZone(dateObj, timeZone, "EEE MMM dd yyyy");
    const isConsult = event.summary.toLowerCase().includes("consult");

    if (consult == null) {
      consultCount++;
      return (
        <Event
          date={date}
          event={event}
          user={user}
          isEven={consultCount % 2 === 0}
          key={event.id}
        />
      );
    }

    if ((consult === true && isConsult) || (consult === false && !isConsult)) {
      nonConsult++;
      return (
        <Event
          date={date}
          event={event}
          user={user}
          isEven={nonConsult % 2 === 0}
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
