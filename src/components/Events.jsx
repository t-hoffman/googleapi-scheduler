import React from "react";
import { useDeleteEvent } from "../hooks/useEvents";
import { BarLoader } from "react-spinners";
import { CALENDAR_ID } from "../context/GoogleAuth";

export function EventList({ query }) {
  const { data } = query;

  return data.events.map((event) => {
    let noTime;
    if (event.start.date) {
      const [year, month, day] = event.start.date.split("-").map(Number);
      noTime = new Date(year, month - 1, day);
      noTime.setHours(0, 0, 1);
    }
    const date = event.start.dateTime
      ? new Date(event.start.dateTime).toDateString()
      : noTime.toDateString();

    return <Event date={date} event={event} key={event.id} />;
  });
}

export function Event({ date, event, user }) {
  const { mutate, isPending } = useDeleteEvent(event.id);
  const isConsult = event.summary.toLowerCase().includes("consult");

  return (
    <div
      className="row border-bottom border-secondary rounded-end-3 mt-2 pb-1"
      style={{ "--bs-border-opacity": 0.5 }}
    >
      <div className="col">
        <b className="opacity-75">
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
