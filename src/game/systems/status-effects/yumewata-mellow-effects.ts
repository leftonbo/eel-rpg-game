import { Actor } from '@/game/entities/Actor';
import { ActionPriority, StatusEffectConfig, StatusEffectType } from '../StatusEffectTypes';

export const yumewataMellowEffectsConfigs: StatusEffectConfig[] = [
    {
        type: StatusEffectType.CozyScent,
        name: 'あまい安心の匂い',
        description: '甘い匂いで警戒心が薄れ、状態異常を受けやすくなる',
        duration: 6,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            attackPower: 0.85,
            struggleRate: 0.75,
            debuffChanceModifier: 1.5
        },
        onTick: (target: Actor) => {
            const mpLoss = Math.min(target.mp, 1);
            if (mpLoss > 0) {
                target.loseMp(mpLoss);
            }
        },
        messages: {
            onApplyPlayer: '{name}は甘い安心の匂いで警戒心がゆるんだ...',
            onTickPlayer: '甘い匂いが残り、考えが少しぼんやりしている...',
            onRemovePlayer: '{name}の周りから甘い匂いが薄れた'
        }
    },
    {
        type: StatusEffectType.MuzzleMelt,
        name: '鼻先とろけ',
        description: '顔と鼻先への魔法的な接触で集中力と抵抗力が低下する',
        duration: 5,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            attackPower: 0.65,
            accuracy: 0.65,
            struggleRate: 0.45
        },
        onTick: (target: Actor) => {
            const mpLoss = Math.min(target.mp, 2);
            if (mpLoss > 0) {
                target.loseMp(mpLoss);
            }
        },
        messages: {
            onApplyPlayer: '{name}は鼻先から意識がとろけてしまった...',
            onTickPlayer: '鼻先に残る魔力で、抵抗する意思がまとまりにくい...',
            onRemovePlayer: '{name}は鼻先に残る魔力から立ち直った'
        }
    },
    {
        type: StatusEffectType.SensoryOverload,
        name: '感覚過多',
        description: '複数の感覚刺激で処理が追いつかず、命中率とスキル使用力が低下する',
        duration: 4,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            attackPower: 0.55,
            accuracy: 0.45,
            canUseSkills: false,
            debuffChanceModifier: 1.35
        },
        onTick: (target: Actor) => {
            const mpLoss = Math.min(target.mp, 3);
            if (mpLoss > 0) {
                target.loseMp(mpLoss);
            }
        },
        messages: {
            onApplyPlayer: '{name}は同時に押し寄せる感覚で頭がいっぱいになった！',
            onTickPlayer: 'どこから来る感覚なのか分からず、判断が遅れている...',
            onRemovePlayer: '{name}は感覚の洪水から意識を取り戻した'
        }
    },
    {
        type: StatusEffectType.RibbonNest,
        name: 'リボン巣',
        description: 'やわらかなリボンに包まれ、行動と脱出が大きく制限される',
        duration: 4,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            canAct: false,
            canUseSkills: false,
            struggleRate: 0.25,
            actionPriority: ActionPriority.CannotAct
        },
        messages: {
            onApplyPlayer: '{name}はリボンの巣に包まれ、身動きが取れなくなった！',
            onTickPlayer: 'リボンの巣がやさしく体を支え、抜け出す力を奪っている...',
            onRemovePlayer: '{name}はリボンの巣からほどけ出した'
        }
    },
    {
        type: StatusEffectType.KinshipDrift,
        name: '同族化のまどろみ',
        description: 'マスコットの群れに馴染みはじめ、戦う意思が大きく低下する',
        duration: 6,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            attackPower: 0.3,
            accuracy: 0.4,
            canUseSkills: false,
            struggleRate: 0.15
        },
        onTick: (target: Actor) => {
            const mpLoss = Math.min(target.mp, 3);
            if (mpLoss > 0) {
                target.loseMp(mpLoss);
            }
        },
        messages: {
            onApplyPlayer: '{name}は群れの一員になる夢を見はじめた...',
            onTickPlayer: 'ふわふわした仲間意識が広がり、戦う理由が薄れていく...',
            onRemovePlayer: '{name}は同族化のまどろみから目を覚ました'
        }
    }
];
