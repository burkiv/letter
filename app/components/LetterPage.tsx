'use client';

import React, { useRef, useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface LetterPageProps {
  content: string;
  onChange: (content: string) => void;
  pageIndex: number;
  font?: string;
  theme?: string;
  onFull?: () => void;
  readOnly?: boolean;
}

export interface LetterPageHandle {
  getContent: () => string;
}

const LetterPage = forwardRef<LetterPageHandle, LetterPageProps>(({
  content = '',
  onChange,
  pageIndex,
  font = 'inherit',
  theme,
  onFull,
  readOnly = false
}, ref) => {
  const editableRef = useRef<HTMLDivElement>(null);
  const [isFull, setIsFull] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const pathname = usePathname();
  
  // Dış ref'e içeriği alma fonksiyonunu bağla
  useImperativeHandle(ref, () => ({
    getContent: () => editableRef.current?.innerHTML || "<p></p>"
  }));

  // Sayfa ilk yüklendiğinde DOM içeriğini temizle (sadece ana sayfada /)
  useEffect(() => {
    if (!readOnly && editableRef.current && pathname === '/') {
      // Sayfa yenilendiğinde veya ilk yüklendiğinde DOM içeriğini sıfırla
      console.log('LetterPage: Ana sayfada içerik temizleniyor');
      editableRef.current.innerHTML = '<p></p>';
      setInitialized(true);
    }
  }, [readOnly, pathname]);

  // İçerik bilinçli olarak değiştirilirse güncelle
  useEffect(() => {
    if (!readOnly && editableRef.current && initialized) {
      // İçerik varsa ve boş değilse göster
      if (content && content !== '<p></p>' && content !== '') {
        // Eğer içerik editableRef'ten farklıysa güncelle
        if (editableRef.current.innerHTML !== content) {
          editableRef.current.innerHTML = content;
        }
      }
    }
  }, [content, readOnly, initialized]);

  const handleBeforeInput = (e: React.FormEvent<HTMLDivElement>) => {
    const el = editableRef.current;
    if (!el || readOnly) return;

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
    if (editableRef.current && !readOnly) {
      // HTML içeriğini alarak değişikliği bildir
      onChange(editableRef.current.innerHTML);
    }
  };

  return (
    <div className="w-full md:w-[420px] lg:w-[595px] h-[600px] md:h-[700px] lg:h-[842px] border-2 rounded-md relative overflow-hidden mx-auto"
      style={{
        borderColor: isFull ? '#ef4444' : '#e5e7eb',
        backgroundImage: theme ? `url(${theme})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>

      {readOnly ? (
        <div
          ref={editableRef}
          className="w-full h-full p-8 overflow-hidden outline-none whitespace-pre-wrap break-words word-break-break-word overflow-wrap-break-word relative z-10 editable-page"
          style={{ 
            fontSize: '16px', 
            lineHeight: '1.5', 
            fontFamily: font,
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}
          dangerouslySetInnerHTML={{ __html: content || '<p></p>' }}
        />
      ) : (
        <div
          ref={editableRef}
          contentEditable
          onBeforeInput={handleBeforeInput}
          onInput={handleInput}
          className="w-full h-full p-8 overflow-hidden outline-none whitespace-pre-wrap break-words word-break-break-word overflow-wrap-break-word relative z-10 editable-page"
          suppressContentEditableWarning
          style={{ 
            fontSize: '16px', 
            lineHeight: '1.5', 
            fontFamily: font,
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}
        ></div>
      )}

      {isFull && !readOnly && (
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
});

LetterPage.displayName = 'LetterPage';

export default LetterPage; 