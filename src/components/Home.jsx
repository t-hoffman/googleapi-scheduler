import React from "react";
import { useEvents } from "../hooks/useEvents";
import { EventList } from "./Events";
import Scheduler from "./Scheduler";
import { PulseLoader } from "react-spinners";

export default function Home() {
  // console.log("<HOME />");
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
          {!query.isFetched ? (
            <PulseLoader
              color="#fff"
              cssOverride={{ opacity: "20%" }}
              size={10}
              speedMultiplier={0.7}
              className="py-3"
            />
          ) : (
            <EventList query={query} consult={true} />
          )}
        </div>
      </div>
    </div>
  );
}
