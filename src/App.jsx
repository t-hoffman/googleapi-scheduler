import React from "react";
import Scheduler from "./Components/Scheduler";
import { Route, Routes } from "react-router-dom";
import ShowTimes from "./components/ShowTimes";
import { useEvents } from "./hooks/useEvents";

export function Home() {
  // console.log("<HOME />");

  const { dataUpdatedAt, data: eventData } = useEvents();
  const mapEvents = eventData?.map((event) => (
    <h2 key={event.id}>{event.summary}</h2>
  ));

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
