# AGENTS.md

このファイルは、開発支援エージェント向けの共通指示書です。

## プロジェクト概要

- TypeScript で開発されたブラウザベースの RPG
- ボスを選択して戦闘する構成

## 技術スタック

- TypeScript 5.0+
- Vite 7.0+
- Vitest 3.2+
- Bootstrap 5.3
- EJS (ビルド時に HTML 生成)
- npm

## 開発コマンド

- `npm run dev` - 開発サーバー起動
- `npm run build` - プロダクションビルド
- `npm run build:analyze` - バンドル分析付きビルド
- `npm run typecheck` - TypeScript 型チェック
- `npm run test` - Vitest 単体テスト
- `npm run test:watch` - Vitest 監視モード
- `npm run lint` - ESLint 実行
- `npm run clean` - dist クリーンアップ

## アーキテクチャ概要

### ゲーム状態管理

- `Game.ts` がメインゲームクラス
- シーン間遷移は Title から選択画面を経て Battle に進む構成
- 各シーンクラスが DOM 操作とゲームロジックを分離

### エンティティシステム

- `Player.ts` - プレイヤーステータス、アイテム、行動管理
- `Boss.ts` - ボス基底クラス、AI 戦略とアクション
- `StatusEffectManager` - 状態異常の統一管理
- `PlayerSaveData.ts` - セーブデータ永続化
- `ModalUtils.ts` / `ToastUtils.ts` - UI 通知/モーダル

### データ駆動型設計

- `src/game/data/bosses/` に各ボスファイルを配置
- `import.meta.glob('./bosses/*.ts')` による自動検出 (手動登録不要)
- EJS テンプレートで HTML を自動生成 (手動編集不要)

## 実装パターン

### 新ボス追加

1. `src/game/data/bosses/{boss-id}.ts` を作成
2. `BossData` に従って設定 (HP、攻撃力、行動、AI)
3. 必要に応じて状態異常や UI を追加
4. `explorerLevelRequired` で解禁条件を設定
5. `victoryTrophy` / `defeatTrophy` を設定
6. テストで動作確認

### 状態異常追加

1. `StatusEffectType` enum に新タイプ追加
2. `StatusEffectManager.configs` に設定追加
3. `onTick` / `onApply` / `onRemove` で効果実装
4. `src/styles/main.css` に `status-[type]` クラス追加

### ドキュメント追加 (ゲーム内文書)

- 保存先: `src/game/data/documents/`
- front matter 例:

```markdown
---
id: document-unique-id
title: 📝 ドキュメントタイトル
type: diary | reflection | guide | lore
requiredExplorerLevel: 1
requiredBossDefeats: ["boss-id1", "boss-id2"]
requiredBossLosses: ["boss-id3"]
---
```

## UI 実装方針

- Bootstrap 5 を優先使用 (card, button, badge, progress, grid)
- レスポンシブはモバイルファースト
- `aria-*` を含むアクセシビリティを考慮
- カスタム CSS は最小限

## コーディング規約

- import 文は拡張子なし
- `moduleResolution: "bundler"` を前提
- 厳密型チェックを前提
- 命名規則:
  - クラス: PascalCase
  - 関数/変数: camelCase
  - 定数: UPPER_SNAKE_CASE
  - インターフェース: PascalCase (I プレフィックスなし)
- DOM 操作は `addEventListener` を使用
- コールバックは矢印関数で `this` を維持
- 例外処理は `try-catch` を基本とする

### ダイアログ/通知

- ブラウザ標準の `alert` / `confirm` / `prompt` は使用禁止
- 代替:
  - `ModalUtils.showAlert(...)`
  - `ModalUtils.showConfirm(...)`
  - `ModalUtils.showPrompt(...)`
  - `ToastUtils.showToast(...)`

## 品質チェック

エージェント編集後は以下を確認:

- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run lint` (必要に応じて)

## Git/PR ルール

### コミットメッセージ

コミットメッセージには gitmoji スタイルを使用します。詳細は [git-commit.md](./docs/rules/git-commit.md) を参照。

### ブランチ命名

- `feature/` + 機能名
- `bugfix/` + バグ内容
- `refactor/` + リファクタリング内容
- `docs/` + ドキュメント更新内容

### PR 説明の形式

PR 説明には以下の形式を使用します。詳細は [pull-request.md](./docs/rules/pull-request.md) を参照。

```markdown
## 概要

[変更内容の簡潔な説明]

## 変更内容

- [具体的な変更点1]
- [具体的な変更点2]

## 影響範囲

[他のシステムや機能への影響]

## テスト項目

- [ ] [テスト項目1]
- [ ] [テスト項目2]
- [ ] `npm run typecheck` で型エラーなし
- [ ] `npm run test` でテスト通過
- [ ] `npm run build` でビルド成功

## 関連Issue

[関連する Issue があれば記載]
```

## メモの保存先

- プロンプト履歴やアイデア草案は `docs/drafts/` に保存する

## プルリクエストレビューメッセージ

- レビューは日本語で行うこと
- 以下のprefixを使用すること
  - [must] - 必須の修正
  - [imo] - 個人的な意見
  - [nits] - 細かい指摘
  - [ask] - 質問
  - [fyi] - 参考情報
