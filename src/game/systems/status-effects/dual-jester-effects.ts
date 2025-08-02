import { StatusEffectType, StatusEffectConfig } from '../StatusEffectTypes';
import { Actor } from '../../entities/Actor';

export const dualJesterEffectsConfigs = new Map<StatusEffectType, StatusEffectConfig>([
    [StatusEffectType.FalseSecurity, {
        type: StatusEffectType.FalseSecurity,
        name: '偽りの安心',
        description: '道化師の演技に騙され、危険察知能力が大幅に低下。命中率-30%、被ダメージ+25%',
        duration: 2,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            accuracy: 0.7, // 命中率低下
            damageReceived: 1.25 // 被ダメージ増加
        },
        messages: {
            onApplyPlayer: '{name}は偽りの安心感に包まれ、油断してしまった...',
            onTickPlayer: '危険が近づいているのに気づかない...',
            onRemovePlayer: '{name}は現実の危険に気づいた！'
        }
    }],
    
    [StatusEffectType.Manic, {
        type: StatusEffectType.Manic,
        name: '躁状態',
        description: '躁状態により攻撃力+50%だが、防御力-30%・命中率-20%。時々自傷や状態変化が発生',
        duration: 4,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            attackPower: 1.5, // 攻撃力上昇
            damageReceived: 1.3, // 防御力低下
            accuracy: 0.8 // 命中率低下
        },
        onTick: (target: Actor) => {
            // 15%の確率でBipolarに変化（確率調整）
            if (Math.random() < 0.15) {
                target.statusEffects.removeEffect(StatusEffectType.Manic);
                // 正しい呼び出し方法を使用
                target.statusEffects.addEffect(StatusEffectType.Bipolar, 3);
            }
            // 8%の確率で自分を攻撃（確率調整）
            if (Math.random() < 0.08) {
                const selfDamage = Math.floor(target.maxHp * 0.03); // ダメージ軽減
                target.takeDamage(selfDamage);
            }
        },
        messages: {
            onApplyPlayer: '{name}は躁状態に陥り、行動が不安定になった！',
            onTickPlayer: '躁状態で感情が激しく揺れ動いている...',
            onRemovePlayer: '{name}の感情が落ち着いた'
        }
    }],
    
    [StatusEffectType.Bipolar, {
        type: StatusEffectType.Bipolar,
        name: '双極効果',
        description: '双面の狂気により感覚が混乱。毒や火だるまが回復効果に変化することがある（命中率-25%）',
        duration: 3,
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
            onApplyPlayer: '{name}は双極効果に陥り、全ての感覚が混乱した！',
            onTickPlayer: '状態異常の効果が予測不能に変化している...',
            onRemovePlayer: '{name}の感覚が正常に戻った'
        }
    }]
]);