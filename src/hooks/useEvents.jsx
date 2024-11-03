import { useIsMutating, useQuery } from "@tanstack/react-query";
import { getShowTimes, setTimeOnDate, sortDatesTimes } from "../utils/events";
import {
  apiUrl,
  startTime,
  endTime,
  maxDate,
  openSaturday,
  openSunday,
  queryStaleTime,
  timeBuffer,
  timeZone,
  userTimeZone,
} from "../config";
import { useAddEvent } from "./useAddEvent";
import { useDeleteEvent } from "./useDeleteEvent";

// Hook to access events & getEvents function for react-query
const initialEventData = {
  events: [],
  disabledDates: [],
  sortedTimes: new Map(),
};

const getEvents = async () => {
  console.log("getting");
  const response = await fetch(`${apiUrl}/events/`);
  if (!response.ok) {
    throw new Error("Failed to fetch events.");
  }
  const events = await response.json();
  const { disabledDates, sortedTimes } = sortDatesTimes(events);
  return { events, disabledDates, sortedTimes };
};

function useEvents() {
  /**
   * useIsMutating :: subscribe to active ['add_event'] mutations. If any active, disable
   * the query and use the cache.  This was helpful when the app was using the /schedule route.
   * When an event was added, the UI was optimistically updated and clicking on "Home" after
   * adding, the event would disappear since useEvents refetched & ['add_event'] had not yet
   * completed its POST. Once invalidateQueries was invoked (['add_event'].onSuccess) the
   * event would re-appear.
   */
  const mutationCount = useIsMutating({
    filters: { queryKey: ["add_event"], status: "pending" },
  });

  return useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
    initialData: initialEventData,
    refetchInterval: queryStaleTime,
    refetchOnWindowFocus: true,
    enabled: mutationCount < 1,
  });
}

export {
  apiUrl,
  startTime,
  endTime,
  maxDate,
  openSaturday,
  openSunday,
  queryStaleTime,
  timeBuffer,
  timeZone,
  userTimeZone,
  getShowTimes,
  setTimeOnDate,
  sortDatesTimes,
  useEvents,
  useAddEvent,
  useDeleteEvent,
};
