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
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [hoverNode, setHoverNode] = useState<any>(null);
  const [filters, setFilters] = useState({
    showExternal: true,
    minYear: 2020,
    maxYear: 2025,
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
    
    // Highlight connected nodes
    if (graphData && node) {
      const neighbors = new Set();
      const links = new Set();
      
      graphData.graph.edges.forEach((edge) => {
        if (edge.sourceId === node.id) {
          neighbors.add(edge.targetId);
          links.add(`${edge.sourceId}-${edge.targetId}`);
        }
        if (edge.targetId === node.id) {
          neighbors.add(edge.sourceId);
          links.add(`${edge.sourceId}-${edge.targetId}`);
        }
      });
      
      neighbors.add(node.id);
      setHighlightNodes(neighbors);
      setHighlightLinks(links);
    }
  }, [graphData]);

  const handleBackgroundClick = useCallback(() => {
    setSelectedNode(null);
    setHighlightNodes(new Set());
    setHighlightLinks(new Set());
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  const graphDataForViz = filteredGraphData();

  // Get list of all papers for sidebar
  const allPapers = graphData?.graph.nodes.filter((n) => n.isFlockPaper).sort((a, b) => b.citationCount - a.citationCount) || [];

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

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Papers Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-200 dark:border-gray-700 max-h-[700px] overflow-y-auto">
              <h3 className="font-bold mb-3">All Papers ({allPapers.length})</h3>
              <div className="space-y-2">
                {allPapers.map((paper) => (
                  <button
                    key={paper.id}
                    onClick={() => {
                      handleNodeClick(paper);
                      // Scroll graph into view on mobile
                      document.getElementById('graph-container')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all text-sm ${
                      selectedNode?.id === paper.id
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                  >
                    <div className="font-semibold line-clamp-2 mb-1">{paper.title}</div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={selectedNode?.id === paper.id ? "text-indigo-200" : "text-gray-500 dark:text-gray-400"}>
                        {paper.venue} {paper.year}
                      </span>
                      <span className="font-semibold">{paper.citationCount} cites</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Graph Area */}
          <div className="lg:col-span-3">
            {/* Filters */}
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-200 dark:border-gray-700">
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
            <div id="graph-container" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
              {!mounted ? (
                <div className="h-[600px] flex items-center justify-center">
                  <div className="text-gray-600 dark:text-gray-400">Loading graph...</div>
                </div>
              ) : graphDataForViz && graphDataForViz.nodes.length > 0 ? (
                <div style={{ width: "100%", height: "600px", position: "relative" }}>
                  <ForceGraph2D
                graphData={graphDataForViz}
                nodeLabel={(node: any) => `${node.title}\n${node.venue || ""} ${node.year || ""}\n${node.citationCount} citations`}
                nodeColor={(node: any) => {
                  // Highlight selected node and its neighbors
                  if (highlightNodes.size > 0) {
                    return highlightNodes.has(node.id) 
                      ? (node.isFlockPaper ? "#6366f1" : "#ec4899")
                      : "#e5e7eb";
                  }
                  
                  if (!node.isFlockPaper) return "#ec4899"; // Pink for external
                  // Color by venue for FLock papers
                  const venueColors: Record<string, string> = {
                    "NeurIPS": "#6366f1",
                    "ICML": "#8b5cf6", 
                    "ICLR": "#a855f7",
                    "CVPR": "#c084fc",
                    "arXiv": "#10b981",
                    "IEEE": "#f59e0b",
                    "ACM": "#ef4444",
                  };
                  return venueColors[node.venue as string] || "#6366f1";
                }}
                nodeRelSize={8}
                nodeVal={(node: any) => {
                  // Size based on citation count (more citations = bigger node)
                  const baseSize = 3;
                  const citationSize = Math.sqrt(node.citationCount + 1) * 2;
                  return baseSize + citationSize;
                }}
                nodeCanvasObject={(node: any, ctx, globalScale) => {
                  // Draw custom node with label
                  const label = node.title;
                  const fontSize = 12 / globalScale;
                  const size = (3 + Math.sqrt(node.citationCount + 1) * 2) * 2;
                  
                  // Draw circle
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
                  ctx.fillStyle = node.isFlockPaper 
                    ? (node.venue === "arXiv" ? "#10b981" : 
                       node.venue === "IEEE" ? "#f59e0b" :
                       node.venue === "ICML" ? "#8b5cf6" :
                       "#6366f1")
                    : "#ec4899";
                  ctx.fill();
                  
                  // Add border
                  ctx.strokeStyle = "#ffffff";
                  ctx.lineWidth = 2 / globalScale;
                  ctx.stroke();
                  
                  // Draw label if zoomed in enough
                  if (globalScale > 1.5 && label) {
                    ctx.font = `${fontSize}px Sans-Serif`;
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillStyle = "#000000";
                    const maxWidth = 100;
                    const truncated = label.length > 30 ? label.substring(0, 30) + "..." : label;
                    ctx.fillText(truncated, node.x, node.y + size + 15);
                  }
                }}
                linkColor={(link: any) => {
                  const linkId = `${link.source.id || link.source}-${link.target.id || link.target}`;
                  return highlightLinks.has(linkId) ? "#6366f1" : "#e5e7eb";
                }}
                linkWidth={(link: any) => {
                  const linkId = `${link.source.id || link.source}-${link.target.id || link.target}`;
                  return highlightLinks.has(linkId) ? 3 : 1;
                }}
                linkDirectionalArrowLength={6}
                linkDirectionalArrowRelPos={0.8}
                linkDirectionalParticles={(link: any) => {
                  const linkId = `${link.source.id || link.source}-${link.target.id || link.target}`;
                  return highlightLinks.has(linkId) ? 4 : 0;
                }}
                linkDirectionalParticleWidth={3}
                linkDirectionalParticleSpeed={0.005}
                onNodeClick={handleNodeClick}
                onNodeHover={(node) => {
                  setHoverNode(node);
                  document.body.style.cursor = node ? "pointer" : "default";
                }}
                onBackgroundClick={handleBackgroundClick}
                width={1200}
                height={600}
                cooldownTicks={100}
                d3VelocityDecay={0.3}
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

                {/* Legend */}
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold mb-3">Venue Color Legend:</h3>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-indigo-600"></div>
              <span className="text-sm">NeurIPS / ICLR</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-purple-600"></div>
              <span className="text-sm">ICML</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-600"></div>
              <span className="text-sm">arXiv</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div>
              <span className="text-sm">IEEE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-sm">ACM</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-pink-500"></div>
              <span className="text-sm">Citing Papers</span>
            </div>
          </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Node size reflects citation count. Zoom and pan to explore. Click nodes or sidebar to highlight connections.
              </p>
            </div>

            {/* Graph Stats */}
            {graphData && (
              <div className="grid md:grid-cols-3 gap-6 mb-6">
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
              <div className="text-sm text-gray-600 dark:text-gray-400">Citation Edges</div>
            </div>
          </div>
        )}
            
            {/* Selected Node Details */}
            {selectedNode && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold flex-1">{selectedNode.title}</h3>
                  <button
                    onClick={() => {
                      setSelectedNode(null);
                      setHighlightNodes(new Set());
                      setHighlightLinks(new Set());
                    }}
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
                  {highlightNodes.size > 1 && (
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-3">
                      Connected to {highlightNodes.size - 1} other papers
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Info about citations */}
            {graphData && graphData.graph.edges.length === 0 && (
              <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> Citation edges between papers will appear here once we scrape citing papers from Google Scholar. 
                  The current view shows all {graphData.graph.nodes.filter((n) => n.isFlockPaper).length} FLock papers as independent nodes, 
                  sized by their citation count (total: {graphData.graph.nodes.reduce((sum, n) => sum + n.citationCount, 0)} citations).
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

