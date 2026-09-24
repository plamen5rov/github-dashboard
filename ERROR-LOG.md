# ERROR-LOG.md — Agent Mistake Log

| Date | Mistake | Root Cause | Fix | Lesson Learned |
|------|---------|------------|-----|----------------|
| 2026-09-24 | Wrote non-existent helpers `useRefTimeout()`/`useRefCallback()` in MinStarsInput | Hallucinated plausible-sounding React APIs instead of `useRef` | Rewrote with standard `useRef` + effect-based ref sync | Never invent hook/API names — only use patterns already present in the codebase |
| 2026-09-24 | Called `userEvent.waitFor()` in Panel test (property does not exist) | Confused RTL's `waitFor` with userEvent API | Imported `waitFor` from `@testing-library/react` | RTL async utilities live in `@testing-library/react`, not `user-event` |
| 2026-09-24 | MinStarsInput tests timed out (5s) under `vi.useFakeTimers()` + `userEvent` | Fake timers freeze userEvent's internal awaits even with `advanceTimers`/`delay: null` | Rewrote tests with real timers + `waitFor(..., { timeout: 1500 })` for the 400ms debounce | Prefer real timers + `waitFor` for debounce tests; fake timers + userEvent are fragile together |
