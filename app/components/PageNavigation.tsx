'use client';

import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/outline';

interface PageNavigationProps {
  currentPage: number;
  totalPages: number;
  onChangePage: (pageIndex: number) => void;
  onAddPage?: () => void;
}

const PageNavigation: React.FC<PageNavigationProps> = ({
  currentPage,
  totalPages,
  onChangePage,
  onAddPage
}) => {
  return (
    <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
      <button
        onClick={() => onChangePage(currentPage - 1)}
        disabled={currentPage <= 0}
        className={`p-1 rounded-full ${
          currentPage <= 0
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-pink-500 hover:bg-pink-50'
        }`}
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>
      
      <span className="text-sm font-medium">
        Sayfa {currentPage + 1} / {totalPages}
      </span>
      
      <button
        onClick={() => onChangePage(currentPage + 1)}
        disabled={currentPage >= totalPages - 1 && !onAddPage}
        className={`p-1 rounded-full ${
          currentPage >= totalPages - 1 && !onAddPage
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-pink-500 hover:bg-pink-50'
        }`}
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>
      
      {onAddPage && (
        <button
          onClick={onAddPage}
          className="p-1 ml-1 rounded-full text-pink-500 hover:bg-pink-50 flex items-center justify-center"
          title="Yeni sayfa ekle"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default PageNavigation; 