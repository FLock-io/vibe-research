/**
 * Extract keywords from paper titles and abstracts
 * Simple keyword extraction based on common ML/AI terms
 */

const RESEARCH_KEYWORDS = [
  // Core topics
  "federated learning",
  "decentralized",
  "blockchain",
  "privacy",
  "security",
  "machine learning",
  "deep learning",
  "artificial intelligence",
  "AI",
  
  // Privacy & Security
  "zero-knowledge",
  "proof",
  "differential privacy",
  "secure aggregation",
  "encryption",
  "privacy-preserving",
  
  // Federated Learning specific
  "gradient",
  "aggregation",
  "poisoning",
  "malicious",
  "byzantine",
  "attack",
  "defense",
  
  // Blockchain
  "smart contract",
  "consensus",
  "distributed ledger",
  
  // ML/AI
  "neural network",
  "model",
  "training",
  "inference",
  "optimization",
  "convergence",
  
  // Specific techniques
  "attention",
  "transformer",
  "recurrent",
  "graph",
  "GAN",
  "reinforcement learning",
  
  // Application domains
  "healthcare",
  "medical",
  "image",
  "vision",
  "NLP",
  "language model",
  "LLM",
  "text-to-video",
  "multi-modal",
  
  // Systems
  "edge computing",
  "IoT",
  "heterogeneous",
  "asynchronous",
  
  // Game theory
  "incentive",
  "mechanism design",
  "game theory",
  
  // Specific ML methods
  "supervised",
  "unsupervised",
  "semi-supervised",
  "transfer learning",
  
  // Blockchain specific
  "Bittensor",
  "cryptocurrency",
  "token",
];

/**
 * Extract keywords from a paper's title and abstract
 */
export function extractKeywordsFromText(title: string, abstract?: string): string[] {
  const text = `${title} ${abstract || ""}`.toLowerCase();
  const foundKeywords = new Set<string>();
  
  // Find matching keywords
  RESEARCH_KEYWORDS.forEach((keyword) => {
    if (text.includes(keyword.toLowerCase())) {
      foundKeywords.add(keyword);
    }
  });
  
  // Extract venue-specific keywords
  if (text.includes("neurips") || text.includes("nips")) {
    foundKeywords.add("conference: NeurIPS");
  }
  if (text.includes("icml")) {
    foundKeywords.add("conference: ICML");
  }
  if (text.includes("iclr")) {
    foundKeywords.add("conference: ICLR");
  }
  if (text.includes("cvpr")) {
    foundKeywords.add("conference: CVPR");
  }
  
  // Extract year if in title
  const yearMatch = title.match(/20\d{2}/);
  if (yearMatch) {
    foundKeywords.add(`year: ${yearMatch[0]}`);
  }
  
  // If we found nothing, add generic ML keywords
  if (foundKeywords.size === 0) {
    if (text.includes("learning")) foundKeywords.add("machine learning");
    if (text.includes("network")) foundKeywords.add("neural network");
    if (text.includes("model")) foundKeywords.add("model");
  }
  
  return Array.from(foundKeywords).slice(0, 10); // Max 10 keywords per paper
}

/**
 * Extract keywords from title only (for quick extraction)
 */
export function extractKeywordsFromTitle(title: string): string[] {
  const keywords: string[] = [];
  const lower = title.toLowerCase();
  
  // Key research areas
  if (lower.includes("federated") || lower.includes("federation")) {
    keywords.push("federated learning");
  }
  if (lower.includes("blockchain")) {
    keywords.push("blockchain");
  }
  if (lower.includes("privacy") || lower.includes("private")) {
    keywords.push("privacy");
  }
  if (lower.includes("security") || lower.includes("secure")) {
    keywords.push("security");
  }
  if (lower.includes("decentral")) {
    keywords.push("decentralized");
  }
  if (lower.includes("attack") || lower.includes("poison") || lower.includes("malicious")) {
    keywords.push("adversarial");
  }
  if (lower.includes("incentive") || lower.includes("game")) {
    keywords.push("incentive design");
  }
  if (lower.includes("zero-knowledge") || lower.includes("zk")) {
    keywords.push("zero-knowledge proof");
  }
  if (lower.includes("neural") || lower.includes("network")) {
    keywords.push("neural networks");
  }
  if (lower.includes("aggregation") || lower.includes("aggregate")) {
    keywords.push("aggregation");
  }
  if (lower.includes("gradient")) {
    keywords.push("gradient");
  }
  if (lower.includes("ai") || lower.includes("artificial intelligence")) {
    keywords.push("artificial intelligence");
  }
  if (lower.includes("llm") || lower.includes("language model")) {
    keywords.push("language models");
  }
  if (lower.includes("vision") || lower.includes("image") || lower.includes("visual")) {
    keywords.push("computer vision");
  }
  if (lower.includes("healthcare") || lower.includes("medical") || lower.includes("health")) {
    keywords.push("healthcare");
  }
  if (lower.includes("survey") || lower.includes("review")) {
    keywords.push("survey");
  }
  if (lower.includes("bittensor")) {
    keywords.push("Bittensor");
  }
  
  // If no keywords found, extract significant words (> 5 chars, capitalized)
  if (keywords.length === 0) {
    const words = title.split(/\s+/);
    words.forEach((word) => {
      if (word.length > 5 && /^[A-Z]/.test(word)) {
        keywords.push(word.toLowerCase());
      }
    });
  }
  
  return keywords.slice(0, 8); // Max 8 keywords
}

