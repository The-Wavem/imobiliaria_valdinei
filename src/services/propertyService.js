import {
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebaseConfig.js";
import { mapPropertyDocument } from "./properties.js";

const PROPERTY_COLLECTION = "properties";

const formatPropertyData = (data) => ({
  title: data.title || "",
  code: data.code || "",
  category: data.category || "",
  type: data.type || "",
  status: data.status || "Ativo",
  pricing: {
    price: Number(data.price || 0),
    condo: Number(data.condo || 0),
    iptu: Number(data.iptu || 0),
  },
  location: {
    address: data.address || "",
    neighborhood: data.neighborhood || "",
    area: Number(data.area || 0),
    bedrooms: Number(data.bedrooms || 0),
    bathrooms: Number(data.bathrooms || 0),
    parkingSpaces: Number(data.parkingSpaces || 0),
  },
  features: data.features || [],
  photos: data.photos || [],
  content: {
    summary: data.summary || "",
    description: data.description || "",
  },
  updatedAt: new Date().toISOString(),
});

export const addProperty = async (propertyData) => {
  try {
    const formattedData = formatPropertyData(propertyData);
    formattedData.createdAt = new Date().toISOString();
    formattedData.views = 0;
    
    const docRef = await addDoc(collection(db, PROPERTY_COLLECTION), formattedData);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao adicionar imóvel:", error);
    throw error;
  }
};

export const updateProperty = async (id, propertyData) => {
  try {
    const formattedData = formatPropertyData(propertyData);
    const propertyRef = doc(db, PROPERTY_COLLECTION, id);
    await updateDoc(propertyRef, formattedData);
    return true;
  } catch (error) {
    console.error("Erro ao atualizar imóvel:", error);
    throw error;
  }
};

export async function getPropertiesStats() {
  const snapshot = await getDocs(collection(db, PROPERTY_COLLECTION));
  const total = snapshot.docs.length;

  const ativos = snapshot.docs.reduce((count, documentSnapshot) => {
    const data = documentSnapshot.data() || {};
    const isActive =
      data.status && typeof data.status === "object"
        ? data.status.active !== false
        : data.status === "Ativo" || data.active !== false;
    return count + (isActive ? 1 : 0);
  }, 0);

  return { total, ativos, inativos: total - ativos };
}

export async function getPublicProperties(categoryParam) {
  try {
    const snapshot = await getDocs(collection(db, PROPERTY_COLLECTION));

    return snapshot.docs.map(mapPropertyDocument).filter((property) => {
      const matchesCategory =
        property.category?.toLowerCase() === categoryParam?.toLowerCase();
      return property.active && matchesCategory;
    });
  } catch (error) {
    console.error("Erro ao buscar imóveis públicos:", error);
    return [];
  }
}

export const incrementPropertyViews = async (propertyId) => {
  if (!propertyId) return;

  try {
    const propertyRef = doc(db, "properties", propertyId);
    await setDoc(propertyRef, { views: increment(1) }, { merge: true });
  } catch (error) {
    console.error(`Erro ao registrar view para o imóvel ${propertyId}:`, error);
  }
};

export const getAllProperties = async () => {
  try {
    const snapshot = await getDocs(collection(db, "properties"));

    const properties = snapshot.docs.map((documentSnapshot) => ({
      firestoreId: documentSnapshot.id,
      ...documentSnapshot.data(),
    }));

    return properties.sort((a, b) => {
      const getTimestamp = (property) => {
        const date =
          property.createdAt ||
          property.audit?.createdAt ||
          property.updatedAt ||
          property.audit?.updatedAt;

        if (!date) return 0;

        // Firestore Timestamp
        if (typeof date.toDate === "function") {
          return date.toDate().getTime();
        }

        // Date nativo
        if (date instanceof Date) {
          return date.getTime();
        }

        // String ISO
        if (typeof date === "string") {
          return new Date(date).getTime() || 0;
        }

        return 0;
      };

      return getTimestamp(b) - getTimestamp(a);
    });
  } catch (error) {
    console.error("Erro ao buscar todos os imóveis para o Admin:", error);
    return [];
  }
};
