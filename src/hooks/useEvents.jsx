import { useMutation, useQuery, useQueryClient } from "react-query";
import { getShowTimes, setTimeOnDate, sortDatesTimes } from "../utils/events";

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
const today = new Date();
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

function useAddEvent(callback) {
  const queryClient = useQueryClient();

  return useMutation(
    async (eventData) => {
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      };
      const response = await fetch(`${apiUrl}/events/add`, options);
      if (!response.ok) {
        throw new Error("Failed to submit event.");
      }
      return response.json();
    },
    {
      onMutate: (values) => {
        const prevCache = queryClient.getQueryData(["events"]);
        const newEvent = {
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
        const optimisticEvents = [...prevCache.events, newEvent];
        const { disabledDates, sortedTimes } = sortDatesTimes(optimisticEvents);

        queryClient.setQueryData(["events"], {
          events: optimisticEvents,
          disabledDates,
          sortedTimes,
        });

        return () => queryClient.setQueryData(["events"], prevCache);
      },
      onSuccess: (data) => {
        queryClient.refetchQueries({ queryKey: ["events"] });
        callback(true);
        console.log("Form successfully submitted: ", data);
      },
      onError: (error, values, rollback) => {
        rollback();
        console.error("Form submission failed:", error.message);
      },
    }
  );
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
