import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  increment,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, Prediction, Vote, LeaderboardEntry, Badge, UserBadge, BadgeProgress, BADGE_DEFINITIONS } from '../types';

// User operations
export const createUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const userDoc = {
      privyId: userData.privyId || '',
      walletAddress: userData.walletAddress || '',
      email: userData.email || '',
      createdAt: Timestamp.now(),
      xp: 0,
      correctPredictions: 0,
      totalPredictions: 0,
      badges: []
    };
    
    console.log('🔥 Creating user:', userDoc);
    
    const userRef = await addDoc(collection(db, 'users'), userDoc);
    
    console.log('✅ User created, ID:', userRef.id);
    
    // 🏆 WELCOME BADGE: Give welcome badge to new user
    console.log(`🎉 Awarding welcome badge to new user...`);
    const welcomeBadges = await checkAndAwardBadges(userRef.id, 0);
    
    if (welcomeBadges.length > 0) {
      console.log(`🎉 ${welcomeBadges.length} welcome badge(s) awarded!`);
      for (const badge of welcomeBadges) {
        console.log(`🏆 New badge: ${badge.badgeId}`);
      }
    }
    
    return userRef.id;
  } catch (error) {
    console.error('User creation error:', error);
    throw error;
  }
};

export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        id: userDoc.id,
        ...data,
        createdAt: data.createdAt.toDate()
      } as User;
    }
    return null;
  } catch (error) {
    console.error('User retrieval error:', error);
    throw error;
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    console.log(`🔍 Searching for user by email: ${email}`);
    
    const q = query(
      collection(db, 'users'),
      where('email', '==', email),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const data = userDoc.data();
      const user = {
        id: userDoc.id,
        ...data,
        createdAt: data.createdAt.toDate()
      } as User;
      
      console.log(`✅ Existing user found: ${user.id}`);
      return user;
    }
    
    console.log(`❌ No user found with this email: ${email}`);
    return null;
  } catch (error) {
    console.error('User search by email error:', error);
    throw error;
  }
};

// User search function by Privy ID
export const getUserByPrivyId = async (privyId: string): Promise<User | null> => {
  try {
    console.log(`🔍 Searching for user by Privy ID: ${privyId}`);
    
    const q = query(
      collection(db, 'users'),
      where('privyId', '==', privyId),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const data = userDoc.data();
      const user = {
        id: userDoc.id,
        ...data,
        createdAt: data.createdAt.toDate()
      } as User;
      
      console.log(`✅ User found by Privy ID: ${user.id}`);
      return user;
    }
    
    console.log(`❌ No user found with this Privy ID: ${privyId}`);
    return null;
  } catch (error) {
    console.error('User search by Privy ID error:', error);
    throw error;
  }
};

// Function to update user's Privy ID
export const updateUserPrivyId = async (userId: string, privyId: string): Promise<void> => {
  try {
    console.log(`🔄 Updating Privy ID: User ${userId} -> Privy ${privyId}`);
    
    await updateDoc(doc(db, 'users', userId), {
      privyId: privyId
    });
    
    console.log(`✅ Privy ID successfully updated`);
  } catch (error) {
    console.error('Privy ID update error:', error);
    throw error;
  }
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), updates);
  } catch (error) {
    console.error('User update error:', error);
    throw error;
  }
};

// Prediction operations
export const createPrediction = async (predictionData: Omit<Prediction, 'id' | 'createdAt' | 'totalVotes' | 'yesVotes' | 'noVotes'>): Promise<string> => {
  try {
    const predictionRef = await addDoc(collection(db, 'predictions'), {
      ...predictionData,
      createdAt: Timestamp.now(),
      totalVotes: 0,
      yesVotes: 0,
      noVotes: 0,
      endDate: Timestamp.fromDate(predictionData.endDate)
    });
    console.log(`🎯 Prediction created: ${predictionRef.id}, Correct answer: ${predictionData.correctAnswer}`);
    return predictionRef.id;
  } catch (error) {
    console.error('Prediction creation error:', error);
    throw error;
  }
};

