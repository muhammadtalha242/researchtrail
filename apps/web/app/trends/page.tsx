'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Award,
  BarChart3,
  BookOpen,
  ExternalLink,
  Layers,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { NormalizedTopic, TopicTrendsResponse } from '@/lib/types';

const POPULAR_TOPICS = [
  { name: 'Large Language Models', query: 'Large Language Models' },
  { name: 'Quantum Computing', query: 'Quantum Computing' },
  { name: 'CRISPR & Gene Editing', query: 'CRISPR Cas9 gene editing' },
  { name: 'Explainable AI', query: 'Explainable Artificial Intelligence' },
  { name: 'Brain-Computer Interfaces', query: 'Brain-Computer Interfaces' },
  { name: 'Climate Change Mitigation', query: 'Climate Change Mitigation' },
  { name: 'Solid State Batteries', query: 'Solid State Batteries' },
];

const PRESET_RANGES = [
  { label: 'Past 5 Years', years: 5 },
  { label: 'Past 10 Years', years: 10 },
  { label: 'Past 15 Years', years: 15 },
];

function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '0';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
  return num.toLocaleString();
}

const AUTHOR_COLORS = [
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-indigo-100 text-indigo-700',
  'bg-teal-100 text-teal-700',
  'bg-fuchsia-100 text-fuchsia-700',
];

