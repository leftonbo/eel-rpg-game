# Eel Feed - ターン制RPG

ウナギのようなキャラクター「エルナル」がボス敵を倒しに行くブラウザで遊べるターン制RPGゲームです。

## ゲーム概要

- **ジャンル**: ターン制RPG
- **プラットフォーム**: ブラウザ（HTML5 + TypeScript）

## ゲームシステム

### エルナルのステータス強化

- **アビリティとレベルアップ**
  - 行動に応じたアビリティが成長
  - アビリティレベルで主人公のステータスが強化

### 行動選択肢

- **攻撃**: 通常攻撃
- **防御**: 次ターンのダメージを半減
- **アイテム使用**: ターンを消費しない

## 開発環境

### 必要なソフトウェア

- Node.js (v18以上推奨)
- npm または yarn

### セットアップ手順

1. **リポジトリのクローン**

   ```bash
   git clone <repository-url>
   cd eelfood
   ```

2. **依存関係のインストール**

   ```bash
   npm install
   ```

3. **開発サーバーの起動**

   ```bash
   npm run dev
   ```

   ブラウザで `http://localhost:3000` が自動的に開きます。

### 利用可能なコマンド

- `npm run dev`: 開発サーバーを起動（ホットリロード付き）
- `npm run build`: プロダクション用にビルド
- `npm run typecheck`: TypeScriptの型チェック
- `npm run lint`: ESLintでコードチェック
- `npm run clean`: distディレクトリをクリーンアップ

## 技術スタック

- **言語**: TypeScript
- **バンドラー**: Webpack 5
- **UI**: Bootstrap 5（CDN）
- **開発ツール**: ESLint, TypeScript

## プロジェクト構造

```text
eelfood/
├── src/
│   ├── index.html          # メインHTML
│   ├── main.ts             # エントリーポイント
│   ├── game/               # ゲームロジック
│   │   ├── Game.ts         # ゲームメインクラス
│   │   ├── systems/        # ゲームシステム
│   │   ├── scenes/         # ゲームシーン
│   │   ├── entities/       # ゲームエンティティ
│   │   ├── data/           # ゲームデータ
│   │   └── ui/             # UI管理
│   └── styles/             # スタイルシート
├── dist/                   # ビルド出力
├── package.json            # プロジェクト設定
├── tsconfig.json           # TypeScript設定
├── webpack.config.js       # Webpack設定
└── README.md               # このファイル
```

## ライセンス

MIT License
