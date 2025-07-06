import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers';
import { RootState } from './reducers';

// Basit store configuration (Redux-Saga olmadan)
export const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production',
});

// Store types
export type AppDispatch = typeof store.dispatch;
export type AppState = RootState;
export default store; 