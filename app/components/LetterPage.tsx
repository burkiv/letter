'use client';

import React, { useRef, useEffect, forwardRef, useState } from 'react';
import { usePathname } from 'next/navigation';

interface LetterPageProps {
  content: string;
  onChange: (content: string) => void;
  pageIndex: number;
  font?: string;
  theme?: string;
  color?: string;
  readOnly?: boolean;
  onFull?: () => void;
}

const LetterPage = forwardRef<HTMLDivElement, LetterPageProps>(
  ({ content, onChange, pageIndex, font, theme, color, readOnly = false, onFull }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [currentContent, setCurrentContent] = useState(content);
    const pathname = usePathname();

    // Effect to update local state if the initial content prop changes (e.g., loading a new letter)
    useEffect(() => {
      setCurrentContent(content);
    }, [content]);

    // Effect to set the innerHTML of the editor only when currentContent changes *and* it's different from editor's content
    // This is crucial to prevent cursor jumps.
    useEffect(() => {
      if (editorRef.current && editorRef.current.innerHTML !== currentContent) {
        editorRef.current.innerHTML = currentContent || '';
      }
    }, [currentContent]);

    const handleInput = () => {
      if (editorRef.current) {
        const newHtml = editorRef.current.innerHTML;
        setCurrentContent(newHtml); // Update local state immediately
        onChange(newHtml); // Propagate change to parent
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      // Handle specific key events if needed, e.g., Enter, Tab
    };

    return (
      <div
        ref={ref} // Attach the forwarded ref here for html2canvas and parent refs
        className="w-full md:w-[420px] lg:w-[595px] h-[600px] md:h-[700px] lg:h-[842px] border-2 rounded-md relative overflow-hidden mx-auto"
        style={{
          borderColor: '#e5e7eb',
          backgroundImage: theme ? `url(${theme})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          color: color || undefined,
        }}
      >
        <div
          ref={editorRef}
          contentEditable={!readOnly}
          suppressContentEditableWarning={true}
          className="w-full h-full p-8 overflow-hidden outline-none whitespace-pre-wrap break-words word-break-break-word overflow-wrap-break-word relative z-10 editable-page"
          style={{ 
            fontSize: '16px', 
            lineHeight: '1.5', 
            fontFamily: font || 'inherit', 
            color: color || '#222222',
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
        />
        {/* Sayfa numarası göstergesi */}
        <div className="absolute top-2 right-2 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center text-xs font-medium text-gray-600 z-20">
          {pageIndex + 1}
        </div>
      </div>
    );
  }
);

LetterPage.displayName = 'LetterPage';

export default LetterPage;