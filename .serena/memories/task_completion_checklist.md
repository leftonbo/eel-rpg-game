After code changes, run these checks:
- npm run typecheck (must pass with zero errors)
- npm run test (Vitest, e.g., tests/Player.test.ts)
- npm run build (production build must succeed)
- npm run lint (run when touching style/rules or before opening a PR)
- npm run boss-overview (run when touching boss stats/balance)

Additional guardrails:
- Keep EJS/template-driven generation in mind: edit templates/partials, not generated HTML.
- Preserve architectural patterns: data-driven bosses (glob import), scene separation, Bootstrap-based UI, ModalUtils/ToastUtils for dialogs, StatusEffectManager for effects.
- When adding/modifying a boss:
  - Update i18n (src/game/i18n/bosses/{boss-id}.ts and the index) if display text should localize.
  - Update docs/bosses/{boss-id}.md with design notes.
  - Update docs/boss-creation-guide.md or AGENTS.md only when adding new patterns or changing existing contracts.
- When adding status effects:
  - StatusEffectType enum + status-effects/{boss-id}-effects.ts + CSS `.status-{type}`.
- Save data migrations: PlayerSaveManager.CURRENT_VERSION = 7; bump version and add a migration branch when schema changes.
- Commits/PRs: Japanese message with gitmoji; PR template in docs/rules/pull-request.md; review prefixes [must]/[imo]/[nits]/[ask]/[fyi].