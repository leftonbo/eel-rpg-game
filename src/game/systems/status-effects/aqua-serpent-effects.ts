import { StatusEffectType, StatusEffectConfig } from '../StatusEffectTypes';

export const aquaSerpentEffectsConfigs: StatusEffectConfig[] = [
    {
        type: StatusEffectType.WaterSoaked,
        name: '水浸し',
        description: '水で濡れて防御力が低下',
        duration: 4,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            damageReceived: 1.3 // Increases damage received by 30%
        }
    },
    {
        type: StatusEffectType.Dizzy,
        name: '目眩',
        description: 'ふらつきで攻撃の命中率が低下',
        duration: 4,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            accuracy: 0.8 // Reduces accuracy to 80% of its original value
        }
    }
];