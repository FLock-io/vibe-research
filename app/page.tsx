import Link from "next/link";
import { PapersResponse } from "@/types";
import { getPapers as getKVPapers, getStats, isKVConfigured } from "@/lib/storage/kv";
import stubPapers from "@/lib/data/stub-papers.json";

async function getPapersData(): Promise<PapersResponse> {
  // Try to get from KV first
  if (isKVConfigured()) {
    try {
      const [papers, stats] = await Promise.all([
        getKVPapers(),
        getStats(),
      ]);
      
      if (papers && stats) {
        return { papers, stats };
      }
    } catch (error) {
      console.error("Error fetching from KV:", error);
    }
  }
  
  // Fall back to stub data
  return stubPapers;
}

export default async function Home() {
  const data = await getPapersData();
  const { papers, stats } = data;
  
  // Get top cited papers
  const topPapers = [...papers]
    .sort((a, b) => b.citationCount - a.citationCount)
    .slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 py-20 sm:py-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                FLock Research
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
              Explore cutting-edge research in federated learning, decentralized AI, 
              and privacy-preserving machine learning
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Link
                href="/graph"
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                Explore Graph
              </Link>
              <Link
                href="/chat"
                className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700"
              >
                Ask the AI
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 shadow-md">
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {stats.totalPapers}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Papers
                </div>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 shadow-md">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.totalCitations}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Citations
                </div>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 shadow-md">
                <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                  {stats.totalVenues}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Venues
                </div>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 shadow-md">
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {new Date(stats.lastUpdated).getFullYear()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Latest
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Venues */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Published at Top Venues
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {stats.topVenues.map((venue) => (
              <Link
                key={venue}
                href={`/venues?venue=${venue}`}
                className="px-6 py-3 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg font-semibold text-indigo-700 dark:text-indigo-300 hover:from-indigo-200 hover:to-purple-200 dark:hover:from-indigo-900/50 dark:hover:to-purple-900/50 transition-all shadow-md hover:shadow-lg"
              >
                {venue}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Papers */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Most Cited Papers
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {topPapers.map((paper) => (
              <div
                key={paper.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-full">
                    {paper.venue}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {paper.year}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-3 line-clamp-2">
                  {paper.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {paper.abstract}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    {paper.authors.slice(0, 2).join(", ")}
                    {paper.authors.length > 2 && " et al."}
                  </span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {paper.citationCount} citations
                  </span>
                </div>
                {paper.url && (
                  <a
                    href={paper.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Read paper →
                  </a>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/venues"
              className="inline-block px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
            >
              View All Papers
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Dive Deeper into FLock Research
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Explore our interactive visualizations and chat with our AI to learn more
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/topics"
              className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl"
            >
              Explore Topics
            </Link>
            <Link
              href="/graph"
              className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-medium hover:bg-white/10 transition-all shadow-lg hover:shadow-xl"
            >
              View Citation Network
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
