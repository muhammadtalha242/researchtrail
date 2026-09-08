'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookMarked, FolderPlus, LogIn, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { apiFetch } from '@/lib/api';
import { Collection, SavedWork } from '@/lib/types';

export default function LibraryPage() {
  const { user, ready } = useAuth();
  const client = useQueryClient();
  const [collectionName, setCollectionName] = useState('');
  const library = useQuery({ queryKey: ['library'], queryFn: () => apiFetch<SavedWork[]>('/library'), enabled: Boolean(user) });
  const collections = useQuery({ queryKey: ['collections'], queryFn: () => apiFetch<Collection[]>('/collections'), enabled: Boolean(user) });
  const createCollection = useMutation({
    mutationFn: () => apiFetch('/collections', { method: 'POST', body: JSON.stringify({ name: collectionName }) }),
    onSuccess: () => { setCollectionName(''); client.invalidateQueries({ queryKey: ['collections'] }); },
  });

  if (!ready) return <main className="mx-auto max-w-6xl px-4 py-10"><div className="panel">Loading…</div></main>;
  if (!user) return <main className="mx-auto max-w-xl px-4 py-16"><div className="panel text-center"><LogIn className="mx-auto text-indigo-600" size={34} /><h1 className="mt-4 text-2xl font-bold">Sign in to use your library</h1><p className="mt-2 text-slate-600">Saved papers, notes, reading status and collections belong to your account.</p><Link href="/login" className="btn-primary mt-6">Sign in</Link></div></main>;

  return <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="flex items-center gap-3 text-3xl font-bold"><BookMarked className="text-indigo-600" /> Personal library</h1><p className="mt-2 text-slate-600">Manage reading status, notes, and collections.</p></div><form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (collectionName.trim()) createCollection.mutate(); }}><input className="input min-w-56" placeholder="New collection name" value={collectionName} onChange={(e) => setCollectionName(e.target.value)} /><button className="btn-primary"><FolderPlus size={16} /> Create</button></form></div>

    <section className="mt-8"><h2 className="text-lg font-semibold">Collections</h2><div className="mt-3 flex flex-wrap gap-2">{collections.data?.length ? collections.data.map((collection) => <span key={collection.id} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm">{collection.name} <span className="text-slate-400">({collection.works.length})</span></span>) : <span className="text-sm text-slate-500">No collections yet.</span>}</div></section>

    <section className="mt-8"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">Saved publications</h2><span className="text-sm text-slate-500">{library.data?.length ?? 0} papers</span></div>{library.isLoading && <div className="panel">Loading library…</div>}{library.error && <div className="panel border-red-200 bg-red-50 text-red-700">{library.error.message}</div>}<div className="grid gap-4">{library.data?.map((work) => <LibraryItem key={work.id} work={work} collections={collections.data ?? []} />)}</div>{library.data?.length === 0 && <div className="panel text-center text-slate-500">Your library is empty. Save a paper from the discovery page.</div>}</section>
  </main>;
}

function LibraryItem({ work, collections }: { work: SavedWork; collections: Collection[] }) {
  const client = useQueryClient();
  const [note, setNote] = useState(work.note ?? '');
  const update = useMutation({ mutationFn: (payload: { status?: SavedWork['status']; note?: string }) => apiFetch(`/library/${work.id}`, { method: 'PATCH', body: JSON.stringify(payload) }), onSuccess: () => client.invalidateQueries({ queryKey: ['library'] }) });
  const remove = useMutation({ mutationFn: () => apiFetch(`/library/${work.id}`, { method: 'DELETE' }), onSuccess: () => client.invalidateQueries({ queryKey: ['library'] }) });
  const addToCollection = useMutation({ mutationFn: (collectionId: string) => apiFetch(`/collections/${collectionId}/works`, { method: 'POST', body: JSON.stringify({ savedWorkId: work.id }) }), onSuccess: () => { client.invalidateQueries({ queryKey: ['collections'] }); client.invalidateQueries({ queryKey: ['library'] }); } });
  const authors = Array.isArray(work.authors) ? work.authors.slice(0, 4).map((author) => author.name).join(', ') : '';

  return <article className="paper-card"><div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]"><div><div className="flex flex-wrap items-center gap-2 text-xs text-slate-500"><span>{work.publicationYear ?? 'Year unknown'}</span><span>•</span><span>{work.citedByCount.toLocaleString()} citations</span>{work.isOpenAccess && <span className="badge badge-green">Open access</span>}</div><Link href={`/works/${work.openAlexId}`} className="mt-3 block text-lg font-semibold text-slate-950 hover:text-indigo-700">{work.title}</Link><p className="mt-2 text-sm text-slate-600">{authors}</p><label className="mt-4 block"><span className="label">Personal note</span><textarea className="input min-h-24 resize-y" value={note} onChange={(e) => setNote(e.target.value)} onBlur={() => { if (note !== (work.note ?? '')) update.mutate({ note }); }} /></label></div><div className="space-y-4 border-t border-slate-200 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0"><label><span className="label">Reading status</span><select className="input" value={work.status} onChange={(e) => update.mutate({ status: e.target.value as SavedWork['status'] })}><option value="TO_READ">To read</option><option value="READING">Reading</option><option value="COMPLETED">Completed</option></select></label><label><span className="label">Add to collection</span><select className="input" defaultValue="" onChange={(e) => { if (e.target.value) addToCollection.mutate(e.target.value); e.target.value = ''; }}><option value="">Select collection…</option>{collections.map((collection) => <option value={collection.id} key={collection.id}>{collection.name}</option>)}</select></label>{work.collectionLinks.length > 0 && <div className="flex flex-wrap gap-1.5">{work.collectionLinks.map((link) => <span className="topic-chip" key={link.collection.id}>{link.collection.name}</span>)}</div>}<button className="btn-secondary w-full text-red-600" onClick={() => { if (window.confirm('Remove this paper from your library?')) remove.mutate(); }}><Trash2 size={16} /> Remove</button></div></div></article>;
}
