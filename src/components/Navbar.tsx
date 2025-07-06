'use client'
import { useState, useEffect } from 'react';
import { usePrivy, useLogin, useLogout } from '@privy-io/react-auth';
import { createUser, getUserByEmail, getUser, getUserByPrivyId, updateUserPrivyId, getUserActivities, getUserBadgesNew, getBadgeById } from '../services/firebase';

export default function Navbar() {
  const { ready, authenticated, user } = usePrivy();
  const { login } = useLogin();
  const { logout } = useLogout();
  
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userActivities, setUserActivities] = useState<any[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);

  // Load/create Firebase user when Privy user changes
  useEffect(() => {
    if (ready && authenticated && user) {
      handlePrivyUser(user);
    } else if (ready && !authenticated) {
      setCurrentUser(null);
      localStorage.removeItem('currentUserId');
      localStorage.removeItem('currentUserEmail');
    }
  }, [ready, authenticated, user]);

  const handlePrivyUser = async (privyUser: any) => {
    try {
      console.log('🔐 Privy user detected:', privyUser);
      
      let firebaseUser = null;
      let userId = '';
      
      // First search for user in Firebase using Privy ID
      if (privyUser.id) {
        firebaseUser = await getUserByPrivyId(privyUser.id);
      }
      
      // If not found and email exists, search by email
      if (!firebaseUser && privyUser.email?.address) {
        firebaseUser = await getUserByEmail(privyUser.email.address);
        
        // If found by email, update Privy ID
        if (firebaseUser) {
          await updateUserPrivyId(firebaseUser.id, privyUser.id);
        }
      }
      
      // If not found at all, create new user
      if (!firebaseUser) {
        console.log('✨ Creating new user...');
        userId = await createUser({
          privyId: privyUser.id,
          email: privyUser.email?.address || '',
          walletAddress: privyUser.wallet?.address || '',
          xp: 0,
          correctPredictions: 0,
          totalPredictions: 0,
          badges: []
        });
        firebaseUser = await getUser(userId);
      } else {
        userId = firebaseUser.id;
      }
      
      setCurrentUser(firebaseUser);
      localStorage.setItem('currentUserId', userId);
      localStorage.setItem('currentUserEmail', privyUser.email?.address || '');
      
      console.log('✅ Firebase user ready:', userId);
      
    } catch (error) {
      console.error('Privy user processing error:', error);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToHome = () => {
    const homeElement = document.getElementById('home-section');
    if (homeElement) {
      homeElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToLeaderboard = () => {
    const leaderboardElement = document.getElementById('leaderboard-section');
    if (leaderboardElement) {
      leaderboardElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogin = () => {
    console.log('🔐 Starting Privy login...');
    login();
  };

  const checkMyXP = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const user = await getUser(currentUser.id);
      if (user) {
        setCurrentUser(user);
        const successRate = user.totalPredictions > 0 
          ? Math.round((user.correctPredictions / user.totalPredictions) * 100)
          : 0;
        
        alert(`🎯 Your XP Status:\n\n👤 User: ${user.email}\n💎 Total XP: ${user.xp}\n✅ Correct Predictions: ${user.correctPredictions}\n📊 Total Predictions: ${user.totalPredictions}\n🏆 Success Rate: ${successRate}%\n\n🎉 You're doing great!`);
      }
    } catch (error) {
      alert('Could not check XP status: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    console.log('🚪 Starting Privy logout...');
    logout();
    setCurrentUser(null);
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentUserEmail');
    alert('🚪 Logged out!');
  };

  const closeProfileDropdown = () => {
    setIsProfileDropdownOpen(false);
  };

  const openProfileModal = async () => {
    setIsProfileModalOpen(true);
    setIsProfileDropdownOpen(false);
    
    if (currentUser) {
      setProfileLoading(true);
      try {
        console.log('📊 Loading profile data...');
        const [activities, userBadges] = await Promise.all([
          getUserActivities(currentUser.id),
          getUserBadgesNew(currentUser.id)
        ]);
        
        // Merge badges with details
        const badgesWithDetails = userBadges.map(userBadge => {
          const badgeInfo = getBadgeById(userBadge.badgeId);
          return {
            ...userBadge,
            ...badgeInfo,
            id: userBadge.badgeId // For compatibility
          };
        }).filter(badge => badge.name); // Only show valid badges
        
        setUserActivities(activities);
        setUserBadges(badgesWithDetails);
        console.log(`✅ Profile data loaded: ${activities.length} activities, ${badgesWithDetails.length} badges`);
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setProfileLoading(false);
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (isProfileDropdownOpen && !event.target.closest('.profile-dropdown')) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isProfileDropdownOpen]);

  // Show loading if Privy is not ready
  if (!ready) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 glass animate-slide-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full shimmer overflow-hidden flex items-center justify-center">
                <img 
                  src="/predictalogo.svg" 
                  alt="Predicta Logo" 
                  className="w-full h-full object-contain opacity-50"
                />
              </div>
              <div className="h-6 w-32 bg-white/20 rounded-full shimmer"></div>
            </div>
            <div className="h-10 w-24 bg-white/20 rounded-full shimmer"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass animate-slide-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center animate-pulse-slow overflow-hidden">
                <img 
                  src="/predictalogo.svg" 
                  alt="Predicta Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold text-white">Predicta</h1>
                <p className="text-xs text-white/70">Social Prediction Platform</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={scrollToHome}
                className="text-white/80 hover:text-white transition-colors duration-200 font-medium hover:scale-105 transform"
              >
                🏠 Home
              </button>
              <button
                onClick={scrollToLeaderboard}
                className="text-white/80 hover:text-white transition-colors duration-200 font-medium hover:scale-105 transform"
              >
                🏆 Leaderboard
              </button>
              <button
                onClick={() => window.location.href = '/profile'}
                className="text-white/80 hover:text-white transition-colors duration-200 font-medium hover:scale-105 transform"
              >
                👤 Profile
              </button>
            </div>

            {/* Auth & User Section */}
            <div className="flex items-center space-x-4">
              {authenticated && currentUser ? (
                <>
                  {/* User XP Display */}
                  <div className="hidden sm:flex items-center space-x-2 glass-dark px-3 py-1 rounded-full">
                    <span className="text-purple-400 font-semibold text-sm">💎</span>
                    <span className="text-white font-bold text-sm">{currentUser.xp || 0}</span>
                    <span className="text-white/60 text-xs">XP</span>
                  </div>

                  {/* User Profile Dropdown */}
                  <div className="relative profile-dropdown">
                    <button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="flex items-center space-x-2 glass-dark px-3 py-2 rounded-full hover:bg-white/20 transition-all duration-200 transform hover:scale-105"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {currentUser.email?.charAt(0).toUpperCase() || '👤'}
                        </span>
                      </div>
                      <span className="hidden sm:block text-white font-medium text-sm">
                        {currentUser.email?.split('@')[0] || 'User'}
                      </span>
                      <svg className={`w-4 h-4 text-white/70 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 glass-dark rounded-2xl shadow-xl border border-white/20 animate-slide-up">
                        <div className="p-4 border-b border-white/10">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {currentUser.email?.charAt(0).toUpperCase() || '👤'}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-white font-bold text-sm">{currentUser.email || 'User'}</h3>
                              <p className="text-white/60 text-xs">ID: {currentUser.id?.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-2">
                          <button
                            onClick={checkMyXP}
                            disabled={loading}
                            className="w-full flex items-center space-x-3 px-3 py-2 text-left text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                          >
                            <span className="text-purple-400">📊</span>
                            <span className="font-medium">XP Status</span>
                            {loading && <div className="w-4 h-4 border-2 border-white/20 border-t-white/80 rounded-full animate-spin"></div>}
                          </button>
                          
                          <button
                            onClick={() => window.location.href = '/profile'}
                            className="w-full flex items-center space-x-3 px-3 py-2 text-left text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                          >
                            <span className="text-blue-400">👤</span>
                            <span className="font-medium">Profile</span>
                          </button>
                          
                          <button
                            onClick={openProfileModal}
                            className="w-full flex items-center space-x-3 px-3 py-2 text-left text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                          >
                            <span className="text-green-400">🏆</span>
                            <span className="font-medium">My Badges</span>
                          </button>
                        </div>
                        
                        <div className="p-2 border-t border-white/10">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-3 py-2 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                          >
                            <span>🚪</span>
                            <span className="font-medium">Logout</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <button
                  onClick={handleLogin}
                  className="btn-gradient px-6 py-2 rounded-full font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  🔐 Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full glass-dark rounded-2xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gradient-hero">🏆 My Badges</h2>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="text-white/60 hover:text-white/80 text-2xl transition-colors"
              >
                ×
              </button>
            </div>

            {profileLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
                <span className="ml-3 text-white/80">Loading...</span>
              </div>
            ) : (
              <>
                {userBadges.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4 animate-bounce-slow">🎯</div>
                    <p className="text-white/70">No badges yet!</p>
                    <p className="text-white/50 text-sm mt-2">Participate in predictions and earn XP!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {userBadges.map((badge) => (
                      <div key={badge.badgeId} className="glass p-4 rounded-xl text-center card-hover">
                        <div className="mb-3">
                          <img 
                            src={badge.imagePath} 
                            alt={badge.name}
                            className="w-12 h-12 mx-auto"
                          />
                        </div>
                        <h4 className="text-white font-bold text-sm mb-1">{badge.name}</h4>
                        <p className="text-white/60 text-xs">{badge.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
} 