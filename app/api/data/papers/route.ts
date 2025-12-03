import { NextResponse } from "next/server";
import { getPapers, getStats, isKVConfigured } from "@/lib/storage/kv";
import { localGetPapers, localGetStats } from "@/lib/storage/local";
import stubPapers from "@/lib/data/stub-papers.json";

export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    // Try to get data from KV if configured
    if (isKVConfigured()) {
      const [papers, stats] = await Promise.all([
        getPapers(),
        getStats(),
      ]);
      
      if (papers && stats) {
        return NextResponse.json({ papers, stats });
      }
    }
    
    // Try local file storage (for development)
    const [localPapers, localStats] = await Promise.all([
      localGetPapers(),
      localGetStats(),
    ]);
    
    if (localPapers && localStats) {
      return NextResponse.json({ papers: localPapers, stats: localStats });
    }
    
    // Fall back to stub data
    return NextResponse.json(stubPapers);
  } catch (error) {
    console.error("Error fetching papers:", error);
    // Fall back to stub data on error
    return NextResponse.json(stubPapers);
  }
}

