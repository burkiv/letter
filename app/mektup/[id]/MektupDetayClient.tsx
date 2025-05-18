// app/mektup/[id]/MektupDetayClient.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { deleteLetter, LetterData } from '@/app/utils/firebase';
import Link from 'next/link';
import LetterPage from '@/app/components/LetterPage';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface MektupDetayClientProps {
  initialLetter: LetterData | null;
  initialError: string | null;
  mektupId: string;
}

export default function MektupDetayClient({ initialLetter, initialError, mektupId }: MektupDetayClientProps) {
  const router = useRouter();
  const [letter, setLetter] = useState<LetterData | null>(initialLetter);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const pageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [isPageReady, setIsPageReady] = useState(false);

  useEffect(() => {
    const newLength = letter?.content?.length ?? 0;
    pageRefs.current = new Array(newLength).fill(null);
  //  setIsPageReady(false);
    console.log(`MektupDetayClient: Refs reset for letter change. pageRefs length: ${newLength}`);
  }, [letter]);

  const handleDeleteLetter = async () => {
    if (!mektupId) return;

    if (!confirm("Bu mektubu silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      setLoading(true);
      await deleteLetter(mektupId);
      alert("Mektup başarıyla silindi!");
      router.push('/');
    } catch (error) {
      console.error("Mektup silinemedi:", error);
      alert("Mektup silinirken bir hata oluştu. Lütfen tekrar deneyin.");
      setLoading(false);
    }
  };

  const handleDownloadLetterAsZip = async () => {
    if (!letter || !letter.content || letter.content.length === 0) {
      alert("Mektup içeriği bulunamadı!");
      return;
    }

    if (!isPageReady) {
      console.log("MektupDetayClient: Download clicked, but pages not ready. Waiting briefly...");
      setLoading(true);
      await new Promise(res => setTimeout(res, 300));

      const stillNotReady = !(
        pageRefs.current.length === letter.content.length &&
        pageRefs.current.every(ref => ref !== null)
      );

      if (stillNotReady) {
        setLoading(false);
        alert('Sayfalar yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.');
        console.error('MektupDetayClient: Download aborted, pages did not become ready after retry.');
        return;
      }
      console.log('MektupDetayClient: Pages became ready after a short wait for download.');
    }

    setLoading(true);
    console.log("Starting ZIP download process...");
    const zip = new JSZip();
    const letterTitleForFile = letter.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'mektup';

    try {
      for (let i = 0; i < letter.content.length; i++) {
        const pageElement = pageRefs.current[i];
        if (pageElement) {
          try {
            const canvas = await html2canvas(pageElement, {
              useCORS: true,
              background: undefined,
              logging: false,
            });
            const blob = await new Promise<Blob | null>((resolve) => {
              canvas.toBlob(resolve, 'image/png');
            });
            if (blob) {
              zip.file(`sayfa${i + 1}.png`, blob);
            } else {
              console.warn(`Could not generate blob for page ${i + 1}. Skipping.`);
            }
          } catch (pageError) {
            console.error(`Error processing page ${i + 1}:`, pageError);
          }
        } else {
          console.warn(`Ref for page ${i + 1} is null or undefined. Skipping.`);
        }
      }

      const zipFilesCount = Object.keys(zip.files).length;
      if (zipFilesCount === 0 && letter.content.length > 0) {
        alert("Mektup sayfaları işlenemedi, ZIP dosyası boş olacak. Lütfen tekrar deneyin.");
        setLoading(false);
        return;
      }
      if (zipFilesCount === 0 && letter.content.length === 0) {
        alert("İndirilecek içerik yok.");
        setLoading(false);
        return;
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `${letterTitleForFile}.zip`);
    } catch (err) {
      console.error("Mektup ZIP olarak indirilirken genel hata:", err);
      alert("Mektup indirilemedi. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
      console.log("ZIP download process finished.");
    }
  };

  if (!letter) {
    if (initialError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-pink-50">
          <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
            <div className="inline-block bg-red-100 p-4 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-red-600 mb-2">Mektup Bulunamadı</h2>
            <p className="text-gray-600 mb-4">{initialError}</p>
            <Link href="/" className="inline-block bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600 transition-colors">
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <p className="text-lg font-medium text-pink-600">Mektup verisi yükleniyor veya bulunamadı...</p>
      </div>
    );
  }

  const letterTitle = letter.from && letter.to
    ? (letter.from === 'burki' ? "Burki'den Yenge'ye" : "Yenge'den Burki'ye")
    : (letter.title || "Sevgi Dolu Mektup 💌");

  const formattedDate = letter.timestamp
    ? new Date(letter.timestamp).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : '';

  return (
    <div className="min-h-screen bg-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-md">
          <h1 className="text-xl md:text-2xl font-bold text-pink-600 mb-2 md:mb-0 flex items-center">
            <span className="mr-2">💌</span> {letterTitle}
          </h1>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadLetterAsZip}
              disabled={!isPageReady || loading}
              title={isPageReady ? "Mektubu ZIP olarak indir" : "Sayfalar hazırlanıyor..."}
              className={`px-3 py-1 rounded-full text-sm flex items-center text-white transition-colors
                           ${(!isPageReady || loading) ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}
                           ${loading && !isPageReady ? 'cursor-wait' : ''}
                           ${loading && isPageReady ? 'cursor-progress' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {loading ? 'Hazırlanıyor…' : '📥 Mektubu İndir (ZIP)'}
            </button>
            <button 
              onClick={handleDeleteLetter}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-sm flex items-center disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Mektubu Sil
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center">
          {(!letter.content || letter.content.length === 0) ? (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-gray-500 italic">Bu mektupta içerik yok.</p>
            </div>
          ) : (
            <div id="pages-root">
              {letter.content.map((page, index) => (
                <LetterPage
                  key={index}
                  ref={el => {
                    if (pageRefs.current) {
                      pageRefs.current[index] = el;
                    }
                    
                    if (pageRefs.current.length === letter.content.length && pageRefs.current.every(ref => ref !== null)) {
                      if (!isPageReady) {
                        console.log('MektupDetayClient: All page refs are ready.');
                        setIsPageReady(true);
                      }
                    }
                  }}
                  content={typeof page === 'object' ? page.html : page}
                  pageIndex={index}
                  font={typeof page === 'object' ? page.font : letter.font}
                  theme={typeof page === 'object' ? page.theme : letter.theme}
                  color={typeof page === 'object' ? page.color : undefined}
                  readOnly={true}
                  onChange={() => {}}
                />
              ))}
            </div>
          )}

          {formattedDate && (
            <div className="text-center mt-4 mb-6 text-sm text-gray-600 font-serif italic">
              {formattedDate}
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="inline-flex items-center bg-white text-pink-600 px-4 py-2 rounded-full shadow-md hover:bg-pink-50 transition-colors border border-pink-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}