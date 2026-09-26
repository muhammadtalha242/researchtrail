import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  OpenAlexWork,
  NormalizedWork,
  OpenAlexTopic,
  NormalizedTopic,
  OpenAlexAuthor,
  NormalizedAuthor,
  TopicTrendsResponse,
} from './openalex.types';
import { normalizeOpenAlexId, parseOpenAlexId, safeExternalUrl } from './openalex-security';

@Injectable()
export class OpenAlexService {
  private static readonly BASE_URL = 'https://api.openalex.org';
  private static readonly MAX_RESPONSE_BYTES = 15 * 1024 * 1024;
  private readonly apiKey = process.env.OPENALEX_API_KEY?.trim() || undefined;

  async searchWorks(input: {
    query: string;
    fromYear?: number;
    toYear?: number;
    openAccess?: boolean;
    sort?: 'relevance' | 'newest' | 'cited';
    page?: number;
  }) {
    this.validateYearRange(input.fromYear, input.toYear);
    const filters: string[] = [];
    if (input.fromYear && input.toYear) filters.push(`publication_year:${input.fromYear}-${input.toYear}`);
    else if (input.fromYear) filters.push(`publication_year:>${input.fromYear - 1}`);
    else if (input.toYear) filters.push(`publication_year:<${input.toYear + 1}`);
    if (input.openAccess) filters.push('open_access.is_oa:true');

    const sortMap = {
      relevance: 'relevance_score:desc',
      newest: 'publication_date:desc',
      cited: 'cited_by_count:desc',
    } as const;

    const response = await this.request<{ meta: { count: number; page: number; per_page: number }; results: OpenAlexWork[] }>(
      '/works',
      {
        search: input.query,
        filter: filters.length ? filters.join(',') : undefined,
        sort: sortMap[input.sort ?? 'relevance'],
        page: String(input.page ?? 1),
        per_page: '20',
      },
    );

    return {
      meta: response.meta,
      results: response.results.map((work) => this.normalizeWork(work)),
    };
  }

  async getWork(id: string): Promise<NormalizedWork> {
    const workId = parseOpenAlexId(id, 'work');
    const work = await this.request<OpenAlexWork>(`/works/${workId}`);
    return this.normalizeWork(work);
  }

  async getWorkWithRelated(id: string) {
    const work = await this.getWork(id);
    const related = await this.getWorksByIds(work.relatedWorkIds.slice(0, 6));
    return { work, related };
  }

  async getGraph(id: string) {
    const center = await this.getWork(id);
    const references = await this.getWorksByIds(center.referencedWorkIds.slice(0, 8));
    const citationsResponse = await this.request<{ results: OpenAlexWork[] }>('/works', {
      filter: `cites:${center.openAlexId}`,
      sort: 'cited_by_count:desc',
      per_page: '8',
    });
    const citations = citationsResponse.results.map((work) => this.normalizeWork(work));

    const unique = new Map<string, NormalizedWork>();
    [center, ...references, ...citations].forEach((work) => unique.set(work.openAlexId, work));

    return {
      centerId: center.openAlexId,
      nodes: [...unique.values()].map((work) => ({
        id: work.openAlexId,
        label: work.title,
        year: work.publicationYear,
        citedByCount: work.citedByCount,
        isOpenAccess: work.isOpenAccess,
        authors: work.authors.slice(0, 3).map((author) => author.name),
      })),
      edges: [
        ...references.map((work) => ({ id: `${center.openAlexId}->${work.openAlexId}`, source: center.openAlexId, target: work.openAlexId, type: 'reference' })),
        ...citations.map((work) => ({ id: `${work.openAlexId}->${center.openAlexId}`, source: work.openAlexId, target: center.openAlexId, type: 'citation' })),
      ],
    };
  }

