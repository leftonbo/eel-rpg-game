# AGENTS.md

このファイルは、開発支援エージェント向けの共通指示書です。

use context 7

## プロジェクト概要

- TypeScript で開発されたブラウザベースの RPG
- ボスを選択して戦闘する構成

## 技術スタック

### ビルドツール・開発環境

- **TypeScript 5.0+**: 厳密型チェック、モダン ES 構文
- **Vite 7.0+**: 高速開発サーバー、HMR、ESM 対応
- **Vitest 3.2+**: 単体テスト、Node.js 環境
- **ESLint 9.31**: コード品質チェック
- **Bootstrap 5.3**: UI フレームワーク
- **EJS**: テンプレートエンジン（Vite プラグイン統合）
- **i18next**: 多言語対応（日本語・英語、ボスデータ・UI テキストを翻訳）
- **marked / gray-matter**: Markdown 解析（ドキュメント・チェンジログ用）
- **npm**: パッケージマネージャ（Node.js 22+ 必須）

## 開発コマンド

### 基本コマンド

- `npm run dev` - 開発サーバー起動（localhost:3000、ホットリロード付き）
- `npm run build` - プロダクション用ビルド
- `npm run build:analyze` - バンドル分析付きプロダクションビルド
- `npm run typecheck` - TypeScript 型チェック
- `npm run lint` - ESLint 実行（`src/**/*.ts` 対象）
- `npm run clean` - dist ディレクトリクリーンアップ
- `npm run test` - Vitest 単体テスト
- `npm run test:watch` - Vitest 監視モード
- `npm run boss-overview` - 全ボスのステータス一覧を表形式で出力（`scripts/boss-overview.ts`）

### 開発フロー

1. 依存関係インストール: `npm install`
2. 開発サーバー起動: `npm run dev`
3. 変更前に型チェック: `npm run typecheck`
4. テスト実行: `npm run test`
5. ビルド確認: `npm run build`

## アーキテクチャ概要

### ゲーム状態管理

- **Game.ts**: メインゲームクラス、シーン間遷移とプレイヤー/ボス状態を管理
- **GameState enum**: `Title → OutGame → Battle` の状態遷移
- 各シーンクラスが DOM 操作とゲームロジックを分離

### エンティティシステム

- **Player.ts**: 主人公のステータス、アイテム、行動管理
- **Boss.ts**: ボス基底クラス、AI 戦略とアクションシステム
- **StatusEffectManager**: 状態異常の統一管理（火だるま、魅了、拘束など）
- **MemorialSystem.ts**: 戦闘記録・統計システム
- **PlayerSaveData.ts**: セーブデータ永続化システム（localStorage 使用）
- **ModalUtils.ts**: モーダル表示・操作ユーティリティ
- **ToastUtils.ts**: トースト表示ユーティリティ

### データ駆動型ボス設計

- `src/game/data/bosses/`: 各ボス個別ファイル
- **BossData interface**: HP、攻撃力、行動パターン、AI 戦略を定義
- **AIStrategy function**: ボス固有の戦術（沼のドラゴン＝高火力、闇のおばけ＝状態異常、機械のクモ＝拘束特化）
- **Vite glob import**: `import.meta.glob('./bosses/*.ts')` による自動ボス検出（手動登録不要）
- **i18n 連携**: `src/game/data/index.ts` の `localizeBossData()` がボスデータを `i18next` で翻訳、表示時に `displayName` / `description` / `actions` / メッセージ類を自動ローカライズ
- **EJS テンプレートシステム**: 自動 HTML 生成、手動編集不要

### 特殊システム

- **拘束システム**: もがく / じっとする選択、解除時ボス 3 ターン気絶
- **食べられ状態**: HP0 + 拘束時発生、最大 HP を吸収される
- **戦闘不能**: HP0 で 5 ターン行動不能後 50% 回復
- **再起不能**: 最大 HP0 で再起不能、ボスからとどめ攻撃を受け、その後は永続の敗北イベント
- **敗北イベント**: ボスの体内に閉じ込められる永続イベント演出、一部は 8 ターンごとに特殊演出
- **アイテムシステム**: ターン消費なし、回復薬（状態異常解除）とアドレナリン注射（無敵）

## 実装パターン

### 新ボス追加

