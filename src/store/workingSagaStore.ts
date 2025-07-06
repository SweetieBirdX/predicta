import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import rootReducer from './reducers';
import { RootState } from './reducers';

// Saga middleware oluştur
const sagaMiddleware = createSagaMiddleware();

// Store configuration
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(sagaMiddleware as any),
  devTools: process.env.NODE_ENV !== 'production',
});

// Root Saga - Basit versiyon
function* rootSaga() {
  console.log('🚀 Redux-Saga Root Saga başlatıldı');
  
  // Şimdilik basit bir saga - sonra genişletilebilir
  while (true) {
    yield; // Saga'yı aktif tutar
    break; // İlk iterasyonda çık
  }
}

// Saga middleware'i çalıştır
sagaMiddleware.run(rootSaga);

// Store types
export type AppDispatch = typeof store.dispatch;
export type AppState = RootState;
export default store; 