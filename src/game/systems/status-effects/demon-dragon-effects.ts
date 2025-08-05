import { StatusEffectType, StatusEffectConfig, ActionPriority } from '../StatusEffectTypes';

export const demonDragonEffectsConfigs: StatusEffectConfig[] = [
    {
        type: StatusEffectType.DemonStomach,
        name: '魔の胃袋',
        description: '魔界の竜の胃袋に取り込まれ、至福の体験をしている',
        duration: -1, // Permanent until released
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            canAct: false,
            actionPriority: ActionPriority.CannotAct
        },
        messages: {
            onApplyPlayer: '{name}は魔の胃袋に取り込まれてしまった！',
            onApplyBoss: '{name}は魔の胃袋に取り込まれた！',
            onRemovePlayer: '{name}は魔の胃袋から解放された！',
            onRemoveBoss: '{name}は魔の胃袋から解放された！'
        }
    }
];