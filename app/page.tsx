'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Player } from '@lottiefiles/react-lottie-player';
import { usePathname } from 'next/navigation';
import html2canvas from 'html2canvas';
import LoginButton from './components/LoginButton';
import LogoutButton from './components/LogoutButton';
import { useAuth } from './context/AuthContext';

// Bileşenler
import PageNavigation from './components/PageNavigation';
import FloatingHearts from './components/FloatingHearts';
import LetterEditor, { LetterEditorRefHandle } from './components/LetterEditor';

// Yardımcılar
import { saveDefaultThemesToLocalFiles, getThemeUrl } from './utils/defaultThemes';
import { saveLetter, getLetters, deleteLetter, LetterData } from './utils/firebase';

// Dinamik içe aktarmalar
const CustomizeMenu = dynamic(() => import('./components/CustomizeMenu'), { ssr: false });
const ThemeSelector = dynamic(() => import('./components/ThemeSelector'), { ssr: false });
const Drafts = dynamic(() => import('./components/Drafts'), { ssr: false });

interface PageType {
  id: number;
  content: string;
}

interface DraftType {
  id: number;
  date: string;
  theme: string;
  pages: PageType[];
}

// Kullanılabilir yazı fontları
const AVAILABLE_FONTS = [
  { name: 'Varsayılan', value: 'inherit' },
  { name: 'El Yazısı', value: "'Dancing Script', cursive" },
  { name: 'Klasik', value: "'Playfair Display', serif" },
  { name: 'Modern', value: "'Poppins', sans-serif" },
  { name: 'Romantik', value: "'Pacifico', cursive" },
  { name: 'Resmi', value: "'Roboto Slab', serif" }
];

export default function Home() {
  // İkinizin UID'leri (Firebase Authentication'dan alınmış olacak)
const USERS = {
  burki: "9DWddtzxlaWX49QKF75AQ8raBG92",
  yenge: "jcT79LR7A7hwE5xXxWZEk6gYf3n1"
};

  const { user, login, logout } = useAuth();
  const letterEditorRef = useRef<LetterEditorRefHandle>(null);
  const letterPageRef = useRef<HTMLDivElement>(null); // Ref for the current LetterPage DOM element
  const [activeTab, setActiveTab] = useState<string>('edit');
  const [customizeOpen, setCustomizeOpen] = useState<boolean>(false);
  const [currentTheme, setCurrentTheme] = useState<string>('/images/paper3.jpeg');
  const [currentFont, setCurrentFont] = useState<string>('inherit'); // Varsayılan font
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [letters, setLetters] = useState<string[]>(['']);
  const [drafts, setDrafts] = useState<DraftType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sentLetters, setSentLetters] = useState<LetterData[]>([]);
  const [receivedLetters, setReceivedLetters] = useState<LetterData[]>([]);
  const pathname = usePathname();
  const [initialized, setInitialized] = useState(false);
  const [pageBackgrounds, setPageBackgrounds] = useState<{ [pageIndex: number]: string }>({});
  const [pageSettings, setPageSettings] = useState<{ [pageIndex: number]: { font: string; paper: string; color: string } }>({});
  const [currentColor, setCurrentColor] = useState<string>("#222222");

  // Başlangıçta varsayılan temaları yükle
  useEffect(() => {
    const loadThemes = async () => {
      setIsLoading(true);
      await saveDefaultThemesToLocalFiles();
      setIsLoading(false);
    };
    
    loadThemes();
  }, []);

  // Sayfa yenilendiğinde veya ilk açıldığında içeriği sıfırla
  useEffect(() => {
    // Ana sayfadaysak (/) içeriği sıfırla
    if (pathname === '/') {
      console.log('Ana sayfa açıldı, editör içeriği sıfırlanıyor...');
      // İçeriği sıfırla - tek boş sayfa ile başla
      setLetters(['']);
      setCurrentPage(0);
    }
  }, [pathname]); // Sadece pathname değiştiğinde tetiklensin

