export type OpenAlexWork = {
  id: string;
  doi: string | null;
  display_name: string;
  publication_year: number | null;
  publication_date: string | null;
  type: string | null;
  cited_by_count: number;
  is_retracted?: boolean;
  abstract_inverted_index: Record<string, number[]> | null;
  referenced_works: string[];
  related_works: string[];
  authorships: Array<{
    author: { id: string; display_name: string };
    institutions?: Array<{ id: string; display_name: string }>;
  }>;
  topics?: Array<{ id: string; display_name: string; score: number }>;
  primary_location?: {
    landing_page_url?: string | null;
    pdf_url?: string | null;
    source?: { display_name?: string | null } | null;
  } | null;
  best_oa_location?: {
    landing_page_url?: string | null;
    pdf_url?: string | null;
  } | null;
  open_access?: {
    is_oa?: boolean;
    oa_status?: string | null;
    oa_url?: string | null;
  } | null;
  counts_by_year?: Array<{ year: number; cited_by_count: number }>;
};

export type NormalizedWork = {
  id: string;
  openAlexId: string;
  title: string;
  abstract: string | null;
  authors: Array<{ id: string; name: string; institutions: string[] }>;
  topics: Array<{ id: string; name: string; score: number }>;
  publicationYear: number | null;
  publicationDate: string | null;
  publicationType: string | null;
  venue: string | null;
  citedByCount: number;
  isOpenAccess: boolean;
  openAccessStatus: string | null;
  doi: string | null;
  sourceUrl: string | null;
  pdfUrl: string | null;
  isRetracted: boolean;
  referencedWorkIds: string[];
  relatedWorkIds: string[];
  countsByYear?: Array<{ year: number; citedByCount: number }>;
};

export type OpenAlexTopic = {
  id: string;
  display_name: string;
  description?: string | null;
  keywords?: string[];
  subfield?: { id: string; display_name: string } | null;
  field?: { id: string; display_name: string } | null;
  domain?: { id: string; display_name: string } | null;
  works_count?: number;
  cited_by_count?: number;
  siblings?: Array<{ id: string; display_name: string }>;
};

export type NormalizedTopic = {
  id: string;
  openAlexId: string;
  name: string;
  description: string;
  keywords: string[];
  subfield: { id: string; name: string } | null;
  field: { id: string; name: string } | null;
  domain: { id: string; name: string } | null;
  worksCount: number;
  citedByCount: number;
  siblings: Array<{ id: string; name: string }>;
};

export type OpenAlexAuthor = {
  id: string;
  display_name: string;
  works_count?: number;
  cited_by_count?: number;
  last_known_institutions?: Array<{ id?: string; display_name: string }>;
  summary_stats?: {
    h_index?: number;
    i10_index?: number;
    '2yr_mean_citedness'?: number;
  };
};

export type NormalizedAuthor = {
  id: string;
  name: string;
  institution: string | null;
  worksCount: number;
  citedByCount: number;
  hIndex: number | null;
  i10Index: number | null;
};

export type TopicTrendsResponse = {
  topic: NormalizedTopic;
  timeRange: { fromYear: number; toYear: number };
  metrics: {
    totalPublications: number;
    totalCitations: number;
    avgCitationsPerPaper: number;
    growthPercentage: number;
    peakYear: number | null;
    peakPublications: number;
  };
  publicationGrowth: Array<{
    year: number;
    count: number;
    growthRate: number | null;
  }>;
  citationActivity: Array<{
    year: number;
    citations: number;
  }>;
  topAuthors: NormalizedAuthor[];
  highlyCitedWorks: NormalizedWork[];
  relatedTopics: Array<{
    id: string;
    name: string;
    worksCount: number;
    citedByCount: number;
    subfield: string | null;
  }>;
};
