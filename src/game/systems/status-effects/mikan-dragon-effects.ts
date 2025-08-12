import { StatusEffectType, StatusEffectConfig } from '../StatusEffectTypes';

export const mikanDragonEffectsConfigs: StatusEffectConfig[] = [
    {
        type: StatusEffectType.Lethargy,
        name: '脱力',
        description: '体に力が入らず、攻撃力が大幅に低下',
        duration: 4,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            attackPower: 0.3
        },
        messages: {
            onApplyPlayer: '{name}は体に力が入らなくなってしまった！',
            onApplyBoss: '{name}は体に力が入らなくなった！',
            onRemovePlayer: '{name}の脱力が解けた',
            onRemoveBoss: '{name}の脱力が解けた'
        }
    }
];