import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { PROPERTY_COLLECTION } from "./AdminCadastro";
import { parsePrice } from "../utils/validation.js";

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

const normalizeMediaList = (values = []) => {
  const items = Array.isArray(values) ? values : [values];
  const urls = [];

  items.forEach((item) => {
    const text = typeof item === "string" ? item.trim() : "";
    if (!text) return;

    const matches = text.match(/https?:\/\/[^\s"'<>]+/g);
    if (matches?.length) {
      urls.push(...matches.map((url) => url.trim()));
      return;
    }

    text.split(/[\n,;]+/).forEach((part) => {
      const value = part.trim();
      if (value) urls.push(value);
    });
  });

  return [...new Set(urls.filter(Boolean))];
};

export function mapPropertyDocument(snapshot) {
  const data = snapshot.data() || {};
  const pricing = data.pricing || {};
  const location = data.location || {};
  const media = data.media || {};
  const content = data.content || {};
  const statusObj = typeof data.status === "object" && data.status !== null ? data.status : {};
  
  const photosArray = normalizeMediaList(
    Array.isArray(data.photos) && data.photos.length > 0
      ? data.photos
      : Array.isArray(media.photos) && media.photos.length > 0
        ? media.photos
        : data.photos || media.photos || []
  );
    
  // Now 'active' is a top-level boolean in the document.
  const isActive = data.active !== undefined ? data.active : (
    typeof data.status === "string" ? data.status !== "Inativo" : statusObj.active !== false
  );
  
  const currentStatus = typeof data.status === "string" ? data.status : "Disponível";

  return {
    id: snapshot.id,
    firestoreId: snapshot.id,
    code: data.code || snapshot.id,
    title: data.title || "Imóvel",
    category: data.category || "Imóvel",
    type: data.type || "Imóvel",
    location: [location.neighborhood, location.address].filter(Boolean).join(" - ") || location.address || location.neighborhood || data.address || data.neighborhood || "",
    price: parsePrice(pricing.price || data.price),
    rentPrice: parsePrice(pricing.rentPrice || data.rentPrice),
    pricing,
    condo: parsePrice(pricing.condo || data.condo),
    iptu: parsePrice(pricing.iptu || data.iptu),
    beds: toNumber(location.bedrooms || data.bedrooms),
    baths: toNumber(location.bathrooms || data.bathrooms),
    parking: toNumber(location.parkingSpaces || data.parkingSpaces),
    area: toNumber(location.area || data.area),
    landArea: toNumber(location.landArea || data.landArea),
    amenities: Array.isArray(data.features) ? data.features : [],
    image: data.imageUrl || media.coverImage || photosArray[0] || "",
    images: photosArray,
    photos: photosArray, // Mantendo a chave photos tbm para garantir
    videos: data.videos || [],
    description: content.description || data.description || "",
    featured: data.featured !== undefined ? Boolean(data.featured) : Boolean(statusObj.featured),
    active: isActive,
    status: currentStatus,
    visibility: statusObj.visibility || "published",
    createdAt: data.createdAt || data.audit?.createdAt || null,
  };
}

export async function fetchPublishedProperties() {
  const propertiesQuery = query(
    collection(db, PROPERTY_COLLECTION),
    where("active", "==", true)
  );
  const snapshot = await getDocs(propertiesQuery);

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
  try {
    const reference = doc(db, PROPERTY_COLLECTION, propertyId);
    const snapshot = await getDoc(reference);

    if (!snapshot.exists()) {
      return null;
    }

    const property = mapPropertyDocument(snapshot);

    return property.active ? property : null;
  } catch (error) {
    console.error("Erro ao buscar imóvel por ID:", error);
    return null;
  }
}