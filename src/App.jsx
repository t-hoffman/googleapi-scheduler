import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ShowTimes from "./components/ShowTimes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Admin from "./components/Admin";
import { GoogleAuth } from "./context/GoogleAuth";
import Home from "./components/Home";

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
          <Route path="schedule" element={<ShowTimes />}>
            <Route path=":month/:day/:year" element={<ShowTimes />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}
