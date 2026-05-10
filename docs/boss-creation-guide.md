# ボス追加ガイド

新しいボス追加の流れを把握するためのドキュメントです。

## 概要

`src/game/data/bosses/` に TypeScript ファイルを追加すると、Vite の glob import により自動で読み込まれます。基本的な作業は次の通りです。

1. ボスのコンセプト、難易度、解禁レベル、ギミックを決める
2. `src/game/data/bosses/{boss-id}.ts` に `BossData` を実装する
3. 必要に応じて状態異常、i18n、CSS を追加する
4. 型チェック、テスト、lint、ビルド、ボス一覧比較を実行する

## 必要なファイル

| 目的 | パス | 備考 |
| --- | --- | --- |
| ボスデータ | `src/game/data/bosses/{boss-id}.ts` | 必須。ファイル名は kebab-case。 |
| ボス資料 | `docs/bosses/{boss-id}.md` | ボスの設定、ギミック、記念品の由来を保存する |
| 状態異常 enum | `src/game/systems/StatusEffectTypes.ts` | 新状態異常がある場合のみ |
| 状態異常設定 | `src/game/systems/status-effects/{boss-id}-effects.ts` | 新状態異常がある場合のみ |
| 状態異常表示 | `src/styles/main.css` | 独自の表示が必要な場合のみ |
| i18n | `src/game/i18n/bosses/{boss-id}.ts` | 多言語対応する場合のみ |
| i18n 登録 | `src/game/i18n/bosses/index.ts` | 多言語対応する場合のみ |

## 命名規則

- ボス ID とファイル名は kebab-case にする (例: `swamp-dragon`)
- export 名は camelCase + `Data` にする (例: `swampDragonData`)
- `BossData.id` はファイル名と一致させる
- import 文に拡張子は付けない

## 設計メモ

- `explorerLevelRequired` は世界観上の到達順と難易度の両方を見て決定してください
- 勝利記念品はボスの外側から得られるもの、敗北記念品はボスの内側から得られるものを想定しています。

## 検証コマンド

```bash
npm run typecheck
npm run test
npm run lint
npm run build
npm run boss-overview
```

## 関連資料

- [/.agents/skills/adding-boss/SKILL.md](/.agents/skills/adding-boss/SKILL.md) - エージェント向けのボス実装手順
- [/docs/bosses/README.md](/docs/bosses/README.md) - 既存ボス資料の一覧
