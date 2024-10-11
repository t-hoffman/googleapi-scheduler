import { useEffect, useState } from "react";
import "./App.css";
import { useMutation, useQuery } from "react-query";

function App() {
  const getEvents = async () => {
    const response = await fetch("http://localhost:3000/events");

    return await response.json();
  };

  const { data: eventData } = useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
    // refetchOnWindowFocus: false,
  });

  const mapEvents = eventData?.map((event) => (
    <h2 key={event.id}>{event.summary}</h2>
  ));

  console.log(eventData);
  return (
    <>
      <h1>Calendar</h1>
      {mapEvents}
      <AddEvent />
    </>
  );
}

function AddEvent() {
  const addEvent = async (event) => {
    console.log(event);
    const resp = await fetch("http://localhost:3000/events?query=key", {
      method: "POST",
    });
    console.log(await resp.json());
  };

  const mutation = useMutation(addEvent);

  const handleClick = () => {
    mutation.mutate({ title: "TYLER" });
  };

  return (
    <>
      <h1>Add event</h1>
      <button onClick={handleClick}>Click Here!</button>
    </>
  );
}

export default App;
