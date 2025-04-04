// app/mektup/[id]/page.tsx

import { getLetter, LetterData } from '@/app/utils/firebase';
import MektupDetayClient from './MektupDetayClient';

// Bu satır, Next.js'e bu sayfayı "dinamik" (SSR) olarak ele almasını söylüyor.
// Yani her istekte veriyi tekrar çekebilir.
export const dynamic = 'force-dynamic';
// Alternatif olarak: export const revalidate = 0;  (aynı etkiyi yapar)

// Sunucu tarafında mektup verisini çekip client bileşene props geçiyoruz
export default async function MektupDetay({ params }: { params: { id: string } }) {
  const mektupId = params.id;

  let letter: LetterData | null = null;
  try {
    // Firestore'dan ID'ye ait mektubu çekiyoruz
    letter = await getLetter(mektupId);
  } catch (err) {
    console.error('Mektup yüklenirken hata:', err);
    // letter null kalacak
  }

  if (!letter) {
    // Eğer mektup yoksa 404 yerine kendi mesajını gösterebilirsin
    return <div>Mektup bulunamadı veya yüklenemedi.</div>;
  }

  return (
    <MektupDetayClient
      initialLetter={letter}
      initialError={null}
      mektupId={mektupId}
    />
  );
}
