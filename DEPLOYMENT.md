# Deployment Guide

This guide walks you through deploying the FLock Research Visualization Platform to Vercel.

## Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- FLock API credentials

## Step 1: Push to GitHub

1. Initialize git repository (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: FLock research visualization platform"
   ```

2. Create a new repository on GitHub

3. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Project"
3. Select your GitHub repository
4. Vercel will auto-detect Next.js configuration
5. Click "Deploy" (initial deployment will use stub data)

## Step 3: Add Vercel KV Storage

1. In your Vercel project dashboard, go to the "Storage" tab
2. Click "Create Database"
3. Select "KV" (Key-Value Store)
4. Choose a name (e.g., "flock-research-kv")
5. Select your region (choose closest to your users)
6. Click "Create"

Vercel will automatically add these environment variables:
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

## Step 4: Configure Environment Variables

1. Go to your project settings → Environment Variables
2. Add the following variables:

### Required Variables

```
FLOCK_API_KEY=your_flock_api_key_here
FLOCK_API_BASE_URL=https://api.flock.io/v1
FLOCK_MODEL=flock-llm-default
CRON_SECRET=generate_a_random_secret_here
```

### Optional Variables

```
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```
(This is auto-set by Vercel, but you can override it)

### Generating a Secure CRON_SECRET

```bash
# On macOS/Linux:
openssl rand -base64 32

# Or use Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Step 5: Trigger Initial Data Sync

After deployment, manually trigger the Scholar scraper to populate data:

```bash
curl -X GET https://your-domain.vercel.app/api/refresh-scholar \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Check the response to ensure data was scraped successfully.

## Step 6: Verify Deployment

1. Visit your deployed site: `https://your-domain.vercel.app`
2. Check all pages load correctly:
   - Homepage with stats
   - Venues page with papers
   - Topics page with semantic map
   - Graph page with citation network
   - Chat page (may show demo mode if API key not configured)
   - Status page showing last update time

## Step 7: Configure Custom Domain (Optional)

1. In Vercel project settings, go to "Domains"
2. Add your custom domain (e.g., `research.flock.io`)
3. Follow Vercel's instructions to update DNS records
4. SSL certificate will be automatically provisioned

## Automatic Updates

### Cron Job

The site will automatically sync with Google Scholar daily at 2 AM UTC via Vercel Cron (configured in `vercel.json`).

### Continuous Deployment

Every push to the `main` branch will trigger a new deployment:
1. Push changes to GitHub
2. Vercel automatically builds and deploys
3. New version goes live in ~2 minutes

## Monitoring

### Check Deployment Status

- Vercel Dashboard → Deployments
- View build logs for any errors

### Check Cron Job Status

- Vercel Dashboard → Logs
- Filter by `/api/refresh-scholar` to see scraper runs

### Check Data Freshness

Visit `/status` page on your deployed site to see:
- Last update timestamp
- Number of papers
- System health

## Troubleshooting

### Build Fails

1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify TypeScript types are correct

### Cron Job Not Running

1. Verify `vercel.json` is in the root directory
2. Check Vercel Logs for cron execution
3. Ensure `CRON_SECRET` is set correctly

### KV Storage Issues

1. Verify KV database is created and linked
2. Check environment variables are set
3. The app will fall back to stub data if KV is unavailable

### Chat Not Working

1. Verify `FLOCK_API_KEY` is set correctly
2. Check API endpoint in `FLOCK_API_BASE_URL`
3. Review API logs for error messages
4. The chat will show a demo mode message if API is not configured

### Scholar Scraper Fails

1. Google Scholar may rate-limit requests
2. Check if Scholar page structure changed
3. Review scraper logs in Vercel
4. Consider adding delays or caching

## Performance Optimization

### Edge Runtime

The chat API uses Edge Runtime for low latency. Other routes use Node.js runtime.

### ISR (Incremental Static Regeneration)

Data API routes revalidate every hour, balancing freshness and performance.

### Image Optimization

Use Next.js Image component for any images you add.

### Bundle Size

Monitor bundle size with:
```bash
npm run build
```

## Security

### Environment Variables

- Never commit `.env.local` to git
- Use Vercel's encrypted environment variables
- Rotate `CRON_SECRET` periodically

### API Protection

- Cron endpoint requires Bearer token
- Chat API has basic rate limiting
- All API keys are server-side only

## Scaling

The current architecture scales automatically with Vercel:
- Serverless functions scale to zero
- Edge functions are globally distributed
- KV storage is highly available

For very high traffic:
- Consider adding Redis caching
- Implement more aggressive rate limiting
- Use CDN for static assets

## Support

For issues or questions:
1. Check Vercel documentation
2. Review Next.js documentation
3. Contact FLock.io team

## Maintenance Schedule

- **Daily**: Automatic Scholar sync (2 AM UTC)
- **Weekly**: Review logs for errors
- **Monthly**: Check for dependency updates
- **Quarterly**: Review and optimize performance

