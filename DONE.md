# DONE.md — Changelog

## Phase 12: GitHub User Personalization
- [2026-05-08] Added personalization types: Bookmark, Collection, Watchlist, TrendAlert, UserPreferences
- [2026-05-08] Created userPreferences.ts for localStorage persistence with full CRUD API
- [2026-05-08] Created usePersonalization hook with reactive state management
- [2026-05-08] Added bookmark button to RepoCard (filled star icon when bookmarked)
- [2026-05-08] Built CollectionsPanel modal for creating/managing repo collections
- [2026-05-08] Built FollowedTopicsManager modal for topic following/unfollowing
- [2026-05-08] Built IgnoreListManager modal for ignoring topics and languages
- [2026-05-08] Built TrendAlerts notification system with read/unread states
- [2026-05-08] Integrated ignored topics/languages into GitHub API query filtering
- [2026-05-08] Added personalization icons to header: collections, topics, ignore list, alerts bell with unread badge
- [2026-05-08] Added BookmarksPanel to view all saved repos with full repo details
- [2026-05-08] Added "Add to Collection" dropdown on RepoCard with checkmarks for existing collections
- [2026-05-08] Added bookmark count badge to header bookmark icon
- [2026-05-08] Added fetchRepoByFullName API function for fetching individual repos
- [2026-05-08] Fixed cross-component state sync with custom preferences-changed event
- [2026-05-08] Added collection count badge to header collections button
- [2026-05-08] CollectionsPanel now shows expandable repo cards with language, license, stars, forks, topics
- [2026-05-08] RepoCard collection icon fills blue when repo is in any collection
- [2026-05-08] 73 tests passing

## Phase 14: README Language Filter
- [2026-05-08] Added README language toggle (All Languages / English Only) to filter bar (files modified: Home.tsx, FilterBar.tsx, useFilters.ts, useRepos.ts, github.ts, utils.ts)
- [2026-05-08] Created `readmeLanguage.ts` with ~250-word frequency-based English detection algorithm (files created: readmeLanguage.ts)
- [2026-05-08] Added batch GraphQL README fetching in `enrichWithReadmeText` for client-side language classification
- [2026-05-08] Added 12 tests for `detectReadmeLanguage` covering English, Chinese, Cyrillic, code-block stripping, and edge cases (81 tests total passing)

## Phase 15: Codebase Cleanup
- [2026-05-08] Deleted 6 unused files: FilterBar.tsx, SortControls.tsx, SortControls.test.tsx, vite.svg, hero.png, icons.svg
- [2026-05-08] Removed unused `name` prop from LicenseBadge component and callers (BookmarksPanel, CollectionsPanel, RepoCard)
- [2026-05-08] Removed dead exports: GraphQLRepository, GraphQLSearchResponse, GitHubLanguage (types); OSI_APPROVED_LICENSES, DeveloperFilterKey (constants); fetchRepos, extractRateLimit (github.ts)
- [2026-05-08] Removed `export` from 4 internal-only functions in github.ts (searchRepositories, enrichWithGraphQL, enrichWithDeveloperData, enrichWithIntelligence)
- [2026-05-08] Removed unused `enrichment` param from 6 developer filter evaluators (beginner_friendly, ai_related, production_ready, new_exploding, low_competition, lightweight)
- [2026-05-08] Removed unused variables/imports: subDays/subHours in growth.ts, formatDistanceToNow/parseISO in growth.test.ts, savePreferences in usePersonalization.ts, totalCount in github.ts, hasReleases/hasTests in developerFilters.ts
- [2026-05-08] Added missing `createdAt` field to RepoCard test mock
- [2026-05-08] 75 tests passing, 0 TypeScript errors (down from 13)

## Phase 13: Documentation
- [2026-05-08] Created comprehensive README.md with feature descriptions, icons, project structure, setup guide, and testing docs (files modified: README.md)

## Phase 11: Developer-Centric Filters
- [2026-05-08] Added 11 developer-centric filter types: beginner_friendly, good_first_issue, actively_maintained, solo_maintained, production_ready, ai_related, indie_project, new_exploding, low_competition, enterprise_grade, lightweight
- [2026-05-08] Created `developerFilters.ts` with detection logic for each filter using repo metadata, topics, descriptions, and GraphQL enrichment data
- [2026-05-08] Updated FilterState to include `developerFilters` array, synced with URL search params
- [2026-05-08] Updated `buildGitHubQuery` to map developer filters to GitHub API search qualifiers (good first issue labels, AI/enterprise/lightweight topics)
- [2026-05-08] Created `enrichWithDeveloperData` GraphQL function fetching: good first issue count, contributor count, recent commits, releases, readme status
- [2026-05-08] Built `DeveloperFilterBar` component with chip-style toggle buttons, icons, and tooltips
- [2026-05-08] Integrated DeveloperFilterBar into Home page below topics section
- [2026-05-08] Updated RepoCard to display developer-centric badges when filters are active
- [2026-05-08] Added 23 tests for developer filter evaluation logic (73 tests total passing)

