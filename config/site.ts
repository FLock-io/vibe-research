export const siteConfig = {
  name: "FLock Research",
  description: "Explore FLock.io's cutting-edge research in federated learning, decentralized AI, and privacy-preserving machine learning",
  url: "https://research.flock.io",
  mainSiteUrl: "https://flock.io",
  scholarUrl: "https://scholar.google.com/citations?user=s0eOtD8AAAAJ&hl=en",
  
  nav: [
    { name: "Overview", href: "/" },
    { name: "Graph", href: "/graph" },
    { name: "Topics", href: "/topics" },
    { name: "Venues", href: "/venues" },
    { name: "Chat", href: "/chat" },
    { name: "About", href: "/about" },
  ],
  
  theme: {
    colors: {
      primary: "#6366f1", // indigo
      secondary: "#8b5cf6", // violet
      accent: "#ec4899", // pink
    },
  },
  
  stats: {
    refreshInterval: 24 * 60 * 60, // 24 hours in seconds
  },
};

export type SiteConfig = typeof siteConfig;

