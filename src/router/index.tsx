import React from "react";
import { Route, Routes } from "react-router-dom";
import Index from "../pages";
export default function Router(props) {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index></Index>} />
      </Routes>
    </>
  );
}
