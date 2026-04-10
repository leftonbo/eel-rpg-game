import { StatusEffectType, StatusEffectConfig } from '../StatusEffectTypes';

export const tongueDragonEffectsConfigs: StatusEffectConfig[] = [
    {
        type: StatusEffectType.TongueMucus,
        name: '粘液まみれ',
        description: '舌の粘液でぬるぬるになり、動きが鈍くなる',
        duration: 4,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            accuracy: 0.85,
            struggleRate: 0.3
        },
        messages: {
            onApplyPlayer: '{name}は舌の粘液でぬるぬるにされた！動きが鈍くなる…',
            onApplyBoss: '{name}は粘液まみれになった！',
            onRemovePlayer: '{name}の粘液が乾いて剥がれた',
            onRemoveBoss: '{name}の粘液が乾いて剥がれた'
        }
    }
];
