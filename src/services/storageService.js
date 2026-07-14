import { app, storage } from "./firebaseConfig.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const STORAGE_BUCKET = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;

const normalizeFileName = (name) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .toLowerCase();

const shouldTryAppspotFallback = (error) => {
  const message = String(error?.message || "").toLowerCase();
  return message.includes("cors") || message.includes("network") || message.includes("failed to fetch");
};

const getFallbackStorage = () => {
  if (!STORAGE_BUCKET || !STORAGE_BUCKET.endsWith(".firebasestorage.app")) {
    return null;
  }

  const appspotBucket = STORAGE_BUCKET.replace(".firebasestorage.app", ".appspot.com");
  return getStorage(app, `gs://${appspotBucket}`);
};

const doUpload = async (targetStorage, file, folderPath) => {
  const fileRef = ref(targetStorage, folderPath);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
};

export const uploadPropertyImage = async (file, propertyCode) => {
  try {
    const safeName = normalizeFileName(file.name || "imagem.webp");
    const uniqueName = `${Date.now()}-${safeName}`;
    const folderPath = `properties/${propertyCode || 'novos'}/${uniqueName}`;
    return await doUpload(storage, file, folderPath);
  } catch (error) {
    if (shouldTryAppspotFallback(error)) {
      try {
        const fallbackStorage = getFallbackStorage();
        if (fallbackStorage) {
          const safeName = normalizeFileName(file.name || "imagem.webp");
          const uniqueName = `${Date.now()}-${safeName}`;
          const folderPath = `properties/${propertyCode || 'novos'}/${uniqueName}`;
          return await doUpload(fallbackStorage, file, folderPath);
        }
      } catch (fallbackError) {
        console.error("Falha no upload com bucket fallback appspot.com:", fallbackError);
      }
    }

    console.error("Erro ao fazer upload da imagem:", error);
    throw error;
  }
};