  async getWorksByIds(ids: string[]) {
    const normalizedIds = [...new Set(ids.map(normalizeOpenAlexId).filter((id) => /^W\d{1,20}$/.test(id)))].slice(0, 100);
    if (!normalizedIds.length) return [];
    const response = await this.request<{ results: OpenAlexWork[] }>('/works', {
      filter: `openalex:${normalizedIds.join('|')}`,
      per_page: String(normalizedIds.length),
    });
    return response.results.map((work) => this.normalizeWork(work));
  }

  private async request<T>(path: string, params: Record<string, string | undefined> = {}): Promise<T> {
    const url = new URL(path, OpenAlexService.BASE_URL);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') url.searchParams.set(key, value);
    }
    if (this.apiKey) url.searchParams.set('api_key', this.apiKey);

    let response: Response;
    try {
      response = await fetch(url, {
        headers: { 'User-Agent': 'ResearchTrail/1.0 (academic discovery demo)' },
        signal: AbortSignal.timeout(12_000),
      });
    } catch {
      throw new BadGatewayException('OpenAlex could not be reached. Please try again.');
    }

    if (response.status === 404) throw new NotFoundException('OpenAlex resource not found.');
    if (!response.ok) {
      await response.body?.cancel();
      throw new BadGatewayException('OpenAlex returned an error. Please try again.');
    }

    const contentLength = Number(response.headers.get('content-length'));
    if (Number.isFinite(contentLength) && contentLength > OpenAlexService.MAX_RESPONSE_BYTES) {
      await response.body?.cancel();
      throw new BadGatewayException('OpenAlex returned an unexpectedly large response.');
    }

