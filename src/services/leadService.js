import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig.js";

const LEADS_COLLECTION = "leads";

export const addLead = async (leadData) => {
  try {
    const docRef = await addDoc(collection(db, "leads"), {
      ...leadData,
      status: "Novo",
      createdAt: new Date().toISOString(),
      read: false 
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao salvar solicitação de contato:", error);
    throw error;
  }
};

export async function getLeadsStats() {
  const snapshot = await getDocs(collection(db, LEADS_COLLECTION));

  return snapshot.docs.reduce(
    (accumulator, documentSnapshot) => {
      const data = documentSnapshot.data() || {};
      const status = String(data.status || "");

      accumulator.total += 1;

      if (status === "Novo") {
        accumulator.novos += 1;
      }

      if (status === "Em Atendimento") {
        accumulator.emAtendimento += 1;
      }

      return accumulator;
    },
    { total: 0, novos: 0, emAtendimento: 0 },
  );
}