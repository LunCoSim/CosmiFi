import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../app/globals.css';
import { Providers } from './providers';
import { Navigation } from '../../src/components/Navigation';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import '@rainbow-me/rainbowkit/styles.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CosmiFi - Blueprint NFT Platform',
  description: 'A decentralized platform for creating, sharing, and evolving space mission designs together',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            <Navigation />
            <main>{children}</main>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}