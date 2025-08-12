import { Actor } from '@/game/entities/Actor';
import { StatusEffectType, StatusEffectConfig, StatusEffect } from '../StatusEffectTypes';

export const cleanMasterEffectsConfigs: StatusEffectConfig[] = [
    {
        type: StatusEffectType.Soapy,
        name: '泡まみれ',
        description: '石鹸の泡で滑りやすくなり、命中率が低下',
        duration: 4,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            accuracy: 0.7, // Reduces accuracy to 70%
            struggleRate: 0.8 // Slightly harder to struggle
        },
        messages: {
            onApplyPlayer: '{name}は泡まみれになった！',
            onApplyBoss: '{name}は泡まみれになった！',
            onRemovePlayer: '{name}の泡が取れた',
            onRemoveBoss: '{name}の泡が取れた'
        }
    },
    {
        type: StatusEffectType.Spinning,
        name: '回転中',
        description: '遠心分離で回転し、命中率が大幅低下',
        duration: 2,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            accuracy: 0.5, // Reduces accuracy to 50%
            canAct: false // Cannot act during first turn
        },
        messages: {
            onApplyPlayer: '{name}は回転中になった！',
            onApplyBoss: '{name}は回転中になった！',
            onRemovePlayer: '{name}の回転が終わった',
            onRemoveBoss: '{name}の回転が終わった'
        }
    },
    {
        type: StatusEffectType.Steamy,
        name: '蒸し暑い',
        description: '温風で蒸し暑くなり、毎ターン軽微ダメージ',
        duration: 4,
        category: 'debuff',
        isDebuff: true,
        stackable: true,
        onTick: (target: Actor, _effect: StatusEffect) => {
            target.takeDamage(4);
        },
        messages: {
            onApplyPlayer: '{name}は蒸し暑さに包まれた！',
            onApplyBoss: '{name}は蒸し暑さに包まれた！',
            onTickPlayer: '{name}は熱風により{damage}のダメージを受けた！',
            onTickBoss: '{name}は熱風により{damage}のダメージを受けた！',
            onRemovePlayer: '{name}を包む蒸し暑さが収まった',
            onRemoveBoss: '{name}を包む蒸し暑さが収まった'
        }
    }
];