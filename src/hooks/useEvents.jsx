import { useMutation, useQuery, useQueryClient } from "react-query";
import { getShowTimes, setTimeOnDate, sortDatesTimes } from "../utils/events";
import { toZonedTime } from "date-fns-tz";

// Scheduler configuration settings
const scheduleConfig = {
    startTime: "09:00",
    endTime: "12:00",
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
  const response = await fetch(`${apiUrl}/events/`);
  if (!response.ok) {
    throw new Error("Failed to fetch events.");
  }
  const events = await response.json();
  const { disabledDates, sortedTimes } = sortDatesTimes(events);
  return { events, disabledDates, sortedTimes };
};

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

  const optimisticUpdate = (values) => {
    const prevCache = queryClient.getQueryData(["events"]);
    const newEvent = {
      id: Date.now(),
      summary: values.summary,
      start: {
        dateTime: values.startDate,
        timeZone,
      },
      end: {
        dateTime: values.endDate,
        timeZone,
      },
    };

    const optimisticEvents = [...prevCache.events, newEvent].sort(
      (a, b) =>
        new Date(a.start.dateTime || a.start.date).getTime() -
        new Date(b.start.dateTime || b.start.date).getTime()
    );
    const { disabledDates, sortedTimes } = sortDatesTimes(optimisticEvents);
    const updatedCache = {
      events: optimisticEvents,
      disabledDates,
      sortedTimes,
    };

    queryClient.setQueryData(["events"], (old) => ({
      ...old,
      ...updatedCache,
    }));

    // Ensure context for rollback - restores previous state
    return prevCache;
  };

  return useMutation({
    mutationFn: postEvent,
    onMutate: optimisticUpdate,
    onSuccess: (data) => {
      // queryClient.refetchQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      console.log("Form successfully submitted: ", data);
    },
    onError: (error, values, context) => {
      queryClient.setQueryData(["events"], context);
    },
  });
}

function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: getEvents,
    refetchInterval: queryStaleTime,
    initialData: initialEventData,
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
  useEvents,
  useAddEvent,
  userTimeZone,
};
