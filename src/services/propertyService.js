import { addDoc, collection, doc, getDocs, increment, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig.js";
import { mapPropertyDocument } from "./properties.js";

const PROPERTY_COLLECTION = "properties";

export async function addProperty(propertyData) {
  const reference = await addDoc(
    collection(db, PROPERTY_COLLECTION),
    propertyData,
  );
  return reference.id;
}

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