export default function TrendsPage() {
  const currentYear = new Date().getFullYear();
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('Machine Learning');
  const [activeQuery, setActiveQuery] = useState('Machine Learning');
  const [fromYear, setFromYear] = useState<number>(currentYear - 9);
  const [toYear, setToYear] = useState<number>(currentYear);
  const [isCustomRange, setIsCustomRange] = useState(false);

  // Chart interactivity states
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [hoveredCitationIndex, setHoveredCitationIndex] = useState<number | null>(null);
  const [activeChartTab, setActiveChartTab] = useState<'both' | 'publications' | 'citations'>('both');

  // Autocomplete dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Query topic suggestions for search input
  const { data: suggestions = [], isFetching: isSearchingSuggestions } = useQuery<NormalizedTopic[]>({
    queryKey: ['topicSuggestions', searchQuery],
    queryFn: () => {
      if (!searchQuery.trim() || searchQuery.length < 2) return Promise.resolve([]);
      return apiFetch<NormalizedTopic[]>(`/trends/topics?q=${encodeURIComponent(searchQuery.trim())}&limit=6`);
    },
    enabled: searchQuery.trim().length >= 2 && isDropdownOpen,
    staleTime: 120_000,
  });

  // Query trends data from backend
  const {
    data: trends,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<TopicTrendsResponse>({
    queryKey: ['topicTrends', selectedTopicId, activeQuery, fromYear, toYear],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedTopicId) params.set('topicId', selectedTopicId);
      else if (activeQuery) params.set('q', activeQuery);
      if (fromYear) params.set('fromYear', String(fromYear));
      if (toYear) params.set('toYear', String(toYear));
      return apiFetch<TopicTrendsResponse>(`/trends?${params.toString()}`);
    },
    staleTime: 300_000,
  });

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTopic = (topic: { id: string; name: string }) => {
    setSelectedTopicId(topic.id);
    setSearchQuery(topic.name);
    setActiveQuery(topic.name);
    setIsDropdownOpen(false);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setSelectedTopicId(null);
    setActiveQuery(searchQuery.trim());
    setIsDropdownOpen(false);
  };

  const handlePresetRange = (years: number) => {
    setIsCustomRange(false);
    setToYear(currentYear);
    setFromYear(currentYear - years + 1);
  };

  // SVG Chart Computations for Publication Growth
  const pubChartData = useMemo(() => {
    if (!trends?.publicationGrowth?.length) return null;
    const list = trends.publicationGrowth;
    const maxCount = Math.max(...list.map((d) => d.count), 1);
    return { list, maxCount };
  }, [trends]);

  // SVG Chart Computations for Citation Activity
  const citationChartData = useMemo(() => {
    if (!trends?.citationActivity?.length) return null;
    const list = trends.citationActivity;
    const maxVal = Math.max(...list.map((d) => d.citations), 1);
    const width = 500;
    const height = 180;
    const step = list.length > 1 ? width / (list.length - 1) : width;

    const points = list.map((d, index) => {
      const x = index * step;
      const y = height - (d.citations / maxVal) * (height - 20) - 10;
      return { x, y, ...d };
    });

    const pointsString = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const areaString = `0,${height} ${pointsString} ${width},${height}`;

    return { list, maxVal, points, pointsString, areaString, width, height };
  }, [trends]);

  return (
    <main id="main-content" className="min-h-screen bg-slate-50">
      {/* Top Hero & Control Section */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-600">
                <Sparkles size={16} /> OpenAlex Live Research Intelligence
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Topic Trends Dashboard
              </h1>
              <p className="mt-2 max-w-2xl text-slate-600">
                Explore publication momentum, citation trajectory, breakthrough papers, and leading researchers over time.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => refetch()}
                className="btn-secondary h-10 px-3"
                title="Refresh current topic analytics"
              >
                <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>
          </div>

          {/* Search Bar with Autocomplete & Filter Controls */}
          <div className="mt-7 grid gap-3 lg:grid-cols-[minmax(300px,1fr)_auto_auto]">
            {/* Topic Search Box & Suggestions Dropdown */}
            <div ref={dropdownRef} className="relative">
              <form onSubmit={handleSearchSubmit} role="search" className="relative">
                <Search aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <label className="sr-only" htmlFor="topic-search">Search an academic topic</label>
                <input
                  id="topic-search"
                  role="combobox"
                  className="input pl-10! h-11 w-full pr-24"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  aria-autocomplete="list"
                  aria-controls="topic-suggestions"
                  aria-expanded={isDropdownOpen && searchQuery.trim().length >= 2}
                  placeholder="Search any academic topic (e.g. Quantum Computing, Cancer Immunotherapy)..."
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100"
                >
                  Analyze
                </button>
              </form>

              {/* Autocomplete Dropdown */}
              {isDropdownOpen && searchQuery.trim().length >= 2 && (
                <div id="topic-suggestions" role="listbox" aria-label="Matching OpenAlex topics" className="absolute left-0 right-0 top-full z-30 mt-1 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                  {isSearchingSuggestions ? (
                    <div className="flex items-center gap-2 p-3 text-sm text-slate-400">
                      <RefreshCw size={14} className="animate-spin" /> Searching OpenAlex topics...
                    </div>
                  ) : suggestions.length > 0 ? (
                    <div className="space-y-1">
                      <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Matching OpenAlex Topics
                      </div>
                      {suggestions.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          role="option"
                          aria-selected={selectedTopicId === item.id}
                          onClick={() => handleSelectTopic(item)}
                          className="flex w-full items-start justify-between rounded-lg p-2.5 text-left transition hover:bg-slate-50"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {item.subfield?.name || item.field?.name || item.domain?.name || 'Academic Field'}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                            {formatNumber(item.worksCount)} papers
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-sm text-slate-500">
                      No exact topic match found. Press <strong>Analyze</strong> to search works.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Time Range Preset Buttons */}
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100/70 p-1">
              {PRESET_RANGES.map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => handlePresetRange(preset.years)}
                  aria-pressed={!isCustomRange && toYear - fromYear + 1 === preset.years}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    !isCustomRange && toYear - fromYear + 1 === preset.years
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsCustomRange(!isCustomRange)}
                aria-pressed={isCustomRange}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                  isCustomRange ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Custom
              </button>
            </div>

            {/* Apply / Scope Indicator */}
            {isCustomRange && (
              <div className="flex items-center gap-2">
                <label className="sr-only" htmlFor="from-year">From year</label>
                <input
                  id="from-year"
                  type="number"
                  min="1990"
                  max={toYear}
                  value={fromYear}
                  onChange={(e) => setFromYear(Number(e.target.value))}
                  className="input h-11 w-24 px-2.5 text-center text-xs"
                  placeholder="From"
                />
                <span className="text-slate-400">–</span>
                <label className="sr-only" htmlFor="to-year">To year</label>
                <input
                  id="to-year"
                  type="number"
                  min={fromYear}
                  max={currentYear}
                  value={toYear}
                  onChange={(e) => setToYear(Number(e.target.value))}
                  className="input h-11 w-24 px-2.5 text-center text-xs"
                  placeholder="To"
                />
              </div>
            )}
          </div>

          {/* Trending & Popular Topic Quick Pills */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="flex items-center gap-1 font-medium text-slate-500">
              <TrendingUp size={13} /> Popular:
            </span>
            {POPULAR_TOPICS.map((item) => (
              <button
                type="button"
                key={item.name}
                onClick={() => {
                  setSelectedTopicId(null);
                  setSearchQuery(item.query);
                  setActiveQuery(item.query);
                }}
                className={`rounded-full px-3 py-1 transition ${
                  activeQuery.toLowerCase() === item.query.toLowerCase()
                    ? 'bg-indigo-600 font-semibold text-white'
                    : 'bg-slate-100 font-medium text-slate-700 hover:bg-slate-200'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Topic Taxonomy Breadcrumb & Description
          {trends?.topic && (
            <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                  <Compass size={14} className="text-indigo-600" />
                  {trends.topic.domain && <span>{trends.topic.domain.name}</span>}
                  {trends.topic.field && (
                    <>
                      <span>›</span>
                      <span>{trends.topic.field.name}</span>
                    </>
                  )}
                  {trends.topic.subfield && (
                    <>
                      <span>›</span>
                      <span className="font-semibold text-indigo-700">{trends.topic.subfield.name}</span>
                    </>
                  )}
                </div>
                <div className="text-xs text-slate-500">
                  OpenAlex ID: <code className="rounded bg-white px-1.5 py-0.5 font-mono text-indigo-700">{trends.topic.id}</code>
                </div>
              </div>
              {trends.topic.description && (
                <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                  {trends.topic.description}
                </p>
              )}
            </div>
          )} */}
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-7 sm:px-6">
        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-6" role="status" aria-label="Loading topic trends">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="panel h-28 animate-pulse bg-slate-200/60" />
              ))}
            </div>
            <div className="grid gap-6 xl:grid-cols-2">
              <div className="panel h-80 animate-pulse bg-slate-200/60" />
              <div className="panel h-80 animate-pulse bg-slate-200/60" />
            </div>
          </div>
        )}

        {/* Error Alert */}
        {isError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center" role="alert">
            <h3 className="text-base font-semibold text-red-900">Failed to load topic trends</h3>
            <p className="mt-1 text-sm text-red-700">
              {error instanceof Error ? error.message : 'Could not retrieve data from OpenAlex. Please try again.'}
            </p>
            <button onClick={() => refetch()} className="btn-primary mt-4">
              Try Again
            </button>
          </div>
        )}

        {/* Data Loaded Display */}
        {!isLoading && trends && (
          <>
            {/* Top Metric Cards Strip */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Metric
                icon={<BookOpen size={20} />}
                label="Total Publications"
                value={formatNumber(trends.metrics.totalPublications)}
                change={
                  trends.metrics.growthPercentage >= 0
                    ? `+${trends.metrics.growthPercentage}%`
                    : `${trends.metrics.growthPercentage}%`
                }
                subtext={`Across ${trends.timeRange.fromYear}–${trends.timeRange.toYear}`}
                positive={trends.metrics.growthPercentage >= 0}
              />
              <Metric
                icon={<TrendingUp size={20} />}
                label="Total Citations"
                value={formatNumber(trends.metrics.totalCitations)}
                change="Global Impact"
                subtext="Academic references received"
                positive
              />
              <Metric
                icon={<BarChart3 size={20} />}
                label="Avg. Citations / Paper"
                value={trends.metrics.avgCitationsPerPaper.toString()}
                change="Impact Ratio"
                subtext="Citations per publication"
                positive
              />
              <Metric
                icon={<Award size={20} />}
                label="Peak Publication Year"
                value={trends.metrics.peakYear ? String(trends.metrics.peakYear) : 'N/A'}
                change={`${formatNumber(trends.metrics.peakPublications)} papers`}
                subtext="Highest single-year output"
                positive
              />
            </section>

            {/* Interactive Visualizations Row */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-950">Longitudinal Activity Visualisations</h2>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                    {trends.timeRange.fromYear}–{trends.timeRange.toYear}
                  </span>
                </div>
                <div aria-label="Chart display" className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveChartTab('both')}
                    aria-pressed={activeChartTab === 'both'}
                    className={`rounded px-2.5 py-1 font-medium transition ${
                      activeChartTab === 'both' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Side-by-Side
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveChartTab('publications')}
                    aria-pressed={activeChartTab === 'publications'}
                    className={`rounded px-2.5 py-1 font-medium transition ${
                      activeChartTab === 'publications' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Publications Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveChartTab('citations')}
                    aria-pressed={activeChartTab === 'citations'}
                    className={`rounded px-2.5 py-1 font-medium transition ${
                      activeChartTab === 'citations' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Citations Only
                  </button>
                </div>
              </div>

              <div
                className={`grid gap-6 ${
                  activeChartTab === 'both' ? 'xl:grid-cols-2' : 'grid-cols-1'
                }`}
              >
                {/* 1. Publication Growth Bar Chart */}
                {(activeChartTab === 'both' || activeChartTab === 'publications') && pubChartData && (
                  <div className="panel">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-950">Publication Growth by Year</h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Total research works indexed per year
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                        {trends.metrics.growthPercentage >= 0 ? `+${trends.metrics.growthPercentage}%` : `${trends.metrics.growthPercentage}%`} total growth
                      </span>
                    </div>

                    {/* Bar Chart Container */}
                    <div
                      className="relative mt-8"
                      role="img"
                      aria-label={`Bar chart of publication counts from ${trends.timeRange.fromYear} to ${trends.timeRange.toYear}. A data table follows for screen readers.`}
                    >
                      {/* Hover Info Banner */}
                      <div className="h-6 text-xs text-slate-600">
                        {hoveredBarIndex !== null && pubChartData.list[hoveredBarIndex] ? (
                          <span className="inline-flex items-center gap-2 font-medium">
                            <span className="rounded bg-slate-900 px-1.5 py-0.5 font-bold text-white">
                              {pubChartData.list[hoveredBarIndex].year}
                            </span>
                            <span className="font-bold text-indigo-600">
                              {pubChartData.list[hoveredBarIndex].count.toLocaleString()} papers
                            </span>
                            {pubChartData.list[hoveredBarIndex].growthRate !== null && (
                              <span
                                className={`text-[11px] font-semibold ${
                                  (pubChartData.list[hoveredBarIndex].growthRate ?? 0) >= 0
                                    ? 'text-emerald-600'
                                    : 'text-red-500'
                                }`}
                              >
                                ({(pubChartData.list[hoveredBarIndex].growthRate ?? 0) >= 0 ? '+' : ''}
                                {pubChartData.list[hoveredBarIndex].growthRate}% YoY)
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-slate-400">Hover over any bar to view annual stats</span>
                        )}
                      </div>

                      {/* Bar Columns */}
                      <div className="mt-2 flex h-56 items-end gap-1.5 border-b border-slate-200 px-1 sm:gap-2">
                        {pubChartData.list.map((item, index) => {
                          const heightPercent = Math.max((item.count / pubChartData.maxCount) * 100, 3);
                          const isHovered = hoveredBarIndex === index;
                          return (
                            <div
                              key={item.year}
                              onMouseEnter={() => setHoveredBarIndex(index)}
                              onMouseLeave={() => setHoveredBarIndex(null)}
                              className="group relative flex h-full flex-1 cursor-pointer items-end"
                            >
                              <div
                                style={{ height: `${heightPercent}%` }}
                                className={`w-full rounded-t-md transition-all duration-200 ${
                                  isHovered
                                    ? 'bg-indigo-600 shadow-lg shadow-indigo-200 ring-2 ring-indigo-400'
                                    : 'bg-indigo-200/90 hover:bg-indigo-400'
                                }`}
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* X-Axis Labels */}
                      <div className="mt-3 flex justify-between text-[11px] font-medium text-slate-500">
                        {pubChartData.list.map((item, i) => {
                          // Show first, last, and every few years for legibility
                          const show =
                            i === 0 ||
                            i === pubChartData.list.length - 1 ||
                            i % Math.ceil(pubChartData.list.length / 5) === 0;
                          return (
                            <span key={item.year} className={show ? 'opacity-100' : 'opacity-0'}>
                              {item.year}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <table className="sr-only">
                      <caption>Publication growth by year</caption>
                      <thead><tr><th scope="col">Year</th><th scope="col">Publications</th><th scope="col">Growth rate</th></tr></thead>
                      <tbody>{pubChartData.list.map((item) => <tr key={item.year}><th scope="row">{item.year}</th><td>{item.count}</td><td>{item.growthRate === null ? 'Not available' : `${item.growthRate}%`}</td></tr>)}</tbody>
                    </table>
                  </div>
                )}

                {/* 2. Citation Activity Area Chart */}
                {(activeChartTab === 'both' || activeChartTab === 'citations') && citationChartData && (
                  <div className="panel">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-950">Citation Activity & Momentum</h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Annual citations across landmark papers in this topic
                        </p>
                      </div>
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                        Peak: {formatNumber(citationChartData.maxVal)} / yr
                      </span>
                    </div>

                    {/* Interactive Line & Area SVG */}
                    <div className="relative mt-8">
                      {/* Hover Info Banner */}
                      <div className="h-6 text-xs text-slate-600">
                        {hoveredCitationIndex !== null && citationChartData.list[hoveredCitationIndex] ? (
                          <span className="inline-flex items-center gap-2 font-medium">
                            <span className="rounded bg-slate-900 px-1.5 py-0.5 font-bold text-white">
                              {citationChartData.list[hoveredCitationIndex].year}
                            </span>
                            <span className="font-bold text-indigo-600">
                              {citationChartData.list[hoveredCitationIndex].citations.toLocaleString()} citations
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-400">Scrub or hover over chart to view annual citations</span>
                        )}
                      </div>

                      <div className="relative mt-2 h-56 border-b border-slate-200">
                        <svg
                          role="img"
                          aria-label={`Line chart of annual citations from ${trends.timeRange.fromYear} to ${trends.timeRange.toYear}. A data table follows for screen readers.`}
                          viewBox={`0 0 ${citationChartData.width} ${citationChartData.height}`}
                          preserveAspectRatio="none"
                          className="h-full w-full overflow-visible"
                        >
                          <defs>
                            <linearGradient id="citationGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Grid horizontal lines */}
                          {[0.25, 0.5, 0.75, 1].map((p) => (
                            <line
                              key={p}
                              x1="0"
                              x2={citationChartData.width}
                              y1={citationChartData.height * p}
                              y2={citationChartData.height * p}
                              stroke="#f1f5f9"
                              strokeWidth="1"
                            />
                          ))}

                          {/* Area Fill */}
                          <polygon points={citationChartData.areaString} fill="url(#citationGradient)" />

                          {/* Trend Line */}
                          <polyline
                            points={citationChartData.pointsString}
                            fill="none"
                            stroke="#4f46e5"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          {/* Interactive Points */}
                          {citationChartData.points.map((p, index) => (
                            <circle
                              key={p.year}
                              cx={p.x}
                              cy={p.y}
                              r={hoveredCitationIndex === index ? 6 : 4}
                              className={`cursor-pointer transition-all ${
                                hoveredCitationIndex === index
                                  ? 'fill-indigo-600 stroke-white stroke-2'
                                  : 'fill-white stroke-indigo-600 stroke-2'
                              }`}
                              onMouseEnter={() => setHoveredCitationIndex(index)}
                              onMouseLeave={() => setHoveredCitationIndex(null)}
                            />
                          ))}
                        </svg>
                      </div>

                      {/* X-Axis Labels */}
                      <div className="mt-3 flex justify-between text-[11px] font-medium text-slate-500">
                        {citationChartData.list.map((item, i) => {
                          const show =
                            i === 0 ||
                            i === citationChartData.list.length - 1 ||
                            i % Math.ceil(citationChartData.list.length / 5) === 0;
                          return (
                            <span key={item.year} className={show ? 'opacity-100' : 'opacity-0'}>
                              {item.year}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <table className="sr-only">
                      <caption>Citation activity by year</caption>
                      <thead><tr><th scope="col">Year</th><th scope="col">Citations</th></tr></thead>
                      <tbody>{citationChartData.list.map((item) => <tr key={item.year}><th scope="row">{item.year}</th><td>{item.citations}</td></tr>)}</tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>

            {/* Middle Section: Influential Authors & Related/Emerging Topics */}
            <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
              {/* Influential Authors Leaderboard */}
              <div className="panel p-0 overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 p-5">
                  <div>
                    <h3 className="font-bold text-slate-950">Influential Authors in this Topic</h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Top researchers ranked by academic citations and topic impact
                    </p>
                  </div>
                  <Users size={18} className="text-slate-400" />
                </div>

                <div className="divide-y divide-slate-100">
                  {trends.topAuthors.length > 0 ? (
                    trends.topAuthors.map((author, index) => {
                      const initials = author.name
                        .split(' ')
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase();
                      const colorClass = AUTHOR_COLORS[index % AUTHOR_COLORS.length];

                      return (
                        <div
                          key={author.id}
                          className="grid grid-cols-[32px_1fr_auto_auto] items-center gap-3 px-5 py-3.5 transition hover:bg-slate-50/70"
                        >
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                              index === 0
                                ? 'bg-amber-100 text-amber-800'
                                : index === 1
                                ? 'bg-slate-200 text-slate-700'
                                : index === 2
                                ? 'bg-orange-100 text-orange-800'
                                : 'text-slate-400'
                            }`}
                          >
                            {index + 1}
                          </span>

                          <div className="flex min-w-0 items-center gap-3">
                            <span
                              className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-bold ${colorClass}`}
                            >
                              {initials}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">{author.name}</p>
                              <p className="truncate text-xs text-slate-500">
                                {author.institution || 'Independent / International Scholar'}
                              </p>
                            </div>
                          </div>

                          <div className="hidden text-right sm:block">
                            <div className="flex items-center justify-end gap-1.5">
                              {author.hIndex !== null && (
                                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
                                  h-index {author.hIndex}
                                </span>
                              )}
                              <span className="text-xs text-slate-500">
                                <strong>{formatNumber(author.worksCount)}</strong> papers
                              </span>
                            </div>
                          </div>

                          <div className="w-24 text-right">
                            <p className="text-sm font-bold text-slate-900">
                              {formatNumber(author.citedByCount)}
                            </p>
                            <p className="text-[10px] text-slate-400">citations</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center text-sm text-slate-400">
                      No leading authors found for this topic filter.
                    </div>
                  )}
                </div>
              </div>

              {/* Related & Emerging Topics */}
              <div className="panel flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-950">Related & Emerging Topics</h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Neighboring research subfields identified by OpenAlex
                      </p>
                    </div>
                    <Layers size={18} className="text-slate-400" />
                  </div>

                  <div className="mt-5 space-y-3">
                    {trends.relatedTopics.length > 0 ? (
                      trends.relatedTopics.map((rel) => (
                        <div
                          key={rel.id}
                          className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 transition hover:border-indigo-200 hover:bg-white"
                        >
                          <div className="min-w-0 pr-3">
                            <button
                              type="button"
                              onClick={() => handleSelectTopic(rel)}
                              className="text-left text-sm font-semibold text-slate-900 transition hover:text-indigo-600"
                            >
                              {rel.name}
                            </button>
                            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                              {rel.subfield && (
                                <span className="rounded bg-slate-200/60 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                                  {rel.subfield}
                                </span>
                              )}
                              <span>{formatNumber(rel.worksCount)} papers</span>
                              <span>·</span>
                              <span>{formatNumber(rel.citedByCount)} citations</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSelectTopic(rel)}
                            className="shrink-0 rounded-lg bg-indigo-50 p-2 text-indigo-600 transition hover:bg-indigo-100"
                            aria-label={`Explore ${rel.name} trends`}
                          >
                            <ArrowRight size={15} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-xs text-slate-400">
                        No sibling topics linked to this cluster.
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-500">
                  <p className="flex items-center gap-1.5 font-medium text-slate-700">
                    <Sparkles size={14} className="text-indigo-600" /> Tip:
                  </p>
                  Click any related topic above to pivot the dashboard and track its publication growth and author ecosystem.
                </div>
              </div>
            </section>

            {/* Highly Cited Landmark Publications */}
            <section className="panel p-0 overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 p-5">
                <div>
                  <h3 className="font-bold text-slate-950">Landmark & Highly Cited Publications</h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Most referenced foundation papers shaping this academic domain
                  </p>
                </div>
                <BookOpen size={18} className="text-slate-400" />
              </div>

              <div className="divide-y divide-slate-100">
                {trends.highlyCitedWorks.length > 0 ? (
                  trends.highlyCitedWorks.map((work, idx) => (
                    <div
                      key={work.id}
                      className="flex flex-col gap-3 p-5 transition hover:bg-slate-50/60 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                          {work.publicationYear && (
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                              {work.publicationYear}
                            </span>
                          )}
                          {work.isOpenAccess && (
                            <span className="badge badge-green text-[11px]">Open Access</span>
                          )}
                          {work.venue && (
                            <span className="text-xs font-medium text-slate-500">{work.venue}</span>
                          )}
                        </div>

                        <h4 className="text-base font-semibold leading-snug text-slate-900">
                          {work.title}
                        </h4>

                        <p className="text-xs text-slate-500">
                          {work.authors.map((a) => a.name).slice(0, 4).join(', ')}
                          {work.authors.length > 4 ? ` et al. (+${work.authors.length - 4})` : ''}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
                        <div className="text-right">
                          <span className="text-base font-bold text-indigo-700">
                            {formatNumber(work.citedByCount)}
                          </span>
                          <span className="ml-1 text-xs text-slate-500">citations</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/?q=${encodeURIComponent(work.title)}`}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            Explore in Search
                          </Link>
                          {work.sourceUrl && (
                            <a
                              href={work.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                              title="Open original publication"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-sm text-slate-400">
                    No landmark works indexed for this topic.
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        <p className="pb-2 text-center text-xs text-slate-400">
          Real-time bibliometric metrics sourced dynamically from the OpenAlex Global Research Index
        </p>
      </div>
    </main>
  );
}

function Metric({
  icon,
  label,
  value,
  change,
  subtext,
  positive = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  subtext?: string;
  positive?: boolean;
}) {
  return (
    <div className="panel">
      <div className="flex items-start justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
          {icon}
        </span>
        <span
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
            positive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
          }`}
        >
          {change.startsWith('+') ? <ArrowUp size={12} /> : change.startsWith('-') ? <ArrowDown size={12} /> : null}
          {change}
        </span>
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight text-slate-950">{value}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-700">{label}</p>
      {subtext && <p className="mt-1 text-xs text-slate-400">{subtext}</p>}
    </div>
  );
}
