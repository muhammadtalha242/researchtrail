'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink, FileText, Network } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { WorkCard } from '@/components/work-card';
import { apiFetch } from '@/lib/api';
import { Work } from '@/lib/types';

export default function WorkDetailPage() {
  const params = useParams<{ id: string }>();
  const result = useQuery({
    queryKey: ['work', params.id],
    queryFn: () => apiFetch<{ work: Work; related: Work[] }>(`/works/${encodeURIComponent(params.id)}`),
  });

  if (result.isLoading) return <main className="mx-auto max-w-5xl px-4 py-10"><div className="panel">Loading publication…</div></main>;
  if (result.error || !result.data) return <main className="mx-auto max-w-5xl px-4 py-10"><div className="panel border-red-200 bg-red-50 text-red-700">{result.error?.message || 'Publication not found.'}</div></main>;

  const { work, related } = result.data;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link href="/" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-indigo-700"><ArrowLeft size={16} /> Back to discovery</Link>
      <article className="panel p-6 sm:p-8">
        <div className="flex flex-wrap gap-2 text-sm text-slate-500"><span>{work.publicationYear ?? 'Year unknown'}</span><span>•</span><span>{work.publicationType}</span><span>•</span><span>{work.citedByCount.toLocaleString()} citations</span>{work.isOpenAccess && <span className="badge badge-green text-xs">Open access</span>}{work.isRetracted && <span className="badge badge-red text-xs">Retracted</span>}</div>
        <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">{work.title}</h1>
        <p className="mt-4 text-slate-600">{work.authors.map((a) => a.name).join(', ') || 'Authors unavailable'}</p>
        {work.venue && <p className="mt-2 text-sm text-slate-500">Published in {work.venue}</p>}
        <div className="mt-6 flex flex-wrap gap-2">{work.topics.map((topic) => <span key={topic.id} className="topic-chip">{topic.name}</span>)}</div>

        <section className="mt-8 border-t border-slate-200 pt-8">
          <h2 className="flex items-center gap-2 text-xl font-semibold"><FileText size={20} /> Abstract</h2>
          <p className="mt-4 whitespace-pre-line leading-8 text-slate-700">{work.abstract || 'OpenAlex does not provide an abstract for this publication.'}</p>
        </section>

        <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-200 pt-6">
          <Link href={`/graph/${work.openAlexId}`} className="btn-primary"><Network size={17} /> Explore citation graph</Link>
          {work.sourceUrl && <a href={work.sourceUrl} target="_blank" rel="noreferrer" className="btn-secondary"><ExternalLink size={17} /> Open source</a>}
          {work.pdfUrl && <a href={work.pdfUrl} target="_blank" rel="noreferrer" className="btn-secondary"><FileText size={17} /> Open PDF</a>}
        </div>
      </article>

      {related.length > 0 && <section className="mt-10"><h2 className="text-2xl font-bold">Related publications</h2><div className="mt-5 grid gap-4 md:grid-cols-2">{related.map((item) => <WorkCard key={item.openAlexId} work={item} compact />)}</div></section>}
    </main>
  );
}
