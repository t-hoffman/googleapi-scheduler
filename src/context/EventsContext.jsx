import React, { createContext, useContext, useState, useMemo } from "react";
import { useQuery } from "react-query";
import { mapEvents, sortDatesTimes } from "../hooks/useEvents";

export const EventsContext = createContext();

export function EventsProvider({ children }) {
  console.log("<EVENTSPROVIDER />");

  const [eventsData, setEventsData] = useState({
    disabledDates: [],
    sortedTimes: new Map(),
  });

  const getEvents = async () => {
    const response = await fetch("http://localhost:3000/events");
    return await response.json();
  };

  const query = useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
    staleTime: 1000 * 60 * 0.5,
  });

  const { data, isStale } = query;

  useMemo(() => {
    if (data?.length > 0) {
      const eventMap = mapEvents(data);
      const { newDisabledDates: disabledDates, sortedSlots } =
        sortDatesTimes(eventMap);

      setEventsData({
        disabledDates,
        sortedTimes: sortedSlots,
      });
    }
  }, [data?.length, isStale]);

  return (
    <EventsContext.Provider value={{ ...query, ...eventsData }}>
      {children}
    </EventsContext.Provider>
  );
}
