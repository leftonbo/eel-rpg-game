# ボス追加ガイド

このドキュメントは、人間が新しいボス追加の流れを把握するための短い案内です。実装時の詳細な型、AI パターン、状態異常一覧、トラブルシューティングは `.agents/skills/adding-boss/` に集約しています。

## 概要

新しいボスは `src/game/data/bosses/` に TypeScript ファイルを追加すると、Vite の glob import により自動で読み込まれます。基本的な作業は次の通りです。

1. ボスのコンセプト、難易度、解禁レベル、ギミックを決める。
2. `src/game/data/bosses/{boss-id}.ts` に `BossData` を実装する。
3. 必要に応じて状態異常、i18n、CSS を追加する。
4. `docs/bosses/{boss-id}.md` にボス設定資料を残す。
5. 型チェック、テスト、lint、ビルド、ボス一覧比較を実行する。

## 必要なファイル

| 目的 | パス | 備考 |
| --- | --- | --- |
| ボスデータ | `src/game/data/bosses/{boss-id}.ts` | 必須。ファイル名は kebab-case。 |
| ボス資料 | `docs/bosses/{boss-id}.md` | ボスの設定、ギミック、記念品の由来を保存する。 |
| 状態異常 enum | `src/game/systems/StatusEffectTypes.ts` | 新状態異常がある場合のみ。 |
| 状態異常設定 | `src/game/systems/status-effects/{boss-id}-effects.ts` | 新状態異常がある場合のみ。 |
| 状態異常表示 | `src/styles/main.css` | 独自の表示が必要な場合のみ。 |
| i18n | `src/game/i18n/bosses/{boss-id}.ts` | 多言語対応する場合のみ。 |
| i18n 登録 | `src/game/i18n/bosses/index.ts` | 多言語対応する場合のみ。 |

## 命名規則

- ボス ID とファイル名は kebab-case にする。例: `swamp-dragon`
- export 名は camelCase + `Data` にする。例: `swampDragonData`
- `BossData.id` はファイル名と一致させる。
- import 文に拡張子は付けない。

## 設計メモ

- HP と攻撃力は既存ボスと比較して決める。実装後に `npm run boss-overview` を使う。
- `explorerLevelRequired` は世界観上の到達順と難易度の両方を見て決める。
- 勝利記念品はボスの外側から得られるもの、敗北記念品はボスの内側から得られるものにすると既存設計と揃う。
- 既存状態異常で代用できるなら、新しい状態異常は増やさない。
- エルナルを死亡・完全消化させる表現や、過度な暴力表現は避ける。

## 検証コマンド

```bash
npm run typecheck
npm run test
npm run lint
npm run build
npm run boss-overview
```

手動では、ボス選択画面での表示、戦闘開始・終了、AI 行動の到達性、状態異常の付与・解除、解禁レベル、記念品取得を確認します。

## 関連資料

- `.agents/skills/adding-boss/SKILL.md` - エージェント向けのボス追加手順。
- `.agents/skills/adding-boss/references/` - 実装詳細、AI パターン、状態異常、バランス、トラブルシューティング。
- `docs/bosses/README.md` - 既存ボス資料の一覧。
