import { call, put } from 'redux-saga/effects';
import { 
  getActivePredictions, 
  getLeaderboard, 
  checkAndResolveExpiredPredictions 
} from '../../services/firebase';
import {
  fetchPredictionsSuccess,
  fetchLeaderboardSuccess
} from '../actions';

// Simple background update saga - Manual execution
export function* backgroundUpdateSaga(): Generator<any, void, any> {
  try {
    console.log('🔄 Background: Otomatik güncelleme başlıyor...');
    
    // Tahminleri güncelle
    try {
      const predictions = yield call(getActivePredictions as any);
      yield put(fetchPredictionsSuccess(predictions));
    } catch (error) {
      console.error('❌ Background: Tahmin güncelleme hatası:', error);
    }
    
    // Leaderboard güncelle
    try {
      const leaderboard = yield call(getLeaderboard as any, 10);
      yield put(fetchLeaderboardSuccess(leaderboard));
    } catch (error) {
      console.error('❌ Background: Leaderboard güncelleme hatası:', error);
    }
    
    // Otomatik sonuçlandırma kontrol et
    try {
      yield call(checkAndResolveExpiredPredictions as any);
    } catch (error) {
      console.error('❌ Background: Otomatik sonuçlandırma hatası:', error);
    }
  } catch (error) {
    console.error('❌ Background saga hatası:', error);
  }
}

// Auto refresh leaderboard saga
export function* autoRefreshLeaderboard(): Generator<any, void, any> {
  try {
    const leaderboard = yield call(getLeaderboard as any, 10);
    yield put(fetchLeaderboardSuccess(leaderboard));
  } catch (error) {
    console.error('❌ Auto refresh leaderboard hatası:', error);
  }
}

// Export saga workers for manual execution
export const backgroundSagaWorkers = {
  backgroundUpdateSaga,
  autoRefreshLeaderboard
}; 