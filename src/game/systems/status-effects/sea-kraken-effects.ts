import { StatusEffectType, StatusEffectConfig } from '../StatusEffectTypes';

export const seaKrakenEffectsConfigs: StatusEffectConfig[] = [
    {
        type: StatusEffectType.VisionImpairment,
        name: '視界阻害',
        description: 'イカスミで視界が阻害され、攻撃の命中率が低下',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            accuracy: 0.7 // Reduces accuracy to 70% of its original value
        }
    }
];