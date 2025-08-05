import { StatusEffectType, StatusEffectConfig } from '../StatusEffectTypes';

export const darkGhostEffectsConfigs: StatusEffectConfig[] = [
    {
        type: StatusEffectType.Fear,
        name: '恐怖',
        description: '恐怖により受けるダメージが1.5倍になる',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            damageReceived: 1.5
        },
        messages: {
            onApplyPlayer: '{name}は恐怖に支配された！',
            onApplyBoss: '{name}は恐怖に支配された！',
            onRemovePlayer: '{name}の恐怖が和らいだ',
            onRemoveBoss: '{name}の恐怖が和らいだ'
        }
    },
    {
        type: StatusEffectType.Oblivion,
        name: '忘却',
        description: 'スキルの使用方法を忘れ、使用できない',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            canUseSkills: false
        },
        messages: {
            onApplyPlayer: '{name}はスキルの使用方法を忘れてしまった！',
            onApplyBoss: '{name}はスキルの使用方法を忘れてしまった！',
            onRemovePlayer: '{name}はスキルの使用方法を思い出した',
            onRemoveBoss: '{name}はスキルの使用方法を思い出した'
        }
    }
];