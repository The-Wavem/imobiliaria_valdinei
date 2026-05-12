import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "@/pages/public/Home";
import Rent from "@/pages/public/Rent";
import Buy from "@/pages/public/Buy";

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/alugar" element={<Rent />} />
      <Route path="/comprar" element={<Buy />} />
    </Routes>
  );
}
