export type Work = {
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
};

export type SearchResponse = {
  meta: { count: number; page: number; per_page: number };
  results: Work[];
};

export type GraphResponse = {
  centerId: string;
  nodes: Array<{
    id: string;
    label: string;
    year: number | null;
    citedByCount: number;
    isOpenAccess: boolean;
    authors: string[];
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    type: 'reference' | 'citation';
  }>;
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
  highlyCitedWorks: Work[];
  relatedTopics: Array<{
    id: string;
    name: string;
    worksCount: number;
    citedByCount: number;
    subfield: string | null;
  }>;
};
