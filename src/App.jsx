import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Scheduler from "./components/Scheduler";
import ShowTimes from "./components/ShowTimes";
import { useDeleteEvent, useEvents } from "./hooks/useEvents";
import { QueryClient, QueryClientProvider, useMutation } from "react-query";
import { BarLoader } from "react-spinners";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  googleLogout,
} from "@react-oauth/google";

const queryClient = new QueryClient();
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const CALENDAR_ID = import.meta.env.VITE_GOOGLE_CALENDAR_ID;

// const parseJwt = (token) => {
//   try {
//     const base64Url = token.split('.')[1];
//     const base64 = decodeURIComponent(
//       atob(base64Url)
//         .split('')
//         .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
//         .join('')
//     );
//     return JSON.parse(base64);
//   } catch (error) {
//     console.error('Failed to parse JWT:', error);
//     return null; // Return null if parsing fails
//   }
// };

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

export function Home() {
  // console.log("<HOME />");
  const userData = JSON.parse(sessionStorage.getItem("googleUserInfo"));
  const [user, setUser] = useState(userData);
  const query = useEvents();
  const { dataUpdatedAt, data } = query;

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

  const mapEvents = data.events?.map((event, idx) => {
    const date = event.start.dateTime
      ? new Date(event.start.dateTime).toDateString()
      : new Date(event.start.date).toDateString();

    return <Event date={date} event={event} user={user} key={idx} />;
  });

  return (
    <React.Fragment>
      <Scheduler />
      <div className="container mt-5">
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          {!user && (
            <div className="row mb-3">
              <div className="col-auto">
                <GoogleLogin
                  buttonText="Sign in with Google"
                  onSuccess={handleSuccess}
                  onFailure={handleFailure}
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
  const { error, mutate, isError, isLoading } = useDeleteEvent(event.id);

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
            style={{ width: "75px" }}
            onClick={mutate}
          >
            {!isLoading ? (
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
