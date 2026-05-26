const BAIRROS_STORAGE_KEY = "@valdinei:bairros";
const CONSENT_STORAGE_KEY = "@valdinei:consent_status";
const ACCESS_HISTORY_STORAGE_KEY = "@valdinei:access_history";
const VISITOR_PROFILE_STORAGE_KEY = "@valdinei:visitor_profile";
export const FILTERS_STORAGE_KEY = "@valdinei:filters";
const SESSION_LOGGED_KEY = "session_logged";
const ANALYTICS_UPDATED_EVENT = "valdinei:analytics-update";

function readJsonObject(storageKey) {
  const rawValue = window.localStorage.getItem(storageKey);

  if (!rawValue) {
    return {};
  }

  try {
    const parsedValue = JSON.parse(rawValue);
    return parsedValue && typeof parsedValue === "object" ? parsedValue : {};
  } catch {
    return {};
  }
}

function writeJsonObject(storageKey, value) {
  window.localStorage.setItem(storageKey, JSON.stringify(value));
}

function emitAnalyticsUpdate(detail) {
  if (typeof window.dispatchEvent !== "function") {
    return;
  }

  window.dispatchEvent(new CustomEvent(ANALYTICS_UPDATED_EVENT, { detail }));
}

function createVisitorId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeAccessRecord(record) {
  if (typeof record === "number") {
    return {
      total: record,
      newClients: 0,
      frequentClients: 0,
    };
  }

  if (!record || typeof record !== "object") {
    return {
      total: 0,
      newClients: 0,
      frequentClients: 0,
    };
  }

  return {
    total: Number(record.total ?? record.acessos ?? 0) || 0,
    newClients: Number(record.newClients ?? record.novos ?? 0) || 0,
    frequentClients: Number(record.frequentClients ?? record.frequentes ?? 0) || 0,
  };
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

export function trackBairroView(bairro) {
  if (typeof window === "undefined" || !bairro) {
    return;
  }

  try {
    const stats = readJsonObject(BAIRROS_STORAGE_KEY);
    const normalizedBairro = String(bairro).trim();

    if (!normalizedBairro) {
      return;
    }

    stats[normalizedBairro] = (stats[normalizedBairro] || 0) + 1;
    writeJsonObject(BAIRROS_STORAGE_KEY, stats);
    emitAnalyticsUpdate({ type: "bairros", bairro: normalizedBairro });
  } catch {
    window.localStorage.setItem(BAIRROS_STORAGE_KEY, JSON.stringify({ [String(bairro).trim()]: 1 }));
  }
}

export function trackPageAccess() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (window.localStorage.getItem(CONSENT_STORAGE_KEY) !== "accepted") {
      return;
    }

    if (window.sessionStorage.getItem(SESSION_LOGGED_KEY)) {
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const history = readJsonObject(ACCESS_HISTORY_STORAGE_KEY);
    const visitorProfile = readJsonObject(VISITOR_PROFILE_STORAGE_KEY);
    const visitorId = visitorProfile.id || createVisitorId();
    const hasSeenBefore = Boolean(visitorProfile.firstSeen);

    const nextVisitorProfile = {
      id: visitorId,
      firstSeen: visitorProfile.firstSeen || today,
      lastSeen: today,
      totalAccesses: (Number(visitorProfile.totalAccesses) || 0) + 1,
    };

    const todayRecord = normalizeAccessRecord(history[today]);

    todayRecord.total += 1;

    if (hasSeenBefore) {
      todayRecord.frequentClients += 1;
    } else {
      todayRecord.newClients += 1;
    }

    history[today] = todayRecord;
    writeJsonObject(VISITOR_PROFILE_STORAGE_KEY, nextVisitorProfile);
    writeJsonObject(ACCESS_HISTORY_STORAGE_KEY, history);
    window.sessionStorage.setItem(SESSION_LOGGED_KEY, today);
    emitAnalyticsUpdate({ type: "access", date: today });
  } catch {
    // Ignora falhas de storage para não bloquear a navegação.
  }
}

export function trackFilterUsage(filtersObj) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const filterEntries = collectFilterEntries(filtersObj);

    if (filterEntries.length === 0) {
      return;
    }

    const stats = readJsonObject(FILTERS_STORAGE_KEY);

    filterEntries.forEach((entry) => {
      stats[entry] = (stats[entry] || 0) + 1;
    });

    writeJsonObject(FILTERS_STORAGE_KEY, stats);
    emitAnalyticsUpdate({ type: "filters", entries: filterEntries });
  } catch {
    // Ignora falhas de storage para não bloquear a navegação.
  }
}
