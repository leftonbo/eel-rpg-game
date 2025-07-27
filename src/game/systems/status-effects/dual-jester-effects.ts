import { StatusEffectType, StatusEffectConfig } from '../StatusEffectTypes';
import { Actor } from '../../entities/Actor';

export const dualJesterEffectsConfigs = new Map<StatusEffectType, StatusEffectConfig>([
    [StatusEffectType.FalseSecurity, {
        type: StatusEffectType.FalseSecurity,
        name: '偽りの安心',
        description: '危険察知能力が大幅に低下し、敵の攻撃予告が見えなくなる',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            accuracy: 0.7, // 命中率低下
            damageReceived: 1.25 // 被ダメージ増加
        },
        messages: {
            onApplyPlayer: '{target}は偽りの安心感に包まれ、油断してしまった...',
            onTickPlayer: '危険が近づいているのに気づかない...',
            onRemovePlayer: '{target}は現実の危険に気づいた！'
        }
    }],
    
    [StatusEffectType.Manic, {
        type: StatusEffectType.Manic,
        name: '躁状態',
        description: '攻撃力が上昇するが防御力と命中率が低下し、行動が予測不能になる',
        duration: 4,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            attackPower: 1.5, // 攻撃力上昇
            damageReceived: 1.3, // 防御力低下
            accuracy: 0.8 // 命中率低下
        },
        onTick: (target: Actor) => {
            // 20%の確率でBipolarに変化
            if (Math.random() < 0.20) {
                target.statusEffects.removeEffect(StatusEffectType.Manic);
                target.statusEffects.addEffect({
                    type: StatusEffectType.Bipolar,
                    duration: 3,
                    name: '双極効果',
                    description: '全ての状態異常の効果がランダムで正反対になる'
                });
            }
            // 10%の確率で自分を攻撃
            if (Math.random() < 0.10) {
                const selfDamage = Math.floor(target.maxHp * 0.05);
                target.takeDamage(selfDamage, null);
            }
        },
        messages: {
            onApplyPlayer: '{target}は躁状態に陥り、行動が不安定になった！',
            onTickPlayer: '躁状態で感情が激しく揺れ動いている...',
            onRemovePlayer: '{target}の感情が落ち着いた'
        }
    }],
    
    [StatusEffectType.Bipolar, {
        type: StatusEffectType.Bipolar,
        name: '双極効果',
        description: '全ての状態異常の効果がランダムで正反対に変化する混乱状態',
        duration: 5,
        category: 'debuff',
        isDebuff: true,
        onTick: (target: Actor) => {
            // 状態異常の効果を反転させる（実装は複雑なので基本的なダメージのみ）
            const allEffects = target.statusEffects.getAllEffects();
            const otherEffects = allEffects.filter(effect => effect.type !== StatusEffectType.Bipolar);
            
            if (otherEffects.length > 0 && Math.random() < 0.30) {
                // 30%の確率で他の状態異常の効果を反転
                const randomEffect = otherEffects[Math.floor(Math.random() * otherEffects.length)];
                
                // 毒→回復、麻痺→素早さ上昇の効果をシミュレート
                if (randomEffect.type === StatusEffectType.Poison) {
                    // 毒ダメージの代わりに回復
                    const healAmount = Math.floor(target.maxHp * 0.03);
                    target.heal(healAmount);
                } else if (randomEffect.type === StatusEffectType.Fire) {
                    // 火だるまダメージの代わりに回復
                    const healAmount = Math.floor(target.maxHp * 0.05);
                    target.heal(healAmount);
                }
            }
        },
        modifiers: {
            accuracy: 0.75, // 混乱による命中率低下
        },
        messages: {
            onApplyPlayer: '{target}は双極効果に陥り、全ての感覚が混乱した！',
            onTickPlayer: '状態異常の効果が予測不能に変化している...',
            onRemovePlayer: '{target}の感覚が正常に戻った'
        }
    }]
]);