# AGENTS.md

開発支援エージェントが常時守る最小限の指示

ライブラリ、フレームワーク、SDK、CLI の仕様確認やコード例が必要な場合は Context7 を優先して使う。

## プロジェクト概要

- TypeScript / Vite 製のブラウザ向けターン制 RPG
- プレイヤーがボスを選択して戦闘する
- 戦闘記録、装備、アビリティ、ゲーム内文書を進行データとして扱う。
- 主な技術: TypeScript 5.8+, Vite 7.1+, Vitest 3.2+, ESLint 9.31, Bootstrap 5.3, i18next, marked, gray-matter
- Node.js 22+ と npm を前提にする

## 情報の置き場所

- 新ボス追加: `.agents/skills/adding-boss/SKILL.md`
- ゲーム内文書追加: `.agents/skills/adding-game-document/SKILL.md`
- ボス設定資料: `docs/bosses/README.md` と `docs/bosses/*.md`
- Git コミット規約: `docs/rules/git-commit.md`
- PR 説明規約: `docs/rules/pull-request.md`
- ファイル別の短い規約: `.cursor/rules/*.mdc`
- エルナル設定: `src/game/data/documents/character-elnal.md`
- アイデア草案やプロンプト履歴: `docs/drafts/*.md`

## 主要コマンド

- `npm run dev` - 開発サーバー起動
- `npm run typecheck` - TypeScript 型チェック
- `npm run test` - Vitest
- `npm run build` - プロダクションビルド
- `npm run lint` - ESLint
- `npm run boss-overview` - 全ボスのステータス比較

## アーキテクチャの要点

- ゲーム状態は `Title -> OutGame -> Battle` を中心に遷移
- `src/game/entities/` は `Player`、`Boss`、プレイヤー管理クラス群などのドメインモデルを持つ
- `src/game/scenes/` は DOM 操作とシーン固有 UI を扱う
- `src/game/systems/` はアビリティ、記録、セーブデータ、状態異常などの横断的な仕組みを持つ
- `src/game/data/bosses/*.ts` は `import.meta.glob('./bosses/*.ts')` で自動検出される
- ボス表示テキストは `src/game/data/index.ts` のローカライズ処理と `src/game/i18n/bosses/` の翻訳データで扱う

## コーディング規約

- import 文は拡張子なしで書く。
- パスエイリアスは `@/`, `@/game/`, `@/ui/`, `@/data/` を使用
- クラスとインターフェースは PascalCase、関数と変数は camelCase、定数は UPPER_SNAKE_CASE で命名
- インターフェース名に `I` プレフィックスを付けない
- DOM 操作は `addEventListener` を使い、コールバックは `this` を壊さないよう矢印関数を優先
- 既存の責務境界に沿って変更し、無関係なリファクタリングを混ぜない

## UI と通知

- UI は Bootstrap 5 のコンポーネントとユーティリティを優先し、カスタム CSS は必要な範囲に抑える
- レスポンシブ、アクセシビリティ、既存テンプレート構造との整合を確認する
- ブラウザ標準の `alert()`、`confirm()`、`prompt()` は使用禁止。必ず `ModalUtils` を使う
- トースト通知は `ToastUtils.showToast(message, title?, type?)` を使う

## セーブデータと互換性

- セーブデータは `PlayerSaveData` / `PlayerSaveManager` が管理し、localStorage の `eelfood_player_data` に保存される
- 永続データや公開済み挙動に影響する変更では、マイグレーション、既存データの扱い、PR の影響範囲を明記する

## Git / PR

- コミットメッセージは日本語で、gitmoji スタイルに従う。詳細は `docs/rules/git-commit.md` を参照
- ブランチ名は `feature/`、`bugfix/`、`refactor/`、`docs/` を基本にする
- PR タイトルと本文は日本語で書き、`docs/rules/pull-request.md` の形式に従う

## Review guidelines

- Write all pull request review comments in Japanese.
- レビューの要約、インラインコメント、修正提案はすべて日本語で書いてください。
- 指摘には「何が問題か」「なぜ問題か」「どう直すとよいか」を含めてください。
- 重大な不具合、セキュリティリスク、データ破壊、テスト不足、仕様破壊を優先してください。
- 好みの問題や軽微なスタイル差分だけの指摘は避けてください。
