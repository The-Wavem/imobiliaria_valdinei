import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import PrivateLayout from "@/components/layout/PrivateLayout";
import Home from "@/pages/public/Home";
import Favorito from "@/pages/public/Favorito";
import Contato from "@/pages/public/Contato";

export default function Router() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="contato" element={<Contato />} />
        <Route path="favorito" element={<Favorito />} />
      </Route>

      <Route element={<PrivateLayout />}>
        <Route path="privado" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
