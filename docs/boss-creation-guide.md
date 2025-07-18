# ボス追加ガイド

このドキュメントは、Eel Feed に新しいボスを追加するための包括的なガイドです。

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
    getDialogue?: (situation: 'battle-start' | 'player-restrained' | 'player-eaten' | 'player-escapes' | 'low-hp' | 'victory') => string;  // 状況別台詞
    finishingMove?: () => string[]; // フィニッシュムーブ
    icon?: string;                  // アイコン（絵文字）
    guestCharacterInfo?: {          // ゲストキャラクター情報（オプション）
        creator: string;
        source?: string;
    };
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
- `PostDefeatedAttack` - プレイヤー敗北後の攻撃
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
    onUse?: (boss: Boss, player: Player) => string[];  // カスタム行動コールバック
    hitRate?: number;               // 命中率（デフォルト: 0.95）
    criticalRate?: number;          // クリティカル率（デフォルト: 0.05）
    statusChance?: number;          // 状態異常付与確率（デフォルト: 1.0、範囲: 0.0-1.0）
    playerStateCondition?: 'normal' | 'ko' | 'restrained' | 'cocoon' | 'eaten' | 'defeated';  // プレイヤー状態条件
    healRatio?: number;             // HP吸収率（0.0-1.0）
    damageVarianceMin?: number;     // ダメージ分散最小値
    damageVarianceMax?: number;     // ダメージ分散最大値
    maxHpDamage?: number;           // 最大HP吸収量（DevourAttack用）
}
```

## フレーバー設定の注意点

### 表現ガイドライン

**以下の表現はNGとします**

- エルナルに対する直接的で致命的な表現
  - 死亡させる、完全に消化してしまう等
- 過度に暴力的な描写
  - 体をバラバラにする、四肢を切断する等

**以下の要素をボスに追加しよう**

- 捕食・丸呑み表現（既存ボスを参考）
- 状態異常による一時的な影響
- ユーモアや軽い雰囲気を保つ表現
- プレイヤーが楽しめる範囲での表現

### メッセージとダイアログの配慮

- プレイヤーが不快に感じない範囲での表現を心がける
- ゲーム世界観に適した表現を使用
- 既存ボスの台詞スタイルを参考にする

## Bossクラスの重要なプロパティ

新しいボスを作成する際に知っておくべきBossクラスのプロパティ：

```typescript
export class Boss extends Actor {
    public hasUsedSpecialMove: boolean = false;  // 特殊技使用フラグ
    public specialMoveCooldown: number = 0;      // 特殊技クールダウン
    // ... その他のプロパティ
}
```

### 特殊技管理

- `hasUsedSpecialMove`: 特殊技を使用済みかどうかのフラグ
- `specialMoveCooldown`: 特殊技使用後のクールダウンターン数

これらのプロパティは、強力な特殊技を一度だけ使用可能にしたい場合や、使用後に一定ターン使用不可にしたい場合に使用します。

## 実装手順

### 1. 新ボスファイルの作成

`src/game/data/bosses/new-boss.ts` を作成：

```typescript
import { BossData, ActionType, BossAction } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffectTypes';

