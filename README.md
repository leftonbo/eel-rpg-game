# ElnalFTB - ターン制RPG

ウナギのようなキャラクター「エルナル」がボス敵を倒しに行くブラウザで遊べるターン制RPGゲームです。

## 🎮 **今すぐプレイ**

**➤ [ゲームをプレイする](https://leftonbo.github.io/eel-rpg-game/)**

## ゲーム概要

- **ジャンル**: ターン制RPG
- **プラットフォーム**: ブラウザ（HTML5 + TypeScript）
- **特徴**: 本格的なボス戦（14体実装済み）、豊富なステータス効果、成長システム、拘束・脱出システム
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

## キャラクター設定

- **エルナル**（主人公）
  - 設定資料: [Notion](https://tonbonotion01.notion.site/mycharacter-elnal)

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

   ブラウザで `http://localhost:3000` が自動的に開きます。

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

## プロジェクト構造

```text
eel-rpg-game/
├── index.html          # メインHTML
├── src/
│   ├── main.ts             # エントリーポイント
│   ├── public/             # 静的ファイル
│   │   └── robots.txt      # ロボット対応ファイル
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
│   │   │       ├── dual-jester-effects.ts
│   │   │       ├── fluffy-dragon-effects.ts
│   │   │       ├── bat-vampire-effects.ts
│   │   │       ├── seraph-mascot-effects.ts
│   │   │       └── index.ts
│   │   ├── scenes/         # ゲームシーン
│   │   │   ├── BaseOutGameScene.ts  # アウトゲーム基底クラス
│   │   │   ├── TitleScene.ts        # タイトル画面
│   │   │   ├── OutGameBossSelectScene.ts      # ボス選択画面
│   │   │   ├── OutGamePlayerDetailScene.ts    # プレイヤー詳細画面
│   │   │   ├── OutGameLibraryScene.ts         # ライブラリ画面
│   │   │   ├── OutGameExplorationRecordScene.ts # 探索記録画面
│   │   │   ├── OutGameOptionScene.ts          # オプション画面
│   │   │   ├── BattleScene.ts       # 戦闘画面
│   │   │   ├── BattleResultScene.ts # 戦闘結果画面
│   │   │   ├── components/          # UIコンポーネント
│   │   │   │   ├── EquipmentSelectorComponent.ts
│   │   │   │   ├── SkillDisplayComponent.ts
│   │   │   │   └── TrophyDisplayComponent.ts
│   │   │   ├── managers/            # シーン管理クラス
│   │   │   │   ├── BossCardManager.ts
│   │   │   │   ├── PlayerInfoEditManager.ts
│   │   │   │   ├── PlayerModalManager.ts
│   │   │   │   └── SaveDataManager.ts
│   │   │   └── utils/               # シーンユーティリティ
│   │   │       ├── AbilityNameResolver.ts
│   │   │       ├── DOMUpdater.ts
│   │   │       └── ProgressCalculator.ts
│   │   ├── entities/       # ゲームエンティティ
│   │   │   ├── Actor.ts             # ベースアクタークラス
│   │   │   ├── Player.ts            # プレイヤークラス
│   │   │   ├── Boss.ts              # ボスクラス
│   │   │   ├── PlayerBattleActions.ts       # プレイヤー戦闘行動
│   │   │   ├── PlayerConstants.ts           # プレイヤー定数
│   │   │   ├── PlayerEquipmentManager.ts    # 装備管理
│   │   │   ├── PlayerItemManager.ts         # アイテム管理
│   │   │   ├── PlayerProgressionManager.ts  # 成長管理
│   │   │   └── SkillStrategy.ts             # スキル戦略
│   │   ├── data/           # ゲームデータ
│   │   │   ├── bosses/              # ボスデータ（14体・glob import対応）
│   │   │   ├── documents/           # ストーリードキュメント
│   │   │   │   └── about-elnal.md
│   │   │   ├── skills/              # スキルシステム
│   │   │   │   ├── agility.ts
│   │   │   │   ├── combat.ts
│   │   │   │   ├── endurance.ts
│   │   │   │   ├── toughness.ts
│   │   │   │   ├── types.ts
│   │   │   │   └── index.ts
│   │   │   ├── DocumentLoader.ts    # ドキュメント読み込み（glob import使用）
│   │   │   ├── ExtendedItems.ts     # 拡張アイテム
│   │   │   ├── PlayerIcons.ts       # プレイヤーアイコン
│   │   │   └── index.ts             # ボスデータローダー（glob import使用）
│   │   ├── types/          # 型定義
│   │   │   └── bootstrap.ts         # Bootstrap型定義
│   │   └── utils/          # ユーティリティ
│   │       ├── BootstrapMarkdownRenderer.ts # Markdownレンダラー
│   │       ├── CombatUtils.ts       # 戦闘計算ユーティリティ
│   │       └── ModalUtils.ts        # モーダル・トースト表示
│   ├── templates/          # EJSテンプレート（HTML自動生成）
│   │   ├── components/              # 再利用コンポーネント
│   │   │   ├── ability-card.ejs
│   │   │   └── modal-base.ejs
│   │   └── partials/                # パーシャルテンプレート
│   │       ├── action-buttons.ejs
│   │       ├── battle-*.ejs         # 戦闘関連
│   │       ├── out-game-*.ejs       # アウトゲーム関連
│   │       ├── player-*.ejs         # プレイヤー関連
│   │       └── utility-modals.ejs
│   ├── styles/             # スタイルシート
│   │   └── main.css
│   └── vite-env.d.ts       # Vite型定義
├── docs/                   # ドキュメント
│   ├── boss-creation-guide.md       # ボス作成ガイド
│   ├── bosses/                      # ボス資料集
│   │   └── README.md
│   └── drafts/                      # プロンプト履歴・アイデア草案
├── dist/                   # ビルド出力
├── uploads/                # アップロードファイル
├── CLAUDE.md               # AI開発支援ドキュメント
├── package.json            # プロジェクト設定
├── tsconfig.json           # TypeScript設定
├── vite.config.ts          # Vite設定
├── vitest.config.ts        # Vitest設定
├── eslint.config.js        # ESLint設定
└── README.md               # このファイル
```

### 📜 **ストーリードキュメントシステム**

ゲーム内で読めるストーリードキュメントシステムを実装。主人公エルナルの凒険日記や成長の記録をマークダウン形式で作成し、プレイヤーの進行状況に応じて解放される。

- **ドキュメントタイプ**: 日記、振り返り、攻略ガイド、世界観設定
- **解放条件**: エクスプローラーレベル、ボス撃破数、敗北経験など

## 🎮 **プレイ方法**

1. ブラウザでゲームを開く
2. タイトル画面からゲームスタート
3. ボス選択画面で挑戦するボスを選択
4. ターン制バトルでボスを倒そう！
5. アビリティを成長させて更に強いボスに挑戦
6. ライブラリでストーリードキュメントを読んで世界観を楽しむ

## 📖 ドキュメント

- **[ボス作成ガイド](docs/boss-creation-guide.md)** - 新ボス追加のための詳細ガイド
- **[ボス資料集](docs/bosses/README.md)** - 全ボスの詳細情報
- **[プロジェクト支援ドキュメント](CLAUDE.md)** - AI開発支援用設定

## 🔧 **ゲーム開発について**

### データ駆動型ボス設計
- `BossData` インターフェースによる統一された定義
- AI戦略関数によるボス固有の戦術
- 重み付きアクション選択システム
- **Vite glob import**による自動ボス検出システム（手動設定不要）
- 動的インポートによるCode splitting対応

### プレイヤー進行システム
- セーブデータ管理（localStorage、バージョン管理）
- アビリティ成長システム（6種類）
- 装備システム（武器・防具）
- 戦闘記録・統計システム
- ストーリードキュメントシステム（Markdown + フロントマター）

### UI/UXシステム
- Bootstrap 5.3ベースのレスポンシブデザイン
- EJSテンプレートによるコンポーネント化（Viteプラグイン統合）
- モーダル・タブインターフェース
- プログレスバー・バッジ表示
- 自動HTML生成（手動編集不要）
- **ModalUtils統一方針**: ブラウザ標準ダイアログ禁止、Bootstrapモーダルで統一

## ライセンス

### ゲームシステム

MIT License

### キャラクター

準備中