新ボスの追加作業は `adding-boss` Skill（`.cursor/skills/adding-boss/SKILL.md`）に従うこと。Skill が作業フロー・ファイル配置・参考ボス対応表・品質チェックをまとめている。詳細な実装仕様は [包括的なボス追加ガイド](docs/boss-creation-guide.md)、既存ボス資料は [ボス資料集](docs/bosses/README.md) を参照。

### 状態異常追加

1. `StatusEffectType` enum に新タイプ追加
2. `StatusEffectManager.configs` Map に設定追加
3. `onTick` / `onApply` / `onRemove` コールバックで効果実装
4. CSS（`src/styles/main.css`）に `status-[type]` クラス追加

### セーブデータ管理（PlayerSaveData）

- **PlayerSaveData interface**: アビリティ、装備、戦闘記録を含むプレイヤー進行状態
- **PlayerSaveManager**: localStorage 操作、データマイグレーション、バリデーション機能を提供
- 保存データ: `localStorage['eelfood_player_data']` に JSON で格納
- バージョン管理: 現在 v7、自動マイグレーション機能付き

#### セーブデータ構造

```typescript
interface PlayerSaveData {
    abilities: { [key: string]: AbilityData };     // アビリティレベル/経験値
    equipment: {
        weapon: string;
        armor: string;
        gloves: string;
        belt: string;
    };                                              // 装備武器/防具/手袋/ベルトID
    memorials: MemorialSaveData;                    // ボス撃破記録・統計
    playerInfo: { name: string; icon: string; };    // プレイヤー名・アイコン
    readDocuments: string[];                        // 既読ドキュメントID（未読バッジシステム用）
    shownChangelogIndex: number;                    // 表示済み最新チェンジログエントリのインデックス
    version: number;                                // データバージョン（マイグレーション用）
}
```

#### 主要メソッド

- `loadPlayerData()` / `savePlayerData()`: メインのロード / セーブ
- `createDefaultSaveData()`: デフォルト初期値作成
- `exportSaveData()` / `importSaveData()`: JSON 形式でインポート / エクスポート
- `clearSaveData()`: 全データ削除（テスト / リセット用）
- `saveEquipment()` / `saveAbilities()` / `saveBattleMemorials()` 等: 部分保存ユーティリティ
- `hasSaveData()`: セーブデータ存在チェック
- `validateSaveDataStructure()`: セーブデータ構造検証（インポート時）

#### PlayerManager クラス群の分離

- **PlayerEquipmentManager**: 装備システム管理（武器・防具の装備変更、ボーナス計算）
- **PlayerItemManager**: アイテム管理（使用、効果適用、個数管理）
- **PlayerBattleActions**: 戦闘行動管理（攻撃、防御、スキル使用）
- **PlayerProgressionManager**: 成長管理（アビリティ経験値、レベルアップ処理）

### テンプレートシステム（EJS）

- **`src/templates/`**: EJS テンプレートファイル（HTML 自動生成）
- **`components/`**: 再利用可能コンポーネント（`ability-card.ejs`, `modal-base.ejs`）
- **`partials/`**: シーン別パーシャル（`battle-*.ejs`, `out-game-*.ejs`, `player-*.ejs` 等）
- **`action-buttons.ejs`**: アクションボタンの統一コンポーネント
- **`vite.config.ts`**: Vite 設定、EJS プラグイン統合
- 25 以上の EJS テンプレートによる完全な HTML 自動生成システム

### ドキュメント追加（ゲーム内文書）

ゲーム内で表示されるストーリー文書やフレーバーテキストを管理するシステム。

- 保存先: `src/game/data/documents/`
- `DocumentLoader.ts` が自動的に読み込み・解析し、条件を満たしたプレイヤーにゲーム内で表示

#### ドキュメントファイル形式

```markdown
---
id: document-unique-id
title: 📝 ドキュメントタイトル
type: diary | reflection | guide | lore
requiredExplorerLevel: 1
requiredBossDefeats: ["boss-id1", "boss-id2"]
requiredBossLosses: ["boss-id3"]
---

# マークダウン形式のコンテンツ

ここに実際のドキュメント内容を記述します。
```

#### フロントマター項目

