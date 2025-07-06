import { call, put } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { ACTION_TYPES } from '../types';
import { 
  createPrediction, 
  getActivePredictions, 
  createVote, 
  resolvePrediction,
  checkAndResolveExpiredPredictions
} from '../../services/firebase';
import {
  fetchPredictionsSuccess,
  fetchPredictionsFailure,
  createPredictionSuccess,
  createPredictionFailure,
  votePredictionSuccess,
  votePredictionFailure,
  resolvePredictionSuccess,
  resolvePredictionFailure,
  fetchLeaderboardRequest,
  fetchUserResolvedPredictionsRequest
} from '../actions';
import { getSagaProvider, getContract } from '../../lib/sagaProvider';
import { MarketPredictionABI, getContractAddress } from '../../lib/contractABI';

// Worker Saga: Fetch Predictions (Blockchain + Firebase)
export function* fetchPredictionsWorker(): Generator<any, void, any> {
  try {
    console.log('🔄 Saga: Tahminler yükleniyor...');
    
    // Firebase'den tahminleri al
    const firebasePredictions = yield call(getActivePredictions as any);
    
    // Blockchain'den de veri çekmeyi dene
    try {
      console.log('🔗 Saga: Blockchain verisi kontrol ediliyor...');
      
      // Web3 provider'ı al
      const provider = yield call(getSagaProvider as any);
      
      // Contract address'i al
      const contractAddress = getContractAddress('MarketPrediction');
      
      if (contractAddress && provider) {
        console.log('✅ Saga: Blockchain connection hazır');
        console.log('🔗 Saga: Contract Address:', contractAddress);
        
        // Contract instance oluştur
        const contract = yield call(getContract as any, contractAddress, MarketPredictionABI, false);
        
        // Blockchain'den tahminleri çek
        try {
          console.log('🔗 Saga: Blockchain tahminleri çekiliyor...');
          const blockchainPredictions = yield call([contract, 'getAllPredictions'] as any);
          console.log('✅ Saga: Blockchain tahminleri alındı:', blockchainPredictions.length);
          
          // Blockchain ve Firebase verilerini birleştir/karşılaştır
          // Şimdilik Firebase'i kullan ama blockchain veri var
          yield put(fetchPredictionsSuccess(firebasePredictions));
          console.log('🔗 Saga: Blockchain + Firebase data sync tamamlandı');
        } catch (contractError) {
          console.log('⚠️ Saga: Contract call failed, Firebase kullanılıyor:', contractError);
          yield put(fetchPredictionsSuccess(firebasePredictions));
        }
      } else {
        console.log('⚠️ Saga: Contract address not found, Firebase kullanılıyor');
        yield put(fetchPredictionsSuccess(firebasePredictions));
      }
      
    } catch (blockchainError) {
      console.log('⚠️ Saga: Blockchain error, Firebase fallback:', blockchainError);
      // Blockchain hatası durumunda Firebase'i kullan
      yield put(fetchPredictionsSuccess(firebasePredictions));
    }
    
    console.log('✅ Saga: Tahminler başarıyla yüklendi');
  } catch (error: any) {
    console.error('❌ Saga: Tahmin yükleme hatası:', error);
    yield put(fetchPredictionsFailure(error.message || 'Tahminler yüklenemedi'));
  }
}

// Worker Saga: Create Prediction (Blockchain + Firebase)
export function* createPredictionWorker(action: PayloadAction<{
  creatorId: string;
  question: string;
  description?: string;
  endDate: Date;
}>): Generator<any, void, any> {
  try {
    console.log('🔄 Saga: Tahmin oluşturuluyor...', action.payload);
    
    const predictionData = {
      creatorId: action.payload.creatorId,
      question: action.payload.question,
      description: action.payload.description,
      endDate: action.payload.endDate,
      status: 'active' as const,
      result: null,
      correctAnswer: null
    };

    // Firebase'e kaydet
    const predictionId = yield call(createPrediction as any, predictionData);
    
    // Blockchain'e de kaydetmeyi dene
    try {
      console.log('🔗 Saga: Blockchain\'e tahmin kaydediliyor...');
      
      const provider = yield call(getSagaProvider as any);
      const contractAddress = getContractAddress('MarketPrediction');
      
      if (contractAddress && provider) {
        console.log('✅ Saga: Blockchain transaction hazır');
        console.log('🔗 Saga: Contract Address:', contractAddress);
        
        // Contract instance oluştur (signer ile)
        const contract = yield call(getContract as any, contractAddress, MarketPredictionABI, true);
        
        // Blockchain'e tahmin oluştur
        const endDateTimestamp = Math.floor(action.payload.endDate.getTime() / 1000);
        const tx = yield call(
          [contract, 'createPrediction'] as any,
          action.payload.question,
          action.payload.description || '',
          endDateTimestamp
        );
        
        console.log('⏳ Saga: Blockchain transaction gönderildi:', tx.hash);
        const receipt = yield call([tx, 'wait'] as any);
        console.log('✅ Saga: Blockchain transaction tamamlandı:', receipt.transactionHash);
        
        console.log('🔗 Saga: Prediction ID (Firebase):', predictionId);
        console.log('🔗 Saga: Prediction ID (Blockchain):', receipt.transactionHash);
      }
      
    } catch (blockchainError) {
      console.log('⚠️ Saga: Blockchain error, Firebase kaydı korundu:', blockchainError);
      // Blockchain hatası olsa bile Firebase kaydı yapıldı
    }
    
    yield put(createPredictionSuccess(predictionId));
    console.log('✅ Saga: Tahmin başarıyla oluşturuldu:', predictionId);
    
  } catch (error: any) {
    console.error('❌ Saga: Tahmin oluşturma hatası:', error);
    yield put(createPredictionFailure(error.message || 'Tahmin oluşturulamadı'));
  }
}