export const getActivePredictions = async (): Promise<Prediction[]> => {
  try {
    const q = query(
      collection(db, 'predictions'),
      where('status', '==', 'active')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        endDate: data.endDate.toDate()
      } as unknown as Prediction;
    });
  } catch (error) {
    console.error('Aktif tahminleri alma hatası:', error);
    throw error;
  }
};

export const getPrediction = async (predictionId: string): Promise<Prediction | null> => {
  try {
    const predictionDoc = await getDoc(doc(db, 'predictions', predictionId));
    if (predictionDoc.exists()) {
      const data = predictionDoc.data();
      return {
        id: predictionDoc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        endDate: data.endDate.toDate()
      } as unknown as Prediction;
    }
    return null;
  } catch (error) {
    console.error('Tahmin alma hatası:', error);
    throw error;
  }
};

export const resolvePrediction = async (predictionId: string, result: 'yes' | 'no'): Promise<void> => {
  try {
    await updateDoc(doc(db, 'predictions', predictionId), {
      status: 'resolved',
      result: result
    });
    
    // Doğru tahmin yapanları bul ve XP ver
    await distributeXP(predictionId, result);
  } catch (error) {
    console.error('Tahmin sonuçlandırma hatası:', error);
    throw error;
  }
};

// Oy işlemleri
export const createVote = async (voteData: Omit<Vote, 'id' | 'createdAt'>): Promise<{voteId: string, newBadges: UserBadge[]}> => {
  try {
    console.log(`🗳️ Oy veriliyor: Kullanıcı ${voteData.userId}, Tahmin ${voteData.predictionId}, Seçim: ${voteData.choice}`);
    
    // Önce kullanıcının bu tahmin için oy verip vermediğini kontrol et
    const existingVoteQuery = query(
      collection(db, 'votes'),
      where('userId', '==', voteData.userId),
      where('predictionId', '==', voteData.predictionId)
    );
    const existingVotes = await getDocs(existingVoteQuery);
    
    if (!existingVotes.empty) {
      throw new Error('Bu tahmin için zaten oy kullandınız');
    }

    // Oy oluştur
    const voteRef = await addDoc(collection(db, 'votes'), {
      ...voteData,
      createdAt: Timestamp.now()
    });

    console.log(`✅ Oy başarıyla kaydedildi: ${voteRef.id}`);

    // 🎯 OY VERME ÖDÜLÜ: Her oy için 5 XP ver!
    console.log(`💎 Oy verme ödülü veriliyor: Kullanıcı ${voteData.userId} → +5 XP`);
    
    try {
      const voterRef = doc(db, 'users', voteData.userId);
      const voterDoc = await getDoc(voterRef);
      
      if (voterDoc.exists()) {
        const voterData = voterDoc.data();
        const currentXP = voterData.xp || 0;
        const currentTotal = voterData.totalPredictions || 0;
        
        console.log(`📊 Kullanıcı ${voteData.userId} - Mevcut XP: ${currentXP}`);
        
        const newXP = currentXP + 5;
        await updateDoc(voterRef, {
          xp: newXP, // Her oy için 5 XP
          totalPredictions: currentTotal + 1 // Toplam tahmin sayısını artır
        });
        
        console.log(`✅ Oy verme ödülü verildi! Kullanıcı ${voteData.userId} - YENİ XP: ${newXP}`);
        
        // 🏆 ROZET KONTROLÜ: XP artışı sonrası rozet kontrolü yap
        console.log(`🏆 Rozet kontrolü yapılıyor...`);
        const newBadges = await checkAndAwardBadges(voteData.userId, newXP);
        
        if (newBadges.length > 0) {
          console.log(`🎉 ${newBadges.length} yeni rozet kazanıldı!`);
          for (const badge of newBadges) {
            console.log(`🏆 Yeni rozet: ${badge.badgeId}`);
          }
        }
        
        // Tahmin istatistiklerini güncelle
        const predictionRef = doc(db, 'predictions', voteData.predictionId);
        const predictionDoc = await getDoc(predictionRef);
        
        if (predictionDoc.exists()) {
          const predictionData = predictionDoc.data();
          if (predictionData) {
            const currentTotal = predictionData!.totalVotes || 0;
            const currentChoice = predictionData![`${voteData.choice}Votes`] || 0;
            
            await updateDoc(predictionRef, {
              totalVotes: currentTotal + 1,
              [`${voteData.choice}Votes`]: currentChoice + 1
            });
            
            console.log(`📊 Tahmin istatistikleri güncellendi - Toplam: ${currentTotal + 1}, ${voteData.choice}: ${currentChoice + 1}`);
          }
        }
        
        return {
          voteId: voteRef.id,
          newBadges: newBadges
        };
      } else {
        console.error(`❌ Oy veren kullanıcı ${voteData.userId} dökümanı bulunamadı!`);
        return {
          voteId: voteRef.id,
          newBadges: []
        };
      }
    } catch (xpError) {
      console.error(`❌ Oy verme XP hatası:`, xpError);
      return {
        voteId: voteRef.id,
        newBadges: []
      };
    }
  } catch (error) {
    console.error('Oy oluşturma hatası:', error);
    throw error;
  }
};

