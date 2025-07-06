import { ACTION_TYPES } from './types';

// Prediction Actions
export const fetchPredictionsRequest = () => ({
  type: ACTION_TYPES.FETCH_PREDICTIONS_REQUEST,
});

export const fetchPredictionsSuccess = (predictions: any[]) => ({
  type: ACTION_TYPES.FETCH_PREDICTIONS_SUCCESS,
  payload: predictions,
});

export const fetchPredictionsFailure = (error: string) => ({
  type: ACTION_TYPES.FETCH_PREDICTIONS_FAILURE,
  payload: error,
});

export const createPredictionRequest = (data: {
  creatorId: string;
  question: string;
  description?: string;
  endDate: Date;
}) => ({
  type: ACTION_TYPES.CREATE_PREDICTION_REQUEST,
  payload: data,
});

export const createPredictionSuccess = (predictionId: string) => ({
  type: ACTION_TYPES.CREATE_PREDICTION_SUCCESS,
  payload: predictionId,
});

export const createPredictionFailure = (error: string) => ({
  type: ACTION_TYPES.CREATE_PREDICTION_FAILURE,
  payload: error,
});

export const votePredictionRequest = (data: {
  userId: string;
  predictionId: string;
  choice: 'yes' | 'no';
}) => ({
  type: ACTION_TYPES.VOTE_PREDICTION_REQUEST,
  payload: data,
});

export const votePredictionSuccess = (voteId: string) => ({
  type: ACTION_TYPES.VOTE_PREDICTION_SUCCESS,
  payload: voteId,
});

export const votePredictionFailure = (error: string) => ({
  type: ACTION_TYPES.VOTE_PREDICTION_FAILURE,
  payload: error,
});

export const resolvePredictionRequest = (data: {
  predictionId: string;
  result: 'yes' | 'no';
}) => ({
  type: ACTION_TYPES.RESOLVE_PREDICTION_REQUEST,
  payload: data,
});

export const resolvePredictionSuccess = (predictionId: string) => ({
  type: ACTION_TYPES.RESOLVE_PREDICTION_SUCCESS,
  payload: predictionId,
});

export const resolvePredictionFailure = (error: string) => ({
  type: ACTION_TYPES.RESOLVE_PREDICTION_FAILURE,
  payload: error,
});

// Leaderboard Actions
export const fetchLeaderboardRequest = (limit?: number) => ({
  type: ACTION_TYPES.FETCH_LEADERBOARD_REQUEST,
  payload: limit,
});

export const fetchLeaderboardSuccess = (leaderboard: any[]) => ({
  type: ACTION_TYPES.FETCH_LEADERBOARD_SUCCESS,
  payload: leaderboard,
});

export const fetchLeaderboardFailure = (error: string) => ({
  type: ACTION_TYPES.FETCH_LEADERBOARD_FAILURE,
  payload: error,
});

// User Actions
export const fetchUserRequest = (userId: string) => ({
  type: ACTION_TYPES.FETCH_USER_REQUEST,
  payload: userId,
});

export const fetchUserSuccess = (user: any) => ({
  type: ACTION_TYPES.FETCH_USER_SUCCESS,
  payload: user,
});

export const fetchUserFailure = (error: string) => ({
  type: ACTION_TYPES.FETCH_USER_FAILURE,
  payload: error,
});

export const createUserRequest = (userData: any) => ({
  type: ACTION_TYPES.CREATE_USER_REQUEST,
  payload: userData,
});

export const createUserSuccess = (userId: string) => ({
  type: ACTION_TYPES.CREATE_USER_SUCCESS,
  payload: userId,
});

export const createUserFailure = (error: string) => ({
  type: ACTION_TYPES.CREATE_USER_FAILURE,
  payload: error,
});

export const fetchUserResolvedPredictionsRequest = (userId: string) => ({
  type: ACTION_TYPES.FETCH_USER_RESOLVED_PREDICTIONS_REQUEST,
  payload: userId,
});

export const fetchUserResolvedPredictionsSuccess = (predictions: any[]) => ({
  type: ACTION_TYPES.FETCH_USER_RESOLVED_PREDICTIONS_SUCCESS,
  payload: predictions,
});

export const fetchUserResolvedPredictionsFailure = (error: string) => ({
  type: ACTION_TYPES.FETCH_USER_RESOLVED_PREDICTIONS_FAILURE,
  payload: error,
});

// Background Tasks
export const startBackgroundTasks = () => ({
  type: ACTION_TYPES.START_BACKGROUND_TASKS,
});

export const stopBackgroundTasks = () => ({
  type: ACTION_TYPES.STOP_BACKGROUND_TASKS,
});

export const autoResolvePredictions = () => ({
  type: ACTION_TYPES.AUTO_RESOLVE_PREDICTIONS,
});

// Auth Actions
export const setCurrentUser = (userId: string) => ({
  type: ACTION_TYPES.SET_CURRENT_USER,
  payload: userId,
});

export const clearCurrentUser = () => ({
  type: ACTION_TYPES.CLEAR_CURRENT_USER,
});

// Loading Actions
export const setLoading = (key: string) => ({
  type: ACTION_TYPES.SET_LOADING,
  payload: key,
});

export const clearLoading = (key: string) => ({
  type: ACTION_TYPES.CLEAR_LOADING,
  payload: key,
});

// Error Actions
export const setError = (key: string, error: string) => ({
  type: ACTION_TYPES.SET_ERROR,
  payload: { key, error },
});

export const clearError = (key: string) => ({
  type: ACTION_TYPES.CLEAR_ERROR,
  payload: key,
}); 