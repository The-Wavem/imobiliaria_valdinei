import React from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import Home from "@/pages/public/Home";
import Rent from "@/pages/public/Rent";
import Buy from "@/pages/public/Buy";
import PropertyDetail from "@/pages/public/PropertyDetail";
import Dashboard from "@/pages/admin/Dashboard";

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/alugar" element={<Rent />} />
      <Route path="/comprar" element={<Buy />} />
      <Route path="/imovel/:id" element={<PropertyDetail />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/dashboard" element={<Dashboard />} />
      <Route path="/admin/imoveis" element={<Dashboard />} />
      <Route path="/admin/leads" element={<Dashboard />} />
      <Route path="/admin/visitas" element={<Dashboard />} />
    </Routes>
  );
}
