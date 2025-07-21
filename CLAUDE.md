# CLAUDE.md

use context 7

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 開発コマンド

### 基本コマンド

- `npm run dev` - 開発サーバー起動（localhost:3000、ホットリロード付き）
- `npm run build` - プロダクション用ビルド
- `npm run typecheck` - TypeScript型チェック実行
- `npm run lint` - ESLint実行（src/**/*.ts対象）
- `npm run clean` - distディレクトリクリーンアップ

### 開発フロー

1. 依存関係インストール: `npm install`
2. 開発サーバー起動: `npm run dev`
3. 変更前に型チェック: `npm run typecheck`
4. ビルド確認: `npm run build`

## アーキテクチャ概要

### ゲーム状態管理

- **Game.ts**: メインゲームクラス、シーン間遷移とプレイヤー/ボス状態を管理
- **GameState enum**: Title → BossSelect → Battle の状態遷移
- 各シーンクラスがDOM操作とゲームロジックを分離

### エンティティシステム

- **Player.ts**: 主人公のステータス、アイテム、行動管理
- **Boss.ts**: ボス基底クラス、AI戦略とアクションシステム
- **StatusEffectManager**: 状態異常の統一管理（火だるま、魅了、拘束など）
- **MemorialSystem.ts**: 戦闘記録・統計システム
- **ModalUtils.ts**: モーダル表示・操作ユーティリティ

### データ駆動型ボス設計

- `src/game/data/bosses/`: 各ボス個別ファイル
- **BossData interface**: HP、攻撃力、行動パターン、AI戦略を定義
- **AIStrategy function**: ボス固有の戦術（沼のドラゴン＝高火力、闇のおばけ＝状態異常、機械のクモ＝拘束特化）

### 特殊システム

- **拘束システム**: もがく/じっとする選択、解除時ボス3ターン気絶
- **食べられ状態**: HP0+拘束時発生、最大HP吸収によるゲームオーバー
- **戦闘不能**: HP0で5ターン行動不能後50%回復
- **アイテムシステム**: ターン消費なし、回復薬（状態異常解除）とアドレナリン注射（無敵）

## 重要な実装パターン

### 新ボス追加手順

新ボスの追加方法については、[包括的なボス追加ガイド](docs/boss-creation-guide.md)を参照してください。

概要：
1. `src/game/data/bosses/{boss-id}.ts` でボスデータ作成
2. `src/game/data/index.ts` にエクスポート追加
3. `src/index.html` のボス選択画面にカード追加
4. 必要に応じて新しい状態異常を追加

### 状態異常追加

1. `StatusEffectType` enumに新タイプ追加
2. `StatusEffectManager.configs` Mapに設定追加
3. onTick/onApply/onRemove コールバックで効果実装
4. CSS（src/styles/main.css）にstatus-[type]クラス追加

### ゲームバランス調整

- Player.ts: maxHp=100, baseAttackPower=5
- 状態異常ダメージ: 火だるま=8, 毒=3（毎ターン）
- 現在のボス（9体）: 沼のドラゴン=400, 闇のおばけ=150, 機械のクモ=180, ドリームデーモン=240, スコーピオンキャリア=260, みかんドラゴン=320, 海のクラーケン=350, アクアサーペント=350, クリーンマスター=280
- コミット時はgitmojiと日本語メッセージを使用

## UI設計・実装方針

### Bootstrap 5を使用したUI実装

このプロジェクトでは、レスポンシブで統一感のあるUIを実現するために Bootstrap 5 の機能を活用してください。

#### 推奨するBootstrap 5コンポーネント

- **カードコンポーネント** (`.card`, `.card-body`, `.card-title`): ボス選択画面、バトル画面のステータス表示
- **ボタンコンポーネント** (`.btn`, `.btn-primary`, `.btn-secondary`): アクションボタン、ナビゲーション
- **バッジコンポーネント** (`.badge`): 状態異常、HP/MP表示
- **プログレスバー** (`.progress`, `.progress-bar`): HP/MPゲージ
- **グリッドシステム** (`.container`, `.row`, `.col-*`): レイアウト構造
- **ユーティリティクラス** (`.text-center`, `.mb-3`, `.p-4`): スペーシングとアライメント

#### UI実装のガイドライン

1. **カラーテーマ**: Bootstrap のカラーシステム（primary, success, danger, warning）を活用
2. **レスポンシブ**: モバイルファーストでデザイン、`.col-sm-*`, `.col-md-*` を適切に使用
3. **アクセシビリティ**: `aria-*` 属性、適切なコントラスト比を考慮
4. **一貫性**: 既存のBootstrap クラスを優先し、カスタムCSSは最小限に留める

#### 特に重要なUI要素（実装済み）

- **バトル画面**: `.card` でプレイヤー/ボス情報を整理、`.progress-bar` でHP/MPゲージ表示
- **ボス選択画面**: `.row .col-md-4` でボスカードをグリッド配置、各ボスは `.card` コンポーネント
- **モーダル画面**: ボス詳細、プレイヤー詳細、デバッグコンソールに `.modal` コンポーネント活用
- **アクションボタン**: `.d-grid gap-2` でボタンを縦配置、スキル/アイテムパネルの切り替え
- **タブインターフェース**: プレイヤー詳細モーダルで `.nav-tabs` を使用（ステータス、装備、スキル、アイテム、データ管理）
- **プログレスバー**: HP/MP表示、アビリティレベル表示に活用
- **バッジ**: ステータス効果の表示（実装は `StatusEffectManager` が担当）

## TypeScript設定

- `moduleResolution: "node"` - webpackとの互換性
- import文では拡張子なし（.jsではなく相対パス）
- 厳密型チェック有効、未使用変数エラー有効

## 開発方針（最重要）

### git コミット方針

Claude Codeは以下の方針に従ってgitコミットを行うこと

- Claude Code の編集であることが分かるように、コミット文に `Co-Authored-By: Claude <noreply@anthropic.com>` を追記すること
- 指示された作業1単位が終わるごとにコミットする
- .gitignore に含まれるファイルはコミットしない
- コミットメッセージは日本語で記述すること
- コミットメッセージの先頭に [gitmoji](https://gitmoji.dev/ja/) を使用すること
  - 頻繁に使用する gitmoji の抜粋
    - 🎉 新規プロジェクト立ち上げ
    - ✨️ 新機能追加
    - 🐛 バグ修正
    - 📝 ドキュメント更新
    - ♻️ リファクタリング
    - 🎨 コードスタイルの改善
    - ⚡️ パフォーマンス改善
    - 💥 大幅な仕様変更など破壊的な変更を含む更新
    - 🚀 デプロイ関連
    - 🔧 ゲームパラメータなどの設定変更
    - 🗃️ 内部データベース更新
    - 💄 UI/UXなどの見た目改善
    - 🚚 ファイル・フォルダ整理
    - 🍱 画像や音声などリソース周りの変更

### ブランチ作成時の命名規則

- `feature/` + 機能名
- `bugfix/` + バグ内容
- `refactor/` + リファクタリング内容
- `docs/` + ドキュメント更新内容

### PR 作成時の注意点

- コマンド使用時はシングルクォーテーション `'` を使用すること
- PRタイトルと内容は日本語で記述すること
- テンプレートは [.github/PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md) を使用
