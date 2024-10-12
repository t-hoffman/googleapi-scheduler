import React from "react";
import Scheduler from "./Components/Scheduler";
import { Route, Routes } from "react-router-dom";
import ShowTimes from "./components/ShowTimes";
import Test from "./components/Test";
import { useEvents } from "./hooks/useEvents";

export function Home({ setDate }) {
  // console.log("<HOME />");

  const queryKey = ["events"];
  const { dataUpdatedAt, data: eventData } = useEvents(queryKey);
  const mapEvents = eventData?.map((event) => (
    <h2 key={event.id}>{event.summary}</h2>
  ));

  return (
    <>
      <Scheduler queryKey={queryKey} />
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
      <Route path="test" element={<Test />} />
    </Routes>
  );
}
