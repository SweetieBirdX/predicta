import { put, call } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { 
  fetchLeaderboardRequest,
  fetchLeaderboardSuccess, 
  fetchLeaderboardFailure
} from '../actions';
import { 
  getLeaderboard
} from '../../services/firebase';
import { LeaderboardEntry } from '../../types';

// Leaderboard fetch saga
export function* fetchLeaderboardSaga(action: PayloadAction<number | undefined>) {
  try {
    const limit = action.payload || 10;
    const leaderboard: LeaderboardEntry[] = yield call(getLeaderboard as any, limit);
    yield put(fetchLeaderboardSuccess(leaderboard));
  } catch (error) {
    yield put(fetchLeaderboardFailure(error instanceof Error ? error.message : 'Liderlik tablosu yüklenemedi'));
  }
}

// Export saga workers for manual execution
export const leaderboardSagaWorkers = {
  fetchLeaderboardSaga
}; 