import React, { useContext } from "react";
import { useEvents } from "../hooks/useEvents";
import { GoogleAuthContext } from "../context/GoogleAuth";
import { EventList } from "./Events";
import Scheduler from "./Scheduler";
import { PulseLoader } from "react-spinners";

export default function Admin() {
  const { userInfo, googleAuthLogout } = useContext(GoogleAuthContext);
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
            <EventList query={query} user={userInfo} consult={true} />
          )}
        </div>
        <h3 className="mt-4">Other Events:</h3>
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
            <EventList query={query} consult={false} />
          )}
        </div>
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
