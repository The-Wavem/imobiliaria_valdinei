import { addDoc, collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig.js";

const CAMPAIGN_LINKS_COLLECTION = "campaign_links";

const mapCampaignLinkDocument = (documentSnapshot) => ({
  id: documentSnapshot.id,
  ...documentSnapshot.data(),
});

export async function addCampaignLink(linkData) {
  const payload = {
    ...linkData,
    createdAt: new Date().toISOString(),
  };

  const reference = await addDoc(collection(db, CAMPAIGN_LINKS_COLLECTION), payload);
  return reference.id;
}

export async function getCampaignLinks() {
  try {
    const snapshot = await getDocs(collection(db, CAMPAIGN_LINKS_COLLECTION));
    const links = snapshot.docs.map(mapCampaignLinkDocument);

    return links.sort((firstLink, secondLink) => {
      const firstDate = new Date(firstLink.createdAt || 0).getTime();
      const secondDate = new Date(secondLink.createdAt || 0).getTime();

      return secondDate - firstDate;
    });
  } catch (error) {
    console.error("Erro ao buscar links de campanha:", error);
    return [];
  }
}

export async function deleteCampaignLink(linkId) {
  if (!linkId) {
    return false;
  }

  await deleteDoc(doc(db, CAMPAIGN_LINKS_COLLECTION, linkId));
  return true;
}