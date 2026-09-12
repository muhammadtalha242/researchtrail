import type { Metadata } from 'next';
import './globals.css';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'ResearchTrail',
  description: 'Discover, explore and organise academic publications using OpenAlex.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
