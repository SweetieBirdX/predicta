import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import rootReducer from './reducers';
import { RootState } from './reducers';
import { rootSaga } from './sagas/rootSaga';

// Saga middleware oluştur
const sagaMiddleware = createSagaMiddleware();

// Middleware array approach (tip sorununu çözmek için)
const middleware: any[] = [sagaMiddleware];

// Store configuration - Tip sorununu çözen versiyon
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => {
    // Default middleware'leri al ama thunk'ı çıkar
    const defaults = getDefaultMiddleware({
      thunk: false,
      serializableCheck: false, // Saga için devre dışı
    });
    
    // Saga middleware'i as any ile ekle (tip sorunu için)
    return defaults.concat(sagaMiddleware as any);
  },
  devTools: process.env.NODE_ENV !== 'production',
});

// Saga'yı çalıştır - Asıl root saga logic'i ile
try {
  sagaMiddleware.run(rootSaga);
  console.log('🚀 Redux-Saga Fixed Store başlatıldı!');
  console.log('✅ Middleware sorunları çözüldü');
} catch (error) {
  console.error('❌ Saga çalıştırma hatası:', error);
}

// Store types
export type AppDispatch = typeof store.dispatch;
export type AppState = RootState;

export default store; 