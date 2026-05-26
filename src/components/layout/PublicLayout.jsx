import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CookieConsent from "@components/ui/CookieConsent/CookieConsent.jsx";
import { trackPageAccess } from "@utils/analytics";

export default function PublicLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    trackPageAccess();
  }, [pathname]);

  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
      <CookieConsent />
    </>
  );
}