// Worker Saga: Vote Prediction (Blockchain + Firebase)
export function* votePredictionWorker(action: PayloadAction<{
  userId: string;
  predictionId: string;
  choice: 'yes' | 'no';
}>): Generator<any, void, any> {
  try {
    console.log('🔄 Saga: Oy veriliyor...', action.payload);
    
    const voteData = {
      userId: action.payload.userId,
      predictionId: action.payload.predictionId,
      choice: action.payload.choice
    };

    // Firebase'e kaydet
    const voteId = yield call(createVote as any, voteData);
    
    // Blockchain'e de kaydetmeyi dene
    try {
      console.log('🔗 Saga: Blockchain\'e oy kaydediliyor...');
      
      const provider = yield call(getSagaProvider as any);
      const contractAddress = getContractAddress('MarketPrediction');
      
      if (contractAddress && provider) {
        console.log('✅ Saga: Blockchain vote transaction hazır');
        console.log('🔗 Saga: Contract Address:', contractAddress);
        
        // Contract instance oluştur (signer ile)
        const contract = yield call(getContract as any, contractAddress, MarketPredictionABI, true);
        
        // Blockchain'e oy ver
        const voteChoice = action.payload.choice === 'yes'; // boolean'a çevir
        const tx = yield call(
          [contract, 'vote'] as any,
          action.payload.predictionId,
          voteChoice
        );
        
        console.log('⏳ Saga: Blockchain vote transaction gönderildi:', tx.hash);
        const receipt = yield call([tx, 'wait'] as any);
        console.log('✅ Saga: Blockchain vote transaction tamamlandı:', receipt.transactionHash);
        
        console.log('🔗 Saga: Vote ID (Firebase):', voteId);
        console.log('🔗 Saga: Vote ID (Blockchain):', receipt.transactionHash);
      }
      
    } catch (blockchainError) {
      console.log('⚠️ Saga: Blockchain error, Firebase vote korundu:', blockchainError);
      // Blockchain hatası olsa bile Firebase vote yapıldı
    }
    
    yield put(votePredictionSuccess(voteId));
    console.log('✅ Saga: Oy başarıyla verildi:', voteId);
    
  } catch (error: any) {
    console.error('❌ Saga: Oy verme hatası:', error);
    yield put(votePredictionFailure(error.message || 'Oy verilemedi'));
  }
}

// Worker Saga: Resolve Prediction (Admin)
export function* resolvePredictionWorker(action: PayloadAction<{
  predictionId: string;
  result: 'yes' | 'no';
}>): Generator<any, void, any> {
  try {
    console.log('🔄 Saga: Tahmin sonuçlandırılıyor...', action.payload);
    
    // Firebase'de sonuçlandır
    yield call(resolvePrediction as any, action.payload.predictionId, action.payload.result);
    
    // Blockchain'de de sonuçlandır
    try {
      console.log('🔗 Saga: Blockchain\'de tahmin sonuçlandırılıyor...');
      
      const provider = yield call(getSagaProvider as any);
      const contractAddress = getContractAddress('MarketPrediction');
      
      if (contractAddress && provider) {
        console.log('✅ Saga: Blockchain resolve transaction hazır');
        
        // Contract instance oluştur (signer ile)
        const contract = yield call(getContract as any, contractAddress, MarketPredictionABI, true);
        
        // Blockchain'de sonuçlandır
        const result = action.payload.result === 'yes'; // boolean'a çevir
        const tx = yield call(
          [contract, 'resolvePrediction'] as any,
          action.payload.predictionId,
          result
        );
        
        console.log('⏳ Saga: Blockchain resolve transaction gönderildi:', tx.hash);
        const receipt = yield call([tx, 'wait'] as any);
        console.log('✅ Saga: Blockchain resolve transaction tamamlandı:', receipt.transactionHash);
      }
      
    } catch (blockchainError) {
      console.log('⚠️ Saga: Blockchain error, Firebase resolve korundu:', blockchainError);
    }
    
    yield put(resolvePredictionSuccess(action.payload.predictionId));
    console.log('✅ Saga: Tahmin başarıyla sonuçlandırıldı');
    
  } catch (error: any) {
    console.error('❌ Saga: Tahmin sonuçlandırma hatası:', error);
    yield put(resolvePredictionFailure(error.message || 'Tahmin sonuçlandırılamadı'));
  }
}

// Worker Saga: Auto Resolve Expired Predictions
export function* autoResolvePredictionsWorker(): Generator<any, void, any> {
  try {
    console.log('🔄 Saga: Süresi dolmuş tahminler kontrol ediliyor...');
    
    yield call(checkAndResolveExpiredPredictions as any);
    
    console.log('✅ Saga: Otomatik sonuçlandırma tamamlandı');
  } catch (error: any) {
    console.error('❌ Saga: Otomatik sonuçlandırma hatası:', error);
  }
}

// Export saga workers for manual execution
export const predictionSagaWorkers = {
  fetchPredictionsWorker,
  createPredictionWorker,
  votePredictionWorker,
  resolvePredictionWorker,
  autoResolvePredictionsWorker
}; 