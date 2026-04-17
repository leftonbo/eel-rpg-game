# ElnalFTE - ターン制RPG

ウナギのようなキャラクター「エルナル」がボス敵を倒しに行くブラウザで遊べるターン制RPGゲームです。

## 🎮 今すぐプレイ

**➤ [ゲームをプレイする](https://leftonbo.github.io/eel-rpg-game/)**

## 🎮 プレイ方法

1. ブラウザでゲームを開く
2. タイトル画面からゲームスタート
3. ボス選択画面で挑戦するボスを選択
4. ターン制バトルでボスを倒そう！
5. アビリティを成長させて更に強いボスに挑戦
6. ライブラリでストーリードキュメントを読んで世界観を楽しむ

## ゲーム概要

- **ジャンル**: ターン制RPG
- **プラットフォーム**: ブラウザ（HTML5 + TypeScript）
- **特徴**: 本格的なボス戦、豊富なステータス効果、成長システム、拘束・脱出システム

## キャラクター設定

- **エルナル**（主人公）
  - 設定資料: **[Notion](https://tonbonotion01.notion.site/mycharacter-elnal)**
- **各種ボス設定**
  - **[ボス資料集](docs/bosses/README.md)** - 全ボスの詳細情報

## 開発環境

### 必要なソフトウェア

- Node.js (v22以上推奨)
- npm

### セットアップ手順

1. **リポジトリのクローン**

   ```bash
   git clone https://github.com/leftonbo/eel-rpg-game.git
   cd eel-rpg-game
   ```

2. **依存関係のインストール**

   ```bash
   npm install
   ```

3. **開発サーバーの起動**

   ```bash
   npm run dev
   ```

### 利用可能なコマンド

- `npm run dev`: 開発サーバーを起動（ホットリロード付き）
- `npm run build`: プロダクション用にビルド
- `npm run build:analyze`: バンドル分析付きプロダクションビルド
- `npm run typecheck`: TypeScriptの型チェック
- `npm run test`: Vitest単体テスト実行
- `npm run test:watch`: Vitest監視モード
- `npm run lint`: ESLintでコードチェック
- `npm run clean`: distディレクトリをクリーンアップ

## 技術スタック

- **言語**: TypeScript 5.0+
- **ビルドツール**: Vite 7.0+
- **テスト**: Vitest 3.2+
- **UI**: Bootstrap 5.3 + カスタムCSS
- **テンプレート**: EJS (ビルド時自動生成)
- **Markdown**: marked 16.1+ (gray-matterでフロントマター対応)
- **バンドル分析**: rollup-plugin-visualizer 6.0+
- **開発ツール**: ESLint 9.31, TypeScript Compiler
- **パッケージマネージャー**: npm
- **Node.js**: 22.0.0+

## 📖 ドキュメント

- **[ボス作成ガイド](docs/boss-creation-guide.md)** - 新ボス追加のための詳細ガイド
- **[プロジェクト支援ドキュメント](AGENTS.md)** - AI開発支援用設定

## ライセンス

### ゲームシステム

MIT License

### キャラクター

- **主人公、ボスキャラクター** (ゲストを除く)
  - ファンアートや二次創作は歓迎します。
  - R-18に該当するコンテンツは棲み分けをお願いします。
  - 政治的・宗教的な目的での利用は禁止します。
  - その他詳しい利用規約は [Notion サイトのガイドライン](https://tonbonotion01.notion.site/tonbo-creations-guidlines) を参照してください。
- **ゲストキャラクター**
  - ゲストキャラクターは各作者の意向に従います。
  - 著作権は各キャラクターの作者に帰属します。
