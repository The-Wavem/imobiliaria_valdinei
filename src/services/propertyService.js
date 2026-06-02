import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebaseConfig.js";

const PROPERTY_COLLECTION = "properties";

export async function addProperty(propertyData) {
  const reference = await addDoc(collection(db, PROPERTY_COLLECTION), propertyData);

  return reference.id;
}

export async function getPropertiesStats() {
  const snapshot = await getDocs(collection(db, PROPERTY_COLLECTION));

  const total = snapshot.docs.length;
  const ativos = snapshot.docs.reduce((count, documentSnapshot) => {
    const data = documentSnapshot.data() || {};
    const isActive = data.status && typeof data.status === "object"
      ? data.status.active !== false
      : data.status === "Ativo" || data.active !== false;

    return count + (isActive ? 1 : 0);
  }, 0);

  return {
    total,
    ativos,
    inativos: total - ativos,
  };
}

export const getPublicProperties = async (categoryParam) => {
  try {
    const q = query(
      collection(db, "properties"),
      where("category", "==", categoryParam)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Erro ao buscar imóveis públicos:", error);
    return [];
  }
};