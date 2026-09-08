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
};
