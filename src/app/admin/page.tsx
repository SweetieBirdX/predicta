'use client'
import React, { useState, useEffect } from 'react';
import { 
  getActivePredictions, 
  resolvePrediction, 
  getLeaderboard,
  getUser,
  createPrediction 
} from '../../services/firebase';
import { Prediction, LeaderboardEntry } from '../../types';

export default function AdminPanel() {
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Admin şifresi (basit demo için)
  const ADMIN_PASSWORD = 'predicta2025';

  useEffect(() => {
    if (isAdminLoggedIn) {
      loadData();
      
      // Admin panelinde daha sık güncelleme (5 saniye)
      const interval = setInterval(() => {
        console.log('🔄 Admin panel auto refreshing...');
        loadData();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isAdminLoggedIn]);

  const loadData = async () => {
    try {
      const [predictionsData, leaderboardData] = await Promise.all([
        getActivePredictions(),
        getLeaderboard(20) // Admin panelinde daha fazla göster
      ]);
      
      setPredictions(predictionsData);
      setLeaderboard(leaderboardData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Admin data loading error:', error);
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdminLoggedIn(true);
      setAdminPassword('');
      alert('✅ Admin girişi başarılı!');
    } else {
      alert('❌ Yanlış admin şifresi!');
    }
  };

  const handleAdminResolve = async (predictionId: string, result: 'yes' | 'no') => {
    setLoading(true);
    try {
      console.log(`🔧 Admin resolving prediction: ${predictionId} - Result: ${result}`);
      
      await resolvePrediction(predictionId, result);
      await loadData(); // Verileri yenile
      
      alert(`🎉 Resolved by admin!\n✅ Result: ${result === 'yes' ? 'YES' : 'NO'}\n💎 Correct predictors earned 10 XP bonus!\n🏆 Leaderboard updated!`);
    } catch (error) {
      console.error('Admin resolution error:', error);
      alert('❌ Error: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const getUserDetails = async (userId: string) => {
    try {
      const user = await getUser(userId);
      if (user) {
        alert(`👤 User Details:\n\n🆔 ID: ${userId}\n📧 Email: ${user.email || 'Not specified'}\n💎 XP: ${user.xp}\n✅ Correct Predictions: ${user.correctPredictions}\n📊 Total Predictions: ${user.totalPredictions}\n🏆 Success Rate: ${user.totalPredictions > 0 ? Math.round((user.correctPredictions / user.totalPredictions) * 100) : 0}%`);
      }
    } catch (error) {
      alert('❌ Could not get user details: ' + error);
    }
  };

  const createDemoData = async () => {
    setLoading(true);
    try {
      const demoQuestions = [
        {
          question: 'Will Bitcoin reach $100,000 by the end of 2024?',
          description: 'Do you think Bitcoin will surpass $100,000 by the end of this year?',
          days: 30
        },
        {
          question: 'Will Turkey reach the Euro 2024 final?',
          description: 'Does the Turkish National Team have a chance to reach the Euro 2024 final?',
          days: 15
        },
        {
          question: 'Will ChatGPT-5 be released in 2024?',
          description: 'Will OpenAI\'s new GPT model be released this year?',
          days: 45
        }
      ];

             for (const demo of demoQuestions) {
         await createPrediction({
           creatorId: 'admin-demo',
           question: demo.question,
           description: demo.description,
           endDate: new Date(Date.now() + demo.days * 24 * 60 * 60 * 1000),
           status: 'active',
           result: null,
           correctAnswer: null // Only admin determines
         });
       }

      await loadData();
      alert('🎉 Demo predictions created!\n\n📝 3 example predictions added\n🗳️ Users can vote\n🏆 You can resolve them from the admin panel');
    } catch (error) {
      alert('❌ Demo data creation error: ' + error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="glass rounded-2xl p-8 max-w-md w-full shadow-2xl animate-slide-up">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
              <span className="text-white text-2xl font-bold">🔐</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
            <p className="text-white/70">Predicta Management System</p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-white/80 font-medium">Admin Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/50 focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none transition-all duration-200"
              />
            </div>
            
            <button
              onClick={handleAdminLogin}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              🚀 Admin Login
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <div className="glass-dark px-4 py-2 rounded-xl border-l-4 border-blue-400">
              <p className="text-blue-300 text-sm">💡 Demo password: predicta2025</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass rounded-2xl p-6 mb-8 shadow-xl animate-slide-up">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">🔧</span>
              </div>
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <a
                    href="/"
                    className="btn-gradient px-4 py-2 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    ← Home
                  </a>
                  <h1 className="text-3xl font-bold text-gradient-hero">Admin Panel</h1>
                </div>
                <p className="text-white/70">Predicta Management System</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="glass-dark px-4 py-2 rounded-xl mb-3">
                <p className="text-white/70 text-sm flex items-center space-x-2">
                  <span className="animate-pulse">🔄</span>
                  <span>Auto refresh: 5 sec</span>
                </p>
                <p className="text-white/50 text-xs">Last: {lastUpdate.toLocaleTimeString('en-US')}</p>
              </div>
              <button
                onClick={() => setIsAdminLoggedIn(false)}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Aktif Tahminler - Admin Kontrolü */}
          <div className="glass rounded-2xl p-6 shadow-xl animate-slide-up card-hover">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">🎯</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Active Predictions</h2>
                <p className="text-white/70 text-sm">Admin Control</p>
              </div>
            </div>
            {predictions.length === 0 ? (
              <div className="text-center p-8">
                <div className="text-4xl mb-4 animate-bounce-slow">🎯</div>
                <p className="text-white/70 text-lg">No active predictions yet</p>
                <p className="text-white/50 text-sm mt-2">Users are waiting to create predictions!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {predictions.map((prediction) => (
                  <div key={prediction.id} className="glass-dark border-l-4 border-red-400 rounded-xl p-4 card-hover">
                    <h3 className="font-bold text-lg mb-2 text-white">{prediction.question}</h3>
                    {prediction.description && (
                      <p className="text-white/70 mb-3 text-sm">{prediction.description}</p>
                    )}
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        <div className="glass p-3 rounded-lg text-center">
                          <p className="text-blue-300 font-medium mb-1">📅 End Date</p>
                          <p className="text-white">{prediction.endDate.toLocaleDateString('en-US')}</p>
                        </div>
                        <div className="glass p-3 rounded-lg text-center">
                          <p className="text-green-300 font-medium mb-1">📊 Votes</p>
                          <p className="text-white">{prediction.totalVotes || 0} total</p>
                          <p className="text-xs text-white/60">{prediction.yesVotes || 0} / {prediction.noVotes || 0}</p>
                        </div>
                        <div className="glass p-3 rounded-lg text-center">
                          <p className="text-purple-300 font-medium mb-1">👤 Creator</p>
                          <p className="text-white text-xs">{prediction.creatorId.slice(0, 8)}...</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAdminResolve(prediction.id, 'yes')}
                          disabled={loading}
                          className="flex-1 btn-success py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                        >
                          {loading ? '⏳ Processing...' : '✅ YES Result'}
                        </button>
                        <button
                          onClick={() => handleAdminResolve(prediction.id, 'no')}
                          disabled={loading}
                          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                        >
                          {loading ? '⏳ Processing...' : '❌ NO Result'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leaderboard - Admin Görünümü */}
          <div className="glass rounded-2xl p-6 shadow-xl animate-slide-up card-hover">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">🏆</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
                <p className="text-white/70 text-sm">Admin View</p>
              </div>
            </div>
            {leaderboard.length === 0 ? (
              <div className="text-center p-8">
                <div className="text-4xl mb-4 animate-bounce-slow">🏆</div>
                <p className="text-white/70 text-lg">No users found yet</p>
                <p className="text-white/50 text-sm mt-2">Users are waiting to register to the system!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {leaderboard.map((entry, index) => (
                  <div key={entry.userId} className={`flex justify-between items-center p-4 rounded-xl transition-all cursor-pointer card-hover ${
                    index === 0 ? 'glass border-2 border-yellow-400/50 bg-gradient-to-r from-yellow-500/10 to-yellow-400/5' :
                    index === 1 ? 'glass border-2 border-gray-400/50 bg-gradient-to-r from-gray-400/10 to-gray-300/5' :
                    index === 2 ? 'glass border-2 border-orange-400/50 bg-gradient-to-r from-orange-500/10 to-orange-400/5' :
                    'glass-dark hover:bg-white/5'
                  }`}
                  onClick={() => getUserDetails(entry.userId)}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`font-bold text-2xl ${
                        index === 0 ? 'text-yellow-400' :
                        index === 1 ? 'text-gray-400' :
                        index === 2 ? 'text-orange-400' :
                        'text-white'
                      }`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                      </span>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                        index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                        index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                        'bg-gradient-to-br from-purple-400 to-blue-500'
                      }`}>
                        {entry.userId.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-white">User {entry.userId.slice(0, 12)}...</p>
                        <p className="text-xs text-white/60">👆 Click for details</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${
                        index === 0 ? 'text-yellow-400' :
                        index === 1 ? 'text-gray-400' :
                        index === 2 ? 'text-orange-400' :
                        'text-white'
                      }`}>
                        💎 {entry.xp}
                      </p>
                      <p className="text-xs text-white/60">
                        ✅ {entry.correctPredictions}/{entry.totalPredictions} ({entry.successRate}%)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Admin Kontrol Paneli */}
        <div className="mt-8 glass rounded-2xl p-6 shadow-xl animate-slide-up">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">📊</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Admin Control Panel</h3>
                <p className="text-white/70 text-sm">System statistics and management tools</p>
              </div>
            </div>
            <button
              onClick={createDemoData}
              disabled={loading}
              className="btn-secondary px-6 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
            >
              {loading ? '⏳ Creating...' : '🎯 Create Demo Data'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-dark rounded-xl p-6 text-center card-hover">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">🎯</span>
              </div>
              <h4 className="font-bold text-white mb-2">Active Predictions</h4>
              <p className="text-3xl font-bold text-blue-400 mb-2">{predictions.length}</p>
              <p className="text-white/60 text-sm">Waiting to be resolved</p>
            </div>
            
            <div className="glass-dark rounded-xl p-6 text-center card-hover">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">👥</span>
              </div>
              <h4 className="font-bold text-white mb-2">Total Users</h4>
              <p className="text-3xl font-bold text-green-400 mb-2">{leaderboard.length}</p>
              <p className="text-white/60 text-sm">Number of registered users</p>
            </div>
            
            <div className="glass-dark rounded-xl p-6 text-center card-hover">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">💎</span>
              </div>
              <h4 className="font-bold text-white mb-2">Total XP</h4>
              <p className="text-3xl font-bold text-purple-400 mb-2">
                {leaderboard.reduce((total, user) => total + user.xp, 0)}
              </p>
              <p className="text-white/60 text-sm">Amount of XP distributed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 