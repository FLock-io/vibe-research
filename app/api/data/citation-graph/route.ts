import { NextResponse } from "next/server";
import { getCitationGraph, getLastUpdated, isKVConfigured } from "@/lib/storage/kv";
import { localGetCitationGraph, localGetLastUpdated } from "@/lib/storage/local";
import stubGraph from "@/lib/data/stub-citation-graph.json";

export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    // Try to get data from KV if configured
    if (isKVConfigured()) {
      const [graph, lastUpdated] = await Promise.all([
        getCitationGraph(),
        getLastUpdated(),
      ]);
      
      if (graph && lastUpdated) {
        return NextResponse.json({ graph, lastUpdated });
      }
    }
    
    // Try local file storage (for development)
    const [localGraph, localLastUpdated] = await Promise.all([
      localGetCitationGraph(),
      localGetLastUpdated(),
    ]);
    
    if (localGraph && localLastUpdated) {
      return NextResponse.json({ graph: localGraph, lastUpdated: localLastUpdated });
    }
    
    // Fall back to stub data
    return NextResponse.json(stubGraph);
  } catch (error) {
    console.error("Error fetching citation graph:", error);
    // Fall back to stub data on error
    return NextResponse.json(stubGraph);
  }
}

