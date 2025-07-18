import { StatusEffectType, StatusEffectConfig } from '../StatusEffectTypes';

export const battleEffectsConfigs: Map<StatusEffectType, StatusEffectConfig> = new Map([
    [StatusEffectType.Defending, {
        type: StatusEffectType.Defending,
        name: '防御',
        description: '次のターンのダメージを半減',
        duration: 1,
        category: 'buff',
        isDebuff: false,
        modifiers: {
            damageReceived: 0.5
        }
    }],
    [StatusEffectType.Stunned, {
        type: StatusEffectType.Stunned,
        name: '気絶',
        description: '行動できない',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            canAct: false
        }
    }],
    [StatusEffectType.Fire, {
        type: StatusEffectType.Fire,
        name: '火だるま',
        description: '毎ターンHPが8減少',
        duration: 2,
        category: 'debuff',
        isDebuff: true,
        onTick: (target: any, _effect: any) => {
            target.takeDamage(8);
        }
    }],
    [StatusEffectType.Charm, {
        type: StatusEffectType.Charm,
        name: '魅了',
        description: 'もがくの成功率が低下',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            struggleRate: 0.5
        }
    }],
    [StatusEffectType.Slow, {
        type: StatusEffectType.Slow,
        name: '鈍足',
        description: '攻撃力が半減',
        duration: 2,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            attackPower: 0.5
        }
    }],
    [StatusEffectType.Poison, {
        type: StatusEffectType.Poison,
        name: '毒',
        description: '毎ターンHPが3減少',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        onTick: (target: any, _effect: any) => {
            target.takeDamage(3);
        }
    }],
    [StatusEffectType.Invincible, {
        type: StatusEffectType.Invincible,
        name: '無敵',
        description: 'すべての攻撃を回避する',
        duration: 3,
        category: 'buff',
        isDebuff: false,
        modifiers: {
            damageReceived: 0
        }
    }],
    [StatusEffectType.Energized, {
        type: StatusEffectType.Energized,
        name: '元気満々',
        description: 'MPが常に満タン',
        duration: 3,
        category: 'buff',
        isDebuff: false,
        onTick: (target: any, _effect: any) => {
            target.mp = target.maxMp;
        }
    }],
    [StatusEffectType.Slimed, {
        type: StatusEffectType.Slimed,
        name: '粘液まみれ',
        description: '拘束解除の成功率が半減',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            struggleRate: 0.5
        }
    }],
    [StatusEffectType.Sleep, {
        type: StatusEffectType.Sleep,
        name: '睡眠',
        description: '完全に眠っており行動不能',
        duration: 10,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            canAct: false
        }
    }],
    [StatusEffectType.DreamControl, {
        type: StatusEffectType.DreamControl,
        name: '夢操作',
        description: '夢の世界に閉じ込められ、完全に支配されている',
        duration: -1, // Permanent while sleeping
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            canAct: false,
            canUseSkills: false
        }
    }],
    
    // Scorpion Carrier status effects
    [StatusEffectType.Anesthesia, {
        type: StatusEffectType.Anesthesia,
        name: '麻酔',
        description: '麻酔により行動不能',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            canAct: false
        }
    }],
    [StatusEffectType.ScorpionPoison, {
        type: StatusEffectType.ScorpionPoison,
        name: 'サソリ毒',
        description: '毎ターン最大HPの1/10のダメージを受ける',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        onTick: (target: any, _effect: any) => {
            const damage = Math.floor(target.maxHp / 10);
            target.takeDamage(damage);
        }
    }],
    [StatusEffectType.Weakening, {
        type: StatusEffectType.Weakening,
        name: '脱力剤',
        description: '体力が奪われ、受けるダメージが1.5倍になる',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            damageReceived: 1.5
        }
    }],
    
    // Mikan Dragon status effects
    [StatusEffectType.Lethargy, {
        type: StatusEffectType.Lethargy,
        name: '脱力',
        description: '体に力が入らず、攻撃力が大幅に低下',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            attackPower: 0.3
        }
    }],
    
    // Sea Kraken status effects
    [StatusEffectType.VisionImpairment, {
        type: StatusEffectType.VisionImpairment,
        name: '視界阻害',
        description: 'イカスミで視界が阻害され、攻撃の命中率が低下',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            accuracy: 0.7 // Reduces accuracy to 70% of its original value
        }
    }],
    
    // Aqua Serpent status effects
    [StatusEffectType.WaterSoaked, {
        type: StatusEffectType.WaterSoaked,
        name: '水浸し',
        description: '水で濡れて防御力が低下',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            damageReceived: 1.3 // Increases damage received by 30%
        }
    }],
    [StatusEffectType.Dizzy, {
        type: StatusEffectType.Dizzy,
        name: '目眩',
        description: 'ふらつきで攻撃の命中率が低下',
        duration: 2,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            accuracy: 0.8 // Reduces accuracy to 80% of its original value
        }
    }],
    
    // Clean Master status effects
    [StatusEffectType.Soapy, {
        type: StatusEffectType.Soapy,
        name: '泡まみれ',
        description: '石鹸の泡で滑りやすくなり、命中率が低下',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            accuracy: 0.7, // Reduces accuracy to 70%
            struggleRate: 0.8 // Slightly harder to struggle
        }
    }],
    [StatusEffectType.Spinning, {
        type: StatusEffectType.Spinning,
        name: '回転中',
        description: '遠心分離で回転し、命中率が大幅低下',
        duration: 2,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            accuracy: 0.5, // Reduces accuracy to 50%
            canAct: false // Cannot act during first turn
        }
    }],
    [StatusEffectType.Steamy, {
        type: StatusEffectType.Steamy,
        name: '蒸し暑い',
        description: '温風で蒸し暑くなり、毎ターン軽微ダメージ',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        onTick: (target: any, _effect: any) => {
            target.takeDamage(4);
        }
    }]
]);