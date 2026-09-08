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

export type SavedWork = {
  id: string;
  userId: string;
  openAlexId: string;
  title: string;
  abstract: string | null;
  authors: Array<{ id: string; name: string; institutions: string[] }>;
  topics: Array<{ id: string; name: string; score: number }>;
  publicationYear: number | null;
  publicationType: string | null;
  venue: string | null;
  citedByCount: number;
  isOpenAccess: boolean;
  doi: string | null;
  sourceUrl: string | null;
  status: 'TO_READ' | 'READING' | 'COMPLETED';
  note: string | null;
  collectionLinks: Array<{ collection: { id: string; name: string } }>;
};

export type Collection = {
  id: string;
  name: string;
  description: string | null;
  works: Array<{ savedWork: SavedWork }>;
};
