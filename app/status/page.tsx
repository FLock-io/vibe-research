import { PapersResponse } from "@/types";
import { getStats, isKVConfigured } from "@/lib/storage/kv";
import stubPapers from "@/lib/data/stub-papers.json";

async function getStatsData() {
  if (isKVConfigured()) {
    try {
      const stats = await getStats();
      if (stats) return stats;
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }
  return stubPapers.stats;
}

export default async function StatusPage() {
  const stats = await getStatsData();
  
  const lastUpdated = new Date(stats.lastUpdated);
  const timeSinceUpdate = Date.now() - lastUpdated.getTime();
  const hoursSinceUpdate = Math.floor(timeSinceUpdate / (1000 * 60 * 60));

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                System Status
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Data pipeline and synchronization status
            </p>
          </div>

          {/* Status Cards */}
          <div className="space-y-6">
            {/* Data Freshness */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Data Freshness</h2>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-semibold rounded-full">
                  Operational
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Last Updated</span>
                  <span className="font-semibold">{lastUpdated.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Hours Since Update</span>
                  <span className="font-semibold">{hoursSinceUpdate}h ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Next Scheduled Update</span>
                  <span className="font-semibold">Within 24h</span>
                </div>
              </div>
            </div>

            {/* Data Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold mb-4">Current Data</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                    {stats.totalPapers}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Papers</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    {stats.totalCitations}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Citations</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-pink-600 dark:text-pink-400 mb-1">
                    {stats.totalVenues}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Unique Venues</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                    {stats.topVenues.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Top Venues</div>
                </div>
              </div>
            </div>

            {/* Data Source */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold mb-4">Data Source</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Source</span>
                  <a
                    href="https://scholar.google.com/citations?user=s0eOtD8AAAAJ&hl=en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Google Scholar Profile
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Sync Method</span>
                  <span className="font-semibold">Automated (Vercel Cron)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Sync Frequency</span>
                  <span className="font-semibold">Daily</span>
                </div>
              </div>
            </div>

            {/* System Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold mb-4">System Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Framework</span>
                  <span className="font-semibold">Next.js (App Router)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Hosting</span>
                  <span className="font-semibold">Vercel</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Storage</span>
                  <span className="font-semibold">Vercel KV</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">LLM Provider</span>
                  <span className="font-semibold">FLock API</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

