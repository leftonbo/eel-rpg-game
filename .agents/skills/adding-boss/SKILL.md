---
name: adding-boss
description: Adds a new boss to the eel-rpg-game project. Use when the user asks to add/implement a new boss, create a boss data file under src/game/data/bosses/, design AI strategies or boss actions, add boss-specific status effects, configure explorer level unlock, define victory/defeat trophies, or translate boss data via i18n.
---

# 新ボス追加 Skill

このプロジェクトへ新しいボスを追加する際に従う手順と規約をまとめる。

## 必読ドキュメント

作業開始時には `docs/boss-creation-guide.md` を必ず参照すること。BossData / BossAction インターフェース、AI 戦略パターン、バランス設計指針、状態異常一覧、既存ボスの参考ファイル対応表がすべて収録されている。本 SKILL はその要約と作業フローを提供する。

- 詳細ガイド: `docs/boss-creation-guide.md`
- 既存ボス資料: `docs/bosses/README.md`
- ボスクラス実装: `src/game/entities/Boss.ts`

## 作業対象ファイル

以下のパスを使用する。Vite の glob import により `src/game/data/bosses/*.ts` は自動検出されるため手動登録は不要。

| 目的 | パス | 必須 |
|------|------|------|
| ボスデータ本体 | `src/game/data/bosses/{boss-id}.ts` | 必須 |
| ボス固有の状態異常設定 | `src/game/systems/status-effects/{boss-id}-effects.ts` | 新状態異常がある場合のみ |
| 状態異常 enum | `src/game/systems/StatusEffectTypes.ts` | 新状態異常がある場合のみ |
| 状態異常 CSS | `src/styles/main.css`（`.status-{type}` クラス） | 新状態異常がある場合のみ |
| i18n 翻訳 | `src/game/i18n/bosses/{boss-id}.ts` + `index.ts` 登録 | 多言語対応時 |
| ボス資料 | `docs/bosses/{boss-id}.md` | 推奨 |

命名規則:
- ファイル名は kebab-case の `{boss-id}.ts`
- export は `{camelCaseBossId}Data` 形式（例: `swamp-dragon.ts` → `swampDragonData`）
- `BossData.id` はファイル名と一致させる

## 実装ワークフロー

以下のチェックリストをコピーして進捗管理する:

```
- [ ] 1. ボスの設定・コンセプト整理（テーマ、解禁レベル、特徴ギミック）
- [ ] 2. 参考ボスの選定（「参考パターン選択指針」参照）
- [ ] 3. src/game/data/bosses/{boss-id}.ts を作成し BossData を実装
- [ ] 4. BossAction 群を定義（playerStateCondition と weight を忘れない）
- [ ] 5. aiStrategy を実装（敗北後・食べられ・戦闘不能・通常の分岐）
- [ ] 6. victoryTrophy / defeatTrophy を設定
- [ ] 7. explorerLevelRequired をテーマに合わせて設定
- [ ] 8. 必要なら新状態異常・i18n・資料ドキュメントを追加
- [ ] 9. 品質チェックコマンドを一通り通す
```

## Phase 1: コンセプト整理

ユーザーと以下を確定させてから実装に入る。不明点は必ず質問すること。

- ボスの世界観・見た目・行動コンセプト
- 想定難易度帯（初級 / 中級 / 上級 / 最高級）と `explorerLevelRequired`
- 特殊ギミック（拘束、繭、食べられ、特殊な状態異常、敗北後演出、カスタムとどめ等）
- 勝利 / 敗北記念品のイメージ

バランス目安（`docs/boss-creation-guide.md` より抜粋）:

| 難易度 | HP | 攻撃力 |
|--------|------|-------|
| 初級 | 250–450 | 10–24 |
| 中級 | 550–800 | 13–22 |
| 上級 | 970–2600 | 20–32 |

ギミック特化型は攻撃力を低め、直接火力型は高めに設定。実装後は `npm run boss-overview` で既存ボスと比較する。

## Phase 2: 参考パターン選択指針

実装したいコンセプトに最も近い既存ボスを選び、構造をなぞる:

| 求める特徴 | 参考ボス |
|------------|---------|
| 現代的な AI 戦略・`PostDefeatedAttack`・自動とどめ | `src/game/data/bosses/sea-kraken.ts` |
| `customVariables` による特殊技管理・`onUse` 活用 | `src/game/data/bosses/aqua-serpent.ts` |
| 新しい状態異常システム | `src/game/data/bosses/clean-master.ts` |
| 多様な状態異常・複雑な行動パターン | `src/game/data/bosses/dream-demon.ts` |
| `FinishingMove` アクション・給餌システム | `src/game/data/bosses/bat-vampire.ts` |
| 最新 EJS 対応・記念品システム | `src/game/data/bosses/underground-worm.ts` |
| 高 HP + `suppressAutoFinishingMove` | `src/game/data/bosses/seraph-mascot.ts` |
| フェーズ切替（二面性） | `src/game/data/bosses/dual-jester.ts` |
| 最高難易度 + 敗北後 8 ターン毎イベント | `src/game/data/bosses/demon-dragon.ts` |
| `FinishingMove` による永続状態遷移 | `src/game/data/bosses/slime-dragon.ts` |
| `PostDefeatedAttack` + `FinishingMove` 両用 | `src/game/data/bosses/tongue-dragon.ts` |
| 非戦闘的 AI 戦略・機械系ギミック | `src/game/data/bosses/thermal-archiver.ts` |

