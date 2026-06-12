import { addDoc, collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig.js";

const CAMPAIGN_LINKS_COLLECTION = "campaign_links";
const CAMPAIGN_CLICKS_COLLECTION = "campaign_clicks";

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
    const [linksSnapshot, clicksSnapshot] = await Promise.all([
      getDocs(collection(db, CAMPAIGN_LINKS_COLLECTION)),
      getDocs(collection(db, CAMPAIGN_CLICKS_COLLECTION)),
    ]);

    const clicksMap = {};
    clicksSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const key = `${data.source}_${data.medium}_${data.campaign}`.toLowerCase();
      clicksMap[key] = data.clicks || 0;
    });

    const links = linksSnapshot.docs.map((doc) => {
      const linkData = mapCampaignLinkDocument(doc);
      const source = String(linkData.source || "outro").trim().toLowerCase();
      const medium = String(linkData.medium || "social").trim().toLowerCase();
      const campaign = String(linkData.campaign || "").trim().toLowerCase();
      
      const key = `${source}_${medium}_${campaign}`;
      
      return {
        ...linkData,
        clicks: clicksMap[key] || 0,
      };
    });

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