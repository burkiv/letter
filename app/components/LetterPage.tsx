'use client';

import React, { useRef, useEffect, useState } from 'react';

interface LetterPageProps {
  content: string;
  onChange: (content: string) => void;
  pageIndex: number;
  font?: string;
  theme?: string;
  onFull?: () => void;
}

const LetterPage: React.FC<LetterPageProps> = ({
  content = '',
  onChange,
  pageIndex,
  font = 'inherit',
  theme,
  onFull
}) => {
  const editableRef = useRef<HTMLDivElement>(null);
  const [isFull, setIsFull] = useState(false);

  // İçerik değiştiğinde HTML içeriğini güncelle
  useEffect(() => {
    if (editableRef.current && content !== editableRef.current.innerText) {
      editableRef.current.innerText = content;
    }
  }, [content]);

  const handleBeforeInput = (e: React.FormEvent<HTMLDivElement>) => {
    const el = editableRef.current;
    if (!el) return;

    // Kullanıcının yeni karakter girmesini engelle (yazı sınırı dolduysa)
    if (el.scrollHeight > el.clientHeight) {
      setIsFull(true);
      e.preventDefault(); // Yazı girmesini komple engelle
      onFull?.(); // Dışarıya bildirim gönder
    } else {
      setIsFull(false);
    }
  };

  // İçerik değişikliğini üst bileşene bildir
  const handleInput = () => {
    if (editableRef.current) {
      onChange(editableRef.current.innerText);
    }
  };

  return (
    <div className="w-full md:w-[420px] lg:w-[595px] h-[600px] md:h-[700px] lg:h-[842px] border-2 rounded-md relative overflow-hidden mx-auto"
      style={{
        borderColor: isFull ? '#ef4444' : '#e5e7eb',
        backgroundImage: theme ? `url(${theme})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'lighten',
      }}>
      <div
        ref={editableRef}
        contentEditable={true}
        onBeforeInput={handleBeforeInput}
        onInput={handleInput}
        className="w-full h-full p-8 overflow-hidden outline-none whitespace-pre-wrap break-words relative z-10 editable-page"
        style={{ fontSize: '16px', lineHeight: '1.5', fontFamily: font }}
      ></div>

      {isFull && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium z-20">
          Sayfa doldu!
        </div>
      )}
      
      {/* Sayfa numarası göstergesi */}
      <div className="absolute top-2 right-2 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center text-xs font-medium text-gray-600 z-20">
        {pageIndex + 1}
      </div>
    </div>
  );
};

export default LetterPage; 