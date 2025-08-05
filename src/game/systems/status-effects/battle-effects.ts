import { Actor } from '@/game/entities/Actor';
import { StatusEffectType, StatusEffectConfig, StatusEffect } from '../StatusEffectTypes';

// デフォルトダメージ量の定数
const DEFAULT_FIRE_DAMAGE = 8;
const DEFAULT_POISON_DAMAGE = 3;

export const battleEffectsConfigs: StatusEffectConfig[] = [
    {
        type: StatusEffectType.Defending,
        name: '防御',
        description: '次のターンのダメージを半減',
        duration: 1,
        category: 'buff',
        isDebuff: false,
        modifiers: {
            damageReceived: 0.5
        }
    },
    {
        type: StatusEffectType.Stunned,
        name: '気絶',
        description: '行動できない',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            canAct: false
        }
    },
    {
        type: StatusEffectType.Shrunk,
        name: '縮小',
        description: '体が縮んでしまい、あらゆる能力が低下',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            attackPower: 0.25,
            damageReceived: 2.0,
            struggleRate: 0.1,
            accuracy: 0.25,
        },
        messages: {
            onApplyPlayer: '{name}は縮小状態になった！体が小さくなり力が出せない！',
            onApplyBoss: '{name}は縮小状態になった！体が小さくなり力が出せない！',
            onRemovePlayer: '{name}の縮小状態が元に戻った！',
            onRemoveBoss: '{name}の縮小状態が元に戻った！'
        }
    },
    {
        type: StatusEffectType.Fire,
        name: '火だるま',
        description: '毎ターンHPが減少',
        duration: 2,
        category: 'debuff',
        isDebuff: true,
        stackable: true,
        potency: DEFAULT_FIRE_DAMAGE,
        onTick: (target: Actor, effect: StatusEffect) => {
            const damage = effect.potency ?? DEFAULT_FIRE_DAMAGE;
            target.takeDamage(damage);
        },
        messages: {
            onApplyPlayer: '{name}は火だるま状態になった！',
            onApplyBoss: '{name}は火だるま状態になった！',
            onTickPlayer: '{name}は火だるま状態で{damage}のダメージを受けた！',
            onTickBoss: '{name}は火だるま状態で{damage}のダメージを受けた！',
            onRemovePlayer: '{name}の火だるま状態が回復した',
            onRemoveBoss: '{name}の火だるま状態が回復した'
        }
    },
    {
        type: StatusEffectType.Charm,
        name: '魅了',
        description: 'もがくの成功率が低下',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            struggleRate: 0.5
        }
    },
    {
        type: StatusEffectType.Slow,
        name: '鈍足',
        description: '攻撃力が半減',
        duration: 2,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            attackPower: 0.5
        }
    },
    {
        type: StatusEffectType.Poison,
        name: '毒',
        description: '毎ターンHPが減少',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        stackable: true,
        potency: DEFAULT_POISON_DAMAGE,
        onTick: (target: Actor, effect: StatusEffect) => {
            const damage = effect.potency ?? DEFAULT_POISON_DAMAGE;
            target.takeDamage(damage);
        },
        messages: {
            onApplyPlayer: '{name}は毒状態になった！',
            onApplyBoss: '{name}は毒状態になった！',
            onTickPlayer: '{name}は毒により{damage}のダメージを受けた！',
            onTickBoss: '{name}は毒により{damage}のダメージを受けた！',
            onRemovePlayer: '{name}の毒が抜けた',
            onRemoveBoss: '{name}の毒が抜けた'
        }
    },
    {
        type: StatusEffectType.Invincible,
        name: '無敵',
        description: 'すべての攻撃を回避する',
        duration: 3,
        category: 'buff',
        isDebuff: false,
        modifiers: {
            damageReceived: 0
        }
    },
    {
        type: StatusEffectType.Energized,
        name: '元気満々',
        description: 'MPが常に満タン',
        duration: 3,
        category: 'buff',
        isDebuff: false,
        onTick: (target: Actor, _effect: StatusEffect) => {
            target.mp = target.maxMp;
        }
    },
    {
        type: StatusEffectType.Slimed,
        name: '粘液まみれ',
        description: '拘束解除の成功率が半減',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            struggleRate: 0.5
        }
    },
    {
        type: StatusEffectType.Sleep,
        name: '睡眠',
        description: '完全に眠っており行動不能',
        duration: 10,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            canAct: false
        }
    }
];