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

## Phase 16: Low Competition Filter Fix & Lightweight Removal
- [2026-05-08] Removed Lightweight developer filter (obsolete — `stars < 20000` was a near-noop)
- [2026-05-08] Replaced `stars:>50` with `stars:100..14999` in API query when Low Competition active (broadens search range and avoids dual-inequality qualifier issue)
- [2026-05-08] Simplified `evaluateLowCompetition` client-side filter to only check `license !== null` (star range handled by API, growth/velocity dependency removed)
- [2026-05-08] Fixed `totalCount` bug: was using `finalRepos.length` instead of API total, killing pagination when client-side filters removed all page-1 repos
- [2026-05-08] Fixed pagination stop condition: uses `rawCount === 0` (API exhausted) instead of `loadedCount >= totalCount`

## Phase 18: Header UI Polish
- [2026-05-08] Added green count badge to Followed Topics header button (files modified: Home.tsx)
- [2026-05-08] Added red count badge to Ignore List header button (files modified: Home.tsx)
- [2026-05-08] Increased rate limit display font size (`text-xs` → `text-sm`) and added red color when remaining ≤ 10 (files modified: Home.tsx)
- [2026-05-08] Increased title font size (`text-xl` → `text-2xl`) and added subtitle describing app features (files modified: Home.tsx)
- [2026-05-08] Added explanation in README for why time range maxes at 30 days (files modified: README.md)

## Phase 19: Search Bar Relocation & Filter Bar Layout
- [2026-05-08] Moved search bar from standalone full-width block into filter panel, right-aligned at top (files modified: Home.tsx)
- [2026-05-08] Aligned time buttons and search on same row on desktop; moved sort dropdown next to time buttons (files modified: Home.tsx)
- [2026-05-08] Increased time button and sort control sizes on desktop (`sm:px-4 sm:py-2 sm:text-base`) (files modified: Home.tsx)

## Phase 20: License Filter Fix (AND → Client-Side)
- [2026-05-08] Fixed "Open Source Only" returning no results — replaced AND-space-joined license list with client-side `license !== null` filter (GitHub REST API doesn't support `OR` between qualifiers) (files modified: utils.ts, github.ts, utils.test.ts)
- [2026-05-08] Fixed "No license" returning API error — replaced invalid `license:null` qualifier with client-side `license === null` filter (files modified: utils.ts, github.ts, utils.test.ts)

## Phase 21: Language Dropdown Arrow
- [2026-05-08] Added chevron-down SVG arrow to Language button to visually indicate it's a dropdown (files modified: Home.tsx)

## Phase 22: Star Range & Ignored Languages Query Fixes
- [2026-05-08] Fixed "Min stars" filter being ignored — `stars:>=N` now replaces default `stars:>50` instead of adding a duplicate qualifier (GitHub ignores duplicate star qualifiers) (files modified: utils.ts, utils.test.ts)
- [2026-05-08] Fixed ignored languages using AND-syntax in negation group — switched to separate `-language:X` per language (files modified: github.ts)

## Phase 27: Left Sidebar Filter Layout
- [2026-05-08] Restructured filter panel from horizontal bar to left sidebar with collapsible sections; added hamburger menu for mobile; moved sort controls to top of results area (files modified: Home.tsx, FilterSidebar.tsx new)
- [2026-05-08] Shrunk time range buttons to `flex-1 text-xs` with `gap-1.5` to fit on one line (files modified: FilterSidebar.tsx)
- [2026-05-08] Added colored language dots in language filter buttons; exported `LANGUAGE_COLORS` from LanguageBadge (files modified: FilterSidebar.tsx, LanguageBadge.tsx)
- [2026-05-08] Moved License guide button next to section title; fixed popup width to fit within sidebar (files modified: FilterSidebar.tsx, LicenseLegend.tsx)
- [2026-05-08] Removed Sort and Min Stars from sidebar; added Min Stars input inline next to sort dropdown above repos (files modified: FilterSidebar.tsx, Home.tsx)
- [2026-05-09] Updated README title, tagline, and added app screenshot (files modified: README.md, new: public/Screenshot from 2026-05-09 10-37-26.png)
- [2026-05-09] Cleaned up README: removed stale file references, fixed Filters table, deleted dead DeveloperFilterBar.tsx (files modified: README.md, DeveloperFilterBar.tsx deleted)
- [2026-05-09] Replaced tech stack text with linked shields.io badges; added "Made with OpenCode" badge (files modified: README.md)
- [2026-05-09] Swapped OpenCode badge to official SVG from openchamber (files modified: README.md)

## Phase 26: GitHub Primer Colors & AGENTS.md Cleanup
- [2026-05-08] Aligned Tailwind color tokens with GitHub Primer design system — fixed `darker`, `purple`, `light-border`, `light-muted`; added `link`, `open`, `closed`, `attention` tokens (files modified: tailwind.config.js)
- [2026-05-08] Rewrote AGENTS.md from 281 lines to ~70 lines — removed outdated architecture tree, GraphQL examples, OAuth flow, Definition of Done; kept API quirks, architecture decisions, workflow rules, lessons learned (files modified: AGENTS.md)
- [2026-05-08] Widened "Add topic" input from `w-28 sm:w-32` to `w-36 sm:w-48` so full placeholder text is visible (files modified: Home.tsx)
- [2026-05-08] Removed header subtitle "— trending repos, filters, bookmarks, and discovery" for cleaner, GitHub-like minimal header (files modified: Home.tsx)

## Phase 25: Remove Momentum/Growth Metrics
- [2026-05-08] Removed custom momentum/growth metrics — deleted `RepositoryInsight.tsx`, `growth.ts`, `growth.test.ts`, star timeline fetching, and intelligence enrichment (files modified: RepoCard.tsx, github.ts, types/github.ts, developerFilters.ts, developerFilters.test.ts, constants.ts, README.md)

## Phase 24: Filter Panel Font Consistency
- [2026-05-08] Unified all filter panel labels, inputs, and buttons to match time button font size (`text-sm sm:text-base font-medium`) for visual consistency (files modified: Home.tsx)

## Phase 23: Clickable Logo & Title
- [2026-05-08] Wrapped GitHub logo icon and dashboard title in `<Link to="/">` to reset all filters on click (files modified: Home.tsx)

## Phase 17: Remove Dead Trend Alerts Feature
- [2026-05-08] Removed `TrendAlert` interface from types/github.ts
- [2026-05-08] Removed `alerts`/`alertThreshold` from `UserPreferences`
- [2026-05-08] Removed 5 unused alert CRUD functions from userPreferences.ts
- [2026-05-08] Removed alert callbacks and `unreadAlertCount` from usePersonalization.ts
- [2026-05-08] Deleted TrendAlerts.tsx component (127 lines, never populated by any trigger logic)
- [2026-05-08] Removed bell icon button and TrendAlerts modal from Home.tsx header
- [2026-05-08] Updated FollowedTopicsManager empty state text (removed "trend alerts" reference)
- [2026-05-08] 75 tests passing, 0 TypeScript errors

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
