import React, { useContext } from "react";
import { useEvents } from "../hooks/useEvents";
import { GoogleAuthContext } from "../context/GoogleAuth";
import { Event } from "./Events";
import Scheduler from "./Scheduler";

export default function Admin() {
  const { userInfo, googleAuthLogout } = useContext(GoogleAuthContext);
  const query = useEvents(),
    { dataUpdatedAt } = query;

  const mapEvents = query.data.events.map((event) => {
    let noTime;
    if (event.start.date) {
      const [year, month, day] = event.start.date.split("-").map(Number);
      noTime = new Date(year, month - 1, day);
      noTime.setHours(0, 0, 1);
    }
    const date = event.start.dateTime
      ? new Date(event.start.dateTime).toDateString()
      : noTime.toDateString();

    return <Event date={date} event={event} user={userInfo} key={event.id} />;
  });

  return (
    <div className="container p-0 justify-content-center">
      <Scheduler />
      <div className="container mt-5 text-start">
        <h1>
          Google Calendar Events:
          <small className="text-secondary opacity-50">
            &nbsp; ({new Date(dataUpdatedAt).toTimeString().slice(0, 8)})
          </small>
        </h1>
        <div className="container text-center">{mapEvents}</div>
      </div>
      {userInfo && (
        <div className="d-flex justify-content-end p-0 mt-4 pe-3">
          <button className="btn btn-primary" onClick={googleAuthLogout}>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
