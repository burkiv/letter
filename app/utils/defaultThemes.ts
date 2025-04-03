// Varsayılan tema veri URL'leri - base64 kodlanmış görseller

/**
 * Kullanıcının yüklediği özel temaları saklamak için localStorage anahtarı
 */
export const CUSTOM_THEMES_KEY = 'letter-app-custom-themes';

// Tema türleri
type ThemeNames = 'paper1.jpeg' | 'paper2.jpeg' | 'paper3.jpeg' | string;

// Custom tema tipi
export interface CustomTheme {
  id: string;
  name: string;
  url: string;
  dateCreated: string;
}

/**
 * Varsayılan tema URL'lerini alır
 * @returns Temaların URL'lerini içeren bir nesne
 */
export const getDefaultThemeUrls = () => {
  return {
    'paper1.jpeg': '/images/paper3.jpeg', // Geçici olarak paper3 kullanılıyor
    'paper2.jpeg': '/images/paper2.jpeg',
    'paper3.jpeg': '/images/paper3.jpeg',
  };
};

/**
 * Varsayılan tema Base64 içeriklerini dosya olarak kaydeder (tarayıcı tarafında)
 */
export const saveDefaultThemesToLocalFiles = async () => {
  if (typeof window !== 'undefined') {
    try {
      const themes = getDefaultThemeUrls();
      
      // Her bir temayı localStorage'a kaydet
      for (const [filename, url] of Object.entries(themes)) {
        // localStorage'a bu dosyaların varlığını kaydet
        localStorage.setItem(`theme_${filename}_exists`, 'true');
      }
      
      return true;
    } catch (error) {
      console.error('Tema dosyaları kaydedilemedi:', error);
      return false;
    }
  }
  return false;
};

/**
 * Kullanıcının yüklediği temaları localStorage'dan alır
 */
export const getCustomThemes = (): CustomTheme[] => {
  if (typeof window === 'undefined') return [];
  
  const themesData = localStorage.getItem(CUSTOM_THEMES_KEY);
  if (!themesData) return [];
  
  try {
    return JSON.parse(themesData);
  } catch (e) {
    console.error('Özel tema verileri alınamadı:', e);
    return [];
  }
};

/**
 * Yeni bir özel tema ekler
 */
export const addCustomTheme = (name: string, url: string): CustomTheme => {
  const themes = getCustomThemes();
  const newTheme = {
    id: `custom-${Date.now()}`,
    name,
    url,
    dateCreated: new Date().toISOString()
  };
  
  themes.push(newTheme);
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(themes));
  }
  
  return newTheme;
};

/**
 * Tema URL'sini alır, eğer gerçek dosya yoksa varsayılan URL'yi döndürür
 * @param themeName Tema dosyasının adı
 * @returns Tema için URL
 */
export const getThemeUrl = (themeName: string): string => {
  if (typeof window === 'undefined') {
    // SSR durumunda varsayılan kağıt döndür
    return '/images/paper3.jpeg';
  }

  // Eğer custom tema ise
  if (themeName.startsWith('custom-')) {
    const customThemes = getCustomThemes();
    const theme = customThemes.find(t => t.id === themeName);
    return theme?.url || '/images/paper3.jpeg';
  }
  
  // Varsayılan temalardan biri ise
  const themes = getDefaultThemeUrls();
  return (themes as any)[themeName] || '/images/paper3.jpeg';
}; 