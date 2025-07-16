import { BossData, ActionType, BossAction } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffect';

const swampDragonActions: BossAction[] = [
    {
        type: ActionType.Attack,
        name: 'クロー攻撃',
        description: '鋭い爪で引っ掻く',
        damage: 18,
        weight: 40,
        playerStateCondition: 'normal'
    },
    {
        type: ActionType.Attack,
        name: '噛みつき',
        description: '強力な顎で噛みつく',
        damage: 30,
        weight: 25,
        hitRate: 0.7,
        criticalRate: 0.08,
        playerStateCondition: 'normal',
        damageVarianceMin: -0.2,
        damageVarianceMax: 0.5
    },
    {
        type: ActionType.StatusAttack,
        name: '炎のブレス',
        description: '灼熱の炎を吐く',
        damage: 24,
        hitRate: 0.9,
        statusEffect: StatusEffectType.Fire,
        weight: 25
    },
    {
        type: ActionType.RestraintAttack,
        name: '尻尾巻き付き',
        description: '長い尻尾で対象を拘束する',
        messages: [
            '「グルル....」',
            '<USER>は尻尾で<TARGET>を巻き付けてきた！',
        ],
        damage: 16,
        weight: 5,
        canUse: (_boss, player, _turn) => {
            // Only use restraint if player isn't already restrained and occasionally
            return !player.isRestrained() && !player.isEaten() && Math.random() < 0.3;
        }
    },
    {
        type: ActionType.Attack,
        name: '尻尾しめつけ',
        description: '拘束中の獲物を尻尾でしめつける',
        messages: [
            '「グオオオ...」',
            '<USER>は<TARGET>を尻尾で締め付ける！'
        ],
        damage: 18,
        weight: 40,
        playerStateCondition: 'restrained'
    },
    {
        type: ActionType.Attack,
        name: 'べろちゅー',
        description: '拘束中の獲物を舌でキスする（与えたダメージ分回復）',
        damage: 24,
        weight: 30,
        playerStateCondition: 'restrained',
        healRatio: 1.0
    },
];

