# ボス追加ガイド

このドキュメントは、ElnalFTE に新しいボスを追加するための包括的なガイドです。

## 概要

**🚀 大幅簡素化！（2024年7月更新）**

新しいボスを追加するには、以下のステップが必要です：

1. **ボスデータファイルの作成**（メイン作業）
2. 必要に応じて新しい状態異常の追加

**Vite glob import**により、ボスファイルを作成するだけで自動的にゲームに反映されます。

## 必要なファイル

- `src/game/data/bosses/{boss-id}.ts` - 新ボスのデータファイル
- `src/game/status-effects/{boss-id}-effects.ts` - 新しい状態異常がある場合のみ
- `src/game/systems/StatusEffectTypes.ts` - 新しい状態異常がある場合のみ
- `src/styles/main.css` - 新しい状態異常がある場合のみ

## ボスデータ構造

### BossDataインターフェース

```typescript
interface BossData {
    id: string;                     // ユニークなボスID
    name: string;                   // [非推奨] 内部名称（displayNameを使用）
    displayName: string;            // 表示名
    icon: string;                   // ボスのアイコン（絵文字）
    description: string;            // 短い説明
    appearanceNote?: string;        // ボス外観説明文
    questNote: string;              // クエストノート（詳細説明）
    maxHp: number;                  // 最大HP
    attackPower: number;            // 攻撃力
    actions: BossAction[];          // 行動リスト
    personality?: string[];         // 個性台詞（オプション）
    aiStrategy?: (boss: Boss, player: Player, turn: number) => BossAction;  // AI戦略
    getDialogue?: (situation: 'battle-start' | 'player-restrained' | 'player-eaten' | 'player-escapes' | 'low-hp' | 'victory') => string;  // [非推奨] 状況別台詞（battleStartMessages等を使用）
    finishingMove?: () => string[]; // 自動とどめ攻撃のメッセージ
    suppressAutoFinishingMove?: boolean; // 自動とどめ攻撃を抑制し、AI戦略でカスタムとどめ攻撃を処理
    guestCharacterInfo?: BossGuestCharacterInfo; // ゲストキャラクター情報
    battleStartMessages?: MessageData[]; // 戦闘開始時のメッセージ進行
    victoryMessages?: MessageData[];     // プレイヤー勝利時のメッセージ進行
    customVariables?: Record<string, any>; // ボス固有のカスタム変数（AI戦略用）
    explorerLevelRequired?: number; // エクスプローラーアビリティ解禁レベル（未指定時は0）
    victoryTrophy?: TrophyData;     // 勝利時記念品（外側から採れるもの）
    defeatTrophy?: TrophyData;      // 敗北時記念品（内側から採れるもの）
}

interface BossGuestCharacterInfo {
    creator: string;                // 制作者名
    characterName?: string;         // 元となったキャラクター名
}

interface TrophyData {
    name: string;                   // 記念品名
    description: string;            // 記念品の説明
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
- `FinishingMove` - カスタムとどめ攻撃
- `Skip` - 行動スキップ

#### BossActionプロパティ

```typescript
interface BossAction {
    id: string;                     // アクション固有ID（必須）
    type: ActionType;               // 行動タイプ
    name: string;                   // 行動名
    description: string;            // 行動説明
    messages?: string[];            // メッセージ（{boss}, {player}を使用）
    damageFormula?: (user: Boss) => number; // ダメージ計算式（ボスのステータスに基づく）
    statusEffect?: StatusEffectType; // 状態異常タイプ
    statusDuration?: number;        // 状態異常持続ターン
    weight: number;                 // AI選択重み
    canUse?: (boss: Boss, player: Player, turn: number) => boolean;  // 使用条件
    onPreUse?: (action: BossAction, boss: Boss, player: Player, turn: number) => BossAction | null; // 使用前コールバック（行動修正用）
    onUse?: (boss: Boss, player: Player, turn: number) => string[];  // カスタム行動コールバック
    hitRate?: number;               // 命中率（デフォルト: 0.95）
    criticalRate?: number;          // クリティカル率（デフォルト: 0.05）
    statusChance?: number;          // 状態異常付与確率（デフォルト: 1.0、範囲: 0.0-1.0）
    playerStateCondition?: 'normal' | 'ko' | 'restrained' | 'cocoon' | 'eaten' | 'defeated';  // プレイヤー状態条件
    healRatio?: number;             // HP吸収率（0.0-1.0）
    damageVarianceMin?: number;     // ダメージ分散最小値（デフォルト: -20）
    damageVarianceMax?: number;     // ダメージ分散最大値（デフォルト: +20）
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
    /**
     * ボス固有のカスタム変数
     * AI戦略での状態管理、クールダウン管理、行動制御などに使用
     * ボスデータの初期値をコピーして初期化される
     */
    public customVariables: Record<string, any> = {};
    
