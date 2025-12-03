# Quick Start Guide

Get the FLock Research Visualization Platform running in 5 minutes.

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

Copy the example environment file:

```bash
cp env.example.txt .env.local
```

Edit `.env.local` with your credentials:
- `FLOCK_API_KEY`: Your FLock API key (optional for development)
- `CRON_SECRET`: Any random string (for securing the refresh endpoint)

### 3. Fetch Real Papers from Google Scholar

Preview what papers will be scraped:

```bash
npm run fetch-papers
```

This will show you all FLock papers from the Google Scholar profile.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**To load real data into the site**, trigger the API endpoint (in a new terminal while dev server is running):

```bash
curl -X GET http://localhost:3000/api/refresh-scholar \
  -H "Authorization: Bearer local-dev-secret-change-in-production"
```

The site will now display all real FLock papers!

## Deploy to Vercel (5 minutes)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Click "Deploy"

### 3. Add Vercel KV

1. In Vercel project → Storage → Create Database → KV
2. Environment variables are auto-added

### 4. Configure Environment Variables

In Vercel project settings → Environment Variables, add:

```
FLOCK_API_KEY=your_flock_api_key
FLOCK_API_BASE_URL=https://api.flock.io/v1
FLOCK_MODEL=flock-llm-default
CRON_SECRET=your_random_secret
```

### 5. Trigger Initial Data Sync

```bash
curl -X GET https://your-domain.vercel.app/api/refresh-scholar \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Done! Your site is live and will auto-update daily.

## What's Included

✅ **Homepage**: Stats and featured papers  
✅ **Venues**: Browse papers by conference/journal  
✅ **Topics**: Semantic clustering and keyword exploration  
✅ **Graph**: Interactive citation network  
✅ **Chat**: AI-powered research assistant  
✅ **Status**: System health and data freshness  
✅ **Auto-sync**: Daily updates from Google Scholar  

## Next Steps

- Customize `config/site.ts` for your branding
- Update venue metadata in `app/venues/page.tsx`
- Monitor `/status` page for data freshness
- Check Vercel logs for cron job execution

## Troubleshooting

**Build fails?**  
→ Check TypeScript errors: `npm run type-check`

**No data showing?**  
→ Trigger manual refresh: `/api/refresh-scholar`

**Chat not working?**  
→ Verify `FLOCK_API_KEY` is set correctly

**Need help?**  
→ See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed guide

## Development Commands

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run linter
npm run type-check  # Check TypeScript types
```

## Project Structure

```
app/
├── api/           # API routes (chat, data, scraper)
├── (pages)/       # Main pages (home, venues, topics, etc.)
components/        # Reusable UI components
lib/
├── scraper/       # Google Scholar scraper
├── storage/       # Vercel KV wrapper
└── llm/           # LLM API client
types/             # TypeScript definitions
config/            # Site configuration
```

## Features

🎨 **Modern Design**: Dark mode, responsive, beautiful gradients  
📊 **Visualizations**: Force-directed graphs, semantic maps  
🤖 **AI Chat**: Retrieval-augmented generation  
🔄 **Auto-sync**: Daily Scholar updates via cron  
⚡ **Performance**: ISR, edge runtime, optimized bundles  
🔒 **Secure**: Server-side API keys, protected endpoints  

Enjoy exploring FLock research! 🚀

