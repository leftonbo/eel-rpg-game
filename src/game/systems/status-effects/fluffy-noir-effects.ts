import { ActionPriority, StatusEffectConfig, StatusEffectType } from '../StatusEffectTypes';

export const fluffyNoirEffectsConfigs: StatusEffectConfig[] = [
    {
        type: StatusEffectType.SignBound,
        name: '進入禁止',
        description: '進入禁止標識の効力で、その場から動けない',
        duration: 4,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            canAct: false,
            canUseSkills: false,
            actionPriority: ActionPriority.CannotAct,
            struggleRate: 0.2
        },
        messages: {
            onApplyPlayer: '{name}の前に透明な「進入禁止」の壁が立ちふさがった！動けない！',
            onTickPlayer: '見えない「進入禁止」の壁が{name}を取り囲んでいる...',
            onRemovePlayer: '「進入禁止」の壁が霧散し、{name}は再び動けるようになった'
        }
    },
    {
        type: StatusEffectType.OwnershipMark,
        name: '所有標識',
        description: '黒ケモノの青い所有印が体に巻きつき、抵抗する気力を奪っていく',
        duration: -1,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            canAct: false,
            canUseSkills: false,
            struggleRate: 0.05,
            actionPriority: ActionPriority.CannotAct
        },
        messages: {
            onApplyPlayer: '',
            onTickPlayer: '',
            onRemovePlayer: ''
        }
    }
];
