---
name: adding-boss
description: Adds a new boss to the eel-rpg-game project. Use when the user asks to add/implement a new boss, create a boss data file under src/game/data/bosses/, design AI strategies or boss actions, add boss-specific status effects, configure explorer level unlock, define victory/defeat trophies, or translate boss data via i18n.
---

# 新ボス追加 Skill

このプロジェクトへ新しいボスを追加する際の中核手順をまとめる。`references/` のファイルは、新しい AI 戦略・状態異常・カスタムとどめ・バランス調整・トラブル対応を実装する場合にのみ読む。

## 参照の使い分け

作業開始時に読むもの:

- この `SKILL.md`
- 既存ボスの設定資料が必要な場合: `docs/bosses/README.md` と `docs/bosses/{boss-id}.md`
- 現在のボス一覧と数値比較が必要な場合: `npm run boss-overview`

必要時だけ読む詳細資料:

- 型・データ契約: `references/data-contracts.md`
- 実装雛形、AI、特殊行動: `references/implementation-patterns.md`
- 新状態異常: `references/status-effects.md`
- バランス、解禁レベル、記念品: `references/balance-unlocks-and-trophies.md`
- 目的別の既存ボス参照: `references/reference-bosses.md`
- 不具合時の確認表: `references/troubleshooting.md`

## 作業対象ファイル

Vite の glob import により `src/game/data/bosses/*.ts` は自動検出される。ボスデータの手動登録は不要。

| 目的 | パス | 必須 |
| --- | --- | --- |
| ボスデータ本体 | `src/game/data/bosses/{boss-id}.ts` | 必須 |
| ボス固有の状態異常設定 | `src/game/systems/status-effects/{boss-id}-effects.ts` | 新状態異常がある場合のみ |
| 状態異常 enum | `src/game/systems/StatusEffectTypes.ts` | 新状態異常がある場合のみ |
| 状態異常 CSS | `src/styles/main.css` | 新状態異常の表示が必要な場合のみ |
| i18n 翻訳 | `src/game/i18n/bosses/{boss-id}.ts` と `src/game/i18n/bosses/index.ts` | 多言語対応時 |
| ボス資料 | `docs/bosses/{boss-id}.md` | 必須 |

命名規則:

- ファイル名は kebab-case の `{boss-id}.ts`
- export は `{camelCaseBossId}Data` 形式
- `BossData.id` はファイル名と一致させる
- import 文は拡張子なしで書く

## 実装ワークフロー

必要に応じてこのチェックリストをコピーして進捗管理する。

```markdown
- [ ] 1. ボスの設定・コンセプト整理
- [ ] 2. 参考ボスの選定
- [ ] 3. `src/game/data/bosses/{boss-id}.ts` を作成
- [ ] 4. `BossAction` 群を定義
- [ ] 5. `aiStrategy` を実装
- [ ] 6. `victoryTrophy` / `defeatTrophy` を設定
- [ ] 7. `explorerLevelRequired` を設定
- [ ] 8. 新状態異常を追加するか判断し、必要なら実装
- [ ] 9. i18n 対応するか判断し、必要なら実装
- [ ] 10. `docs/bosses/{boss-id}.md` に設定資料を保存
- [ ] 11. 品質チェックを実行
```

## Phase 1: コンセプト整理

実装前にユーザーと以下を確定する。情報が不足・不明瞭な場合は次の質問を優先して確認してから実装を進める: 「ボスの見た目・世界観は？」「想定難易度と解禁レベルは？」「特殊ギミック（拘束・丸呑み・状態異常など）はあるか？」「記念品のイメージは？」「i18n 対応は必要か？」

- ボスの世界観、見た目、行動コンセプト
- 想定難易度帯と `explorerLevelRequired`
- 特殊ギミック: 拘束、繭、食べられ、状態異常、敗北後演出、カスタムとどめなど
- 勝利記念品と敗北記念品のイメージ
- i18n 対応の要否

バランス目安:

| 難易度 | HP | 攻撃力 |
| --- | ---: | ---: |
| 初級 | 250-450 | 10-24 |
| 中級 | 550-800 | 13-22 |
| 上級 | 970-2600 | 20-32 |

