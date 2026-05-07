# DONE.md — Changelog

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
