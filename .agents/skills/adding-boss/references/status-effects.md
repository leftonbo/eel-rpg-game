# Boss Status Effects

特定ボス専用の、新しい状態異常を追加する時だけ読む。共通の状態異常で代用できる場合は追加しない。

## 追加手順

1. `src/game/systems/StatusEffectTypes.ts` の `StatusEffectType` enum に新規値を追加する。
2. `src/game/systems/status-effects/{boss-id}-effects.ts` に `StatusEffectConfig` を定義する。
3. `src/game/systems/status-effects/index.ts` から新しい設定を登録する。
4. 表示が必要なら `src/styles/main.css` に `.status-{type}` クラスを追加する。
5. ボス行動の `statusEffect`、`statusDuration`、`statusChance` を設定する。

## StatusEffectConfig

```typescript
export interface StatusEffectConfig {
    type: StatusEffectType;
    name: string;
    description: string;
    duration: number;
    onApply?: (target: Actor) => void;
    onTick?: (target: Actor, effect: StatusEffect) => void;
    onRemove?: (target: Actor) => void;
    stackable?: boolean;
    potency?: number;
    category: 'buff' | 'debuff' | 'neutral';
    isDebuff: boolean;
    modifiers?: {
        attackPower?: number;
        damageReceived?: number;
        struggleRate?: number;
        accuracy?: number;
        canAct?: boolean;
        canUseSkills?: boolean;
        actionPriority?: ActionPriority;
        debuffChanceModifier?: number;
        hpRegenerateRate?: number;
        mpRegenerateRate?: number;
    };
    messages?: StatusEffectMessages;
}
```

`modifiers` で表現できる効果はコールバックより優先する。`onTick` などのコールバックは、毎ターンダメージ、状態遷移、特殊メッセージなどが必要な場合に使う。

## 共通の状態異常

- `Dead`: ゲームオーバー状態用。実際の死亡表現として扱わない。
- `Doomed`: 最大 HP 0 の敗北状態。とどめ攻撃対象。
- `KnockedOut`: 戦闘不能。
- `Exhausted`: MP 0 の疲労状態。
- `Restrained`: 拘束。
- `Cocoon`: 繭。
- `Eaten`: 食べられ。
- `Defending`: 防御。
- `Stunned`: 気絶。
- `Shrunk`: 縮小。
- `Fire`: 火だるま。
- `Charm`: 魅了。
- `Slow`: 鈍足。
- `Poison`: 毒。
- `Invincible`: 無敵。通常はアイテム効果によるもの。
- `Energized`: 活性化。通常はアイテム効果によるもの。
- `Slimed`: スライムまみれ。
- `Paralysis`: 麻痺。
- `Weakness`: 衰弱。
- `Confusion`: 混乱。
- `Sleep`: 眠り。

## 設計指針

- 状態異常名は PascalCase の enum 名と kebab-case の値を揃える。
- ボス固有状態は、どのボス由来か分かる命名またはコメントにする。
- `statusChance` は `0.0` から `1.0` の範囲に収める。
- 拘束、食べられ、敗北などの基幹状態を直接上書きする時は、既存ボスの `onUse` 実例を確認する。

## CSS

ステータス表示に独自色が必要なら `src/styles/main.css` に追加する。

```css
.status-example-effect {
    background-color: var(--bs-info-bg-subtle);
    color: var(--bs-info-text-emphasis);
}
```