## Phase 3: BossData 実装の骨子

最小構成のテンプレートは `docs/boss-creation-guide.md` の「実装手順 > 1. 新ボスファイルの作成」を参照。以下のポイントを必ず押さえる:

1. **BossAction の必須属性**: `id`, `type`, `name`, `description`, `weight`。メッセージは `{boss}` / `{player}` プレースホルダ使用可。
2. **playerStateCondition**: `normal` / `ko` / `restrained` / `cocoon` / `eaten` / `defeated` を正しく指定しないと AI で選ばれない。
3. **aiStrategy の分岐順序**（推奨）:
   1. カスタム finishing（`suppressAutoFinishingMove` 使用時のみ、`player.isEaten() && player.isDoomed()` を検知）
   2. `player.isDefeated()` の敗北後行動（必要なら 8 ターン毎のカウントを `customVariables` で管理）
   3. `player.isEaten()` の体内行動
   4. `player.isKnockedOut()` の拘束/丸呑み分岐
   5. 通常の重み付きランダム選択
4. **customVariables**: 特殊技の使用フラグ・クールダウン・ターンカウントは `getCustomVariable` / `setCustomVariable` で管理。ボスデータ側で初期値を定義する。
5. **記念品**: `victoryTrophy` はボス外側由来（鱗、外皮、羽根等）、`defeatTrophy` はボス内側由来（体液、分泌物等）。

## Phase 4: 新状態異常を追加する場合

1. `StatusEffectType` enum に新規エントリを追加
2. `src/game/systems/status-effects/{boss-id}-effects.ts` で `StatusEffectConfig` を定義（`onApply` / `onTick` / `onRemove` / `modifiers`）
3. `src/game/systems/status-effects/index.ts` から登録
4. `src/styles/main.css` に `.status-{type}` クラスを追加

既存の状態異常で代用できる場合は追加しない。利用可能な状態異常一覧は `docs/boss-creation-guide.md` の「利用可能な状態異常一覧」に集約されている。

## Phase 5: i18n（推奨）

`src/game/i18n/bosses/{boss-id}.ts` に `BossTranslation`（`ja` / `en`）を export し、`src/game/i18n/bosses/index.ts` に登録する。`src/game/data/index.ts` の `localizeBossData()` が読込時に自動適用する。未翻訳フィールドはボスデータ側の値が `defaultValue` として使われる。

## フレーバー表現のガイドライン

- **NG**: エルナルを死亡/完全消化させる表現、過度な暴力描写（四肢切断など）
- **推奨**: 捕食・丸呑み、一時的な状態異常、ユーモアを交えた軽い雰囲気
- 既存ボスの台詞スタイル・温度感を踏襲すること

## 品質チェック

実装後は以下を必ず実行し、エラーがないことを確認する:

```bash
npm run typecheck      # TypeScript 型チェック
npm run test           # Vitest 単体テスト
npm run lint           # ESLint
npm run build          # プロダクションビルド
npm run boss-overview  # 全ボスのステータス比較
```

追加で確認する項目:
- [ ] ボス選択画面での表示（EJS 自動生成）
- [ ] 戦闘開始・終了の動作
- [ ] 各 `BossAction` が AI 戦略から到達可能か
- [ ] 状態異常の付与・解除・CSS
- [ ] `explorerLevelRequired` による解禁制御
- [ ] 記念品の取得動作

## トラブルシューティング

| 症状 | 確認ポイント |
|------|-------------|
| ボスが表示されない | ファイル名 `{boss-id}.ts`、export 名 `{camelCaseBossId}Data`、`id` と `displayName` の定義、explorerLevel の解禁状況 |
| 行動が選択されない | `canUse` の条件、`weight > 0`、`playerStateCondition` の一致 |
| 状態異常が効かない | `StatusEffectType` 登録、`statusChance`（0.0–1.0）、CSS `.status-{type}` |
| Vite ビルドエラー | EJS テンプレート構文、glob import のパターンマッチング |

より詳細なトラブルシューティングは `docs/boss-creation-guide.md` 末尾の「よくある問題と対処法」を参照。
