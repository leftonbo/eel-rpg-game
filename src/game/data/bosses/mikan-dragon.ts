import { BossData, ActionType, BossAction, Boss } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffectTypes';

const mikanDragonActions: BossAction[] = [
    {
        id: 'citrus-claw',
        type: ActionType.Attack,
        name: '蜜柑の爪',
        description: '蜜柑のような鋭い爪で攻撃',
        messages: ['{boss}は蜜柑のような鋭い爪で{player}を攻撃した！'],
        damageFormula: (user: Boss) => user.attackPower * 0.9,
        weight: 25,
        playerStateCondition: 'normal'
    },
    {
        id: 'citrus-tail-slam',
        type: ActionType.Attack,
        name: '蜜柑の尻尾',
        description: '蜜柑色の尻尾で叩く',
        messages: ['{boss}は蜜柑色の尻尾で{player}を叩いた！'],
        damageFormula: (user: Boss) => user.attackPower * 1.1,
        weight: 20,
        playerStateCondition: 'normal'
    },
    {
        id: 'citrus-fragrance',
        type: ActionType.StatusAttack,
        name: '蜜柑の香り',
        description: '甘い蜜柑の香りで獲物を魅了する',
        messages: ['{boss}は甘い蜜柑の香りを放った！'],
        damageFormula: (user: Boss) => user.attackPower * 0.6,
        hitRate: 0.9,
        statusEffect: StatusEffectType.Charm,
        weight: 30,
        canUse: (_boss, player, _turn) => {
            // HP減少時に魅了成功率上昇
            const hpPercentage = player.getHpPercentage();
            const baseChance = hpPercentage > 50 ? 0.4 : 0.7;
            return !player.statusEffects.hasEffect(StatusEffectType.Charm) && Math.random() < baseChance;
        }
    },
    {
        id: 'citrus-slime',
        type: ActionType.StatusAttack,
        name: '蜜柑の粘液',
        description: '蜜柑の汁のような粘液で獲物をネバネバにする',
        messages: ['{boss}は口から蜜柑のような粘液を放った！'],
        damageFormula: (user: Boss) => user.attackPower * 0.7,
        hitRate: 0.95,
        statusEffect: StatusEffectType.Slimed,
        weight: 25
    },
    {
        id: 'tongue-wrap',
        type: ActionType.RestraintAttack,
        name: '蜜柑の舌巻き付け',
        description: '長い舌で獲物を拘束する',
        messages: [
            '「フルルル...」',
            '{boss}は長い舌で{player}を巻き付けてきた！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.0,
        weight: 15,
        hitRate: 0.85,
        canUse: (_boss, player, _turn) => {
            return !player.isRestrained() && !player.isEaten() && Math.random() < 0.4;
        }
    },
    {
        id: 'citrus-squeeze',
        type: ActionType.Attack,
        name: '蜜柑しぼり',
        description: '舌で獲物を締め付ける',
        messages: [
            '「フルルル...」',
            '{boss}は巻き付けた舌で{player}を締め付ける！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.3,
        weight: 30,
        playerStateCondition: 'restrained'
    },
    {
        id: 'citrus-kiss',
        type: ActionType.Attack,
        name: '蜜柑のキス',
        description: '舌で獲物を舐めて体力を吸収する',
        messages: [
            '「フルルル...」',
            '{boss}は{player}を体ごとキスして体力を吸収する！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.6,
        weight: 25,
        playerStateCondition: 'restrained',
        healRatio: 1.0
    },
    {
        id: 'citrus-juice-injection',
        type: ActionType.StatusAttack,
        name: '蜜柑汁注入',
        description: '舌を口に入れて蜜柑の汁を注入し、魅了する',
        messages: [
            '「フルルル...」',
            '{boss}は舌を{player}の口に入れて蜜柑の汁を注入している！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.1,
        statusEffect: StatusEffectType.Charm,
        weight: 20,
        playerStateCondition: 'restrained'
    }
];

export const mikanDragonData: BossData = {
    id: 'mikan-dragon',
    name: 'MikanDragon',
    displayName: '蜜柑ドラゴン',
    description: '蜜柑の香りを放つ甘いドラゴン',
    questNote: `蜜柑畑に現れた美しいドラゴンが、通りかかる旅人を甘い香りで誘い込んでいるという。その蜜柑ドラゴンを調査し、対処することがあなたの任務だ。`,
    maxHp: 450,
    attackPower: 18,
    actions: mikanDragonActions,
    icon: '🍊',
    explorerLevelRequired: 4,
    battleStartMessages: [
        {
            speaker: 'player',
            style: 'default',
            text: 'あなたは蜜柑畑で甘い香りを放つ美しいドラゴンと遭遇した。'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: 'あら、いらっしゃい♪ 甘い匂いに誘われて来たのかしら？'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: '蜜柑ドラゴンは柑橘系の爽やかな香りを漂わせながら、愛らしい笑顔を見せている...'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: 'とっても美味しい蜜柑汁で満たしてあげるわね♪ 私のお腹で甘〜くなりましょう？'
        }
    ],
    victoryMessages: [
        {
            speaker: 'boss',
            style: 'talk',
            text: 'あら〜、こんなに強い方だったのね...'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: 'でも楽しい戦いだったわ♪ また遊びに来てくださいね'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: '蜜柑ドラゴンは愛らしく手を振ると、甘い香りを残して蜜柑畑の奥へと去っていった...'
        }
    ],
    victoryTrophy: {
        name: '蜜柑の皮',
        description: '蜜柑ドラゴンの外皮。柑橘系の爽やかな香りとドラゴンの威厳を併せ持つ。'
    },
    defeatTrophy: {
        name: '培養蜜柑汁',
        description: '蜜柑ドラゴンの体内で熟成された特製蜜柑汁。濃厚で甘酸っぱい生命のエキス。'
    },
    personality: [
        'フルルル...甘い香りでしょう？',
        '蜜柑の汁が美味しいのよ',
        'そのまま私の中にいらっしゃい',
        'フルルル...とても甘くて美味しいわ',
        '蜜柑の香りに包まれて...',
        '私の体内で培養してあげる'
    ],
    aiStrategy: (boss, player, turn) => {
        // Mikan Dragon AI Strategy - Focus on charm and gradual dominance

        // If player is defeated, use special post-defeat actions
        if (player.isDefeated()) {
            const defeatStartTurn = boss.getCustomVariable<number>('defeatStartTurn', -1);
            
            // If this is the first turn player is defeated, record it
            if (defeatStartTurn === -1) {
                boss.setCustomVariable('defeatStartTurn', turn);
            }

            // Every 8 turns since defeat started, show special citrus juice production event
            const turnsSinceDefeat = turn - boss.getCustomVariable<number>('defeatStartTurn', turn);
            if (turnsSinceDefeat > 0 && turnsSinceDefeat % 8 === 0) {
                return {
                    id: 'citrus-juice-production',
                    type: ActionType.PostDefeatedAttack,
                    name: '蜜柑ジュース製造',
                    description: '体内でプレイヤーを蜜柑ジュースに変換する過程を進める',
                    messages: [
                        '「フルルル...特別な蜜柑ジュースの時間よ」',
                        '{boss}の体内で特殊な蜜柑汁の製造装置が稼働し始める！',
                        '甘酸っぱい蜜柑汁が{player}の体に染み込んでいく...',
                        '「フルルル...あなたも美味しい蜜柑ジュースになりつつあるのよ」',
                        '{player}の体が徐々に蜜柑の汁のような粘液質に変化していく！',
                        '「これで私の特製蜜柑ジュースの完成ね...フルルル」',
                        '{player}は濃厚な蜜柑の汁に浸かり、魅了と粘液状態に包まれてしまった！'
                    ],
                    onUse: (_boss, player, _turn) => {
                        // 蜜柑ジュース関連の状態異常を付与
                        player.statusEffects.addEffect(StatusEffectType.Slimed);
                        player.statusEffects.addEffect(StatusEffectType.Charm);
                        player.statusEffects.addEffect(StatusEffectType.Sweet);
                        player.statusEffects.addEffect(StatusEffectType.Lethargy);
                        
                        return [];
                    },
                    weight: 1
                };
            }
            
            const postDefeatedActions: BossAction[] = [
                {
                    id: 'citrus-cultivation',
                    type: ActionType.PostDefeatedAttack,
                    name: '蜜柑汁培養',
                    description: '獲物の体を蜜柑の汁で満たし、培養し続ける',
                    messages: [
                        '「フルルル...」',
                        '{boss}の体内で蜜柑の汁が{player}を培養している...',
                        '{player}の体は徐々に蜜柑ドラゴンの幼体のような姿に変わっていく...'
                    ],
                    statusEffect: StatusEffectType.Charm,
                    weight: 1
                },
                {
                    id: 'citrus-tentacle-caress',
                    type: ActionType.PostDefeatedAttack,
                    name: '蜜柑触手愛撫',
                    description: '体内触手で獲物を優しく愛撫し続ける',
                    messages: [
                        '「フルルル...」',
                        '{boss}の体内触手が{player}を優しく愛撫している...',
                        '{player}は徐々に抵抗する意志を失っていく...'
                    ],
                    statusEffect: StatusEffectType.Lethargy,
                    weight: 1
                },
                {
                    id: 'citrus-transformation',
                    type: ActionType.PostDefeatedAttack,
                    name: '蜜柑同族化',
                    description: '蜜柑の汁を注入して獲物を同族化させる',
                    messages: [
                        '「フルルル...」',
                        '{boss}が{player}に大量の蜜柑汁を注入している...',
                        '{player}の体は蜜柑ドラゴンの幼体へと変化している...'
                    ],
                    statusEffect: StatusEffectType.Charm,
                    weight: 1
                }
            ];
            return postDefeatedActions[Math.floor(Math.random() * postDefeatedActions.length)];
        }

        // If player is eaten, use internal attacks
        if (player.isEaten()) {
            const eatenActions = [
                {
                    id: 'internal-citrus-injection',
                    type: ActionType.DevourAttack,
                    name: '蜜柑汁注入',
                    description: '体内触手で蜜柑の汁を注入し、最大HPを減らす',
                    messages: [
                        '「フルルル...」',
                        '{boss}の体内触手が{player}の口に蜜柑汁を注入している！'
                    ],
                    damageFormula: (user: Boss) => user.attackPower * 1.5,
                    statusEffect: StatusEffectType.Charm,
                    weight: 1
                },
                {
                    id: 'citrus-massage',
                    type: ActionType.DevourAttack,
                    name: '蜜柑マッサージ',
                    description: '蜜柑の果肉のような胃壁でマッサージし、最大HPを減らす',
                    messages: [
                        '「フルルル...」',
                        '{boss}の胃壁が{player}を蜜柑の果肉のように優しくマッサージしている！'
                    ],
                    damageFormula: (user: Boss) => user.attackPower * 2.2,
                    weight: 1
                },
                {
                    id: 'citrus-tentacle-tickle',
                    type: ActionType.DevourAttack,
                    name: '蜜柑触手くすぐり',
                    description: '体内触手でくすぐり、最大HPを減らして脱力状態にする',
                    messages: [
                        '「フルルル...」',
                        '{boss}の体内触手が{player}をくすぐっている！'
                    ],
                    damageFormula: (user: Boss) => user.attackPower * 1.6,
                    statusEffect: StatusEffectType.Lethargy,
                    weight: 1
                }
            ];
            return eatenActions[Math.floor(Math.random() * eatenActions.length)];
        }

        // Strategic actions based on player state
        if (player.isKnockedOut()) {
            if (player.isRestrained()) {
                // Restrained + Knocked Out: 90% chance to eat
                if (Math.random() < 0.9) {
                    return {
                        id: 'citrus-swallow-restrained',
                        type: ActionType.EatAttack,
                        name: '蜜柑の丸呑み',
                        description: '拘束した獲物を丸呑みする',
                        messages: [
                            '「フルルル...」',
                            '{boss}が大きな口を開け、{player}を丸呑みにする！'
                        ],
                        weight: 1
                    };
                }
            } else {
                // Normal + Knocked Out: 60% chance to restrain, 30% to eat directly
                const random = Math.random();
                if (random < 0.6) {
                    return {
                        id: 'opportunistic-tongue-wrap',
                        type: ActionType.RestraintAttack,
                        name: '蜜柑の舌巻き付け',
                        description: '長い舌で獲物を拘束する',
                        messages: [
                            '「フルルル...」',
                            '{boss}は長い舌で{player}を巻き付けてきた！'
                        ],
                        weight: 1
                    };
                } else if (random < 0.9) {
                    return {
                        id: 'citrus-swallow-direct',
                        type: ActionType.EatAttack,
                        name: '蜜柑の丸呑み',
                        description: '拘束した獲物を丸呑みする',
                        messages: [
                            '「フルルル...」',
                            '{boss}が大きな口を開け、{player}を丸呑みにする！'
                        ],
                        weight: 1
                    };
                }
            }
        }

        // Prioritize charm when player's HP is low
        if (player.getHpPercentage() < 50 && !player.statusEffects.hasEffect(StatusEffectType.Charm)) {
            const charmAction = mikanDragonActions.find(action => action.statusEffect === StatusEffectType.Charm);
            if (charmAction && Math.random() < 0.7) {
                return charmAction;
            }
        }

        // Use restraint more often when player is charmed
        if (player.statusEffects.hasEffect(StatusEffectType.Charm) && !player.isRestrained() && !player.isEaten()) {
            const restraintAction = mikanDragonActions.find(action => action.type === ActionType.RestraintAttack);
            if (restraintAction && Math.random() < 0.6) {
                return restraintAction;
            }
        }

        // Apply slimed effect if not present
        if (!player.statusEffects.hasEffect(StatusEffectType.Slimed) && Math.random() < 0.3) {
            const slimedAction = mikanDragonActions.find(action => action.statusEffect === StatusEffectType.Slimed);
            if (slimedAction) {
                return slimedAction;
            }
        }

        // Default to weighted random selection
        const currentPlayerState = boss.getPlayerState(player);
        const availableActions = mikanDragonActions.filter(action => {
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
mikanDragonData.finishingMove = function() {
    return [
        '「フルルル...」',
        '{boss}の体内触手が{player}を胃袋の奥へと縛り付ける...',
        '{player}は蜜柑の粘液に満たされれた体内で{boss}の幼体として培養されることになった...'
    ];
};

// Override dialogue for personality
mikanDragonData.getDialogue = function(situation: 'battle-start' | 'player-restrained' | 'player-eaten' | 'player-escapes' | 'low-hp' | 'victory') {
    const dialogues: Record<string, string[]> = {
        'battle-start': [
            'フルルル...甘い香りでしょう？',
            '蜜柑の汁が美味しいのよ',
            'そのまま私の中にいらっしゃい'
        ],
        'player-restrained': [
            'フルルル...動けないのね',
            '蜜柑の香りに包まれて...',
            'そのまま私の体内に...'
        ],
        'player-eaten': [
            'フルルル...とても甘くて美味しいわ',
            '私の体内で培養してあげる',
            'ゆっくりと蜜柑の汁に変わっていくのよ'
        ],
        'player-escapes': [
            'フルルル...まだ逃げるの？',
            '蜜柑の香りが恋しくなるでしょう',
            'また私の元に戻ってくるのよ'
        ],
        'low-hp': [
            'フルルル...まだまだよ',
            '蜜柑の力を見せてあげる',
            'もっと甘い香りを...'
        ],
        'victory': [
            'フルルル...これで私の仲間ね',
            '蜜柑の汁で満たされて幸せでしょう'
        ]
    };
    
    const options = dialogues[situation] || dialogues['battle-start'];
    return options[Math.floor(Math.random() * options.length)];
};