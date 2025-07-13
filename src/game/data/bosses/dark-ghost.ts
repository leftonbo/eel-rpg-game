import { BossData, ActionType, BossAction } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffect';

const darkGhostActions: BossAction[] = [
    {
        type: ActionType.Attack,
        name: '影の爪',
        description: '闇から現れる爪で攻撃',
        damage: 4,
        hitRate: 0.95,
        weight: 20,
        playerStateCondition: 'normal'
    },
    {
        type: ActionType.StatusAttack,
        name: '魅惑の囁き',
        description: '心を惑わす声で魅了する',
        damage: 2,
        hitRate: 0.95,
        statusEffect: StatusEffectType.Charm,
        weight: 30
    },
    {
        type: ActionType.StatusAttack,
        name: '毒の息',
        description: '有毒な息を吐く',
        damage: 3,
        hitRate: 0.95,
        statusEffect: StatusEffectType.Poison,
        weight: 25
    },
    {
        type: ActionType.StatusAttack,
        name: '鈍化の呪い',
        description: '動きを鈍らせる呪いをかける',
        damage: 2,
        hitRate: 0.95,
        statusEffect: StatusEffectType.Slow,
        weight: 20
    },
    {
        type: ActionType.RestraintAttack,
        name: '影の縛り',
        description: '影の触手で対象を拘束する',
        messages: ['<USER>は影の触手で<TARGET>を捕らえようとしてきた！'],
        weight: 15,
        hitRate: 0.9,
        canUse: (_boss, player, _turn) => {
            // Use restraint more often when player is charmed
            const baseChance = player.statusEffects.hasEffect(StatusEffectType.Charm) ? 0.6 : 0.3;
            return !player.isRestrained() && !player.isEaten() && Math.random() < baseChance;
        }
    },
    {
        type: ActionType.Attack,
        name: 'なめまわし',
        description: '拘束中の対象を影の舌でなめまわす（与えたダメージ分回復）',
        messages: ['<USER>は舌で<TARGET>をなめまわしてきた！'],
        damage: 6,
        weight: 30,
        playerStateCondition: 'restrained',
        healRatio: 1.0
    }
];

export const darkGhostData: BossData = {
    id: 'dark-ghost',
    name: 'DarkGhost',
    displayName: '👻 闇のおばけ',
    description: '獲物の魂を吸い取ろうとする邪悪なおばけ。状態異常攻撃を多用し、魅了で拘束からの脱出を困難にする。',
    maxHp: 300,
    attackPower: 12,
    actions: darkGhostActions,
    personality: [
        'ケケケ...いい魂の匂いがする',
        'その魂、いただくよ',
        '逃がすものか...',
        'もっと苦しめ...',
        'ふふふ...動けないね',
        'その絶望、美味しいよ'
    ],
    aiStrategy: (boss, player, turn) => {
        // Dark Ghost AI Strategy - Focus on status effects and talking
        
        // If player is eaten, devour them
        if (player.isEaten()) {
            return {
                type: ActionType.DevourAttack,
                name: '魂の吸収',
                description: '体内にいる獲物の魂を吸い取る',
                messages: ['<USER>は<TARGET>の魂を吸い取る！'],
                weight: 1
            };
        }
        
        // Strategic actions based on player state
        if (player.isKnockedOut()) {
            if (player.isRestrained()) {
                // Restrained + Knocked Out: 85% chance to eat
                if (Math.random() < 0.85) {
                    return {
                        type: ActionType.EatAttack,
                        name: '魂の摂取',
                        description: '魂を吸い取るために対象を丸呑みにする',
                        messages: ['<USER>は大きな口を開け、<TARGET>を吸い込む！'],
                        weight: 1
                    };
                }
            } else {
                // Normal + Knocked Out: 60% chance to restrain, 25% to eat directly
                const random = Math.random();
                if (random < 0.6) {
                    return {
                        type: ActionType.RestraintAttack,
                        name: '影の縛り',
                        description: '対象を影の触手で拘束する',
                        messages: ['<USER>は影の触手で<TARGET>を捕らえようとしてきた！'],
                        weight: 1
                    };
                } else if (random < 0.85) {
                    return {
                        type: ActionType.EatAttack,
                        name: '魂の摂取',
                        description: '魂を吸い取るために対象を丸呑みにする',
                        messages: ['<USER>は大きな口を開け、<TARGET>を吸い込む！'],
                        weight: 1
                    };
                }
            }
        }
        
        // Prioritize charm if player doesn't have it
        if (!player.statusEffects.hasEffect(StatusEffectType.Charm) && Math.random() < 0.5) {
            const charmAction = darkGhostActions.find(action => action.statusEffect === StatusEffectType.Charm);
            if (charmAction) {
                return charmAction;
            }
        }
        
        // Use restraint more often when player is charmed
        if (player.statusEffects.hasEffect(StatusEffectType.Charm) && !player.isRestrained() && !player.isEaten()) {
            const restraintAction = darkGhostActions.find(action => action.type === ActionType.RestraintAttack);
            if (restraintAction && Math.random() < 0.6) {
                return restraintAction;
            }
        }
        
        // Apply other status effects if not present
        const statusPriority = [StatusEffectType.Poison, StatusEffectType.Slow];
        for (const statusType of statusPriority) {
            if (!player.statusEffects.hasEffect(statusType) && Math.random() < 0.4) {
                const statusAction = darkGhostActions.find(action => action.statusEffect === statusType);
                if (statusAction) {
                    return statusAction;
                }
            }
        }
        
        // Default to weighted random selection
        const availableActions = darkGhostActions.filter(action => {
            if (action.canUse) {
                return action.canUse(boss, player, turn);
            }
            return true;
        });
        
        const totalWeight = availableActions.reduce((sum, action) => sum + action.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const action of availableActions) {
            random -= action.weight;
            if (random <= 0) {
                return action;
            }
        }
        
        return availableActions[0];
    }
};

