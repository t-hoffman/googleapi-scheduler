import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiUrl, sortDatesTimes } from "./useEvents";

export function useAddEvent() {
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
