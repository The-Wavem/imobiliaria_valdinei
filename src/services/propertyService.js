import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebaseConfig.js";
import { mapPropertyDocument } from "./properties.js";
import { calculateBaseScore } from "../utils/rankingEngine.js";

const PROPERTY_COLLECTION = "properties";

const formatPropertyData = (data) => {
  const loc = data.location || {};
  const formatted = {
    title: data.title || "",
    code: data.code || "",
    category: data.category || "",
    type: data.type || "",
    status: data.status || "Disponível",
    active: data.status ? data.status !== "Inativo" : true,
    pricing: {
      price: Number(data.price || data.pricing?.price || 0),
      rentPrice: Number(data.rentPrice || data.pricing?.rentPrice || 0),
      condo: Number(data.condo || data.pricing?.condo || 0),
      iptu: Number(data.iptu || data.pricing?.iptu || 0),
    },
    area: Number(data.area || loc.area || 0),
    landArea: Number(data.landArea || loc.landArea || 0),
    bedrooms: Number(data.bedrooms || loc.bedrooms || 0),
    bathrooms: Number(data.bathrooms || loc.bathrooms || 0),
    parkingSpaces: Number(data.parkingSpaces || loc.parkingSpaces || 0),
    location: {
      cep: loc.cep || data.cep || "",
      logradouro: loc.logradouro || loc.street || data.logradouro || data.street || "",
      numero: loc.numero || loc.number || data.numero || data.number || "",
      complemento: loc.complemento || loc.complement || data.complemento || data.complement || "",
      bairro: loc.bairro || loc.neighborhood || data.bairro || data.neighborhood || "",
      cidade: loc.cidade || loc.city || data.cidade || data.city || "",
      estado: loc.estado || loc.state || data.estado || data.state || "",
      address: loc.address || data.address || "",
    },
    features: data.features || [],
    photos: data.photos || [],
    videos: data.videos || [],
    content: {
      description: data.description || data.content?.description || "",
    },
    featured: Boolean(data.featured),
    views: Number(data.views) || 0,
    shares: Number(data.shares) || 0,
    updatedAt: new Date().toISOString(),
  };

  formatted.score = calculateBaseScore(formatted);
  return formatted;
};

export const addProperty = async (propertyData) => {
  try {
    const formattedData = formatPropertyData(propertyData);
    formattedData.createdAt = new Date().toISOString();
    formattedData.statusUpdatedAt = new Date().toISOString(); // Marcação inicial
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

export const deleteProperty = async (id) => {
  try {
    const propertyRef = doc(db, PROPERTY_COLLECTION, id);
    await deleteDoc(propertyRef);
    return true;
  } catch (error) {
    console.error("Erro ao excluir imóvel:", error);
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
    const propertiesQuery = query(
      collection(db, PROPERTY_COLLECTION),
      where("active", "==", true)
    );
    const snapshot = await getDocs(propertiesQuery);

    return snapshot.docs.map(mapPropertyDocument).filter((property) => {
      if (!categoryParam) return property.active;
      
      const propCategory = property.category?.toLowerCase() || "";
      const targetCategory = categoryParam.toLowerCase();
      
      const matchesCategory =
        propCategory === targetCategory || 
        propCategory === "venda e aluguel" || 
        propCategory === "ambos";
        
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
    await updateDoc(propertyRef, { views: increment(1), score: increment(1) });
  } catch (error) {
    console.error(`Erro ao registrar view para o imóvel ${propertyId}:`, error);
  }
};

export const incrementPropertyShares = async (propertyId) => {
  if (!propertyId) return;

  try {
    const propertyRef = doc(db, "properties", propertyId);
    await updateDoc(propertyRef, { shares: increment(1), score: increment(100) });
  } catch (error) {
    console.error(`Erro ao registrar compartilhamento para o imóvel ${propertyId}:`, error);
  }
};

export const incrementPropertyFavorite = async (propertyId, value = 1) => {
  if (!propertyId) return;

  try {
    const propertyRef = doc(db, "properties", propertyId);
    const scoreIncrement = value > 0 ? 50 : -50;
    await updateDoc(propertyRef, { 
      favoriteCount: increment(value), 
      score: increment(scoreIncrement) 
    });
  } catch (error) {
    console.error(`Erro ao atualizar favoritos para o imóvel ${propertyId}:`, error);
  }
};

export const incrementPropertyLead = async (propertyId) => {
  if (!propertyId) return;

  try {
    const propertyRef = doc(db, "properties", propertyId);
    await updateDoc(propertyRef, { 
      leadCount: increment(1), 
      score: increment(500) 
    });
  } catch (error) {
    console.error(`Erro ao registrar lead para o imóvel ${propertyId}:`, error);
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

// Função exclusiva para alterar APENAS o status do imóvel
export const togglePropertyStatus = async (id, newStatus) => {
  try {
    const propertyRef = doc(db, PROPERTY_COLLECTION, id);
    // Atualiza apenas o campo status e a data, sem mexer no resto da casa!
    await updateDoc(propertyRef, { 
      status: newStatus,
      active: newStatus !== "Inativo", // mantendo coerência com o boolean active usado nos filtros
      updatedAt: new Date().toISOString(),
      statusUpdatedAt: new Date().toISOString() // Marcação de quando o status mudou
    });
    return true;
  } catch (error) {
    console.error("Erro ao alterar status do imóvel:", error);
    throw error;
  }
};

export const togglePropertyFeatured = async (id, isFeatured) => {
  try {
    const propertyRef = doc(db, PROPERTY_COLLECTION, id);
    await updateDoc(propertyRef, { 
      featured: isFeatured,
      score: increment(isFeatured ? 10000 : -10000),
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Erro ao alterar destaque do imóvel:", error);
    throw error;
  }
};

export const checkCodeExists = async (code, excludeId = null) => {
  if (!code) return false;
  try {
    const q = query(
      collection(db, PROPERTY_COLLECTION),
      where("code", "==", code.trim().toUpperCase())
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return false;
    
    if (excludeId) {
      // Retorna true se houver ALGUM documento com este código que não seja o excludeId
      return querySnapshot.docs.some(doc => doc.id !== excludeId);
    }
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Erro ao verificar código:", error);
    return true; 
  }
};
