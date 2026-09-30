# xeno-tendril-beast

Added a new boss `xeno-tendril-beast` / `ゼノ触獣`.

- Data file: `src/game/data/bosses/xeno-tendril-beast.ts`
- i18n file: `src/game/i18n/bosses/xeno-tendril-beast.ts`, registered in `src/game/i18n/bosses/index.ts`
- Design doc: `docs/bosses/xeno-tendril-beast.md`, linked from `docs/bosses/README.md`
- Theme: wordless tentacle-covered alien predator in a meteor crater; beastlike hunting via scent, vibration, and pounce, no spoken dialogue beyond growls/sounds.
- Unlock/balance: explorer level 8, HP 1180, attack 22.
- Uses existing statuses only: VisionImpairment, Dizzy, Weakness, Slimed, Restrained/Eaten/Dead/Doomed. No new status-effect config or CSS.
- Mechanics: `scentLockTurns` improves snare priority, `pounceCharging` creates a telegraphed high-damage pounce, `innerCorePulseUsed` triggers a one-time internal core pulse, `defeatStartTurn` drives an 8-turn post-defeat molt event.
- Uses `suppressAutoFinishingMove: true` and custom finishing action `core-nest-finish` to move Doomed -> Dead without death-themed flavor.