import { StatusEffectType, StatusEffectConfig } from '../StatusEffectTypes';

export const coreStatesConfigs: Map<StatusEffectType, StatusEffectConfig> = new Map([
    [StatusEffectType.Dead, {
        type: StatusEffectType.Dead,
        name: '再起不能',
        description: 'これ以上抵抗できない',
        duration: -1, // Considered received finishing move
        category: 'neutral',
        isDebuff: false,
        modifiers: {
            canAct: false
        }
    }],
    [StatusEffectType.Doomed, {
        type: StatusEffectType.Doomed,
        name: '再起不能',
        description: 'これ以上抵抗できない',
        duration: -1, // Permanent until finishing move
        category: 'neutral',
        isDebuff: false,
        modifiers: {
            canAct: false
        }
    }],
    [StatusEffectType.KnockedOut, {
        type: StatusEffectType.KnockedOut,
        name: '行動不能',
        description: '5ターンの間行動できない',
        duration: 5,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            canAct: false
        }
    }],
    [StatusEffectType.Exhausted, {
        type: StatusEffectType.Exhausted,
        name: '疲れ果て',
        description: 'スキル使用不可、攻撃力半減、受けるダメージ1.5倍',
        duration: 4,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            attackPower: 0.5,
            damageReceived: 1.5,
            canUseSkills: false
        }
    }],
    [StatusEffectType.Restrained, {
        type: StatusEffectType.Restrained,
        name: '拘束',
        description: '行動が制限される',
        duration: -1, // Duration managed by struggle system
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            canAct: false
        }
    }],
    [StatusEffectType.Cocoon, {
        type: StatusEffectType.Cocoon,
        name: '繭状態',
        description: '合成糸で包まれ縮小液によって体が縮小されている',
        duration: -1, // Duration managed by struggle system like restraint
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            canAct: false
        },
        onTick: (target: any, _effect: any) => {
            // Reduce max HP each turn to represent shrinking
            const maxHpReduction = Math.floor(target.maxHp * 0.05); // 5% per turn
            if (maxHpReduction > 0) {
                target.loseMaxHp(maxHpReduction);
            }
        }
    }],
    [StatusEffectType.Eaten, {
        type: StatusEffectType.Eaten,
        name: '食べられ',
        description: '最大HPが毎ターン減少、MP回復阻止',
        duration: -1, // Until escaped or game over
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            canAct: false
        }
    }]
]);