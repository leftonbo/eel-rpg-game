import { StatusEffectType, StatusEffectConfig } from '../StatusEffectTypes';

// Bat Vampire status effect configurations
export const batVampireEffectsConfigs: StatusEffectConfig[] = [
    {
        type: StatusEffectType.Darkness,
        name: '暗闇',
        description: '視界が奪われ、攻撃の命中率が大幅に低下する',
        duration: 4,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            accuracy: 0.3 // 命中率70%低下
        },
        messages: {
            onApplyPlayer: '{name}の視界が暗闇に包まれた！',
            onApplyBoss: '{name}の視界が暗闇に包まれた！',
            onRemovePlayer: '{name}の視界が回復した。',
            onRemoveBoss: '{name}の視界が回復した。'
        }
    }
];