import React, { createContext, useEffect, useMemo } from "react";
import { useQuery } from "react-query";
import { mapEvents, sortDatesTimes } from "../hooks/useEvents";

export const EventsContext = createContext();

export function EventsProvider({ children }) {
  console.log("<EVENTSPROVIDER />");

  const getEvents = async () => {
    const response = await fetch("/api/events/");
    return await response.json();
  };

  const query = useQuery({
      queryKey: ["events"],
      queryFn: getEvents,
      staleTime: 1000 * 60 * 1,
      // refetchOnWindowFocus: true,
      // refetchOnReconnect: true,
    }),
    { data, isStale, refetch } = query;

  const eventsData = useMemo(() => {
    if (data?.length > 0) {
      const eventMap = mapEvents(data);

      return sortDatesTimes(eventMap);
    }

    return { disabledDates: [], sortedTimes: new Map() };
  }, [data, isStale]);

  useEffect(() => {
    if (isStale) refetch();
  }, [isStale, refetch]);

  return (
    <EventsContext.Provider value={{ ...query, ...eventsData }}>
      {children}
    </EventsContext.Provider>
  );
}
