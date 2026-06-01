import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
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

function normalizeNeighborhoodName(value) {
  return String(value || "").trim();
}

function sortByCountDesc(leftItem, rightItem) {
  return rightItem.acessos - leftItem.acessos;
}

function buildFallbackBairrosFromProperties(snapshot) {
  const counts = snapshot.docs.reduce((accumulator, documentSnapshot) => {
    const data = documentSnapshot.data() || {};
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