import { Boss, BossData, ActionType, BossAction } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffectTypes';
import { getBossText } from '../../i18n';

const text = getBossText<{
    displayName: BossData['displayName'];
    description: BossData['description'];
    questNote: BossData['questNote'];
    appearanceNote?: BossData['appearanceNote'];
    battleStartMessages: BossData['battleStartMessages'];
    victoryMessages: BossData['victoryMessages'];
    victoryTrophy: BossData['victoryTrophy'];
    defeatTrophy: BossData['defeatTrophy'];
    personality: BossData['personality'];
}>('aqua-serpent');

const aquaSerpentActions: BossAction[] = [
    {
        id: 'water-pressure-breath',
        type: ActionType.Attack,
        name: '水圧ブレス',
        description: '口から高圧水流を発射',
        messages: [
            '{boss}が口から高圧の水流を{player}に向けて発射する！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.1,
        weight: 35,
        playerStateCondition: 'normal',
        statusEffect: StatusEffectType.WaterSoaked,
        statusChance: 0.25,
        hitRate: 0.9
    },
    {
        id: 'tsunami-strike',
        type: ActionType.Attack,
        name: '津波の一撃',
        description: '尻尾で水を巻き上げて叩きつける',
        messages: [
            '{boss}が巨大な尻尾で海水を巻き上げ、津波のような一撃を{player}に放つ！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.6,
        weight: 25,
        playerStateCondition: 'normal',
        hitRate: 0.8,
        criticalRate: 0.1,
        damageVarianceMin: -0.15,
        damageVarianceMax: 0.3
    },
    {
        id: 'whirlpool-slam',
        type: ActionType.Attack,
        name: '渦潮スラム',
        description: '長い体をうねらせて全身で攻撃',
        messages: [
            '{boss}が長い体をうねらせ、渦潮のような螺旋攻撃を仕掛けてくる！',
            '{player}は激しい渦に巻き込まれて目を回している...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.3,
        weight: 30,
        playerStateCondition: 'normal',
        hitRate: 0.75,
        statusEffect: StatusEffectType.Dizzy,
        statusChance: 0.30
    },
    {
        id: 'deep-sea-judgment',
        type: ActionType.Attack,
        name: '深海の審判',
        description: '海水を操り巨大な水の檻を作成',
        messages: [
            '「シャアアアアアア...」',
            '{boss}の体が青白く光り、海水が天高く舞い上がる！',
            '巨大な水の檻が{player}を包み込み、深海の圧力で押し潰そうとする！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 2.25,
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
        id: 'sea-serpent-embrace',
        type: ActionType.RestraintAttack,
        name: '海蛇の抱擁',
        description: '長い体でプレイヤーを巻き付け拘束',
        messages: [
            '「シャアアア...」',
            '{boss}が長い体を{player}に巻き付けてきた！',
            '{player}は海蛇の抱擁に捕らわれてしまった...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.9,
        weight: 8,
        canUse: (_, player) => {
            return !player.isRestrained() && !player.isEaten() && Math.random() < 0.35;
        }
    },
    {
        id: 'deep-sea-kiss',
        type: ActionType.Attack,
        name: '深海のキス',
        description: '拘束中の獲物をキスして体力を吸収',
        messages: [
            '{boss}が{player}を口づけで包み込み、体力を吸収している...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.4,
        weight: 40,
        playerStateCondition: 'restrained',
        healRatio: 1.2
    },
    {
        id: 'constriction',
        type: ActionType.Attack,
        name: '締めつけ',
        description: '拘束中の獲物を体で締めつける',
        messages: [
            '{boss}が{player}をゆっくりと締めつけている...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.0,
        weight: 35,
        playerStateCondition: 'restrained'
    },
    {
        id: 'gastric-storm',
        type: ActionType.DevourAttack,
        name: '胃液の嵐',
        description: '体内で津波のような胃液を放出',
        messages: [
            '「シャアアアア...」',
            '{boss}の体内で激しい胃液の嵐が巻き起こる！',
            '{player}の最大HPが吸収されていく...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.1,
        weight: 25,
        playerStateCondition: 'eaten'
    },
    {
        id: 'peristalsis',
        type: ActionType.DevourAttack,
        name: '蠕動運動',
        description: '体内の壁が収縮してプレイヤーを押し流す',
        messages: [
            '「シャアアア...」',
            '{boss}の体内の壁が{player}を奥へと押し流している...',
            '{player}の最大HPが吸収されていく...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.25,
        weight: 25,
        playerStateCondition: 'eaten'
    },
    {
        id: 'internal-glow',
        type: ActionType.DevourAttack,
        name: '体内発光',
        description: '体内の光が強くなりプレイヤーを幻惑',
        messages: [
            '「シャアアア...」',
            '{boss}の体内で神秘的な光が強くなり、{player}を幻惑している...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.75,
        weight: 20,
        playerStateCondition: 'eaten',
        statusEffect: StatusEffectType.Charm
    },
    {
        id: 'life-drain-vortex',
        type: ActionType.DevourAttack,
        name: '生命吸収の渦',
        description: '体内で大量の生命力を吸収',
        messages: [
            '「シャアアアア...」',
            '{boss}の体内で巨大な渦が発生し、{player}の生命力を激しく吸収している！',
            '{player}の最大HPが大幅に吸収されていく...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.75,
        weight: 10,
        playerStateCondition: 'eaten',
        canUse: () => {
            // 20% chance to use and possibly release player
            return Math.random() < 0.2;
        },
        onUse: (_, player, _turn) => {
            // 30% chance to release player after this attack
            if (Math.random() < 0.3) {
                player.statusEffects.removeEffect(StatusEffectType.Eaten);
                return ['{player}は激しい渦に巻き込まれ、{boss}の口から吐き出された！'];
            }
            return [];
        }
    }
];

export const aquaSerpentData: BossData = {
    id: 'aqua-serpent',
    name: 'AquaSerpent',
    displayName: text.displayName,
    description: text.description,
    questNote: text.questNote,
    appearanceNote: text.appearanceNote,
    maxHp: 750,
    attackPower: 20,
    actions: aquaSerpentActions,
    icon: '🐍',
    explorerLevelRequired: 2,
    battleStartMessages: text.battleStartMessages,
    victoryMessages: text.victoryMessages,
    victoryTrophy: text.victoryTrophy,
    defeatTrophy: text.defeatTrophy,
    personality: text.personality,
    customVariables: {
        hasUsedSpecialMove: false,
        specialMoveCooldown: 0,
        defeatStartTurn: -1
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

        // Track when player becomes defeated and handle 8-turn cycles from that point
        const defeatStartTurn = boss.getCustomVariable<number>('defeatStartTurn', -1);
        
        if (player.isDefeated()) {
            // If this is the first turn player is defeated, record it
            if (defeatStartTurn === -1) {
                boss.setCustomVariable('defeatStartTurn', turn);
            }
            
            // Every 8 turns since defeat started, show re-consumption cycle
            const turnsSinceDefeat = turn - boss.getCustomVariable<number>('defeatStartTurn', turn);
            if (turnsSinceDefeat > 0 && turnsSinceDefeat % 8 === 0) {
                return {
                    id: 'reincarnation-predation',
                    type: ActionType.PostDefeatedAttack,
                    name: '輪廻の捕食',
                    description: '尻尾まで運ばれた獲物を再び口に運んで飲み込む',
                    messages: [
                        '「シャアアア...」',
                        '体内の端まで通過させられた{player}が、{boss}の尻尾から顔を出す！',
                        '「まだ飽き足りないじゃろう？もう一度、我の体内を楽しませてあげよう」',
                        '{boss}は大きな口で{player}を尻尾ごと咥え、再び飲み込んでいく！',
                        '{player}は再び透明な体内に閉じ込められてしまった...'
                    ],
                    weight: 1
                };
            }
        } else {
            // Reset defeat start turn if player is no longer defeated
            if (defeatStartTurn !== -1) {
                boss.setCustomVariable('defeatStartTurn', -1);
            }
        }

        // If player is defeated, use special post-defeat actions
        if (player.isDefeated()) {
            const postDefeatedActions: BossAction[] = [
                {
                    id: 'gastric-bath',
                    type: ActionType.PostDefeatedAttack,
                    name: '胃液でゆっくり洗われる',
                    description: '体内で胃液にゆっくりと洗われ続ける',
                    messages: [
                        '{boss}の体内で{player}がゆっくりと胃液に洗われている...',
                        '透明な体内から外の深海が見える...'
                    ],
                    weight: 1
                },
                {
                    id: 'intense-peristalsis',
                    type: ActionType.PostDefeatedAttack,
                    name: '激しい蠕動運動でさらに奥へ',
                    description: '体内の筋肉が収縮して更に奥へ運ばれる',
                    messages: [
                        '{boss}の体内で激しい蠕動運動が起こり、{player}を更に奥へと運んでいる...',
                        '{player}は抵抗することができない...'
                    ],
                    weight: 1
                },
                {
                    id: 'deep-sea-massage',
                    type: ActionType.PostDefeatedAttack,
                    name: 'マッサージされながら深海を眺める',
                    description: '体内でマッサージされながら透明な体内から深海を眺める',
                    messages: [
                        '{boss}の体内で{player}が優しくマッサージされている...',
                        '透明な体内から美しい深海の光景が見える...'
                    ],
                    weight: 1
                },
                {
                    id: 'internal-whirlpool',
                    type: ActionType.PostDefeatedAttack,
                    name: '体内で渦を起こされてぐるぐる',
                    description: '体内で渦を起こされて目を回す',
                    messages: [
                        '{boss}の体内で激しい渦が起こり、{player}をぐるぐると回転させている...',
                        '{player}は目を回して意識が朦朧としている...'
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
                        id: 'swallow-whole-restrained',
                        type: ActionType.EatAttack,
                        name: '丸呑み',
                        description: '拘束した獲物を丸呑みする',
                        messages: [
                            '「シャアアア...一呑みにしてやる」',
                            '{boss}が大きな口を開け、{player}をゆっくりと丸呑みにする！',
                            '{player}は透明な体内に閉じ込められてしまった...'
                        ],
                        weight: 1
                    };
                }
            } else {
                // Normal + Knocked Out: 75% chance to restrain, 20% to eat directly
                const random = Math.random();
                if (random < 0.75) {
                    return {
                        id: 'sea-serpent-embrace-ko',
                        type: ActionType.RestraintAttack,
                        name: '海蛇の抱擁',
                        description: '長い体で獲物を拘束する',
                        messages: [
                            '「シャアアア...」',
                            '{boss}が長い体を{player}に巻き付けてきた！'
                        ],
                        weight: 1
                    };
                } else if (random < 0.95) {
                    return {
                        id: 'swallow-whole-direct',
                        type: ActionType.EatAttack,
                        name: '丸呑み',
                        description: '獲物を丸呑みする',
                        messages: [
                            '「シャアアア...一呑みにしてやる」',
                            '{boss}が大きな口を開け、{player}をゆっくりと丸呑みにする！',
                            '{player}は透明な体内に閉じ込められてしまった...'
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
        '「シャアアア...どうやら力尽きたようじゃのう」',
        '{boss}は{player}を体内の奥深くへと運んでいく...',
        '「我とともに海の底を旅しよう。心配は無用じゃ、我が暗闇を照らしてくれよう」',
        '{player}はアクアサーペントの透明な体内で、美しい深海の光景を眺めながら永遠に過ごすことになった...'
    ];
};
