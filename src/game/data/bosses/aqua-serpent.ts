import { BossData, ActionType, BossAction } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffectTypes';

const aquaSerpentActions: BossAction[] = [
    {
        type: ActionType.Attack,
        name: '水圧ブレス',
        description: '口から高圧水流を発射',
        damage: 22,
        weight: 35,
        playerStateCondition: 'normal',
        statusEffect: StatusEffectType.WaterSoaked,
        statusChance: 0.25,
        hitRate: 0.9
    },
    {
        type: ActionType.Attack,
        name: '津波の一撃',
        description: '尻尾で水を巻き上げて叩きつける',
        damage: 32,
        weight: 25,
        playerStateCondition: 'normal',
        hitRate: 0.8,
        criticalRate: 0.1,
        damageVarianceMin: -0.15,
        damageVarianceMax: 0.3
    },
    {
        type: ActionType.Attack,
        name: '渦潮スラム',
        description: '長い体をうねらせて全身で攻撃',
        damage: 26,
        weight: 30,
        playerStateCondition: 'normal',
        hitRate: 0.75,
        statusEffect: StatusEffectType.Dizzy,
        statusChance: 0.30
    },
    {
        type: ActionType.Attack,
        name: '深海の審判',
        description: '海水を操り巨大な水の檻を作成',
        damage: 45,
        weight: 5,
        playerStateCondition: 'normal',
        hitRate: 0.9,
        statusEffect: StatusEffectType.Restrained,
        statusChance: 0.80,
        canUse: (boss, player) => {
            // Only use when HP is below 30% and has cooldown
            return boss.getHpPercentage() <= 30 && 
                   !boss.getCustomVariable<boolean>('hasUsedSpecialMove') && 
                   !player.isRestrained() && 
                   !player.isEaten();
        }
    },
    {
        type: ActionType.RestraintAttack,
        name: '海蛇の抱擁',
        description: '長い体でプレイヤーを巻き付け拘束',
        messages: [
            '「シャアアア...」',
            '<USER>が長い体を<TARGET>に巻き付けてきた！',
            '<TARGET>は海蛇の抱擁に捕らわれてしまった...'
        ],
        damage: 18,
        weight: 8,
        canUse: (_, player) => {
            return !player.isRestrained() && !player.isEaten() && Math.random() < 0.35;
        }
    },
    {
        type: ActionType.Attack,
        name: '深海のキス',
        description: '拘束中の獲物をキスして体力を吸収',
        messages: [
            '「シャアアア...」',
            '<USER>が<TARGET>を口づけで包み込み、体力を吸収している...'
        ],
        damage: 28,
        weight: 40,
        playerStateCondition: 'restrained',
        healRatio: 1.2
    },
    {
        type: ActionType.Attack,
        name: '締めつけ',
        description: '拘束中の獲物を体で締めつける',
        messages: [
            '「シャアアア...」',
            '<USER>が<TARGET>をゆっくりと締めつけている...'
        ],
        damage: 20,
        weight: 35,
        playerStateCondition: 'restrained'
    },
    {
        type: ActionType.DevourAttack,
        name: '胃液の嵐',
        description: '体内で津波のような胃液を放出',
        messages: [
            '「シャアアアア...」',
            '<USER>の体内で激しい胃液の嵐が巻き起こる！',
            '<TARGET>の最大HPが吸収されていく...'
        ],
        damage: 22,
        weight: 25,
        playerStateCondition: 'eaten'
    },
    {
        type: ActionType.DevourAttack,
        name: '蠕動運動',
        description: '体内の壁が収縮してプレイヤーを押し流す',
        messages: [
            '「シャアアア...」',
            '<USER>の体内の壁が<TARGET>を奥へと押し流している...',
            '<TARGET>の最大HPが吸収されていく...'
        ],
        damage: 25,
        weight: 25,
        playerStateCondition: 'eaten'
    },
    {
        type: ActionType.DevourAttack,
        name: '体内発光',
        description: '体内の光が強くなりプレイヤーを幻惑',
        messages: [
            '「シャアアア...」',
            '<USER>の体内で神秘的な光が強くなり、<TARGET>を幻惑している...'
        ],
        damage: 15,
        weight: 20,
        playerStateCondition: 'eaten',
        statusEffect: StatusEffectType.Charm
    },
    {
        type: ActionType.DevourAttack,
        name: '生命吸収の渦',
        description: '体内で大量の生命力を吸収',
        messages: [
            '「シャアアアア...」',
            '<USER>の体内で巨大な渦が発生し、<TARGET>の生命力を激しく吸収している！',
            '<TARGET>の最大HPが大幅に吸収されていく...'
        ],
        damage: 35,
        weight: 10,
        playerStateCondition: 'eaten',
        canUse: () => {
            // 20% chance to use and possibly release player
            return Math.random() < 0.2;
        },
        onUse: (_, player) => {
            // 30% chance to release player after this attack
            if (Math.random() < 0.3) {
                player.statusEffects.removeEffect(StatusEffectType.Eaten);
                return ['<TARGET>は激しい渦に巻き込まれ、<USER>の口から吐き出された！'];
            }
            return [];
        }
    }
];

