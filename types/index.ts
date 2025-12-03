// Core data models for the FLock research visualization site

export interface Paper {
  id: string; // stable internal ID (hash of scholarId + title)
  scholarId: string; // Google Scholar's internal identifier
  title: string;
  authors: string[]; // array of author names
  year: number;
  venue: string; // normalized venue (e.g., "NeurIPS", "ICML", "arXiv")
  venueDisplay: string; // raw venue string as shown on Scholar
  citationCount: number;
  url?: string; // canonical link (publisher or arXiv)
  abstract?: string; // if available
  tags: string[]; // derived keywords
  isFlockPaper: boolean; // true for FLock-authored papers
}

export interface CitationGraphNode {
  id: string;
  type: "flock" | "external" | "author";
  title: string;
  year?: number;
  venue?: string;
  isFlockPaper: boolean;
  citationCount: number;
  authors?: string[];
}

export interface CitationGraphEdge {
  sourceId: string;
  targetId: string;
  relationType: "cites" | "authored_by";
}

export interface CitationGraph {
  nodes: CitationGraphNode[];
  edges: CitationGraphEdge[];
}

export interface SemanticEmbedding {
  paperId: string;
  x: number; // 2D projection coordinate
  y: number; // 2D projection coordinate
  clusterId: number;
  keywords: string[];
  embedding?: number[]; // full embedding vector (optional, for similarity search)
}

export interface KeywordData {
  keyword: string;
  paperIds: string[];
  count: number;
  representativePapers: string[]; // IDs of top papers for this keyword
}

export interface KeywordsIndex {
  keywords: KeywordData[];
  lastUpdated: string;
}

export interface DataStats {
  totalPapers: number;
  totalCitations: number;
  totalVenues: number;
  topVenues: string[];
  lastUpdated: string;
}

// API response types
export interface PapersResponse {
  papers: Paper[];
  stats: DataStats;
}

export interface CitationGraphResponse {
  graph: CitationGraph;
  lastUpdated: string;
}

export interface SemanticEmbeddingsResponse {
  embeddings: SemanticEmbedding[];
  lastUpdated: string;
}

// Chat types
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  filters?: {
    yearRange?: [number, number];
    venues?: string[];
    topics?: string[];
  };
}

export interface ChatResponse {
  message: string;
  relevantPapers?: string[]; // paper IDs
}

// Venue metadata
export interface VenueInfo {
  id: string;
  name: string;
  fullName: string;
  category: "conference" | "journal" | "workshop" | "preprint";
  tier?: "top" | "mid" | "other";
  description?: string;
  url?: string;
}

