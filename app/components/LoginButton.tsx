'use client';

import { useAuth } from '@/app/context/AuthContext';

const LoginButton = () => {
  const { user, login } = useAuth();

  if (user) return null; // Zaten giriş yapmışsa gösterme

  return (
    <button 
      onClick={login}
      className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
    >
      Giriş Yap
    </button>
  );
};

export default LoginButton;