export const swampDragonData: BossData = {
    id: 'swamp-dragon',
    name: 'SwampDragon',
    displayName: '🐲 沼のドラゴン',
    description: '沼地に生息するドラゴン',
    questNote: `沼地に生息する焼け茶色のドラゴンが、通りかかる旅人を襲い続けている。そのドラゴンを討伐し、平和を取り戻すことがあなたの任務だ。`,
    maxHp: 400,
    attackPower: 18,
    actions: swampDragonActions,
    personality: [
        'ふむ...良い匂いだな',
        'グルル...なかなか',
        'ガオー...逃がさん',
        'ウォォォ...',
        'グルルル...',
        'この匂い...悪くない'
    ],
    aiStrategy: (boss, player, turn) => {
        // Swamp Dragon AI Strategy
        
        // If player is eaten, use varied devour actions
        if (player.isEaten()) {
            const eatenActions = [
                {
                    type: ActionType.DevourAttack,
                    name: '胃液分泌',
                    description: 'ネバネバな胃液を分泌してエルナルを粘液まみれにする',
                    messages: [
                        '「グルルル...」',
                        '<USER>の胃袋が<TARGET>をネバネバな胃液まみれにする！'
                    ],
                    damage: 16,
                    statusEffect: StatusEffectType.Slimed,
                    weight: 1
                },
                {
                    type: ActionType.DevourAttack,
                    name: '体内締め付け',
                    description: '獲物を体内で締め付ける',
                    messages: [
                        '「ウォォォ...」',
                        '<USER>の体内が<TARGET>を圧迫する！'
                    ],
                    damage: 25,
                    weight: 1
                },
                {
                    type: ActionType.DevourAttack,
                    name: '体内マッサージ',
                    description: '獲物を体内で優しくマッサージする',
                    messages: [
                        '「グルル...」',
                        '<USER>が<TARGET>を優しく包み込む...'
                    ],
                    damage: 25,
                    weight: 1
                },
                {
                    type: ActionType.DevourAttack,
                    name: 'お腹ゆらし',
                    description: '獲物の入ったお腹をゆらゆらと揺らす',
                    messages: [
                        '「ガオー...」',
                        '<USER>がお腹を揺らして<TARGET>を翻弄している...'
                    ],
                    damage: 25,
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
                        name: '丸呑み',
                        description: '拘束した獲物を丸呑みする',
                        messages: [
                            '「ガオー！」',
                            '<USER>が大きな口を開け、<TARGET>を丸呑みにする！'
                        ],
                        weight: 1
                    };
                }
            } else {
                // Normal + Knocked Out: 70% chance to restrain, 20% to eat directly
                const random = Math.random();
                if (random < 0.7) {
                    return {
                        type: ActionType.RestraintAttack,
                        name: '尻尾巻き付き',
                        description: '対象を尻尾で拘束する',
                        messages: [
                            '「グルル...」',
                            '<USER>は尻尾で<TARGET>を巻き付けてきた！'
                        ],
                        weight: 1
                    };
                } else if (random < 0.9) {
                    return {
                        type: ActionType.EatAttack,
                        name: '丸呑み',
                        description: '拘束した獲物を丸呑みする',
                        messages: [
                            '「ガオー！」',
                            '<USER>が大きな口を開け、<TARGET>を丸呑みにする！'
                        ],
                        weight: 1
                    };
                }
            }
        }
        
        // Use fire breath more often when player is restrained
        if (player.isRestrained() && !player.statusEffects.hasEffect(StatusEffectType.Fire)) {
            const fireBreath = swampDragonActions.find(action => action.statusEffect === StatusEffectType.Fire);
            if (fireBreath && Math.random() < 0.7) {
                return fireBreath;
            }
        }
        
        // Prefer powerful attacks when player has high HP
        if (player.getHpPercentage() > 50) {
            const currentPlayerState = boss.getPlayerState(player);
            const highDamageActions = swampDragonActions.filter(action => 
                action.type === ActionType.Attack && 
                (action.damage || 0) >= 8 &&
                (!action.playerStateCondition || action.playerStateCondition === currentPlayerState)
            );
            
            if (highDamageActions.length > 0) {
                return highDamageActions[Math.floor(Math.random() * highDamageActions.length)];
            }
        }
        
        // Default to weighted random selection
        const currentPlayerState = boss.getPlayerState(player);
        const availableActions = swampDragonActions.filter(action => {
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
swampDragonData.finishingMove = function() {
    return [
        'グルル...<USER>は<TARGET>を体内奥深くに送り込む',
        'ウォォォ...<TARGET>は体内奥深くに閉じ込められた...'
    ];
};

// Override dialogue for personality
swampDragonData.getDialogue = function(situation: 'battle-start' | 'player-restrained' | 'player-eaten' | 'player-escapes' | 'low-hp' | 'victory') {
    const dialogues: Record<string, string[]> = {
        'battle-start': [
            'ふむ...良い匂いだな',
            'グルル...貴殿、なかなか',
            'ウォォォ...面白い'
        ],
        'player-restrained': [
            'グルル...動くなよ',
            '捕らえたぞ',
            'ガオー...おとなしくしろ'
        ],
        'player-eaten': [
            'むむ...悪くない',
            'グルルル...',
            'ゆっくり味わうとしよう'
        ],
        'player-escapes': [
            'ちっ...逃げたか',
            'ガオー！次はそうはいかん',
            'グルル...なかなかやるな'
        ],
        'low-hp': [
            'グオオオ...まだだ！',
            'この程度では倒れん',
            'ウォォォ...まだまだ！'
        ],
        'victory': [
            'ふむ...満足だ',
            'また獲物を待つとしよう'
        ]
    };
    
    const options = dialogues[situation] || dialogues['battle-start'];
    return options[Math.floor(Math.random() * options.length)];
};