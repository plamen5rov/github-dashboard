# Refactoring Tasks

> Generated from codebase redundancy/duplication analysis — 2026-06-16

---

## Category A: Actionable Duplication (High Impact, Low Risk)

### A1. Extract `useClickOutside` hook ✅
- **Problem:** 2 copies of click-outside-to-close logic in `RepoCard.tsx`, `LicenseLegend.tsx` (FilterSidebar copy already removed earlier)
- **Fix:** Create `src/hooks/useClickOutside.ts` with `useClickOutside(ref, isOpen, onClose)`
- **Files:** +1 new, modify 3
- **Status:** Done — `c9b0563`

### A2. Create `Panel` modal wrapper + `Icons` component ✅
- **Problem:** 4 components share identical overlay/header/close patterns; SVG icons duplicated 2-4 times
- **Fix:** Extract `src/components/Panel.tsx` (portal, overlay, header, close button) and `src/components/Icons.tsx` (StarIcon, ForkIcon, CloseIcon, BookmarkIcon, etc.)
- **Files:** +2 new, modify 6 + RepoCard + Settings → 8 (BookmarksPanel, CollectionsPanel, FollowedTopicsManager, IgnoreListManager, Home, FilterSidebar, RepoCard, Settings)

### A3. Remove duplicate GraphQL enrichment ✅
- **Problem:** `enrichWithGraphQL` and `enrichWithDeveloperData` called sequentially when dev filters active — the latter is a strict superset of the former
- **Fix:** In `fetchReposWithIntelligence`, when dev filters are active, skip `enrichWithGraphQL` and extract base fields (openPRs, languageColor) from `enrichWithDeveloperData`'s result; fall back to `enrichWithGraphQL` if it fails
- **Files:** `src/lib/github.ts`

### A4. Unify `UseReposOptions` extending `BuildQueryOptions` ✅
- **Problem:** `UseReposOptions` and `BuildQueryOptions` are semantically identical but manually mapped (11 lines of boilerplate in `useRepos.ts`)
- **Fix:** `UseReposOptions extends BuildQueryOptions` + sort/order; destructure the rest via spread
- **Files:** `src/hooks/useRepos.ts`

### A5. [DEPRECATED — replaced by A4]

---

## Category B: Structural Issues (Medium Impact)

### B1. Reduce `fetchReposWithIntelligence` complexity
- **Problem:** 453 lines, deeply nested, duplicate README language logic in two branches
- **Fix:** Extract `enrichWithReadmeLanguage(repos, token)` as a standalone function; flatten nesting with early returns
- **Files:** `src/lib/github.ts`

### B2. Simplify `usePersonalization` hook
- **Problem:** Wrapper calls `loadPreferences()` redundantly after every mutation, despite `preferences-changed` event listener already triggering re-sync
- **Fix:** Remove explicit `setPrefs(loadPreferences())` calls; rely on event listener alone
- **Files:** `src/hooks/usePersonalization.ts`

### B3. Eliminate `RepositoryWithIntelligence` empty alias
- **Problem:** `RepositoryWithIntelligence extends Repository {}` adds zero fields; purely nominal
- **Fix:** Remove the type alias and use `Repository` directly everywhere
- **Files:** `src/types/github.ts` + 6 consumers

---

## Category C: Optimization Opportunities (Medium Impact)

### C1. Merge GraphQL queries (conditional) 🔶
- **Problem:** 3 sequential GraphQL round-trips per page → now down to 2 (A3 merged enrichGraphQL + enrichDeveloperData)
- **Remaining:** Optionally merge README query into the same GraphQL call
- **Files:** `src/lib/github.ts`
- **Note:** Requires careful measurement — may impact UX if GraphQL is slow. Low priority since A3 already merged the two enrichment calls.

### C2. Sync `isOSILicense` Set with `licenseLegend.ts`
- **Problem:** OSI-approved license list is duplicated as an inline Set in `utils.ts` and a separate array in `licenseLegend.ts` — they can drift out of sync
- **Fix:** Derive the Set from `LICENSE_LEGEND` entries or export both from a single source
- **Files:** `src/lib/utils.ts`, `src/lib/licenseLegend.ts`

### C3. Fix `SearchInput` debounce stability
- **Problem:** `debouncedUpdate` recreates on every render; stale closure risk
- **Fix:** Use `useRef` for the timer with a stable `useCallback`
- **Files:** `src/components/SearchInput.tsx`

---

## Category D: Minor Cleanup (Low Impact)

### D1. Remove empty `src/assets/` directory
- **Files:** `src/assets/`
- **Status:** Simply delete; nothing references it

### D2. Consider inlining `App.tsx` into `main.tsx`
- **Problem:** `App.tsx` is only 16 lines with 2 routes — low value as a separate file
- **Files:** `src/App.tsx`, `src/main.tsx`

---

## Recommended Execution Order
1. A1 + A2 (foundational primitives) — `useClickOutside`, `Panel`, `Icons`
2. A3 + C1 (GraphQL deduplication)
3. A4 (type unification)
4. B1 + B2 (structural cleanup)
5. B3 (type alias removal)
6. C2 + C3 (minor fixes)
7. D1 + D2 (cleanup)
