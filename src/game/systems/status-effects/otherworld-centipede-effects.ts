import { Actor } from '@/game/entities/Actor';
import { StatusEffectType, StatusEffectConfig, StatusEffect } from '../StatusEffectTypes';

export const otherworldCentipedeEffectsConfigs: StatusEffectConfig[] = [
    {
        type: StatusEffectType.CentipedeSlime,
        name: 'ネバネバ',
        description: '異界のムカデの粘液で体がねばねばになり、拘束から脱出しにくくなる',
        duration: 4,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            struggleRate: 0.15,
            accuracy: 0.9
        },
        messages: {
            onApplyPlayer: '{name}の体が異界のムカデの粘液でねばねばになった！拘束から抜け出しにくくなる…',
            onApplyBoss: '{name}の体が粘液まみれになった！',
            onRemovePlayer: '{name}の体についた粘液がようやく乾いて剥がれた',
            onRemoveBoss: '{name}の体の粘液が乾いた'
        }
    },
    {
        type: StatusEffectType.CentipedePoison,
        name: 'ムカデ毒',
        description: '異界のムカデの毒が体内に回り、毎ターン微量のダメージを与える。浸かりすぎると病みつきになる…',
        duration: 5,
        category: 'debuff',
        isDebuff: true,
        stackable: true,
        onTick: (target: Actor, _effect: StatusEffect) => {
            target.takeDamage(2);
        },
        messages: {
            onApplyPlayer: '{name}に異界のムカデの毒が回ってきた！毎ターンじわじわとダメージを受ける…',
            onApplyBoss: '{name}に毒が回った！',
            onTickPlayer: '{name}はムカデ毒により{damage}のダメージを受けた！',
            onTickBoss: '{name}はムカデ毒により{damage}のダメージを受けた！',
            onRemovePlayer: '{name}の体内からムカデ毒が薄れていった',
            onRemoveBoss: '{name}の体内から毒が抜けた'
        }
    }
];
