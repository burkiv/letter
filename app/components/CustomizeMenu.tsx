'use client';

import React from 'react';

interface CustomizeMenuProps {
  activeTab: string | null;
  onTabSelect: (tab: string) => void;
}

const CustomizeMenu: React.FC<CustomizeMenuProps> = ({ activeTab, onTabSelect }) => {
  const tabs = [
    { id: 'theme', label: 'Tema Seç', icon: '🎨' },
    { id: 'sticker', label: 'Sticker Ekle', icon: '😀' },
    { id: 'drawing', label: 'Çizim Yap', icon: '✏️' }
  ];

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
        <span className="mr-2">✨</span>
        Özelleştirme Araçları
      </h2>
      <div className="flex flex-wrap gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`flex items-center px-4 py-2 rounded-md transition-all duration-200 ${
              activeTab === tab.id 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => onTabSelect(tab.id)}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CustomizeMenu; 