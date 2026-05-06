# Boss Implementation Patterns

新ボス実装で迷いやすい雛形、AI 分岐、特殊行動のパターンをまとめる。

## 最小構成

```typescript
import { Player } from '@/game/entities/Player';
import { ActionType, Boss, BossAction, BossData } from '@/game/entities/Boss';

const bossIdActions: BossAction[] = [
    {
        id: 'basic-attack',
        type: ActionType.Attack,
        name: '基本攻撃',
        description: '基本的な攻撃',
        messages: ['{boss}が{player}に攻撃した！'],
        damageFormula: (user: Boss) => user.attackPower,
        weight: 40,
        playerStateCondition: 'normal'
    },
    {
        id: 'eat',
        type: ActionType.EatAttack,
        name: '丸呑み',
        description: '戦闘不能の{player}を丸呑みにする',
        messages: ['{boss}は{player}を丸呑みにした！'],
        weight: 1,
        playerStateCondition: 'ko'
    },
    {
        id: 'devour',
        type: ActionType.DevourAttack,
        name: '体内吸収',
        description: '体内で{player}を吸収する',
        messages: ['{player}は{boss}の体内でじわじわと吸収されている...'],
        damageFormula: (user: Boss) => user.attackPower * 1.5,
        weight: 30,
        playerStateCondition: 'eaten'
    }
];

export const bossIdData: BossData = {
    id: 'boss-id',
    name: 'BossId',
    displayName: 'ボス名',
    icon: '🐉',
    description: 'ボスの短い説明。',
    questNote: 'ボス選択画面で読むクエスト風説明。',
    maxHp: 400,
    attackPower: 18,
    actions: bossIdActions,
    explorerLevelRequired: 1,
    victoryTrophy: {
        name: 'ボスの外皮',
        description: 'ボスの外側から得た戦利品。'
    },
    defeatTrophy: {
        name: 'ボスの体液',
        description: 'ボスの内側から得た記念品。'
    },
    aiStrategy: (_boss: Boss, _player: Player, _turn: number) => bossIdActions[0]
};
```

ファイル名は `boss-id.ts`、export 名は `bossIdData`、`BossData.id` は `boss-id` に揃える。

## AI 分岐順

複雑なボスは次の順で分岐させると既存パターンと揃う。

1. カスタムとどめ攻撃: `suppressAutoFinishingMove` を使う場合だけ、`player.isEaten() && player.isDoomed()` を最優先で処理する。
2. 敗北後行動: `player.isDefeated()` のとき `PostDefeatedAttack` を返す。
3. 体内行動: `player.isEaten()` のとき `playerStateCondition === 'eaten'` の行動から選ぶ。
4. 戦闘不能行動: `player.isKnockedOut()` のとき拘束、繭、食べるなどへつなぐ。
5. 通常行動: `boss.getPlayerState(player)` と `canUse` に合う行動を重み付きで選ぶ。

## 重み付き選択

```typescript
const selectWeightedAction = (actions: BossAction[]): BossAction => {
    const usableActions = actions.filter((action) => action.weight > 0);
    const totalWeight = usableActions.reduce((sum, action) => sum + action.weight, 0);
    let random = Math.random() * totalWeight;

    for (const action of usableActions) {
        random -= action.weight;
        if (random <= 0) {
            return action;
        }
    }

    return usableActions[0];
};
```

実装ファイルごとにローカル関数として置く。共通化が既存パターンにない場合、無理に shared helper を追加しない。

## customVariables

`customVariables` は一度きりの特殊技、フェーズ、クールダウン、敗北後ターン数の管理に使う。

```typescript
customVariables: {
    hasUsedSpecialMove: false,
    specialMoveCooldown: 0,
    postDefeatedTurn: 0
}
```

AI 側では `getCustomVariable` / `setCustomVariable` を使う。

```typescript
const cooldown = boss.getCustomVariable<number>('specialMoveCooldown') ?? 0;
if (cooldown > 0) {
    boss.setCustomVariable('specialMoveCooldown', cooldown - 1);
}
```

## カスタムとどめ攻撃

自動とどめ攻撃では表現しきれない永続状態遷移が必要な場合、`suppressAutoFinishingMove: true` と `ActionType.FinishingMove` を使う。

```typescript
const customFinishMove: BossAction = {
    id: 'custom-finish',
    type: ActionType.FinishingMove,
    name: 'カスタムとどめ',
    description: '体内で力尽きた{player}を最終状態へ移行させる',
    messages: ['{player}は{boss}の体内で完全に制圧されてしまった...'],
    weight: 1,
    onUse: (_boss: Boss, player: Player) => {
        player.statusEffects.removeEffect(StatusEffectType.Doomed);
        player.statusEffects.addEffect(StatusEffectType.Dead);
        return [];
    }
};

const aiStrategy = (boss: Boss, player: Player, turn: number): BossAction => {
    if (player.isEaten() && player.isDoomed()) {
        return customFinishMove;
    }

    // 通常分岐へ続く
    return selectWeightedAction(bossIdActions);
};
```

`StatusEffectType.Dead` はゲームオーバー状態用であり、実際の死亡表現として扱わない。

## 敗北後 8 ターン毎イベント

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
        const currentTurn = boss.getCustomVariable<number>('postDefeatedTurn') ?? 0;
        const nextTurn = currentTurn + 1;
        boss.setCustomVariable('postDefeatedTurn', nextTurn);

        if (nextTurn % 8 === 0) {
            return specialPostDefeatAction;
        }
    }

    return selectWeightedAction(bossIdActions);
};
```

`customVariables` に `postDefeatedTurn: 0` の初期値を入れる。

## onUse の使いどころ

`onUse` は状態異常の付け替え、カスタム変数更新、特殊メッセージの追加に使う。

- 標準の `damageFormula` と `statusEffect` だけで表現できるなら `onUse` は使わない。
- `onUse` は副作用が読みやすいよう短く保つ。
- 戦闘結果に関わる変更は既存ボスの実例に寄せる。

## i18n

多言語対応する場合は `src/game/i18n/bosses/{boss-id}.ts` に `BossTranslation` を export し、`src/game/i18n/bosses/index.ts` に登録する。

翻訳未定義フィールドは、ボスデータ側の値が `defaultValue` として使われる。新規追加直後は日本語のボスデータだけで成立させ、その後に i18n を追加してよい。
