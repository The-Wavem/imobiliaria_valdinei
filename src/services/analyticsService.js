import { collection, doc, getDocs, increment, limit, orderBy, query, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig.js";

const ANALYTICS_VIEWS_COLLECTION = "analytics_views";
const ANALYTICS_FILTERS_COLLECTION = "analytics_filters";
const ANALYTICS_BAIRROS_COLLECTION = "analytics_bairros";
const PROPERTY_COLLECTION = "properties";

export async function getAccessHistory() {
  const snapshot = await getDocs(
    query(collection(db, ANALYTICS_VIEWS_COLLECTION), orderBy("date", "asc")),
  );

  return snapshot.docs
    .map((documentSnapshot) => {
      const data = documentSnapshot.data() || {};

      return {
        name: String(data.date || documentSnapshot.id),
        acessos: Number(data.count || 0) || 0,
      };
    })
    .sort((leftItem, rightItem) => leftItem.name.localeCompare(rightItem.name));
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

function normalizeFilterDocId(filterTag) {
  return String(filterTag || "")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 120);
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
  return String(bairro || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
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
    .map(([bairro, acessos]) => ({ bairro, acessos }))
    .sort(sortByCountDesc)
    .slice(0, 5);
}

export async function getTopBairros() {
  const snapshot = await getDocs(
    query(
      collection(db, ANALYTICS_BAIRROS_COLLECTION),
      orderBy("count", "desc"),
      limit(5),
    ),
  );

  const bairros = snapshot.docs
    .map((documentSnapshot) => {
      const data = documentSnapshot.data() || {};

      return {
        bairro: String(data.name || documentSnapshot.id),
        acessos: Number(data.count || 0) || 0,
      };
    })
    .filter((item) => item.bairro && item.acessos > 0);

  if (bairros.length > 0) {
    return bairros;
  }

  const propertiesSnapshot = await getDocs(collection(db, PROPERTY_COLLECTION));

  return buildFallbackBairrosFromProperties(propertiesSnapshot);
}

export async function trackPageAccess() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const today = getTodayIsoDate();
    const docRef = doc(db, ANALYTICS_VIEWS_COLLECTION, today);

    await setDoc(
      docRef,
      {
        date: today,
        count: increment(1),
      },
      { merge: true },
    );
  } catch (error) {
    console.error("Falha ao registrar acesso no Firestore:", error);
  }
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