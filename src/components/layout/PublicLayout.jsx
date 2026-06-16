import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CookieConsent from "@components/ui/CookieConsent/CookieConsent.jsx";
import Loader from "@components/ui/Loader/Loader.jsx";
import { trackPageView } from "@utils/analytics";
import { trackCampaignClick } from "@services/analyticsService";
import styles from "./PublicLayout.module.css";

let lastTrackedPageViewSignature = null;

export default function PublicLayout() {
  const location = useLocation();

  useEffect(() => {
    const signature = `${location.pathname}::${location.key || "default"}`;

    // Track UTMs
    const searchParams = new URLSearchParams(location.search);
    const utmSource = searchParams.get("utm_source");
    const utmMedium = searchParams.get("utm_medium");
    const utmCampaign = searchParams.get("utm_campaign");

    if (utmCampaign) {
      const sessionKey = `tracked_campaign_${utmCampaign}`;
      if (!window.sessionStorage.getItem(sessionKey)) {
        trackCampaignClick(utmSource, utmMedium, utmCampaign);
        window.sessionStorage.setItem(sessionKey, "true");
      }
    }

    if (lastTrackedPageViewSignature === signature) {
      return;
    }

    lastTrackedPageViewSignature = signature;
    const storedConsent = window.localStorage.getItem("@valdinei:consent_status");

    if (storedConsent === "accepted") {
      trackPageView();
    }
  }, [location.pathname, location.search, location.key]);

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