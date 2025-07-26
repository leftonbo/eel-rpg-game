# ElnalFTB - ターン制RPG

ウナギのようなキャラクター「エルナル」がボス敵を倒しに行くブラウザで遊べるターン制RPGゲームです。

## 🎮 **今すぐプレイ**

**➤ [ゲームをプレイする](https://leftonbo.github.io/eel-rpg-game/)**

## ゲーム概要

- **ジャンル**: ターン制RPG
- **プラットフォーム**: ブラウザ（HTML5 + TypeScript）
- **特徴**: 本格的なボス戦（11体実装済み）、豊富なステータス効果、成長システム、拘束・脱出システム
- **プレイURL**: https://leftonbo.github.io/eel-rpg-game/

## ゲームシステム

### 🎯 **戦闘システム**

- **基本行動**
  - **攻撃**: 通常攻撃・クリティカルヒット
  - **防御**: 次ターンのダメージを半減（要解禁）
  - **スキル**: MPを消費して強力な攻撃や回復（要解禁）
  - **アイテム**: 回復薬やアドレナリン注射など（ターン消費なし）

- **特殊戦闘システム**
  - **拘束・脱出**: もがく/じっとするの選択、脱出成功でボス3ターン気絶
  - **食べられ状態**: HP0+拘束時発生、最大HP吸収によるゲームオーバー
  - **戦闘不能**: HP0で5ターン行動不能後50%回復
  - **状態異常**: 火だるま、毒、魅了、拘束など30種類以上の効果

### 🌟 **成長システム**

- **6種類のアビリティ**
  - **Combat**: 攻撃力強化・クリティカル率向上
  - **Toughness**: HP強化・防具解放・ダメージ軽減
  - **Endurance**: MP強化・MP効率・状態異常耐性
  - **Agility**: 拘束脱出率向上・命中率向上
  - **CraftWork**: アイテム効果強化・アイテム数増加
  - **Explorer**: 新エリア探索・ボス解禁・戦闘記念品

- **装備システム**
  - **武器**: 攻撃力強化（素手→ナイフ→剣→大剣）
  - **防具**: HP強化（裸→服→軽装甲→重装甲）

## 🏆 **実装済みボス（11体）**

### 基本エリア（常時利用可能）
- **🐲 沼のドラゴン** - HP 400, 高火力タイプ
- **👻 闇のおばけ** - HP 150, 状態異常特化
- **🕷️ 機械のクモ** - HP 180, 拘束特化

### 砂漠エリア（Explorer Lv.1）
- **🦂 スコーピオンキャリア** - HP 260, 毒・麻痺特化

### 海エリア（Explorer Lv.2）
- **🐙 海のクラーケン** - HP 350, 拘束・吸収タイプ
- **🐍 アクアサーペント** - HP 350, 水属性・体内攻撃

### ゲストキャラエリア（Explorer Lv.3）
- **😈 ドリームデーモン** - HP 240, 夢・特殊状態異常

### ジャングルエリア（Explorer Lv.4）
- **🍊 みかんドラゴン** - HP 320, 果物・睡眠タイプ

### 遺跡エリア（Explorer Lv.6）
- **🧽 クリーンマスター** - HP 280, 清掃・状態異常
- **🦇 蝙蝠のヴァンパイア** - HP 310, 魅了・生気吸収
- **🪱 地下のワーム** - HP 380, 地下型拘束

## キャラクター設定

- **エルナル**（主人公）
  - 設定資料: [Notion](https://tonbonotion01.notion.site/mycharacter-elnal)

## 開発環境

### 必要なソフトウェア

- Node.js (v18以上推奨)
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

   ブラウザで `http://localhost:3000` が自動的に開きます。

### 利用可能なコマンド

- `npm run dev`: 開発サーバーを起動（ホットリロード付き）
- `npm run build`: プロダクション用にビルド
- `npm run build:analyze`: バンドル分析付きプロダクションビルド
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
│   │   │   ├── MemorialSystem.ts    # 戦闘記録・統計システム
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
│   │   │   ├── bosses/              # ボスデータ（11体）
│   │   │   ├── skills/              # スキルシステム
│   │   │   │   ├── agility.ts
│   │   │   │   ├── combat.ts
│   │   │   │   ├── craftwork.ts
│   │   │   │   ├── endurance.ts
│   │   │   │   ├── explorer.ts
│   │   │   │   ├── toughness.ts
│   │   │   │   ├── types.ts
│   │   │   │   └── index.ts
│   │   │   ├── items/               # アイテムシステム
│   │   │   │   ├── ExtendedItems.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts             # データエクスポート
│   │   └── utils/          # ユーティリティ
│   │       ├── CombatUtils.ts       # 戦闘計算ユーティリティ
│   │       ├── ModalUtils.ts        # トースト表示・モーダル表示・操作ユーティリティ
│   │       └── player-modals/       # プレイヤーモーダル管理
│   │           ├── PlayerModalManager.ts
│   │           ├── PlayerEquipmentManager.ts
│   │           ├── PlayerItemManager.ts
│   │           └── PlayerBattleActions.ts
│   └── styles/             # スタイルシート
│       └── main.css
├── docs/                   # ドキュメント
│   ├── boss-creation-guide.md       # ボス作成ガイド
│   ├── bosses/                      # ボス資料集
│   │   └── README.md
│   └── drafts/                      # プロンプト履歴・アイデア草案
├── dist/                   # ビルド出力
├── templates/              # EJSテンプレート
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

## 📖 ドキュメント

- **[ボス作成ガイド](docs/boss-creation-guide.md)** - 新ボス追加のための詳細ガイド
- **[ボス資料集](docs/bosses/README.md)** - 全ボスの詳細情報
- **[プロジェクト支援ドキュメント](CLAUDE.md)** - AI開発支援用設定

## 🔧 **ゲーム開発について**

### データ駆動型ボス設計
- `BossData` インターフェースによる統一された定義
- AI戦略関数によるボス固有の戦術
- 重み付きアクション選択システム
- 動的インポートによるCode splitting対応

### プレイヤー進行システム
- セーブデータ管理（localStorage、バージョン管理）
- アビリティ成長システム（6種類）
- 装備システム（武器・防具）
- 戦闘記録・統計システム

### UI/UXシステム
- Bootstrap 5ベースのレスポンシブデザイン
- EJSテンプレートによるコンポーネント化
- モーダル・タブインターフェース
- プログレスバー・バッジ表示

## ライセンス

### ゲームシステム

MIT License

### キャラクター

準備中
