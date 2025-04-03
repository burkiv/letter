'use client';

import React, { useState, useEffect } from 'react';

interface HeartProps {
  id: number;
  size: number;
  left: number;
  top: number;
  delay: number;
  duration: number;
  opacity: number;
  color: string;
  rotation: number;
  emoji: string;
}

interface FloatingHeartsProps {
  count?: number;
}

const FloatingHearts = ({ count = 15 }: FloatingHeartsProps) => {
  const [hearts, setHearts] = useState<HeartProps[]>([]);
  
  // Kalpler için emoji seçenekleri
  const heartEmojis = ['❤️', '💌', '💖', '💗', '💓', '💘', '💝', '💕'];
  
  // Pastel renk paleti
  const colors = [
    '#FFB6C1', // Light Pink
    '#FFC0CB', // Pink
    '#FFD1DC', // Pastel Pink
    '#FF69B4', // Hot Pink
    '#DB7093', // Pale Violet Red
    '#FF82AB', // Dark Pink
    '#FFA6C9', // Carnation Pink
    '#FF85A2', // Flamingo Pink
  ];
  
  useEffect(() => {
    // Kalpleri oluştur
    const newHearts: HeartProps[] = [];
    
    for (let i = 0; i < count; i++) {
      // Rastgele bir emoji seç
      const emoji = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
      
      // Rastgele bir renk seç
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      newHearts.push({
        id: i,
        size: Math.random() * 25 + 15, // 15-40px arasında
        left: Math.random() * 100, // % olarak yatay pozisyon
        top: Math.random() * 100, // % olarak dikey pozisyon
        delay: Math.random() * 5, // 0-5s gecikme
        duration: Math.random() * 15 + 15, // 15-30s animasyon süresi
        opacity: Math.random() * 0.5 + 0.3, // 0.3-0.8 opaklık
        color: color,
        rotation: Math.random() * 360, // 0-360 derece rotasyon
        emoji: emoji
      });
    }
    
    setHearts(newHearts);
  }, [count]);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {hearts.map(heart => (
        <div
          key={heart.id}
          className="absolute animate-float"
          style={{
            fontSize: `${heart.size}px`,
            left: `${heart.left}%`,
            top: `${heart.top}%`,
            animationDelay: `${heart.delay}s`,
            animationDuration: `${heart.duration}s`,
            opacity: heart.opacity,
            transform: `translateY(0) rotate(${heart.rotation}deg)`,
            textShadow: `0 0 5px ${heart.color}`,
            filter: 'drop-shadow(0 0 2px rgba(255, 182, 193, 0.5))'
          }}
        >
          {heart.emoji}
        </div>
      ))}
    </div>
  );
};

export default FloatingHearts;