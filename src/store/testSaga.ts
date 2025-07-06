import { call, put } from 'redux-saga/effects';

// Test action types
const TEST_SAGA_ACTION = 'TEST_SAGA_ACTION';
const TEST_SAGA_SUCCESS = 'TEST_SAGA_SUCCESS';
const TEST_SAGA_FAILURE = 'TEST_SAGA_FAILURE';

// Test API fonksiyonu
async function testApiCall() {
  console.log('🔄 Test API çağrısı yapılıyor...');
  await new Promise(resolve => setTimeout(resolve, 1000)); // 1 saniye bekle
  return { message: 'Redux-Saga çalışıyor!', timestamp: Date.now() };
}

// Worker Saga - Manual execution
export function* testSagaWorker(): Generator<any, void, any> {
  try {
    console.log('🔄 Test Saga Worker başlatıldı');
    
    // API çağrısı
    const result = yield call(testApiCall as any);
    
    // Success action dispatch
    yield put({ type: TEST_SAGA_SUCCESS, payload: result });
    
    console.log('✅ Test Saga başarılı:', result);
  } catch (error: any) {
    console.error('❌ Test Saga hatası:', error);
    yield put({ type: TEST_SAGA_FAILURE, payload: error.message });
  }
}

// Simple test function
export function* simpleTestSaga(): Generator<any, void, any> {
  console.log('🧪 Basit Redux-Saga testi');
  yield put({ type: 'SIMPLE_TEST', payload: 'Redux-Saga aktif!' });
}

// Action creator
export const triggerTestSaga = () => ({
  type: TEST_SAGA_ACTION
});

// Test fonksiyonu (component'lerde kullanım için)
export const testReduxSaga = () => {
  console.log('🧪 Redux-Saga Test fonksiyonu çağrıldı');
  return triggerTestSaga();
};

// Export saga workers for manual execution
export const testSagaWorkers = {
  testSagaWorker,
  simpleTestSaga
};

console.log('📦 Test Saga modülü yüklendi'); 