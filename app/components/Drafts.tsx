'use client';

import React from 'react';
import Image from 'next/image';

interface DraftsProps {
  drafts: any[];
  onDraftSelect: (draftId: number) => void;
}

const Drafts = ({ drafts, onDraftSelect }: DraftsProps) => {
  if (drafts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-medium text-gray-700 mb-4">Henüz hiç taslak yok</h3>
        <p className="text-gray-500 max-w-md">
          Oluşturduğunuz mektuplar burada görünecek. Yeni bir mektup yazmak için "Editör" sekmesine geçin ve "Gönder" butonuna basarak taslaklarınıza kaydedin.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800">
        <span className="mr-2">📋</span>
        Taslak Mektuplarınız
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {drafts.map(draft => (
          <div 
            key={draft.id} 
            className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer"
            onClick={() => onDraftSelect(draft.id)}
          >
            <div className="relative h-48">
              <Image 
                src={`/images/${draft.theme}`}
                alt="Mektup şablonu"
                fill
                style={{ objectFit: 'cover' }}
                className="group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="flex justify-between items-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
                    {draft.pages.length} sayfa
                  </div>
                  <div className="text-sm font-light">
                    {draft.date}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <p className="text-gray-700 line-clamp-3 text-sm">
                {draft.pages[0].content || 'Boş içerik'}
              </p>
              <div className="mt-4 flex justify-end">
                <button
                  className="text-primary text-sm font-medium hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDraftSelect(draft.id);
                  }}
                >
                  Düzenle →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Drafts; 