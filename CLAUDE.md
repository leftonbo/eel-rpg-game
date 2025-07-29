# CLAUDE.md

use context 7

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 開発コマンド

### 基本コマンド

- `npm run dev` - 開発サーバー起動（localhost:3000、ホットリロード付き）
- `npm run build` - プロダクション用ビルド
- `npm run build:analyze` - バンドル分析付きプロダクションビルド
- `npm run typecheck` - TypeScript型チェック実行
- `npm run lint` - ESLint実行（src/**/*.ts対象）
- `npm run clean` - distディレクトリクリーンアップ
- `npm run test` - Vitest単体テスト実行
- `npm run test:watch` - Vitest監視モード実行

### 開発フロー

1. 依存関係インストール: `npm install`
2. 開発サーバー起動: `npm run dev`
3. 変更前に型チェック: `npm run typecheck`
4. テスト実行: `npm run test`
5. ビルド確認: `npm run build`

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
- **PlayerSaveData.ts**: セーブデータ永続化システム（localStorage使用）
- **ModalUtils.ts**: トースト表示・モーダル表示・操作ユーティリティ

### データ駆動型ボス設計

- `src/game/data/bosses/`: 各ボス個別ファイル
- **BossData interface**: HP、攻撃力、行動パターン、AI戦略を定義
- **AIStrategy function**: ボス固有の戦術（沼のドラゴン＝高火力、闇のおばけ＝状態異常、機械のクモ＝拘束特化）
- **EJSテンプレートシステム**: 自動HTML生成、手動編集不要

### 特殊システム

- **拘束システム**: もがく/じっとする選択、解除時ボス3ターン気絶
- **食べられ状態**: HP0+拘束時発生、最大HP吸収によるゲームオーバー
- **戦闘不能**: HP0で5ターン行動不能後50%回復
- **アイテムシステム**: ターン消費なし、回復薬（状態異常解除）とアドレナリン注射（無敵）

## 重要な実装パターン

### 新ボス追加手順

新ボスの追加方法については、[包括的なボス追加ガイド](docs/boss-creation-guide.md)を参照してください。

既存ボスの詳細な資料については、[ボス資料集](docs/bosses/README.md)を参照してください。

概要：
1. `src/game/data/bosses/{boss-id}.ts` でボスデータ作成
2. `src/game/data/index.ts` の `registeredBossIds` 配列とloadBossData関数に追加
3. EJSテンプレートシステムでHTML自動生成（手動HTML編集は不要）
4. 必要に応じて新しい状態異常をStatusEffectTypesに追加
5. エクスプローラーレベル設定（explorerLevelRequired）でボス解禁制御
6. 記念品システム（victoryTrophy/defeatTrophy）の設定
7. テスト実行で動作確認

### 状態異常追加

1. `StatusEffectType` enumに新タイプ追加
2. `StatusEffectManager.configs` Mapに設定追加
3. onTick/onApply/onRemove コールバックで効果実装
4. CSS（src/styles/main.css）にstatus-[type]クラス追加

### セーブデータ管理（PlayerSaveData）

- **PlayerSaveData interface**: アビリティ、装備、戦闘記録を含むプレイヤー進行状態
- **PlayerSaveManager**: localStorage操作、データマイグレーション、バリデーション機能を提供
- 保存データ: `localStorage['eelfood_player_data']` にJSONで格納
- バージョン管理: 現在v4、自動マイグレーション機能付き

#### セーブデータ構造

```typescript
interface PlayerSaveData {
    abilities: { [key: string]: AbilityData };     // アビリティレベル/経験値
    equipment: { weapon: string; armor: string; };  // 装備武器/防具ID
    memorials: MemorialSaveData;                    // ボス撃破記録・統計
    version: number;                                // データバージョン（マイグレーション用）
}
```

#### 主要メソッド

- `loadPlayerData()` / `savePlayerData()`: メインのロード/セーブ
- `createDefaultSaveData()`: デフォルト初期値作成
- `exportSaveData()` / `importSaveData()`: JSON形式でインポート/エクスポート
- `clearSaveData()`: 全データ削除（テスト/リセット用）
- `saveEquipment()` / `saveAbilities()` / `saveBattleMemorials()` 等: 部分保存ユーティリティ
- `hasSaveData()`: セーブデータ存在チェック
- `validateSaveDataStructure()`: セーブデータ構造検証（インポート時）

