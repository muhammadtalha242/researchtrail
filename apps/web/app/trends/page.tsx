'use client';

import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  BookOpen,
  CalendarDays,
  ChevronDown,
  Download,
  Filter,
  Search,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';

const publicationBars = [31, 39, 47, 52, 60, 69, 77, 88, 96, 112];
const citationPoints = '0,107 52,102 104,95 156,89 208,80 260,71 312,62 364,48 416,31 468,14';

const authors = [
  { initials: 'EF', name: 'Emily Fox', institution: 'University of Washington', papers: 127, citations: '18.4k', color: 'bg-violet-100 text-violet-700' },
  { initials: 'AL', name: 'Andrew Lo', institution: 'MIT Sloan School of Management', papers: 98, citations: '14.7k', color: 'bg-blue-100 text-blue-700' },
  { initials: 'JH', name: 'Jennifer Hill', institution: 'New York University', papers: 86, citations: '12.2k', color: 'bg-emerald-100 text-emerald-700' },
  { initials: 'MK', name: 'Michael Kearns', institution: 'University of Pennsylvania', papers: 74, citations: '10.9k', color: 'bg-amber-100 text-amber-700' },
];

const topics = [
  { name: 'Large language models', growth: '+184%', papers: '4,218' },
  { name: 'Federated learning', growth: '+96%', papers: '2,745' },
  { name: 'AI safety', growth: '+78%', papers: '1,893' },
  { name: 'Explainable AI', growth: '+51%', papers: '3,106' },
];

export default function TrendsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-600"><Sparkles size={16} /> Research intelligence</div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Topic Trends Dashboard</h1>
              <p className="mt-2 max-w-2xl text-slate-500">Track publication growth, influential researchers, and citation momentum across academic topics.</p>
            </div>
            <button className="btn-secondary"><Download size={16} /> Export report</button>
          </div>

          <div className="mt-7 grid gap-3 lg:grid-cols-[minmax(280px,1fr)_180px_180px_auto]">
            <label className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input className="input h-11 pl-11" defaultValue="Machine learning" placeholder="Search a topic" />
            </label>
            <button className="input flex h-11 items-center justify-between text-left"><span className="flex items-center gap-2"><CalendarDays size={16} className="text-slate-400" /> 2015–2024</span><ChevronDown size={16} /></button>
            <button className="input flex h-11 items-center justify-between text-left"><span>All fields</span><ChevronDown size={16} /></button>
            <button className="btn-primary h-11 px-5"><Filter size={16} /> Apply filters</button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>Related:</span>
            {['Deep learning', 'Neural networks', 'Computer vision'].map((topic) => <button key={topic} className="topic-chip">{topic}</button>)}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric icon={<BookOpen size={19} />} label="Total publications" value="148,392" change="12.8%" positive />
          <Metric icon={<TrendingUp size={19} />} label="Total citations" value="3.2M" change="18.4%" positive />
          <Metric icon={<Users size={19} />} label="Active authors" value="42,816" change="7.2%" positive />
          <Metric icon={<BarChart3 size={19} />} label="Avg. citations / paper" value="21.7" change="1.6%" />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <div className="panel overflow-hidden">
            <ChartHeading title="Publication growth" subtitle="Papers published per year" badge="+261% over 10 years" />
            <div className="mt-7 flex h-64 items-end gap-3 border-b border-slate-200 px-1">
              {publicationBars.map((height, index) => (
                <div key={index} className="group flex h-full flex-1 items-end">
                  <div className="relative w-full rounded-t-md bg-indigo-100 transition group-hover:bg-indigo-500" style={{ height: `${height / 1.2}%` }}>
                    <span className="absolute -top-7 left-1/2 hidden -translate-x-1/2 rounded bg-slate-900 px-2 py-1 text-[10px] text-white group-hover:block">{Math.round(height * 132)}k</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between text-xs text-slate-400"><span>2015</span><span>2017</span><span>2019</span><span>2021</span><span>2023</span><span>2024</span></div>
          </div>

          <div className="panel">
            <ChartHeading title="Citation trend" subtitle="Citations received by year" />
            <div className="relative mt-8 h-64">
              <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-slate-400">
                {['600k', '450k', '300k', '150k', '0'].map((label) => <div key={label} className="flex items-center gap-2"><span className="w-8">{label}</span><span className="h-px flex-1 bg-slate-100" /></div>)}
              </div>
              <svg className="absolute bottom-5 left-10 h-[215px] w-[calc(100%-2.5rem)] overflow-visible" viewBox="0 0 468 120" preserveAspectRatio="none" aria-label="Rising citation trend">
                <defs><linearGradient id="citationFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity=".25"/><stop offset="100%" stopColor="#6366f1" stopOpacity="0"/></linearGradient></defs>
                <polygon points={`0,120 ${citationPoints} 468,120`} fill="url(#citationFill)" />
                <polyline points={citationPoints} fill="none" stroke="#4f46e5" strokeWidth="3" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <div className="panel p-0">
            <div className="flex items-center justify-between border-b border-slate-100 p-5"><div><h2 className="font-bold text-slate-950">Leading authors</h2><p className="mt-1 text-sm text-slate-500">Top contributors by publication impact</p></div><button className="text-sm font-semibold text-indigo-600">View all</button></div>
            <div className="divide-y divide-slate-100">
              {authors.map((author, index) => (
                <div key={author.name} className="grid grid-cols-[28px_1fr_auto_auto] items-center gap-3 px-5 py-4">
                  <span className="text-sm font-semibold text-slate-400">{index + 1}</span>
                  <div className="flex min-w-0 items-center gap-3"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-bold ${author.color}`}>{author.initials}</span><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{author.name}</p><p className="truncate text-xs text-slate-500">{author.institution}</p></div></div>
                  <div className="hidden text-right sm:block"><p className="text-sm font-semibold">{author.papers}</p><p className="text-xs text-slate-400">papers</p></div>
                  <div className="w-20 text-right"><p className="text-sm font-semibold">{author.citations}</p><p className="text-xs text-slate-400">citations</p></div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <ChartHeading title="Fastest-growing subtopics" subtitle="Publication growth in the last 24 months" />
            <div className="mt-5 space-y-5">
              {topics.map((topic, index) => (
                <div key={topic.name}>
                  <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold text-slate-900">{topic.name}</p><p className="mt-0.5 text-xs text-slate-400">{topic.papers} publications</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">{topic.growth}</span></div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${92 - index * 14}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <p className="pb-2 text-center text-xs text-slate-400">Metrics based on indexed scholarly works · Last updated July 2026</p>
      </div>
    </main>
  );
}

function Metric({ icon, label, value, change, positive = false }: { icon: React.ReactNode; label: string; value: string; change: string; positive?: boolean }) {
  return <div className="panel"><div className="flex items-start justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">{icon}</span><span className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${positive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{positive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}{change}</span></div><p className="mt-5 text-2xl font-bold tracking-tight text-slate-950">{value}</p><p className="mt-1 text-sm text-slate-500">{label}</p></div>;
}

function ChartHeading({ title, subtitle, badge }: { title: string; subtitle: string; badge?: string }) {
  return <div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="font-bold text-slate-950">{title}</h2><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>{badge && <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">{badge}</span>}</div>;
}
