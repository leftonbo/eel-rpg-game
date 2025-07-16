import { BossData, ActionType, BossAction } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffect';

const darkGhostActions: BossAction[] = [
    {
        type: ActionType.Attack,
        name: '影の爪',
        description: '闇から現れる爪で攻撃',
        damage: 10,
        hitRate: 0.95,
        weight: 20,
        playerStateCondition: 'normal'
    },
    {
        type: ActionType.StatusAttack,
        name: '魅惑の囁き',
        description: '心を惑わす声で魅了する',
        damage: 5,
        hitRate: 0.95,
        statusEffect: StatusEffectType.Charm,
        weight: 30
    },
    {
        type: ActionType.StatusAttack,
        name: '毒の息',
        description: '有毒な息を吐く',
        damage: 8,
        hitRate: 0.95,
        statusEffect: StatusEffectType.Poison,
        weight: 25
    },
    {
        type: ActionType.StatusAttack,
        name: '鈍化の呪い',
        description: '動きを鈍らせる呪いをかける',
        hitRate: 0.95,
        statusEffect: StatusEffectType.Slow,
        weight: 20
    },
    {
        type: ActionType.RestraintAttack,
        name: '影の縛り',
        description: '影の触手で対象を拘束する',
        messages: [
            '「もっとじっくり見たいナ！」',
            '<USER>は影の触手で<TARGET>を捕らえようとしてきた！'
        ],
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
        messages: [
            '「味見しちゃうヨ...」',
            '<USER>は舌で<TARGET>をなめまわしてきた！'
        ],
        damage: 16,
        weight: 30,
        playerStateCondition: 'restrained',
        healRatio: 1.0
    }
];

export const darkGhostData: BossData = {
    id: 'dark-ghost',
    name: 'DarkGhost',
    displayName: '👻 闇のおばけ',
    description: '漆黒の森に潜むおばけ',
    questNote: `漆黒の森に向かう冒険者たちが行方不明になっている。目撃情報によると、そこには奇妙な生命体が徘徊しているという…。あなたの任務はその生命体を調査し、討伐することだ。`,
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
                name: '魂の捕食',
                damage: 18,
                description: '体内にいる獲物の生命エネルギーを吸収する',
                messages: [
                    '「キミのタマシイ、おいしいネ...」',
                    '<USER>は<TARGET>の魂からエネルギーを吸い取っている...'
                ],
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
                        name: '魂の吸引',
                        description: '魂を吸い取るために対象を丸呑みにする',
                        messages: [
                            '「イタダキマース！」',
                            '<USER>は大きな口を開け、<TARGET>を吸い込む！'
                        ],
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
                        messages: [
                            '「もっとじっくり見たいナ！」',
                            '<USER>は影の触手で<TARGET>を捕らえようとしてきた！'
                        ],
                        weight: 1
                    };
                } else if (random < 0.85) {
                    return {
                        type: ActionType.EatAttack,
                        name: '魂の吸引',
                        description: '魂を吸い取るために対象を丸呑みにする',
                        messages: [
                            '「イタダキマース！」',
                            '<USER>は大きな口を開け、<TARGET>を吸い込む！'
                        ],
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

// Add finishing move for doomed player
darkGhostData.finishingMove = function() {
    return [
        '<USER>は<TARGET>の魂ごと吸い取り、<USER>の体に取り込む！',
        '<TARGET>の魂は<USER>の中に閉じ込められ、満足するまで生命エネルギーを吸われ続けることになった...'
    ];
};

// Override dialogue for talkative personality
darkGhostData.getDialogue = function(situation: 'battle-start' | 'player-restrained' | 'player-eaten' | 'player-escapes' | 'low-hp' | 'victory') {
    const dialogues: Record<string, string[]> = {
        'battle-start': [
            'ケケケ...おいしそうな魂だネ！',
            'そのタマシイ、ボクにちょうだい！',
        ],
        'player-restrained': [
            'ケケケ...動けないネ？',
            'その絶望した顔、かわいいヨ！',
            'もがけばもがくほど美味しくなるヨ',
            'フフフ...抵抗しても無駄ダヨ',
            'その恐怖、とても美味そうダネ！'
        ],
        'player-eaten': [
            '美味しいタマシイの味がするネ...',
            'キミのタマシイをいただくヨ',
            'ゆっくりと魂を吸い取ってあげるヨ',
            'ケケケ...もう逃げられないヨ'
        ],
        'player-escapes': [
            'まだまだ諦めないヨ',
            'その程度では逃げられないヨ',
            '今度こそ捕まえてあげるネ'
        ],
        'low-hp': [
        ],
        'victory': [
            'ケケケ...美味しいタマシイだったヨ',
            'ボクの中でゆっくりしていってネ'
        ]
    };
    
    const options = dialogues[situation] || dialogues['battle-start'];
    return options[Math.floor(Math.random() * options.length)];
};