/**
 * Local file-based storage for development (when KV is not available)
 */

import fs from "fs";
import path from "path";
import { Paper, CitationGraph, SemanticEmbedding, DataStats } from "@/types";

const STORAGE_DIR = path.join(process.cwd(), ".cache");
const PAPERS_FILE = path.join(STORAGE_DIR, "papers.json");
const GRAPH_FILE = path.join(STORAGE_DIR, "citation-graph.json");
const EMBEDDINGS_FILE = path.join(STORAGE_DIR, "embeddings.json");
const STATS_FILE = path.join(STORAGE_DIR, "stats.json");
const LAST_UPDATED_FILE = path.join(STORAGE_DIR, "last-updated.txt");

// Ensure storage directory exists
function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

export async function localStorePapers(papers: Paper[]): Promise<void> {
  ensureStorageDir();
  fs.writeFileSync(PAPERS_FILE, JSON.stringify(papers, null, 2));
}

export async function localGetPapers(): Promise<Paper[] | null> {
  if (!fs.existsSync(PAPERS_FILE)) return null;
  const data = fs.readFileSync(PAPERS_FILE, "utf-8");
  return JSON.parse(data);
}

export async function localStoreCitationGraph(graph: CitationGraph): Promise<void> {
  ensureStorageDir();
  fs.writeFileSync(GRAPH_FILE, JSON.stringify(graph, null, 2));
}

export async function localGetCitationGraph(): Promise<CitationGraph | null> {
  if (!fs.existsSync(GRAPH_FILE)) return null;
  const data = fs.readFileSync(GRAPH_FILE, "utf-8");
  return JSON.parse(data);
}

export async function localStoreEmbeddings(embeddings: SemanticEmbedding[]): Promise<void> {
  ensureStorageDir();
  fs.writeFileSync(EMBEDDINGS_FILE, JSON.stringify(embeddings, null, 2));
}

export async function localGetEmbeddings(): Promise<SemanticEmbedding[] | null> {
  if (!fs.existsSync(EMBEDDINGS_FILE)) return null;
  const data = fs.readFileSync(EMBEDDINGS_FILE, "utf-8");
  return JSON.parse(data);
}

export async function localStoreStats(stats: DataStats): Promise<void> {
  ensureStorageDir();
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
}

export async function localGetStats(): Promise<DataStats | null> {
  if (!fs.existsSync(STATS_FILE)) return null;
  const data = fs.readFileSync(STATS_FILE, "utf-8");
  return JSON.parse(data);
}

export async function localUpdateLastUpdated(): Promise<void> {
  ensureStorageDir();
  fs.writeFileSync(LAST_UPDATED_FILE, new Date().toISOString());
}

export async function localGetLastUpdated(): Promise<string | null> {
  if (!fs.existsSync(LAST_UPDATED_FILE)) return null;
  return fs.readFileSync(LAST_UPDATED_FILE, "utf-8");
}