    getCustomVariable<T = any>(key: string): T | undefined;
    setCustomVariable<T = any>(key: string, value: T): void;
    // ... その他のメソッド
}
```

### customVariablesでの特殊技管理

ボス固有の変数を管理するにはcustomVariablesシステムを使用します：

```typescript
// ボスデータで初期値を定義
customVariables: {
    hasUsedSpecialMove: false,   // 特殊技使用フラグ
    specialMoveCooldown: 0       // クールダウンターン数
},

// AI戦略で使用
if (!boss.getCustomVariable<boolean>('hasUsedSpecialMove')) {
    boss.setCustomVariable('hasUsedSpecialMove', true);
    boss.setCustomVariable('specialMoveCooldown', 20);
}
```

このシステムで、強力な特殊技を一度だけ使用可能にしたり、使用後に一定ターン使用不可にしたりできます。

### メッセージシステム

新しいメッセージシステムでは、戦闘開始時や勝利時に段階的なメッセージ進行を設定できます：

```typescript
interface MessageData {
    speaker?: 'player' | 'boss' | 'system';  // 話者（省略時は'system'）
    style?: 'default' | 'talk';              // ダイアログスタイル（'default'または'talk'）
    text: string;                            // 表示テキスト
}

// 使用例
battleStartMessages: [
    {
        text: 'あなたは竜との戦いに挑む...',
        speaker: 'player',
        style: 'default'
    },
    {
        text: '「ようこそ、我が領域へ...」',
        speaker: 'boss',
        style: 'talk'
    },
    {
        text: '「この空間では、私が絶対的な支配者だ」',
        speaker: 'boss',
        style: 'talk'
    }
],

victoryMessages: [
    {
        text: '「グルルル...まだ、終わっていない...」',
        speaker: 'boss',
        style: 'talk'
    },
    {
        text: 'エルナルは勝利したが、ボスはまだ何かを企んでいるようだ...',
        speaker: 'player',
        style: 'default'
    }
]
```

**注意**: 新しいメッセージシステムは`getDialogue`メソッドに優先して使用されます。

## 実装手順

### 1. 新ボスファイルの作成

`src/game/data/bosses/new-boss.ts` を作成：

```typescript
import { Player } from '@/game/entities/Player';
import { BossData, ActionType, BossAction, Boss } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffectTypes';

