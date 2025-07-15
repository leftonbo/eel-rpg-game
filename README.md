# Eel Feed - ターン制RPG

ウナギのようなキャラクター「エルナル」がボス敵を倒しに行くブラウザで遊べるターン制RPGゲームです。

## 🎮 **今すぐプレイ**

**➤ [ゲームをプレイする](https://leftonbo.github.io/eel-rpg-game/)**

## ゲーム概要

- **ジャンル**: ターン制RPG
- **プラットフォーム**: ブラウザ（HTML5 + TypeScript）
- **特徴**: 本格的なボス戦、豊富なステータス効果、成長システム
- **プレイURL**: https://leftonbo.github.io/eel-rpg-game/

## ゲームシステム

### 🎯 **戦闘システム**

- **基本行動**
  - **攻撃**: 通常攻撃とパワーアタック（2.5倍威力、20MP）
  - **防御**: 次ターンのダメージを半減
  - **ヒール**: HPを100回復（30MP）
  - **あばれる**: 拘束脱出確率2倍（30MP）

- **拘束・脱出システム**
  - ボスによる拘束攻撃と段階的脱出システム
  - もがく・じっとするの選択肢
  - 脱出成功でボスを3ターン気絶させる

### 🌟 **成長システム**

- **6種類のアビリティ**
  - **Combat**: 攻撃力強化
  - **Toughness**: HP強化・防具解除
  - **Endurance**: MP強化・MP効率
  - **Agility**: 拘束脱出率向上
  - **CraftWork**: アイテム効果強化・アイテム数増加
  - **Luck**: クリティカル率向上

- **装備システム**
  - **武器**: 攻撃力強化（素手→ナイフ→剣→大剣）
  - **防具**: HP強化（裸→服→軽装甲→重装甲）

### 🧪 **アイテム・クラフトシステム**

- **回復薬**: HP80%回復＋デバフ解除
- **アドレナリン注射**: 3ターン無敵
- **エリクサー**: HP100%回復＋デバフ解除＋MP回復強化
- **おまもり**: 緊急時の完全回復・状態解除

### ⚔️ **ボス戦**

- **沼のドラゴン**: 高火力・火属性攻撃特化
- **闇のおばけ**: 状態異常・魅了攻撃特化  
- **機械のクモ**: 拘束・繭化攻撃特化
- **夢魔**: 睡眠・精神系デバフ特化（40種類以上のステータス効果）

## キャラクター設定

- **エルナル**
  - 設定資料: [Notion](https://tonbonotion01.notion.site/mycharacter-elnal)

## 開発環境

### 必要なソフトウェア

- Node.js (v18以上推奨)
- npm または yarn

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

   ブラウザで `http://localhost:3000` が自動的に開きます。

### 利用可能なコマンド

- `npm run dev`: 開発サーバーを起動（ホットリロード付き）
- `npm run build`: プロダクション用にビルド
- `npm run typecheck`: TypeScriptの型チェック
- `npm run lint`: ESLintでコードチェック
- `npm run clean`: distディレクトリをクリーンアップ

## 技術スタック

- **言語**: TypeScript 5.8
- **バンドラー**: Webpack 5.100
- **UI**: Bootstrap 5（CDN）+ カスタムCSS
- **開発ツール**: ESLint 9.31, TypeScript Compiler
- **ビルドツール**: ts-loader, css-loader, html-webpack-plugin

## プロジェクト構造

```text
eel-rpg-game/
├── src/
│   ├── index.html          # メインHTML
│   ├── main.ts             # エントリーポイント
│   ├── game/               # ゲームロジック
│   │   ├── Game.ts         # ゲームメインクラス
│   │   ├── systems/        # ゲームシステム
│   │   │   ├── StatusEffect.ts      # ステータス効果管理
│   │   │   ├── AbilitySystem.ts     # アビリティシステム
│   │   │   └── PlayerSaveData.ts    # セーブデータ管理
│   │   ├── scenes/         # ゲームシーン
│   │   │   ├── TitleScene.ts        # タイトル画面
│   │   │   ├── BossSelectScene.ts   # ボス選択画面
│   │   │   ├── BattleScene.ts       # 戦闘画面
│   │   │   └── BattleResultScene.ts # 戦闘結果画面
│   │   ├── entities/       # ゲームエンティティ
│   │   │   ├── Player.ts            # プレイヤークラス
│   │   │   └── Boss.ts              # ボスクラス
│   │   ├── data/           # ゲームデータ
│   │   │   ├── bosses/              # ボスデータ
│   │   │   ├── ExtendedItems.ts     # アイテムデータ
│   │   │   └── index.ts             # データエクスポート
│   │   └── utils/          # ユーティリティ
│   └── styles/             # スタイルシート
├── docs/                   # ドキュメント
│   └── boss-creation-guide.md       # ボス作成ガイド
├── dist/                   # ビルド出力
├── CLAUDE.md               # AI開発支援ドキュメント
├── package.json            # プロジェクト設定
├── tsconfig.json           # TypeScript設定
├── webpack.config.js       # Webpack設定
└── README.md               # このファイル
```

## 🔄 **最近の主要アップデート**

### ステータス効果システムリファクタリング
- 40種類以上のステータス効果を完全にデータ駆動型に変更
- modifiers システムによる動的なパラメーター計算
- デバフ解除フラグによる柔軟なアイテム効果管理
- 型安全性と拡張性の大幅向上

### パッケージ管理のクリーンアップ
- 不要なパッケージ23個を削除
- package-lock.json を6163行から5901行に削減
- 脆弱性0件を維持

## 🎮 **プレイ方法**

1. ブラウザでゲームを開く
2. タイトル画面からゲームスタート
3. ボス選択画面で挑戦するボスを選択
4. ターン制バトルでボスを倒そう！
5. アビリティを成長させて更に強いボスに挑戦

## 開発ガイドライン

- [ボス作成ガイド](docs/boss-creation-guide.md)
- [プロジェクト支援ドキュメント](CLAUDE.md)

## ライセンス

### ゲームシステム

MIT License

### キャラクター

準備中
