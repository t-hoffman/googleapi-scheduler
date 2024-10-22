import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Scheduler from "./components/Scheduler";
import ShowTimes from "./components/ShowTimes";
import { useDeleteEvent, useEvents } from "./hooks/useEvents";
import {
  QueryClient,
  QueryClientProvider,
  useMutationState,
} from "@tanstack/react-query";
import { BarLoader } from "react-spinners";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  googleLogout,
} from "@react-oauth/google";

const queryClient = new QueryClient();
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const CALENDAR_ID = import.meta.env.VITE_GOOGLE_CALENDAR_ID;

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

export function Home() {
  console.log("<HOME />");
  const getUserData = () => {
    const userData = JSON.parse(sessionStorage.getItem("googleUserInfo"));
    if (!userData) return null;
    if (Date.now() > userData.exp * 1000) {
      sessionStorage.removeItem("googleToken");
      sessionStorage.removeItem("googleUserInfo");
      return null;
    }

    return userData;
  };
  const [user, setUser] = useState(getUserData());
  const query = useEvents();
  const { dataUpdatedAt } = query;

  const handleSuccess = (resp) => {
    const userData = parseJwt(resp.credential);
    setUser(userData);
    sessionStorage.setItem("googleToken", resp.credential);
    sessionStorage.setItem("googleUserInfo", JSON.stringify(userData));
  };

  const handleFailure = (err) => {
    console.log("Google sign in error: ", err);
  };

  const handleLogout = () => {
    googleLogout();
    setUser(null);
    sessionStorage.setItem("googleToken", null);
    sessionStorage.setItem("googleUserInfo", null);
  };

  const mapEvents = query.data.events.map((event, idx) => {
    const date = event.start.dateTime
      ? new Date(event.start.dateTime).toDateString()
      : new Date(event.start.date).toDateString();

    return <Event date={date} event={event} user={user} key={event.id} />;
  });

  return (
    <React.Fragment>
      <Scheduler />
      <div className="container mt-5">
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          {!user && (
            <div className="row g-0 mb-3 justify-content-end">
              <div className="col-auto">
                <GoogleLogin
                  onSuccess={handleSuccess}
                  onFailure={handleFailure}
                  size="large"
                  shape="pill"
                  theme="filled_black"
                />
              </div>
            </div>
          )}
          <h1>
            EVENTS ({new Date(dataUpdatedAt).toTimeString().slice(0, 8)}):
          </h1>
          <div className="container">{mapEvents}</div>
        </GoogleOAuthProvider>
        {user && (
          <div className="row-auto mt-4">
            <button className="btn btn-primary" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        )}
      </div>
    </React.Fragment>
  );
}

const Event = ({ date, event, user }) => {
  const { mutate, isPending } = useDeleteEvent(event.id);

  return (
    <div
      className="row border-bottom border-secondary rounded-end-3 mt-2 pb-1"
      style={{ "--bs-border-opacity": 0.5 }}
    >
      <div className="col">
        <b>
          {event.summary}
          <br />
          <span style={{ fontSize: "8pt" }}>{date}</span>
        </b>
      </div>
      {user && user.email === CALENDAR_ID && (
        <div className="col-auto align-self-center">
          <button
            className="btn btn-danger opacity-50"
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
};

export function App() {
  // console.log("<APP />");

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route index element={<Home />} />
          <Route path="schedule" element={<ShowTimes />}>
            <Route path=":month/:day/:year" element={<ShowTimes />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}
