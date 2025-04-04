// app/mektup/[id]/MektupDetayClient.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteLetter, LetterData } from '@/app/utils/firebase';
import Image from 'next/image';
import Link from 'next/link';
import LetterPage from '@/app/components/LetterPage';

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

  // Mektubu sil ve anasayfaya yönlendir
  const handleDeleteLetter = async () => {
    if (!mektupId) return;

    // Kullanıcıdan silme işlemi için onay al
    if (!confirm("Bu mektubu silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      setLoading(true);
      await deleteLetter(mektupId);
      alert("Mektup başarıyla silindi!");
      router.push('/'); // Ana sayfaya yönlendir
    } catch (error) {
      console.error("Mektup silinemedi:", error);
      alert("Mektup silinirken bir hata oluştu. Lütfen tekrar deneyin.");
      setLoading(false);
    }
  };

  // Yükleniyor durumu
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <div className="text-center">
          <div className="inline-block animate-bounce bg-pink-100 p-4 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
            </svg>
          </div>
          <p className="text-lg font-medium text-pink-600">Mektup yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Hata durumu
  if (error || !letter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="inline-block bg-red-100 p-4 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Mektup Bulunamadı</h2>
          <p className="text-gray-600 mb-4">{error || 'Bu mektup bulunamadı veya silinmiş olabilir.'}</p>
          <Link href="/" className="inline-block bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600 transition-colors">
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  // Mektup başlığını oluştur
  const letterTitle = letter.from && letter.to
    ? (letter.from === 'burki' ? "Burki'den Yenge'ye" : "Yenge'den Burki'ye")
    : (letter.title || "Sevgi Dolu Mektup 💌");

  // Tarih formatla
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
        {/* Üst bilgi alanı */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-md">
          <h1 className="text-xl md:text-2xl font-bold text-pink-600 mb-2 md:mb-0 flex items-center">
            <span className="mr-2">💌</span> {letterTitle}
          </h1>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleDeleteLetter}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Mektubu Sil
            </button>
          </div>
        </div>

        {/* Mektup içeriği */}
        <div className="flex flex-col items-center">
          {(!letter.content || letter.content.length === 0) ? (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-gray-500 italic">Bu mektupta içerik yok.</p>
            </div>
          ) : (
            letter.content.map((html, index) => (
              <div key={index} className="mb-8">
                <LetterPage
                  content={html}
                  pageIndex={index}
                  font={letter.font}
                  theme={letter.theme}
                  readOnly={true}
                  onChange={() => {}} // readOnly modunda değişiklik olmayacak
                />
              </div>
            ))
          )}

          {/* Tarih */}
          {formattedDate && (
            <div className="text-center mt-4 mb-6 text-sm text-gray-600 font-serif italic">
              {formattedDate}
            </div>
          )}
        </div>

        {/* Ana sayfaya dönüş butonu */}
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