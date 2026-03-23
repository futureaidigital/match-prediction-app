# Next.js Migration Plan

## Vite + React SPA → Next.js 15 (App Router)

---

## 1. Current Architecture

| Layer | Technology | Notes |
|---|---|---|
| Framework | Vite + React 19 | SPA, client-rendered |
| Routing | react-router-dom v7 | Must be replaced |
| Data Fetching | TanStack React Query v5 | Compatible with Next.js |
| Streaming | Custom SSE via fetch + ReadableStream | Client-only, works as-is |
| Auth | Firebase Identity + Backend session | Client-side, localStorage tokens |
| Styling | Tailwind CSS v3 + shadcn/ui | First-class Next.js support |
| Animation | framer-motion v12 | Needs `"use client"` |
| State | React Context (auth) + React Query (server) | No Redux/Zustand |
| Deploy | Vercel with proxy rewrites | Framework changes to Next.js |

### Route Map

| Current Path | Page | Auth Required | SSE Streaming |
|---|---|---|---|
| `/` | DemoPage (home) | No (auto-login) | No |
| `/matches` | MatchesPage | No | No |
| `/match/:fixtureId` | MatchDetailPage | No | Yes (live) |
| `/players` | PlayersPage | No | No |
| `/player/:playerId` | PlayerPage | No | No |
| `/pricing` | PricingPage | No | No |
| `/smart-combo` | SmartComboPage | Yes | No |
| `/league` | LeaguePage | No | No |
| `/login` | LoginPage | No | No |
| `/register` | RegisterPage | No | No |
| `/forgot-password` | ForgotPasswordPage | No | No |
| `/reset-password` | ResetPasswordPage | No | No |

### Critical Observations

1. **Firebase API key is hardcoded** in `src/services/api.ts` — should move server-side
2. **Test credentials hardcoded** in `src/config/defaults.ts` for auto-login demo
3. **`localStorage` used extensively** — ApiClient constructor, AuthContext, useSSEStream. All break in Server Components
4. **No current SSR** — everything client-rendered. Most data is auth-gated, limiting SSG/ISR
5. **Vite proxy** (`/api/v1` → `https://api.fourthofficial.ai`) must be replicated via Next.js rewrites or API routes

---

## 2. Rendering Strategy

| Route | Strategy | Rationale |
|---|---|---|
| `/` (home) | **CSR with SSR shell** | Dynamic fixtures, auth-gated, personalized |
| `/matches` | **CSR** | Filtered, date-based, auth-dependent |
| `/match/[fixtureId]` | **CSR with SSR shell** | SSE streaming requires client. Shell can render first. |
| `/players` | **CSR** | Watchlist is personalized |
| `/player/[playerId]` | **SSR + CSR hybrid** | Player metadata SSR'd for SEO; predictions client-side |
| `/pricing` | **SSG with ISR** | Pricing changes rarely. Revalidate every hour. |
| `/league` | **CSR with SSR shell** | Standings could be SSR'd for SEO; tabs are client-side |
| `/smart-combo` | **CSR** | Fully auth-gated |
| `/login`, `/register`, etc. | **SSR shell + client form** | Static shell, interactive form |
| `not-found` | **SSG** | Static 404 page |

### Server vs Client Components

| Component | Type | Reasoning |
|---|---|---|
| Root layout | **Server** | Static shell, providers wrapper |
| Header | **Client** | Uses auth state, navigation, modals |
| Footer | **Server** | Static content |
| All pages | **Client** | Heavy interactivity, auth, localStorage |
| shadcn/ui components | **Client** | Radix UI primitives are interactive |
| Config/lib utilities | **Shared** | Pure functions, no DOM/React |

> **Reality check**: Because the app is heavily interactive with `localStorage`-based auth, nearly every page will be a Client Component. Server Component gains come from the layout shell, Footer, metadata generation, and streaming loading states.

---

## 3. File Structure

