/**
 * Script to fetch all papers from Google Scholar and display stats
 * Run with: npx tsx scripts/fetch-scholar-data.ts
 */

import { scrapeScholarProfile, transformScrapedPapers } from "../lib/scraper/scholar";

async function main() {
  console.log("🔍 Fetching FLock papers from Google Scholar...\n");
  
  try {
    const result = await scrapeScholarProfile();
    const papers = transformScrapedPapers(result.papers);
    
    console.log("✅ Successfully scraped papers!\n");
    console.log("📊 Summary:");
    console.log(`   Total papers: ${papers.length}`);
    console.log(`   Total citations: ${papers.reduce((sum, p) => sum + p.citationCount, 0)}`);
    
    // Group by year
    const byYear = papers.reduce((acc, p) => {
      acc[p.year] = (acc[p.year] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    console.log("\n   Papers by year:");
    Object.entries(byYear)
      .sort(([a], [b]) => Number(b) - Number(a))
      .forEach(([year, count]) => {
        console.log(`   ${year}: ${count} papers`);
      });
    
    // Group by venue
    const byVenue = papers.reduce((acc, p) => {
      acc[p.venue] = (acc[p.venue] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log("\n   Top venues:");
    Object.entries(byVenue)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .forEach(([venue, count]) => {
        console.log(`   ${venue}: ${count} papers`);
      });
    
    // Show top cited papers
    console.log("\n   Top 5 cited papers:");
    papers
      .sort((a, b) => b.citationCount - a.citationCount)
      .slice(0, 5)
      .forEach((p, i) => {
        console.log(`   ${i + 1}. "${p.title}" (${p.citationCount} citations)`);
      });
    
    console.log("\n✨ Data ready to use!");
    console.log("\n💡 To update the live site, trigger the API endpoint:");
    console.log("   curl -X GET http://localhost:3000/api/refresh-scholar \\");
    console.log('     -H "Authorization: Bearer YOUR_CRON_SECRET"');
    
  } catch (error) {
    console.error("❌ Error fetching papers:", error);
    process.exit(1);
  }
}

main();