const newBossActions: BossAction[] = [
    {
        id: 'basic-attack',
        type: ActionType.Attack,
        name: '基本攻撃',
        description: '基本的な攻撃',
        damageFormula: (user: Boss) => user.attackPower,
        weight: 40,
        playerStateCondition: 'normal'
    },
    {
        id: 'devour-attack',
        type: ActionType.DevourAttack,
        name: '体内吸収',
        description: '体内で獲物の生命力を吸収する',
        messages: [
            '「グルルル...」',
            '{boss}が{player}の生命力を吸収している...',
            '{player}の最大HPが減少していく...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 2.0,
        weight: 30,
        playerStateCondition: 'eaten'
    },
    {
        id: 'special-attack',
        type: ActionType.Attack,
        name: '特殊攻撃',
        description: '特殊な効果を持つ攻撃',
        damageFormula: (user: Boss) => user.attackPower * 1.6,
        weight: 20,
        playerStateCondition: 'normal',
        onUse: (boss, player) => {
            // カスタム効果の実装例
            if (Math.random() < 0.3) {
                player.statusEffects.removeEffect(StatusEffectType.Eaten);
                return ['{player}は攻撃の衝撃で{boss}の体外に吹き飛ばされた！'];
            }
            return [];
        }
    },
    // その他の行動...
];

export const newBossData: BossData = {
    id: 'new-boss',
    name: 'NewBoss',
    displayName: '新しいボス',
    description: 'ボスの説明',
    questNote: 'クエストの詳細説明...',
    maxHp: 300,
    attackPower: 15,
    actions: newBossActions,
    icon: '🔥',
    explorerLevelRequired: 1, // エクスプローラーアビリティ解禁レベル（必要に応じて設定）
    // 勝利時記念品（ボスの外側から採れるもの）
    victoryTrophy: {
        name: 'ボスの外皮',
        description: '新しいボスの強靭な外皮。戦いの証として威厳を放っている。'
    },
    // 敗北時記念品（ボスの体内から採れるもの）
    defeatTrophy: {
        name: 'ボスの体液',
        description: '新しいボスの体内から採取した特殊な体液。神秘的な力が宿っている。'
    },
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
// suppressAutoFinishingMoveがtrueの場合は使用しません (AI戦略で処理してください)
newBossData.finishingMove = function() {
    return [
        '「グルルル...」',
        '{boss}は{player}を完全に制圧した...',
        '{player}は{boss}の支配下に置かれることになった...'
    ];
};
```

### 2. テストの実行

ボスを追加した後、必ず以下のテストを実行してください：

```bash
npm run typecheck  # TypeScript型チェック
npm run test       # Vitest単体テスト
npm run build      # ビルドテスト
```

### 3. 新しい状態異常の追加（必要な場合）

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
- `Darkness` - 暗闇（命中率大幅低下）
- `Doomed` - 再起不能（最大HP0、とどめ攻撃対象）

**ボス固有状態異常**
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
- `Fear` - 恐怖（闇のおばけ）
- `Oblivion` - 忘却（闇のおばけ）
- `Petrified` - 石化（地底のワーム）
- `Darkness` - 暗闇（蝙蝠のヴァンパイア）
- `Sleepy` - 眠気（ふわふわドラゴン）
- `Blessed` - 祝福（セラフマスコット）
- `HolySlimed` - 聖なるスライム（セラフマスコット）
- `Overwhelmed` - 圧倒（セラフマスコット）
- `SalvationState` - 救済状態（セラフマスコット）
- `FalseSecurity` - 偽の安心（双面の道化師）
- `Manic` - 躁状態（双面の道化師）
- `Bipolar` - 双極性（双面の道化師）
- `Plushified` - ぬいぐるみ化（双面の道化師）
- `DemonStomach` - 魔界の胃袋（魔界の竜）

#### CSS クラスの追加
`src/styles/main.css` に `.status-{type}` クラスを追加

## AIストラテジーのパターン例

### 基本パターン

```typescript
aiStrategy: (boss, player, turn) => {
    // customVariablesでの特殊技管理の例
    const specialMove = actions.find(action => action.name === '特殊技名');
    if (specialMove && boss.getHpPercentage() <= 30 && !boss.getCustomVariable<boolean>('hasUsedSpecialMove')) {
        boss.setCustomVariable('hasUsedSpecialMove', true);
        boss.setCustomVariable('specialMoveCooldown', 15);  // 15ターンクールダウン
        return specialMove;
    }

    // customVariablesでのクールダウン管理
    const cooldown = boss.getCustomVariable<number>('specialMoveCooldown');
    if (cooldown && cooldown > 0) {
        boss.setCustomVariable('specialMoveCooldown', cooldown - 1);
        if (cooldown - 1 <= 0) {
            boss.setCustomVariable('hasUsedSpecialMove', false);
        }
    }

    // プレイヤー敗北後の行動 (永続的な体内保管描写)
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
            // 拘束+戦闘不能時：確実に食べる
            return {
                type: ActionType.EatAttack,
                name: '丸呑み',
                description: '拘束した獲物を丸呑みする',
                messages: ['丸呑みのメッセージ...'],
                weight: 1
            };
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

### `suppressAutoFinishingMove: true` 時のカスタムとどめ攻撃

自動とどめ攻撃を抑制する場合は、AI戦略内で `player.isEaten()` かつ `player.isDoomed()` を検知し、`ActionType.FinishingMove` のアクションを返します。`FinishingMove` は `onUse` で状態異常を変更するのが定石です。

```typescript
const customFinishMove: BossAction = {
    id: 'custom-finish',
    type: ActionType.FinishingMove,
    name: 'カスタムとどめ',
    description: '体内で力尽きた{player}を最終状態へ移行させる',
    messages: [
        '{player}は完全に体内へ取り込まれてしまった...'
    ],
    weight: 1,
    onUse: (_boss: Boss, player: Player) => {
        player.statusEffects.removeEffect(StatusEffectType.Doomed);
        player.statusEffects.addEffect(StatusEffectType.Dead);
        // 必要に応じて永続効果を付与する
        // player.statusEffects.addEffect(StatusEffectType.YourCustomEffect, -1);
        return [];
    }
};

const aiStrategy = (boss: Boss, player: Player, turn: number): BossAction => {
    if (player.isEaten() && player.isDoomed()) {
        return customFinishMove;
    }
    // ... 通常行動の分岐
};

export const bossData: BossData = {
    // ...
    suppressAutoFinishingMove: true,
    aiStrategy,
    // ...
};
```

### 敗北状態時に8ターン毎の特殊行動

`player.isDefeated()` の分岐内で `postDefeatedTurn` をカスタム変数でカウントし、8ターン毎に特別行動を返します。`customVariables` に初期値を用意してください。

```typescript
const specialPostDefeatAction: BossAction = {
    id: 'special-post-defeat',
    type: ActionType.PostDefeatedAttack,
    name: '特別な敗北後行動',
    description: '8ターンごとに実行する特別行動',
    messages: ['体内で特別なイベントが発生した...'],
    weight: 1,
    playerStateCondition: 'defeated'
};

const aiStrategy = (boss: Boss, player: Player, turn: number): BossAction => {
    if (player.isDefeated()) {
        let postDefeatedTurn = boss.getCustomVariable<number>('postDefeatedTurn', 0);
        postDefeatedTurn += 1;
        boss.setCustomVariable('postDefeatedTurn', postDefeatedTurn);

        if (postDefeatedTurn % 8 === 0) {
            return specialPostDefeatAction;
        }

        // ... 通常の敗北後行動を返す
    }
    // ... 通常行動の分岐
};

export const bossData: BossData = {
    // ...
    aiStrategy,
    customVariables: {
        postDefeatedTurn: 0
    }
};
```

## バランス調整指針

### HP・攻撃力の推奨値

現在のボス設定を基にした推奨値：

- **初級ボス**: HP 250-450, 攻撃力 12-18
- **中級ボス**: HP 580-800, 攻撃力 13-20
- **上級ボス**: HP 970-2600, 攻撃力 12-20

### 既存ボスとの比較

**現在実装済みのボス16体**

#### 基本エリア (explorerLevelRequired: 0)
- 沼のドラゴン: HP 400, 攻撃力 18 (高火力タイプ)
- 闇のおばけ: HP 250, 攻撃力 12 (状態異常タイプ)
- 機械のクモ: HP 300, 攻撃力 15 (拘束タイプ)

#### 砂漠エリア (explorerLevelRequired: 1)
- 運び屋のサソリ: HP 580, 攻撃力 14 (毒+麻痺タイプ)

#### 海エリア (explorerLevelRequired: 2)
- 海のクラーケン: HP 640, 攻撃力 15 (拘束+吸収タイプ)
- アクアサーペント: HP 750, 攻撃力 20 (水属性+体内攻撃タイプ)

#### ゲストキャラエリア (explorerLevelRequired: 3)
- 夢の淫魔: HP 320, 攻撃力 13 (夢+特殊状態異常タイプ)

#### ジャングルエリア (explorerLevelRequired: 4)
- 蜜柑ドラゴン: HP 450, 攻撃力 17 (果物+睡眠タイプ)

#### 地下世界エリア (explorerLevelRequired: 5)
- 地底のワーム: HP 800, 攻撃力 12 (地下型拘束タイプ)

#### 遺跡エリア (explorerLevelRequired: 6)
- クリーンマスター: HP 720, 攻撃力 16 (清掃+状態異常タイプ)
- 蝙蝠のヴァンパイア: HP 640, 攻撃力 14 (拘束+魅了+生気吸収タイプ)

#### 氷河エリア (explorerLevelRequired: 7)
- ふわふわドラゴン: HP 600, 攻撃力 12 (ふわふわ+睡眠タイプ)

#### 工業エリア (explorerLevelRequired: 8)
- サーマル・アーカイバー: HP 580, 攻撃力 14 (自動保管システム)

#### 天使エリア (explorerLevelRequired: 9)
- セラフィムマスコット: HP 1200, 攻撃力 16 (巨大天使マスコット)
- 双面の道化師: HP 970, 攻撃力 15 (二面性道化師)

#### 魔界エリア (explorerLevelRequired: 10)
- 魔界の竜: HP 2600, 攻撃力 20 (最高難易度ボス)

**バランス設計指針**
- HP 250-450: 初級〜中級ボス（基本システム習得用）
- HP 580-800: 上級ボス（各種状態異常・特殊システム）
- HP 970-2600: 最高級ボス（高難易度・複合システム）
- 攻撃力は特殊能力の強さに反比例させる

## エクスプローラーアビリティとボス解禁システム

### 概要

エクスプローラーアビリティは、プレイヤーの探検範囲を拡大し、新しいボスとの戦闘をアンロックするシステムです。各ボスに `explorerLevelRequired` を設定することで、段階的なコンテンツ解禁が可能です。

### 解禁レベル設定ガイドライン

```typescript
// 基本ボス（常に利用可能）
explorerLevelRequired: 0

// 初級拡張ボス
explorerLevelRequired: 1

// 中級拡張ボス
explorerLevelRequired: 2-4

// 上級拡張ボス
explorerLevelRequired: 5-7

// 最高級拡張ボス
explorerLevelRequired: 8-10
```

### 現在の解禁レベル分布（地域テーマ別）

エクスプローラーアビリティの解禁レベルは、プレイヤーの探検範囲拡大という設定に合わせて地域・環境テーマごとに設定されています：

- **レベル0 - 初期エリア・基本ボス**
  - 沼のドラゴン、闇のおばけ、機械のクモ
- **レベル1 - 砂漠**
  - 運び屋のサソリ
- **レベル2 - 海**
  - 海のクラーケン、アクアサーペント
- **レベル3 - ゲストキャラクター関係**
  - 夢の淫魔
- **レベル4 - ジャングル**
  - 蜜柑ドラゴン
- **レベル5 - 洞窟・地下世界**
  - 地底のワーム
- **レベル6 - 遺跡・廃墟・古城**
  - クリーンマスター、蝙蝠のヴァンパイア
- **レベル7 - 氷河・雪山**
  - ふわふわドラゴン
- **レベル8 - 工業・施設**
  - サーマル・アーカイバー
- **レベル9 - 天空・天使界**
  - セラフィムマスコット、双面の道化師
- **レベル10 - 魔界・冥界**
  - 魔界の竜（理不尽度MAX!）

### 記念品システム

各ボスには勝利時と敗北時の記念品を設定できます。記念品はエクスプローラー経験値の獲得源となり、バトルの成果として記録されます。

#### 記念品の設定指針

- **勝利時記念品（victoryTrophy）**: ボスの外側から採れるアイテム
  - 例：鱗、殻、羽根、外皮、装甲、角、牙など
  - プレイヤーが戦闘で勝利し、ボスの外見的特徴から得られる戦利品

- **敗北時記念品（defeatTrophy）**: ボスの体内から採れるアイテム
  - 例：体液、エッセンス、内臓の一部、血液、分泌物など
  - プレイヤーが敗北したが、ボスの内部に一時的に入ったことで得られる貴重なもの

#### 記念品データの実装

```typescript
victoryTrophy: {
    name: '記念品名',
    description: '記念品の詳細説明。どのようなアイテムで、どんな特徴があるかを記述。'
},
defeatTrophy: {
    name: '記念品名', 
    description: '記念品の詳細説明。どのようなアイテムで、どんな価値があるかを記述。'
}
```

### エクスプローラー経験値獲得システム

1. **初回勝利記念品**: `(解禁レベル + 1)² × 200` 経験値
2. **初回敗北記念品**: `(解禁レベル + 1)² × 50` 経験値
3. **スキル体験**: `受けたスキル種類数 × 20 × (解禁レベル + 1)` 経験値

### 新ボス追加時の考慮事項

- テーマに応じた適切な解禁レベルを設定
- 既存ボスとの難易度バランスを考慮
- 記念品名は「{ボス名}のたてがみ」（勝利）、「{ボス名}の粘液」（敗北）で自動生成も可能ですが、ボス固有の特徴を反映した独自の記念品設定を推奨

## テスト項目

### 特に重要なテスト
- [ ] **TypeScript型チェック**: `npm run typecheck` でエラーがないこと
- [ ] **単体テスト**: `npm run test` でテストが成功すること
- [ ] **ビルドテスト**: `npm run build` でビルドが成功すること
- [ ] **エクスプローラーレベル制御**: 適切なレベルでボスが解禁されること

### 基本機能テスト
- [ ] ボス選択画面での表示確認
- [ ] 戦闘開始・終了の動作確認
- [ ] 各アクションの動作確認
- [ ] AIの行動パターン確認
- [ ] 状態異常の動作確認
- [ ] バランスの調整確認
- [ ] 記念品システムの動作確認

## 参考ファイル

実装の参考として以下のファイルを確認してください：

### コアシステムファイル
- `src/templates/` - EJSテンプレートシステム（HTML自動生成）
- `vite.config.ts` - Viteビルド設定、EJSプラグイン統合
- `vitest.config.ts` - Vitestテスト設定

### 古い実装（参考用）
- `src/game/data/bosses/swamp-dragon.ts` - 複雑なAI戦略の例
- `src/game/data/bosses/dark-ghost.ts` - 状態異常特化の例
- `src/game/data/bosses/mech-spider.ts` - 拘束特化の例

### 新しい実装（推奨）
- `src/game/data/bosses/sea-kraken.ts` - 現代的なAI戦略、PostDefeatedAttack、finishingMove、getDialogue の例
- `src/game/data/bosses/aqua-serpent.ts` - customVariablesでの特殊技管理、onUse コールバックの例
- `src/game/data/bosses/clean-master.ts` - 新しい状態異常システムの例
- `src/game/data/bosses/dream-demon.ts` - 多様な状態異常と複雑な行動パターンの例
- `src/game/data/bosses/bat-vampire.ts` - FinishingMoveアクション、給餌システム、詳細なAI戦略の例
- `src/game/data/bosses/underground-worm.ts` - 最新のEJSテンプレート対応、記念品システムの例
- `src/game/data/bosses/mikan-dragon.ts` - 新しい状態異常とシンプルなAI戦略の例
- `src/game/data/bosses/seraph-mascot.ts` - 高HPボスのバランス例
- `src/game/data/bosses/dual-jester.ts` - 二面性ボスの実装例
- `src/game/data/bosses/demon-dragon.ts` - 最高難易度ボスの設計例

### システムファイル
- `src/game/entities/Boss.ts` - ボスクラスの実装
- `src/game/systems/StatusEffectTypes.ts` - 状態異常システム
- `src/game/data/index.ts` - データエクスポートパターン

## よくある問題と対処法

### ボスが表示されない

- **ファイル命名規則確認**: ボスファイルが `{boss-id}.ts` 形式で作成されているか
- **export名確認**: export名が `{camelCaseBossId}Data` 形式になっているか（例: `swamp-dragon.ts` → `swampDragonData`）
- **BossDataインターフェース適合**: `id` と `displayName` プロパティが定義されているか
- **EJSテンプレートシステムのビルド結果確認**（HTMLは自動生成）
- **エクスプローラーレベル不足による非表示ではないか確認**

### 行動が選択されない

- `canUse` 関数の条件確認
- `weight` が0以上に設定されているか確認
- `playerStateCondition` が正しく設定されているか確認

### 状態異常が効かない

- `StatusEffectType` の定義確認
- CSS クラスの追加確認
- `statusChance` の設定確認（0.0-1.0の範囲で設定）

### コード品質関連エラー
- **EJSテンプレート関連**: Viteビルドエラーが出る場合はテンプレート構文を確認
- ~~**registeredBossIdsの不一致**~~: ❌ **不要！** glob importによる自動検出
- **glob import エラー**: ファイル名とexport名のパターンマッチング確認
- **TypeScriptエラー**: ボスデータのBossDataインターフェース適合性を確認
- **テストエラー**: Vitestテストケースの実行結果を確認