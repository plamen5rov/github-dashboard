<!-- markdownlint-disable MD013 MD060 -->

# GitHub Trending Repos Explorer

Explore trending and popular GitHub repositories with rich filtering,
sorting, personalization, and discovery tools.

Built with **React 19**, **TypeScript 6**, **Vite 7**, **Tailwind CSS**,
**TanStack Query**, and the **GitHub REST + GraphQL APIs**.

---

## Features

### Trending Feed

Discover repositories updated in the last **24 hours**, **7 days**, or
**30 days** sorted by stars — no GitHub trending page needed.

- ⏱️ Time range selector: **Today** / **This Week** / **This Month**
- > ⏱️ 30 days is the upper limit because GitHub has no official trending API.
  > Beyond a month, `pushed:>YYYY-MM-DD stars:>50 sort:stars` returns the
  > all-time most-starred repos (React, Vue, etc.) every time — the "trending"
  > signal disappears. Shorter windows surface repos actively gaining traction.
- ♾️ Infinite scroll pagination via `IntersectionObserver`
- 📱 Fully responsive: 1 column (mobile), 2 columns (tablet), 3 columns (desktop)

### Sorting ✨

| Sort                     | Description                         |
|--------------------------|-------------------------------------|
| ⭐ **Most Starred**       | Descending by stargazer count       |
| 🍴 **Most Forked**        | Descending by fork count            |
| 🔀 **Most Open PRs**      | Open pull request count (GraphQL)   |
| 🐛 **Most Open Issues**   | Open issue count                    |
| 🕐 **Recently Updated**   | Last push date descending           |
| ✨ **Best Match**         | GitHub relevance ranking            |

### Filters

| Filter          | How it works                                          |
|-----------------|-------------------------------------------------------|
| **Language**    | Multi-select from curated list, maps to API query     |
| **License**     | Dropdown: MIT, Apache-2.0, GPL-3.0, BSD, etc.         |
| **Open Source** | Toggle: All / Open Source Only / No License           |
| **Topic tags**  | Free-text chip input → `topic:<tag>` in query         |
| **Stars range** | Minimum stars slider                                  |
| **Archived**    | Toggle to show/hide (hidden by default)               |
| **Forks**       | Toggle to show/hide (hidden by default)               |
| **README Lang** | Toggle: All Languages / English Only (client-side detection, requires PAT) |

### Developer-Centric Filters

Ten purpose-built filters applied client-side for detection that
GitHub search qualifiers can't express:

| Filter                | Icon | What it finds                               |
|-----------------------|------|---------------------------------------------|
| **Beginner-friendly** | 🌱   | Low complexity, learning-oriented            |
| **Good First Issue**  | 🎯   | Repos with labeled good-first-issues         |
| **Actively Maintained**| 🔧  | Recent commits, active contributors          |
| **Solo Project**      | 👤   | Single/small-team maintained                 |
| **Production Ready**  | 🚀   | Stable, licensed, widely used                |
| **AI/ML**             | 🤖   | Machine learning, LLMs, neural networks      |
| **Indie Project**     | 🎨   | Small, creative, independent projects        |
| **New & Exploding**   | 💥   | Recently created projects with stars           |
| **Low Competition**   | 💎   | Undiscovered gems with quality signals       |
| **Enterprise**        | 🏢   | Large-scale, cloud-native, infrastructure    |

### Personalization

All data stored in `localStorage` — no backend required.

- 🔖 **Bookmarks** — save repos for later with one click
- 📂 **Collections** — organize repos into custom groups
- 👁️ **Followed Topics** — recommendations based on followed topics
- 🚫 **Ignore List** — hide repos matching unwanted topics/languages
- 🔗 **Shareable URLs** — every filter/sort combo is uniquely bookmarkable

### UI & Accessibility

- 🌙 **Dark mode by default** with light toggle (persisted, respects
  system preference)
- ⌨️ Full keyboard navigation and ARIA labels
- 💀 Skeleton loading states (never a blank screen)
- ⚠️ Error states with retry buttons and rate-limit countdowns
- 🗳️ Empty states with reset-filters CTAs

---

## Tech Stack

