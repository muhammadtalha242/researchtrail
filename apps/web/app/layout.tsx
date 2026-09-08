import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/header';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'ResearchTrail',
  description: 'Discover, explore and organise academic publications using OpenAlex.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
