// Gerekli firebase modüllerini import ediyoruz
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  query, 
  orderBy  
} from 'firebase/firestore/lite';
import { 
  getStorage, 
  ref, 
  uploadString, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebase yapılandırma bilgileri
const firebaseConfig = {
  apiKey: "AIzaSyDbfqgX9NMUCVgU0_zbBJ2TQHWFKQHexl4",
  authDomain: "dijital-mektup.firebaseapp.com",
  projectId: "dijital-mektup",
  storageBucket: "dijital-mektup.appspot.com",
  messagingSenderId: "615516545800",
  appId: "1:615516545800:web:c17f55f6eadb129d4842bd"
};

// Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Mektup veri tipi tanımı
export interface LetterData {
  id: string;
  content: string[];
  theme: string;
  font?: string;
  stickers?: any[];
  drawings?: any[];
  timestamp: number;
  title?: string;
  from?: string;
  to?: string;
  imageOverlay?: string;
  [key: string]: any;
}

// Mektupları kaydetme fonksiyonu (Güncellendi!)
export const saveLetter = async (letterData: {
  title?: string;
  content: string[];
  theme: string;
  font?: string;
  from?: string;
  to?: string;
  stickers?: any[];
  drawings?: any[];
  imageOverlay?: string;
  timestamp?: number;
}) => {
  try {
    const { theme, ...dataWithoutTheme } = letterData;

    const docRef = await addDoc(collection(db, "letters"), {
      ...dataWithoutTheme,
      timestamp: letterData.timestamp || Date.now()
    });

    let themeUrl = theme;
    if (theme.startsWith("data:")) {
      const themeRef = ref(storage, `themes/${docRef.id}_theme.png`);
      await uploadString(themeRef, theme, 'data_url');
      themeUrl = await getDownloadURL(themeRef);
    }

    await updateDoc(doc(db, "letters", docRef.id), {
      theme: themeUrl
    });

    if (letterData.imageOverlay) {
      const storageRef = ref(storage, `images/${docRef.id}_overlay.png`);
      await uploadString(storageRef, letterData.imageOverlay, 'data_url');
      const downloadURL = await getDownloadURL(storageRef);
      await updateDoc(doc(db, "letters", docRef.id), {
        imageOverlay: downloadURL
      });
    }

    if (letterData.drawings && letterData.drawings.length > 0) {
      const updatedDrawings = await Promise.all(
        letterData.drawings.map(async (drawing, index) => {
          const storageRef = ref(storage, `drawings/${docRef.id}_${index}.png`);
          await uploadString(storageRef, drawing.url, 'data_url');
          const downloadURL = await getDownloadURL(storageRef);
          return { ...drawing, url: downloadURL };
        })
      );

      await updateDoc(doc(db, "letters", docRef.id), { drawings: updatedDrawings });
    }

    return docRef.id;
  } catch (error) {
    console.error("Mektup kaydedilemedi:", error);
    throw error;
  }
};

// Mektupları getirme
export const getLetters = async () => {
  try {
    const q = query(collection(db, "letters"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LetterData[];
  } catch (error) {
    console.error("Mektuplar getirilemedi:", error);
    return [];
  }
};

// Tek bir mektubu getirme
export const getLetter = async (letterId: string): Promise<LetterData> => {
  const docRef = doc(db, "letters", letterId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() } as LetterData;
  throw new Error("Mektup bulunamadı!");
};

// Mektup silme
export const deleteLetter = async (letterId: string) => {
  try {
    await deleteDoc(doc(db, "letters", letterId));
    return true;
  } catch (error) {
    console.error("Mektup silinemedi:", error);
    throw error;
  }
};

export { app, db, storage, auth, provider };