| Layer             | Choice                                                  |
|-------------------|---------------------------------------------------------|
| **Framework**     | React 19 + Vite 7                                       |
| **Language**      | TypeScript 6                                            |
| **Styling**       | Tailwind CSS 3                                          |
| **Data Fetching** | TanStack Query 5 with infinite scroll                   |
| **Routing**       | React Router 7                                          |
| **Virtualization**| TanStack Virtual 3                                      |
| **Dates**         | date-fns 4                                              |
| **Testing**       | Vitest 4 + React Testing Library + MSW 2                |
| **Linting**       | ESLint 10 with typescript-eslint                        |

---

## Project Structure

```text
src/
├── components/
│   ├── RepoCard.tsx               # Individual repo display card
│   ├── RepoGrid.tsx               # Grid layout with infinite scroll
│   ├── FilterBar.tsx              # Standard filters
│   ├── DeveloperFilterBar.tsx     # 10 developer chip toggles
│   ├── SortControls.tsx           # Sort field + order controls
│   ├── SearchInput.tsx            # Debounced keyword search
│   ├── LanguageBadge.tsx          # Color-coded language indicator
│   ├── LicenseBadge.tsx           # Open source / proprietary badge
│   ├── LicenseLegend.tsx          # License legend panel
│   ├── BookmarksPanel.tsx         # Saved repos modal
│   ├── CollectionsPanel.tsx       # Collection manager modal
│   ├── FollowedTopicsManager.tsx  # Topic following modal
│   └── IgnoreListManager.tsx      # Ignore list modal
├── hooks/
│   ├── useRepos.ts                # TanStack Query infinite data hook
│   ├── useFilters.ts              # URL-synced filter state
│   ├── useSort.ts                 # URL-synced sort state
│   ├── usePersonalization.ts      # localStorage personalization hook
│   └── useTheme.ts                # Dark/light mode hook
├── lib/
│   ├── github.ts                  # REST + GraphQL API client
│   ├── utils.ts                   # Formatting helpers
│   ├── constants.ts               # Options, licenses, dev filters
│   ├── developerFilters.ts        # Client-side filter evaluation
│   ├── readmeLanguage.ts          # English README detection
│   └── userPreferences.ts         # localStorage CRUD
├── pages/
│   ├── Home.tsx                   # Main trending feed
│   └── Settings.tsx               # PAT input, preferences
├── types/
│   └── github.ts                  # API response types
├── __mocks__/
│   └── handlers.ts                # MSW handlers for testing
└── __tests__/                     # Unit + component tests
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 20
- **npm** >= 9

### Install

```bash
git clone <repo-url>
cd github-dashboard
npm install
```

### Development

```bash
npm run dev
```

Opens at <http://localhost:5173>.

### Build

```bash
npm run build
```

Output goes to `dist/`.

### Preview production build

```bash
npm run preview
```

---

## GitHub API & Rate Limits

The app uses both **REST** (search) and **GraphQL** (enrichment) APIs.

| Auth State       | Rate Limit             |
|------------------|------------------------|
| Unauthenticated  | 60 requests/hour       |
| PAT              | 5,000 requests/hour    |

To increase your rate limit, paste a **GitHub PAT** in Settings (`/settings`).
The token is stored in `localStorage` and never sent anywhere except GitHub.

> ⚠️ Never commit tokens to source control. `.env.local` is gitignored.

---

## Testing

69 tests covering utility functions, component rendering, filter logic,
and language detection.

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Run a single test file
npx vitest run src/__tests__/utils.test.ts

# Type-check without emitting
npm run typecheck

# Lint
npm run lint
```

### Test stack

| Tool                    | Purpose                  |
|-------------------------|--------------------------|
| **Vitest 4**            | Test runner              |
| **React Testing Library**| Component testing       |
| **MSW 2**               | API mocking (REST + GQL) |
| **jsdom**               | DOM environment          |

---

## Scripts

| Command                    | Action                     |
|----------------------------|----------------------------|
| `npm run dev`              | Start dev server           |
| `npm run build`            | Type-check + build         |
| `npm run preview`          | Preview production build   |
| `npm test`                 | Run all tests              |
| `npm run test:watch`       | Tests in watch mode        |
| `npm run typecheck`        | TypeScript type check      |
| `npm run lint`             | ESLint                     |

---

## License

MIT
