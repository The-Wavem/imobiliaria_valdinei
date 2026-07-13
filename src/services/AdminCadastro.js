import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

export const PROPERTY_COLLECTION = "properties";

const cleanText = (value) => (typeof value === "string" ? value.trim() : "");

const cleanNumber = (value) => {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const cleanList = (values = []) =>
  [...new Set(values.map((item) => cleanText(item)).filter(Boolean))];

const normalizeMediaList = (values = []) => {
  const items = Array.isArray(values) ? values : [values];
  const urls = [];

  items.forEach((item) => {
    const text = cleanText(item);
    if (!text) return;

    const matches = text.match(/https?:\/\/[^\s"'<>]+/g);
    if (matches?.length) {
      urls.push(...matches.map((url) => url.trim()));
      return;
    }

    text.split(/[\n,;]+/).forEach((part) => {
      const value = cleanText(part);
      if (value) urls.push(value);
    });
  });

  return [...new Set(urls.filter(Boolean))];
};

const buildKeywords = (property) =>
  cleanList([
    property.title,
    property.type,
    property.category,
    property.neighborhood,
    property.address,
    ...(property.features || []),
  ]);

export function buildPropertyDocument(formData, options = {}) {
  const photos = normalizeMediaList([
    ...(Array.isArray(formData.photos) ? formData.photos : [formData.photos]),
    formData.imageUrl,
  ]);
  const coverImage = photos[0] || cleanText(formData.imageUrl);
  const createdAt =
    options.existingProperty?.audit?.createdAt || serverTimestamp();
  const active =
    options.active ?? options.existingProperty?.status?.active ?? true;

  return {
    propertyId: options.propertyId ?? null,
    code: cleanText(formData.code),
    title: cleanText(formData.title),
    category: cleanText(formData.category),
    type: cleanText(formData.type) || "Imóvel",
    pricing: {
      price: cleanNumber(formData.price),
      condo: cleanNumber(formData.condo),
      iptu: cleanNumber(formData.iptu),
      currency: "BRL",
    },
    location: {
      address: cleanText(formData.address),
      neighborhood: cleanText(formData.neighborhood),
      area: cleanNumber(formData.area),
      bedrooms: cleanNumber(formData.bedrooms),
      bathrooms: cleanNumber(formData.bathrooms),
      parkingSpaces: cleanNumber(formData.parkingSpaces),
    },
    media: {
      coverImage,
      photos,
    },
    content: {
      summary: cleanText(formData.summary),
      description: cleanText(formData.description),
    },
    features: cleanList(formData.features),
    status: {
      active,
      featured: options.existingProperty?.status?.featured ?? false,
      visibility: active ? "published" : "draft",
    },
    seo: {
      title: cleanText(formData.title),
      keywords: buildKeywords(formData),
    },
    audit: {
      createdAt,
      updatedAt: serverTimestamp(),
    },
  };
}

export async function savePropertyDocument(formData, options = {}) {
  const document = buildPropertyDocument(formData, options);

  if (options.firestoreId) {
    const reference = doc(db, PROPERTY_COLLECTION, options.firestoreId);

    await setDoc(reference, document, { merge: true });

    return { id: reference.id, document };
  }

  const reference = await addDoc(collection(db, PROPERTY_COLLECTION), document);

  return { id: reference.id, document };
}