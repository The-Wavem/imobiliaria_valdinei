import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig.js";

const LEADS_COLLECTION = "leads";

export async function addLead(leadData) {
  const payload = {
    ...leadData,
    status: "Novo",
    read: false,
    createdAt: new Date().toISOString(),
  };

  const reference = await addDoc(collection(db, LEADS_COLLECTION), payload);
  return reference.id;
}

export async function addWhatsAppLead({ name, phone, propertyId, propertyTitle, propertyCode }) {
  const payload = {
    requestType: "Contato",
    origem: "WhatsApp Direto",
    status: "Novo",
    client: {
      name: name.trim(),
      phone: phone.trim(),
      email: "",
      property: propertyTitle || "",
    },
    propertyId: propertyId || "",
    propertyCode: propertyCode || "",
    date: new Date().toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    message: `Cliente solicitou contato via WhatsApp sobre o imóvel ${propertyTitle} (${propertyCode}).`,
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

      if (status === "Novo") accumulator.novos += 1;
      if (status === "Em Atendimento") accumulator.emAtendimento += 1;

      return accumulator;
    },
    { total: 0, novos: 0, emAtendimento: 0 },
  );
}

export async function getAllLeads() {
  try {
    const snapshot = await getDocs(collection(db, LEADS_COLLECTION));
    const leads = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return leads.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Erro ao buscar leads:", error);
    return [];
  }
}