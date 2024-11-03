import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiUrl, sortDatesTimes } from "./useEvents";

export function useDeleteEvent(eventId) {
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
