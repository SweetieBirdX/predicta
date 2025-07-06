import { Prediction, User, Vote, LeaderboardEntry } from '../types';

// Action Types
export const ACTION_TYPES = {
  // Prediction Actions
  FETCH_PREDICTIONS_REQUEST: 'FETCH_PREDICTIONS_REQUEST',
  FETCH_PREDICTIONS_SUCCESS: 'FETCH_PREDICTIONS_SUCCESS',
  FETCH_PREDICTIONS_FAILURE: 'FETCH_PREDICTIONS_FAILURE',
  
  CREATE_PREDICTION_REQUEST: 'CREATE_PREDICTION_REQUEST',
  CREATE_PREDICTION_SUCCESS: 'CREATE_PREDICTION_SUCCESS',
  CREATE_PREDICTION_FAILURE: 'CREATE_PREDICTION_FAILURE',
  
  VOTE_PREDICTION_REQUEST: 'VOTE_PREDICTION_REQUEST',
  VOTE_PREDICTION_SUCCESS: 'VOTE_PREDICTION_SUCCESS',
  VOTE_PREDICTION_FAILURE: 'VOTE_PREDICTION_FAILURE',
  
  RESOLVE_PREDICTION_REQUEST: 'RESOLVE_PREDICTION_REQUEST',
  RESOLVE_PREDICTION_SUCCESS: 'RESOLVE_PREDICTION_SUCCESS',
  RESOLVE_PREDICTION_FAILURE: 'RESOLVE_PREDICTION_FAILURE',
  
  // Leaderboard Actions
  FETCH_LEADERBOARD_REQUEST: 'FETCH_LEADERBOARD_REQUEST',
  FETCH_LEADERBOARD_SUCCESS: 'FETCH_LEADERBOARD_SUCCESS',
  FETCH_LEADERBOARD_FAILURE: 'FETCH_LEADERBOARD_FAILURE',
  
  // User Actions
  FETCH_USER_REQUEST: 'FETCH_USER_REQUEST',
  FETCH_USER_SUCCESS: 'FETCH_USER_SUCCESS',
  FETCH_USER_FAILURE: 'FETCH_USER_FAILURE',
  
  CREATE_USER_REQUEST: 'CREATE_USER_REQUEST',
  CREATE_USER_SUCCESS: 'CREATE_USER_SUCCESS',
  CREATE_USER_FAILURE: 'CREATE_USER_FAILURE',
  
  FETCH_USER_RESOLVED_PREDICTIONS_REQUEST: 'FETCH_USER_RESOLVED_PREDICTIONS_REQUEST',
  FETCH_USER_RESOLVED_PREDICTIONS_SUCCESS: 'FETCH_USER_RESOLVED_PREDICTIONS_SUCCESS',
  FETCH_USER_RESOLVED_PREDICTIONS_FAILURE: 'FETCH_USER_RESOLVED_PREDICTIONS_FAILURE',
  
  // Background Tasks
  START_BACKGROUND_TASKS: 'START_BACKGROUND_TASKS',
  STOP_BACKGROUND_TASKS: 'STOP_BACKGROUND_TASKS',
  AUTO_RESOLVE_PREDICTIONS: 'AUTO_RESOLVE_PREDICTIONS',
  
  // Loading States
  SET_LOADING: 'SET_LOADING',
  CLEAR_LOADING: 'CLEAR_LOADING',
  
  // Error Handling
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Auth
  SET_CURRENT_USER: 'SET_CURRENT_USER',
  CLEAR_CURRENT_USER: 'CLEAR_CURRENT_USER',
} as const;

// Action Interfaces
export interface BaseAction {
  type: string;
}

export interface FetchPredictionsRequest extends BaseAction {
  type: typeof ACTION_TYPES.FETCH_PREDICTIONS_REQUEST;
}

export interface FetchPredictionsSuccess extends BaseAction {
  type: typeof ACTION_TYPES.FETCH_PREDICTIONS_SUCCESS;
  payload: Prediction[];
}

export interface FetchPredictionsFailure extends BaseAction {
  type: typeof ACTION_TYPES.FETCH_PREDICTIONS_FAILURE;
  payload: string;
}

export interface CreatePredictionRequest extends BaseAction {
  type: typeof ACTION_TYPES.CREATE_PREDICTION_REQUEST;
  payload: {
    creatorId: string;
    question: string;
    description?: string;
    endDate: Date;
  };
}

export interface CreatePredictionSuccess extends BaseAction {
  type: typeof ACTION_TYPES.CREATE_PREDICTION_SUCCESS;
  payload: string; // prediction ID
}

export interface VotePredictionRequest extends BaseAction {
  type: typeof ACTION_TYPES.VOTE_PREDICTION_REQUEST;
  payload: {
    userId: string;
    predictionId: string;
    choice: 'yes' | 'no';
  };
}

export interface VotePredictionSuccess extends BaseAction {
  type: typeof ACTION_TYPES.VOTE_PREDICTION_SUCCESS;
  payload: string; // vote ID
}

export interface ResolvePredictionRequest extends BaseAction {
  type: typeof ACTION_TYPES.RESOLVE_PREDICTION_REQUEST;
  payload: {
    predictionId: string;
    result: 'yes' | 'no';
  };
}

export interface FetchLeaderboardRequest extends BaseAction {
  type: typeof ACTION_TYPES.FETCH_LEADERBOARD_REQUEST;
  payload?: number; // limit
}

export interface FetchLeaderboardSuccess extends BaseAction {
  type: typeof ACTION_TYPES.FETCH_LEADERBOARD_SUCCESS;
  payload: LeaderboardEntry[];
}

export interface SetCurrentUser extends BaseAction {
  type: typeof ACTION_TYPES.SET_CURRENT_USER;
  payload: string; // user ID
}

export interface SetLoading extends BaseAction {
  type: typeof ACTION_TYPES.SET_LOADING;
  payload: string; // loading key
}

export interface SetError extends BaseAction {
  type: typeof ACTION_TYPES.SET_ERROR;
  payload: {
    key: string;
    error: string;
  };
}

// Union type for all actions
export type AppAction = 
  | FetchPredictionsRequest
  | FetchPredictionsSuccess
  | FetchPredictionsFailure
  | CreatePredictionRequest
  | CreatePredictionSuccess
  | VotePredictionRequest
  | VotePredictionSuccess
  | ResolvePredictionRequest
  | FetchLeaderboardRequest
  | FetchLeaderboardSuccess
  | SetCurrentUser
  | SetLoading
  | SetError
  | BaseAction;

// State Interfaces
export interface PredictionState {
  predictions: Prediction[];
  loading: boolean;
  error: string | null;
}

export interface LeaderboardState {
  leaderboard: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

export interface UserState {
  currentUserId: string | null;
  currentUser: User | null;
  resolvedPredictions: any[];
  loading: boolean;
  error: string | null;
}

export interface AppState {
  predictions: PredictionState;
  leaderboard: LeaderboardState;
  user: UserState;
  loading: { [key: string]: boolean };
  errors: { [key: string]: string };
} 