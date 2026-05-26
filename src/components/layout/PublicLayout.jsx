import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CookieConsent from "@components/ui/CookieConsent/CookieConsent.jsx";

export default function PublicLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
      <CookieConsent />
    </>
  );
}