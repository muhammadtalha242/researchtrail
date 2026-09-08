import { BadGatewayException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAlexWork, NormalizedWork } from './openalex.types';

@Injectable()
export class OpenAlexService {
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor(config: ConfigService) {
    this.baseUrl = config.get<string>('OPENALEX_BASE_URL', 'https://api.openalex.org');
    this.apiKey = config.get<string>('OPENALEX_API_KEY') || undefined;
  }

  async searchWorks(input: {
    query: string;
    fromYear?: number;
    toYear?: number;
    openAccess?: boolean;
    sort?: 'relevance' | 'newest' | 'cited';
    page?: number;
  }) {
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
    const workId = this.normalizeId(id);
    try {
      const work = await this.request<OpenAlexWork>(`/works/${encodeURIComponent(workId)}`);
      return this.normalizeWork(work);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw error;
    }
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
    const normalizedIds = [...new Set(ids.map((id) => this.normalizeId(id)).filter(Boolean))].slice(0, 100);
    if (!normalizedIds.length) return [];
    const response = await this.request<{ results: OpenAlexWork[] }>('/works', {
      filter: `openalex:${normalizedIds.join('|')}`,
      per_page: String(normalizedIds.length),
    });
    return response.results.map((work) => this.normalizeWork(work));
  }

  private async request<T>(path: string, params: Record<string, string | undefined> = {}): Promise<T> {
    const url = new URL(path, this.baseUrl);
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

    if (response.status === 404) throw new NotFoundException('Publication not found.');
    if (!response.ok) {
      const body = await response.text();
      throw new BadGatewayException(`OpenAlex request failed (${response.status}): ${body.slice(0, 180)}`);
    }

    return (await response.json()) as T;
  }

  private normalizeId(id: string) {
    return decodeURIComponent(id).replace(/^https?:\/\/(api\.)?openalex\.org\//, '').trim();
  }

  private normalizeWork(work: OpenAlexWork): NormalizedWork {
    const openAlexId = this.normalizeId(work.id);
    return {
      id: openAlexId,
      openAlexId,
      title: work.display_name || 'Untitled publication',
      abstract: this.rebuildAbstract(work.abstract_inverted_index),
      authors: (work.authorships ?? []).slice(0, 20).map((authorship) => ({
        id: this.normalizeId(authorship.author.id),
        name: authorship.author.display_name,
        institutions: (authorship.institutions ?? []).map((institution) => institution.display_name),
      })),
      topics: (work.topics ?? []).map((topic) => ({
        id: this.normalizeId(topic.id),
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
        work.best_oa_location?.landing_page_url ??
        work.primary_location?.landing_page_url ??
        work.doi ??
        `https://openalex.org/${openAlexId}`,
      pdfUrl: work.best_oa_location?.pdf_url ?? work.primary_location?.pdf_url ?? null,
      isRetracted: Boolean(work.is_retracted),
      referencedWorkIds: (work.referenced_works ?? []).map((reference) => this.normalizeId(reference)),
      relatedWorkIds: (work.related_works ?? []).map((related) => this.normalizeId(related)),
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
}
