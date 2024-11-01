import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Admin from "./components/Admin";
import { GoogleAuth } from "./context/GoogleAuth";
import Home from "./components/Home";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ShowTimes from "./components/ShowTimes";

const queryClient = new QueryClient();

export function App() {
  // console.log("<APP />");

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route index element={<Home />} />
          <Route path="admin" element={<GoogleAuth />}>
            <Route index element={<Admin />} />
          </Route>
          {/**
           * /SCHEDULE ROUTE:
           * Leaving route method in giving the user direct access to certain dates
           * to select times from in case wanting to share the link to schedule.
           */}
          <Route path="schedule" element={<ShowTimes />}>
            <Route path=":month/:day/:year" element={<ShowTimes />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}