## Phase 10: Repository Intelligence Layer
- [2025-05-08] Added GrowthMetrics type with stars gained (today/week/month), velocity, trend detection, momentum score
- [2025-05-08] Implemented star timeline fetching from GitHub API (`/repos/{owner}/{repo}/stargazers`) with in-memory caching
- [2025-05-08] Created `calculateGrowthMetrics` utility for velocity and momentum score computation
- [2025-05-08] Built RepositoryInsight component displaying growth indicators, trend labels, and trending topics
- [2025-05-08] Integrated intelligence enrichment into `fetchReposWithIntelligence` (replaces `fetchRepos`)
- [2025-05-08] Updated useRepos hook to use new intelligence-aware fetcher
- [2025-05-08] Updated RepoCard to show RepositoryInsight when growth data is available
- [2025-05-08] Added 7 new tests for growth calculation utilities (50 tests total passing)

## Phase 9: Responsive Layout Adjustments and Final Polish
- [2025-05-07] Stacked time range and sort controls vertically on mobile (`sm:flex-row`)
- [2025-05-07] Shortened checkbox labels on small screens (Archived/Forks) with full labels on desktop
- [2025-05-07] Reduced input widths and padding on mobile for compact viewports
- [2025-05-07] Adjusted spacing between rows for better mobile readability

## Phase 8: Combined Filter/Sort Panel
- [2025-05-07] Merged FilterBar and SortControls into a single full-width panel in Home page
- [2025-05-07] Removed separate FilterBar and SortControls component imports from Home page
- [2025-05-07] Applied consistent gap and padding across the combined panel

## Phase 7: Testing
- [2025-05-07] Added vitest test script to package.json
- [2025-05-07] Created MSW handlers for mocking GitHub REST + GraphQL API responses
- [2025-05-07] Created test setup with MSW server lifecycle
- [2025-05-07] Added 27 unit tests for utils: formatNumber, formatRelativeTime, getDateForTimeRange, buildGitHubQuery, isOSILicense
- [2025-05-07] Added 10 component tests for RepoCard: rendering, badges, topic clicks, links
- [2025-05-07] Added 6 component tests for SortControls: select options, sort change, order toggle
- [2025-05-07] All 43 tests passing

## Phase 6: Polish
- [2025-05-07] Added dark/light mode toggle with system preference detection and localStorage persistence
- [2025-05-07] Added light mode color scheme to Tailwind config and CSS
- [2025-05-07] Added theme toggle button to Home and Settings page headers

## Phase 4 & 5: UI Components and Pages
- [2025-05-07] Created LanguageBadge component with color-coded language dots
- [2025-05-07] Created LicenseBadge component with Open Source / No License indicators
- [2025-05-07] Created SearchInput component with 400ms debounce
- [2025-05-07] Created SortControls component with field selector and order toggle
- [2025-05-07] Created FilterBar component: time range, language picker, license dropdown, min stars, topic tags, archived/fork toggles
- [2025-05-07] Created RepoCard component with full repo metadata, clickable topics, external links
- [2025-05-07] Created RepoGrid component with responsive 1/2/3 column layout, infinite scroll via IntersectionObserver, skeleton loading, empty state
- [2025-05-07] Built Home page: header with rate limit display, search, filters, sort, repo grid, error states with retry
- [2025-05-07] Built Settings page: PAT input with save to localStorage, rate limit info table

## Phase 3: State Management Hooks
- [2025-05-07] Created `useFilters` hook: filter state synced with URL search params, update/reset functions, active filter count
- [2025-05-07] Created `useSort` hook: sort state synced with URL, field/order setters, order toggle
- [2025-05-07] Created `useRepos` hook: TanStack Query infinite scroll, combines filters + sort, exposes repos/totalCount/rateLimit

## Phase 2: Core Infrastructure
- [2025-05-07] Created TypeScript types for GitHub REST + GraphQL responses (`src/types/github.ts`)
- [2025-05-07] Created constants: time ranges, sort options, OSI licenses, API URLs (`src/lib/constants.ts`)
- [2025-05-07] Created utils: formatters, query builder, sort mapping, OSI check (`src/lib/utils.ts`)
- [2025-05-07] Created GitHub API client: REST search + GraphQL enrichment for PR/issue counts (`src/lib/github.ts`)

## Phase 1: Project Scaffolding
- [2025-05-07] Initialized Vite + React + TypeScript project
- [2025-05-07] Installed dependencies: Tailwind CSS, TanStack Query, React Router, date-fns, TanStack Virtual
- [2025-05-07] Configured Tailwind with dark mode support
- [2025-05-07] Created project directory structure
- [2025-05-07] Created .env.local template
