'use client'
import { useState, useEffect } from 'react';
import { Badge } from '../types';
import { getBadgeById } from '../services/firebase';

interface BadgePopupProps {
  badgeId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function BadgePopup({ badgeId, isOpen, onClose }: BadgePopupProps) {
  const [badge, setBadge] = useState<Badge | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen && badgeId) {
      const badgeData = getBadgeById(badgeId);
      setBadge(badgeData);
      
      // Popup animasyonu için
      setTimeout(() => setIsVisible(true), 100);
    } else {
      setIsVisible(false);
      setTimeout(() => setBadge(null), 300);
    }
  }, [isOpen, badgeId]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400 bg-gray-900/90';
      case 'rare': return 'border-blue-400 bg-blue-900/90';
      case 'epic': return 'border-purple-400 bg-purple-900/90';
      case 'legendary': return 'border-yellow-400 bg-yellow-900/90';
      default: return 'border-gray-400 bg-gray-900/90';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'shadow-gray-400/50';
      case 'rare': return 'shadow-blue-400/50';
      case 'epic': return 'shadow-purple-400/50';
      case 'legendary': return 'shadow-yellow-400/50';
      default: return 'shadow-gray-400/50';
    }
  };

  if (!isOpen || !badge) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className={`relative max-w-md w-full transition-all duration-300 transform ${
        isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      }`}>
        {/* Background with rarity border */}
        <div className={`relative border-2 rounded-xl p-8 text-center ${getRarityColor(badge.rarity)} ${getRarityGlow(badge.rarity)} shadow-2xl`}>
          
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white/80 text-2xl font-bold"
          >
            ×
          </button>

          {/* Badge Achievement Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">🎉 Rozet Kazandınız!</h2>
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
              badge.rarity === 'common' ? 'bg-gray-700 text-gray-300' :
              badge.rarity === 'rare' ? 'bg-blue-700 text-blue-300' :
              badge.rarity === 'epic' ? 'bg-purple-700 text-purple-300' :
              'bg-yellow-700 text-yellow-300'
            }`}>
              {badge.rarity}
            </div>
          </div>

          {/* Badge Icon */}
          <div className="mb-6 flex justify-center">
            <div className={`relative w-24 h-24 rounded-full border-4 ${
              badge.rarity === 'common' ? 'border-gray-400' :
              badge.rarity === 'rare' ? 'border-blue-400' :
              badge.rarity === 'epic' ? 'border-purple-400' :
              'border-yellow-400'
            } bg-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden`}>
              
              {/* Animated Glow Effect */}
              <div className={`absolute inset-0 rounded-full animate-pulse ${
                badge.rarity === 'common' ? 'bg-gray-400/20' :
                badge.rarity === 'rare' ? 'bg-blue-400/20' :
                badge.rarity === 'epic' ? 'bg-purple-400/20' :
                'bg-yellow-400/20'
              }`}></div>
              
              {/* Badge SVG */}
              <img 
                src={badge.imagePath} 
                alt={badge.name}
                className="w-16 h-16 relative z-10"
              />
            </div>
          </div>

          {/* Badge Info */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-2">{badge.name}</h3>
            <p className="text-white/80 text-sm leading-relaxed">{badge.description}</p>
            
            {badge.xpRequired > 0 && (
              <div className="mt-4 inline-flex items-center px-3 py-1 bg-white/10 rounded-full">
                <span className="text-purple-400 font-semibold text-sm">💎 {badge.xpRequired} XP</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={handleClose}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 ${
              badge.rarity === 'common' ? 'bg-gray-600 hover:bg-gray-700' :
              badge.rarity === 'rare' ? 'bg-blue-600 hover:bg-blue-700' :
              badge.rarity === 'epic' ? 'bg-purple-600 hover:bg-purple-700' :
              'bg-yellow-600 hover:bg-yellow-700'
            }`}
          >
            🎊 Harika! Devam Et
          </button>
        </div>

        {/* Celebration particles effect */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 rounded-full animate-bounce ${
                badge.rarity === 'common' ? 'bg-gray-400' :
                badge.rarity === 'rare' ? 'bg-blue-400' :
                badge.rarity === 'epic' ? 'bg-purple-400' :
                'bg-yellow-400'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 