'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getThemeUrl, getCustomThemes, addCustomTheme, CustomTheme } from '../utils/defaultThemes';

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

const ThemeSelector = ({ currentTheme, onThemeChange }: ThemeSelectorProps) => {
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([]);
  const [uploadingTheme, setUploadingTheme] = useState(false);
  const [customThemeName, setCustomThemeName] = useState('');

  // Varsayılan temalar
  const defaultThemes = [
    { id: 'paper1.jpeg', name: 'Klasik', description: 'Geleneksel mektup kağıdı' },
    { id: 'paper2.jpeg', name: 'Vintage', description: 'Eskitilmiş, nostaljik tasarım' },
    { id: 'paper3.jpeg', name: 'Modern', description: 'Sade ve şık tasarım' }
  ];

  // Kullanıcının özel temalarını yükle
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const themes = getCustomThemes();
      setCustomThemes(themes);
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Sadece resim dosyalarını kabul et
    if (!file.type.startsWith('image/')) {
      alert('Lütfen sadece resim dosyası yükleyin (jpg, jpeg, png)');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setUploadingTheme(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const saveCustomTheme = () => {
    const fileInput = document.getElementById('theme-upload') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    
    if (!file) return;
    
    if (!customThemeName.trim()) {
      alert('Lütfen tema için bir isim girin');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        // Yeni temayı ekle
        const newTheme = addCustomTheme(
          customThemeName, 
          event.target.result.toString()
        );
        
        // Tema listesini güncelle
        setCustomThemes([...customThemes, newTheme]);
        
        // Yeni temayı seç
        onThemeChange(newTheme.id);
        
        // Form durumunu sıfırla
        setUploadingTheme(false);
        setCustomThemeName('');
        
        // Dosya seçimini temizle
        if (fileInput) fileInput.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-3 relative bg-white rounded-lg shadow-md w-64">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-800 flex items-center">
          <span className="mr-2">🎨</span>
          Kağıt Seç
        </h3>
        
        {/* Özel tema yükleme düğmesi */}
        <button
          onClick={() => setUploadingTheme(!uploadingTheme)}
          className="flex items-center text-xs bg-pink-100 text-pink-800 hover:bg-pink-200 py-1 px-2 rounded-md transition-colors"
        >
          <span className="mr-1">📁</span>
          Yükle
        </button>
      </div>
      
      {uploadingTheme && (
        <div className="mt-1 p-2 bg-pink-50 rounded-md border border-pink-200 animate-fadeIn text-xs">
          <input
            type="text"
            placeholder="Tema adı"
            value={customThemeName}
            onChange={(e) => setCustomThemeName(e.target.value)}
            className="block w-full p-1 border border-pink-300 rounded-md mb-2 focus:outline-none focus:ring-1 focus:ring-pink-400 text-xs"
          />
          <input
            type="file"
            id="theme-upload"
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleFileUpload}
            className="block w-full mb-2 text-xs text-gray-600"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setUploadingTheme(false)}
              className="px-2 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-xs"
            >
              İptal
            </button>
            <button
              onClick={saveCustomTheme}
              className="px-2 py-1 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors text-xs"
            >
              Kaydet
            </button>
          </div>
        </div>
      )}
      
      {/* Tema grid'i */}
      <div className="grid grid-cols-3 gap-2 max-h-[250px] overflow-y-auto pr-1">
        {/* Varsayılan temalar */}
        {defaultThemes.map(theme => (
          <div 
            key={theme.id}
            className={`cursor-pointer rounded-lg overflow-hidden border transition-all hover:shadow-md ${
              currentTheme === theme.id 
                ? 'border-pink-500 ring-1 ring-pink-300' 
                : 'border-gray-200 hover:border-pink-300'
            }`}
            onClick={() => onThemeChange(theme.id)}
            title={theme.name}
          >
            <div className="relative w-full h-16">
              <Image
                src={getThemeUrl(theme.id)}
                alt={theme.name}
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-t"
                unoptimized
              />
            </div>
            <div className="p-1 bg-white">
              <p className="text-center text-xs truncate">{theme.name}</p>
            </div>
          </div>
        ))}
        
        {/* Kullanıcı temaları */}
        {customThemes.map(theme => (
          <div 
            key={theme.id}
            className={`cursor-pointer rounded-lg overflow-hidden border transition-all hover:shadow-md ${
              currentTheme === theme.id 
                ? 'border-pink-500 ring-1 ring-pink-300' 
                : 'border-gray-200 hover:border-pink-300'
            }`}
            onClick={() => onThemeChange(theme.id)}
          >
            <div className="relative w-full h-16">
              <Image
                src={theme.url}
                alt={theme.name}
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-t"
                unoptimized
              />
            </div>
            <div className="p-1 bg-white">
              <p className="text-center text-xs truncate">{theme.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector; 