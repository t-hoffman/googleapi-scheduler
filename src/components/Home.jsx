import React from "react";
import { useEvents } from "../hooks/useEvents";
import { EventList } from "./Events";
import Scheduler from "./Scheduler";

export default function Homes() {
  console.log("<HOME />");
  const query = useEvents();

  return (
    <div className="container p-0 justify-content-center">
      <Scheduler />
      <div className="container mt-5 text-start">
        <h1>
          Google Calendar Events:
          <small className="text-secondary opacity-50">
            &nbsp; ({new Date(query.dataUpdatedAt).toTimeString().slice(0, 8)})
          </small>
        </h1>
        <div className="container text-center">
          <EventList query={query} />
        </div>
      </div>
    </div>
  );
}
