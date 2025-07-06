import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import Navbar from '../components/Navbar';
import PrivyProviderWrapper from '../components/PrivyProvider';
import ReduxProvider from '../components/ReduxProvider';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Predicta - Social Prediction Platform",
  description: "Predict the future, earn XP, rise in the leaderboard!",
  icons: {
    icon: "/predictalogo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-gray-50`}>
        <ReduxProvider>
          <PrivyProviderWrapper>
            <Navbar />
            <div className="pt-16">
              {children}
            </div>
          </PrivyProviderWrapper>
        </ReduxProvider>
      </body>
    </html>
  );
}