#### PlayerManagerクラス群の分離

- **PlayerModalManager**: プレイヤー詳細モーダル管理（タブ切り替え、表示制御）
- **PlayerEquipmentManager**: 装備システム管理（武器・防具の装備変更、ボーナス計算）
- **PlayerItemManager**: アイテム管理（使用、効果適用、個数管理）
- **PlayerBattleActions**: 戦闘行動管理（攻撃、防御、スキル使用）
- **PlayerProgressionManager**: 成長管理（アビリティ経験値、レベルアップ処理）

#### テンプレートシステム（EJS）

- **src/templates/**: EJSテンプレートファイル（HTML自動生成）
- **ability-card.ejs**: アビリティカードコンポーネント
- **action-buttons.ejs**: アクションボタンの統一コンポーネント
- **modal-base.ejs**: モーダルの基本構造
- **vite.config.ts**: Vite設定、EJSプラグイン統合

### ゲームバランス調整

- Player.ts: maxHp=100, baseAttackPower=5
- 状態異常ダメージ: 火だるま=8, 毒=3（毎ターン）
- アビリティ: 6種類（Combat, Toughness, Endurance, Agility, CraftWork, Explorer）
- 装備: 武器4段階（素手→ナイフ→剣→大剣）、防具4段階（裸→服→軽装甲→重装甲）
- 現在のボス（14体）:
  - 基本エリア: 沼のドラゴン(HP400), 闇のおばけ(HP150), 機械のクモ(HP180)
  - 砂漠: スコーピオンキャリア(HP260)
  - 海: 海のクラーケン(HP350), アクアサーペント(HP350)
  - ゲスト: ドリームデーモン(HP240)
  - ジャングル: みかんドラゴン(HP320)
  - 遺跡: クリーンマスター(HP280), 蝙蝠のヴァンパイア(HP310), 地下のワーム(HP380)
  - 天使エリア: ふわふわドラゴン(HP200), セラフマスコット(HP380)
  - 双頭道化師: デュアルジェスター(HP360)
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

1. **カラーテーマ**: Bootstrap のカラーシステム（primary, success, danger, warning）を使用可能
  - 状態異常やフレーバーテキストなどは適宜カスタムカラーを使用する
2. **レスポンシブ**: モバイルファーストでデザイン、`.col-sm-*`, `.col-md-*` を適切に使用
3. **アクセシビリティ**: `aria-*` 属性、適切なコントラスト比を考慮
4. **一貫性**: 既存のBootstrap クラスを優先し、カスタムCSSは最小限に留める

#### 特に重要なUI要素（実装済み）

- **バトル画面**: `.card` でプレイヤー/ボス情報を整理、`.progress-bar` でHP/MPゲージ表示
- **ボス選択画面**: EJSテンプレートで動的生成、エクスプローラーレベルによる解禁制御
- **モーダル画面**: ボス詳細、プレイヤー詳細、デバッグコンソールに `.modal` コンポーネント活用
- **アクションボタン**: EJSパーシャル（action-buttons.ejs）による統一コンポーネント
- **タブインターフェース**: プレイヤー詳細モーダルで `.nav-tabs` を使用（ステータス、装備、スキル、アイテム、データ管理）
- **プログレスバー**: HP/MP表示、アビリティレベル表示に活用
- **バッジ**: ステータス効果の表示（実装は `StatusEffectManager` が担当）
- **アビリティカード**: ability-card.ejsによるコンポーネント化、レベル・経験値・効果表示

## 技術スタック

### ビルドツール・開発環境

- **TypeScript 5.0+**: 厳密型チェック、モダンES構文
- **Vite 7.0+**: 高速開発サーバー、HMR、ESM対応
- **Vitest 3.2+**: 単体テスト、Node.js環境
- **ESLint 9.31**: コード品質チェック
- **Bootstrap 5.3**: UI フレームワーク
- **EJS**: テンプレートエンジン（Viteプラグイン統合）

### TypeScript設定

- `moduleResolution: "bundler"` - Viteとの互換性
- `ES Next` ターゲット、ESM出力
- import文では拡張子なし（.jsではなく相対パス）
- 厳密型チェック有効、未使用変数エラー有効
- パスエイリアス: `@/`, `@/game/`, `@/ui/`, `@/data/`

## 開発方針（最重要）

### ModalUtils の使用方針

ブラウザ標準のダイアログ（`alert()`, `confirm()`, `prompt()`）は使用せず、必ずModalUtilsクラスのメソッドを使用すること。

- **`alert()` の代替**: `ModalUtils.showAlert(message, title?)` を使用
- **`confirm()` の代替**: `ModalUtils.showConfirm(message, title?)` を使用  
- **`prompt()` の代替**: `ModalUtils.showPrompt(message, defaultValue?, title?, inputType?)` を使用
- **通知表示**: `ModalUtils.showToast(message, title?, type?)` を使用

**理由**:
- Bootstrap 5のモーダルシステムとの統一感
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
ModalUtils.showToast('データを更新しました', 'データベース', 'success');
```

### git コミット方針

Claude Codeは以下の方針に従ってgitコミットを行うこと

- 実行許可プロンプトが出るのを避けるため、以下を守ること
  - 全体で 200 文字以内に収めること
  - 複数のコマンドを結合しないこと (NG: `git add . && git commit ...`)
- Claude Code の編集であることが分かるように、コミット文の最後に `Co-Authored-By: Claude <noreply@anthropic.com>` を追記すること
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

### コード品質管理

- **型チェック**: `npm run typecheck` で TypeScript 型エラーを確認
- **テスト**: `npm run test` で Vitest 単体テスト実行
- **リント**: `npm run lint` で ESLint によるコード品質チェック
- **ビルド**: `npm run build` でプロダクション用ビルド実行
- Claude Code による編集後は必ずこれらのコマンドを実行してエラーがないことを確認すること

### PR 作成時の注意点

- PRタイトルと内容は日本語で記述すること
- テンプレートは [.github/PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md) を使用

### プロンプト履歴、アイデア草案の保存先

- プロンプト履歴やアイデア草案を保存する場合、 `docs/drafts/` ディレクトリに .md 形式で保存すること

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

### ドキュメントシステム（src/game/data/documents/）

ゲーム内で表示されるストーリー文書やフレーバーテキストを管理するシステム。

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
- **type**: ドキュメント分類（`diary`=日記、`reflection`=振り返り、`guide`=攻略、`lore`=世界観）
- **requiredExplorerLevel**: 表示に必要なエクスプローラーレベル
- **requiredBossDefeats**: 表示に必要なボス撃破条件（配列）
- **requiredBossLosses**: 表示に必要なボス敗北条件（配列）

#### 実装されているドキュメント

- **welcome-document.md**: エルナルの冒険日記第1章（初期ボス紹介）
- **defeat-reflection.md**: 敗北から学ぶこと（初敗北時の気持ち）

#### 新ドキュメント追加手順

1. `src/game/data/documents/{id}.md` にマークダウンファイル作成
2. フロントマターで表示条件を設定
3. DocumentLoader.ts が自動的に読み込み・解析
4. 条件を満たしたプレイヤーにゲーム内で表示

#### 文体・スタイルガイド

- 主人公エルナル（うなぎ）の一人称視点で記述
- 親しみやすい関西弁風の口調
- 絵文字を効果的に使用してキャラクター性を演出
- ボス戦の体験や感情を具体的に描写
- プレイヤーの成長過程と同調する内容を心がける

## プロジェクト固有の重要な注意事項

- **EJSテンプレート**: HTMLの各種パーツを src/templates/ ディレクトリのEJSファイルに記載
- **ボス追加**: 新ボス追加時は必ず registeredBossIds 配列と loadBossData 関数の両方を更新
- **状態異常**: 新しい状態異常追加時は StatusEffectTypes.ts の enum とCSSクラスの両方を追加
- **ドキュメント**: 新ストーリードキュメント追加時は src/game/data/documents/ にマークダウン形式で作成し、フロントマターで表示条件を設定
- **コミット**: 必ず gitmoji + 日本語メッセージ + Co-Authored-By を含める
- **品質チェック**: 編集後は npm run typecheck && npm run test && npm run build を実行して確認
- **スキルシステム**: CraftWork、Explorerスキルは data/skills/ に実装要（未完了）
