import React, { createContext, useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";
import { mapEvents, sortDatesTimes } from "../hooks/useEvents";

export const EventsContext = createContext();

export function EventsProvider({ children }) {
  // console.log("<EVENTSPROVIDER />");

  const [isFresh, setIsFresh] = useState(false);

  const getEvents = async () => {
    const response = await fetch("/api/events/");
    return await response.json();
  };

  const query = useQuery({
      queryKey: ["events"],
      queryFn: getEvents,
      staleTime: 1000 * 5,
      onSuccess: () => {
        console.log("success");
        setIsFresh((prev) => !prev);
      },
      // refetchOnWindowFocus: true,
      // refetchOnReconnect: true,
    }),
    { data, dataUpdatedAt, isLoading, isStale, refetch } = query;
  console.log(isFresh);
  const eventsData = useMemo(() => {
    if (isLoading || !data)
      return { disabledDates: [], sortedTimes: new Map() };

    // if (data?.length > 0) {
    const eventMap = mapEvents(data);
    console.log("sortedDatesTime");
    return sortDatesTimes(eventMap);
    // }
  }, [data, isStale, isFresh, dataUpdatedAt]);

  useEffect(() => {
    if (isFresh) setIsFresh(!isFresh);
  }, [isFresh]);

  // useEffect(() => {
  //   if (isStale) refetch();
  // }, [isStale, refetch]);

  return (
    <EventsContext.Provider value={{ ...query, ...eventsData }}>
      {children}
    </EventsContext.Provider>
  );
}
