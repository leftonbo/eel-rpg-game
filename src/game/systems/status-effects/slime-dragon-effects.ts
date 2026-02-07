import { StatusEffectType, StatusEffectConfig, ActionPriority } from '../StatusEffectTypes';

export const slimeDragonEffectsConfigs: StatusEffectConfig[] = [
    {
        type: StatusEffectType.SlimeCoated,
        name: 'スライムコーティング',
        description: '全身がスライムでコーティングされ、動きにくく回避しにくい',
        duration: 5,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            struggleRate: 0.3,
            accuracy: 0.85
        },
        messages: {
            onApplyPlayer: '{name}は全身をスライムでコーティングされた！身体が動きにくい…',
            onApplyBoss: '{name}はスライムでコーティングされた！',
            onRemovePlayer: '{name}のスライムコーティングが剥がれた',
            onRemoveBoss: '{name}のスライムコーティングが剥がれた'
        }
    },
    {
        type: StatusEffectType.SlimeEgg,
        name: 'スライムの卵',
        description: 'スライムの卵に包み込まれ、身動きが取れない',
        duration: -1, // 永続
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            canAct: false,
            actionPriority: ActionPriority.CannotAct
        },
        messages: {
            onApplyPlayer: '{name}はスライムの卵に包み込まれてしまった！',
            onApplyBoss: '{name}はスライムの卵に包まれた！',
            onRemovePlayer: '{name}はスライムの卵から解放された！',
            onRemoveBoss: '{name}はスライムの卵から解放された！'
        }
    }
];