```
match-prediction-app-next/
├── app/
│   ├── layout.tsx                      # Server Component — root shell
│   ├── globals.css                     # From src/index.css
│   ├── not-found.tsx                   # 404 page
│   ├── page.tsx                        # Home (wraps DemoPage)
│   ├── loading.tsx                     # Root loading skeleton
│   │
│   ├── (auth)/                         # Route group for auth pages
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   │
│   ├── matches/page.tsx
│   ├── match/[fixtureId]/page.tsx
│   ├── players/page.tsx
│   ├── player/[playerId]/page.tsx
│   ├── pricing/page.tsx
│   ├── smart-combo/page.tsx
│   ├── league/page.tsx
│   │
│   └── api/                            # API route handlers (proxy)
│       └── v1/
│           └── [...path]/
│               └── route.ts            # Catch-all proxy to backend
│
├── components/                         # All with "use client" unless noted
│   ├── providers/
│   │   ├── AuthProvider.tsx            # "use client" — wraps AuthContext
│   │   └── QueryProvider.tsx           # "use client" — wraps QueryClientProvider
│   ├── Header.tsx
│   ├── Footer.tsx                      # Server Component (no interactivity)
│   ├── MatchCard.tsx
│   ├── MatchBanner.tsx
│   ├── LiveMatchBanner.tsx
│   ├── SmartCombo.tsx
│   ├── TrendingNews.tsx
│   ├── PlayersToWatch.tsx
│   ├── PredictionCard.tsx
│   ├── FilterBar.tsx
│   ├── Pagination.tsx
│   └── ui/                             # shadcn/ui components
│       ├── badge.tsx, button.tsx, input.tsx, etc.
│       ├── Calendar.tsx
│       ├── FilterPanel.tsx
│       ├── PredictionBar.tsx
│       ├── LoginModal.tsx
│       ├── RegisterModal.tsx
│       └── skeletons/
│
├── hooks/                              # All unchanged, client-only
│   ├── useCarousel.ts
│   ├── useFixtures.ts
│   ├── useLeagues.ts
│   ├── useLeagueStandings.ts
│   ├── useNews.ts
│   ├── usePlayers.ts
│   ├── usePredictions.ts
│   ├── useSmartCombo.ts
│   └── useSSEStream.ts
│
├── services/
│   └── api.ts                          # Client-only, guard localStorage
│
├── lib/
│   ├── formatters.ts
│   ├── queryClient.ts
│   ├── transformers.ts
│   └── utils.ts
│
├── config/
│   ├── cache.ts
│   ├── defaults.ts
│   ├── env.ts                          # Rewritten for process.env
│   └── theme.ts
│
├── contexts/
│   └── AuthContext.tsx
│
├── public/                             # Static assets (copied as-is)
│   ├── 404.svg, logo.svg, trend.svg, etc.
│
├── middleware.ts                        # Auth route protection
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── .env.local
└── package.json
```

---

## 4. Migration Phases

### Phase 1: Project Setup & Config (Days 1–2)

**Goal**: New Next.js project compiling with all shared utilities.

