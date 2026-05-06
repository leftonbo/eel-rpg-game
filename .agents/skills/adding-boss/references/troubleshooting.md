# Boss Troubleshooting

新ボス追加後に詰まった時の確認表。

## ボスが表示されない

- `src/game/data/bosses/{boss-id}.ts` に置いているか。
- ファイル名が kebab-case か。
- export 名が `{camelCaseBossId}Data` 形式か。
- `BossData.id` がファイル名と一致しているか。
- `displayName`、`description`、`questNote` が定義されているか。
- `explorerLevelRequired` が現在のセーブデータの解禁レベルを超えていないか。
- Vite の glob import 対象外になるようなファイル名やディレクトリにしていないか。

## 行動が選択されない

- `weight` が 1 以上か。
- `playerStateCondition` が現在のプレイヤー状態と一致しているか。
- `canUse` が常に `false` になっていないか。
- AI 戦略の分岐順で、その行動へ到達する前に別の行動を return していないか。
- `actions.find(...)` の検索キーが `name` 依存になっていないか。可能なら `id` で探す。
- 体内行動は `player.isEaten()`、敗北後行動は `player.isDefeated()` の分岐で扱っているか。

## 状態異常が効かない

- `StatusEffectType` enum に追加されているか。
- `src/game/systems/status-effects/{boss-id}-effects.ts` が作成されているか。
- `src/game/systems/status-effects/index.ts` から登録されているか。
- `statusEffect` に正しい enum を指定しているか。
- `statusChance` が `0.0` から `1.0` の範囲か。
- `statusDuration` が意図したターン数か。
- 表示だけの問題なら `.status-{type}` の CSS があるか。

## とどめ攻撃が期待通り動かない

- 通常の自動とどめで足りるなら `finishingMove` だけを使う。
- AI で `ActionType.FinishingMove` を返す場合は `suppressAutoFinishingMove: true` を設定する。
- カスタムとどめは `player.isEaten() && player.isDoomed()` を最優先で判定する。
- `onUse` 内で `StatusEffectType.Doomed` の解除や最終状態の付与が必要か確認する。

## i18n が反映されない

- `src/game/i18n/bosses/{boss-id}.ts` が `BossTranslation` を export しているか。
- `src/game/i18n/bosses/index.ts` に登録しているか。
- アクション翻訳のキーが `BossAction.id` と一致しているか。
- 翻訳がないフィールドはボスデータ側の値が表示されるため、未翻訳と不具合を切り分ける。

## TypeScript / lint / build エラー

- import は拡張子なしで書いているか。
- パスエイリアスは既存の `@/`、`@/game/`、`@/ui/`、`@/data/` に寄せているか。
- `BossAction` の必須フィールドがすべてあるか。
- `aiStrategy` が必ず `BossAction` を返すか。
- `onUse` が `string[]` を返すか。
- EJS や HTML を触った場合、Bootstrap の構造を壊していないか。
- `npm run typecheck`、`npm run test`、`npm run lint`、`npm run build` のどれで失敗しているかを切り分ける。

## フレーバー表現の確認

- エルナルを死亡または完全消化させる表現になっていないか。
- 過度な暴力表現になっていないか。
- 捕食、丸呑み、状態異常の表現が既存ボスの温度感から外れていないか。
- ユーモアや軽さがあり、ゲーム内の雰囲気に合っているか。