- **id**: ドキュメントの一意識別子（ファイル名と一致させる）
- **title**: ゲーム内表示タイトル（絵文字推奨）
- **type**: ドキュメント分類（`diary` = 日記、`reflection` = 振り返り、`strategy` = 攻略、`default` = その他・世界観）
- **requiredExplorerLevel**: 表示に必要なエクスプローラーレベル
- **requiredBossDefeats**: 表示に必要なボス撃破条件（配列）
- **requiredBossLosses**: 表示に必要なボス敗北条件（配列）

#### 新ドキュメント追加手順

1. `src/game/data/documents/{id}.md` にマークダウンファイル作成
2. フロントマターで表示条件を設定
3. `DocumentLoader.ts` が自動的に読み込み・解析
4. 条件を満たしたプレイヤーにゲーム内で表示

## ゲームバランス

- `PlayerConstants.ts`: `BASE_MAX_HP=100`, `BASE_MAX_MP=50`, `BASE_ATTACK_POWER=10`
- 状態異常ダメージ: 火だるま = 8, 毒 = 3（毎ターン）
- アビリティ: 6 種類（Combat, Toughness, Endurance, Agility, CraftWork, Explorer）
- 装備: 武器 4 段階（素手 → ナイフ → 剣 → 大剣）、防具 4 段階（裸 → 服 → 軽装甲 → 重装甲）
- 現在のボス（18 体、`explorerLevelRequired` 別）:
  - Lv0 初期エリア: 沼のドラゴン (HP400/ATK24), 闇のおばけ (HP250/ATK18), 機械のクモ (HP300/ATK12)
  - Lv1 砂漠: 運び屋のサソリ (HP580/ATK22)
  - Lv2 海: 海のクラーケン (HP640/ATK16), アクアサーペント (HP750/ATK20), スライムドラゴン (HP550/ATK14)
  - Lv3 ゲストキャラ: 夢の淫魔 (HP320/ATK10)
  - Lv4 ジャングル: 蜜柑ドラゴン (HP450/ATK18)
  - Lv5 洞窟・地下世界: 地底のワーム (HP800/ATK13), 舌のドラゴン (HP680/ATK16)
  - Lv6 遺跡・古城: クリーンマスター (HP720/ATK16), 蝙蝠のヴァンパイア (HP640/ATK30)
  - Lv7 氷河: ふわふわドラゴン (HP600/ATK14)
  - Lv8 工業: サーマル・アーカイバー (HP580/ATK17)
  - Lv9 天使界: セラフィムマスコット (HP1200/ATK32), 双面の道化師 (HP970/ATK20)
  - Lv10 魔界: 魔界の竜 (HP2600/ATK22)

## UI 実装方針

### Bootstrap 5 を使用した UI 実装

このプロジェクトでは、レスポンシブで統一感のある UI を実現するために Bootstrap 5 の機能を活用してください。

#### 推奨する Bootstrap 5 コンポーネント

- **カードコンポーネント** (`.card`, `.card-body`, `.card-title`): ボス選択画面、バトル画面のステータス表示
- **ボタンコンポーネント** (`.btn`, `.btn-primary`, `.btn-secondary`): アクションボタン、ナビゲーション
- **バッジコンポーネント** (`.badge`): 状態異常、HP/MP 表示
- **プログレスバー** (`.progress`, `.progress-bar`): HP/MP ゲージ
- **グリッドシステム** (`.container`, `.row`, `.col-*`): レイアウト構造
- **ユーティリティクラス** (`.text-center`, `.mb-3`, `.p-4`): スペーシングとアライメント

#### UI 実装のガイドライン

1. **カラーテーマ**: Bootstrap のカラーシステム（primary, success, danger, warning）を使用可能
   - 状態異常やフレーバーテキストなどは適宜カスタムカラーを使用する
2. **レスポンシブ**: モバイルファーストでデザイン、`.col-sm-*`, `.col-md-*` を適切に使用
3. **アクセシビリティ**: `aria-*` 属性、適切なコントラスト比を考慮
4. **一貫性**: 既存の Bootstrap クラスを優先し、カスタム CSS は最小限に留める

#### 特に重要な UI 要素（実装済み）