    try {
      return (await response.json()) as T;
    } catch {
      throw new BadGatewayException('OpenAlex returned an invalid response.');
    }
  }

  async searchTopics(query: string, limit = 10): Promise<NormalizedTopic[]> {
    if (!query?.trim()) return [];
    const response = await this.request<{ results: OpenAlexTopic[] }>('/topics', {
      search: query.trim(),
      per_page: String(limit),
    });
    return response.results.map((topic) => this.normalizeTopic(topic));
  }

  async getTopic(id: string): Promise<NormalizedTopic> {
    const topicId = parseOpenAlexId(id, 'topic');
    const response = await this.request<OpenAlexTopic>(`/topics/${topicId}`);
    return this.normalizeTopic(response);
  }

  async getTopicTrends(input: {
    topicId?: string;
    query?: string;
    fromYear?: number;
    toYear?: number;
  }): Promise<TopicTrendsResponse> {
    this.validateYearRange(input.fromYear, input.toYear);
    let topic: NormalizedTopic | null = null;
    if (input.topicId) {
      try {
        topic = await this.getTopic(input.topicId);
      } catch (err) {
        if (input.query) {
          const results = await this.searchTopics(input.query, 1);
          if (results.length) topic = results[0];
        }
        if (!topic) throw err;
      }
    } else if (input.query?.trim()) {
      const results = await this.searchTopics(input.query.trim(), 1);
      if (results.length) {
        topic = results[0];
      }
    }

    if (!topic) {
      // Default to Machine Learning / AI
      const defaults = await this.searchTopics('Machine Learning and Algorithms', 1);
      topic = defaults[0] ?? null;
    }

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    const currentYear = new Date().getFullYear();
    const toYear = input.toYear ? Math.min(input.toYear, currentYear) : currentYear;
    const fromYear = input.fromYear ? Math.max(1990, input.fromYear) : toYear - 9;
    if (fromYear > toYear) {
      throw new BadRequestException('The selected trend range does not include a completed year.');
    }

    const [groupByResponse, topWorksResponse, authorsResponse, siblingTopicsResponse] = await Promise.all([
      this.request<{ group_by: Array<{ key: string; count: number }> }>('/works', {
        filter: `topics.id:${topic.openAlexId}`,
        group_by: 'publication_year',
      }).catch(() => ({ group_by: [] })),

      this.request<{ results: OpenAlexWork[] }>('/works', {
        filter: `topics.id:${topic.openAlexId}`,
        sort: 'cited_by_count:desc',
        per_page: '12',
      }).catch(() => ({ results: [] })),

      this.request<{ results: OpenAlexAuthor[] }>('/authors', {
        filter: `topics.id:${topic.openAlexId}`,
        sort: 'cited_by_count:desc',
        per_page: '8',
      }).catch(() => ({ results: [] })),

      (async () => {
        const siblingIds = (topic.siblings ?? [])
          .slice(0, 8)
          .map((s) => normalizeOpenAlexId(s.id))
          .filter((id) => /^T\d{1,20}$/.test(id));
        if (!siblingIds.length) return [];
        try {
          const res = await this.request<{ results: OpenAlexTopic[] }>('/topics', {
            filter: `openalex:${siblingIds.join('|')}`,
            per_page: String(siblingIds.length),
          });
          return res.results.map((t) => this.normalizeTopic(t));
        } catch {
          return [];
        }
      })(),
    ]);

    const pubYearMap = new Map<number, number>();
    for (const item of groupByResponse.group_by || []) {
      const yr = parseInt(item.key, 10);
      if (!isNaN(yr)) {
        pubYearMap.set(yr, item.count);
      }
    }

    const publicationGrowth: Array<{ year: number; count: number; growthRate: number | null }> = [];
    let prevCount: number | null = null;
    let peakYear: number | null = null;
    let peakPublications = 0;

    for (let yr = fromYear; yr <= toYear; yr++) {
      const count = pubYearMap.get(yr) ?? 0;
      let growthRate: number | null = null;
      if (prevCount !== null && prevCount > 0) {
        growthRate = Math.round(((count - prevCount) / prevCount) * 100);
      }
      publicationGrowth.push({ year: yr, count, growthRate });
      prevCount = count;

      if (count > peakPublications) {
        peakPublications = count;
        peakYear = yr;
      }
    }

    const firstYearCount = publicationGrowth[0]?.count ?? 0;
    const lastYearCount = publicationGrowth[publicationGrowth.length - 1]?.count ?? 0;
    const growthPercentage =
      firstYearCount > 0
        ? Math.round(((lastYearCount - firstYearCount) / firstYearCount) * 100)
        : 0;

    const highlyCitedWorks = (topWorksResponse.results || []).map((w) => this.normalizeWork(w));

    const citationYearMap = new Map<number, number>();
    for (let yr = fromYear; yr <= toYear; yr++) {
      citationYearMap.set(yr, 0);
    }

    for (const work of topWorksResponse.results || []) {
      for (const c of work.counts_by_year || []) {
        if (c.year >= fromYear && c.year <= toYear) {
          citationYearMap.set(c.year, (citationYearMap.get(c.year) ?? 0) + c.cited_by_count);
        }
      }
    }

    const citationActivity = Array.from(citationYearMap.entries())
      .map(([year, citations]) => ({ year, citations }))
      .sort((a, b) => a.year - b.year);

    const topAuthors: NormalizedAuthor[] = (authorsResponse.results || []).map((author) => ({
      id: normalizeOpenAlexId(author.id),
      name: author.display_name,
      institution: author.last_known_institutions?.[0]?.display_name ?? null,
      worksCount: author.works_count ?? 0,
      citedByCount: author.cited_by_count ?? 0,
      hIndex: author.summary_stats?.h_index ?? null,
      i10Index: author.summary_stats?.i10_index ?? null,
    }));

    const relatedTopics = (siblingTopicsResponse || []).map((t) => ({
      id: t.id,
      name: t.name,
      worksCount: t.worksCount,
      citedByCount: t.citedByCount,
      subfield: t.subfield?.name ?? null,
    }));

    return {
      topic,
      timeRange: { fromYear, toYear },
      metrics: {
        totalPublications: topic.worksCount,
        totalCitations: topic.citedByCount,
        avgCitationsPerPaper:
          topic.worksCount > 0 ? Number((topic.citedByCount / topic.worksCount).toFixed(1)) : 0,
        growthPercentage,
        peakYear,
        peakPublications,
      },
      publicationGrowth,
      citationActivity,
      topAuthors,
      highlyCitedWorks,
      relatedTopics,
    };
  }

  private normalizeTopic(topic: OpenAlexTopic): NormalizedTopic {
    const openAlexId = normalizeOpenAlexId(topic.id);
    return {
      id: openAlexId,
      openAlexId,
      name: topic.display_name,
      description: topic.description || '',
      keywords: topic.keywords ?? [],
      subfield: topic.subfield ? { id: normalizeOpenAlexId(topic.subfield.id), name: topic.subfield.display_name } : null,
      field: topic.field ? { id: normalizeOpenAlexId(topic.field.id), name: topic.field.display_name } : null,
      domain: topic.domain ? { id: normalizeOpenAlexId(topic.domain.id), name: topic.domain.display_name } : null,
      worksCount: topic.works_count ?? 0,
      citedByCount: topic.cited_by_count ?? 0,
      siblings: (topic.siblings ?? []).map((sibling) => ({
        id: normalizeOpenAlexId(sibling.id),
        name: sibling.display_name,
      })),
    };
  }

  private normalizeWork(work: OpenAlexWork): NormalizedWork {
    const openAlexId = normalizeOpenAlexId(work.id);
    return {
      id: openAlexId,
      openAlexId,
      title: work.display_name || 'Untitled publication',
      abstract: this.rebuildAbstract(work.abstract_inverted_index),
      authors: (work.authorships ?? []).slice(0, 20).map((authorship) => ({
        id: normalizeOpenAlexId(authorship.author.id),
        name: authorship.author.display_name,
        institutions: (authorship.institutions ?? []).map((institution) => institution.display_name),
      })),
      topics: (work.topics ?? []).map((topic) => ({
        id: normalizeOpenAlexId(topic.id),
        name: topic.display_name,
        score: topic.score,
      })),
      publicationYear: work.publication_year,
      publicationDate: work.publication_date,
      publicationType: work.type,
      venue: work.primary_location?.source?.display_name ?? null,
      citedByCount: work.cited_by_count ?? 0,
      isOpenAccess: Boolean(work.open_access?.is_oa),
      openAccessStatus: work.open_access?.oa_status ?? null,
      doi: work.doi,
      sourceUrl:
        safeExternalUrl(work.best_oa_location?.landing_page_url) ??
        safeExternalUrl(work.primary_location?.landing_page_url) ??
        safeExternalUrl(work.doi) ??
        `https://openalex.org/${openAlexId}`,
      pdfUrl: safeExternalUrl(work.best_oa_location?.pdf_url ?? work.primary_location?.pdf_url),
      isRetracted: Boolean(work.is_retracted),
      referencedWorkIds: (work.referenced_works ?? []).map(normalizeOpenAlexId).filter((id) => /^W\d{1,20}$/.test(id)),
      relatedWorkIds: (work.related_works ?? []).map(normalizeOpenAlexId).filter((id) => /^W\d{1,20}$/.test(id)),
      countsByYear: (work.counts_by_year ?? []).map((entry) => ({
        year: entry.year,
        citedByCount: entry.cited_by_count,
      })),
    };
  }

  private rebuildAbstract(index: Record<string, number[]> | null): string | null {
    if (!index) return null;
    const positions: Array<[number, string]> = [];
    for (const [word, indexes] of Object.entries(index)) {
      for (const position of indexes) positions.push([position, word]);
    }
    positions.sort((a, b) => a[0] - b[0]);
    return positions.map(([, word]) => word).join(' ');
  }

  private validateYearRange(fromYear?: number, toYear?: number) {
    if (fromYear !== undefined && toYear !== undefined && fromYear > toYear) {
      throw new BadRequestException('fromYear must not be later than toYear.');
    }
  }
}
