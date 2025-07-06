'use client'
import { PrivyProvider } from '@privy-io/react-auth';

export default function PrivyProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'clp3o1s8h0027k2qf3plb8ex8'}
      config={{
        // Giriş seçenekleri
        loginMethods: ['email', 'wallet', 'google', 'twitter'],
        // Görünüm ayarları
        appearance: {
          theme: 'light',
          accentColor: '#3B82F6',
          logo: 'https://your-logo-url.com/logo.png',
        },
        // Embedded wallet ayarları
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
} 