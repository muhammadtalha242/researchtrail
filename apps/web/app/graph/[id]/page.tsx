'use client';

import { useQuery } from '@tanstack/react-query';
import cytoscape, { Core } from 'cytoscape';
import { ArrowLeft, BookOpen, Info } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { GraphResponse } from '@/lib/types';

export default function GraphPage() {
  const params = useParams<{ id: string }>();
  const container = useRef<HTMLDivElement>(null);
  const graphInstance = useRef<Core | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const graph = useQuery({ queryKey: ['graph', params.id], queryFn: () => apiFetch<GraphResponse>(`/works/${encodeURIComponent(params.id)}/graph`) });

  useEffect(() => {
    if (!container.current || !graph.data) return;
    graphInstance.current?.destroy();
    const cy = cytoscape({
      container: container.current,
      elements: [
        ...graph.data.nodes.map((node) => ({ data: node })),
        ...graph.data.edges.map((edge) => ({ data: edge })),
      ],
      style: [
        { selector: 'node', style: { 'background-color': '#6366f1', label: 'data(label)', color: '#0f172a', 'font-size': '9px', 'text-wrap': 'ellipsis', 'text-max-width': '130px', 'text-valign': 'bottom', 'text-margin-y': 8, width: 'mapData(citedByCount, 0, 500, 28, 65)', height: 'mapData(citedByCount, 0, 500, 28, 65)', 'border-width': 3, 'border-color': '#c7d2fe' } },
        { selector: `node[id = "${graph.data.centerId}"]`, style: { 'background-color': '#0f172a', 'border-color': '#818cf8', width: 72, height: 72, 'font-weight': 'bold' } },
        { selector: 'edge[type = "reference"]', style: { width: 2, 'line-color': '#94a3b8', 'target-arrow-color': '#94a3b8', 'target-arrow-shape': 'triangle', 'curve-style': 'bezier' } },
        { selector: 'edge[type = "citation"]', style: { width: 2, 'line-color': '#10b981', 'target-arrow-color': '#10b981', 'target-arrow-shape': 'triangle', 'curve-style': 'bezier' } },
        { selector: ':selected', style: { 'border-width': 6, 'border-color': '#f59e0b' } },
      ],
      layout: { name: 'cose', animate: false, padding: 50 },
    });
    cy.on('tap', 'node', (event) => setSelectedId(event.target.id()));
    setSelectedId(graph.data.centerId);
    graphInstance.current = cy;
    return () => cy.destroy();
  }, [graph.data]);

  const selected = graph.data?.nodes.find((node) => node.id === selectedId);

  return (
    <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <Link href={`/works/${params.id}`} className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-indigo-700"><ArrowLeft size={16} /> Back to publication</Link>
      <div className="mb-5"><h1 className="text-3xl font-bold">Citation explorer</h1><p className="mt-2 text-slate-600">Grey arrows are references from the centre paper. Green arrows are papers that cite it.</p></div>

      {graph.isLoading && <div className="panel" role="status">Loading citation graph…</div>}
      {graph.error && <div className="panel border-red-200 bg-red-50 text-red-800" role="alert">{graph.error.message}</div>}
      {graph.data && <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="panel overflow-hidden p-0"><div ref={container} role="img" aria-label="Interactive citation network. A keyboard-accessible publication list follows beside the graph." className="h-[680px] w-full bg-slate-50" /></div>
        <aside className="panel h-fit lg:sticky lg:top-24">
          <h2 className="flex items-center gap-2 font-semibold"><Info size={18} /> Selected publication</h2>
          {selected ? <div className="mt-4"><p className="font-semibold leading-6">{selected.label}</p><p className="mt-2 text-sm text-slate-600">{selected.authors.join(', ') || 'Authors unavailable'}</p><dl className="mt-5 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-slate-600">Year</dt><dd className="font-medium">{selected.year ?? '—'}</dd></div><div><dt className="text-slate-600">Citations</dt><dd className="font-medium">{selected.citedByCount.toLocaleString()}</dd></div></dl><Link href={`/works/${selected.id}`} className="btn-primary mt-6 w-full"><BookOpen aria-hidden="true" size={16} /> Open publication</Link></div> : <p className="mt-4 text-sm text-slate-600">Select a node in the graph.</p>}
          <h3 className="mt-7 border-t border-slate-200 pt-5 text-sm font-semibold">All publications in this graph</h3>
          <ul className="mt-2 max-h-64 space-y-2 overflow-y-auto text-sm">
            {graph.data.nodes.map((node) => <li key={node.id}><Link className="block rounded-md px-2 py-1 text-indigo-800 underline-offset-2 hover:underline" href={`/works/${node.id}`}>{node.label}</Link></li>)}
          </ul>
        </aside>
      </div>}
    </main>
  );
}
