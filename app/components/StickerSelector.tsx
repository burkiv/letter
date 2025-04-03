'use client';

import React, { useState } from 'react';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Grid } from '@giphy/react-components';
import Image from 'next/image';

const giphyFetch = new GiphyFetch('MjdDnG2NyjuC3n3YCH9vZssFvEmFBe73');

interface StickerSelectorProps {
  onStickerSelect: (sticker: any) => void;
}

const StickerSelector = ({ onStickerSelect }: StickerSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'stickers' | 'gifs' | 'photos'>('stickers');

  const fetchGifs = (offset: number) => {
    return searchTerm
      ? giphyFetch.search(searchTerm, { offset, limit: 10, type: activeTab === 'gifs' ? 'gifs' : 'stickers' })
      : giphyFetch.trending({ offset, limit: 10, type: activeTab === 'gifs' ? 'gifs' : 'stickers' });
  };

  const handleStickerClick = (gif: any) => {
    onStickerSelect({
      type: activeTab,
      url: gif.images.original.url,
      width: gif.images.original.width,
      height: gif.images.original.height
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        // HTMLImageElement kullanarak img oluştur
        const img = document.createElement('img');
        img.onload = () => {
          if (event.target && event.target.result) {
            onStickerSelect({
              type: 'photos',
              url: event.target.result.toString(),
              width: img.width,
              height: img.height
            });
          }
        };
        img.src = event.target.result.toString();
      }
    };
    reader.readAsDataURL(file);
  };

  const renderTabButton = (tabId: 'stickers' | 'gifs' | 'photos', label: string, icon: string) => (
    <button 
      className={`flex items-center px-4 py-2 rounded-md transition-all ${
        activeTab === tabId 
          ? 'bg-primary text-white shadow-sm' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
      onClick={() => setActiveTab(tabId)}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4 text-gray-800 flex items-center">
        <span className="mr-2">😀</span>
        {activeTab === 'stickers' && 'Sticker Seç'}
        {activeTab === 'gifs' && 'GIF Seç'}
        {activeTab === 'photos' && 'Fotoğraf Yükle'}
      </h3>

      <div className="flex flex-wrap gap-2 mb-4">
        {renderTabButton('stickers', 'Stickerlar', '😀')}
        {renderTabButton('gifs', 'GIFler', '🎬')}
        {renderTabButton('photos', 'Fotoğraflar', '📷')}
      </div>

      {activeTab !== 'photos' ? (
        <>
          <div className="mb-4">
            <div className="flex">
              <input
                type="text"
                placeholder={`${activeTab === 'stickers' ? 'Sticker' : 'GIF'} ara...`}
                className="w-full p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-opacity-90 transition-colors"
              >
                🔍
              </button>
            </div>
          </div>
          <div className="h-64 overflow-y-auto bg-gray-50 rounded-md p-2">
            <Grid
              key={`${activeTab}-${searchTerm}`}
              width={300}
              columns={3}
              fetchGifs={fetchGifs}
              onGifClick={handleStickerClick}
              noLink={true}
            />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <div className="text-6xl mb-4">📷</div>
          <p className="mb-6 text-gray-600 text-center">Fotoğraf yüklemek için aşağıdaki butona tıklayın</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label 
            htmlFor="file-upload" 
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors cursor-pointer flex items-center"
          >
            <span className="mr-2">📤</span>
            Dosya Seç
          </label>
        </div>
      )}
    </div>
  );
};

export default StickerSelector; 