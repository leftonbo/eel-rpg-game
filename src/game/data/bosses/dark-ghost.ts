import { BossData, ActionType, BossAction, Boss } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffectTypes';

// Dark Ghost
// Reference document: /docs/bosses/dark-ghost.md

const darkGhostActions: BossAction[] = [
    {
        id: 'shadow-claw',
        type: ActionType.Attack,
        name: '影の爪',
        description: '闇から現れる爪で攻撃',
        damageFormula: (user: Boss) => user.attackPower * 0.8,
        hitRate: 0.95,
        weight: 20,
        playerStateCondition: 'normal'
    },
    {
        id: 'charming-whisper',
        type: ActionType.StatusAttack,
        name: '魅惑の囁き',
        description: '心を惑わす声で魅了する',
        damageFormula: (user: Boss) => user.attackPower * 0.4,
        hitRate: 0.95,
        statusEffect: StatusEffectType.Charm,
        weight: 30
    },
    {
        id: 'poison-breath',
        type: ActionType.StatusAttack,
        name: '毒の息',
        description: '有毒な息を吐く',
        damageFormula: (user: Boss) => user.attackPower * 0.7,
        hitRate: 0.95,
        statusEffect: StatusEffectType.Poison,
        weight: 25
    },
    {
        id: 'slow-curse',
        type: ActionType.StatusAttack,
        name: '鈍化の呪い',
        description: '動きを鈍らせる呪いをかける',
        hitRate: 0.95,
        statusEffect: StatusEffectType.Slow,
        weight: 20
    },
    {
        id: 'shadow-bind',
        type: ActionType.RestraintAttack,
        name: '影の縛り',
        description: '影の触手で対象を拘束する',
        messages: [
            '「もっとじっくり見たいナ！」',
            '{boss}は影の触手で{player}を捕らえようとしてきた！'
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
        id: 'tongue-lick',
        type: ActionType.Attack,
        name: 'なめまわし',
        description: '拘束中の対象を影の舌でなめまわす（与えたダメージ分回復）',
        messages: [
            '「味見しちゃうヨ...」',
            '{boss}は舌で{player}をなめまわしてきた！'
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
    displayName: '闇のおばけ',
    description: '漆黒の森に潜むおばけ',
    questNote: `漆黒の森に向かう冒険者たちが行方不明になっている。目撃情報によると、そこには奇妙な生命体が徘徊しているという…。あなたの任務はその生命体を調査し、討伐することだ。`,
    appearanceNote: '漆黒の羽、暗紫色の布を被った幽霊のような体、球体、浮遊、赤い目、陽気な笑顔、影の触手、紫の舌',
    maxHp: 250,
    attackPower: 18,
    actions: darkGhostActions,
    icon: '👻',
    explorerLevelRequired: 0,
    battleStartMessages: [
        {
            speaker: 'player',
            style: 'default',
            text: 'あなたは漆黒の森で不気味なスピリット体と遭遇した。'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「ケケケ...おいしそうな魂だネ！」'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: '闇のおばけは赤く光る目でこちらを見つめ、陽気に笑っている...'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「そのタマシイ、ボクにちょうだい！キミの絶望、とても美味そうダネ！」'
        }
    ],
    victoryMessages: [
        {
            speaker: 'boss',
            style: 'talk',
            text: '「ケケケ...まさかボクが負けるなんて...」'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「でも、キミの魂の味は忘れないヨ...また会えるといいネ」'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: '闇のおばけは最後まで陽気に笑いながら、漆黒の森の闇に溶けて消えていった...'
        }
    ],
    victoryTrophy: {
        name: '闇夜の羽根',
        description: '闇のおばけが纏っていた神秘的な黒い羽根。触れると仄かに冷たく、夜闇の力が込められている。'
    },
    defeatTrophy: {
        name: '影のエッセンス',
        description: '闇のおばけの体内で生成される、獲物の魂を閉じ込めるための人魂型のエッセンス。この世ならざる闇の力を秘めた貴重な物質。'
    },
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
            const defeatStartTurn = boss.getCustomVariable<number>('defeatStartTurn', -1);
            
            // If this is the first turn player is defeated, record it
            if (defeatStartTurn === -1) {
                boss.setCustomVariable('defeatStartTurn', turn);
            }

            // Every 8 turns since defeat started
            const turnsSinceDefeat = turn - boss.getCustomVariable<number>('defeatStartTurn', turn);
            if (turnsSinceDefeat > 0 && turnsSinceDefeat % 8 === 0) {
                const postDefeatedSpecialAction: BossAction = {
                    id: 'soul-licking',
                    type: ActionType.PostDefeatedAttack,
                    name: '魂のなめまわし',
                    description: '体内の魂を直接なめまわして弱らせる',
                    messages: [
                        '「特別なプレゼントだヨ...」',
                        '{boss}が突然自分のお腹を舐め回す...',
                        'すると、{player}の魂の眼の前に突然巨大な舌が現れ、圧倒するように舐め回し始める！',
                        '「その苦しむ姿、とても美味しいネ...」',
                        '{player}はそのまま激しく舐め回され、魂の抵抗力が弱まっていく...',
                        '「ボクのキモチ、沢山うけとってネ...」',
                        '{boss}の舌から粘液がどっぷりと流れ、様々な呪いが{player}に染み込んだ！',
                        '{player}の魂は抵抗することができず、{boss}の意のままにされてしまう...'
                    ],
                    onUse: (_boss, player, _turn) => {
                        player.statusEffects.addEffect(StatusEffectType.Slimed);
                        player.statusEffects.addEffect(StatusEffectType.Charm);
                        player.statusEffects.addEffect(StatusEffectType.Weakness);
                        player.statusEffects.addEffect(StatusEffectType.Poison);
                        player.statusEffects.addEffect(StatusEffectType.Paralysis);
                        player.statusEffects.addEffect(StatusEffectType.Slow);
                        player.statusEffects.addEffect(StatusEffectType.Fear);
                        player.statusEffects.addEffect(StatusEffectType.Oblivion);
                        
                        return [];
                    },
                    weight: 1
                };
                
                return postDefeatedSpecialAction;
            }
            
            const postDefeatedActions: BossAction[] = [
                {
                    id: 'soul-energy-drain',
                    type: ActionType.PostDefeatedAttack,
                    name: '魂からのエネルギー吸収',
                    description: '魂だけになった獲物からエネルギーを吸い続ける',
                    messages: [
                        '「ケケケ...」',
                        '{boss}が{player}の魂からエネルギーを吸い取っている...',
                        '{player}の魂は{boss}の中で力を失っていく...'
                    ],
                    weight: 1
                },
                {
                    id: 'soul-control',
                    type: ActionType.PostDefeatedAttack,
                    name: '魂の操縦',
                    description: '魂を操作して獲物を支配し続ける',
                    messages: [
                        '「フフフ...」',
                        '{boss}が{player}の魂を操縦している...',
                        '{player}の意識は{boss}に支配されている...'
                    ],
                    statusEffect: StatusEffectType.Charm,
                    weight: 1
                },
                {
                    id: 'soul-poison',
                    type: ActionType.PostDefeatedAttack,
                    name: '魂の毒化',
                    description: '魂に毒を流し込み続ける',
                    messages: [
                        '「ケケケ...」',
                        '{boss}が{player}の魂に毒を流し込んでいる...',
                        '{player}の魂は徐々に汚染されていく...'
                    ],
                    statusEffect: StatusEffectType.Poison,
                    weight: 1
                },
                {
                    id: 'soul-slow',
                    type: ActionType.PostDefeatedAttack,
                    name: '魂の鈍化',
                    description: '魂の動きを鈍らせ続ける',
                    messages: [
                        '「フフフ...」',
                        '{boss}が{player}の魂の動きを鈍らせている...',
                        '{player}の魂は重く沈んでいく...'
                    ],
                    statusEffect: StatusEffectType.Slow,
                    weight: 1
                },
                {
                    id: 'soul-surveillance',
                    type: ActionType.PostDefeatedAttack,
                    name: '魂の監視',
                    description: '魂を監視し続けて逃げられないようにする',
                    messages: [
                        '「ケケケ...」',
                        '{boss}が{player}の魂を監視している...',
                        '{player}の魂は{boss}の視線から逃れられない...'
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
                    id: 'soul-absorption',
                    type: ActionType.DevourAttack,
                    name: '魂の吸収',
                    damageFormula: (user: Boss) => user.attackPower * 1.5,
                    description: '体内にいる獲物の生命エネルギーを吸収する',
                    messages: [
                        '「キミのタマシイ、おいしいネ...」',
                        '{boss}は体内の{player}の魂からエネルギーを吸い取っている...'
                    ],
                    weight: 30
                },
                {
                    id: 'soul-extraction',
                    type: ActionType.DevourAttack,
                    name: '魂の引き抜き',
                    damageFormula: (user: Boss) => user.attackPower * 1.5,
                    description: '体内にいる獲物の魂を影の触手で引き抜こうとする',
                    messages: [
                        '「ユックリと引き抜いてあげるヨ...」',
                        '{boss}の胃袋から影の触手が伸び、{player}の魂を引き抜こうとする...'
                    ],
                    weight: 25
                },
                {
                    id: 'bottomless-slime',
                    type: ActionType.DevourAttack,
                    name: '底なしの粘液',
                    damageFormula: (user: Boss) => user.attackPower * 1.0,
                    description: '体内にいる獲物を粘液で包み込み、動きを封じる',
                    messages: [
                        '「ネバネバ粘液から抜け出せるかナ？」',
                        '{boss}の胃袋が大量の粘液を出し、{player}を包み込む...'
                    ],
                    statusEffect: StatusEffectType.Slimed,
                    weight: 25
                },
                {
                    id: 'despair-whisper',
                    type: ActionType.DevourAttack,
                    name: '絶望の囁き',
                    damageFormula: (user: Boss) => user.attackPower * 1.0,
                    description: '絶望的な言葉で心を折り恐怖を植え付ける',
                    messages: [
                        '「もう誰も助けに来ないヨ...」',
                        '{boss}が{player}の心に絶望を囁いている...'
                    ],
                    statusEffect: StatusEffectType.Fear,
                    statusChance: 0.8,
                    weight: 20
                },
                {
                    id: 'memory-erosion',
                    type: ActionType.DevourAttack,
                    name: '記憶の侵食',
                    damageFormula: (user: Boss) => user.attackPower * 0.6,
                    description: '記憶を蝕みスキルの記憶を奪う',
                    messages: [
                        '「難しいことなんて忘れて、楽にしてあげるネ...」',
                        '{boss}が{player}の記憶を侵食している...'
                    ],
                    statusEffect: StatusEffectType.Oblivion,
                    weight: 15,
                    canUse: (boss, _player, turn) => {
                        // Check if this action was used in the last 20 turns
                        const lastUsed = boss.getCustomVariable("lastMemoryErosionTurn", -21);
                        return (turn - lastUsed) >= 20;
                    },
                    onUse: (boss, _player, turn) => {
                        // Record when this action was used
                        boss.setCustomVariable("lastMemoryErosionTurn", turn);
                        return [];
                    }
                }
            ];
            
            // Filter available actions based on canUse condition
            const availableActions = eatenActions.filter(action => {
                if (action.canUse) {
                    return action.canUse(boss, player, turn);
                }
                return true;
            });
            
            // Weighted random selection from available actions
            const totalWeight = availableActions.reduce((sum, action) => sum + action.weight, 0);
            let random = Math.random() * totalWeight;
            
            for (const action of availableActions) {
                random -= action.weight;
                if (random <= 0) {
                    return action;
                }
            }
            
            return availableActions[0] || eatenActions[0];
        }
        
        // Strategic actions based on player state
        if (player.isKnockedOut()) {
            if (player.isRestrained()) {
                // Restrained + Knocked Out: 85% chance to eat
                if (Math.random() < 0.85) {
                    return {
                        id: 'soul-suction-restrained',
                        type: ActionType.EatAttack,
                        name: '魂の吸引',
                        description: '魂を吸い取るために対象を丸呑みにする',
                        messages: [
                            '「イタダキマース！」',
                            '{boss}は大きな口を開け、{player}を吸い込む！'
                        ],
                        weight: 1
                    };
                }
            } else {
                // Normal + Knocked Out: 60% chance to restrain, 25% to eat directly
                const random = Math.random();
                if (random < 0.6) {
                    return {
                        id: 'shadow-bind-ko',
                        type: ActionType.RestraintAttack,
                        name: '影の縛り',
                        description: '対象を影の触手で拘束する',
                        messages: [
                            '「もっとじっくり見たいナ！」',
                            '{boss}は影の触手で{player}を捕らえようとしてきた！'
                        ],
                        weight: 1
                    };
                } else if (random < 0.85) {
                    return {
                        id: 'soul-suction-direct',
                        type: ActionType.EatAttack,
                        name: '魂の吸引',
                        description: '魂を吸い取るために対象を丸呑みにする',
                        messages: [
                            '「イタダキマース！」',
                            '{boss}は大きな口を開け、{player}を吸い込む！'
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
        '{boss}は{player}の魂ごと吸い取り、{boss}の体に取り込む！',
        '{player}の魂は{boss}の中に閉じ込められ、満足するまで生命エネルギーを吸われ続けることになった...'
    ];
};
