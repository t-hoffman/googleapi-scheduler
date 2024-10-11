import React, { useState } from "react";
import Scheduler from "./Components/Scheduler";
import { Route, Routes } from "react-router-dom";
import ShowTimes from "./components/ShowTimes";
import Test from "./components/Test";

export function Home({ setDate }) {
  // console.log("<HOME />");

  const queryKey = ["events"];
  //   const { data: eventData } = useEvents(queryKey)
  //   const mapEvents = eventData?.map((event) => (
  //     <h2 key={event.id}>{event.summary}</h2>
  //   ));

  return (
    <>
      <Scheduler queryKey={queryKey} />
      <p>&nbsp;</p>
      <h1>EVENTS:</h1>
      {/* {mapEvents} */}
    </>
  );
}

export function App() {
  // const [date, setDate] = useState(null);
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
