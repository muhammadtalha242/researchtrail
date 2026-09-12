'use client';

import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { WorkCard } from '@/components/work-card';
import { apiFetch } from '@/lib/api';
import { SearchResponse } from '@/lib/types';

export default function HomePage() {
  const [draft, setDraft] = useState('machine learning healthcare');
  const [query, setQuery] = useState('machine learning healthcare');
  const [fromYear, setFromYear] = useState('2020');
  const [toYear, setToYear] = useState('');
  const [openAccess, setOpenAccess] = useState(false);
  const [sort, setSort] = useState<'relevance' | 'newest' | 'cited'>('relevance');
  const [page, setPage] = useState(1);

  const search = useQuery({
    queryKey: ['search', query, fromYear, toYear, openAccess, sort, page],
    queryFn: () => {
      const params = new URLSearchParams({ q: query, sort, page: String(page) });
      if (fromYear) params.set('fromYear', fromYear);
      if (toYear) params.set('toYear', toYear);
      if (openAccess) params.set('openAccess', 'true');
      return apiFetch<SearchResponse>(`/search?${params.toString()}`);
    },
    enabled: query.trim().length >= 2,
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    setQuery(draft.trim());
  }

  const totalPages = search.data ? Math.ceil(search.data.meta.count / search.data.meta.per_page) : 0;

  return (
    <main id="main-content">
      <section className="border-b border-slate-200 bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-200">OpenAlex research discovery</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">Find the papers that move your research forward.</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-indigo-100">Search scholarly metadata, inspect related work, explore a one-hop citation graph, and examine research trends.</p>
          <form onSubmit={submit} role="search" className="mt-8 flex max-w-4xl gap-3 rounded-2xl bg-white/10 p-2 backdrop-blur">
            <div className="relative flex-1">
              <Search aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
              <label className="sr-only" htmlFor="discovery-search">Search publications</label>
              <input id="discovery-search" className="w-full rounded-xl bg-white py-3.5 pl-12 pr-4 text-slate-950" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Search a topic, title, author or DOI" minLength={2} required />
            </div>
            <button className="rounded-xl bg-indigo-500 px-6 font-semibold text-white transition hover:bg-indigo-400">Search</button>
          </form>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="panel h-fit lg:sticky lg:top-24">
          <div className="flex items-center gap-2 font-semibold"><SlidersHorizontal aria-hidden="true" size={18} /> Filters</div>
          <div className="mt-5 space-y-4">
            <label><span className="label">From year</span><input className="input" type="number" min="1800" max="2100" value={fromYear} onChange={(e) => { setFromYear(e.target.value); setPage(1); }} /></label>
            <label><span className="label">To year</span><input className="input" type="number" min="1800" max="2100" value={toYear} onChange={(e) => { setToYear(e.target.value); setPage(1); }} /></label>
            <label><span className="label">Sort by</span><select className="input mb-2" value={sort} onChange={(e) => { setSort(e.target.value as typeof sort); setPage(1); }}><option id="select_relevance" value="relevance">Relevance</option><option id="select_newest" value="newest">Newest</option><option id="select_cited" value="cited">Most cited</option></select></label>
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm"><input type="checkbox" checked={openAccess} onChange={(e) => { setOpenAccess(e.target.checked); setPage(1); }} /> Open access only</label>
          </div>
        </aside>

        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-2xl font-bold text-slate-950">Search results</h2><p className="mt-1 text-sm text-slate-500">{search.data ? `${search.data.meta.count.toLocaleString()} results for “${query}”` : 'Search OpenAlex publications'}</p></div>
            {search.data && totalPages > 1 && <nav aria-label="Search result pages" className="flex items-center gap-2"><button aria-label="Previous results page" className="btn-secondary" disabled={page === 1} onClick={() => setPage((v) => Math.max(1, v - 1))}><ChevronLeft aria-hidden="true" size={16} /></button><span aria-live="polite" className="text-sm text-slate-600">Page {page}</span><button aria-label="Next results page" className="btn-secondary" disabled={page >= totalPages || page >= 500} onClick={() => setPage((v) => v + 1)}><ChevronRight aria-hidden="true" size={16} /></button></nav>}
          </div>

          {search.isLoading && <div className="panel animate-pulse text-slate-600" role="status">Loading publications…</div>}
          {search.error && <div className="panel border-red-200 bg-red-50 text-red-800" role="alert">{search.error.message}</div>}
          <div className="grid gap-4">{search.data?.results.map((work) => <WorkCard key={work.openAlexId} work={work} />)}</div>
        </section>
      </div>
    </main>
  );
}
