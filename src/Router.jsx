import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "@/pages/public/Home";
import Favorito from "@/pages/public/Favorito";

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Favorito" element={<Favorito />} />
      <Route path="/favoritos" element={<Favorito />} />
    </Routes>
  );
}
