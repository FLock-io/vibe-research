import { NextRequest, NextResponse } from "next/server";
import { scrapeScholarProfile, transformScrapedPapers } from "@/lib/scraper/scholar";
import { Paper, DataStats, CitationGraph } from "@/types";
import { 
  storePapers, 
  storeStats, 
  storeCitationGraph,
  updateLastUpdated,
  isKVConfigured 
} from "@/lib/storage/kv";
import {
  localStorePapers,
  localStoreStats,
  localStoreCitationGraph,
  localUpdateLastUpdated,
} from "@/lib/storage/local";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow up to 60 seconds for scraping

/**
 * API route to refresh Scholar data
 * This will be called by Vercel Cron on a schedule
 */
export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    console.log("Starting Scholar profile scrape...");
    
    // Scrape the Scholar profile
    const scraperResult = await scrapeScholarProfile();
    
    console.log(`Scraped ${scraperResult.papers.length} papers`);
    
    // Transform to Paper format
    const papers = transformScrapedPapers(scraperResult.papers);
    
    // Calculate stats
    const stats: DataStats = {
      totalPapers: papers.length,
      totalCitations: papers.reduce((sum, p) => sum + p.citationCount, 0),
      totalVenues: new Set(papers.map((p) => p.venue)).size,
      topVenues: getTopVenues(papers, 10),
      lastUpdated: scraperResult.lastUpdated,
    };
    
    // Build citation graph
    const citationGraph = buildCitationGraph(papers, scraperResult.citingPapers);
    
    // Save to KV if configured, otherwise save to local files
    if (isKVConfigured()) {
      await Promise.all([
        storePapers(papers),
        storeStats(stats),
        storeCitationGraph(citationGraph),
        updateLastUpdated(),
      ]);
      console.log("Data saved to Vercel KV");
    } else {
      // Use local file storage for development
      await Promise.all([
        localStorePapers(papers),
        localStoreStats(stats),
        localStoreCitationGraph(citationGraph),
        localUpdateLastUpdated(),
      ]);
      console.log("Data saved to local file storage (.cache/)");
    }
    
    console.log("Scholar scrape completed successfully");
    
    return NextResponse.json({
      success: true,
      stats,
      message: `Successfully scraped ${papers.length} papers`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error refreshing Scholar data:", error);
    return NextResponse.json(
      {
        error: "Failed to refresh Scholar data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Get top venues by paper count
 */
function getTopVenues(papers: Paper[], limit: number): string[] {
  const venueCounts = papers.reduce((acc, paper) => {
    acc[paper.venue] = (acc[paper.venue] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(venueCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([venue]) => venue);
}

/**
 * Build citation graph from papers
 * Creates co-authorship connections when citation data is unavailable
 */
function buildCitationGraph(papers: Paper[], citingPapers: any[]): CitationGraph {
  const nodes = papers.map((paper) => ({
    id: paper.id,
    type: "flock" as const,
    title: paper.title,
    year: paper.year,
    venue: paper.venue,
    isFlockPaper: true,
    citationCount: paper.citationCount,
    authors: paper.authors,
  }));
  
  // Add external citing papers as nodes
  const externalNodes = citingPapers.map((citing) => ({
    id: `external-${citing.title.substring(0, 20).replace(/\s/g, "-")}`,
    type: "external" as const,
    title: citing.title,
    year: citing.year,
    venue: citing.venue,
    isFlockPaper: false,
    citationCount: 0,
    authors: citing.authors,
  }));
  
  // Build citation edges
  const citationEdges = citingPapers.map((citing) => ({
    sourceId: `external-${citing.title.substring(0, 20).replace(/\s/g, "-")}`,
    targetId: citing.citedPaperId,
    relationType: "cites" as const,
  }));
  
  // Build co-authorship edges (papers that share authors)
  const coauthorEdges: Array<{ sourceId: string; targetId: string; relationType: "authored_by" }> = [];
  for (let i = 0; i < papers.length; i++) {
    for (let j = i + 1; j < papers.length; j++) {
      const paper1 = papers[i];
      const paper2 = papers[j];
      
      // Check if they share any authors
      const sharedAuthors = paper1.authors.filter((author) =>
        paper2.authors.some((a) => a.toLowerCase() === author.toLowerCase())
      );
      
      if (sharedAuthors.length > 0) {
        coauthorEdges.push({
          sourceId: paper1.id,
          targetId: paper2.id,
          relationType: "authored_by",
        });
      }
    }
  }
  
  // If we have citing papers, use those edges; otherwise use co-authorship
  const edges = citationEdges.length > 0 ? citationEdges : coauthorEdges;
  
  return {
    nodes: [...nodes, ...externalNodes],
    edges,
  };
}

