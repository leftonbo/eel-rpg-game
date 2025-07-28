import { StatusEffectType, StatusEffectConfig } from '../StatusEffectTypes';

export const fluffyDragonEffectsConfigs = new Map<StatusEffectType, StatusEffectConfig>([
    [StatusEffectType.Sleepy, {
        type: StatusEffectType.Sleepy,
        name: '眠気',
        description: 'MP回復率と拘束脱出率が減少し、眠りに落ちやすくなる',
        duration: 5,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            struggleRate: 0.7, // 拘束脱出率30%減少
            mpRegenerateRate: 0.7, // MP回復率30%減少
        },
        messages: {
            onApplyPlayer: '{name}は眠気に襲われた...',
            onApplyBoss: '{name}は眠気に襲われた...',
            onRemovePlayer: '{name}の眠気が覚めた',
            onRemoveBoss: '{name}の眠気が覚めた',
            onTickPlayer: '', // ダメージなしなので空文字
            onTickBoss: ''
        }
    }]
]);