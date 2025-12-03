import { NextRequest, NextResponse } from "next/server";
import { createChatCompletion } from "@/lib/llm/client";
import { getPapers, isKVConfigured } from "@/lib/storage/kv";
import stubPapers from "@/lib/data/stub-papers.json";

export const runtime = "edge";

/**
 * Chat API route with retrieval-augmented generation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, filters } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request: messages array required" },
        { status: 400 }
      );
    }

    // Get papers data for context
    let papers;
    if (isKVConfigured()) {
      papers = await getPapers();
    }
    if (!papers) {
      papers = stubPapers.papers;
    }

    // Filter papers based on user filters
    let relevantPapers = papers;
    if (filters) {
      if (filters.yearRange) {
        const [minYear, maxYear] = filters.yearRange;
        relevantPapers = relevantPapers.filter(
          (p) => p.year >= minYear && p.year <= maxYear
        );
      }
      if (filters.venues && filters.venues.length > 0) {
        relevantPapers = relevantPapers.filter((p) =>
          filters.venues.includes(p.venue)
        );
      }
    }

    // Get the user's last message
    const userMessage = messages[messages.length - 1]?.content || "";

    // Simple keyword-based retrieval (in production, use embeddings)
    const keywords = userMessage.toLowerCase().split(/\s+/);
    const scoredPapers = relevantPapers.map((paper) => {
      const text = `${paper.title} ${paper.abstract || ""} ${paper.tags.join(" ")}`.toLowerCase();
      const score = keywords.reduce((acc: number, keyword: string) => {
        return acc + (text.includes(keyword) ? 1 : 0);
      }, 0);
      return { paper, score };
    });

    // Get top 5 most relevant papers
    const topPapers = scoredPapers
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .filter((p) => p.score > 0)
      .map((p) => p.paper);

    // Build context from relevant papers
    const context = topPapers.length > 0
      ? `Here are some relevant FLock research papers:\n\n${topPapers
          .map(
            (p) =>
              `- "${p.title}" (${p.year}, ${p.venue})\n  Authors: ${p.authors.join(", ")}\n  ${
                p.abstract ? `Abstract: ${p.abstract}\n` : ""
              }  Citations: ${p.citationCount}\n  Keywords: ${p.tags.join(", ")}`
          )
          .join("\n\n")}`
      : "No specific papers match the query, but I can provide general information about FLock research.";

    // Build system prompt with context
    const systemPrompt = `You are a helpful research assistant for FLock.io, specializing in federated learning, decentralized AI, and privacy-preserving machine learning. 

${context}

Use the above papers as context when answering questions. Be concise, accurate, and cite specific papers when relevant. If you don't have enough information, say so.`;

    // Call FLock LLM API
    const completion = await createChatCompletion({
      model: process.env.FLOCK_MODEL || "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-5), // Include last 5 messages for context
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const assistantMessage = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response.";

    return NextResponse.json({
      message: assistantMessage,
      relevantPapers: topPapers.map((p) => p.id),
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    
    // Return a helpful error message
    if (error instanceof Error && error.message.includes("FLOCK_API_KEY")) {
      return NextResponse.json({
        message: "I'm currently in demo mode. The LLM chat will be fully functional once the FLock API credentials are configured. However, I can still help you explore the research papers through the other features of this site!",
        relevantPapers: [],
      });
    }
    
    return NextResponse.json(
      { error: "Failed to process chat request", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

