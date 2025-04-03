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
} from 'firebase/firestore/lite'; // lite versiyonu kullan - tarayıcı destekli
import { 
  getStorage, 
  ref, 
  uploadString, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';

// Firebase yapılandırma bilgileri
const firebaseConfig = {
  apiKey: "AIzaSyBc4G2qA7QFGCVXs5fJyDyRtbxkpYYKIoY",
  authDomain: "letter-app-f1e8f.firebaseapp.com",
  projectId: "letter-app-f1e8f",
  storageBucket: "letter-app-f1e8f.appspot.com",
  messagingSenderId: "1094785797811",
  appId: "1:1094785797811:web:c4b79c7e937c1cb0ae8c43"
};

// Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Mektup veri tipi tanımı
export interface LetterData {
  id: string;
  content: string[];
  theme: string;
  stickers?: any[];
  drawings?: any[];
  timestamp: number;
  title?: string;
  [key: string]: any;
}

// Mektupları kaydetme fonksiyonu
export const saveLetter = async (letterData: {
  title?: string;
  content: string[];
  theme: string;
  stickers?: any[];
  drawings?: any[];
  timestamp?: number;
}) => {
  try {
    // Timestamp ekle
    const letterWithTimestamp = {
      ...letterData,
      timestamp: letterData.timestamp || Date.now()
    };
    
    // Firestore'a mektubu ekle
    const docRef = await addDoc(collection(db, "letters"), letterWithTimestamp);
    
    // Çizimleri storage'a kaydet
    if (letterData.drawings && letterData.drawings.length > 0) {
      const updatedDrawings = await Promise.all(
        letterData.drawings.map(async (drawing, index) => {
          // Base64 formatındaki çizimi storage'a yükle
          const storageRef = ref(storage, `drawings/${docRef.id}_${index}.png`);
          await uploadString(storageRef, drawing.url, 'data_url');
          
          // Yüklenen dosyanın URL'ini al
          const downloadURL = await getDownloadURL(storageRef);
          
          // URL'i güncelle ve geri döndür
          return {
            ...drawing,
            url: downloadURL
          };
        })
      );
      
      // Mektubu güncellenmiş çizim URL'leri ile güncelle
      await updateDoc(doc(db, "letters", docRef.id), {
        drawings: updatedDrawings
      });
    }
    
    return docRef.id;
  } catch (error) {
    console.error("Mektup kaydedilemedi:", error);
    throw error;
  }
};

// Mektupları getirme fonksiyonu
export const getLetters = async () => {
  try {
    const q = query(collection(db, "letters"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as LetterData[];
  } catch (error) {
    console.error("Mektuplar getirilemedi:", error);
    return [];
  }
};

// Belirli bir mektubu getirme fonksiyonu
export const getLetter = async (letterId: string): Promise<LetterData> => {
  try {
    const docRef = doc(db, "letters", letterId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as LetterData;
    } else {
      throw new Error("Mektup bulunamadı!");
    }
  } catch (error) {
    console.error("Mektup getirilemedi:", error);
    throw error;
  }
};

// Mektup silme fonksiyonu
export const deleteLetter = async (letterId: string) => {
  try {
    // Mektubu getir
    const letterData = await getLetter(letterId);
    
    // Çizimleri sil (varsa)
    if (letterData.drawings && letterData.drawings.length > 0) {
      await Promise.all(
        letterData.drawings.map(async (drawing, index) => {
          // URL Firebase Storage URL'i ise sil
          if (drawing.url && drawing.url.includes('firebase')) {
            const storageRef = ref(storage, `drawings/${letterId}_${index}.png`);
            try {
              await deleteObject(storageRef);
            } catch (e) {
              console.log('Çizim silinirken hata oluştu:', e);
              // Hata durumunda devam et
            }
          }
        })
      );
    }
    
    // Mektubu Firestore'dan sil
    await deleteDoc(doc(db, "letters", letterId));
    
    return true;
  } catch (error) {
    console.error("Mektup silinemedi:", error);
    throw error;
  }
};

export { app, db, storage }; 