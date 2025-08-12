import { Actor } from '@/game/entities/Actor';
import { StatusEffectType, StatusEffectConfig, StatusEffect } from '../StatusEffectTypes';

export const seraphMascotEffectsConfigs: StatusEffectConfig[] = [
    {
        type: StatusEffectType.Blessed,
        name: '祝福',
        description: 'ダメージが2倍になるが、状態異常に対する耐性が向上する',
        duration: 15,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            damageReceived: 2.0,       // ダメージ2倍
            struggleRate: 1.3,         // もがく成功率向上
            debuffChanceModifier: 0.5  // 状態異常発生率半減
        },
        messages: {
            onApplyPlayer: '神聖な光に包まれ、祝福を受けた！',
            onRemovePlayer: '祝福の効果が薄れていく...',
            onTickPlayer: '祝福の光が{name}を包み込んでいる'
        }
    },
    {
        type: StatusEffectType.HolySlimed,
        name: '神聖粘液まみれ',
        description: '攻撃力が低下、拘束解除の成功率が大きく低下',
        duration: 4,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            attackPower: 0.7,
            struggleRate: 0.4
        },
        messages: {
            onApplyPlayer: '{name}は神聖な粘液にまみれた！',
            onApplyBoss: '{name}は神聖な粘液にまみれた！',
            onRemovePlayer: '{name}の粘液が抜けた',
            onRemoveBoss: '{name}の粘液が抜けた'
        }
    },
    {
        type: StatusEffectType.Overwhelmed,
        name: '圧倒',
        description: '巨大すぎる存在感に圧倒され、命中率と行動精度が大幅に低下する',
        duration: 12,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            accuracy: 0.4,        // 命中率大幅低下
            attackPower: 0.7,     // 攻撃力低下
            struggleRate: 0.5     // もがく成功率低下
        },
        messages: {
            onApplyPlayer: '巨大すぎる存在感に圧倒されてしまった！',
            onRemovePlayer: '圧倒感から立ち直った',
            onTickPlayer: '{name}は圧倒的な存在感に萎縮している...'
        }
    },
    {
        type: StatusEffectType.SalvationState,
        name: '救済状態',
        description: '救済の準備が整った状態。行動が制限されるが、完全な救済を受ける準備ができている',
        duration: 6,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            canAct: false,        // 行動不能
            canUseSkills: false,  // スキル使用不可
            struggleRate: 0.2,    // もがく成功率大幅低下
            hpRegenerateRate: 0.0 // 毎ターンHP回復効果無効化
        },
        onApply: (_target: Actor) => {
            // 救済状態では、HP回復効果が無効化される
            // （救済の過程で生命力が変化するため）
        },
        onTick: (target: Actor, _effect: StatusEffect) => {
            // 救済状態中は微量のHP吸収が継続的に発生
            const salvationDrain = Math.min(target.hp, 1);
            if (salvationDrain > 0 && target.hp > 1) {
                target.takeDamage(salvationDrain);
            }
        },
        messages: {
            onApplyPlayer: '救済の準備が整った...もう逃れることはできない',
            onRemovePlayer: '救済状態から解放された',
            onTickPlayer: '{name}は救済の力に包まれ、身動きが取れない...'
        }
    }
];