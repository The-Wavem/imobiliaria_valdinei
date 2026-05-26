import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { PROPERTY_COLLECTION } from "./AdminCadastro";

const toNumber = (value) => {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const getTimestampMillis = (value) => {
  if (value && typeof value.toMillis === "function") {
    return value.toMillis();
  }

  return 0;
};

export function mapPropertyDocument(snapshot) {
  const data = snapshot.data() || {};
  const pricing = data.pricing || {};
  const location = data.location || {};
  const media = data.media || {};
  const content = data.content || {};
  const status = data.status || {};

  return {
    id: snapshot.id,
    firestoreId: snapshot.id,
    code: data.code || snapshot.id,
    title: data.title || "Imóvel",
    category: data.category || "Imóvel",
    type: data.type || "Imóvel",
    location: [location.neighborhood, location.address].filter(Boolean).join(" - ") || location.address || location.neighborhood || "",
    price: toNumber(pricing.price),
    condo: toNumber(pricing.condo),
    iptu: toNumber(pricing.iptu),
    beds: toNumber(location.bedrooms),
    baths: toNumber(location.bathrooms),
    parking: toNumber(location.parkingSpaces),
    area: toNumber(location.area),
    amenities: Array.isArray(data.features) ? data.features : [],
    image: media.coverImage || media.photos?.[0] || "",
    images: Array.isArray(media.photos) ? media.photos : [],
    summary: content.summary || "",
    description: content.description || "",
    featured: Boolean(status.featured),
    active: status.active !== false,
    visibility: status.visibility || "published",
    createdAt: data.audit?.createdAt || null,
  };
}

export async function fetchPublishedProperties() {
  const snapshot = await getDocs(collection(db, PROPERTY_COLLECTION));

  return snapshot.docs
    .map(mapPropertyDocument)
    .filter((property) => property.active)
    .sort((left, right) => {
      if (left.featured !== right.featured) {
        return left.featured ? -1 : 1;
      }

      return getTimestampMillis(right.createdAt) - getTimestampMillis(left.createdAt);
    });
}

export async function fetchPropertyById(propertyId) {
  const reference = doc(db, PROPERTY_COLLECTION, propertyId);
  const snapshot = await getDoc(reference);

  if (!snapshot.exists()) {
    return null;
  }

  const property = mapPropertyDocument(snapshot);

  return property.active ? property : null;
}