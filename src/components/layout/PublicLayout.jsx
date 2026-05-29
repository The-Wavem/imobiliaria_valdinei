import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CookieConsent from "@components/ui/CookieConsent/CookieConsent.jsx";
import Loader from "@components/ui/Loader/Loader.jsx";
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Navbar />
      <div key={location.pathname} className={styles.pageTransition}>
        <Suspense
          fallback={
            <div className={styles.routeLoading}>
              <Loader size={48} />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </div>
      <Footer />
      <CookieConsent />
    </>
  );
}