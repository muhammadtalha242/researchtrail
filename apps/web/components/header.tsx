'use client';

import { BarChart3, BookOpen, Library, LogIn, LogOut, Search } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from './auth-provider';

export function Header() {
  const { user, logout, ready } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-950">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white"><BookOpen size={20} /></span>
          <span>ResearchTrail</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/" className="nav-link"><Search size={16} /> Discover</Link>
          <Link href="/trends" className="nav-link"><BarChart3 size={16} /> Trends</Link>
          <Link href="/library" className="nav-link"><Library size={16} /> Library</Link>
          {ready && user ? (
            <button onClick={logout} className="nav-link"><LogOut size={16} /> Sign out</button>
          ) : (
            <Link href="/login" className="nav-link"><LogIn size={16} /> Sign in</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
