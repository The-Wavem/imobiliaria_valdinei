import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig.js";

const LEADS_COLLECTION = "leads";

export async function addLead(leadData) {
  const payload = {
    ...leadData,
    status: "Novo",
    createdAt: new Date().toISOString(),
  };

  const reference = await addDoc(collection(db, LEADS_COLLECTION), payload);

  return reference.id;
}

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