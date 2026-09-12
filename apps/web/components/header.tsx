'use client';

import { BarChart3, BookOpen, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
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
        </nav>
      </div>
    </header>
  );
}
