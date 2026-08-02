# NutriScan AI

Scan any food product barcode and get instant AI-powered health analysis, ingredient breakdown, pros & cons, and personalized insights.

**Live:** [nutriscan.rooted.sbs](https://nutriscan.rooted.sbs)

## What It Does

- **Barcode Scanning** — Scan barcodes using your phone camera (native `BarcodeDetector` API) or enter manually
- **Health Scoring** — Products rated 1-100 with color-coded score rings
- **AI Analysis** — Detailed health summary powered by 4-tier fallback: NaraRouter → OpenRouter → Gemini → Local engine
- **Pros & Cons** — Clear breakdown of what's good and bad about a product
- **Ingredient Breakdown** — Full ingredient list with alerts for harmful additives
- **Product Caching** — Scanned products cached for instant re-loading
- **Save & Share** — Save scans to your profile and share via Web Share API
- **Dark Mode** — Full dark/light theme support

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16, React 19, TypeScript | App framework and UI |
| **Styling** | Tailwind CSS v4 | Utility-first styling, dark mode |
| **Auth** | Clerk | Google + email/password login, guest mode |
| **Database** | Supabase (PostgreSQL) | User profiles, scan history, product cache |
| **Cache** | Upstash Redis | API response caching (24hr TTL) |
| **AI Primary** | NaraRouter (Agnes 2.5 Flash — free tier) | Text + vision analysis |
| **AI Fallback 1** | OpenRouter (Gemma 4 31B — free tier) | Text + vision backup |
| **AI Fallback 2** | Groq (Llama 3.3 70B — free tier) | Text-only backup |
| **AI Fallback 3** | Google Gemini 2.0 Flash | Vision backup (paid, rate-limited) |
| **Local Fallback** | Custom rules engine | Ingredient keyword analysis when all AIs are down |
| **Product Data** | Open Food Facts API | Barcode → product info (name, ingredients, brand) |
| **Analytics** | PostHog | Usage tracking (opted out by default) |
| **Webhooks** | Svix | Clerk webhook signature verification |
| **Deployment** | Vercel | Hosting, serverless functions, CI/CD |
| **Camera** | BarcodeDetector API | Native browser barcode scanning (no library) |
| **Icons** | Lucide React | UI icons |
| **Domain** | Hostinger DNS | Custom domain `nutriscan.rooted.sbs` |

## Architecture

```
Scan Request
  → Redis cache check (instant)
  → Supabase cache check
  → Open Food Facts API (barcode lookup)
  → AI Analysis: NaraRouter → OpenRouter → Groq → Gemini → Local Engine (5-tier fallback)
  → Cache result in Redis + Supabase
  → Return to client
```

## Getting Started

```bash
git clone https://github.com/abhishekgit8/NutriScan-AI.git
cd NutriScan-AI
npm install
cp .env.example .env.local  # add your API keys
npm run dev
```

## Environment Variables

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_WEBHOOK_SECRET=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NARA_API_KEY=
NEXT_PUBLIC_GEMINI_API_KEY=
OPENROUTER_API_KEY=
GROQ_API_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

## License

MIT
