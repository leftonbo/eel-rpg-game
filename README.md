# ElnalFTB - ターン制RPG

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
  - **攻撃**: 通常攻撃
  - **防御**: 次ターンのダメージを半減（要解禁）
  - **スキル**: MPを消費して強力な攻撃や回復（要解禁）
  - **アイテム**: 回復薬やアドレナリン注射など

- **拘束・脱出システム**
  - ボスによる拘束攻撃と段階的脱出システム
  - もがく・じっとするの選択肢
  - 脱出成功でボスを3ターン気絶させる

### 🌟 **成長システム**

- **5種類のアビリティ**
  - **Combat**: 攻撃力強化
  - **Toughness**: HP強化・防具解除
  - **Endurance**: MP強化・MP効率
  - **Agility**: 拘束脱出率向上
  - **CraftWork**: アイテム効果強化・アイテム数増加

- **装備システム**
  - **武器**: 攻撃力強化（素手→ナイフ→剣→大剣）
  - **防具**: HP強化（裸→服→軽装甲→重装甲）

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

- **言語**: TypeScript 5.0+
- **バンドラー**: Webpack 5.88
- **UI**: Bootstrap 5（CDN）+ カスタムCSS
- **開発ツール**: ESLint 9.31, TypeScript Compiler
- **ビルドツール**: ts-loader, css-loader, html-webpack-plugin

## プロジェクト構造

```text
eel-rpg-game/
├── src/
│   ├── index.html          # メインHTML
│   ├── main.ts             # エントリーポイント
│   ├── robots.txt          # ロボット対応ファイル
│   ├── game/               # ゲームロジック
│   │   ├── Game.ts         # ゲームメインクラス
│   │   ├── systems/        # ゲームシステム
│   │   │   ├── StatusEffect.ts      # ステータス効果管理
│   │   │   ├── StatusEffectTypes.ts # ステータス効果タイプ定義
│   │   │   ├── AbilitySystem.ts     # アビリティシステム
│   │   │   ├── PlayerSaveData.ts    # セーブデータ管理
│   │   │   └── status-effects/      # ステータス効果詳細
│   │   │       ├── battle-effects.ts
│   │   │       ├── core-states.ts
│   │   │       ├── dream-demon-effects.ts
│   │   │       └── index.ts
│   │   ├── scenes/         # ゲームシーン
│   │   │   ├── TitleScene.ts        # タイトル画面
│   │   │   ├── BossSelectScene.ts   # ボス選択画面
│   │   │   ├── BattleScene.ts       # 戦闘画面
│   │   │   └── BattleResultScene.ts # 戦闘結果画面
│   │   ├── entities/       # ゲームエンティティ
│   │   │   ├── Actor.ts             # ベースアクタークラス
│   │   │   ├── Player.ts            # プレイヤークラス
│   │   │   └── Boss.ts              # ボスクラス
│   │   ├── data/           # ゲームデータ
│   │   │   ├── bosses/              # ボスデータ（9体）
│   │   │   ├── skills/              # スキルシステム
│   │   │   │   ├── agility.ts
│   │   │   │   ├── combat.ts
│   │   │   │   ├── endurance.ts
│   │   │   │   ├── toughness.ts
│   │   │   │   ├── types.ts
│   │   │   │   └── index.ts
│   │   │   ├── ExtendedItems.ts     # アイテムデータ
│   │   │   └── index.ts             # データエクスポート
│   │   └── utils/          # ユーティリティ
│   │       └── CombatUtils.ts       # 戦闘計算ユーティリティ
│   └── styles/             # スタイルシート
│       └── main.css
├── docs/                   # ドキュメント
│   ├── boss-creation-guide.md       # ボス作成ガイド
│   └── prompt-history.md            # プロンプト履歴
├── dist/                   # ビルド出力
├── uploads/                # アップロードファイル
├── CLAUDE.md               # AI開発支援ドキュメント
├── package.json            # プロジェクト設定
├── tsconfig.json           # TypeScript設定
├── webpack.config.js       # Webpack設定
├── eslint.config.js        # ESLint設定
└── README.md               # このファイル
```

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
