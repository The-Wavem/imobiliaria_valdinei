import React from "react";
import PublicLayout from "@/components/layout/PublicLayout";
import PrivateLayout from "@/components/layout/PrivateLayout";
import Home from "@/pages/public/Home";
import Rent from "@/pages/public/Rent";
import Buy from "@/pages/public/Buy";
import PropertyDetail from "@/pages/public/PropertyDetail";
import Dashboard from "@/pages/admin/Dashboard";
import PropertyManager from "@/pages/admin/PropertyManager";
import LeadsManager from "@pages/admin/LeadsManager";
import Favorito from "@/pages/public/Favorito";
import Contato from "@/pages/public/Contato";

export default function Router() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="contato" element={<Contato />} />
          <Route path="favorito" element={<Favorito />} />
          <Route path="/alugar" element={<Rent />} />
          <Route path="/comprar" element={<Buy />} />
          <Route path="/imovel/:id" element={<PropertyDetail />} />  
      </Route>

      <Route element={<PrivateLayout />}>
         <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
         <Route path="/admin/dashboard" element={<Dashboard />} />
         <Route path="/admin/imoveis" element={<PropertyManager />} />
         <Route path="/admin/leads" element={<LeadsManager />} />
         <Route path="/admin/visitas" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}
