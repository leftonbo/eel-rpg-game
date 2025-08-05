import { Actor } from '@/game/entities/Actor';
import { StatusEffectType, StatusEffectConfig, ActionPriority, StatusEffect } from '../StatusEffectTypes';

export const coreStatesConfigs: StatusEffectConfig[] = [
    {
        type: StatusEffectType.Dead,
        name: '再起不能',
        description: 'これ以上抵抗できない',
        duration: -1, // Considered received finishing move
        category: 'neutral',
        isDebuff: false,
        modifiers: {
            canAct: false,
            actionPriority: ActionPriority.CannotAct
        }
    },
    {
        type: StatusEffectType.Doomed,
        name: '再起不能',
        description: 'これ以上抵抗できない',
        duration: -1, // Permanent until finishing move
        category: 'neutral',
        isDebuff: false,
        modifiers: {
            canAct: false,
            actionPriority: ActionPriority.CannotAct
        }
    },
    {
        type: StatusEffectType.KnockedOut,
        name: '行動不能',
        description: '5ターンの間行動できない',
        duration: 5,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            canAct: false,
            actionPriority: ActionPriority.CannotAct
        }
    },
    {
        type: StatusEffectType.Exhausted,
        name: '疲れ果て',
        description: 'スキル使用不可、攻撃力半減、受けるダメージ1.5倍、もがく成功率半減',
        duration: 4,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            attackPower: 0.5,
            damageReceived: 1.5,
            struggleRate: 0.5, // Struggle success rate halved
            canUseSkills: false
        }
    },
    {
        type: StatusEffectType.Restrained,
        name: '拘束',
        description: '行動が制限される',
        duration: -1, // Duration managed by struggle system
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            actionPriority: ActionPriority.StruggleAction
        },
        messages: {
            onApplyPlayer: '{name}は拘束された！',
            onApplyBoss: '{name}は拘束された！',
            onRemovePlayer: '{name}は拘束から逃れた！',
            onRemoveBoss: '{name}は拘束から逃れた！'
        }
    },
    {
        type: StatusEffectType.Cocoon,
        name: '繭状態',
        description: '合成糸で包まれ縮小液によって体が縮小されている',
        duration: -1, // Duration managed by struggle system like restraint
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            actionPriority: ActionPriority.StruggleAction
        },
        onTick: (target: Actor, _effect: StatusEffect) => {
            // Reduce max HP each turn to represent shrinking
            const maxHpReduction = Math.floor(target.maxHp * 0.05); // 5% per turn
            if (maxHpReduction > 0) {
                target.loseMaxHp(maxHpReduction);
            }
        },
        messages: {
            onApplyPlayer: '{name}は繭に包まれてしまった！',
            onApplyBoss: '{name}は繭に包まれた！',
            onTickPlayer: '{name}の体が縮小していく…',
            onTickBoss: '{name}の体が縮小していく…',
            onRemovePlayer: '{name}は繭から脱出した！',
            onRemoveBoss: '{name}は繭から脱出した！'
        }
    },
    {
        type: StatusEffectType.Eaten,
        name: '食べられ',
        description: '最大HPが毎ターン減少、MP回復阻止',
        duration: -1, // Until escaped or game over
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            actionPriority: ActionPriority.StruggleAction
        },
        messages: {
            onApplyPlayer: '{name}は食べられてしまった！',
            onApplyBoss: '{name}は食べられた！',
            onRemovePlayer: '{name}は何とか脱出した！',
            onRemoveBoss: '{name}は脱出した！'
        }
    }
];