- **バトル画面**: `.card` でプレイヤー / ボス情報を整理、`.progress-bar` で HP/MP ゲージ表示
- **ボス選択画面**: EJS テンプレートで動的生成、エクスプローラーレベルによる解禁制御
- **モーダル画面**: ボス詳細、プレイヤー詳細、デバッグコンソールに `.modal` コンポーネント活用
- **アクションボタン**: EJS パーシャル（`action-buttons.ejs`）による統一コンポーネント
- **タブインターフェース**: プレイヤー詳細モーダルで `.nav-tabs` を使用（ステータス、装備、スキル、アイテム、データ管理）
- **プログレスバー**: HP/MP 表示、アビリティレベル表示に活用
- **バッジ**: ステータス効果の表示（実装は `StatusEffectManager` が担当）
- **アビリティカード**: `ability-card.ejs` によるコンポーネント化、レベル・経験値・効果表示

## コーディング規約

### TypeScript 設定

- `moduleResolution: "bundler"` - Vite との互換性
- `ES Next` ターゲット、ESM 出力
- import 文は拡張子なし（`.js` ではなく相対パス）
- 厳密型チェック有効、未使用変数エラー有効
- パスエイリアス: `@/`, `@/game/`, `@/ui/`, `@/data/`

### 命名・記法

- クラス: PascalCase
- 関数 / 変数: camelCase
- 定数: UPPER_SNAKE_CASE
- インターフェース: PascalCase（`I` プレフィックスなし）
- DOM 操作は `addEventListener` を使用
- コールバックは矢印関数で `this` を維持
- 例外処理は `try-catch` を基本とする

### ダイアログ / 通知（最重要）

ブラウザ標準のダイアログ（`alert()`, `confirm()`, `prompt()`）は使用禁止。必ず `ModalUtils` / `ToastUtils` を使用すること。

- **`alert()` の代替**: `ModalUtils.showAlert(message, title?)`
- **`confirm()` の代替**: `ModalUtils.showConfirm(message, title?)`
- **`prompt()` の代替**: `ModalUtils.showPrompt(message, defaultValue?, title?, inputType?)`
- **通知表示**: `ToastUtils.showToast(message, title?, type?)`

**理由**:

- Bootstrap 5 のモーダルシステムとの統一感
- ユーザー体験の向上（アニメーション、スタイリング）
- モバイル環境での一貫した表示
- カスタマイズ可能性とアクセシビリティの向上

**例**:

```typescript
// ❌ 使用しない
alert('保存しました');
const result = confirm('削除しますか？');
const name = prompt('名前を入力してください');

// ✅ 推奨
await ModalUtils.showAlert('保存しました');
const result = await ModalUtils.showConfirm('削除しますか？');
const name = await ModalUtils.showPrompt('名前を入力してください');
ToastUtils.showToast('データを更新しました', 'データベース', 'success');
```

## 品質チェック

エージェント編集後は以下を必ず実行し、エラーがないことを確認すること:

- `npm run typecheck` で TypeScript 型エラーを確認
- `npm run test` で Vitest 単体テスト実行
- `npm run build` でプロダクション用ビルド実行
- `npm run lint` で ESLint によるコード品質チェック（必要に応じて）

## Git / PR ルール

### コミットメッセージ

- コミットメッセージは日本語で記述する
- コミットメッセージには gitmoji スタイルを使用する
- 詳細は [git-commit.md](./docs/rules/git-commit.md) を参照

### ブランチ命名

- `feature/` + 機能名
- `bugfix/` + バグ内容
- `refactor/` + リファクタリング内容
- `docs/` + ドキュメント更新内容

### PR 説明の形式

PR タイトルと内容は日本語で記述する。詳細は [pull-request.md](./docs/rules/pull-request.md) を参照。

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

### プルリクエストレビューメッセージ

- レビューは日本語で行うこと
- 以下の prefix を使用すること
  - `[must]` - 必須の修正
  - `[imo]` - 個人的な意見
  - `[nits]` - 細かい指摘
  - `[ask]` - 質問
  - `[fyi]` - 参考情報

## メモの保存先

- プロンプト履歴やアイデア草案は `docs/drafts/` に `.md` 形式で保存する

## キャラクター設定について

- **エルナル**: [src/game/data/documents/character-elnal.md](src/game/data/documents/character-elnal.md) に詳細設定
- **ボス設定**: [docs/bosses/README.md](docs/bosses/README.md) ディレクトリに各ボスの設定ファイル
