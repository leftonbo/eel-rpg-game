- TypeScript strict typing; tsconfig uses moduleResolution=bundler, ES Next, ESM output, path aliases (@/, @/game/, @/ui/, @/data/). Imports without file extensions.
- Unused variables/parameters are errors; prefix with `_` when intentionally unused.
- Naming: class PascalCase, function/variable camelCase, constants UPPER_SNAKE_CASE, interfaces PascalCase (no I-prefix).
- DOM event handling: prefer addEventListener; callbacks as arrow functions to preserve `this`.
- Error handling: use try-catch where needed; log via console.error with descriptive prefix.
- Dialogs/notifications (strict rule): never use browser `alert`/`confirm`/`prompt`. Always use `ModalUtils.showAlert/showConfirm/showPrompt` and `ToastUtils.showToast`.
- UI: favor Bootstrap 5 components (cards, buttons, badges, progress bars, grid, modal, nav-tabs, utility classes); keep custom CSS minimal; mobile-first with col-sm/col-md breakpoints; consider aria-* and contrast.
- EJS templates: HTML is generated from src/templates/; avoid hand-editing final HTML—edit the templates or partials instead.
- Status effects:
  1. Add entry to StatusEffectType enum in src/game/systems/StatusEffectTypes.ts.
  2. Implement StatusEffectConfig under src/game/systems/status-effects/{boss-id}-effects.ts and register via its index.ts.
  3. Add `.status-{type}` CSS class in src/styles/main.css.
- Boss additions: create src/game/data/bosses/{boss-id}.ts (auto-loaded via import.meta.glob). Define BossData with id/displayName/description/questNote/maxHp/attackPower/actions/explorerLevelRequired/victoryTrophy/defeatTrophy. Use customVariables for cooldowns/flags and suppressAutoFinishingMove + ActionType.FinishingMove for custom endings. See docs/boss-creation-guide.md for full guidance.
- i18n: add src/game/i18n/bosses/{boss-id}.ts exporting BossTranslation (ja/en) and register in src/game/i18n/bosses/index.ts. localizeBossData in src/game/data/index.ts automatically applies translations.
- Documents: store in src/game/data/documents/{id}.md with frontmatter (id, title, type: diary | strategy | reflection | default, requiredExplorerLevel, requiredBossDefeats, requiredBossLosses). DocumentLoader reads them.
- Comments: avoid redundant narration; comment only non-obvious intent/constraints.