import React, { createContext, useEffect, useState } from "react";

export const ScheduleContext = createContext();

const initialState = {
  disabledDates: [],
  sortedTimes: null,
};

export function ScheduleProvider({ children }) {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    console.log("useEffect => ScheduleProvider", state?.disabledDates.length);
  }, [state?.disabledDates.length]);

  return (
    <ScheduleContext.Provider value={{ state, setState }}>
      {children}
    </ScheduleContext.Provider>
  );
}