export const getUserVote = async (userId: string, predictionId: string): Promise<Vote | null> => {
  try {
    const q = query(
      collection(db, 'votes'),
      where('userId', '==', userId),
      where('predictionId', '==', predictionId)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate()
      } as unknown as Vote;
    }
    return null;
  } catch (error) {
    console.error('Kullanıcı oyu alma hatası:', error);
    throw error;
  }
};

// XP dağıtım fonksiyonu
const distributeXP = async (predictionId: string, correctResult: 'yes' | 'no'): Promise<void> => {
  try {
    console.log(`🎯 XP dağıtımı başlıyor - Tahmin: ${predictionId}, Doğru sonuç: ${correctResult}`);
    
    // Doğru oy veren kullanıcıları bul
    const correctVotesQuery = query(
      collection(db, 'votes'),
      where('predictionId', '==', predictionId),
      where('choice', '==', correctResult)
    );
    const correctVotes = await getDocs(correctVotesQuery);
    
    console.log(`✅ Doğru oy veren kullanıcı sayısı: ${correctVotes.docs.length}`);

    // Tüm oyları bul (totalPredictions için)
    const allVotesQuery = query(
      collection(db, 'votes'),
      where('predictionId', '==', predictionId)
    );
    const allVotes = await getDocs(allVotesQuery);
    
    console.log(`📊 Toplam oy sayısı: ${allVotes.docs.length}`);

    // 🏆 DOĞRU TAHMİN BONUS: Doğru oy veren kullanıcılara ek 10 XP ver!
    for (const voteDoc of correctVotes.docs) {
      const vote = voteDoc.data();
      const userRef = doc(db, 'users', vote.userId);
      
      console.log(`🏆 DOĞRU TAHMİN BONUS: Kullanıcı ${vote.userId} için ek 10 XP veriliyor...`);
      
      try {
        // Önce kullanıcının mevcut verilerini al
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const currentXP = userData.xp || 0;
          const currentCorrect = userData.correctPredictions || 0;
          
          console.log(`📊 Kullanıcı ${vote.userId} - Mevcut XP: ${currentXP}, Doğru tahmin: ${currentCorrect}`);
          
          // Ek 10 XP ver ve doğru tahmin sayısını artır
          const newXP = currentXP + 10;
          await updateDoc(userRef, {
            xp: newXP, // Ek 10 XP (zaten oy verirken 5 XP almıştı)
            correctPredictions: currentCorrect + 1
          });
          
          console.log(`✅ DOĞRU TAHMİN BONUS! Kullanıcı ${vote.userId} - YENİ XP: ${newXP} (+10 bonus), Doğru tahmin: ${currentCorrect + 1}`);
          console.log(`🎉 Toplam kazanım: 5 XP (oy) + 10 XP (doğru bonus) = 15 XP!`);
          
          // 🏆 ROZET KONTROLÜ: Doğru tahmin bonusu sonrası rozet kontrolü yap
          console.log(`🏆 Doğru tahmin bonus sonrası rozet kontrolü yapılıyor...`);
          const newBadges = await checkAndAwardBadges(vote.userId, newXP);
          
          if (newBadges.length > 0) {
            console.log(`🎉 ${newBadges.length} yeni rozet kazanıldı!`);
            for (const badge of newBadges) {
              console.log(`🏆 Yeni rozet: ${badge.badgeId}`);
            }
          }
        } else {
          console.error(`❌ Kullanıcı ${vote.userId} dökümanı bulunamadı!`);
        }
      } catch (userError) {
        console.error(`❌ Kullanıcı ${vote.userId} XP güncelleme hatası:`, userError);
      }
    }

    // ℹ️ NOT: totalPredictions artık oy verirken güncelleniyor, burada tekrar artırmaya gerek yok
    console.log(`ℹ️ totalPredictions zaten oy verirken güncellendi, tekrar artırılmadı`)
    
    console.log(`🎉 XP dağıtımı tamamlandı!`);
  } catch (error) {
    console.error('XP dağıtım hatası:', error);
    throw error;
  }
};

