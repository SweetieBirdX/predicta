import { combineReducers } from 'redux';
import { ACTION_TYPES, AppState, PredictionState, LeaderboardState, UserState } from './types';

// Prediction Reducer
const initialPredictionState: PredictionState = {
  predictions: [],
  loading: false,
  error: null,
};

const predictionReducer = (state = initialPredictionState, action: any): PredictionState => {
  switch (action.type) {
    case ACTION_TYPES.FETCH_PREDICTIONS_REQUEST:
    case ACTION_TYPES.CREATE_PREDICTION_REQUEST:
    case ACTION_TYPES.VOTE_PREDICTION_REQUEST:
    case ACTION_TYPES.RESOLVE_PREDICTION_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case ACTION_TYPES.FETCH_PREDICTIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        predictions: action.payload,
        error: null,
      };

    case ACTION_TYPES.CREATE_PREDICTION_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
      };

    case ACTION_TYPES.VOTE_PREDICTION_SUCCESS:
    case ACTION_TYPES.RESOLVE_PREDICTION_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
      };

    case ACTION_TYPES.FETCH_PREDICTIONS_FAILURE:
    case ACTION_TYPES.CREATE_PREDICTION_FAILURE:
    case ACTION_TYPES.VOTE_PREDICTION_FAILURE:
    case ACTION_TYPES.RESOLVE_PREDICTION_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

// Leaderboard Reducer
const initialLeaderboardState: LeaderboardState = {
  leaderboard: [],
  loading: false,
  error: null,
  lastUpdate: null,
};

const leaderboardReducer = (state = initialLeaderboardState, action: any): LeaderboardState => {
  switch (action.type) {
    case ACTION_TYPES.FETCH_LEADERBOARD_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case ACTION_TYPES.FETCH_LEADERBOARD_SUCCESS:
      return {
        ...state,
        loading: false,
        leaderboard: action.payload,
        error: null,
        lastUpdate: new Date(),
      };

    case ACTION_TYPES.FETCH_LEADERBOARD_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

// User Reducer
const initialUserState: UserState = {
  currentUserId: null,
  currentUser: null,
  resolvedPredictions: [],
  loading: false,
  error: null,
};

const userReducer = (state = initialUserState, action: any): UserState => {
  switch (action.type) {
    case ACTION_TYPES.SET_CURRENT_USER:
      return {
        ...state,
        currentUserId: action.payload,
      };

    case ACTION_TYPES.CLEAR_CURRENT_USER:
      return {
        ...state,
        currentUserId: null,
        currentUser: null,
        resolvedPredictions: [],
      };

    case ACTION_TYPES.FETCH_USER_REQUEST:
    case ACTION_TYPES.CREATE_USER_REQUEST:
    case ACTION_TYPES.FETCH_USER_RESOLVED_PREDICTIONS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case ACTION_TYPES.FETCH_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        currentUser: action.payload,
        error: null,
      };

    case ACTION_TYPES.CREATE_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        currentUserId: action.payload,
        error: null,
      };

    case ACTION_TYPES.FETCH_USER_RESOLVED_PREDICTIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        resolvedPredictions: action.payload,
        error: null,
      };

    case ACTION_TYPES.FETCH_USER_FAILURE:
    case ACTION_TYPES.CREATE_USER_FAILURE:
    case ACTION_TYPES.FETCH_USER_RESOLVED_PREDICTIONS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

// Loading Reducer
const initialLoadingState: { [key: string]: boolean } = {};

const loadingReducer = (state = initialLoadingState, action: any): { [key: string]: boolean } => {
  switch (action.type) {
    case ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        [action.payload]: true,
      };

    case ACTION_TYPES.CLEAR_LOADING:
      return {
        ...state,
        [action.payload]: false,
      };

    default:
      return state;
  }
};

// Error Reducer
const initialErrorState: { [key: string]: string } = {};

const errorReducer = (state = initialErrorState, action: any): { [key: string]: string } => {
  switch (action.type) {
    case ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        [action.payload.key]: action.payload.error,
      };

    case ACTION_TYPES.CLEAR_ERROR:
      return {
        ...state,
        [action.payload]: '',
      };

    default:
      return state;
  }
};

// Root Reducer
const rootReducer = combineReducers({
  predictions: predictionReducer,
  leaderboard: leaderboardReducer,
  user: userReducer,
  loading: loadingReducer,
  errors: errorReducer,
});

export default rootReducer;
export type RootState = ReturnType<typeof rootReducer>; 