import { lazy, Suspense, Component } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Loader from "@components/ui/Loader/Loader.jsx";
import PublicLayout from "@/components/layout/PublicLayout";
import PrivateLayout from "@/components/layout/PrivateLayout";

class ChunkErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    const msg = error.message ? error.message.toLowerCase() : "";
    const isChunkError = 
      error.name === 'ChunkLoadError' ||
      msg.includes('failed to fetch dynamically imported module') ||
      msg.includes('dynamically imported module') ||
      msg.includes('expected a javascript-or-wasm module script');
      
    if (isChunkError) {
      window.location.reload(true);
    } else {
      console.error(error, errorInfo);
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
          <Loader size={48} />
          <p>Carregando nova versão do sistema...</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const Home = lazy(() => import("@/pages/public/Home.jsx"));
const Rent = lazy(() => import("@/pages/public/Rent.jsx"));
const Buy = lazy(() => import("@/pages/public/Buy.jsx"));
const PropertyDetail = lazy(() => import("@/pages/public/PropertyDetail.jsx"));
const NotFound = lazy(() => import("@pages/public/NotFound.jsx"));
const Dashboard = lazy(() => import("@pages/admin/Dashboard.jsx"));
const PropertyManager = lazy(() => import("@pages/admin/PropertyManager.jsx"));
const LeadsManager = lazy(() => import("@pages/admin/LeadsManager.jsx"));
const CapturaUrl = lazy(() => import("@pages/admin/CapturaUrl.jsx"));
const Login = lazy(() => import("@pages/admin/Login.jsx"));
const Favorito = lazy(() => import("@/pages/public/Favorito.jsx"));
const Contato = lazy(() => import("@/pages/public/Contato.jsx"));
const Sobre = lazy(() => import("@/pages/public/Sobre.jsx"));
const Servicos = lazy(() => import("@/pages/public/Services.jsx"));

export default function Router() {
  return (
    <ChunkErrorBoundary>
      <Suspense
        fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
          }}
        >
          <Loader size={56} />
        </div>
      }
    >
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="contato" element={<Contato />} />
          <Route path="servicos" element={<Servicos />} />
          <Route path="favorito" element={<Favorito />} />
          <Route path="/alugar" element={<Rent />} />
          <Route path="/comprar" element={<Buy />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/imovel/:id" element={<PropertyDetail />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/admin/login" element={<Login />} />

        <Route element={<PrivateLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/imoveis" element={<PropertyManager />} />
          <Route path="/admin/leads" element={<LeadsManager />} />
          <Route path="/admin/campanhas" element={<CapturaUrl />} />
          <Route path="/admin/solicitacoes" element={<LeadsManager />} />
          <Route path="/admin/visitas" element={<Dashboard />} />
        </Route>
      </Routes>
    </Suspense>
    </ChunkErrorBoundary>
  );
}
