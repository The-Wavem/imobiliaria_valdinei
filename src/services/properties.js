import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
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
  const statusObj = typeof data.status === "object" && data.status !== null ? data.status : {};
  
  const photosArray = Array.isArray(data.photos) 
    ? data.photos.filter(Boolean) 
    : (Array.isArray(media.photos) ? media.photos.filter(Boolean) : []);
    
  const isActive = typeof data.status === "string" 
    ? data.status === "Ativo" 
    : (data.active !== undefined ? data.active : statusObj.active !== false);

  return {
    id: snapshot.id,
    firestoreId: snapshot.id,
    code: data.code || snapshot.id,
    title: data.title || "Imóvel",
    category: data.category || "Imóvel",
    type: data.type || "Imóvel",
    location: [location.neighborhood, location.address].filter(Boolean).join(" - ") || location.address || location.neighborhood || data.address || data.neighborhood || "",
    price: toNumber(pricing.price || data.price),
    condo: toNumber(pricing.condo || data.condo),
    iptu: toNumber(pricing.iptu || data.iptu),
    beds: toNumber(location.bedrooms || data.bedrooms),
    baths: toNumber(location.bathrooms || data.bathrooms),
    parking: toNumber(location.parkingSpaces || data.parkingSpaces),
    area: toNumber(location.area || data.area),
    amenities: Array.isArray(data.features) ? data.features : [],
    image: data.imageUrl || media.coverImage || photosArray[0] || "",
    images: photosArray,
    photos: photosArray, // Mantendo a chave photos tbm para garantir
    videos: data.videos || [],
    description: content.description || data.description || "",
    featured: Boolean(statusObj.featured),
    active: isActive,
    visibility: statusObj.visibility || "published",
    createdAt: data.createdAt || data.audit?.createdAt || null,
  };
}

export async function fetchPublishedProperties() {
  const propertiesQuery = query(
    collection(db, PROPERTY_COLLECTION),
    where("status", "==", "Ativo")
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