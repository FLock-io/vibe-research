import * as cheerio from "cheerio";
import { Paper } from "@/types";
import crypto from "crypto";
import { extractKeywordsFromTitle } from "./extractKeywords";

const SCHOLAR_BASE_URL = "https://scholar.google.com";
const FLOCK_SCHOLAR_ID = "s0eOtD8AAAAJ";

// Venue normalization mapping
const VENUE_NORMALIZATION: Record<string, string> = {
  "neural information processing systems": "NeurIPS",
  "neurips": "NeurIPS",
  "nips": "NeurIPS",
  "international conference on machine learning": "ICML",
  "icml": "ICML",
  "international conference on learning representations": "ICLR",
  "iclr": "ICLR",
  "computer vision and pattern recognition": "CVPR",
  "cvpr": "CVPR",
  "aaai": "AAAI",
  "arxiv": "arXiv",
  "acm": "ACM",
  "ieee": "IEEE",
  "proceedings": "Conference",
  "workshop": "Workshop",
  "journal": "Journal",
  "neural networks": "Neural Networks",
};

function normalizeVenue(venueStr: string): string {
  if (!venueStr || venueStr.trim() === "") {
    return "Unpublished";
  }
  
  const lower = venueStr.toLowerCase();
  
  // Check for exact matches or substrings
  for (const [key, normalized] of Object.entries(VENUE_NORMALIZATION)) {
    if (lower.includes(key)) {
      return normalized;
    }
  }
  
  // Try to extract conference acronym (usually uppercase letters)
  const acronymMatch = venueStr.match(/\b([A-Z]{3,})\b/);
  if (acronymMatch) {
    return acronymMatch[1];
  }
  
  // Extract year and remove it, also remove punctuation at the end
  const withoutYear = venueStr
    .replace(/\d{4}/g, "")
    .replace(/[,:.]+$/g, "")
    .trim();
  
  // If the venue is too long, try to extract the first meaningful part
  if (withoutYear.length > 50) {
    const firstPart = withoutYear.split(/[,;]/)[0].trim();
    if (firstPart.length > 0) {
      return firstPart;
    }
  }
  
  return withoutYear || venueStr;
}

function generatePaperId(scholarId: string, title: string): string {
  const hash = crypto.createHash("md5").update(`${scholarId}-${title}`).digest("hex");
  return hash.substring(0, 16);
}

export interface ScrapedPaper {
  scholarId: string;
  title: string;
  authors: string[];
  year: number;
  venue: string;
  venueDisplay: string;
  citationCount: number;
  url?: string;
  abstract?: string;
}

export interface CitingPaper {
  title: string;
  authors: string[];
  year?: number;
  venue?: string;
  citedPaperId: string; // Which FLock paper it cites
}

export interface ScraperResult {
  papers: ScrapedPaper[];
  citingPapers: CitingPaper[];
  lastUpdated: string;
}

/**
 * Scrape the FLock Google Scholar profile page
 * Fetches ALL papers by paginating through results
 */
export async function scrapeScholarProfile(
  userId: string = FLOCK_SCHOLAR_ID,
  maxCitingPapersPerPaper: number = 10
): Promise<ScraperResult> {
  const allPapers: ScrapedPaper[] = [];
  let pageStart = 0;
  const pageSize = 100;
  let hasMorePages = true;
  
  try {
    // Fetch all pages of papers
    while (hasMorePages) {
      const profileUrl = `${SCHOLAR_BASE_URL}/citations?user=${userId}&hl=en&cstart=${pageStart}&pagesize=${pageSize}`;
      
      console.log(`Fetching Scholar page: cstart=${pageStart}`);
      
      // Use ScraperAPI if available, otherwise direct fetch
      const scraperApiKey = process.env.SCRAPER_API_KEY;
      const fetchUrl = scraperApiKey
        ? `http://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(profileUrl)}`
        : profileUrl;
      
      // Add a user agent to avoid being blocked
      const response = await fetch(fetchUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch Scholar profile: ${response.status}`);
      }
      
      const html = await response.text();
      const $ = cheerio.load(html);
      
      const pagePapers: ScrapedPaper[] = [];
      
      // Parse each publication row
      $(".gsc_a_tr").each((_, element) => {
        const $row = $(element);
        
        // Extract title and link
        const $titleLink = $row.find(".gsc_a_at");
        const title = $titleLink.text().trim();
        const paperUrl = $titleLink.attr("href");
        const scholarId = paperUrl ? paperUrl.match(/citation_for_view=([^&]+)/)?.[1] || "" : "";
        
        // Extract authors and venue
        const authorVenue = $row.find(".gs_gray").first().text().trim();
        const venueDisplay = $row.find(".gs_gray").eq(1).text().trim();
        
        // Extract authors (split by comma)
        const authors = authorVenue.split(",").map((a) => a.trim()).filter(Boolean);
        
        // Extract year
        const yearText = $row.find(".gsc_a_y span").text().trim();
        const year = yearText ? parseInt(yearText, 10) : new Date().getFullYear();
        
        // Extract citation count
        const citationText = $row.find(".gsc_a_c a").text().trim();
        const citationCount = citationText ? parseInt(citationText, 10) : 0;
        
        if (title) {
          pagePapers.push({
            scholarId,
            title,
            authors: authors.length > 0 ? authors : ["Unknown"],
            year,
            venue: normalizeVenue(venueDisplay),
            venueDisplay,
            citationCount,
            url: paperUrl ? `${SCHOLAR_BASE_URL}${paperUrl}` : undefined,
          });
        }
      });
      
      console.log(`Found ${pagePapers.length} papers on this page`);
      
      // If we found papers, add them and continue
      if (pagePapers.length > 0) {
        allPapers.push(...pagePapers);
        pageStart += pageSize;
        
        // If we got fewer papers than pageSize, we've reached the end
        if (pagePapers.length < pageSize) {
          hasMorePages = false;
        }
        
        // Add a small delay to be respectful to Google Scholar
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        hasMorePages = false;
      }
      
      // Safety limit: stop after 10 pages (1000 papers)
      if (pageStart >= 1000) {
        console.log("Reached safety limit of 1000 papers");
        hasMorePages = false;
      }
    }
    
    console.log(`Total papers scraped: ${allPapers.length}`);
    
    // For now, we'll skip scraping citing papers to avoid rate limiting
    // In production, this would be done more carefully with rate limiting and caching
    const citingPapers: CitingPaper[] = [];
    
    return {
      papers: allPapers,
      citingPapers,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error scraping Scholar profile:", error);
    throw error;
  }
}

/**
 * Transform scraped papers into the Paper type used by the app
 */
export function transformScrapedPapers(scraped: ScrapedPaper[]): Paper[] {
  return scraped.map((paper) => ({
    id: generatePaperId(paper.scholarId, paper.title),
    scholarId: paper.scholarId,
    title: paper.title,
    authors: paper.authors,
    year: paper.year,
    venue: paper.venue,
    venueDisplay: paper.venueDisplay,
    citationCount: paper.citationCount,
    url: paper.url,
    abstract: paper.abstract,
    tags: extractKeywordsFromTitle(paper.title), // Extract keywords from title
    isFlockPaper: true,
  }));
}

