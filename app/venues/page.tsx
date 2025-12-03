"use client";

import { useEffect, useState } from "react";
import { Paper, PapersResponse } from "@/types";

const venueInfo: Record<string, { fullName: string; category: string; tier: string }> = {
  NeurIPS: { fullName: "Neural Information Processing Systems", category: "Conference", tier: "Top-tier" },
  ICML: { fullName: "International Conference on Machine Learning", category: "Conference", tier: "Top-tier" },
  ICLR: { fullName: "International Conference on Learning Representations", category: "Conference", tier: "Top-tier" },
  CVPR: { fullName: "Computer Vision and Pattern Recognition", category: "Conference", tier: "Top-tier" },
  AAAI: { fullName: "Association for the Advancement of Artificial Intelligence", category: "Conference", tier: "Top-tier" },
  arXiv: { fullName: "arXiv Preprint Server", category: "Preprint", tier: "Preprint" },
};

export default function VenuesPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"year" | "citations">("year");

  useEffect(() => {
    async function fetchPapers() {
      try {
        const res = await fetch("/api/data/papers");
        const data: PapersResponse = await res.json();
        setPapers(data.papers);
      } catch (error) {
        console.error("Error fetching papers:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPapers();
  }, []);

  // Group papers by venue
  const papersByVenue = papers.reduce((acc, paper) => {
    if (!acc[paper.venue]) {
      acc[paper.venue] = [];
    }
    acc[paper.venue].push(paper);
    return acc;
  }, {} as Record<string, Paper[]>);

  // Get filtered and sorted papers
  const filteredPapers = selectedVenue
    ? papersByVenue[selectedVenue] || []
    : papers;

  const sortedPapers = [...filteredPapers].sort((a, b) => {
    if (sortBy === "year") {
      return b.year - a.year;
    }
    return b.citationCount - a.citationCount;
  });

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
              Publication Venues
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            FLock research published at top-tier conferences and journals
          </p>
        </div>

        {/* Venue Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            <button
              onClick={() => setSelectedVenue(null)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedVenue === null
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              All Venues
            </button>
            {Object.keys(papersByVenue).map((venue) => (
              <button
                key={venue}
                onClick={() => setSelectedVenue(venue)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedVenue === venue
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {venue} ({papersByVenue[venue].length})
              </button>
            ))}
          </div>

          {/* Sort Controls */}
          <div className="flex justify-center gap-4">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Sort by:
            </label>
            <button
              onClick={() => setSortBy("year")}
              className={`text-sm font-medium ${
                sortBy === "year"
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
              }`}
            >
              Year
            </button>
            <span className="text-gray-400">|</span>
            <button
              onClick={() => setSortBy("citations")}
              className={`text-sm font-medium ${
                sortBy === "citations"
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
              }`}
            >
              Citations
            </button>
          </div>
        </div>

        {/* Venue Info (if selected) */}
        {selectedVenue && venueInfo[selectedVenue] && (
          <div className="max-w-4xl mx-auto mb-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
            <h2 className="text-2xl font-bold mb-2">{selectedVenue}</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
              {venueInfo[selectedVenue].fullName}
            </p>
            <div className="flex gap-4 text-sm">
              <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full">
                {venueInfo[selectedVenue].category}
              </span>
              <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full">
                {venueInfo[selectedVenue].tier}
              </span>
            </div>
          </div>
        )}

        {/* Papers List */}
        <div className="max-w-5xl mx-auto space-y-6">
          {sortedPapers.map((paper) => (
            <div
              key={paper.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
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
                    {paper.venue}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {paper.year}
                  </span>
                </div>
              </div>

              {paper.abstract && (
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {paper.abstract}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {paper.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    {paper.citationCount} citations
                  </span>
                  {paper.url && (
                    <a
                      href={paper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Read paper →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {sortedPapers.length === 0 && (
          <div className="text-center text-gray-600 dark:text-gray-400 py-12">
            No papers found for the selected venue.
          </div>
        )}
      </div>
    </div>
  );
}

