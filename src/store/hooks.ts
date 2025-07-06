import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { AppDispatch, AppState } from './fixedStore';

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;

// Selector helpers
export const selectPredictions = (state: AppState) => state.predictions.predictions;
export const selectPredictionsLoading = (state: AppState) => state.predictions.loading;
export const selectPredictionsError = (state: AppState) => state.predictions.error;

export const selectLeaderboard = (state: AppState) => state.leaderboard.leaderboard;
export const selectLeaderboardLoading = (state: AppState) => state.leaderboard.loading;
export const selectLeaderboardError = (state: AppState) => state.leaderboard.error;
export const selectLeaderboardLastUpdate = (state: AppState) => state.leaderboard.lastUpdate;

export const selectCurrentUserId = (state: AppState) => state.user.currentUserId;
export const selectCurrentUser = (state: AppState) => state.user.currentUser;
export const selectUserResolvedPredictions = (state: AppState) => state.user.resolvedPredictions;
export const selectUserLoading = (state: AppState) => state.user.loading;
export const selectUserError = (state: AppState) => state.user.error;

export const selectLoading = (key: string) => (state: AppState) => state.loading[key] || false;
export const selectError = (key: string) => (state: AppState) => state.errors[key] || ''; 