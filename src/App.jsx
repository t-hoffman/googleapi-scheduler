import React from "react";
import Scheduler from "./Components/Scheduler";
import { Route, Routes } from "react-router-dom";
import ShowTimes from "./components/ShowTimes";
import { useEvents } from "./hooks/useEvents";

export function Home() {
  // console.log("<HOME />");

  const { dataUpdatedAt, data: eventData } = useEvents();
  const mapEvents = eventData?.map((event, idx) => {
    const date = event.start.dateTime
      ? new Date(event.start.dateTime).toDateString()
      : new Date(event.start.date).toDateString();

    return (
      <div key={idx}>
        <b>
          {event.summary}
          <br />
          <span style={{ fontSize: "8pt" }}>{date}</span>
        </b>
      </div>
    );
  });

  return (
    <>
      <Scheduler />
      <p>&nbsp;</p>
      <h1>EVENTS ({new Date(dataUpdatedAt).toTimeString().slice(0, 8)}):</h1>
      {mapEvents}
    </>
  );
}

export function App() {
  // console.log("<APP />");

  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="schedule" element={<ShowTimes />}>
        <Route path=":dateId" element={<ShowTimes />} />
      </Route>
    </Routes>
  );
}