// Add special dialogues for specific actions
darkGhostData.specialDialogues = new Map([
    ['触手拘束', '闇のおばけの触手がエルナルに絡みついた！'],
    ['触手なめ回し', '闇のおばけがエルナルの体を舐め回してきた...'],
    ['影の抱擁', '闇のおばけがエルナルを影で包み込んだ！'],
    ['魂吸収', '闇のおばけがエルナルの魂を吸収している...'],
    ['精神侵食', '闇のおばけがエルナルの精神を侵食している...'],
    ['悪夢注入', '闇のおばけがエルナルに悪夢を注入している...']
]);

// Override dialogue for talkative personality
darkGhostData.getDialogue = function(situation: 'battle-start' | 'player-restrained' | 'player-eaten' | 'player-escapes' | 'low-hp' | 'victory') {
    const dialogues: Record<string, string[]> = {
        'battle-start': [
            'ケケケ...なんて美しい魂だろう',
            'その魂、私にちょうだい',
            'フフフ...いい獲物が来たね',
            '魂の匂いが堪らないよ...'
        ],
        'player-restrained': [
            'ケケケ...動けないね？',
            'その絶望した顔、いいよ〜',
            'もがけばもがくほど美味しくなる',
            'フフフ...無駄な抵抗だよ',
            'その恐怖、とても美味しい'
        ],
        'player-eaten': [
            'ああ〜美味しい魂だ',
            'もっと味わわせておくれ',
            'この絶望...最高だよ',
            'ゆっくりと魂を吸い取ってあげる',
            'ケケケ...もう逃げられないよ'
        ],
        'player-escapes': [
            'ちっ！生意気な...',
            'まだまだ諦めないよ',
            'その程度では逃げられない',
            '今度こそ捕まえてやる',
            'フン...運が良かっただけだ'
        ],
        'low-hp': [
            'くっ...まだ負けない！',
            'この程度で倒れる私じゃない',
            '魂への渇望は止まらない！',
            'もっと...もっと魂が欲しい'
        ],
        'victory': [
            'ケケケ...美味しい魂をありがとう',
            'また新しい魂を探しに行こうかね',
            'フフフ...満足だよ'
        ]
    };
    
    const options = dialogues[situation] || dialogues['battle-start'];
    return options[Math.floor(Math.random() * options.length)];
};