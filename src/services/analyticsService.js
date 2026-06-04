import { collection, doc, getDocs, increment, limit, orderBy, query, setDoc, where, documentId } from "firebase/firestore";
import { logEvent } from "firebase/analytics";
import { db, analytics } from "./firebaseConfig.js";

const ANALYTICS_DAILY_COLLECTION = "analytics_daily";
const ANALYTICS_FILTERS_COLLECTION = "analytics_filters";
const ANALYTICS_BAIRROS_COLLECTION = "analytics_bairros";
const PROPERTY_COLLECTION = "properties";

export async function getDailyAnalytics() {
  const snapshot = await getDocs(
    query(collection(db, ANALYTICS_DAILY_COLLECTION), orderBy("date", "asc")),
  );

  return snapshot.docs
    .map((documentSnapshot) => {
      const data = documentSnapshot.data() || {};

      return {
        date: String(data.date || documentSnapshot.id),
        acessos: Number(data.views || 0) || 0,
        novosClientes: Number(data.new_consents || 0) || 0,
      };
    })
    .sort((leftItem, rightItem) => leftItem.date.localeCompare(rightItem.date));
}

export async function getTopFilters() {
  const snapshot = await getDocs(
    query(
      collection(db, ANALYTICS_FILTERS_COLLECTION),
      orderBy("count", "desc"),
      limit(7),
    ),
  );

  return snapshot.docs.map((documentSnapshot) => {
    const data = documentSnapshot.data() || {};

    return {
      name: String(data.name || data.label || documentSnapshot.id),
      value: Number(data.count || 0) || 0,
    };
  });
}

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

async function updateDailyAnalytics(fieldName) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const today = getTodayIsoDate();
    const docRef = doc(db, ANALYTICS_DAILY_COLLECTION, today);

    await setDoc(
      docRef,
      {
        date: today,
        [fieldName]: increment(1),
      },
      { merge: true },
    );
  } catch (error) {
    console.error("Falha ao registrar analytics diário no Firestore:", error);
  }
}

function slugify(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 120);
}

function normalizeFilterDocId(filterTag) {
  return slugify(filterTag);
}

function normalizeFilterLabel(key) {
  const normalizedKey = String(key || "").trim();

  const labelMap = {
    bedrooms: "Quartos",
    bathrooms: "Banheiros",
    parking: "Vagas",
    amenities: "Extra",
    features: "Extra",
    location: "Localização",
    propertyType: "Tipo",
    priceMin: "Preço mínimo",
    priceMax: "Preço máximo",
    areaMin: "Área mínima",
    areaMax: "Área máxima",
  };

  if (labelMap[normalizedKey]) {
    return labelMap[normalizedKey];
  }

  return normalizedKey
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/^./, (char) => char.toUpperCase());
}

