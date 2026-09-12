import { ExternalLink, Network } from 'lucide-react';
import Link from 'next/link';
import { Work } from '@/lib/types';

export function WorkCard({ work, compact = false }: { work: Work; compact?: boolean }) {
  const authorLine = work.authors.slice(0, 4).map((author) => author.name).join(', ');

  return (
    <article className="paper-card">
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>{work.publicationYear ?? 'Year unknown'}</span>
        <span>•</span>
        <span>{work.publicationType ?? 'work'}</span>
        <span>•</span>
        <span>{work.citedByCount.toLocaleString()} citations</span>
        {work.isOpenAccess && <span className="badge badge-green">Open access</span>}
        {work.isRetracted && <span className="badge badge-red">Retracted</span>}
      </div>

      <Link href={`/works/${work.openAlexId}`} className="mt-3 block text-lg font-semibold leading-snug text-slate-950 hover:text-indigo-700">
        {work.title}
      </Link>
      <p className="mt-2 text-sm text-slate-600">{authorLine || 'Authors unavailable'}</p>
      {work.venue && <p className="mt-1 text-xs text-slate-500">{work.venue}</p>}

      {!compact && (
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
          {work.abstract || 'No abstract is available in OpenAlex for this publication.'}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {work.topics.slice(0, 3).map((topic) => <span className="topic-chip" key={topic.id}>{topic.name}</span>)}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Link className="btn-secondary" href={`/graph/${work.openAlexId}`}><Network size={16} /> Citation graph</Link>
        {work.sourceUrl && <a className="btn-secondary" href={work.sourceUrl} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Source</a>}
      </div>
    </article>
  );
}
