import { call, take, fork } from 'redux-saga/effects';
import { userSagaWorkers } from './userSaga';
import { leaderboardSagaWorkers } from './leaderboardSaga';
import { predictionSagaWorkers } from './predictionSaga';
import { ACTION_TYPES } from '../types';

// Action watcher - manuel takeEvery implementasyonu
function* watchActions(): Generator<any, void, any> {
  console.log('🔄 Saga: Action watcher başlatıldı');
  
  while (true) {
    try {
      // Her türlü action'ı yakalayacak
      const action = yield take('*');
      console.log('📡 Saga: Action yakalandı:', action.type);
      
      // Action'a göre saga worker'ları çal
      switch (action.type) {
        case ACTION_TYPES.FETCH_PREDICTIONS_REQUEST:
          console.log('🔄 Saga: fetchPredictionsRequest işleniyor...');
          yield call(predictionSagaWorkers.fetchPredictionsWorker as any);
          break;
          
        case ACTION_TYPES.FETCH_LEADERBOARD_REQUEST:
          console.log('🔄 Saga: fetchLeaderboardRequest işleniyor...');
          yield call(leaderboardSagaWorkers.fetchLeaderboardSaga as any, action);
          break;
          
        case ACTION_TYPES.CREATE_PREDICTION_REQUEST:
          console.log('🔄 Saga: createPredictionRequest işleniyor...');
          yield call(predictionSagaWorkers.createPredictionWorker as any, action);
          break;
          
        case ACTION_TYPES.VOTE_PREDICTION_REQUEST:
          console.log('🔄 Saga: votePredictionRequest işleniyor...');
          yield call(predictionSagaWorkers.votePredictionWorker as any, action);
          break;
          
        case ACTION_TYPES.FETCH_USER_REQUEST:
          console.log('🔄 Saga: fetchUserRequest işleniyor...');
          yield call(userSagaWorkers.fetchUserSaga as any, action);
          break;
          
        case ACTION_TYPES.CREATE_USER_REQUEST:
          console.log('🔄 Saga: createUserRequest işleniyor...');
          yield call(userSagaWorkers.createUserSaga as any, action);
          break;
          
        default:
          // Diğer action'ları logla
          if (action.type.includes('REQUEST')) {
            console.log('⚠️ Saga: Yakalanmayan REQUEST action:', action.type);
          }
          break;
      }
      
    } catch (error) {
      console.error('❌ Saga: Action watcher hatası:', error);
    }
  }
}

// Background task runner
function* backgroundTasks(): Generator<any, void, any> {
  console.log('🔄 Saga: Background tasks başlatıldı');
  
  while (true) {
    try {
      // Her 60 saniyede bir otomatik işlemler (daha az sıklıkta)
      for (let i = 0; i < 60; i++) {
        yield; // 1 saniye bekle
      }
      
      console.log('🔄 Saga: Background task çalışıyor...');
      // Süresi dolmuş tahminleri kontrol et
      yield call(predictionSagaWorkers.autoResolvePredictionsWorker as any);
      
    } catch (error) {
      console.error('❌ Saga: Background task hatası:', error);
    }
  }
}

// Root saga that combines all sagas
export function* rootSaga(): Generator<any, void, any> {
  console.log('🚀 Root Saga başlatıldı');
  
  try {
    // Saga'ları paralel olarak çalıştır
    yield fork(watchActions);
    yield fork(backgroundTasks);
    
    console.log('✅ Saga: Tüm saga worker\'lar hazır');
    
  } catch (error) {
    console.error('❌ Saga: Root saga hatası:', error);
  }
}

// Export all saga workers for manual execution
export const allSagaWorkers = {
  ...userSagaWorkers,
  ...leaderboardSagaWorkers,
  ...predictionSagaWorkers
}; 