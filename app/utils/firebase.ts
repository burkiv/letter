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
  storageBucket: "dijital-mektup.firebasestorage.app",
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
  content: Array<{ html: string; font: string; theme: string; color?: string }>; // New structure
  theme: string; // Global/fallback theme
  font?: string; // Global/fallback font
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
  content: string[]; // Array of HTML strings for each page
  pageSettings: { [pageIndex: number]: { font: string; paper: string; color: string } }; // New: per-page settings
  theme: string; // Global/fallback theme string
  font?: string; // Global/fallback font string
  from?: string;
  to?: string;
  stickers?: any[];
  drawings?: any[];
  imageOverlay?: string;
  timestamp?: number;
}) => {
  try {
    const {
      content: letterHtmls,
      pageSettings,
      theme: globalThemeInput,
      font: globalFontInput,
      imageOverlay: imageOverlayInput,
      drawings: drawingsInput,
      ...coreData
    } = letterData;

    // 1. Add initial document to get an ID.
    const docRef = await addDoc(collection(db, "letters"), {
      ...coreData,
      font: globalFontInput, // Store the global/fallback font
      timestamp: letterData.timestamp || Date.now(),
      // theme and content will be set in subsequent updateDoc calls
    });

    // 2. Process and upload globalThemeInput if it's a data URL
    let finalGlobalThemeUrl = globalThemeInput;
    if (globalThemeInput && globalThemeInput.startsWith("data:")) {
      const globalThemeRef = ref(storage, `themes/${docRef.id}_global_theme.png`);
      await uploadString(globalThemeRef, globalThemeInput, 'data_url');
      finalGlobalThemeUrl = await getDownloadURL(globalThemeRef);
    }
    // Update the document with the final global theme URL
    await updateDoc(doc(db, "letters", docRef.id), {
      theme: finalGlobalThemeUrl
    });

    // 3. Process page-specific themes and construct the 'content' array for Firestore
    const processedContent = await Promise.all(
      letterHtmls.map(async (html, index) => {
        const settings = pageSettings[index] || {};
        let pageSpecificThemeUrl = settings.paper || finalGlobalThemeUrl;

        if (settings.paper && settings.paper.startsWith("data:")) {
          const pageThemeRef = ref(storage, `themes/${docRef.id}_page_${index}_theme.png`);
          await uploadString(pageThemeRef, settings.paper, 'data_url');
          pageSpecificThemeUrl = await getDownloadURL(pageThemeRef);
        }

        return {
          html: html || "<p></p>",
          font: settings.font || globalFontInput || 'inherit',
          theme: pageSpecificThemeUrl,
          color: settings.color || '#222222', // Default page text color
        };
      })
    );

    // Update the document with the fully processed content array
    await updateDoc(doc(db, "letters", docRef.id), {
      content: processedContent
    });

    // 4. Handle imageOverlay (if it's a data URL)
    if (imageOverlayInput) {
      let finalImageOverlayUrl = imageOverlayInput;
      if (imageOverlayInput.startsWith("data:")) {
        const overlayStorageRef = ref(storage, `images/${docRef.id}_overlay.png`);
        await uploadString(overlayStorageRef, imageOverlayInput, 'data_url');
        finalImageOverlayUrl = await getDownloadURL(overlayStorageRef);
      }
      await updateDoc(doc(db, "letters", docRef.id), {
        imageOverlay: finalImageOverlayUrl
      });
    }

    // 5. Handle drawings (if they are data URLs)
    if (drawingsInput && drawingsInput.length > 0) {
      const updatedDrawings = await Promise.all(
        drawingsInput.map(async (drawing, idx) => {
          if (drawing.url && drawing.url.startsWith("data:")) {
            const drawingStorageRef = ref(storage, `drawings/${docRef.id}_drawing_${idx}.png`);
            await uploadString(drawingStorageRef, drawing.url, 'data_url');
            const drawingDownloadURL = await getDownloadURL(drawingStorageRef);
            return { ...drawing, url: drawingDownloadURL };
          }
          return drawing;
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

// Tüm mektup ID'lerini getirme (Yeni eklenen fonksiyon)
export const getAllLetterIds = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "letters"));
    const letterIds = querySnapshot.docs.map((doc) => doc.id);
    return letterIds;
  } catch (error) {
    console.error("Mektup ID'leri getirilemedi:", error);
    return [];
  }
};

export { app, db, storage, auth, provider };