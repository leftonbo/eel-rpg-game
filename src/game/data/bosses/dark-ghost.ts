import { BossData, ActionType, BossAction, Boss } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffectTypes';

const darkGhostActions: BossAction[] = [
    {
        type: ActionType.Attack,
        name: '影の爪',
        description: '闇から現れる爪で攻撃',
        damageFormula: (user: Boss) => user.attackPower * 0.8,
        hitRate: 0.95,
        weight: 20,
        playerStateCondition: 'normal'
    },
    {
        type: ActionType.StatusAttack,
        name: '魅惑の囁き',
        description: '心を惑わす声で魅了する',
        damageFormula: (user: Boss) => user.attackPower * 0.4,
        hitRate: 0.95,
        statusEffect: StatusEffectType.Charm,
        weight: 30
    },
    {
        type: ActionType.StatusAttack,
        name: '毒の息',
        description: '有毒な息を吐く',
        damageFormula: (user: Boss) => user.attackPower * 0.7,
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
        damageFormula: (user: Boss) => user.attackPower * 1.3,
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
    icon: '👻',
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

        // If player is defeated, use special post-defeat actions
        if (player.isDefeated()) {
            const postDefeatedActions: BossAction[] = [
                {
                    type: ActionType.PostDefeatedAttack,
                    name: '魂からのエネルギー吸収',
                    description: '魂だけになった獲物からエネルギーを吸い続ける',
                    messages: [
                        '「ケケケ...」',
                        '<USER>が<TARGET>の魂からエネルギーを吸い取っている...',
                        '<TARGET>の魂は<USER>の中で力を失っていく...'
                    ],
                    statusEffect: StatusEffectType.Exhausted,
                    weight: 1
                },
                {
                    type: ActionType.PostDefeatedAttack,
                    name: '魂の操縦',
                    description: '魂を操作して獲物を支配し続ける',
                    messages: [
                        '「フフフ...」',
                        '<USER>が<TARGET>の魂を操縦している...',
                        '<TARGET>の意識は<USER>に支配されている...'
                    ],
                    statusEffect: StatusEffectType.Charm,
                    weight: 1
                },
                {
                    type: ActionType.PostDefeatedAttack,
                    name: '魂の毒化',
                    description: '魂に毒を流し込み続ける',
                    messages: [
                        '「ケケケ...」',
                        '<USER>が<TARGET>の魂に毒を流し込んでいる...',
                        '<TARGET>の魂は徐々に汚染されていく...'
                    ],
                    statusEffect: StatusEffectType.Poison,
                    weight: 1
                },
                {
                    type: ActionType.PostDefeatedAttack,
                    name: '魂の鈍化',
                    description: '魂の動きを鈍らせ続ける',
                    messages: [
                        '「フフフ...」',
                        '<USER>が<TARGET>の魂の動きを鈍らせている...',
                        '<TARGET>の魂は重く沈んでいく...'
                    ],
                    statusEffect: StatusEffectType.Slow,
                    weight: 1
                },
                {
                    type: ActionType.PostDefeatedAttack,
                    name: '魂の監視',
                    description: '魂を監視し続けて逃げられないようにする',
                    messages: [
                        '「ケケケ...」',
                        '<USER>が<TARGET>の魂を監視している...',
                        '<TARGET>の魂は<USER>の視線から逃れられない...'
                    ],
                    statusEffect: StatusEffectType.Paralysis,
                    weight: 1
                }
            ];
            return postDefeatedActions[Math.floor(Math.random() * postDefeatedActions.length)];
        }
        
        // If player is eaten, use various psychological attacks to weaken soul resistance
        if (player.isEaten()) {
            const eatenActions: BossAction[] = [
                {
                    type: ActionType.DevourAttack,
                    name: '魂の捕食',
                    damageFormula: (user: Boss) => user.attackPower * 1.5,
                    description: '体内にいる獲物の生命エネルギーを吸収する',
                    messages: [
                        '「キミのタマシイ、おいしいネ...」',
                        '<USER>は<TARGET>の魂からエネルギーを吸い取っている...'
                    ],
                    weight: 30
                },
                {
                    type: ActionType.DevourAttack,
                    name: '恐怖の注入',
                    damageFormula: (user: Boss) => user.attackPower * 1.0,
                    description: '恐怖を心に注ぎ込み魂の抵抗力を削ぐ',
                    messages: [
                        '「怖がれば怖がるほど美味しくなるヨ...」',
                        '<USER>は<TARGET>の心に恐怖を注ぎ込んでいる...',
                        '<TARGET>は得体の知れない恐怖に包まれた！'
                    ],
                    statusEffect: StatusEffectType.Paralysis,
                    weight: 25
                },
                {
                    type: ActionType.DevourAttack,
                    name: '絶望の囁き',
                    damageFormula: (user: Boss) => user.attackPower * 0.8,
                    description: '絶望的な言葉で心を折り魂を弱らせる',
                    messages: [
                        '「もう誰も助けに来ないヨ...」',
                        '<USER>が<TARGET>の心に絶望を囁いている...',
                        '<TARGET>は深い絶望に沈んでいく...'
                    ],
                    statusEffect: StatusEffectType.Exhausted,
                    weight: 20
                },
                {
                    type: ActionType.DevourAttack,
                    name: '記憶の侵食',
                    damageFormula: (user: Boss) => user.attackPower * 0.6,
                    description: '大切な記憶を蝕み精神的支柱を奪う',
                    messages: [
                        '「大切な記憶、消してあげるネ...」',
                        '<USER>が<TARGET>の記憶を侵食している...',
                        '<TARGET>の大切な思い出が薄れていく...'
                    ],
                    statusEffect: StatusEffectType.Charm,
                    weight: 15
                },
                {
                    type: ActionType.DevourAttack,
                    name: '悪夢の投影',
                    damageFormula: (user: Boss) => user.attackPower * 1.2,
                    description: '最悪の悪夢を見せて精神を混乱させる',
                    messages: [
                        '「キミの一番嫌な夢を見せてあげるヨ...」',
                        '<USER>が<TARGET>に悪夢を投影している...',
                        '<TARGET>は恐ろしい悪夢に囚われた！'
                    ],
                    statusEffect: StatusEffectType.Poison,
                    weight: 10
                }
            ];
            
            // Weighted random selection from eaten actions
            const totalWeight = eatenActions.reduce((sum, action) => sum + action.weight, 0);
            let random = Math.random() * totalWeight;
            
            for (const action of eatenActions) {
                random -= action.weight;
                if (random <= 0) {
                    return action;
                }
            }
            
            return eatenActions[0];
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