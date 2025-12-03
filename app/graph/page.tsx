"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { CitationGraphResponse, CitationGraphNode } from "@/types";

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(
  () => import("react-force-graph-2d").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-gray-600 dark:text-gray-400">Loading graph...</div>
      </div>
    ),
  }
);

export default function GraphPage() {
  const [graphData, setGraphData] = useState<CitationGraphResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedNode, setSelectedNode] = useState<CitationGraphNode | null>(null);
  const [filters, setFilters] = useState({
    showExternal: true,
    minYear: 2020,
    maxYear: 2024,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchGraph() {
      try {
        const res = await fetch("/api/data/citation-graph");
        const data: CitationGraphResponse = await res.json();
        setGraphData(data);
      } catch (error) {
        console.error("Error fetching graph:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchGraph();
  }, []);

  // Filter graph data based on filters
  const filteredGraphData = useCallback(() => {
    if (!graphData) return null;

    let nodes = graphData.graph.nodes.filter((node) => {
      if (!filters.showExternal && !node.isFlockPaper) return false;
      if (node.year && (node.year < filters.minYear || node.year > filters.maxYear)) return false;
      return true;
    });

    const nodeIds = new Set(nodes.map((n) => n.id));
    const edges = graphData.graph.edges.filter(
      (edge) => nodeIds.has(edge.sourceId) && nodeIds.has(edge.targetId)
    );

    return { nodes, links: edges };
  }, [graphData, filters]);

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  const graphDataForViz = filteredGraphData();

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Citation Network
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Explore connections between FLock papers and citing research
          </p>
        </div>

        {/* Filters */}
        <div className="max-w-4xl mx-auto mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-4 items-center">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.showExternal}
                onChange={(e) => setFilters({ ...filters, showExternal: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Show citing papers</span>
            </label>
            
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 dark:text-gray-300">Year range:</label>
              <input
                type="number"
                value={filters.minYear}
                onChange={(e) => setFilters({ ...filters, minYear: parseInt(e.target.value) })}
                className="w-20 px-2 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                value={filters.maxYear}
                onChange={(e) => setFilters({ ...filters, maxYear: parseInt(e.target.value) })}
                className="w-20 px-2 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm"
              />
            </div>
          </div>
        </div>

        {/* Graph Visualization */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
          {!mounted ? (
            <div className="h-[600px] flex items-center justify-center">
              <div className="text-gray-600 dark:text-gray-400">Loading graph...</div>
            </div>
          ) : graphDataForViz && graphDataForViz.nodes.length > 0 ? (
            <div style={{ width: "100%", height: "600px" }}>
              <ForceGraph2D
                graphData={graphDataForViz}
                nodeLabel="title"
                nodeColor={(node: any) => (node.isFlockPaper ? "#6366f1" : "#ec4899")}
                nodeRelSize={6}
                nodeVal={(node: any) => Math.sqrt(node.citationCount + 1) * 2}
                linkColor={() => "#94a3b8"}
                linkWidth={1}
                linkDirectionalArrowLength={3}
                linkDirectionalArrowRelPos={1}
                onNodeClick={handleNodeClick}
                width={1200}
                height={600}
              />
            </div>
          ) : (
            <div className="h-[600px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">No data matches the current filters</p>
              </div>
            </div>
          )}
        </div>

        {/* Graph Stats */}
        {graphData && (
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                {graphData.graph.nodes.filter((n) => n.isFlockPaper).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">FLock Papers</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {graphData.graph.nodes.filter((n) => !n.isFlockPaper).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Citing Papers</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-3xl font-bold text-pink-600 dark:text-pink-400 mb-2">
                {graphData.graph.edges.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Citations</div>
            </div>
          </div>
        )}

        {/* Selected Node Details */}
        {selectedNode && (
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold flex-1">{selectedNode.title}</h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedNode.isFlockPaper
                      ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                      : "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300"
                  }`}
                >
                  {selectedNode.isFlockPaper ? "FLock Paper" : "Citing Paper"}
                </span>
                {selectedNode.venue && (
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                    {selectedNode.venue} {selectedNode.year}
                  </span>
                )}
              </div>
              {selectedNode.authors && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedNode.authors.join(", ")}
                </p>
              )}
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {selectedNode.citationCount} citations
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

