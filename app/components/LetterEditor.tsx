'use client';

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import LetterPage, { LetterPageHandle } from './LetterPage';
import { usePathname } from 'next/navigation';

interface LetterEditorProps {
  theme: string;
  font: string;
  onPageChange: (pageIndex: number) => void;
  currentPage: number;
  totalPages: number;
  onTextChange: (text: string) => void;
  letters: string[];
  onAddPage: () => void;
  stickers?: { id: string; url: string; position: { x: number; y: number }; size: number }[];
}

export interface LetterEditorRefHandle {
  sendLottieAnimation: () => void;
  deleteLottieAnimation: (callback?: () => void) => void;
  getAllPageContents: () => string[];
}

const LetterEditor = forwardRef<LetterEditorRefHandle, LetterEditorProps>(({
  theme,
  font,
  onPageChange,
  currentPage,
  totalPages,
  onTextChange,
  letters,
  onAddPage,
  stickers = [],
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lottieContainerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<LetterPageHandle | null>(null);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const pathname = usePathname();
  
  // İlk render kontrolü
  useEffect(() => {
    // Component mount olduğunda bir kereliğine çalışır
    if (isInitialRender && pathname === '/') {
      console.log('LetterEditor: İlk render, sayfa içeriği temizleniyor');
      setIsInitialRender(false);
    }
  }, [isInitialRender, pathname]);
  
  // Tüm sayfaların içeriklerini alma fonksiyonu
  const getAllPageContents = () => {
    // Doğrudan letters dizisini döndür - içerikler zaten burada güncel
    return letters;
  };

  // Lotties animasyonlarını oynatma fonksiyonları
  const playLottieAnimation = (animationUrl: string, container: HTMLDivElement | null, callback?: () => void) => {
    if (!container) return;
    
    // Animasyon için container'ı temizle
    container.innerHTML = '';
    
    // Animasyon için yeni bir div oluştur
    const animationContainer = document.createElement('div');
    animationContainer.style.width = '100%';
    animationContainer.style.height = '100%';
    animationContainer.style.position = 'absolute';
    animationContainer.style.top = '0';
    animationContainer.style.left = '0';
    animationContainer.style.zIndex = '9999';
    animationContainer.style.display = 'flex';
    animationContainer.style.justifyContent = 'center';
    animationContainer.style.alignItems = 'center';
    
    container.appendChild(animationContainer);
    
    // @ts-ignore - Lottie'nin global olarak yüklü olduğunu varsayıyoruz
    if (typeof window !== 'undefined' && window.lottie) {
      // @ts-ignore
      const anim = window.lottie.loadAnimation({
        container: animationContainer,
        renderer: 'svg',
        loop: false,
        autoplay: true,
        path: animationUrl,
      });
      
      anim.addEventListener('complete', () => {
        if (callback) callback();
        container.innerHTML = '';
      });
    } else {
      console.error('Lottie kütüphanesi yüklenemedi!');
      if (callback) callback();
    }
  };
  
  // Gönderme animasyonu oynatma fonksiyonu
  const sendLottieAnimation = () => {
    const container = lottieContainerRef.current;
    playLottieAnimation(
      'https://lottie.host/b9a7d5ae-cf4b-479c-b73a-67e698c2ac9d/LYNHLvZLcP.json', 
      container
    );
  };
  
  // Silme animasyonu oynatma fonksiyonu
  const deleteLottieAnimation = (callback?: () => void) => {
    const container = lottieContainerRef.current;
    playLottieAnimation(
      'https://lottie.host/5a5b9d64-55fe-408c-8f5c-81d2ba1e9b73/YdkDo9tLKl.json', 
      container, 
      callback
    );
  };

  // ref ile animasyon fonksiyonlarını dışarı açma
  useImperativeHandle(ref, () => ({
    sendLottieAnimation,
    deleteLottieAnimation,
    getAllPageContents
  }));

  // Sayfa içeriğini güncelleme fonksiyonu
  const handleContentChange = (newContent: string) => {
    // Şu anki sayfa içeriğini güncelle ve ana bileşene bildir
    const updatedLetters = [...letters];
    updatedLetters[currentPage] = newContent;
    onTextChange(updatedLetters[currentPage]);
  };

  // Sayfa dolduğunda çağrılacak fonksiyon
  const handlePageFull = () => {
    // İsteğe bağlı: Sayfa dolduğunda otomatik olarak yeni sayfa eklemek için
    // onAddPage() fonksiyonunu çağırabilirsiniz, ancak şu an için yalnızca bildirim gösteriyoruz
    console.log('Sayfa doldu: Kullanıcının yeni sayfa eklemesi veya içeriği düzenlemesi gerekiyor');
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Lottie animasyonları için konteyner */}
      <div ref={lottieContainerRef} className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center"></div>
      
      {/* Sadece aktif sayfayı render et - diğerleri DOM'da olmasın */}
      <div className="relative">
        <LetterPage
          key={currentPage} // Sayfa değiştiğinde bileşeni yeniden oluştur
          content={letters[currentPage]}
          onChange={handleContentChange}
          pageIndex={currentPage}
          font={font}
          theme={theme}
          onFull={handlePageFull}
          ref={pageRef}
        />
      </div>
      
      {/* Sayfa gezinme kontrolleri */}
      <div className="mt-4 flex items-center justify-center space-x-4">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="bg-white p-2 rounded-full shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-pink-600 hover:bg-pink-50 transition-colors border border-pink-200"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        
        <span className="text-sm font-medium text-gray-700 bg-white px-3 py-1 rounded-full shadow-sm">
          Sayfa {currentPage + 1} / {totalPages}
        </span>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className="bg-white p-2 rounded-full shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-pink-600 hover:bg-pink-50 transition-colors border border-pink-200"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
        
        {/* Yeni sayfa ekle butonu */}
        <button
          onClick={onAddPage}
          className="bg-pink-500 text-white px-4 py-2 rounded-full shadow-md hover:bg-pink-600 transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Yeni Sayfa
        </button>
      </div>
      
      {/* Karakter sayacı */}
      <div className="mt-2 text-center text-xs text-gray-500">
        Sayfa içeriği: {(letters[currentPage] || '').length} karakter
      </div>
    </div>
  );
});

LetterEditor.displayName = 'LetterEditor';

export default LetterEditor;