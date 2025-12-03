"use client";

import { useEffect, useState } from "react";
import { Paper, PapersResponse, SemanticEmbeddingsResponse } from "@/types";

export default function TopicsPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [embeddings, setEmbeddings] = useState<SemanticEmbeddingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [papersRes, embeddingsRes] = await Promise.all([
          fetch("/api/data/papers"),
          fetch("/api/data/embeddings"),
        ]);
        const papersData: PapersResponse = await papersRes.json();
        const embeddingsData: SemanticEmbeddingsResponse = await embeddingsRes.json();
        
        setPapers(papersData.papers);
        setEmbeddings(embeddingsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Extract all unique keywords
  const allKeywords = Array.from(
    new Set(papers.flatMap((p) => p.tags))
  ).sort();

  // Filter papers by keyword
  const filteredPapers = selectedKeyword
    ? papers.filter((p) => p.tags.includes(selectedKeyword))
    : papers;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Research Topics
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Explore FLock research by semantic topics and keywords
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Keywords Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold mb-4">Keywords</h2>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                <button
                  onClick={() => setSelectedKeyword(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedKeyword === null
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  All Topics ({papers.length})
                </button>
                {allKeywords.map((keyword) => {
                  const count = papers.filter((p) => p.tags.includes(keyword)).length;
                  return (
                    <button
                      key={keyword}
                      onClick={() => setSelectedKeyword(keyword)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        selectedKeyword === keyword
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {keyword} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Semantic Map Visualization */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700 shadow-lg">
              <h3 className="text-xl font-bold mb-4">Semantic Map</h3>
              <div className="relative h-[400px] bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950/20 dark:to-purple-950/20 rounded-lg overflow-hidden">
                {embeddings && embeddings.embeddings.length > 0 ? (
                  <svg width="100%" height="100%" className="absolute inset-0">
                    {/* Draw papers as circles */}
                    {embeddings.embeddings.map((emb) => {
                      const paper = papers.find((p) => p.id === emb.paperId);
                      if (!paper) return null;
                      
                      // Scale coordinates to fit the SVG (assuming embeddings are normalized 0-1)
                      const x = emb.x * 800 + 50;
                      const y = emb.y * 350 + 25;
                      
                      // Color by cluster
                      const clusterColors = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];
                      const color = clusterColors[emb.clusterId % clusterColors.length];
                      
                      return (
                        <g
                          key={emb.paperId}
                          onClick={() => setSelectedPaper(paper)}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <circle
                            cx={x}
                            cy={y}
                            r={Math.sqrt(paper.citationCount + 1) * 2 + 5}
                            fill={color}
                            opacity={0.7}
                          />
                          <title>{paper.title}</title>
                        </g>
                      );
                    })}
                  </svg>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">
                        Semantic embeddings will be computed and visualized here
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Clusters:</span>
                {["Federated Learning", "Privacy & Security", "Incentive Design", "Optimization", "Applications"].map((cluster, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"][i] + "20",
                      color: ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"][i],
                    }}
                  >
                    {cluster}
                  </span>
                ))}
              </div>
            </div>

            {/* Papers Grid */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">
                {selectedKeyword ? `Papers tagged with "${selectedKeyword}"` : "All Papers"}
              </h2>
              {filteredPapers.map((paper) => (
                <div
                  key={paper.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 cursor-pointer"
                  onClick={() => setSelectedPaper(paper)}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{paper.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {paper.authors.join(", ")}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-semibold rounded-full">
                        {paper.venue} {paper.year}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {paper.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`px-2 py-1 text-xs rounded ${
                          tag === selectedKeyword
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      {paper.citationCount} citations
                    </span>
                    {paper.url && (
                      <a
                        href={paper.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Read paper →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredPapers.length === 0 && (
              <div className="text-center text-gray-600 dark:text-gray-400 py-12">
                No papers found for the selected keyword.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Paper Detail Modal */}
      {selectedPaper && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPaper(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold flex-1">{selectedPaper.title}</h2>
              <button
                onClick={() => setSelectedPaper(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Authors</span>
                <p className="text-gray-700 dark:text-gray-300">{selectedPaper.authors.join(", ")}</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Venue</span>
                <p className="text-gray-700 dark:text-gray-300">{selectedPaper.venueDisplay}</p>
              </div>
              
              {selectedPaper.abstract && (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Abstract</span>
                  <p className="text-gray-700 dark:text-gray-300">{selectedPaper.abstract}</p>
                </div>
              )}
              
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Keywords</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedPaper.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {selectedPaper.citationCount} citations
                </span>
                {selectedPaper.url && (
                  <a
                    href={selectedPaper.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Read Full Paper
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

