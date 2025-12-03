# Papers Synchronization Guide

This guide explains how the FLock Research site automatically syncs with Google Scholar to display all your latest papers.

## How It Works

### 1. Source of Truth

The **Google Scholar profile** is the single source of truth:
- URL: https://scholar.google.com/citations?user=s0eOtD8AAAAJ&hl=en
- **All papers on this profile are considered FLock papers**
- The scraper fetches ALL papers (no limit)

### 2. Automatic Scraping

The scraper:
- ✅ Fetches **all pages** of papers (paginated)
- ✅ Extracts: title, authors, year, venue, citations, URL
- ✅ Normalizes venue names (e.g., "NeurIPS", "ICML", "arXiv")
- ✅ Handles multiple pages automatically
- ✅ Safety limit: 1000 papers max (10 pages)

### 3. Scheduling

**In Production (Vercel):**
- Runs automatically every day at **2:00 AM UTC**
- Configured via `vercel.json`
- No manual intervention needed

**In Development:**
- Run manually: `npm run fetch-papers` (preview only)
- Or trigger API: `curl -X GET http://localhost:3000/api/refresh-scholar -H "Authorization: Bearer YOUR_CRON_SECRET"`

## Testing the Scraper

### Preview Papers (No Side Effects)

```bash
npm run fetch-papers
```

This shows:
- Total papers found
- Papers by year
- Top venues
- Most cited papers
- **Does NOT update the live site**

### Update Live Site

```bash
# Development
curl -X GET http://localhost:3000/api/refresh-scholar \
  -H "Authorization: Bearer local-dev-secret-change-in-production"

# Production
curl -X GET https://your-domain.vercel.app/api/refresh-scholar \
  -H "Authorization: Bearer YOUR_PRODUCTION_CRON_SECRET"
```

This:
- Scrapes all papers
- Saves to Vercel KV (or uses stub data locally)
- Updates the live site immediately

## What Gets Scraped

For each paper on Google Scholar:

```typescript
{
  title: "Paper Title",
  authors: ["Author 1", "Author 2", ...],
  year: 2024,
  venue: "NeurIPS",           // Normalized
  venueDisplay: "NeurIPS 2024", // Original
  citationCount: 42,
  url: "https://scholar.google.com/...",
  scholarId: "unique_id",
  isFlockPaper: true          // Always true for this profile
}
```

## Venue Normalization

The scraper normalizes venue names for consistency:

| Original | Normalized |
|----------|-----------|
| Neural Information Processing Systems | NeurIPS |
| International Conference on Machine Learning | ICML |
| arXiv preprint arXiv:2401.12345 | arXiv |
| IEEE Transactions on... | IEEE |
| Proceedings of the 31st Conference... | Conference |
| (empty) | Unpublished |

## Maintenance

### Adding New Papers

Just add them to your Google Scholar profile! The scraper will:
1. Find them on the next scheduled run (or manual trigger)
2. Extract all metadata
3. Update the site automatically

**No code changes needed!**

### Updating Paper Information

Edit the paper details on Google Scholar:
- Update title, authors, venue, year
- Changes appear on next sync

### Removing Papers

Remove from Google Scholar profile:
- Paper disappears on next sync
- Historical data in KV is overwritten

## Monitoring

### Check Last Update

Visit `/status` page on your site:
- Shows last sync time
- Total papers
- Total citations
- Data freshness

### Check Vercel Logs

1. Go to Vercel Dashboard → Your Project → Logs
2. Filter by `/api/refresh-scholar`
3. See scraper execution details

### Check for Errors

Look for:
- `Failed to fetch Scholar profile` - Google Scholar might be blocking
- `Error scraping Scholar profile` - HTML structure changed
- `No papers found` - Check Scholar profile URL

## Troubleshooting

### No Papers Showing Up

1. **Check if scraper ran:**
   ```bash
   curl -X GET https://your-site/api/refresh-scholar \
     -H "Authorization: Bearer YOUR_SECRET"
   ```

2. **Check the response:**
   - Should see `"success": true`
   - Should show paper count

3. **Check KV storage:**
   - Vercel Dashboard → Storage → Your KV
   - Key `papers` should exist

### Scraper Fails

**Rate Limited by Google Scholar:**
- The scraper adds 1-second delays between pages
- If still limited, increase delay in `lib/scraper/scholar.ts`

**HTML Structure Changed:**
- Google Scholar updated their page structure
- Update selectors in `lib/scraper/scholar.ts`
- Look for `.gsc_a_tr`, `.gsc_a_at`, etc.

### Wrong Venue Names

Update the normalization mapping in `lib/scraper/scholar.ts`:

```typescript
const VENUE_NORMALIZATION: Record<string, string> = {
  "your custom venue": "Normalized Name",
  // ... add more
};
```

## Advanced: Citation Graph

Currently, the scraper:
- ✅ Fetches all FLock papers
- ⚠️ Skips citing papers (to avoid rate limiting)

To enable citing papers:
1. Edit `lib/scraper/scholar.ts`
2. Uncomment citing papers logic
3. Add rate limiting (2-3 seconds per request)
4. Increase `maxDuration` in `app/api/refresh-scholar/route.ts`

## Summary

✅ **Zero maintenance**: Just update Google Scholar  
✅ **Automatic sync**: Daily at 2 AM UTC  
✅ **All papers**: No pagination limits  
✅ **Clean venues**: Automatic normalization  
✅ **Real-time preview**: `npm run fetch-papers`  

Your research site stays up-to-date automatically! 🚀

