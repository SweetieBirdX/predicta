import { put, call } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { 
  fetchUserRequest, 
  fetchUserSuccess, 
  fetchUserFailure,
  createUserRequest,
  createUserSuccess,
  createUserFailure,
  fetchUserResolvedPredictionsRequest,
  fetchUserResolvedPredictionsSuccess,
  fetchUserResolvedPredictionsFailure
} from '../actions';
import { 
  getUser, 
  createUser, 
  getUserResolvedPredictions
} from '../../services/firebase';
import { User } from '../../types';

// User fetch saga
export function* fetchUserSaga(action: PayloadAction<string>) {
  try {
    const user: User | null = yield call(getUser as any, action.payload);
    if (user) {
      yield put(fetchUserSuccess(user));
    } else {
      yield put(fetchUserFailure('User not found'));
    }
  } catch (error) {
    yield put(fetchUserFailure(error instanceof Error ? error.message : 'Could not load user'));
  }
}

// User create saga
export function* createUserSaga(action: PayloadAction<Omit<User, 'id' | 'createdAt'>>) {
  try {
    const userId: string = yield call(createUser as any, action.payload);
    yield put(createUserSuccess(userId));
  } catch (error) {
    yield put(createUserFailure(error instanceof Error ? error.message : 'Could not create user'));
  }
}

// Resolved predictions fetch saga
export function* fetchUserResolvedPredictionsSaga(action: PayloadAction<string>) {
  try {
    const predictions: any[] = yield call(getUserResolvedPredictions as any, action.payload);
    yield put(fetchUserResolvedPredictionsSuccess(predictions));
  } catch (error) {
    yield put(fetchUserResolvedPredictionsFailure(error instanceof Error ? error.message : 'Could not load past predictions'));
  }
}

// Export saga workers for manual execution
export const userSagaWorkers = {
  fetchUserSaga,
  createUserSaga,
  fetchUserResolvedPredictionsSaga
}; 