- [ ] Create Next.js 15 project: `npx create-next-app@latest --typescript --tailwind --eslint --app`
- [ ] Install dependencies: `@tanstack/react-query`, `framer-motion`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/*`, `tailwindcss-animate`
- [ ] Copy and adapt config:
  - `tailwind.config.cjs` → `tailwind.config.ts` (update content paths)
  - `postcss.config.cjs` → `postcss.config.js`
  - `src/index.css` → `app/globals.css`
  - `tsconfig.json` — update for Next.js, keep `@/*` alias
  - `components.json` — update paths for shadcn/ui
- [ ] Rewrite `config/env.ts`: `import.meta.env.VITE_*` → `process.env.NEXT_PUBLIC_*`
- [ ] Create `.env.local` with renamed variables
- [ ] Configure `next.config.js`:
  ```js
  rewrites: async () => [
    { source: '/api/v1/:path*', destination: 'https://api.fourthofficial.ai/api/v1/:path*' }
  ],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sportmonks.com' },
      { protocol: 'https', hostname: 'ichef.bbci.co.uk' },
      { protocol: 'https', hostname: '*.365dm.com' },
    ]
  }
  ```
- [ ] Copy `public/` directory as-is
- [ ] Copy pure utility files unchanged: `lib/*`, `config/cache.ts`, `config/defaults.ts`, `config/theme.ts`

### Phase 2: Layout, Providers, Navigation (Days 3–4)

**Goal**: Root layout rendering with Header/Footer and all context providers.

- [ ] Create `app/layout.tsx` (Server Component):
  - Import `globals.css`, set up `<html>`, `<body>`, font config
  - Wrap children with `<QueryProvider>` + `<AuthProvider>`
  - Export default metadata
- [ ] Create `components/providers/QueryProvider.tsx` (`"use client"`):
  - Instantiate `QueryClient` with existing config
  - Wrap with `QueryClientProvider` + devtools
- [ ] Create `components/providers/AuthProvider.tsx` (`"use client"`):
  - Migrate `AuthContext` logic
  - Guard all `localStorage` with `typeof window !== 'undefined'`
- [ ] Migrate `Header.tsx`:
  - `"use client"` directive
  - `useNavigate()` → `useRouter()` from `next/navigation`
  - `<Link>` from react-router-dom → `next/link`
- [ ] Migrate `Footer.tsx` (keep as Server Component if static)
- [ ] Create `app/not-found.tsx`

### Phase 3: Auth & Simple Pages (Days 5–7)

**Goal**: Login, Register, Password pages, and Pricing working.

- [ ] Create `app/(auth)/login/page.tsx` — `"use client"`, replace router imports
- [ ] Create `app/(auth)/register/page.tsx`
- [ ] Create `app/(auth)/forgot-password/page.tsx`
- [ ] Create `app/(auth)/reset-password/page.tsx`:
  - `useSearchParams` from `next/navigation` (same name, different import)
- [ ] Create `app/pricing/page.tsx`:
  - Candidate for SSG + ISR: `export const revalidate = 3600`
  - Or keep as Client Component initially
- [ ] Copy all required UI components to `components/ui/` with `"use client"`

### Phase 4: Core Pages — Home, Matches, Match Detail (Days 8–12)

**Goal**: Core match browsing experience working.

- [ ] Migrate `services/api.ts`:
  - Guard `localStorage` with `typeof window !== 'undefined'`
  - Move Firebase API key to `process.env.NEXT_PUBLIC_FIREBASE_API_KEY`
  - Ensure client-only instantiation
- [ ] Create `app/page.tsx` — import DemoPage as Client Component
- [ ] Create `app/matches/page.tsx` — wrap MatchesPage
- [ ] Create `app/match/[fixtureId]/page.tsx`:
  - `fixtureId` from `params` prop instead of `useParams()`
  - Pattern: `export default function Page({ params }: { params: { fixtureId: string } })`
- [ ] Copy all component dependencies (MatchCard, MatchBanner, SmartCombo, etc.)
- [ ] Copy all hooks to `hooks/`
- [ ] Global search-and-replace:
  - `useNavigate()` → `useRouter()` from `next/navigation`
  - `useParams()` → page `params` prop or `useParams()` from `next/navigation`
  - `import { Link } from 'react-router-dom'` → `import Link from 'next/link'`
  - `navigate('/path')` → `router.push('/path')`

### Phase 5: Complex Pages — League, Player, Smart Combo (Days 13–16)

**Goal**: All remaining pages working.

- [ ] Create `app/league/page.tsx` — wraps LeaguePage (`framer-motion` needs `"use client"`)
- [ ] Create `app/player/[playerId]/page.tsx` — dynamic route
- [ ] Create `app/players/page.tsx`
- [ ] Create `app/smart-combo/page.tsx` — auth-gated
- [ ] Copy TrendingNews, PlayersToWatch, remaining components

### Phase 6: Live Features, API Routes, Auth Middleware (Days 17–20)

**Goal**: SSE streaming, API proxy, route protection.

- [ ] **SSE streaming**: Verify `useSSEStream` works through Next.js rewrites
  - Test that the proxy doesn't buffer SSE responses
  - May need streaming response headers in API route
- [ ] **API route proxy** (recommended for production):
  ```
  app/api/v1/[...path]/route.ts
  ```
  - Proxies all `/api/v1/*` to backend
  - Hides backend URL from client
  - Can inject server-side headers
- [ ] **Auth middleware** (`middleware.ts`):
  - Check auth cookie on protected routes
  - Redirect to `/login` if missing
  - Matcher config for protected routes only
- [ ] **Firebase auth server-side** (optional security improvement):
  - Create `app/api/auth/login/route.ts`
  - Handles Firebase auth server-side, keeps API key off client
  - Sets `httpOnly` cookie with token

### Phase 7: Optimization & Cleanup (Days 21–25)

**Goal**: Performance, SEO, and production readiness.

- [ ] **Image optimization**: Replace `<img>` with `next/image` for external images
- [ ] **SEO metadata**: Add `generateMetadata` to dynamic routes
  ```ts
  // app/match/[fixtureId]/page.tsx
  export async function generateMetadata({ params }) {
    return { title: `Match ${params.fixtureId} | FourthOfficial` }
  }
  ```
- [ ] **Loading states**: Add `loading.tsx` for route segments
- [ ] **Bundle analysis**: Run `@next/bundle-analyzer`
- [ ] **Cleanup**:
  - Remove `react-router-dom` from package.json
  - Remove Vite files (`vite.config.ts`, `vite-env.d.ts`)
  - Update `vercel.json` — framework becomes `nextjs`
  - Update `components.json` for shadcn/ui
- [ ] **End-to-end testing** of all routes, auth, SSE, predictions

---

## 5. Environment Variables Migration

| Current (Vite) | Next.js | Exposure |
|---|---|---|
| `VITE_API_BASE_URL` | `NEXT_PUBLIC_API_BASE_URL` | Client + Server |
| `VITE_API_TIMEOUT` | `NEXT_PUBLIC_API_TIMEOUT` | Client |
| `VITE_ENABLE_DEVTOOLS` | `NEXT_PUBLIC_ENABLE_DEVTOOLS` | Client |
| `VITE_ENABLE_MOCK_DATA` | `NEXT_PUBLIC_ENABLE_MOCK_DATA` | Client |
| `VITE_ENABLE_DEBUG_LOGGING` | `NEXT_PUBLIC_ENABLE_DEBUG_LOGGING` | Client |
| `VITE_APP_NAME` | `NEXT_PUBLIC_APP_NAME` | Client |
| `VITE_APP_VERSION` | `NEXT_PUBLIC_APP_VERSION` | Client |
| *(new)* Firebase API Key | `FIREBASE_API_KEY` | **Server only** |
| *(new)* Backend API URL | `API_BASE_URL` | **Server only** |

Replace `import.meta.env.VITE_*` → `process.env.NEXT_PUBLIC_*`
Replace `import.meta.env.DEV` → `process.env.NODE_ENV === 'development'`

---

## 6. Risk Assessment

### High Risk

| Risk | Impact | Mitigation |
|---|---|---|
| `localStorage` in Server Components | Runtime crash | Guard every access with `typeof window !== 'undefined'`. ApiClient must be client-only. |
| SSE through proxy may buffer | Live data breaks | Test SSE early. Configure streaming headers. API route proxy must not buffer. |
| Auth token flow disruption | Users can't log in | Keep exact client-side flow initially. Optimize server-side later. |

### Medium Risk

| Risk | Impact | Mitigation |
|---|---|---|
| `useParams()` API change | Broken navigation | Next.js 15 returns Promise — use `params` prop or `React.use()`. |
| Tailwind class conflicts | Styling breaks | Keep same config. Visual test each page. |
| `framer-motion` SSR | Hydration errors | `"use client"` on all animated components. |

### Low Risk

| Risk | Impact | Mitigation |
|---|---|---|
| Static asset paths | Broken images | `/public` works identically. |
| CSS variable theming | Style issues | `:root` variables transfer directly. |
| Bundle size increase | Slight regression | Offset by per-route code splitting. |

---

## 7. Expected Performance Gains

### Definite

- **40–60% less initial JS per route** — automatic code splitting (visitors to `/pricing` don't download MatchDetailPage code)
- **Instant navigation** — `next/link` prefetches linked routes on viewport enter
- **Server-rendered shell** — faster Time to First Paint (Header/skeleton renders before JS hydrates)
- **Image optimization** — automatic WebP/AVIF, responsive sizing via `next/image`
- **API key hidden** — Firebase key moves server-side via API routes

### Likely

- **ISR for Pricing** — instant load, zero API calls on visit
- **Streaming SSR** — match detail shell renders immediately while data loads
- **Better mobile performance** — smaller per-route bundles on slower networks

### Tradeoffs

- **Server compute cost** — SSR/ISR adds server work (managed by Vercel)
- **Build time** — Next.js builds slower than Vite due to SSR compilation
- **Dev HMR** — Slightly slower than Vite's native ESM HMR

---

## 8. Key Files Requiring Special Attention

| File | Why | Complexity |
|---|---|---|
| `src/services/api.ts` (~1,077 lines) | All types, auth flow, localStorage, Firebase key | **High** |
| `src/contexts/AuthContext.tsx` | localStorage, auto-login, token refresh | **High** |
| `src/pages/MatchDetailPage.tsx` (~2,200+ lines) | SSE, tabs, predictions, useParams, most complex page | **High** |
| `src/config/env.ts` | Full rewrite for `process.env` | **Medium** |
| `src/hooks/useSSEStream.ts` | Must verify through proxy, client-only | **Medium** |
| `src/pages/LeaguePage.tsx` | framer-motion animations, complex state | **Medium** |

---

## Timeline Summary

| Phase | Duration | Deliverable |
|---|---|---|
| 1. Setup & Config | Days 1–2 | Project compiling, shared code migrated |
| 2. Layout & Providers | Days 3–4 | Root layout, Header/Footer, auth/query providers |
| 3. Auth & Simple Pages | Days 5–7 | Login, Register, Pricing working |
| 4. Core Pages | Days 8–12 | Home, Matches, Match Detail working |
| 5. Complex Pages | Days 13–16 | League, Player, Smart Combo working |
| 6. Live Features | Days 17–20 | SSE, API proxy, auth middleware |
| 7. Optimization | Days 21–25 | Images, SEO, bundle, cleanup, testing |
| **Total** | **~25 days** | **Full migration complete** |