export const aquaSerpentData: BossData = {
    id: 'aqua-serpent',
    name: 'AquaSerpent',
    displayName: '🐍 アクアサーペント',
    description: '大海原を泳ぐ神秘的な海蛇型の龍',
    questNote: `大海原の深くに潜む、青い体を持つ巨大な海蛇型の龍。体内が淡く光っており、透明なお腹から内部が見える神秘的な存在。獲物を体内に閉じ込めて生命力を吸収する習性を持つ。その美しくも恐ろしい力を止めることができるのか？`,
    maxHp: 350,
    attackPower: 20,
    actions: aquaSerpentActions,
    icon: '🐍',
    personality: [
        'シャアアア...美しい生命力だ',
        'この海の奥深くで...待っていた',
        'シャアアア...逃がさない',
        'お前の生命力を...いただこう',
        'シャアアア...美味しそうだ',
        '透明な体内で...ゆっくりと味わおう'
    ],
    customVariables: {
        hasUsedSpecialMove: false,
        specialMoveCooldown: 0
    },
    aiStrategy: (boss, player, turn) => {
        // Reset special move cooldown
        const cooldown = boss.getCustomVariable<number>('specialMoveCooldown', 0);
        if (cooldown && cooldown > 0) {
            boss.setCustomVariable('specialMoveCooldown', cooldown - 1);
            if (cooldown - 1 <= 0) {
                boss.setCustomVariable('hasUsedSpecialMove', false);
            }
        }

        // Every 10 turns while player is defeated, show re-consumption cycle
        if (player.isDefeated() && turn % 10 === 0) {
            return {
                type: ActionType.PostDefeatedAttack,
                name: '尻尾から出され、再び口から捕食',
                description: '尻尾から出されたが、すぐに口から再び飲み込まれる',
                messages: [
                    '「シャアアア...」',
                    '<USER>が<TARGET>を尻尾から吐き出した！',
                    'しかし、すぐに大きな口で<TARGET>を再び飲み込んでしまった...',
                    '<TARGET>は再び透明な体内に閉じ込められてしまった...'
                ],
                weight: 1
            };
        }

        // If player is defeated, use special post-defeat actions
        if (player.isDefeated()) {
            const postDefeatedActions: BossAction[] = [
                {
                    type: ActionType.PostDefeatedAttack,
                    name: '胃液でゆっくり洗われる',
                    description: '体内で胃液にゆっくりと洗われ続ける',
                    messages: [
                        '<USER>の体内で<TARGET>がゆっくりと胃液に洗われている...',
                        '透明な体内から外の深海が見える...'
                    ],
                    weight: 1
                },
                {
                    type: ActionType.PostDefeatedAttack,
                    name: '激しい蠕動運動でさらに奥へ',
                    description: '体内の筋肉が収縮して更に奥へ運ばれる',
                    messages: [
                        '<USER>の体内で激しい蠕動運動が起こり、<TARGET>を更に奥へと運んでいる...',
                        '<TARGET>は抵抗することができない...'
                    ],
                    weight: 1
                },
                {
                    type: ActionType.PostDefeatedAttack,
                    name: 'マッサージされながら深海を眺める',
                    description: '体内でマッサージされながら透明な体内から深海を眺める',
                    messages: [
                        '<USER>の体内で<TARGET>が優しくマッサージされている...',
                        '透明な体内から美しい深海の光景が見える...'
                    ],
                    weight: 1
                },
                {
                    type: ActionType.PostDefeatedAttack,
                    name: '体内で渦を起こされてぐるぐる',
                    description: '体内で渦を起こされて目を回す',
                    messages: [
                        '<USER>の体内で激しい渦が起こり、<TARGET>をぐるぐると回転させている...',
                        '<TARGET>は目を回して意識が朦朧としている...'
                    ],
                    weight: 1
                }
            ];
            return postDefeatedActions[Math.floor(Math.random() * postDefeatedActions.length)];
        }

        // If player is eaten, use varied devour actions
        if (player.isEaten()) {
            const eatenActions = aquaSerpentActions.filter(action => 
                action.playerStateCondition === 'eaten'
            );
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
                // Restrained + Knocked Out: 95% chance to eat
                if (Math.random() < 0.95) {
                    return {
                        type: ActionType.EatAttack,
                        name: '丸呑み',
                        description: '拘束した獲物を丸呑みする',
                        messages: [
                            '「シャアアア...」',
                            '<USER>が大きな口を開け、<TARGET>をゆっくりと丸呑みにする！',
                            '<TARGET>は透明な体内に閉じ込められてしまった...'
                        ],
                        weight: 1
                    };
                }
            } else {
                // Normal + Knocked Out: 75% chance to restrain, 20% to eat directly
                const random = Math.random();
                if (random < 0.75) {
                    return {
                        type: ActionType.RestraintAttack,
                        name: '海蛇の抱擁',
                        description: '長い体で獲物を拘束する',
                        messages: [
                            '「シャアアア...」',
                            '<USER>が長い体を<TARGET>に巻き付けてきた！'
                        ],
                        weight: 1
                    };
                } else if (random < 0.95) {
                    return {
                        type: ActionType.EatAttack,
                        name: '丸呑み',
                        description: '獲物を丸呑みする',
                        messages: [
                            '「シャアアア...」',
                            '<USER>が大きな口を開け、<TARGET>をゆっくりと丸呑みにする！',
                            '<TARGET>は透明な体内に閉じ込められてしまった...'
                        ],
                        weight: 1
                    };
                }
            }
        }
        // Mark special move as used when using 深海の審判
        const specialMove = aquaSerpentActions.find(action => action.name === '深海の審判');
        if (specialMove && boss.getHpPercentage() <= 30 && !boss.getCustomVariable<boolean>('hasUsedSpecialMove')) {
            boss.setCustomVariable('hasUsedSpecialMove', true);
            boss.setCustomVariable('specialMoveCooldown', 20);
            return specialMove;
        }

        // Prefer water-based attacks early in battle
        if (turn <= 5 && !player.statusEffects.hasEffect(StatusEffectType.WaterSoaked)) {
            const waterAttack = aquaSerpentActions.find(action => 
                action.name === '水圧ブレス' && action.playerStateCondition === 'normal'
            );
            if (waterAttack && Math.random() < 0.6) {
                return waterAttack;
            }
        }

        // Use powerful attacks more often when player is restrained
        if (player.isRestrained()) {
            const restrainedActions = aquaSerpentActions.filter(action => 
                action.playerStateCondition === 'restrained'
            );
            if (restrainedActions.length > 0) {
                const totalWeight = restrainedActions.reduce((sum, action) => sum + action.weight, 0);
                let random = Math.random() * totalWeight;
                
                for (const action of restrainedActions) {
                    random -= action.weight;
                    if (random <= 0) {
                        return action;
                    }
                }
                return restrainedActions[0];
            }
        }

        // Default to weighted random selection
        const currentPlayerState = boss.getPlayerState(player);
        const availableActions = aquaSerpentActions.filter(action => {
            // Check player state condition
            if (action.playerStateCondition) {
                if (action.playerStateCondition !== currentPlayerState) {
                    return false;
                }
            }
            
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
aquaSerpentData.finishingMove = function() {
    return [
        '「シャアアア...」',
        '<USER>は<TARGET>を体内の奥深くへと運んでいく...',
        '<TARGET>はアクアサーペントの透明な体内で、美しい深海の光景を眺めながら永遠に過ごすことになった...'
    ];
};

// Override dialogue for personality
aquaSerpentData.getDialogue = function(situation: 'battle-start' | 'player-restrained' | 'player-eaten' | 'player-escapes' | 'low-hp' | 'victory') {
    const DEFAULT_DIALOGUE_SITUATION = 'battle-start';
    const dialogues: Record<string, string[]> = {
        'battle-start': [
            'シャアアア...美しい生命力だ',
            'この海の奥深くで...待っていた',
            'シャアアア...お前の生命力を頂こう'
        ],
        'player-restrained': [
            'シャアアア...逃げられない',
            '私の抱擁から逃れることはできない',
            'シャアアア...おとなしくするのだ'
        ],
        'player-eaten': [
            'シャアアア...美味しそうだ',
            '透明な体内で...ゆっくりと味わおう',
            'シャアアア...生命力が溢れている'
        ],
        'player-escapes': [
            'シャアアア...逃がさない',
            '次は必ず捕らえてやる',
            'シャアアア...なかなかやるな'
        ],
        'low-hp': [
            'シャアアア...まだ終わらない！',
            'この海の力を侮るな',
            'シャアアア...まだまだ！'
        ],
        'victory': [
            'シャアアア...満足だ',
            'また新しい獲物を待つとしよう'
        ]
    };

    const options = dialogues[situation] || dialogues[DEFAULT_DIALOGUE_SITUATION];
    return options[Math.floor(Math.random() * options.length)];
};