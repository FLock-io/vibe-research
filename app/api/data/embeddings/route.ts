import { NextResponse } from "next/server";
import { getEmbeddings, getLastUpdated, isKVConfigured } from "@/lib/storage/kv";
import stubEmbeddings from "@/lib/data/stub-embeddings.json";

export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    // Try to get data from KV if configured
    if (isKVConfigured()) {
      const [embeddings, lastUpdated] = await Promise.all([
        getEmbeddings(),
        getLastUpdated(),
      ]);
      
      if (embeddings && lastUpdated) {
        return NextResponse.json({ embeddings, lastUpdated });
      }
    }
    
    // Fall back to stub data
    return NextResponse.json(stubEmbeddings);
  } catch (error) {
    console.error("Error fetching embeddings:", error);
    // Fall back to stub data on error
    return NextResponse.json(stubEmbeddings);
  }
}

