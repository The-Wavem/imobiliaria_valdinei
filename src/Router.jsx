import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "@/pages/public/Home";
import Favorito from "@/pages/public/Favorito";
import Contato from "@/pages/public/Contato";

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/contato" element={<Contato />} />
      <Route path="/Favorito" element={<Favorito />} />
    </Routes>
  );
}
