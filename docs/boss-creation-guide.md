# ボス追加ガイド

このドキュメントは、Eel Feed RPGゲームに新しいボスを追加するための包括的なガイドです。

## 概要

新しいボスを追加するには、以下のステップが必要です：

1. ボスデータファイルの作成
2. インデックスファイルの更新
3. HTMLファイルの更新（ボス選択画面）
4. 必要に応じて新しい状態異常の追加

## 必要なファイル

- `src/game/data/bosses/{boss-id}.ts` - 新ボスのデータファイル
- `src/game/data/index.ts` - ボスインデックス（更新）
- `src/index.html` - ボス選択画面（更新）
- `src/styles/main.css` - 新しい状態異常がある場合（更新）

## ボスデータ構造

### BossDataインターフェース

```typescript
interface BossData {
    id: string;                     // ユニークなボスID
    name: string;                   // 内部名称
    displayName: string;            // 表示名（絵文字含む）
    description: string;            // 短い説明
    questNote: string;              // クエストノート（詳細説明）
    maxHp: number;                  // 最大HP
    attackPower: number;            // 攻撃力
    actions: BossAction[];          // 行動リスト
    personality?: string[];         // 個性台詞（オプション）
    aiStrategy?: (boss: Boss, player: Player, turn: number) => BossAction;  // AI戦略
    getDialogue?: (situation: string) => string;  // 状況別台詞
    finishingMove?: () => string[]; // フィニッシュムーブ
}
```

### BossActionの種類

#### ActionType列挙型

- `Attack` - 通常攻撃
- `StatusAttack` - 状態異常攻撃
- `RestraintAttack` - 拘束攻撃
- `CocoonAttack` - 繭攻撃
- `CocoonAction` - 繭状態中の行動
- `EatAttack` - 食べる攻撃
- `DevourAttack` - 食べられた状態での攻撃
- `Skip` - 行動スキップ

#### BossActionプロパティ

```typescript
interface BossAction {
    type: ActionType;               // 行動タイプ
    name: string;                   // 行動名
    description: string;            // 行動説明
    messages?: string[];            // メッセージ（<USER>, <TARGET>, <ACTION>を使用）
    damage?: number;                // ダメージ量
    statusEffect?: StatusEffectType; // 状態異常タイプ
    statusDuration?: number;        // 状態異常持続ターン
    weight: number;                 // AI選択重み
    canUse?: (boss: Boss, player: Player, turn: number) => boolean;  // 使用条件
    hitRate?: number;               // 命中率（デフォルト: 0.95）
    criticalRate?: number;          // クリティカル率（デフォルト: 0.05）
    statusChance?: number;          // 状態異常付与確率（デフォルト: 1.0）
    playerStateCondition?: string;  // プレイヤー状態条件
    healRatio?: number;             // HP吸収率（0.0-1.0）
    damageVarianceMin?: number;     // ダメージ分散最小値
    damageVarianceMax?: number;     // ダメージ分散最大値
}
```

## フレーバー設定の注意点

### 表現ガイドライン

**避けるべき表現：**
- エルナルに対する直接的で致命的な表現
- バラバラにする、切断する等の描写
- 即死や永続的な害を与える表現
- 過度に暴力的な描写

**推奨される表現：**
- 捕食・丸呑み表現（既存ボスを参考）
- 状態異常による一時的な影響
- ユーモアや軽い雰囲気を保つ表現
- プレイヤーが楽しめる範囲での表現

### メッセージとダイアログの配慮

- プレイヤーが不快に感じない範囲での表現を心がける
- ゲーム世界観に適した表現を使用
- 既存ボスの台詞スタイルを参考にする

## 実装手順

### 1. 新ボスファイルの作成

`src/game/data/bosses/new-boss.ts` を作成：

```typescript
import { BossData, ActionType, BossAction } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffect';

const newBossActions: BossAction[] = [
    {
        type: ActionType.Attack,
        name: '基本攻撃',
        description: '基本的な攻撃',
        damage: 15,
        weight: 40,
        playerStateCondition: 'normal'
    },
    // その他の行動...
];

export const newBossData: BossData = {
    id: 'new-boss',
    name: 'NewBoss',
    displayName: '🔥 新しいボス',
    description: 'ボスの説明',
    questNote: 'クエストの詳細説明...',
    maxHp: 300,
    attackPower: 15,
    actions: newBossActions,
    personality: [
        '台詞1',
        '台詞2',
        // ...
    ],
    aiStrategy: (boss, player, turn) => {
        // AI戦略の実装
        // ...
        return selectedAction;
    }
};
```

