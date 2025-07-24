import { StatusEffectType, StatusEffectConfig } from '../StatusEffectTypes';

export const skyPhoenixEffectsConfigs = new Map<StatusEffectType, StatusEffectConfig>([
    [StatusEffectType.SkyCurse, {
        type: StatusEffectType.SkyCurse,
        name: '天空の呪い',
        description: '天空の不死鳥によって呪われ、MP減少・攻撃力低下・回避率低下の複合デバフ',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        potency: 10,
        modifiers: {
            attackPower: 0.7, // 攻撃力-30%
            accuracy: 0.8     // 回避率-20%
        },
        onTick: (target, effect) => {
            // MP減少効果
            if (target.mp > 0) {
                const mpDrain = effect.potency || 10;
                target.mp = Math.max(0, target.mp - mpDrain);
            }
        },
        messages: {
            onApplyPlayer: '天空の呪いがプレイヤーを包み込んだ！',
            onApplyBoss: '天空の呪いがボスを包み込んだ！',
            onTickPlayer: 'プレイヤーは天空の呪いによってMPが{damage}減少した',
            onTickBoss: 'ボスは天空の呪いによってMPが{damage}減少した',
            onRemovePlayer: 'プレイヤーの天空の呪いが解除された',
            onRemoveBoss: 'ボスの天空の呪いが解除された'
        }
    }]
]);