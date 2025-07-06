import { ethers, BrowserProvider, Contract, formatEther, JsonRpcProvider } from 'ethers';

// Saga Chainlet Configuration
const SAGA_CHAINLET_CONFIG = {
  chainId: '0x1', // Saga chainlet actual chain ID (RPC returns 1)
  chainName: 'Baravoeyup Saga Chainlet',
  rpcUrls: ['https://baravoeyup-2751747638400000-1.jsonrpc.sagarpc.io'],
  nativeCurrency: {
    name: 'EYP',
    symbol: 'EYP',
    decimals: 18
  },
  blockExplorerUrls: ['https://baravoeyup-2751747638400000-1.sagaexplorer.io']
};

// Saga için Web3 provider helper
export async function getSagaProvider(): Promise<BrowserProvider | JsonRpcProvider> {
  // Önce browser provider'ı dene (MetaMask vs.)
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      const provider = new BrowserProvider(window.ethereum as any);
      
      // Saga Chainlet'e switch etmeyi dene
      try {
        await (window.ethereum as any).request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: SAGA_CHAINLET_CONFIG.chainId }],
        });
        console.log('🔗 Saga: Switched to Saga Chainlet');
      } catch (switchError: any) {
        // Chainlet eklenmemişse ekle
        if (switchError.code === 4902) {
          await (window.ethereum as any).request({
            method: 'wallet_addEthereumChain',
            params: [SAGA_CHAINLET_CONFIG],
          });
          console.log('🔗 Saga: Added Saga Chainlet to wallet');
        }
      }
      
      // MetaMask connection'ı kontrol et
      await provider.send("eth_requestAccounts", []);
      console.log('🔗 Saga: MetaMask connected to Saga Chainlet');
      return provider;
    } catch (error) {
      console.log('⚠️ Saga: MetaMask connection failed, using RPC provider:', error);
    }
  }
  
  // Fallback: Direct RPC connection
  const rpcProvider = new JsonRpcProvider(SAGA_CHAINLET_CONFIG.rpcUrls[0]);
  console.log('🔗 Saga: Using direct RPC connection to Saga Chainlet');
  return rpcProvider;
}

// Contract helper
export async function getContract(
  contractAddress: string,
  contractABI: any[],
  needSigner: boolean = false
): Promise<Contract> {
  const provider = await getSagaProvider();
  
  if (needSigner && provider instanceof BrowserProvider) {
    const signer = await provider.getSigner();
    return new Contract(contractAddress, contractABI, signer);
  }
  
  return new Contract(contractAddress, contractABI, provider);
}

// Network helper - Saga Chainlet kontrolü
export async function checkSagaNetwork(): Promise<boolean> {
  try {
    const provider = await getSagaProvider();
    const network = await provider.getNetwork();
    
    const currentChainId = Number(network.chainId);
    const expectedChainId = parseInt(SAGA_CHAINLET_CONFIG.chainId, 16);
    
    console.log('🔗 Saga: Current network chain ID:', currentChainId);
    console.log('🔗 Saga: Expected Saga chainlet ID:', expectedChainId);
    
    return currentChainId === expectedChainId;
  } catch (error) {
    console.error('❌ Saga: Network check failed:', error);
    return false;
  }
}

// Transaction helper
export async function waitForTransaction(txHash: string): Promise<any> {
  const provider = await getSagaProvider();
  console.log('⏳ Saga: Transaction waiting:', txHash);
  console.log('🔗 Saga: Explorer link:', `${SAGA_CHAINLET_CONFIG.blockExplorerUrls[0]}/tx/${txHash}`);
  
  const receipt = await provider.waitForTransaction(txHash);
  console.log('✅ Saga: Transaction confirmed:', txHash);
  
  return receipt;
}

// Balance helper - EYP token balance
export async function getEYPBalance(address: string): Promise<string> {
  const provider = await getSagaProvider();
  const balance = await provider.getBalance(address);
  return formatEther(balance);
}

// Saga Chainlet specific helpers
export async function getSagaChainletInfo() {
  try {
    const provider = await getSagaProvider();
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    
    return {
      chainId: Number(network.chainId),
      chainName: network.name || 'Saga Chainlet',
      blockNumber,
      rpcUrl: SAGA_CHAINLET_CONFIG.rpcUrls[0],
      explorerUrl: SAGA_CHAINLET_CONFIG.blockExplorerUrls[0]
    };
  } catch (error) {
    console.error('❌ Saga: Chainlet info fetch failed:', error);
    return null;
  }
}

// Export types and config
export type { ethers };
export { SAGA_CHAINLET_CONFIG }; 