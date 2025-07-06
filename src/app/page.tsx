'use client'
import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { 
  createPrediction, 
  getActivePredictions, 
  createVote, 
  getLeaderboard,
  checkAndResolveExpiredPredictions,
  getUserResolvedPredictions
} from '../services/firebase';
import { Prediction, LeaderboardEntry } from '../types';
import ReduxTest from '../components/ReduxTest';
import SagaConnectionTest from '../components/SagaConnectionTest';
import BadgePopup from '../components/BadgePopup';

export default function Home() {
  const { ready, authenticated } = usePrivy();
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [resolvedPredictions, setResolvedPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showResolved, setShowResolved] = useState(false);
  
  // Badge system states
  const [showBadgePopup, setShowBadgePopup] = useState(false);
  const [newBadgeId, setNewBadgeId] = useState<string>('');

  // Form states
  const [newQuestion, setNewQuestion] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // Get currentUserId from localStorage (after Privy authentication)
    const savedUserId = localStorage.getItem('currentUserId');
    if (savedUserId && authenticated) {
      setCurrentUserId(savedUserId);
    } else if (!authenticated) {
      setCurrentUserId('');
      setResolvedPredictions([]);
    }

    loadPredictions();
    loadLeaderboard();

    // Listen for localStorage changes
    const handleStorageChange = () => {
      const savedUserId = localStorage.getItem('currentUserId');
      if (savedUserId) {
        setCurrentUserId(savedUserId);
        loadResolvedPredictions(savedUserId);
      } else {
        setCurrentUserId('');
        setResolvedPredictions([]);
      }
    };

    // Add storage event listener
    window.addEventListener('storage', handleStorageChange);

    // Manual localStorage check (for same tab)
    const storageCheckInterval = setInterval(() => {
      const savedUserId = localStorage.getItem('currentUserId');
      if (savedUserId !== currentUserId) {
        setCurrentUserId(savedUserId || '');
        if (savedUserId) {
          loadResolvedPredictions(savedUserId);
        } else {
          setResolvedPredictions([]);
        }
      }
    }, 1000); // Check every 1 second

    // Update leaderboard every 10 seconds (live updates)
    const leaderboardInterval = setInterval(() => {
      console.log('🔄 Leaderboard updating automatically...');
      loadLeaderboard();
    }, 10000); // 10 seconds

    // Update predictions every 15 seconds + auto-resolution
    const predictionsInterval = setInterval(async () => {
      console.log('🔄 Predictions updating automatically...');
      await checkAndResolveExpiredPredictions(); // Check expired predictions
      loadPredictions();
      loadLeaderboard(); // Update leaderboard after resolution
    }, 15000); // 15 seconds

    // Cleanup function
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(storageCheckInterval);
      clearInterval(leaderboardInterval);
      clearInterval(predictionsInterval);
    };
  }, [currentUserId, authenticated]);

  const loadPredictions = async () => {
    try {
      const data = await getActivePredictions();
      setPredictions(data);
    } catch (error) {
      console.error('Could not load predictions:', error);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const data = await getLeaderboard();
      setLeaderboard(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Could not load leaderboard:', error);
    }
  };

  const loadResolvedPredictions = async (userId?: string) => {
    const userIdToUse = userId || currentUserId;
    if (!userIdToUse) return;
    try {
      console.log('📜 Loading past predictions...');
      const data = await getUserResolvedPredictions(userIdToUse);
      setResolvedPredictions(data);
      console.log(`✅ ${data.length} past predictions loaded`);
    } catch (error) {
      console.error('Could not load past predictions:', error);
    }
  };

  const handleCreatePrediction = async () => {
    if (!newQuestion || !endDate || !currentUserId) return;
    setLoading(true);
    try {
      await createPrediction({
        creatorId: currentUserId,
        question: newQuestion,
        description: newDescription,
        endDate: new Date(endDate),
        status: 'active',
        result: null,
        correctAnswer: null
      });
      setNewQuestion('');
      setNewDescription('');
      setEndDate('');
      await loadPredictions();
      alert('Prediction created!');
    } catch (error) {
      alert('Error: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (predictionId: string, choice: 'yes' | 'no') => {
    if (!currentUserId) {
      alert('Please login first!');
      return;
    }
    setLoading(true);
    try {
      console.log(`🗳️ Starting voting process: ${choice}`);
      
      const voteResult = await createVote({
        userId: currentUserId,
        predictionId,
        choice,
        timestamp: new Date()
      });
      
      // Refresh predictions
      await loadPredictions();
      
      // Refresh leaderboard (for live updates)
      await loadLeaderboard();
      
      // Refresh past predictions (if a prediction was resolved)
      await loadResolvedPredictions();
      
      // 🏆 BADGE CHECK: Did we earn any new badges?
      if (voteResult.newBadges && voteResult.newBadges.length > 0) {
        console.log(`🎉 ${voteResult.newBadges.length} new badges earned!`);
        
        // Show first badge as popup
        const firstBadge = voteResult.newBadges[0];
        setNewBadgeId(firstBadge.badgeId);
        setShowBadgePopup(true);
        
        alert(`✅ Your vote has been recorded: ${choice === 'yes' ? 'YES' : 'NO'}\n\n💎 +5 XP earned! (Voting reward)\n🏆 If the prediction is correct, you'll get +10 XP more!\n\n🎉 NEW BADGE EARNED: ${firstBadge.badgeId}\n\n📊 Total potential: 15 XP`);
      } else {
        alert(`✅ Your vote has been recorded: ${choice === 'yes' ? 'YES' : 'NO'}\n\n💎 +5 XP earned! (Voting reward)\n🏆 If the prediction is correct, you'll get +10 XP more!\n\n📊 Total potential: 15 XP`);
      }
      
      console.log(`✅ Voting completed, leaderboard updated`);
    } catch (error) {
      console.error('Voting error:', error);
      alert('Error: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const createTestPrediction = async () => {
    if (!currentUserId) {
      alert('Please login first!');
      return;
    }
    setLoading(true);
    try {
      await createPrediction({
        creatorId: currentUserId,
        question: 'Will Bitcoin reach $100,000 by the end of 2024?',
        description: 'Do you think Bitcoin will surpass $100,000 by the end of this year?',
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days later
        status: 'active',
        result: null,
        correctAnswer: null // Only admin can set this
      });
      await loadPredictions();
      alert('Test prediction created!');
    } catch (error) {
      alert('Error: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const createQuickTestPrediction = async () => {
    if (!currentUserId) {
      alert('Please login first!');
      return;
    }
    setLoading(true);
    try {
      await createPrediction({
        creatorId: currentUserId,
        question: 'Test prediction - will be resolved manually',
        description: 'This is a test prediction - will be resolved from admin panel.',
        endDate: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes later
        status: 'active',
        result: null,
        correctAnswer: null // Only admin can set this
      });
      await loadPredictions();
      alert('⚡ Quick test prediction created! Can be resolved manually from admin panel.');
    } catch (error) {
      alert('Error: ' + error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalVotes = predictions.reduce((sum, prediction) => sum + (prediction.totalVotes || 0), 0);
  const userXP = currentUserId && leaderboard.find(entry => entry.userId === currentUserId)?.xp || 0;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 opacity-60">
        <div className="particle w-3 h-3 bg-purple-400 absolute top-20 left-20 animate-float"></div>
        <div className="particle w-2 h-2 bg-blue-400 absolute top-40 right-32 animate-float" style={{animationDelay: '1s'}}></div>
        <div className="particle w-4 h-4 bg-pink-400 absolute bottom-40 left-40 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="particle w-3 h-3 bg-green-400 absolute bottom-20 right-20 animate-float" style={{animationDelay: '3s'}}></div>
      </div>

      <main className="relative z-10">
        {/* Hero Section */}
        <div id="home-section" className="text-center py-20 px-4 sm:px-6 lg:px-8 animate-slide-up">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-slide-in">
                <span className="text-white">
                  Predicta
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-6 animate-slide-in" style={{animationDelay: '0.2s'}}>
                🔮 Predict the Future, Gain Fame
              </p>
              <p className="text-lg text-white/70 max-w-3xl mx-auto mb-8 animate-slide-in" style={{animationDelay: '0.4s'}}>
                Predict the future on our social prediction platform, earn XP with correct predictions and rise in the leaderboard!
              </p>
            </div>
            
            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12 animate-slide-up" style={{animationDelay: '0.6s'}}>
              <div className="glass rounded-2xl p-8 text-center card-hover">
                <div className="text-5xl font-bold mb-3 text-gradient">
                  {predictions.length}
                </div>
                <p className="text-white/80 font-medium">Active Predictions</p>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mx-auto mt-3"></div>
              </div>
              <div className="glass rounded-2xl p-8 text-center card-hover">
                <div className="text-5xl font-bold mb-3 text-gradient-secondary">
                  {totalVotes}
                </div>
                <p className="text-white/80 font-medium">Total Votes</p>
                <div className="w-16 h-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mx-auto mt-3"></div>
              </div>
              <div className="glass rounded-2xl p-8 text-center card-hover">
                <div className="text-5xl font-bold mb-3 text-gradient-hero">
                  {userXP}
                </div>
                <p className="text-white/80 font-medium">Your XP</p>
                <div className="w-16 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto mt-3"></div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="animate-slide-up" style={{animationDelay: '0.8s'}}>
              {!ready && (
                <div className="glass rounded-2xl p-8">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white/80 rounded-full animate-spin"></div>
                    <span className="text-white/80 font-medium">Loading...</span>
                  </div>
                </div>
              )}

              {ready && !authenticated && (
                <div className="glass rounded-2xl p-8">
                  <div className="text-center">
                    <div className="text-4xl mb-4 animate-bounce-slow">🔐</div>
                    <p className="text-white/80 font-medium mb-4">
                      Use the <strong>"Login"</strong> button above to create predictions
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-white/60">
                      <span>→</span>
                      <span>Secure login with Privy</span>
                      <span>←</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Create Prediction */}
          {currentUserId && (
            <div className="glass rounded-2xl p-8 mb-12 animate-slide-up card-hover">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">✏️</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Create Prediction</h2>
                  <p className="text-white/70">Create a new prediction and get other users' opinions</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-white/80 font-medium">Prediction Question</label>
                  <input
                    type="text"
                    placeholder="e.g: Will Bitcoin reach $100k by the end of 2024?"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none transition-all duration-200"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-white/80 font-medium">Description (Optional)</label>
                  <textarea
                    placeholder="Detailed description about the prediction..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    rows={3}
                    className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none transition-all duration-200"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-white/80 font-medium">End Date</label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="glass rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none transition-all duration-200"
                  />
                </div>
                
                <div className="glass-dark rounded-xl p-4 border-l-4 border-blue-400">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-blue-400 text-lg">🔒</span>
                    <p className="text-blue-300 font-medium">Result Determination</p>
                  </div>
                  <p className="text-blue-200 text-sm">
                    Prediction results are only determined by admin. There is no automatic resolution, it is resolved manually.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={handleCreatePrediction}
                    disabled={loading}
                    className="btn-success px-8 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Creating...</span>
                      </span>
                    ) : (
                      <span>✨ Create Prediction</span>
                    )}
                  </button>
                  
                  <button
                    onClick={createTestPrediction}
                    disabled={loading}
                    className="btn-gradient px-6 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                  >
                    🧪 Test Prediction (30 days)
                  </button>
                  
                  <button
                    onClick={createQuickTestPrediction}
                    disabled={loading}
                    className="btn-secondary px-6 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                  >
                    ⚡ Quick Test (2 min)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Popular Predictions */}
          <section className="py-12">
            <div className="flex justify-between items-center mb-8">
              <div className="animate-slide-in">
                <h2 className="text-4xl font-bold text-white mb-2">🎯 Popular Predictions</h2>
                <p className="text-white/70 text-lg">Most voted and discussed predictions</p>
              </div>
            </div>

            {predictions.length === 0 ? (
              <div className="text-center p-16 glass rounded-2xl animate-slide-up">
                <div className="text-6xl mb-6 animate-bounce-slow">🎯</div>
                <h3 className="text-2xl font-bold text-white mb-4">No active predictions yet</h3>
                <p className="text-white/70 text-lg mb-6">Be the first to create a prediction and share it with the community!</p>
                {currentUserId && (
                  <p className="text-blue-300 font-medium">Create a new prediction from above! 👆</p>
                )}
                {!currentUserId && (
                  <p className="text-orange-300 font-medium">Login first to create predictions! 👆</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {predictions.map((prediction) => (
                  <div key={prediction.id} className="glass rounded-2xl p-6 card-hover animate-slide-up">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{prediction.question}</h3>
                        {prediction.description && (
                          <p className="text-white/70 text-sm mb-3">{prediction.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-white/60">
                          <span>⏰ {new Date(prediction.endDate).toLocaleDateString('en-US')}</span>
                          <span>👥 {prediction.totalVotes || 0} votes</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          prediction.status === 'active' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {prediction.status === 'active' ? 'Active' : 'Resolved'}
                        </div>
                      </div>
                    </div>

                    {/* Voting Progress */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-green-400 font-medium">Yes</span>
                        <span className="text-red-400 font-medium">No</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${(prediction.totalVotes || 0) > 0 
                              ? ((prediction.yesVotes || 0) / (prediction.totalVotes || 1)) * 100 
                              : 50}%`
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-white/60 mt-1">
                        <span>{prediction.yesVotes || 0} votes</span>
                        <span>{prediction.noVotes || 0} votes</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {prediction.status === 'active' && currentUserId && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleVote(prediction.id, 'yes')}
                          disabled={loading}
                          className="flex-1 btn-success py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                        >
                          👍 Yes
                        </button>
                        <button
                          onClick={() => handleVote(prediction.id, 'no')}
                          disabled={loading}
                          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                        >
                          👎 No
                        </button>
                      </div>
                    )}

                    {prediction.status === 'resolved' && (
                      <div className="text-center">
                        <div className={`inline-flex items-center px-4 py-2 rounded-full font-semibold ${
                          prediction.result === 'yes' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {prediction.result === 'yes' ? '✅ Yes won!' : '❌ No won!'}
                        </div>
                      </div>
                    )}

                    {!currentUserId && (
                      <div className="text-center">
                        <p className="text-white/60 text-sm mb-3">Login to vote</p>
                        <button
                          onClick={() => window.location.href = '#'}
                          className="btn-gradient px-6 py-2 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                          🔐 Login
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Past Predictions */}
          {currentUserId && (
            <section className="py-12">
              <div className="flex justify-between items-center mb-8">
                <div className="animate-slide-in">
                  <h2 className="text-4xl font-bold text-gradient-secondary mb-2">📜 My Past Predictions</h2>
                  <p className="text-white/70 text-lg">Resolved predictions and your performance</p>
                </div>
                <button
                  onClick={() => setShowResolved(!showResolved)}
                  className="btn-secondary px-6 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {showResolved ? '👁️ Hide' : '👁️ Show'} ({resolvedPredictions.length})
                </button>
              </div>
              
              {showResolved && (
                <div className="space-y-6 max-h-96 overflow-y-auto animate-slide-up">
                  {resolvedPredictions.length === 0 ? (
                    <div className="text-center p-12 glass rounded-2xl">
                      <div className="text-4xl mb-4 animate-bounce-slow">📝</div>
                      <h3 className="text-xl font-bold text-white mb-2">No resolved predictions yet</h3>
                      <p className="text-white/70">Vote on predictions and wait for them to be resolved!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {resolvedPredictions.map((prediction) => (
                        <div 
                          key={prediction.id} 
                          className={`glass rounded-2xl p-6 card-hover border-l-4 ${
                            prediction.isCorrect 
                              ? 'border-green-400' 
                              : 'border-red-400'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-lg text-white flex-1 pr-4">{prediction.question}</h3>
                            <div className="text-center">
                              <span className={`text-2xl font-bold block ${prediction.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                {prediction.isCorrect ? '🎉' : '😞'}
                              </span>
                              <p className="text-xs font-bold text-purple-400">+{prediction.xpEarned} XP</p>
                            </div>
                          </div>
                          
                          {prediction.description && (
                            <p className="text-white/70 mb-4 text-sm">{prediction.description}</p>
                          )}
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                            <div className="glass-dark p-3 rounded-lg text-center">
                              <p className="font-medium text-blue-300 mb-1">🗳️ My Vote</p>
                              <p className={`font-bold ${prediction.userVote === 'yes' ? 'text-green-400' : 'text-red-400'}`}>
                                {prediction.userVote === 'yes' ? '✅ YES' : '❌ NO'}
                              </p>
                            </div>
                            <div className="glass-dark p-3 rounded-lg text-center">
                              <p className="font-medium text-gray-300 mb-1">🎯 Correct Answer</p>
                              <p className={`font-bold ${prediction.result === 'yes' ? 'text-green-400' : 'text-red-400'}`}>
                                {prediction.result === 'yes' ? '✅ YES' : '❌ NO'}
                              </p>
                            </div>
                            <div className="glass-dark p-3 rounded-lg text-center">
                              <p className="font-medium text-purple-300 mb-1">📅 Vote Date</p>
                              <p className="text-purple-400 text-xs">
                                {prediction.voteDate.toLocaleDateString('en-US')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Leaderboard */}
          <section id="leaderboard-section" className="py-12">
            <div className="flex justify-between items-center mb-8">
              <div className="animate-slide-in">
                <h2 className="text-4xl font-bold text-gradient-warning mb-2">🏆 Leaderboard</h2>
                <p className="text-white/70 text-lg">Users with the highest XP</p>
              </div>
              <div className="glass-dark px-4 py-2 rounded-xl text-sm text-white/70">
                <p className="flex items-center space-x-2">
                  <span className="animate-pulse">🔄</span>
                  <span>Live updates</span>
                </p>
                <p className="text-xs text-white/50">Last: {lastUpdate.toLocaleTimeString('en-US')}</p>
              </div>
            </div>
            
            {leaderboard.length === 0 ? (
              <div className="text-center p-12 glass rounded-2xl animate-slide-up">
                <div className="text-4xl mb-4 animate-bounce-slow">🏆</div>
                <h3 className="text-xl font-bold text-white mb-2">No rankings yet</h3>
                <p className="text-white/70">Create predictions and vote!</p>
              </div>
            ) : (
              <div className="space-y-4 animate-slide-up">
                {leaderboard.map((entry, index) => (
                  <div key={entry.userId} className={`flex justify-between items-center p-6 rounded-2xl card-hover transition-all duration-300 ${
                    index === 0 ? 'glass border-2 border-yellow-400/50 bg-gradient-to-r from-yellow-500/10 to-yellow-400/5' :
                    index === 1 ? 'glass border-2 border-gray-400/50 bg-gradient-to-r from-gray-400/10 to-gray-300/5' :
                    index === 2 ? 'glass border-2 border-orange-400/50 bg-gradient-to-r from-orange-500/10 to-orange-400/5' :
                    'glass'
                  }`}>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <span className={`text-3xl font-bold block ${
                          index === 0 ? 'text-yellow-400' :
                          index === 1 ? 'text-gray-400' :
                          index === 2 ? 'text-orange-400' :
                          'text-white'
                        }`}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                        </span>
                        {index < 3 && (
                          <div className={`w-8 h-1 rounded-full mx-auto mt-1 ${
                            index === 0 ? 'bg-yellow-400' :
                            index === 1 ? 'bg-gray-400' :
                            'bg-orange-400'
                          }`}></div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                          index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                          index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                          'bg-gradient-to-br from-purple-400 to-blue-500'
                        }`}>
                          {entry.userId.slice(0, 2).toUpperCase()}
                        </div>
                        
                        <div>
                          <p className="font-bold text-white text-lg">User {entry.userId.slice(0, 8)}...</p>
                          {entry.userId === currentUserId && (
                            <div className="flex items-center space-x-2">
                              <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full border border-blue-500/30">👤 YOU</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className={`font-bold text-2xl ${
                            index === 0 ? 'text-yellow-400' :
                            index === 1 ? 'text-gray-400' :
                            index === 2 ? 'text-orange-400' :
                            'text-white'
                          }`}>
                            {entry.xp}
                          </p>
                          <p className="text-white/60 text-sm font-medium">XP</p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-white font-bold text-lg">{entry.correctPredictions}/{entry.totalPredictions}</p>
                          <p className="text-white/60 text-sm">Correct/Total</p>
                        </div>
                        
                        <div className="text-center">
                          <p className={`font-bold text-lg ${
                            entry.successRate >= 70 ? 'text-green-400' :
                            entry.successRate >= 50 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {entry.successRate}%
                          </p>
                          <p className="text-white/60 text-sm">Success</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Hidden Dev Tools - Hidden at bottom of page */}
      {process.env.NODE_ENV === 'development' && (
        <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-4">
              {/* Redux Test Panel */}
              <details className="group">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-all duration-300">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">DEV TOOLS</span>
                      <span className="text-sm text-gray-300">🧪 Redux-Saga Test Panel</span>
                    </div>
                    <div className="transform transition-transform duration-300 group-open:rotate-180">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </summary>
                <div className="mt-4 p-4 bg-gray-900/50 rounded-lg">
                  <ReduxTest />
                </div>
              </details>

              {/* Saga Chainlet Test Panel */}
              <details className="group">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-all duration-300">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">DEV TOOLS</span>
                      <span className="text-sm text-gray-300">🔗 Saga Chainlet Test Panel</span>
                    </div>
                    <div className="transform transition-transform duration-300 group-open:rotate-180">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </summary>
                <div className="mt-4 p-4 bg-gray-900/50 rounded-lg">
                  <SagaConnectionTest />
                </div>
              </details>
            </div>
          </div>
        </footer>
      )}

      {/* Badge Popup */}
      <BadgePopup 
        badgeId={newBadgeId}
        isOpen={showBadgePopup}
        onClose={() => {
          setShowBadgePopup(false);
          setNewBadgeId('');
        }}
      />

      {/* Floating Profile Button */}
      {currentUserId && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => window.location.href = '/profile'}
            className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            title="View My Profile"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