// Leaderboard
// Otomatik sonuçlandırma - Süresi dolmuş tahminleri kontrol et
export const checkAndResolveExpiredPredictions = async (): Promise<void> => {
  try {
    console.log('⏰ Süresi dolmuş tahminler kontrol ediliyor...');
    
    const now = new Date();
    const q = query(
      collection(db, 'predictions'),
      where('status', '==', 'active')
    );
    
    const querySnapshot = await getDocs(q);
    const predictions = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        endDate: data.endDate.toDate()
      } as unknown as Prediction;
    });
    
    let resolvedCount = 0;
    
    for (const prediction of predictions) {
      if (prediction.endDate <= now) {
        console.log(`⏰ Süresi dolmuş tahmin bulundu: ${prediction.id} - Doğru cevap: ${prediction.correctAnswer}`);
        
        // Sadece correctAnswer belirlenmiş tahminleri otomatik sonuçlandır
        if (prediction.correctAnswer) {
          // Otomatik sonuçlandır
          await updateDoc(doc(db, 'predictions', prediction.id), {
            status: 'resolved',
            result: prediction.correctAnswer
          });
          
          // XP dağıt
          await distributeXP(prediction.id, prediction.correctAnswer);
          
          resolvedCount++;
          console.log(`✅ Tahmin otomatik sonuçlandırıldı: ${prediction.id} - Sonuç: ${prediction.correctAnswer}`);
        } else {
          console.log(`⏸️ Tahmin süresi doldu ama admin tarafından sonuçlandırılmayı bekliyor: ${prediction.id}`);
        }
      }
    }
    
    if (resolvedCount > 0) {
      console.log(`🎉 Toplam ${resolvedCount} tahmin otomatik sonuçlandırıldı!`);
    } else {
      console.log('✅ Süresi dolmuş tahmin bulunamadı.');
    }
  } catch (error) {
    console.error('Otomatik sonuçlandırma hatası:', error);
  }
};

