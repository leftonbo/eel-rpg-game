import { StatusEffectType, StatusEffectConfig } from '../StatusEffectTypes';
import { Actor } from '../../entities/Actor';

export const fluffyDragonEffectsConfigs = new Map<StatusEffectType, StatusEffectConfig>([
    [StatusEffectType.FluffyWrap, {
        type: StatusEffectType.FluffyWrap,
        name: 'ふわふわ包み',
        description: 'ふわふわの体毛に包まれて身動きが取りづらく、心地よい眠気に襲われる',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            struggleRate: 0.7, // 拘束脱出率を30%減少
            accuracy: 0.9, // 命中率を10%減少
        },
        onApply: (_target: Actor) => {
            // 適用時の処理（必要に応じて）
        },
        onTick: (target: Actor, _effect) => {
            // 毎ターンの処理：眠気によるMP減少
            if (target.mp > 0) {
                const mpDrain = Math.min(2, target.mp);
                target.mp -= mpDrain;
            }
        },
        onRemove: (_target: Actor) => {
            // 除去時の処理（必要に応じて）
        },
        messages: {
            onApplyPlayer: 'ふわふわの体毛に包まれ、心地よい感触で身動きが取りづらくなった...',
            onApplyBoss: 'ふわふわの体毛に包まれた',
            onTickPlayer: 'ふわふわの温もりで眠気が増し、集中力が削がれる...',
            onTickBoss: 'ふわふわの効果で動きが鈍っている',
            onRemovePlayer: 'ふわふわの包みから解放された',
            onRemoveBoss: 'ふわふわの効果が消えた'
        }
    }],

    [StatusEffectType.LavendasCent, {
        type: StatusEffectType.LavendasCent,
        name: 'ラベンダーの香り',
        description: '甘いラベンダーの香りで持続的に眠気に襲われる',
        duration: 5,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            accuracy: 0.85, // 命中率を15%減少
            actionPriority: 'normal-action' as any,
        },
        onApply: (_target: Actor) => {
            // 適用時の処理
        },
        onTick: (target: Actor, _effect) => {
            // 毎ターンの処理：持続的なMP減少と軽微なHP減少
            if (target.mp > 0) {
                const mpDrain = Math.min(1, target.mp);
                target.mp -= mpDrain;
            }
            
            // 眠気による軽微なダメージ（集中力の欠如）
            const damage = Math.max(1, Math.floor(target.maxHp * 0.005)); // 最大HPの0.5%
            target.hp = Math.max(0, target.hp - damage);
        },
        onRemove: (_target: Actor) => {
            // 除去時の処理
        },
        messages: {
            onApplyPlayer: 'ラベンダーの甘い香りに包まれ、ほんのり眠気を感じ始める...',
            onApplyBoss: 'ラベンダーの香りの影響を受けている',
            onTickPlayer: 'ラベンダーの香りで意識がぼんやりしてくる...',
            onTickBoss: 'ラベンダーの香りで動きが鈍っている',
            onRemovePlayer: 'ラベンダーの香りが薄れ、意識がはっきりしてきた',
            onRemoveBoss: 'ラベンダーの香りの効果が消えた'
        }
    }],

    [StatusEffectType.DreamShare, {
        type: StatusEffectType.DreamShare,
        name: '夢の共有',
        description: 'ドラゴンの睡眠を肩代わりし、恐ろしい夢を見続ける特殊な状態',
        duration: 99, // 実質永続（戦闘終了まで）
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            canAct: false, // 行動不能
            damageReceived: 1.2, // 受けるダメージが20%増加
            actionPriority: 'cannot-act' as any,
        },
        onApply: (_target: Actor) => {
            // 適用時の処理
        },
        onTick: (target: Actor, _effect) => {
            // 毎ターンの処理：恐ろしい夢によるダメージ
            const damage = Math.max(3, Math.floor(target.maxHp * 0.02)); // 最大HPの2%
            target.hp = Math.max(0, target.hp - damage);
            
            // MPも継続的に減少
            if (target.mp > 0) {
                const mpDrain = Math.min(3, target.mp);
                target.mp -= mpDrain;
            }
        },
        onRemove: (_target: Actor) => {
            // 除去時の処理
        },
        messages: {
            onApplyPlayer: 'ドラゴンの睡眠を肩代わりすることになり、恐ろしい夢の世界に引き込まれる...',
            onApplyBoss: '夢の共有状態になった',
            onTickPlayer: '夢の中で何度も食べられる恐怖を体験し、精神的ダメージを受ける...',
            onTickBoss: '夢の共有により影響を受けている',
            onRemovePlayer: '恐ろしい夢から解放され、現実に戻ってきた',
            onRemoveBoss: '夢の共有状態が解除された'
        }
    }]
]);