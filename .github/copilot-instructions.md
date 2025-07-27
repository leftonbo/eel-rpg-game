# GitHub Copilot Instructions

use context 7

この指示書は、GitHub
Copilotがeel-rpg-gameプロジェクトで効果的にコード補完を行うためのガイドラインです。

## プロジェクト概要

TypeScriptで開発されたブラウザベースのRPGゲーム。プレイヤーがボスを選択して戦闘を行うシンプルなゲームです。

## 技術スタック

- **言語**: TypeScript 5.0+
- **ビルドツール**: Vite 6.0+
- **テスト**: Vitest 3.2+
- **DOM操作**: Vanilla JavaScript
- **UIフレームワーク**: Bootstrap 5.3
- **テンプレート**: EJS (ビルド時自動生成)
- **スタイル**: CSS + Bootstrap
- **パッケージマネージャー**: npm

## アーキテクチャパターン

### ゲーム状態管理

- `Game.ts`がメインゲームクラス
- GameState enum: Title → BossSelect → Battle
- 各シーンクラスがDOM操作とゲームロジックを分離

### エンティティシステム

- `Player.ts`: プレイヤーのステータス、アイテム、行動管理
- `Boss.ts`: ボス基底クラス、AI戦略とアクションシステム
- `StatusEffectManager`: 状態異常の統一管理

### データ駆動型設計

- `src/game/data/bosses/`: 各ボス個別ファイル
- BossData interface: HP、攻撃力、行動パターン、AI戦略を定義
- AIStrategy function: ボス固有の戦術

## コーディング規約

### TypeScript設定

- `moduleResolution: "node"`
- import文では拡張子なし
- 厳密型チェック有効

### 命名規則
- クラス名: PascalCase
- 関数名/変数名: camelCase
- 定数: UPPER_SNAKE_CASE
- インターフェース: PascalCase（Iプレフィックスなし）

### ファイル構成

```
src/
├── game/
│   ├── entities/    # プレイヤー、ボスクラス
│   ├── scenes/      # シーンクラス
│   ├── systems/     # 状態異常、セーブデータ、アビリティシステム
│   ├── data/        # ゲームデータ定義（ボス、スキル、アイテム）
│   └── utils/       # ユーティリティ関数
├── templates/       # EJSテンプレート（HTML自動生成）
├── styles/          # CSSファイル
├── tests/           # Vitestテストファイル
└── index.html       # メインHTMLテンプレート
```

## 実装パターン

### 新ボス追加時

1. `src/game/data/bosses/new-boss.ts` 作成
2. BossDataインターフェースに従い設定
3. aiStrategy関数でボス固有の戦術実装
4. `src/game/data/index.ts` の `registeredBossIds` 配列と `loadBossData` 関数に追加
5. EJSテンプレートシステムがHTMLを自動生成（手動編集不要）
6. explorerLevelRequired で解禁レベル設定
7. 記念品システム（victoryTrophy/defeatTrophy）設定

### 状態異常追加時

1. `StatusEffectType` enumに新タイプ追加
2. `StatusEffectManager.configs` Mapに設定追加
3. onTick/onApply/onRemove コールバックで効果実装
4. CSS（src/styles/main.css）にstatus-[type]クラス追加

### イベント処理

- DOM操作はaddEventListenerを使用
- コールバック関数は矢印関数でthisバインドを維持
- エラーハンドリングはtry-catch文で実装

## 重要な実装詳細

### 拘束システム

- もがく/じっとする選択
- 解除時ボス3ターン気絶
- 食べられ状態（HP0+拘束時）でゲームオーバー

### 戦闘システム

- ターン制バトル
- プレイヤーHP: 100、基本攻撃力: 5
- アイテム使用はターン消費なし
- 戦闘不能時は5ターン後50%回復
- 96種類の状態異常システム
- エクスプローラーレベルによるボス解禁システム
- 記念品システム（勝利時/敗北時のアイテム獲得）

### EJSテンプレートシステム

- HTMLの手動編集は禁止、EJSテンプレートで自動生成
- コンポーネント化されたUI要素（ability-card.ejs, modal-base.ejs など）
- Viteプラグインでビルド時に処理

## 開発コマンド

- `npm run dev` - 開発サーバー起動
- `npm run build` - プロダクション用ビルド
- `npm run build:analyze` - バンドル分析付きビルド
- `npm run typecheck` - TypeScript型チェック
- `npm run test` - Vitest単体テスト実行
- `npm run test:watch` - Vitest監視モード
- `npm run lint` - ESLint実行
- `npm run clean` - distディレクトリクリーンアップ

## コミット規約

- 日本語メッセージ
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
- Co-Authored-By: Claude記載時はClaude Code使用

## PRテンプレート

[pull_request_template.md](./pull_request_template.md) を参照してください。

## PRレビュー時の指示

- レビューは日本語で行うこと
- 以下のprefixを使用すること
  - [must] - 必須の修正
  - [imo] - 個人的な意見
  - [nits] - 細かい指摘
  - [ask] - 質問
  - [fyi] - 参考情報