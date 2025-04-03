'use client';

import { useAuth } from '@/app/context/AuthContext';

const LogoutButton = () => {
  const { user, logout } = useAuth();

  if (!user) return null; // Giriş yapılmamışsa gösterme

  return (
    <button 
      onClick={logout}
      className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition"
    >
      Çıkış Yap ({user.displayName || 'Kullanıcı'})
    </button>
  );
};

export default LogoutButton;
