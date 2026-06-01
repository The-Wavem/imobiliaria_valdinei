import { addDoc, collection, getDocs } from "firebase/firestore";
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