/**
 * Vercel KV storage wrapper
 * This provides a simple interface for storing and retrieving data
 */

import { Paper, CitationGraph, SemanticEmbedding, DataStats } from "@/types";

// Storage keys
const KEYS = {
  PAPERS: "papers",
  CITATION_GRAPH: "citation_graph",
  EMBEDDINGS: "embeddings",
  STATS: "stats",
  LAST_UPDATED: "last_updated",
} as const;

/**
 * Check if KV is configured
 */
export function isKVConfigured(): boolean {
  return !!(
    process.env.KV_REST_API_URL &&
    process.env.KV_REST_API_TOKEN
  );
}

/**
 * Get KV client (only available in production with Vercel KV)
 */
async function getKV() {
  if (!isKVConfigured()) {
    throw new Error("Vercel KV is not configured");
  }
  
  // Dynamically import @vercel/kv only when needed
  const { kv } = await import("@vercel/kv");
  return kv;
}

/**
 * Store papers data
 */
export async function storePapers(papers: Paper[]): Promise<void> {
  if (!isKVConfigured()) {
    console.warn("KV not configured, skipping storage");
    return;
  }
  
  const kvClient = await getKV();
  await kvClient.set(KEYS.PAPERS, papers);
}

/**
 * Get papers data
 */
export async function getPapers(): Promise<Paper[] | null> {
  if (!isKVConfigured()) {
    return null;
  }
  
  const kvClient = await getKV();
  return await kvClient.get<Paper[]>(KEYS.PAPERS);
}

/**
 * Store citation graph
 */
export async function storeCitationGraph(graph: CitationGraph): Promise<void> {
  if (!isKVConfigured()) {
    console.warn("KV not configured, skipping storage");
    return;
  }
  
  const kvClient = await getKV();
  await kvClient.set(KEYS.CITATION_GRAPH, graph);
}

/**
 * Get citation graph
 */
export async function getCitationGraph(): Promise<CitationGraph | null> {
  if (!isKVConfigured()) {
    return null;
  }
  
  const kvClient = await getKV();
  return await kvClient.get<CitationGraph>(KEYS.CITATION_GRAPH);
}

/**
 * Store semantic embeddings
 */
export async function storeEmbeddings(embeddings: SemanticEmbedding[]): Promise<void> {
  if (!isKVConfigured()) {
    console.warn("KV not configured, skipping storage");
    return;
  }
  
  const kvClient = await getKV();
  await kvClient.set(KEYS.EMBEDDINGS, embeddings);
}

/**
 * Get semantic embeddings
 */
export async function getEmbeddings(): Promise<SemanticEmbedding[] | null> {
  if (!isKVConfigured()) {
    return null;
  }
  
  const kvClient = await getKV();
  return await kvClient.get<SemanticEmbedding[]>(KEYS.EMBEDDINGS);
}

/**
 * Store stats
 */
export async function storeStats(stats: DataStats): Promise<void> {
  if (!isKVConfigured()) {
    console.warn("KV not configured, skipping storage");
    return;
  }
  
  const kvClient = await getKV();
  await kvClient.set(KEYS.STATS, stats);
}

/**
 * Get stats
 */
export async function getStats(): Promise<DataStats | null> {
  if (!isKVConfigured()) {
    return null;
  }
  
  const kvClient = await getKV();
  return await kvClient.get<DataStats>(KEYS.STATS);
}

/**
 * Update last updated timestamp
 */
export async function updateLastUpdated(): Promise<void> {
  if (!isKVConfigured()) {
    console.warn("KV not configured, skipping storage");
    return;
  }
  
  const kvClient = await getKV();
  await kvClient.set(KEYS.LAST_UPDATED, new Date().toISOString());
}

/**
 * Get last updated timestamp
 */
export async function getLastUpdated(): Promise<string | null> {
  if (!isKVConfigured()) {
    return null;
  }
  
  const kvClient = await getKV();
  return await kvClient.get<string>(KEYS.LAST_UPDATED);
}