// Firebase'den mektupları yükle (Giriş yapan kullanıcıya göre)
useEffect(() => {
  const loadLetters = async () => {
    try {
      // Kullanıcı giriş yapmadıysa işlem yapma
      if (!user) return;

      // Editör dışı sekmelerde Firebase'den mektupları getir
      if (activeTab !== 'edit') {
        console.log(`${activeTab} sekmesi açıldı, mektuplar Firestore'dan yükleniyor...`);

        const savedLetters = await getLetters();

        if (savedLetters && savedLetters.length > 0) {
          // Mektupları kullanıcı UID'sine göre filtrele
          const sent = savedLetters.filter(letter => letter.from === user.uid);
          const received = savedLetters.filter(letter => letter.to === user.uid);

          setSentLetters(sent);
          setReceivedLetters(received);
        } else {
          setSentLetters([]);
          setReceivedLetters([]);
        }
      }
    } catch (error) {
      console.error("Mektuplar yüklenirken hata oluştu:", error);
    }
  };

  loadLetters();
}, [activeTab, user]); // activeTab veya kullanıcı değiştiğinde tetiklensin

  const handlePageChange = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < letters.length) {
      setCurrentPage(pageIndex);
    }
  };

  const handleAddPage = () => {
    // Yeni mektubu ekle
    const newLetters = [...letters, ''];
    setLetters(newLetters);
    
    // Yeni eklenen sayfaya geç
    setCurrentPage(letters.length);
    
    console.log('Yeni sayfa eklendi:', letters.length + 1);
  };

  const handleTextChange = (updatedPageContent: string) => {
    // Şu anki sayfanın içeriğini güncelle
    const newLetters = [...letters];
    newLetters[currentPage] = updatedPageContent;
    setLetters(newLetters);
  };

  // Mektubu Firebase'e kaydet (Taslak olarak)
  const saveToDraft = async () => {
    try {
      // Mektup verilerini hazırla
      const letterData = {
        title: "Taslak Mektup", // Add a default title for drafts or make it dynamic
        content: letters, // Array of HTML strings
        pageSettings: pageSettings, // Pass the per-page settings object
        theme: currentTheme, // Global/fallback theme
        font: currentFont, // Global/fallback font
        timestamp: Date.now(),
        // from and to can be omitted for drafts or set to the current user if applicable
      };
      
      // Firebase'e kaydet
      const letterId = await saveLetter(letterData);
      
      // Başarılı mesajı göster
      alert("Mektup taslak olarak başarıyla kaydedildi! ID: " + letterId);
      letterEditorRef.current?.sendLottieAnimation(); // Play animation
    } catch (error) {
      console.error("Mektup taslak olarak kaydedilirken hata oluştu:", error);
      alert("Mektup taslak olarak kaydedilemedi. Lütfen tekrar deneyin.");
    }
  };

  const deletePage = () => {
    if (letters.length <= 1) {
      // Tek sayfa varsa sadece içeriği temizle
      setLetters(['']);
      setCurrentPage(0);
      return;
    }

    // Sayfayı sil
    const newLetters = [...letters];
    newLetters.splice(currentPage, 1);

    // Sayfa numarasını güncelle
    const newPage = currentPage >= newLetters.length ? newLetters.length - 1 : currentPage;

    // State güncelle
    setLetters(newLetters);
    setCurrentPage(newPage);
  };

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
  };

  const handleFontChange = (font: string) => {
    setCurrentFont(font);
  };

  const uploadCustomTheme = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const imageUrl = event.target.result.toString();
        setCurrentTheme(imageUrl);
        setCustomizeOpen(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Silme işlemi için fonksiyon
  const handleDeleteLetter = async (id?: string) => {
    // Eğer ID verilmişse ilgili mektubu, verilmemişse aktif mektubu sil
    if (id) {
      // Kullanıcı onayı iste
      if (!confirm("Bu mektubu silmek istediğinize emin misiniz?")) {
        return; // Kullanıcı vazgeçti
      }
      
      try {
        // Firebase'den mektubu sil
        await deleteLetter(id);
        
        // Mektupları tazele
        const savedLetters = await getLetters();
        const sent = savedLetters.filter(letter => letter.from === "burki");
        const received = savedLetters.filter(letter => letter.from !== "burki");
        setSentLetters(sent);
        setReceivedLetters(received);
        
        alert("Mektup başarıyla silindi!");
      } catch (error) {
        console.error("Mektup silinemedi:", error);
        alert("Mektup silinirken bir hata oluştu. Lütfen tekrar deneyin.");
      }
    } else {
      // Editörde açık olan mektubu temizle
      // Silme animasyonunu oynat
      if (letterEditorRef.current) {
        letterEditorRef.current.deleteLottieAnimation(async () => {
          setLetters(['']);
          setCurrentPage(0);
          setCurrentTheme(getThemeUrl('default'));
          setCurrentFont('inherit');
        });
      }
    }
  };
  
  // Gönderme işlemi 
  const handleSendLetter = async () => {
    if (!user) {
      alert("Önce giriş yapmalısın!");
      return;
    }
  
    const recipientUid = user.uid === USERS.burki ? USERS.yenge : USERS.burki;
  
    try {
      if (!letters || letters.length === 0 || letters.every(l => l.trim() === "" || l.trim() === "<p></p>")) {
        alert('İçerik alınamadı. Lütfen en az bir sayfa içeriği girin.');
        return;
      }
  
      const letterId = await saveLetter({
        title: user.uid === USERS.burki ? "Burki'den Yenge'ye 💌" : "Yenge'den Burki'ye 💌",
        content: letters, // Pass the array of HTML strings
        pageSettings: pageSettings, // Pass the per-page settings object
        theme: currentTheme || "/images/paper1.jpeg", // Global/fallback theme
        font: currentFont || "inherit", // Global/fallback font
        from: user.uid, // Gönderenin UID'si
        to: recipientUid, // Karşı tarafın UID'si
        timestamp: Date.now(),
      });
  
      alert("Mektup başarıyla gönderildi!");
      console.log("Gönderilen mektup ID:", letterId);
  
      const savedLetters = await getLetters();
      setSentLetters(savedLetters.filter(letter => letter.from === user.uid));
      setReceivedLetters(savedLetters.filter(letter => letter.to === user.uid));
  
      letterEditorRef.current?.sendLottieAnimation();
    } catch (err) {
      console.error("HATA:", err);
      alert("Mesaj gönderilemedi, tekrar deneyin.");
    }
  };

  // Per-page customization handlers
  const handlePageFontChange = (font: string) => {
    setPageSettings(prev => ({
      ...prev,
      [currentPage]: {
        ...(prev[currentPage] || { font: 'inherit', paper: '/images/paper3.jpeg', color: '#222222' }),
        font
      }
    }));
  };
  const handlePagePaperChange = (paper: string) => {
    setPageSettings(prev => ({
      ...prev,
      [currentPage]: {
        ...(prev[currentPage] || { font: 'inherit', paper: '/images/paper3.jpeg', color: '#222222' }),
        paper
      }
    }));
  };
  const handlePageColorChange = (color: string) => {
    setCurrentColor(color);
    setPageSettings(prev => ({
      ...prev,
      [currentPage]: {
        ...(prev[currentPage] || { font: 'inherit', paper: '/images/paper3.jpeg', color: '#222222' }),
        color
      }
    }));
  };

  // Özelleştirme modalında yapılan değişiklikleri sadece aktif sayfaya uygula
  const handlePageSettingChange = (setting: Partial<{ font: string; paper: string; color: string }>) => {
    setPageSettings(prev => ({
      ...prev,
      [currentPage]: {
        ...prev[currentPage],
        ...setting
      }
    }));
  };

  // Özelleştir modalındaki mevcut değerleri aktif sayfanın ayarlarından al
  const currentPageSettings = pageSettings[currentPage] || {};

  // Yükleme ekranı
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-pink-100 relative">
        <FloatingHearts count={10} />
        <div className="text-center">
          <div className="text-6xl mb-4 animate-heartBeat">✉️</div>
          <h2 className="text-2xl font-bold text-pink-500 mb-4">Mektup Uygulaması Yükleniyor</h2>
          <div className="relative w-64 h-4 bg-pink-100 rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-pink-400 animate-pulse rounded-full w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-heart-pattern bg-pink-50 relative">
      <FloatingHearts count={20} />
      
      <header className="bg-white shadow-sm py-3 mb-6 relative z-10">
  <div className="container mx-auto px-4 flex justify-between items-center">
    <h1 className="text-2xl font-bold text-pink-500 flex items-center">
      <span className="mr-2 animate-heartBeat">✉️</span> Mektup Uygulaması
    </h1>

    {user ? (
  <div className="flex items-center gap-2">
    <span className="text-gray-700 text-sm">Hoş geldin, {user.displayName || "Kullanıcı"}!</span>
    <button onClick={logout} className="text-sm text-red-500 hover:underline">Çıkış Yap</button>
  </div>
) : (
  <button onClick={login} className="text-sm text-blue-500 hover:underline">Giriş Yap</button>
)}

    <div className="flex items-center gap-4">
      {/* Sekmeler */}
      <div className="flex rounded-md overflow-hidden shadow-sm">
        <button 
          className={`px-4 py-2 ${activeTab === 'edit' 
            ? 'bg-pink-500 text-white' 
            : 'bg-white text-gray-700 hover:bg-pink-50'} transition-colors focus:outline-none`}
          onClick={() => setActiveTab('edit')}
        >
          Editör
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === 'sent' 
            ? 'bg-pink-500 text-white' 
            : 'bg-white text-gray-700 hover:bg-pink-50'} transition-colors focus:outline-none`}
          onClick={() => setActiveTab('sent')}
        >
          Gönderdiğim
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === 'received' 
            ? 'bg-pink-500 text-white' 
            : 'bg-white text-gray-700 hover:bg-pink-50'} transition-colors focus:outline-none`}
          onClick={() => setActiveTab('received')}
        >
          Gelen
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === 'drafts' 
            ? 'bg-pink-500 text-white' 
            : 'bg-white text-gray-700 hover:bg-pink-50'} transition-colors focus:outline-none`}
          onClick={() => setActiveTab('drafts')}
        >
          Taslaklar
        </button>
      </div>

      {/* Giriş / Çıkış Butonları */}
      <div className="ml-4">
        {user ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              👤 {user.displayName || 'Kullanıcı'}
            </span>
            <button 
              onClick={logout}
              className="bg-pink-100 hover:bg-pink-200 text-pink-600 text-sm px-3 py-1 rounded-full transition-colors border border-pink-300"
            >
              Çıkış Yap
            </button>
          </div>
        ) : (
          <button 
            onClick={login}
            className="bg-pink-500 hover:bg-pink-600 text-white text-sm px-4 py-2 rounded-full transition-colors"
          >
            Giriş Yap
          </button>
        )}
      </div>
    </div>
  </div>
</header>

      <div className="container mx-auto px-4">
        {activeTab === 'edit' ? (
          <div className="relative">
            <div className="flex flex-col items-center relative">
              <div className="flex justify-center w-full mb-4">
                <PageNavigation 
                  currentPage={currentPage}
                  totalPages={letters.length}
                  onChangePage={handlePageChange}
                  onAddPage={handleAddPage}
                />
              </div>
            
              <div className="relative">
                <LetterEditor
                  ref={letterEditorRef}
                  letterPageRef={letterPageRef} // Pass the ref to LetterEditor
                  theme={pageSettings[currentPage]?.paper || currentTheme}
                  font={pageSettings[currentPage]?.font || currentFont}
                  color={pageSettings[currentPage]?.color || currentColor}
                  pageSettings={pageSettings}
                  onPageChange={handlePageChange}
                  currentPage={currentPage}
                  totalPages={letters.length}
                  onTextChange={handleTextChange}
                  letters={letters}
                  onAddPage={handleAddPage}
                  stickers={[]}
                  pageBackgrounds={pageBackgrounds}
                />
                
                <div className="absolute -top-2 -left-2 z-20 flex space-x-2">
                  <button 
                    className={`w-10 h-10 flex items-center justify-center rounded-full shadow-md transition-colors ${
                      customizeOpen ? 'bg-pink-500 text-white' : 'bg-white text-pink-500 hover:bg-pink-100'
                    }`}
                    onClick={() => setCustomizeOpen(!customizeOpen)}
                    title="Mektup özelleştir"
                  >
                    <span className="text-lg">🎨</span>
                  </button>
                </div>
                
                <button 
                  className="absolute -bottom-2 -left-2 z-20 flex items-center justify-center bg-red-500 text-white w-12 h-12 rounded-full shadow-md hover:bg-red-600 transition-colors"
                  onClick={deletePage}
                  title="Sayfayı sil"
                >
                  <span className="text-xl">🗑️</span>
                </button>
                
                <button 
                  className="absolute -bottom-2 -right-2 z-20 flex items-center justify-center bg-green-500 text-white w-12 h-12 rounded-full shadow-md hover:bg-green-600 transition-colors"
                  onClick={saveToDraft}
                  title="Mektubu gönder"
                >
                  <span className="text-xl">📨</span>
                </button>
              </div>
            </div>
          </div>
        ) : activeTab === 'sent' ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-pink-600 mb-6 flex items-center">
              <span className="mr-2">📤</span> Gönderdiğim Mektuplar
            </h2>
            
            {sentLetters.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg">Henüz gönderdiğin mektup yok.</p>
                <p className="mt-2">Yeni bir mektup yazıp gönderebilirsin! 💌</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sentLetters.map((letter) => (
                  <div key={letter.id} className="relative">
                    <a 
                      href={`/mektup/${letter.id}`}
                      className="block group"
                    >
                      <div 
                        className="h-48 border border-pink-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform group-hover:scale-105 group-hover:-rotate-1 relative"
                        style={{
                          backgroundImage: `url(${letter.theme})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      >
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm p-4 flex flex-col">
                          <h3 className="font-medium text-lg text-pink-600 mb-2">{letter.title || "Yenge'ye Mektup 💌"}</h3>
                          <p className="text-gray-600 line-clamp-2 text-sm mb-2">
                            {letter.content && letter.content[0] && typeof letter.content[0] === 'object' && letter.content[0].html ? 
                              letter.content[0].html.replace(/<[^>]*>/g, '').slice(0, 80) + "..." : 
                              (letter.content && letter.content[0] && typeof letter.content[0] === 'string' ? 
                                (letter.content[0] as string).replace(/<[^>]*>/g, '').slice(0, 80) + "..." : 
                                "Mektup içeriği yok...")
                            }
                          </p>
                          <div className="mt-auto text-xs text-gray-500">
                            {new Date(letter.timestamp).toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          <div className="absolute top-2 right-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                            Gönderildi
                          </div>
                        </div>
                      </div>
                    </a>
                    <button 
                      onClick={() => handleDeleteLetter(letter.id)}
                      className="absolute bottom-2 right-2 z-20 bg-red-500 text-white p-1 rounded-full shadow-sm hover:bg-red-600 transition-colors"
                      title="Bu mektubu sil"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'received' ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-pink-600 mb-6 flex items-center">
              <span className="mr-2">📩</span> Gelen Mektuplar
            </h2>
            
            {receivedLetters.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg">Henüz gelen mektup yok.</p>
                <p className="mt-2">Sana mektup geldiğinde burada görünecek! 💌</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {receivedLetters.map((letter) => (
                  <div key={letter.id} className="relative">
                    <a 
                      href={`/mektup/${letter.id}`}
                      className="block group"
                    >
                      <div 
                        className="h-48 border border-pink-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform group-hover:scale-105 group-hover:rotate-1 relative"
                        style={{
                          backgroundImage: `url(${letter.theme})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      >
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm p-4 flex flex-col">
                          <h3 className="font-medium text-lg text-pink-600 mb-2">{letter.title || "Yenge'den Mektup 💌"}</h3>
                          <p className="text-gray-600 line-clamp-2 text-sm mb-2">
                            {letter.content && letter.content[0] && typeof letter.content[0] === 'object' && letter.content[0].html ? 
                              letter.content[0].html.replace(/<[^>]*>/g, '').slice(0, 80) + "..." : 
                              (letter.content && letter.content[0] && typeof letter.content[0] === 'string' ? 
                                (letter.content[0] as string).replace(/<[^>]*>/g, '').slice(0, 80) + "..." : 
                                "Mektup içeriği yok...")
                            }
                          </p>
                          <div className="mt-auto text-xs text-gray-500">
                            {new Date(letter.timestamp).toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                            Yeni
                          </div>
                        </div>
                      </div>
                    </a>
                    <button 
                      onClick={() => handleDeleteLetter(letter.id)}
                      className="absolute bottom-2 right-2 z-20 bg-red-500 text-white p-1 rounded-full shadow-sm hover:bg-red-600 transition-colors"
                      title="Bu mektubu sil"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <Drafts 
              drafts={drafts}
              onDraftSelect={(draftId: number) => {
                const selectedDraft = drafts.find((d: DraftType) => d.id === draftId);
                if (selectedDraft) {
                  setLetters(selectedDraft.pages.map(page => page.content));
                  setCurrentTheme(selectedDraft.theme);
                  setCurrentPage(0);
                  setActiveTab('edit');
                }
              }}
            />
          </div>
        )}
      </div>

      {customizeOpen && (
        <div className="mt-6 w-full max-w-md mx-auto absolute z-50 top-20 left-1/2 transform -translate-x-1/2">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-pink-100">
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-800 mb-2 flex justify-between items-center">
                <span>Mektup Özelleştir (Sayfa {currentPage + 1})</span>
                <button 
                  onClick={() => setCustomizeOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </h3>
              <div className="space-y-4">
                {/* Yazı Fontu Seçimi */}
                <div className="border-b border-gray-100 pb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Yazı Fontu (Bu sayfa)</h4>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_FONTS.map((font) => (
                      <button
                        key={font.value}
                        onClick={() => handlePageFontChange(font.value)}
                        className={`px-3 py-2 rounded text-sm ${
                          (pageSettings[currentPage]?.font || currentFont) === font.value 
                            ? 'bg-pink-100 text-pink-800 border border-pink-300' 
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                        style={{ fontFamily: font.value }}
                      >
                        {font.name}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Tema Seçimi */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Mektup Kağıdı (Bu sayfa)</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {["/images/paper1.jpeg", "/images/paper2.jpeg", "/images/paper3.jpeg"].map((img) => (
                      <button
                        key={img}
                        className={`h-16 border-2 rounded overflow-hidden ${
                          (pageSettings[currentPage]?.paper || currentTheme) === img ? "border-pink-500" : "border-transparent"
                        }`}
                        onClick={() => handlePagePaperChange(img)}
                      >
                        <img
                          src={img}
                          alt={"Kağıt"}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
                {/* Kendi kağıdını yükle */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Kendi Kağıdını Yükle (Bu sayfa)</h4>
                  <div className="flex flex-col space-y-2">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            const imageUrl = event.target.result.toString();
                            handlePagePaperChange(imageUrl);
                            setCustomizeOpen(false);
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 px-4 bg-pink-100 hover:bg-pink-200 text-pink-800 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Resim Yükle
                    </button>
                  </div>
                </div>
                {/* Yazı Rengi Seçimi */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Yazı Rengi (Bu sayfa)</h4>
                  <input
                    type="color"
                    value={pageSettings[currentPage]?.color || currentColor}
                    onChange={e => handlePageColorChange(e.target.value)}
                    className="w-10 h-10 p-0 border-2 border-pink-200 rounded-full cursor-pointer"
                    title="Yazı rengi seç"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Özelleştir Butonu */}
      <button
        onClick={() => setCustomizeOpen(!customizeOpen)}
        className="fixed bottom-4 right-4 z-50 bg-white p-3 rounded-full shadow-lg hover:bg-pink-50 transition-colors border border-pink-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>

      <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-between items-center bg-white/80 backdrop-blur-sm border-t border-pink-100 z-40">
      <button 
  onClick={deletePage}
  className="bg-white text-pink-600 px-4 py-2 rounded-full flex items-center gap-2 shadow-md hover:bg-pink-50 transition-colors border border-pink-200"
>

          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Sil
        </button>
        <div className="flex gap-4">
          <button 
            onClick={saveToDraft}
            className="bg-white text-pink-600 px-4 py-2 rounded-full flex items-center gap-2 shadow-md hover:bg-pink-50 transition-colors border border-pink-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Kaydet
          </button>
          
          <button 
            onClick={handleSendLetter}
            className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-2 rounded-full flex items-center gap-2 shadow-md hover:from-pink-600 hover:to-pink-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Gönder
          </button>
        </div>
      </div>
    </div>
  );
}