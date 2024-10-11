import React, { createContext, useState } from "react";

export const ScheduleContext = createContext();

export function ScheduleProvider({ children }) {
  const [state, setState] = useState({ disabledDates: [], lastUpdated: null });

  return (
    <ScheduleContext.Provider value={{ state, setState }}>
      {children}
    </ScheduleContext.Provider>
  );
}