### 2. インデックスファイルの更新

`src/game/data/index.ts` を更新：

```typescript
import { newBossData } from './bosses/new-boss';

export const bosses: Map<string, BossData> = new Map([
    ['swamp-dragon', swampDragonData],
    ['dark-ghost', darkGhostData],
    ['mech-spider', mechSpiderData],
    ['new-boss', newBossData],  // 追加
]);

export { swampDragonData, darkGhostData, mechSpiderData, newBossData };  // 追加
```

### 3. HTMLファイルの更新

`src/index.html` のボス選択画面にカードを追加：

```html
<div class="col-md-4 mb-4">
    <div class="card bg-secondary h-100 boss-card" data-boss="new-boss">
        <div class="card-body text-center">
            <h3 class="card-title">🔥 新しいボス</h3>
            <p class="card-text">ボスの説明文</p>
            <button class="btn btn-danger w-100">選択</button>
        </div>
    </div>
</div>
```

### 4. 新しい状態異常の追加（必要な場合）

#### StatusEffectTypeに追加
`src/game/systems/StatusEffect.ts` の `StatusEffectType` enumに追加

#### CSS クラスの追加
`src/styles/main.css` に `.status-{type}` クラスを追加

## AIストラテジーのパターン例

### 基本パターン

```typescript
aiStrategy: (boss, player, turn) => {
    // プレイヤーが食べられた状態
    if (player.isEaten()) {
        // 食べられた状態での行動
        return devourActions[Math.floor(Math.random() * devourActions.length)];
    }
    
    // プレイヤーが戦闘不能
    if (player.isKnockedOut()) {
        if (player.isRestrained()) {
            // 拘束+戦闘不能時の行動
        } else {
            // 戦闘不能時の行動
        }
    }
    
    // 重み付きランダム選択
    const availableActions = actions.filter(action => {
        // 使用条件チェック
        return checkConditions(action, boss, player, turn);
    });
    
    return weightedRandomSelection(availableActions);
}
```

## バランス調整指針

### HP・攻撃力の推奨値

(現状は暫定！)

- **初級ボス**: HP 150-200, 攻撃力 12-15
- **中級ボス**: HP 250-350, 攻撃力 15-20
- **上級ボス**: HP 400-500, 攻撃力 20-25

### 既存ボスとの比較

- 沼のドラゴン: HP 400, 攻撃力 18 (高火力タイプ)
- 闇のおばけ: HP 150, 攻撃力 12 (状態異常タイプ)
- 機械のクモ: HP 180, 攻撃力 15 (拘束タイプ)

## テスト項目

- [ ] ボス選択画面での表示確認
- [ ] 戦闘開始・終了の動作確認
- [ ] 各アクションの動作確認
- [ ] AIの行動パターン確認
- [ ] 状態異常の動作確認
- [ ] バランスの調整確認

## 参考ファイル

実装の参考として以下のファイルを確認してください：

- `src/game/data/bosses/swamp-dragon.ts` - 複雑なAI戦略の例
- `src/game/data/bosses/dark-ghost.ts` - 状態異常特化の例
- `src/game/data/bosses/mech-spider.ts` - 拘束特化の例
- `src/game/entities/Boss.ts` - ボスクラスの実装
- `src/game/systems/StatusEffect.ts` - 状態異常システム

## よくある問題と対処法

### ボスが表示されない
- `src/game/data/index.ts` でのエクスポート確認
- HTML内の `data-boss` 属性がIDと一致しているか確認

### 行動が選択されない
- `canUse` 関数の条件確認
- `weight` が0以上に設定されているか確認
- `playerStateCondition` が正しく設定されているか確認

### 状態異常が効かない
- `StatusEffectType` の定義確認
- CSS クラスの追加確認
- `statusChance` の設定確認