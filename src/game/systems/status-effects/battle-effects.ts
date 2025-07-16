import { StatusEffectType, StatusEffectConfig } from '../StatusEffectTypes';

export const battleEffectsConfigs: Map<StatusEffectType, StatusEffectConfig> = new Map([
    [StatusEffectType.Defending, {
        type: StatusEffectType.Defending,
        name: '防御',
        description: '次のターンのダメージを半減',
        duration: 1,
        category: 'buff',
        isDebuff: false,
        modifiers: {
            damageReceived: 0.5
        }
    }],
    [StatusEffectType.Stunned, {
        type: StatusEffectType.Stunned,
        name: '気絶',
        description: '行動できない',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            canAct: false
        }
    }],
    [StatusEffectType.Fire, {
        type: StatusEffectType.Fire,
        name: '火だるま',
        description: '毎ターンHPが8減少',
        duration: 2,
        category: 'debuff',
        isDebuff: true,
        onTick: (target: any, _effect: any) => {
            target.takeDamage(8);
        }
    }],
    [StatusEffectType.Charm, {
        type: StatusEffectType.Charm,
        name: '魅了',
        description: 'もがくの成功率が低下',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            struggleRate: 0.5
        }
    }],
    [StatusEffectType.Slow, {
        type: StatusEffectType.Slow,
        name: '鈍足',
        description: '攻撃力が半減',
        duration: 2,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            attackPower: 0.5
        }
    }],
    [StatusEffectType.Poison, {
        type: StatusEffectType.Poison,
        name: '毒',
        description: '毎ターンHPが3減少',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        onTick: (target: any, _effect: any) => {
            target.takeDamage(3);
        }
    }],
    [StatusEffectType.Invincible, {
        type: StatusEffectType.Invincible,
        name: '無敵',
        description: 'すべての攻撃を回避する',
        duration: 3,
        category: 'buff',
        isDebuff: false,
        modifiers: {
            damageReceived: 0
        }
    }],
    [StatusEffectType.Energized, {
        type: StatusEffectType.Energized,
        name: '元気満々',
        description: 'MPが常に満タン',
        duration: 3,
        category: 'buff',
        isDebuff: false,
        onTick: (target: any, _effect: any) => {
            target.mp = target.maxMp;
        }
    }],
    [StatusEffectType.Slimed, {
        type: StatusEffectType.Slimed,
        name: '粘液まみれ',
        description: '拘束解除の成功率が半減',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            struggleRate: 0.5
        }
    }],
    [StatusEffectType.Sleep, {
        type: StatusEffectType.Sleep,
        name: '睡眠',
        description: '完全に眠っており行動不能',
        duration: 10,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            canAct: false
        }
    }],
    [StatusEffectType.DreamControl, {
        type: StatusEffectType.DreamControl,
        name: '夢操作',
        description: '夢の世界に閉じ込められ、完全に支配されている',
        duration: -1, // Permanent while sleeping
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            canAct: false,
            canUseSkills: false
        }
    }]
]);