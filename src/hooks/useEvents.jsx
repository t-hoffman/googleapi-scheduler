import {
  useIsMutating,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getShowTimes, setTimeOnDate, sortDatesTimes } from "../utils/events";
import { toZonedTime } from "date-fns-tz";

// Scheduler configuration settings
const scheduleConfig = {
    startTime: "10:00",
    endTime: "13:00",
    openSaturday: false,
    openSunday: false,
    timeBuffer: 30, // Buffer time before/after events
    timeZone: "America/Los_Angeles",
    userTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    queryStaleTime: 1000 * 60 * 1,
    apiUrl: import.meta.env.VITE_API_URL,
  },
  {
    apiUrl,
    startTime,
    endTime,
    openSaturday,
    openSunday,
    queryStaleTime,
    timeBuffer,
    timeZone,
    userTimeZone,
  } = scheduleConfig;

// Maximum selection for today + end of next month
const today =
  userTimeZone !== timeZone ? toZonedTime(new Date(), timeZone) : new Date();
const maxDate = new Date(
  today.getFullYear(),
  today.getMonth() + 2,
  0,
  23,
  59,
  59
);

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

function useAddEvent() {
  const queryClient = useQueryClient();

  const postEvent = async (eventData) => {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    };
    const response = await fetch(`${apiUrl}/events/add`, options);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || response.statusText);
    }
    return data;
  };

  const optimisticUpdate = async (event) => {
    await queryClient.cancelQueries({ queryKey: ["events"] });
    const prevCache = queryClient.getQueryData(["events"]);
    queryClient.setQueryData(["events"], (old) => {
      const newEvent = {
        id: event.id,
        summary: event.summary,
        start: {
          dateTime: event.startDate,
          timeZone: event.timeZone,
        },
        end: {
          dateTime: event.endDate,
          timeZone: event.timeZone,
        },
      };
      const updatedEvents = [...old.events, newEvent].sort(
        (a, b) =>
          new Date(a.start.dateTime || a.start.date) -
          new Date(b.start.dateTime || b.start.date)
      );
      const { disabledDates, sortedTimes } = sortDatesTimes(updatedEvents);

      return {
        ...old,
        disabledDates,
        sortedTimes,
        events: updatedEvents,
      };
    });

    return { prevCache };
  };

  return useMutation({
    mutationKey: ["add_event"],
    mutationFn: postEvent,
    onMutate: optimisticUpdate,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["events"]);
      console.log("Form successfully submitted: ", data);
    },
    onError: (_error, _values, context) => {
      console.log("rollback");
      queryClient.setQueryData(["events"], context.prevCache);
    },
  });
}

function useDeleteEvent(eventId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["delete_event"],
    mutationFn: async () => {
      const googleToken = sessionStorage.getItem("googleToken");
      const resp = await fetch(`${apiUrl}/events/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Baerer ${googleToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message || resp.statusText);
      }
    },
    onMutate: () => queryClient.getQueryData(["events"]),
    onError: (err, _vars, context) => {
      queryClient.setQueryData(["events"], context);
      console.log("Error: ", err);
    },
    onSuccess: () => {
      const prevCache = queryClient.getQueryData(["events"]);
      if (!prevCache || !prevCache.events) return;

      const newEvents = prevCache.events.filter(({ id }) => id !== eventId);
      const { disabledDates, sortedTimes } = sortDatesTimes(newEvents);
      const newData = { events: newEvents, disabledDates, sortedTimes };
      queryClient.setQueryData(["events"], newData);

      console.log("Successfully deleted event: ", eventId);
    },
    onSettled: () => {
      /**
       * isMutating :: this is to prevent unnecessary refetching when the user is deleting
       * multiple events at the same time/close proximity.
       */
      const mutationsRunning = queryClient.isMutating({
        mutationKey: ["delete_event"],
        type: "active",
      });

      if (mutationsRunning === 1) queryClient.invalidateQueries(["events"]);
    },
  });
}

export {
  getShowTimes,
  maxDate,
  openSaturday,
  openSunday,
  setTimeOnDate,
  sortDatesTimes,
  startTime,
  endTime,
  timeZone,
  timeBuffer,
  useDeleteEvent,
  useEvents,
  useAddEvent,
  userTimeZone,
};
