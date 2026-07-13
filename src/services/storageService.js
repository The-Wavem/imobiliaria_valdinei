import { storage } from "./firebaseConfig.js";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const uploadPropertyImage = async (file, propertyCode) => {
  try {
    const uniqueName = `${Date.now()}-${file.name}`;
    const folderPath = `properties/${propertyCode || 'novos'}/${uniqueName}`;
    const fileRef = ref(storage, folderPath);

    await uploadBytes(fileRef, file);
    const downloadUrl = await getDownloadURL(fileRef);

    return downloadUrl;
  } catch (error) {
    console.error("Erro ao fazer upload da imagem:", error);
    throw error;
  }
};
