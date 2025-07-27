import { StatusEffectType, StatusEffectConfig } from '../StatusEffectTypes';
import { Actor } from '../../entities/Actor';
import { Player } from '../../entities/Player';

export const fluffyDragonEffectsConfigs = new Map<StatusEffectType, StatusEffectConfig>([
    [StatusEffectType.Sleepy, {
        type: StatusEffectType.Sleepy,
        name: '眠気',
        description: 'MP回復率と拘束脱出率が減少し、眠りに落ちやすくなる',
        duration: 5,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            struggleRate: 0.7, // 拘束脱出率30%減少
        },
        onApply: (target: Actor) => {
            // MP回復率減少効果を適用
            if (target instanceof Player) {
                // プレイヤーのMP回復を減少させる処理
                // この効果は Player クラスで実装される想定
            }
        },
        onTick: (_target: Actor, _effect) => {
            // 毎ターンの効果は特になし（MP回復率減少は passive効果）
        },
        onRemove: (target: Actor) => {
            // 効果解除時の処理
            if (target instanceof Player) {
                // MP回復率を元に戻す処理
            }
        },
        messages: {
            onApplyPlayer: '{name}は眠気に襲われた...',
            onApplyBoss: '{name}は眠気に襲われた...',
            onRemovePlayer: '{name}の眠気が覚めた',
            onRemoveBoss: '{name}の眠気が覚めた',
            onTickPlayer: '', // ダメージなしなので空文字
            onTickBoss: ''
        }
    }]
]);