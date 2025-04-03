'use client';

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Image from 'next/image';
import { Player } from '@lottiefiles/react-lottie-player';
import { getThemeUrl } from '../utils/defaultThemes';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

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
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lottieContainerRef = useRef<HTMLDivElement>(null);
  
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
    deleteLottieAnimation
  }));

  useEffect(() => {
    const editor = editorRef.current;
    if (editor && letters[currentPage]) {
      editor.value = letters[currentPage];
    }
  }, [currentPage, letters]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Karakter sınırını kontrol et
    if (e.target.value.length <= 1150) {
      onTextChange(e.target.value);
    } else {
      // Sınırı aşarsa, metni 1150 karaktere kırp
      onTextChange(e.target.value.slice(0, 1150));
      e.target.value = e.target.value.slice(0, 1150);
    }
  };

  return (
    <div className={`w-full md:w-[420px] lg:w-[595px] h-[600px] md:h-[700px] lg:h-[842px] overflow-hidden rounded-md border border-gray-200 bg-white relative mx-auto`} ref={containerRef}>
      {/* Arka plan teması */}
      <div
        className="absolute inset-0 bg-white"
        style={{
          backgroundImage: `url(${theme})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.8,
        }}
      ></div>
      
      {/* Lottie animasyonları için konteyner */}
      <div ref={lottieContainerRef} className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center"></div>
      
      {/* Metin alanı */}
      <textarea
        ref={editorRef}
        className="w-full h-full p-8 bg-transparent text-lg resize-none focus:outline-none relative z-10"
        placeholder="Mektubunu buraya yaz..."
        value={letters[currentPage] || ''}
        onChange={handleTextChange}
        maxLength={1150}
        style={{ fontFamily: font }}
      />
      
      {/* Karakter sayacı */}
      <div className="absolute bottom-16 right-8 bg-white/80 px-2 py-1 rounded-md text-xs text-gray-600 z-40">
        {letters[currentPage]?.length || 0}/1150
      </div>
      
      {/* Stickerlar */}
      {stickers && stickers.map((sticker) => (
        <div
          key={sticker.id}
          className="absolute"
          style={{
            left: `${sticker.position.x}px`,
            top: `${sticker.position.y}px`,
            width: `${sticker.size}px`,
            height: `${sticker.size}px`,
            zIndex: 30,
          }}
        >
          <Image
            src={sticker.url}
            alt="sticker"
            width={sticker.size}
            height={sticker.size}
            className="w-full h-full object-contain pointer-events-none"
          />
        </div>
      ))}
      
      {/* Sayfa numaralandırması */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-white/80 px-4 py-1 rounded-full shadow-sm z-40">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="text-pink-600 disabled:text-gray-400"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <span className="text-xs font-medium">
          Sayfa {currentPage + 1} / {totalPages}
        </span>
        <button
          onClick={() => {
            if (currentPage === totalPages - 1) {
              console.log('Yeni sayfa eklemek için onAddPage() çağrılıyor');
              onAddPage();
            } else {
              console.log('Sonraki sayfaya geçiliyor:', currentPage + 1);
              onPageChange(currentPage + 1);
            }
          }}
          className="text-pink-600"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
      
      {/* Yeni sayfa ekleme butonu */}
      <button
        onClick={() => {
          console.log('Doğrudan yeni sayfa ekleme butonu tıklandı');
          onAddPage();
        }}
        className="absolute bottom-4 right-4 bg-pink-100 hover:bg-pink-200 text-pink-800 w-8 h-8 rounded-full flex items-center justify-center"
        title="Yeni sayfa ekle"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </div>
  );
});

LetterEditor.displayName = 'LetterEditor';

export default LetterEditor;