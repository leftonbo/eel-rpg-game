import { StatusEffectType, StatusEffectConfig } from '../StatusEffectTypes';

// Bat Vampire status effect configurations
export const batVampireEffectsConfigs = new Map<StatusEffectType, StatusEffectConfig>([
    [StatusEffectType.Darkness, {
        type: StatusEffectType.Darkness,
        name: '暗闇',
        description: '視界が奪われ、攻撃の命中率が大幅に低下する',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            accuracy: 0.3 // 命中率70%低下
        },
        messages: {
            onApplyPlayer: 'エルナルの視界が暗闇に包まれた！',
            onApplyBoss: 'ボスの視界が暗闇に包まれた！',
            onRemovePlayer: 'エルナルの視界が回復した。',
            onRemoveBoss: 'ボスの視界が回復した。'
        }
    }]
]);