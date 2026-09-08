'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BookmarkPlus, ExternalLink, Network } from 'lucide-react';
import Link from 'next/link';
import { apiFetch, ApiError } from '@/lib/api';
import { Work } from '@/lib/types';
import { useAuth } from './auth-provider';

export function WorkCard({ work, compact = false }: { work: Work; compact?: boolean }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const save = useMutation({
    mutationFn: () => apiFetch('/library', {
      method: 'POST',
      body: JSON.stringify({ openAlexId: work.openAlexId, status: 'TO_READ' }),
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['library'] }),
  });

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
        <button
          className="btn-primary"
          disabled={save.isPending}
          onClick={() => {
            if (!user) {
              window.location.href = '/login';
              return;
            }
            save.mutate();
          }}
        >
          <BookmarkPlus size={16} /> {save.isPending ? 'Saving…' : save.isSuccess ? 'Saved' : 'Save'}
        </button>
      </div>
      {save.error && <p className="mt-3 text-sm text-red-600">{save.error instanceof ApiError ? save.error.message : 'Could not save this paper.'}</p>}
    </article>
  );
}