詳細な数値、解禁レベル、記念品の考え方は `references/balance-unlocks-and-trophies.md` を読む。

## Phase 2: 参考ボス選定

コンセプトに近い既存ボスを 1-3 個選び、構造をなぞる。目的別の参照先は `references/reference-bosses.md` を読む。

基本方針:

- AI が複雑なら `sea-kraken.ts`、`aqua-serpent.ts`、`demon-dragon.ts` を優先する。
- 新状態異常があるなら `clean-master.ts` や `dream-demon.ts` と対応する status effects を確認する。
- カスタムとどめがあるなら `seraph-mascot.ts`、`slime-dragon.ts`、`tongue-dragon.ts` を確認する。
- 機械系や非戦闘的ギミックなら `thermal-archiver.ts` を確認する。

## Phase 3: BossData 実装

必ず押さえること:

- `BossAction` の必須属性は `id`, `type`, `name`, `description`, `weight`
- メッセージは `{boss}` と `{player}` のプレースホルダを使用できる
- `playerStateCondition` は `normal`, `ko`, `restrained`, `cocoon`, `eaten`, `defeated` から正しく指定する
- 特殊技の使用フラグ、クールダウン、敗北後ターン数は `customVariables` で管理する
- `victoryTrophy` はボス外側由来、`defeatTrophy` はボス内側由来にする

型の詳細は `references/data-contracts.md` を読む。
実装例は `references/implementation-patterns.md` を読む。

AI 分岐の推奨順:

まずプレイヤー状態を次の優先順位で確認し、該当するブロックだけ処理する:

1. **カスタムとどめ**: `player.isEaten() && player.isDoomed()` → とどめ演出
2. **敗北後行動**: `player.isDefeated()` → 敗北後のターン行動
3. **体内行動**: `player.isEaten()` → 体内での攻撃・演出
4. **拘束・繭・丸呑み分岐**: `player.isKnockedOut()` → 状態に応じた特殊行動
5. **通常行動**: 上記のいずれにも該当しない → 重み付きランダム選択

## Phase 4: 新状態異常

既存の状態異常で代用できる場合は追加しない。新規追加が必要な場合だけ `references/status-effects.md` を読む。

追加時の最小手順:

1. `StatusEffectType` enum に追加
2. `src/game/systems/status-effects/{boss-id}-effects.ts` に `StatusEffectConfig` を定義
3. `src/game/systems/status-effects/index.ts` から登録
4. 必要なら `src/styles/main.css` に `.status-{type}` クラスを追加

## Phase 5: i18n

多言語対応する場合は `src/game/i18n/bosses/{boss-id}.ts` に `BossTranslation` を export し、`src/game/i18n/bosses/index.ts` に登録する。`src/game/data/index.ts` の `localizeBossData()` が読込時に自動適用する。

翻訳が未定義のフィールドはボスデータ側の値が `defaultValue` として使われる。

## フレーバー表現

- NG: エルナルを死亡・完全消化させる表現、過度な暴力描写
- 推奨: 捕食、丸呑み、一時的な状態異常、ユーモアを交えた軽い雰囲気
- `StatusEffectType.Dead` はゲームオーバー状態用であり、実際の死亡表現として扱わない
- 既存ボスの台詞スタイルと温度感を踏襲する

## ボス設定資料

以降のプロンプトで参照できるよう、`docs/bosses/{boss-id}.md` に以下を保存する。

- ボスの世界観・コンセプト
- ギミックの詳細
- 各種行動のフレーバー
- 拘束攻撃・体内表現のフレーバー
- 状態異常の効果とフレーバー
- 記念品のイメージと由来
- ユーザーが指定した追加情報

## 品質チェック

実装後は以下を実行する。

```bash
npm run typecheck
npm run test
npm run lint
npm run build
npm run boss-overview
```

手動確認:

- ボス選択画面で表示される
- 戦闘開始・終了が動作する
- 各 `BossAction` が AI 戦略から到達可能
- 状態異常の付与・解除・表示が動作する
- `explorerLevelRequired` による解禁制御が期待通り
- 勝利・敗北記念品が取得される

問題が出たら `references/troubleshooting.md` を読む。
