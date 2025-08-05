import { StatusEffectType, StatusEffectConfig } from '../StatusEffectTypes';

export const mikanDragonEffectsConfigs: StatusEffectConfig[] = [
    {
        type: StatusEffectType.Lethargy,
        name: '脱力',
        description: '体に力が入らず、攻撃力が大幅に低下',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            attackPower: 0.3
        }
    }
];