import { StatusEffectConfig, StatusEffectType } from '../StatusEffectTypes';

// 魂喰いの死神 (mascot-death) 専用の状態異常
export const mascotDeathEffectsConfigs: StatusEffectConfig[] = [
    {
        type: StatusEffectType.SoulCurse,
        name: '魂の呪い',
        description: '闇魔法によって魂と体の結びつきが緩み、力が入らない',
        duration: 4,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            attackPower: 0.8,
            accuracy: 0.9
        },
        messages: {
            onApplyPlayer: '{name}の体に闇の魔力が染み込み、魂と体の結びつきが緩んでいく...',
            onTickPlayer: '{name}の体から、ふわふわと力が抜けていく...',
            onRemovePlayer: '{name}の魂が体にしっかりと馴染み直した'
        }
    },
    {
        type: StatusEffectType.ScytheStance,
        name: '死神の構え',
        description: '死神が大鎌を高々と振り上げている。次のターン、防御しなければ魂を刈り取られてしまう！',
        duration: -1,
        category: 'neutral',
        isDebuff: false,
        messages: {
            onApplyPlayer: '',
            onApplyBoss: '',
            onTickPlayer: '',
            onTickBoss: '',
            onRemovePlayer: '',
            onRemoveBoss: ''
        }
    },
    {
        type: StatusEffectType.SoulForm,
        name: '魂状態',
        description: '魂が体から刈り取られてしまった。半透明でふわふわした魂の姿では、力がうまく入らない',
        duration: -1,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            attackPower: 0.7,
            struggleRate: 0.8
        },
        messages: {
            onApplyPlayer: '{name}の魂が、ぽんっと体から抜け出してしまった！',
            onTickPlayer: '{name}の魂は、ふわふわと頼りなく揺れている...',
            onRemovePlayer: '{name}の魂は、すうっと元の体に戻っていった！'
        }
    }
];
