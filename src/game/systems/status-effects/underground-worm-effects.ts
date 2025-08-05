import { StatusEffectType, StatusEffectConfig } from '../StatusEffectTypes';

export const undergroundWormEffectsConfigs: StatusEffectConfig[] = [
    {
        type: StatusEffectType.Petrified,
        name: '石化',
        description: '石のように固まって行動できない',
        duration: 2,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            canAct: false
        },
        messages: {
            onApplyPlayer: '{name}は石のように固まってしまった！',
            onApplyBoss: '{name}は石のように固まってしまった！',
            onRemovePlayer: '{name}の石化が解けた',
            onRemoveBoss: '{name}の石化が解けた'
        }
    }
];