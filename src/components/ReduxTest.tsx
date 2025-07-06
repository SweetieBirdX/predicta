'use client'
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  fetchPredictionsRequest, 
  fetchLeaderboardRequest, 
  setCurrentUser 
} from '../store/actions';
import { 
  selectPredictions, 
  selectPredictionsLoading, 
  selectLeaderboard, 
  selectCurrentUserId 
} from '../store/hooks';

export default function ReduxTest() {
  const dispatch = useAppDispatch();
  const predictions = useAppSelector(selectPredictions);
  const loading = useAppSelector(selectPredictionsLoading);
  const leaderboard = useAppSelector(selectLeaderboard);
  const currentUserId = useAppSelector(selectCurrentUserId);

  const handleFetchPredictions = () => {
    console.log('🔥 Redux Action Dispatch: fetchPredictionsRequest');
    dispatch(fetchPredictionsRequest());
  };

  const handleFetchLeaderboard = () => {
    console.log('🔥 Redux Action Dispatch: fetchLeaderboardRequest');
    dispatch(fetchLeaderboardRequest());
  };

  const handleSetUser = () => {
    console.log('🔥 Redux Action Dispatch: setCurrentUser');
    dispatch(setCurrentUser('test-user-123'));
  };

  return (
    <div className="p-6 bg-blue-50 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-blue-800">🔧 Redux-Saga Test Panel</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Redux Store Status:</h3>
          <p>✅ Redux Provider: Connected</p>
          <p>✅ Actions: {typeof dispatch === 'function' ? 'Working' : 'Not Working'}</p>
          <p>✅ Selectors: {Array.isArray(predictions) ? 'Working' : 'Not Working'}</p>
        </div>

        <div>
          <h3 className="font-semibold">Current State:</h3>
          <p>📊 Predictions: {predictions.length} items</p>
          <p>🏆 Leaderboard: {leaderboard.length} items</p>
          <p>👤 User ID: {currentUserId || 'Not Set'}</p>
          <p>⏳ Loading: {loading ? 'Yes' : 'No'}</p>
        </div>

        <div>
          <h3 className="font-semibold">Test Actions:</h3>
          <div className="space-x-2">
            <button 
              onClick={handleFetchPredictions}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              📊 Fetch Predictions
            </button>
            <button 
              onClick={handleFetchLeaderboard}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              🏆 Fetch Leaderboard
            </button>
            <button 
              onClick={handleSetUser}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              👤 Set User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 