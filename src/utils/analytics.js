import { doc, increment, setDoc } from "firebase/firestore";
import { db } from "@services/firebaseConfig.js";
import { trackFilterUsage, trackNewConsent, trackPageView } from "@services/analyticsService.js";

const CONSENT_STORAGE_KEY = "@valdinei:consent_status";
const ANALYTICS_BAIRROS_COLLECTION = "analytics_bairros";

export { trackFilterUsage, trackNewConsent, trackPageView };

export async function trackBairroView(bairro) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedBairro = String(bairro || "").trim().replace(/\s+/g, " ");

  if (!normalizedBairro) {
    return;
  }

  if (window.localStorage.getItem(CONSENT_STORAGE_KEY) !== "accepted") {
    return;
  }

  try {
    await setDoc(
      doc(db, ANALYTICS_BAIRROS_COLLECTION, normalizedBairro),
      {
        name: normalizedBairro,
        count: increment(1),
      },
      { merge: true },
    );
  } catch (error) {
    console.error("Falha ao registrar bairro no Firestore:", error);
  }
}