function normalizeFilterValue(value) {
  const normalizedValue = String(value || "").trim();

  if (!normalizedValue) {
    return "";
  }

  if (/^[a-zà-ÿ\s]+$/i.test(normalizedValue)) {
    return normalizedValue
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  return normalizedValue;
}

function collectFilterEntries(filtersObj) {
  return Object.entries(filtersObj || {}).flatMap(([key, value]) => {
    if (value === undefined || value === null) {
      return [];
    }

    if (Array.isArray(value)) {
      return value
        .map((item) => normalizeFilterValue(item))
        .filter((item) => item && !["Todos", "Any", "Qualquer"].includes(item))
        .map((item) => `${normalizeFilterLabel(key)}: ${item}`);
    }

    const normalizedValue = normalizeFilterValue(value);

    if (!normalizedValue || ["Todos", "Any", "Qualquer"].includes(normalizedValue)) {
      return [];
    }

    return [`${normalizeFilterLabel(key)}: ${normalizedValue}`];
  });
}

function normalizeBairroDocId(bairro) {
  return slugify(bairro);
}

function normalizeNeighborhoodName(value) {
  return String(value || "").trim();
}

function sortByCountDesc(leftItem, rightItem) {
  return rightItem.acessos - leftItem.acessos;
}

function buildFallbackBairrosFromProperties(snapshot) {
  const counts = snapshot.docs.reduce((accumulator, documentSnapshot) => {
    const data = documentSnapshot.data() || {};
    const isActive = data.status && typeof data.status === "object"
      ? data.status.active !== false
      : data.status === "Ativo" || data.active !== false;

    if (!isActive) {
      return accumulator;
    }

    const neighborhood = normalizeNeighborhoodName(data.location?.neighborhood);

    if (!neighborhood) {
      return accumulator;
    }

    accumulator[neighborhood] = (accumulator[neighborhood] || 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(counts)
    .map(([bairro, acessos]) => ({
      name: bairro,
      count: acessos,
      bairro,
      acessos,
    }))
    .sort(sortByCountDesc)
    .slice(0, 5);
}

export async function getTopBairros() {
  const snapshot = await getDocs(
    query(
      collection(db, ANALYTICS_FILTERS_COLLECTION),
      where(documentId(), ">=", "localizacao_"),
      where(documentId(), "<=", "localizacao_\uf8ff")
    )
  );

  const bairros = snapshot.docs
    .map((documentSnapshot) => {
      const data = documentSnapshot.data() || {};
      const rawName = String(data.name || documentSnapshot.id);
      
      // Remove o prefixo 'Localização:' ou 'localizacao_'
      const cleanName = rawName.replace(/^Localização:\s*/i, "").trim();
      
      const count = Number(data.count || 0) || 0;

      return {
        name: cleanName,
        count,
        bairro: cleanName,
        acessos: count,
      };
    })
    .filter((item) => item.name && item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (bairros.length > 0) {
    return bairros;
  }

  const propertiesQuery = query(
    collection(db, PROPERTY_COLLECTION),
    where("status", "==", "Ativo")
  );
  const propertiesSnapshot = await getDocs(propertiesQuery);

  return buildFallbackBairrosFromProperties(propertiesSnapshot);
}

export async function trackPageView() {
  await updateDailyAnalytics("views");
}

export async function trackNewConsent() {
  await updateDailyAnalytics("new_consents");
}

export async function trackFilterUsage(filtersObj) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const filterEntries = collectFilterEntries(filtersObj);

    if (filterEntries.length === 0) {
      return;
    }

    await Promise.all(
      filterEntries.map((filterTag) => {
        const docRef = doc(db, ANALYTICS_FILTERS_COLLECTION, normalizeFilterDocId(filterTag));

        return setDoc(
          docRef,
          {
            name: filterTag,
            count: increment(1),
          },
          { merge: true },
        );
      }),
    );
  } catch (error) {
    console.error("Falha ao registrar filtros no Firestore:", error);
  }
}

export async function trackBairroView(bairro) {
  if (typeof window === "undefined" || !bairro) {
    return;
  }

  try {
    const normalizedBairro = String(bairro).trim();

    if (!normalizedBairro) {
      return;
    }

    const docRef = doc(db, ANALYTICS_BAIRROS_COLLECTION, normalizeBairroDocId(normalizedBairro));

    await setDoc(
      docRef,
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

export function logPropertyViewAnalytics(property) {
  if (typeof window === "undefined" || !analytics || !property) {
    return;
  }

  try {
    logEvent(analytics, "view_item", {
      currency: "BRL",
      value: property.price,
      items: [
        {
          item_id: property.id,
          item_name: property.title,
          item_category: property.location?.neighborhood,
        },
      ],
    });
  } catch (error) {
    console.error("Falha ao registrar view_item no Firebase Analytics:", error);
  }
}

export function logLeadSubmissionAnalytics(propertyId, propertyTitle) {
  if (typeof window === "undefined" || !analytics || !propertyId) {
    return;
  }

  try {
    logEvent(analytics, "generate_lead", {
      property_id: propertyId,
      property_title: propertyTitle,
    });
  } catch (error) {
    console.error("Falha ao registrar generate_lead no Firebase Analytics:", error);
  }
}

export function logSearchAnalytics(searchParams) {
  if (typeof window === "undefined" || !analytics || !searchParams) {
    return;
  }

  try {
    const { location, propertyType, priceMin, priceMax } = searchParams;
    const term = location || propertyType || "todos";

    logEvent(analytics, "search", {
      search_term: term,
      filter_neighborhood: location || "",
      filter_property_type: propertyType || "",
      filter_min_price: priceMin || "",
      filter_max_price: priceMax || "",
    });
  } catch (error) {
    console.error("Falha ao registrar search no Firebase Analytics:", error);
  }
}

export function logAddToWishlistAnalytics(property) {
  if (typeof window === "undefined" || !analytics || !property) {
    return;
  }

  try {
    logEvent(analytics, "add_to_wishlist", {
      currency: "BRL",
      value: property.price || 0,
      items: [
        {
          item_id: property.id,
          item_name: property.title,
          item_category: property.location?.neighborhood,
        },
      ],
    });
  } catch (error) {
    console.error("Falha ao registrar add_to_wishlist no Firebase Analytics:", error);
  }
}

export function logWhatsAppClickAnalytics(propertyName, origin) {
  if (typeof window === "undefined" || !analytics) {
    return;
  }

  try {
    logEvent(analytics, "generate_lead", {
      method: "whatsapp",
      item_name: propertyName || "Contato Geral",
      content_type: origin,
    });
  } catch (error) {
    console.error("Falha ao registrar WhatsApp click no Firebase Analytics:", error);
  }
}