// Kullanıcının sonuçlanmış tahminlerini getir
export const getUserResolvedPredictions = async (userId: string): Promise<any[]> => {
  try {
    console.log(`📜 Kullanıcının geçmiş tahminleri getiriliyor: ${userId}`);
    
    // 1. Kullanıcının oylarını al
    const votesQuery = query(
      collection(db, 'votes'),
      where('userId', '==', userId)
    );
    const votesSnapshot = await getDocs(votesQuery);
    
    // 2. Sonuçlanmış tahminleri al
    const resolvedQuery = query(
      collection(db, 'predictions'),
      where('status', '==', 'resolved')
    );
    const resolvedSnapshot = await getDocs(resolvedQuery);
    
    // 3. Kullanıcının oyladığı ve sonuçlanmış tahminleri eşleştir
    const userVotes = votesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        predictionId: data.predictionId,
        choice: data.choice,
        createdAt: data.createdAt.toDate()
      } as unknown as Vote;
    });
    
    const resolvedPredictions = resolvedSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        endDate: data.endDate.toDate()
      } as unknown as Prediction;
    });
    
    // 4. Kullanıcının katıldığı sonuçlanmış tahminleri birleştir
    const userResolvedPredictions = [];
    
    for (const vote of userVotes) {
      const prediction = resolvedPredictions.find(p => p.id === vote.predictionId);
      if (prediction) {
        const isCorrect = vote.choice === prediction.result;
        const xpEarned = isCorrect ? 15 : 5; // Doğru: 15 XP, Yanlış: 5 XP
        
        userResolvedPredictions.push({
          ...prediction,
          userVote: vote.choice,
          isCorrect,
          xpEarned,
          voteDate: (vote as any).createdAt
        });
      }
    }
    
    // 5. Tarihine göre sırala (en yeni önce)
    userResolvedPredictions.sort((a, b) => b.voteDate.getTime() - a.voteDate.getTime());
    
    console.log(`✅ ${userResolvedPredictions.length} geçmiş tahmin bulundu`);
    return userResolvedPredictions;
  } catch (error) {
    console.error('Geçmiş tahminler alma hatası:', error);
    throw error;
  }
};

export const getLeaderboard = async (limitCount: number = 10): Promise<LeaderboardEntry[]> => {
  try {
    const q = query(
      collection(db, 'users'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    
    const users = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const successRate = data.totalPredictions > 0 
        ? (data.correctPredictions / data.totalPredictions) * 100 
        : 0;
      
      return {
        userId: doc.id,
        xp: data.xp,
        correctPredictions: data.correctPredictions,
        totalPredictions: data.totalPredictions,
        successRate: Math.round(successRate)
      } as LeaderboardEntry;
    });
    
    // Frontend'de sırala (XP'ye göre azalan)
    return users.sort((a, b) => b.xp - a.xp);
  } catch (error) {
    console.error('Leaderboard alma hatası:', error);
    throw error;
  }
};

