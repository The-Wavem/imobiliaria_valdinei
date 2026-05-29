import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CookieConsent from "@components/ui/CookieConsent/CookieConsent.jsx";
import { trackPageAccess } from "@utils/analytics";
import styles from "./PublicLayout.module.css";

let lastTrackedPageViewSignature = null;

export default function PublicLayout() {
  const location = useLocation();

  useEffect(() => {
    const signature = `${location.pathname}::${location.key || "default"}`;

    if (lastTrackedPageViewSignature === signature) {
      return;
    }

    lastTrackedPageViewSignature = signature;
    trackPageAccess(location.pathname);
  }, [location.pathname]);

  return (
    <>
      <Navbar />
      <div key={location.pathname} className={styles.pageTransition}>
        <Outlet />
      </div>
      <Footer />
      <CookieConsent />
    </>
  );
}