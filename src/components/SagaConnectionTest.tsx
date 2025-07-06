'use client'
import { useState } from 'react';
import { getSagaProvider, getSagaChainletInfo, getEYPBalance, checkSagaNetwork, SAGA_CHAINLET_CONFIG } from '../lib/sagaProvider';

export default function SagaConnectionTest() {
  const [connecting, setConnecting] = useState(false);
  const [chainletInfo, setChainletInfo] = useState<any>(null);
  const [userAddress, setUserAddress] = useState<string>('');
  const [userBalance, setUserBalance] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<string>('');

  const handleConnectSaga = async () => {
    setConnecting(true);
    setConnectionStatus('🔄 Saga Chainlet\'e bağlanıyor...');
    
    try {
      // 1. Provider'ı al
      const provider = await getSagaProvider();
      setConnectionStatus('✅ Provider bağlandı');
      
      // 2. Chainlet bilgilerini al
      const info = await getSagaChainletInfo();
      setChainletInfo(info);
      setConnectionStatus('✅ Chainlet bilgileri alındı');
      
      // 3. Network kontrolü
      const isCorrectNetwork = await checkSagaNetwork();
      if (!isCorrectNetwork) {
        setConnectionStatus('⚠️ Yanlış network - MetaMask\'ı Saga Chainlet\'e geçirin');
        return;
      }
      setConnectionStatus('✅ Saga Chainlet network\'ünde!');
      
      // 4. User account'u al (eğer MetaMask bağlıysa)
      if ('getSigner' in provider) {
        try {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setUserAddress(address);
          
          // 5. EYP balance'ı al
          const balance = await getEYPBalance(address);
          setUserBalance(balance);
          
          setConnectionStatus('🎉 Saga Chainlet bağlantısı başarılı!');
        } catch (signerError) {
          setConnectionStatus('⚠️ MetaMask bağlantısı gerekli');
        }
      } else {
        setConnectionStatus('✅ RPC bağlantısı aktif (MetaMask gerekmez)');
      }
      
    } catch (error: any) {
      console.error('Saga connection error:', error);
      setConnectionStatus(`❌ Bağlantı hatası: ${error.message}`);
    } finally {
      setConnecting(false);
    }
  };

  const openExplorer = () => {
    if (chainletInfo?.explorerUrl) {
      window.open(chainletInfo.explorerUrl, '_blank');
    }
  };

  const handleSwitchNetwork = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await (window.ethereum as any).request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: SAGA_CHAINLET_CONFIG.chainId }],
        });
        setConnectionStatus('✅ Network başarıyla değiştirildi!');
        
        // Bağlantıyı tekrar test et
        setTimeout(() => {
          handleConnectSaga();
        }, 1000);
      } catch (error: any) {
        if (error.code === 4902) {
          // Network eklenmemişse ekle
          try {
            await (window.ethereum as any).request({
              method: 'wallet_addEthereumChain',
              params: [SAGA_CHAINLET_CONFIG],
            });
            setConnectionStatus('✅ Saga Chainlet eklendi ve seçildi!');
            setTimeout(() => {
              handleConnectSaga();
            }, 1000);
          } catch (addError) {
            setConnectionStatus('❌ Network ekleme hatası: ' + addError);
          }
        } else {
          setConnectionStatus('❌ Network değiştirme hatası: ' + error.message);
        }
      }
    } else {
      setConnectionStatus('❌ MetaMask bulunamadı');
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-lg border border-purple-500/30">
      <h2 className="text-2xl font-bold mb-4 text-white">🔗 Saga Chainlet Connection Test</h2>
      
      {/* Connection Status */}
      <div className="mb-4 p-4 bg-black/30 rounded-lg">
        <p className="text-white font-medium">{connectionStatus || 'Henüz bağlantı denenmedi'}</p>
      </div>

      {/* Connection Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <button
          onClick={handleConnectSaga}
          disabled={connecting}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
        >
          {connecting ? '🔄 Bağlanıyor...' : '🚀 Saga Chainlet\'e Bağlan'}
        </button>
        
        <button
          onClick={handleSwitchNetwork}
          disabled={connecting}
          className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
        >
          🔄 MetaMask Network Değiştir
        </button>
      </div>

      {/* Chainlet Info */}
      {chainletInfo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-black/30 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-300 mb-2">📊 Chainlet Bilgileri</h3>
            <p className="text-sm text-white/80">Chain ID: {chainletInfo.chainId}</p>
            <p className="text-sm text-white/80">Block: #{chainletInfo.blockNumber}</p>
            <p className="text-sm text-white/80 break-all">RPC: {chainletInfo.rpcUrl}</p>
          </div>
          
          <div className="bg-black/30 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-300 mb-2">🔗 Links</h3>
            <button 
              onClick={openExplorer}
              className="text-blue-400 hover:text-blue-300 text-sm underline"
            >
              🔍 Explorer'ı Aç
            </button>
            <p className="text-sm text-white/80 mt-1">Native Token: EYP</p>
          </div>
        </div>
      )}

      {/* User Info */}
      {userAddress && (
        <div className="bg-black/30 p-4 rounded-lg mb-4">
          <h3 className="font-semibold text-green-300 mb-2">👤 Kullanıcı Bilgileri</h3>
          <p className="text-sm text-white/80 break-all">Address: {userAddress}</p>
          <p className="text-sm text-white/80">EYP Balance: {userBalance} EYP</p>
        </div>
      )}

      {/* Network Config Display */}
      <div className="bg-black/30 p-4 rounded-lg">
        <h3 className="font-semibold text-yellow-300 mb-2">⚙️ Network Configuration</h3>
        <div className="text-xs text-white/60 space-y-1">
          <p>Chain Name: {SAGA_CHAINLET_CONFIG.chainName}</p>
          <p>Chain ID (Config): {SAGA_CHAINLET_CONFIG.chainId} (dec: {parseInt(SAGA_CHAINLET_CONFIG.chainId, 16)})</p>
          <p>Symbol: {SAGA_CHAINLET_CONFIG.nativeCurrency.symbol}</p>
          <p className="break-all">RPC URL: {SAGA_CHAINLET_CONFIG.rpcUrls[0]}</p>
          {chainletInfo && (
            <div className="mt-2 pt-2 border-t border-white/20">
              <p className="text-green-400 font-semibold">Current Network Chain ID: {chainletInfo.chainId}</p>
              <p className="text-sm">Match: {chainletInfo.chainId === parseInt(SAGA_CHAINLET_CONFIG.chainId, 16) ? '✅ YES' : '❌ NO'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 