// Kullanıcı profili için yeni fonksiyonlar
export const getUserActivities = async (userId: string): Promise<any[]> => {
  try {
    console.log(`📊 Kullanıcının aktiviteleri getiriliyor: ${userId}`);
    
    // 1. Kullanıcının oylarını al
    let votesSnapshot;
    try {
      const votesQuery = query(
        collection(db, 'votes'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      votesSnapshot = await getDocs(votesQuery);
    } catch (error) {
      console.log('Index eksik, sıralama olmadan alınıyor...');
      const votesQuery = query(
        collection(db, 'votes'),
        where('userId', '==', userId),
        limit(10)
      );
      votesSnapshot = await getDocs(votesQuery);
    }
    
    // 2. Kullanıcının oluşturduğu tahminleri al
    let predictionsSnapshot;
    try {
      const predictionsQuery = query(
        collection(db, 'predictions'),
        where('creatorId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      predictionsSnapshot = await getDocs(predictionsQuery);
    } catch (error) {
      console.log('Index eksik, sıralama olmadan alınıyor...');
      const predictionsQuery = query(
        collection(db, 'predictions'),
        where('creatorId', '==', userId),
        limit(10)
      );
      predictionsSnapshot = await getDocs(predictionsQuery);
    }
    
    // 3. Aktiviteleri birleştir
    const activities = [];
    
    // Oyları ekle
    for (const voteDoc of votesSnapshot.docs) {
      const voteData = voteDoc.data();
      const predictionDoc = await getDoc(doc(db, 'predictions', voteData.predictionId));
      
      if (predictionDoc.exists()) {
        const predictionData = predictionDoc.data();
        activities.push({
          id: voteDoc.id,
          type: 'vote',
          action: 'Oy verdi',
          predictionTitle: predictionData.question,
          predictionId: voteData.predictionId,
          choice: voteData.choice,
          status: predictionData.status,
          result: predictionData.result,
          createdAt: voteData.createdAt.toDate(),
          category: getCategoryFromQuestion(predictionData.question)
        });
      }
    }
    
    // Oluşturulan tahminleri ekle
    for (const predictionDoc of predictionsSnapshot.docs) {
      const predictionData = predictionDoc.data();
      activities.push({
        id: predictionDoc.id,
        type: 'prediction',
        action: 'Tahmin oluşturdu',
        predictionTitle: predictionData.question,
        predictionId: predictionDoc.id,
        status: predictionData.status,
        result: predictionData.result,
        totalVotes: predictionData.totalVotes,
        createdAt: predictionData.createdAt.toDate(),
        category: getCategoryFromQuestion(predictionData.question)
      });
    }
    
    // Tarihine göre sırala
    activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    console.log(`✅ ${activities.length} aktivite bulundu`);
    return activities.slice(0, 10); // En son 10 aktiviteyi döndür
  } catch (error) {
    console.error('Kullanıcı aktivitelerini alma hatası:', error);
    throw error;
  }
};

// Kategorileri tahmin sorusundan çıkar
const getCategoryFromQuestion = (question: string): string => {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('bitcoin') || lowerQuestion.includes('kripto') || lowerQuestion.includes('ethereum')) {
    return 'Kripto';
  } else if (lowerQuestion.includes('apple') || lowerQuestion.includes('iphone') || lowerQuestion.includes('teknoloji') || lowerQuestion.includes('yapay zeka')) {
    return 'Teknoloji';
  } else if (lowerQuestion.includes('futbol') || lowerQuestion.includes('avrupa') || lowerQuestion.includes('şampiyona') || lowerQuestion.includes('spor')) {
    return 'Spor';
  } else if (lowerQuestion.includes('ekonomi') || lowerQuestion.includes('piyasa') || lowerQuestion.includes('borsa')) {
    return 'Ekonomi';
  } else if (lowerQuestion.includes('siyaset') || lowerQuestion.includes('seçim') || lowerQuestion.includes('hükümet')) {
    return 'Siyaset';
  } else {
    return 'Genel';
  }
};

// Kullanıcının rozetlerini hesapla
export const getUserBadges = async (userId: string): Promise<UserBadge[]> => {
  try {
    console.log(`🏆 Kullanıcının rozetleri hesaplanıyor: ${userId}`);
    
    const user = await getUser(userId);
    if (!user) return [];
    
    const badges = [];
    
    // İlk Tahmin rozeti
    const userPredictionsQuery = query(
      collection(db, 'predictions'),
      where('creatorId', '==', userId),
      limit(1)
    );
    const userPredictionsSnapshot = await getDocs(userPredictionsQuery);
    
    if (!userPredictionsSnapshot.empty) {
      badges.push({
        id: 'first_prediction',
        name: 'İlk Tahmin',
        description: 'İlk tahmini oluşturdun!',
        icon: '🥇',
        unlockedAt: userPredictionsSnapshot.docs[0].data().createdAt.toDate()
      });
    }
    
    // Seri Yapıcı rozeti (5 doğru tahmin)
    if (user.correctPredictions >= 5) {
      badges.push({
        id: 'streak_master',
        name: 'Seri Yapıcı',
        description: '5 doğru tahmin serisi yaptın!',
        icon: '🏆',
        unlockedAt: new Date() // Gerçek unlock tarihini hesaplamak için daha karmaşık logic gerekir
      });
    }
    
    // Keskin Nişancı rozeti (10 doğru tahmin)
    if (user.correctPredictions >= 10) {
      badges.push({
        id: 'sharp_shooter',
        name: 'Keskin Nişancı',
        description: '10 doğru tahmin yaptın!',
        icon: '🎯',
        unlockedAt: new Date()
      });
    }
    
    // Yüksek Başarı rozeti (%75+ başarı oranı, minimum 10 tahmin)
    if (user.totalPredictions >= 10) {
      const successRate = (user.correctPredictions / user.totalPredictions) * 100;
      if (successRate >= 75) {
        badges.push({
          id: 'high_accuracy',
          name: 'Yüksek Başarı',
          description: '%75+ başarı oranı!',
          icon: '💎',
          unlockedAt: new Date()
        });
      }
    }
    
    // XP Avcısı rozeti (1000+ XP)
    if (user.xp >= 1000) {
      badges.push({
        id: 'xp_hunter',
        name: 'XP Avcısı',
        description: '1000+ XP topladın!',
        icon: '⚡',
        unlockedAt: new Date()
      });
    }
    
    // Aktif Katılımcı rozeti (20+ tahmin)
    if (user.totalPredictions >= 20) {
      badges.push({
        id: 'active_participant',
        name: 'Aktif Katılımcı',
        description: '20+ tahmine katıldın!',
        icon: '🔥',
        unlockedAt: new Date()
      });
    }
    
    console.log(`🏆 ${badges.length} rozet bulundu`);
    return badges as unknown as UserBadge[];
  } catch (error) {
    console.error('Kullanıcı rozetlerini hesaplama hatası:', error);
    throw error;
  }
};

// Level hesapla
export const calculateUserLevel = (xp: number): { level: number, currentXP: number, requiredXP: number, progress: number } => {
  // Her level için gerekli XP miktarları (kademeli artış)
  const levelThresholds = [
    0,     // Level 1
    100,   // Level 2
    300,   // Level 3  
    600,   // Level 4
    1000,  // Level 5
    1500,  // Level 6
    2200,  // Level 7
    3000,  // Level 8
    4000,  // Level 9
    5500,  // Level 10
  ];
  
  let level = 1;
  let currentXP = xp;
  let requiredXP = levelThresholds[1];
  
  // Kullanıcının level'ini bul
  for (let i = 0; i < levelThresholds.length - 1; i++) {
    if (xp >= levelThresholds[i] && xp < levelThresholds[i + 1]) {
      level = i + 1;
      currentXP = xp - levelThresholds[i];
      requiredXP = levelThresholds[i + 1] - levelThresholds[i];
      break;
    }
  }
  
  // Max level kontrolü
  if (xp >= levelThresholds[levelThresholds.length - 1]) {
    level = levelThresholds.length;
    currentXP = xp - levelThresholds[levelThresholds.length - 1];
    requiredXP = 1000; // Max level sonrası her 1000 XP'de bir "level"
  }
  
  const progress = (currentXP / requiredXP) * 100;
  
  return { level, currentXP, requiredXP, progress };
};

// Badge System Functions
export const checkAndAwardBadges = async (userId: string, currentXP: number): Promise<UserBadge[]> => {
  try {
    console.log(`🏆 Badge kontrolü - User: ${userId}, XP: ${currentXP}`);
    
    // Kullanıcının mevcut rozetlerini al
    const userBadgesRef = collection(db, 'userBadges');
    const userBadgesQuery = query(userBadgesRef, where('userId', '==', userId));
    const userBadgesSnapshot = await getDocs(userBadgesQuery);
    
    const existingBadges = userBadgesSnapshot.docs.map(doc => doc.data().badgeId);
    console.log('🎯 Mevcut rozetler:', existingBadges);
    
    const newBadges: UserBadge[] = [];
    
    // Welcome rozetini kontrol et (ilk giriş)
    if (!existingBadges.includes('welcome')) {
      const welcomeBadge: UserBadge = {
        userId,
        badgeId: 'welcome',
        earnedAt: new Date(),
        isNew: true
      };
      
      await addDoc(userBadgesRef, welcomeBadge);
      newBadges.push(welcomeBadge);
      console.log('🎉 Welcome rozeti verildi!');
    }
    
    // XP bazlı rozetleri kontrol et
    const xpBadges = BADGE_DEFINITIONS.filter(badge => badge.type === 'xp');
    
    for (const badge of xpBadges) {
      if (currentXP >= badge.xpRequired && !existingBadges.includes(badge.id)) {
        const userBadge: UserBadge = {
          userId,
          badgeId: badge.id,
          earnedAt: new Date(),
          isNew: true
        };
        
        await addDoc(userBadgesRef, userBadge);
        newBadges.push(userBadge);
        console.log(`🎉 ${badge.name} rozeti verildi! (${badge.xpRequired} XP)`);
      }
    }
    
    return newBadges;
  } catch (error) {
    console.error('❌ Badge kontrolü hatası:', error);
    return [];
  }
};

export const getUserBadgesNew = async (userId: string): Promise<UserBadge[]> => {
  try {
    const userBadgesRef = collection(db, 'userBadges');
    const userBadgesQuery = query(
      userBadgesRef, 
      where('userId', '==', userId),
      orderBy('earnedAt', 'desc')
    );
    
    const snapshot = await getDocs(userBadgesQuery);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      earnedAt: doc.data().earnedAt.toDate()
    })) as UserBadge[];
  } catch (error) {
    console.error('❌ Kullanıcı rozetleri alınamadı:', error);
    return [];
  }
};

