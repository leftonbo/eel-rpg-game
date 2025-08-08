import { Actor } from '@/game/entities/Actor';
import { StatusEffectType, StatusEffectConfig, StatusEffect } from '../StatusEffectTypes';

export const scorpionCarrierEffectsConfigs: StatusEffectConfig[] = [
    {
        type: StatusEffectType.Anesthesia,
        name: '麻酔',
        description: '麻酔により行動不能',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            canAct: false
        }
    },
    {
        type: StatusEffectType.ScorpionPoison,
        name: 'サソリ毒',
        description: '毎ターン最大HPの1/10のダメージを受ける',
        duration: 4,
        category: 'debuff',
        isDebuff: true,
        stackable: true,
        onTick: (target: Actor, _effect: StatusEffect) => {
            const damage = Math.floor(target.maxHp / 10);
            target.takeDamage(damage);
        },
        messages: {
            onApplyPlayer: '{name}は強力なサソリ毒に冒された！',
            onApplyBoss: '{name}は強力なサソリ毒に冒された！',
            onTickPlayer: '{name}はサソリ毒により{damage}のダメージを受けた！',
            onTickBoss: '{name}はサソリ毒により{damage}のダメージを受けた！',
            onRemovePlayer: '{name}の体からサソリ毒が抜けた',
            onRemoveBoss: '{name}の体からサソリ毒が抜けた'
        }
    },
    {
        type: StatusEffectType.Weakening,
        name: '脱力剤',
        description: '体力が奪われ、受けるダメージが1.5倍になる',
        duration: 4,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            damageReceived: 1.5
        }
    }
];