const newBossActions: BossAction[] = [
    {
        type: ActionType.Attack,
        name: '基本攻撃',
        description: '基本的な攻撃',
        damage: 15,
        weight: 40,
        playerStateCondition: 'normal'
    },
    {
        type: ActionType.DevourAttack,
        name: '体内吸収',
        description: '体内で獲物の生命力を吸収する',
        messages: [
            '「グルルル...」',
            '<USER>が<TARGET>の生命力を吸収している...',
            '<TARGET>の最大HPが減少していく...'
        ],
        damage: 25,
        maxHpDamage: 5,  // 最大HP吸収量
        weight: 30,
        playerStateCondition: 'eaten'
    },
    {
        type: ActionType.Attack,
        name: '特殊攻撃',
        description: '特殊な効果を持つ攻撃',
        damage: 20,
        weight: 20,
        playerStateCondition: 'normal',
        onUse: (boss, player) => {
            // カスタム効果の実装例
            if (Math.random() < 0.3) {
                player.statusEffects.removeEffect(StatusEffectType.Eaten);
                return ['<TARGET>は攻撃の衝撃で<USER>の体外に吹き飛ばされた！'];
            }
            return [];
        }
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
    icon: '🔥',
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

// フィニッシュムーブの実装例
newBossData.finishingMove = function() {
    return [
        '「グルルル...」',
        '<USER>は<TARGET>を完全に制圧した...',
        '<TARGET>は<USER>の支配下に置かれることになった...'
    ];
};

// getDialogue メソッドの実装例
newBossData.getDialogue = function(situation: 'battle-start' | 'player-restrained' | 'player-eaten' | 'player-escapes' | 'low-hp' | 'victory') {
    const dialogues: Record<string, string[]> = {
        'battle-start': [
            '新しい挑戦者か...',
            '面白そうだ',
            '相手になってやろう'
        ],
        'player-restrained': [
            '逃げられないぞ',
            '観念しろ',
            'これで終わりだ'
        ],
        'player-eaten': [
            '美味しそうだ',
            'ゆっくり味わおう',
            '栄養になれ'
        ],
        'player-escapes': [
            'チッ、逃げたか',
            'なかなかやるな',
            '次はそうはいかん'
        ],
        'low-hp': [
            'まだ終わっていない！',
            'この程度では！',
            '本気を出すとしよう'
        ],
        'victory': [
            '勝負あったな',
            '満足だ'
        ]
    };
    
    const options = dialogues[situation] || dialogues['battle-start'];
    return options[Math.floor(Math.random() * options.length)];
};
```

### 2. インデックスファイルの更新

`src/game/data/index.ts` を更新：

```typescript
import { BossData } from '../entities/Boss';
import { swampDragonData } from './bosses/swamp-dragon';
import { darkGhostData } from './bosses/dark-ghost';
import { mechSpiderData } from './bosses/mech-spider';
import { dreamDemonData } from './bosses/dream-demon';
import { scorpionCarrierData } from './bosses/scorpion-carrier';
import { mikanDragonData } from './bosses/mikan-dragon';
import { seaKrakenData } from './bosses/sea-kraken';
import { aquaSerpentData } from './bosses/aqua-serpent';
import { cleanMasterData } from './bosses/clean-master';
import { newBossData } from './bosses/new-boss';  // 追加

export const bosses: Map<string, BossData> = new Map([
    ['swamp-dragon', swampDragonData],
    ['dark-ghost', darkGhostData],
    ['mech-spider', mechSpiderData],
    ['dream-demon', dreamDemonData],
    ['scorpion-carrier', scorpionCarrierData],
    ['mikan-dragon', mikanDragonData],
    ['sea-kraken', seaKrakenData],
    ['aqua-serpent', aquaSerpentData],
    ['clean-master', cleanMasterData],
    ['new-boss', newBossData]  // 追加
]);

export function getBossData(id: string): BossData | undefined {
    return bosses.get(id);
}

export function getAllBossData(): BossData[] {
    return Array.from(bosses.values());
}

export { 
    swampDragonData, 
    darkGhostData, 
    mechSpiderData, 
    dreamDemonData, 
    scorpionCarrierData, 
    mikanDragonData, 
    seaKrakenData, 
    aquaSerpentData, 
    cleanMasterData,
    newBossData  // 追加
};
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
`src/game/systems/StatusEffectTypes.ts` の `StatusEffectType` enumに追加

#### 利用可能な状態異常一覧

**基本状態異常**
- `Fire` - 火だるま（毎ターンダメージ）
- `Poison` - 毒（毎ターンダメージ）
- `Charm` - 魅了（行動阻害）
- `Slow` - 鈍足（命中率低下）
- `Stunned` - 気絶（行動不能）
- `Paralysis` - 麻痺（行動阻害）
- `Sleep` - 眠り（行動不能）
- `Confusion` - 混乱（行動阻害）
- `Weakness` - 衰弱（攻撃力低下）

**新しい状態異常**
- `VisionImpairment` - 視界阻害（海のクラーケン）
- `WaterSoaked` - 水濡れ（アクアサーペント）
- `Dizzy` - 目眩（アクアサーペント）
- `Soapy` - 泡まみれ（クリーンマスター）
- `Spinning` - 回転（クリーンマスター）
- `Steamy` - 湯気まみれ（クリーンマスター）
- `Lethargy` - 倦怠感（みかんドラゴン）
- `ScorpionPoison` - サソリ毒（スコーピオンキャリア）
- `Anesthesia` - 麻酔（スコーピオンキャリア）
- `Weakening` - 弱体化（スコーピオンキャリア）

**特殊系状態異常**
- `AphrodisiacPoison` - 媚薬毒（ドリームデーモン）
- `Drowsiness` - 眠気（ドリームデーモン）
- `Infatuation` - 恋慕（ドリームデーモン）
- `Arousal` - 興奮（ドリームデーモン）
- `Seduction` - 誘惑（ドリームデーモン）
- `MagicSeal` - 魔法封印（ドリームデーモン）
- `PleasureFall` - 快楽堕ち（ドリームデーモン）
- `Lewdness` - 淫乱（ドリームデーモン）
- `Hypnosis` - 催眠（ドリームデーモン）
- `Brainwash` - 洗脳（ドリームデーモン）
- `Sweet` - 甘い（ドリームデーモン）
- `DreamControl` - 夢操作（ドリームデーモン）
- `Melting` - 蕩け（ドリームデーモン）
- `Euphoria` - 多幸感（ドリームデーモン）
- `Fascination` - 魅惑（ドリームデーモン）
- `Bliss` - 至福（ドリームデーモン）
- `Enchantment` - 魔魅（ドリームデーモン）

#### CSS クラスの追加
`src/styles/main.css` に `.status-{type}` クラスを追加

## AIストラテジーのパターン例

### 基本パターン

```typescript
aiStrategy: (boss, player, turn) => {
    // 特殊技管理の例
    const specialMove = actions.find(action => action.name === '特殊技名');
    if (specialMove && boss.getHpPercentage() <= 30 && !boss.hasUsedSpecialMove) {
        boss.hasUsedSpecialMove = true;
        boss.specialMoveCooldown = 15;  // 15ターンクールダウン
        return specialMove;
    }

    // クールダウン管理
    if (boss.specialMoveCooldown && boss.specialMoveCooldown > 0) {
        boss.specialMoveCooldown--;
        if (boss.specialMoveCooldown <= 0) {
            boss.hasUsedSpecialMove = false;
        }
    }

    // プレイヤー敗北後の行動
    if (player.isDefeated()) {
        const postDefeatedActions: BossAction[] = [
            {
                type: ActionType.PostDefeatedAttack,
                name: '敗北後の行動',
                description: '敗北したプレイヤーに対する行動',
                messages: ['敗北後のメッセージ...'],
                weight: 1
            }
        ];
        return postDefeatedActions[Math.floor(Math.random() * postDefeatedActions.length)];
    }
    
    // プレイヤーが食べられた状態
    if (player.isEaten()) {
        const eatenActions = actions.filter(action => 
            action.playerStateCondition === 'eaten'
        );
        // 重み付きランダム選択
        const totalWeight = eatenActions.reduce((sum, action) => sum + action.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const action of eatenActions) {
            random -= action.weight;
            if (random <= 0) {
                return action;
            }
        }
        return eatenActions[0];
    }
    
    // プレイヤーが戦闘不能
    if (player.isKnockedOut()) {
        if (player.isRestrained()) {
            // 拘束+戦闘不能時：高確率で食べる
            if (Math.random() < 0.85) {
                return {
                    type: ActionType.EatAttack,
                    name: '丸呑み',
                    description: '拘束した獲物を丸呑みする',
                    messages: ['丸呑みのメッセージ...'],
                    weight: 1
                };
            }
        } else {
            // 戦闘不能時：拘束or食べる
            const random = Math.random();
            if (random < 0.7) {
                return {
                    type: ActionType.RestraintAttack,
                    name: '拘束',
                    description: '獲物を拘束する',
                    messages: ['拘束のメッセージ...'],
                    weight: 1
                };
            } else if (random < 0.9) {
                return {
                    type: ActionType.EatAttack,
                    name: '丸呑み',
                    description: '獲物を丸呑みする',
                    messages: ['丸呑みのメッセージ...'],
                    weight: 1
                };
            }
        }
    }
    
    // 通常の重み付きランダム選択
    const currentPlayerState = boss.getPlayerState(player);
    const availableActions = actions.filter(action => {
        // プレイヤー状態条件チェック
        if (action.playerStateCondition) {
            if (action.playerStateCondition !== currentPlayerState) {
                return false;
            }
        }
        
        // 使用条件チェック
        if (action.canUse) {
            return action.canUse(boss, player, turn);
        }
        return true;
    });
    
    const totalWeight = availableActions.reduce((sum, action) => sum + action.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const action of availableActions) {
        random -= action.weight;
        if (random <= 0) {
            return action;
        }
    }
    
    return availableActions[0];
}
```

## バランス調整指針

### HP・攻撃力の推奨値

現在のボス設定を基にした推奨値：

- **初級ボス**: HP 150-200, 攻撃力 12-15
- **中級ボス**: HP 250-350, 攻撃力 15-20
- **上級ボス**: HP 350-450, 攻撃力 18-22

### 既存ボスとの比較

**現在実装済みのボス**
- 沼のドラゴン: HP 400, 攻撃力 18 (高火力タイプ)
- 闇のおばけ: HP 150, 攻撃力 12 (状態異常タイプ)
- 機械のクモ: HP 180, 攻撃力 15 (拘束タイプ)
- 🦑 海のクラーケン: HP 350, 攻撃力 15 (拘束+吸収タイプ)
- 🐍 アクアサーペント: HP 350, 攻撃力 20 (水属性+体内攻撃タイプ)
- 🧹 クリーンマスター: HP 280, 攻撃力 16 (清掃+状態異常タイプ)
- 🍊 みかんドラゴン: HP 320, 攻撃力 17 (果物+睡眠タイプ)
- 🦂 スコーピオンキャリア: HP 260, 攻撃力 14 (毒+麻痺タイプ)
- 😈 ドリームデーモン: HP 240, 攻撃力 13 (夢+特殊状態異常タイプ)

**バランス設計指針**
- HP 150-200: 状態異常特化型（短期決戦型）
- HP 250-350: バランス型（中期戦闘型）
- HP 350-450: 高耐久型（長期戦闘型）
- 攻撃力は特殊能力の強さに反比例させる

## テスト項目

- [ ] ボス選択画面での表示確認
- [ ] 戦闘開始・終了の動作確認
- [ ] 各アクションの動作確認
- [ ] AIの行動パターン確認
- [ ] 状態異常の動作確認
- [ ] バランスの調整確認

## 参考ファイル

実装の参考として以下のファイルを確認してください：

### 古い実装（参考用）
- `src/game/data/bosses/swamp-dragon.ts` - 複雑なAI戦略の例
- `src/game/data/bosses/dark-ghost.ts` - 状態異常特化の例
- `src/game/data/bosses/mech-spider.ts` - 拘束特化の例

### 新しい実装（推奨）
- `src/game/data/bosses/sea-kraken.ts` - 現代的なAI戦略、PostDefeatedAttack、finishingMove、getDialogue の例
- `src/game/data/bosses/aqua-serpent.ts` - 特殊技管理、maxHpDamage、onUse コールバックの例
- `src/game/data/bosses/clean-master.ts` - 新しい状態異常システムの例
- `src/game/data/bosses/dream-demon.ts` - 多様な状態異常と複雑な行動パターンの例

### システムファイル
- `src/game/entities/Boss.ts` - ボスクラスの実装
- `src/game/systems/StatusEffectTypes.ts` - 状態異常システム
- `src/game/data/index.ts` - データエクスポートパターン

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
- `statusChance` の設定確認（0.0-1.0の範囲で設定）