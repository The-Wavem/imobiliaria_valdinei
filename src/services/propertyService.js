import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig.js";

const PROPERTY_COLLECTION = "properties";

export async function getPropertiesStats() {
  const snapshot = await getDocs(collection(db, PROPERTY_COLLECTION));

  const total = snapshot.docs.length;
  const ativos = snapshot.docs.reduce((count, documentSnapshot) => {
    const data = documentSnapshot.data() || {};
    return count + (data.status === "Ativo" ? 1 : 0);
  }, 0);

  return {
    total,
    ativos,
    inativos: total - ativos,
  };
}