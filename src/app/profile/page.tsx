'use client'
import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { getUserBadgesNew, getBadgeById, getUser, checkAndAwardBadges, updateUser } from '../../services/firebase';
import { Badge, UserBadge } from '../../types';

export default function ProfilePage() {
  const { ready, authenticated, user } = usePrivy();
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userXP, setUserXP] = useState<number>(0);

  useEffect(() => {
    const savedUserId = localStorage.getItem('currentUserId');
    if (savedUserId && authenticated) {
      setCurrentUserId(savedUserId);
      loadUserProfile(savedUserId);
    } else {
      setLoading(false);
    }
  }, [authenticated]);

  const loadUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      
      // Önce kullanıcının mevcut verilerini al
      const user = await getUser(userId);
      console.log('👤 Kullanıcı verileri:', user);
      
      if (user) {
        // Kullanıcının XP'sine göre rozetleri kontrol et ve gerekiyorsa ver
        const currentXP = user.xp || 0;
        console.log('💎 Mevcut XP:', currentXP);
        setUserXP(currentXP);
        
        // Rozet kontrolü yap ve yeni rozetleri ver
        const newBadges = await checkAndAwardBadges(userId, currentXP);
        console.log('🎉 Yeni kazanılan rozetler:', newBadges);
      }
      
      // Kullanıcının rozetlerini al
      const userBadges = await getUserBadgesNew(userId);
      console.log('🏆 Kullanıcı rozetleri:', userBadges);
      
      // Badge'leri detaylarıyla birleştir
      const badgesWithDetails = userBadges.map(userBadge => {
        const badgeInfo = getBadgeById(userBadge.badgeId);
        console.log(`🏆 Badge bilgisi: ${userBadge.badgeId}`, badgeInfo);
        return {
          ...userBadge,
          ...badgeInfo,
          id: userBadge.badgeId // Compatibility için
        };
      }).filter(badge => badge.name); // Sadece geçerli rozetleri göster
      
      console.log('🏆 Birleştirilmiş rozetler:', badgesWithDetails);
      setUserBadges(badgesWithDetails);
      
    } catch (error) {
      console.error('Profil yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const giveTestXP = async (amount: number) => {
    if (!currentUserId) return;
    
    try {
      const user = await getUser(currentUserId);
      if (user) {
        const newXP = (user.xp || 0) + amount;
        await updateUser(currentUserId, { xp: newXP });
        
        // Profili yeniden yükle
        await loadUserProfile(currentUserId);
        
        console.log(`✅ ${amount} XP verildi! Yeni XP: ${newXP}`);
      }
    } catch (error) {
      console.error('XP verme hatası:', error);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400 bg-gray-900/30';
      case 'rare': return 'border-blue-400 bg-blue-900/30';
      case 'epic': return 'border-purple-400 bg-purple-900/30';
      case 'legendary': return 'border-yellow-400 bg-yellow-900/30';
      default: return 'border-gray-400 bg-gray-900/30';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'shadow-gray-400/30';
      case 'rare': return 'shadow-blue-400/30';
      case 'epic': return 'shadow-purple-400/30';
      case 'legendary': return 'shadow-yellow-400/30';
      default: return 'shadow-gray-400/30';
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-lg">🔄 Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">🔒 Login Required</h1>
          <p className="text-white/70 mb-6">You need to login first to view your profile.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-lg">📊 Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => window.location.href = '/'}
            className="text-white/70 hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
          <h1 className="text-3xl font-bold text-white">👤 My Profile</h1>
          <div></div>
        </div>

        {/* User Info Card */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
              {user?.email?.address?.charAt(0).toUpperCase() || '👤'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.email?.address || 'User'}</h2>
              <p className="text-white/70">User ID: {currentUserId.slice(0, 8)}...</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-purple-400 font-semibold">💎 {userXP} XP</span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => giveTestXP(25)}
                    className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded"
                  >
                    +25 XP
                  </button>
                  <button 
                    onClick={() => giveTestXP(50)}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                  >
                    +50 XP
                  </button>
                  <button 
                    onClick={() => giveTestXP(100)}
                    className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
                  >
                    +100 XP
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Badges Collection */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-white mb-6">🏆 My Badge Collection</h3>
          
          {userBadges.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎯</div>
              <h4 className="text-xl font-bold text-white mb-2">No badges yet!</h4>
              <p className="text-white/70 mb-4">Join predictions and collect badges by earning XP!</p>
              <div className="text-sm text-white/50">
                <p>💡 Tip: You can earn test badges with the XP buttons above!</p>
                <p>🏆 0 XP: Welcome badge</p>
                <p>🏆 50 XP: Great Start badge</p>
                <p>🏆 100 XP: Pushing Harder badge</p>
                <p>🏆 500 XP: Nirvana badge</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userBadges.map((badge) => {
                if (!badge.name) return null; // Badge bilgisi yoksa gösterme
                
                return (
                  <div 
                    key={badge.badgeId || badge.id}
                    className={`relative border-2 rounded-lg p-6 text-center transition-all duration-300 hover:scale-105 ${getRarityColor(badge.rarity)} ${getRarityGlow(badge.rarity)} shadow-lg`}
                  >
                    {/* New Badge Indicator */}
                    {badge.isNew && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                        NEW!
                      </div>
                    )}
                    
                    {/* Rarity Indicator */}
                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 ${
                      badge.rarity === 'common' ? 'bg-gray-700 text-gray-300' :
                      badge.rarity === 'rare' ? 'bg-blue-700 text-blue-300' :
                      badge.rarity === 'epic' ? 'bg-purple-700 text-purple-300' :
                      'bg-yellow-700 text-yellow-300'
                    }`}>
                      {badge.rarity}
                    </div>

                    {/* Badge Icon */}
                    <div className="mb-4 flex justify-center">
                      <div className={`relative w-20 h-20 rounded-full border-4 ${
                        badge.rarity === 'common' ? 'border-gray-400' :
                        badge.rarity === 'rare' ? 'border-blue-400' :
                        badge.rarity === 'epic' ? 'border-purple-400' :
                        'border-yellow-400'
                      } bg-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden`}>
                        <img 
                          src={badge.imagePath} 
                          alt={badge.name}
                          className="w-14 h-14"
                        />
                      </div>
                    </div>

                    {/* Badge Info */}
                    <h4 className="text-lg font-bold text-white mb-2">{badge.name}</h4>
                    <p className="text-white/70 text-sm mb-3">{badge.description}</p>
                    
                    {/* Earned Date */}
                    <div className="text-xs text-white/50">
                      🗓️ {badge.earnedAt.toLocaleDateString('en-US')}
                    </div>
                    
                    {/* XP Required */}
                    {badge.xpRequired > 0 && (
                      <div className="mt-2 inline-flex items-center px-2 py-1 bg-white/10 rounded-full">
                        <span className="text-purple-400 font-semibold text-xs">💎 {badge.xpRequired} XP</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">📊 Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">{userBadges.length}</div>
              <p className="text-white/70">Total Badges</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">-</div>
              <p className="text-white/70">Total XP</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">
                {userBadges.filter(badge => badge.rarity === 'legendary').length}
              </div>
              <p className="text-white/70">Legendary Badges</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 