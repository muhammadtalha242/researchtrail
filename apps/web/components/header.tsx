'use client';

import { BarChart3, BookOpen, Library, LogIn, LogOut, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './auth-provider';

export function Header() {
  const { user, logout, ready } = useAuth();
  const pathname = usePathname();

  const current = (href: string) => pathname === href ? 'page' as const : undefined;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-950" aria-label="ResearchTrail home">
          <span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-700 text-white"><BookOpen size={20} /></span>
          <span className="hidden sm:inline">ResearchTrail</span>
        </Link>
        <nav aria-label="Primary navigation" className="flex items-center gap-1 text-sm sm:gap-2">
          <Link href="/" aria-current={current('/')} className="nav-link"><Search aria-hidden="true" size={16} /> <span className="hidden sm:inline">Discover</span></Link>
          <Link href="/trends" aria-current={current('/trends')} className="nav-link"><BarChart3 aria-hidden="true" size={16} /> <span className="hidden sm:inline">Trends</span></Link>
          <Link href="/library" aria-current={current('/library')} className="nav-link"><Library aria-hidden="true" size={16} /> <span className="hidden sm:inline">Library</span></Link>
          {ready && user ? (
            <button onClick={logout} className="nav-link"><LogOut aria-hidden="true" size={16} /> <span className="hidden sm:inline">Sign out</span></button>
          ) : (
            <Link href="/login" aria-current={current('/login')} className="nav-link"><LogIn aria-hidden="true" size={16} /> <span className="hidden sm:inline">Sign in</span></Link>
          )}
        </nav>
      </div>
    </header>
  );
}