export const getBadgeProgress = async (userId: string, currentXP: number): Promise<BadgeProgress> => {
  try {
    // Kullanıcının mevcut rozetlerini al
    const userBadges = await getUserBadgesNew(userId);
    const earnedBadgeIds = userBadges.map(badge => badge.badgeId);
    
    // Bir sonraki rozeti bul
    const nextBadge = BADGE_DEFINITIONS
      .filter(badge => badge.type === 'xp' && !earnedBadgeIds.includes(badge.id))
      .sort((a, b) => a.xpRequired - b.xpRequired)[0];
    
    let progressPercentage = 100;
    
    if (nextBadge) {
      // Bir önceki rozet seviyesini bul
      const previousBadge = BADGE_DEFINITIONS
        .filter(badge => badge.type === 'xp' && badge.xpRequired < nextBadge.xpRequired)
        .sort((a, b) => b.xpRequired - a.xpRequired)[0];
      
      const previousXP = previousBadge ? previousBadge.xpRequired : 0;
      const nextXP = nextBadge.xpRequired;
      
      progressPercentage = Math.min(100, ((currentXP - previousXP) / (nextXP - previousXP)) * 100);
    }
    
    return {
      userId,
      currentXP,
      nextBadge,
      progressPercentage
    };
  } catch (error) {
    console.error('❌ Badge progress hesaplanamadı:', error);
    return {
      userId,
      currentXP,
      nextBadge: null,
      progressPercentage: 100
    };
  }
};

export const markBadgeAsViewed = async (userId: string, badgeId: string): Promise<void> => {
  try {
    const userBadgesRef = collection(db, 'userBadges');
    const userBadgesQuery = query(
      userBadgesRef,
      where('userId', '==', userId),
      where('badgeId', '==', badgeId)
    );
    
    const snapshot = await getDocs(userBadgesQuery);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      await updateDoc(doc.ref, { isNew: false });
      console.log(`✅ ${badgeId} rozeti görüldü olarak işaretlendi`);
    }
  } catch (error) {
    console.error('❌ Rozet güncelleme hatası:', error);
  }
};

export const getBadgeById = (badgeId: string): Badge | null => {
  return BADGE_DEFINITIONS.find(badge => badge.id === badgeId) || null;
};

// Helper function to get user XP
export const getUserXP = async (userId: string): Promise<number> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data().totalXP || 0;
    }
    
    return 0;
  } catch (error) {
    console.error('❌ Kullanıcı XP alınamadı:', error);
    return 0;
  }
}; 