import { BossData, ActionType, BossAction } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffect';

const mikanDragonActions: BossAction[] = [
    {
        type: ActionType.Attack,
        name: '蜜柑の爪',
        description: '蜜柑のような鋭い爪で攻撃',
        messages: ['<USER>は蜜柑のような鋭い爪で<TARGET>を攻撃した！'],
        damage: 12,
        weight: 25,
        playerStateCondition: 'normal'
    },
    {
        type: ActionType.Attack,
        name: '蜜柑の尻尾',
        description: '蜜柑色の尻尾で叩く',
        messages: ['<USER>は蜜柑色の尻尾で<TARGET>を叩いた！'],
        damage: 15,
        weight: 20,
        playerStateCondition: 'normal'
    },
    {
        type: ActionType.StatusAttack,
        name: '蜜柑の香り',
        description: '甘い蜜柑の香りでエルナルを魅了する',
        messages: ['<USER>は甘い蜜柑の香りを放った！'],
        damage: 8,
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
        type: ActionType.StatusAttack,
        name: '蜜柑の粘液',
        description: '蜜柑の汁のような粘液でエルナルをネバネバにする',
        messages: ['<USER>は口から蜜柑のような粘液を放った！'],
        damage: 10,
        hitRate: 0.95,
        statusEffect: StatusEffectType.Slimed,
        weight: 25
    },
    {
        type: ActionType.RestraintAttack,
        name: '蜜柑の舌巻き付け',
        description: '長い舌でエルナルを拘束する',
        messages: [
            '「フルルル...」',
            '<USER>は長い舌で<TARGET>を巻き付けてきた！'
        ],
        damage: 14,
        weight: 15,
        hitRate: 0.85,
        canUse: (_boss, player, _turn) => {
            return !player.isRestrained() && !player.isEaten() && Math.random() < 0.4;
        }
    },
    {
        type: ActionType.Attack,
        name: '蜜柑しぼり',
        description: '舌でエルナルを締め付ける',
        messages: [
            '「フルルル...」',
            '<USER>は巻き付けた舌で<TARGET>を締め付ける！'
        ],
        damage: 18,
        weight: 30,
        playerStateCondition: 'restrained'
    },
    {
        type: ActionType.Attack,
        name: '蜜柑のキス',
        description: '舌でエルナルを舐めて体力を吸収する',
        messages: [
            '「フルルル...」',
            '<USER>は<TARGET>を体ごとキスして体力を吸収する！'
        ],
        damage: 22,
        weight: 25,
        playerStateCondition: 'restrained',
        healRatio: 1.0
    },
    {
        type: ActionType.StatusAttack,
        name: '蜜柑汁注入',
        description: '舌を口に入れて蜜柑の汁を注入し、魅了する',
        messages: [
            '「フルルル...」',
            '<USER>は舌を<TARGET>の口に入れて蜜柑の汁を注入している！'
        ],
        damage: 16,
        statusEffect: StatusEffectType.Charm,
        weight: 20,
        playerStateCondition: 'restrained'
    }
];

export const mikanDragonData: BossData = {
    id: 'mikan-dragon',
    name: 'MikanDragon',
    displayName: '🍊 蜜柑ドラゴン',
    description: '蜜柑の香りを放つ甘いドラゴン',
    questNote: `蜜柑畑に現れた美しいドラゴンが、通りかかる旅人を甘い香りで誘い込んでいるという。その蜜柑ドラゴンを調査し、対処することがあなたの任務だ。`,
    maxHp: 350,
    attackPower: 14,
    actions: mikanDragonActions,
    icon: '🍊',
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
            const postDefeatedActions: BossAction[] = [
                {
                    type: ActionType.PostDefeatedAttack,
                    name: '蜜柑汁培養',
                    description: 'エルナルの体を蜜柑の汁で満たし、培養し続ける',
                    messages: [
                        '「フルルル...」',
                        '<USER>の体内で蜜柑の汁が<TARGET>を培養している...',
                        '<TARGET>の体は徐々に蜜柑ドラゴンの幼体のような姿に変わっていく...'
                    ],
                    statusEffect: StatusEffectType.Charm,
                    weight: 1
                },
                {
                    type: ActionType.PostDefeatedAttack,
                    name: '蜜柑触手愛撫',
                    description: '体内触手でエルナルを優しく愛撫し続ける',
                    messages: [
                        '「フルルル...」',
                        '<USER>の体内触手が<TARGET>を優しく愛撫している...',
                        '<TARGET>は徐々に抵抗する意志を失っていく...'
                    ],
                    statusEffect: StatusEffectType.Lethargy,
                    weight: 1
                },
                {
                    type: ActionType.PostDefeatedAttack,
                    name: '蜜柑同族化',
                    description: '蜜柑の汁を注入してエルナルを同族化させる',
                    messages: [
                        '「フルルル...」',
                        '<USER>が<TARGET>に大量の蜜柑汁を注入している...',
                        '<TARGET>の体は蜜柑ドラゴンの幼体へと変化している...'
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
                    type: ActionType.DevourAttack,
                    name: '蜜柑汁注入',
                    description: '体内触手で蜜柑の汁を注入し、最大HPを減らす',
                    messages: [
                        '「フルルル...」',
                        '<USER>の体内触手が<TARGET>の口に蜜柑汁を注入している！'
                    ],
                    damage: 20,
                    statusEffect: StatusEffectType.Charm,
                    weight: 1
                },
                {
                    type: ActionType.DevourAttack,
                    name: '蜜柑マッサージ',
                    description: '蜜柑の果肉のような胃壁でマッサージし、最大HPを減らす',
                    messages: [
                        '「フルルル...」',
                        '<USER>の胃壁が<TARGET>を蜜柑の果肉のように優しくマッサージしている！'
                    ],
                    damage: 25,
                    weight: 1
                },
                {
                    type: ActionType.DevourAttack,
                    name: '蜜柑触手くすぐり',
                    description: '体内触手でくすぐり、最大HPを減らして脱力状態にする',
                    messages: [
                        '「フルルル...」',
                        '<USER>の体内触手が<TARGET>をくすぐっている！'
                    ],
                    damage: 22,
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
                        type: ActionType.EatAttack,
                        name: '蜜柑の丸呑み',
                        description: '拘束したエルナルを丸呑みする',
                        messages: [
                            '「フルルル...」',
                            '<USER>が大きな口を開け、<TARGET>を丸呑みにする！'
                        ],
                        weight: 1
                    };
                }
            } else {
                // Normal + Knocked Out: 60% chance to restrain, 30% to eat directly
                const random = Math.random();
                if (random < 0.6) {
                    return {
                        type: ActionType.RestraintAttack,
                        name: '蜜柑の舌巻き付け',
                        description: '長い舌でエルナルを拘束する',
                        messages: [
                            '「フルルル...」',
                            '<USER>は長い舌で<TARGET>を巻き付けてきた！'
                        ],
                        weight: 1
                    };
                } else if (random < 0.9) {
                    return {
                        type: ActionType.EatAttack,
                        name: '蜜柑の丸呑み',
                        description: '拘束したエルナルを丸呑みする',
                        messages: [
                            '「フルルル...」',
                            '<USER>が大きな口を開け、<TARGET>を丸呑みにする！'
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
        '<USER>の体内触手が<TARGET>を胃袋の奥へと縛り付ける...',
        '<TARGET>は蜜柑の粘液に満たされれた体内で<USER>の幼体として培養されることになった...'
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