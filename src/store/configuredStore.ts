import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import rootReducer from './reducers';
import { RootState } from './reducers';

// Saga middleware oluştur
const sagaMiddleware = createSagaMiddleware();

// Store configuration - Redux Toolkit + Saga uyumlu
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false, // Redux-Saga kullanıyoruz, thunk'ı devre dışı bırak
      serializableCheck: {
        // Redux-Saga için bazı action'ları yoksay
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          '@@saga/SAGA_ACTION',
        ],
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['items.dates'],
      },
    }).concat(sagaMiddleware as any), // Saga middleware'i ekle

  devTools: process.env.NODE_ENV !== 'production',
});

// Basit Root Saga (şimdilik)
function* rootSaga() {
  console.log('🚀 Redux-Saga başlatıldı!');
  console.log('✅ Saga middleware çalışıyor');
  
  // Generator fonksiyonu olarak çalışır
  try {
    yield; // Saga'yı aktif tutar
  } catch (error) {
    console.error('❌ Root Saga hatası:', error);
  }
}

// Saga'yı başlat
sagaMiddleware.run(rootSaga);

// Store types
export type AppDispatch = typeof store.dispatch;
export type AppState = RootState;

// Default export
export default store; 