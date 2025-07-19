import { BossData, ActionType, BossAction, Boss } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffectTypes';

const swampDragonActions: BossAction[] = [
    {
        type: ActionType.Attack,
        name: 'クロー攻撃',
        description: '鋭い爪で引っ掻く',
        damageFormula: (user: Boss) => user.attackPower,
        weight: 40,
        playerStateCondition: 'normal'
    },
    {
        type: ActionType.Attack,
        name: '噛みつき',
        description: '強力な顎で噛みつく',
        damageFormula: (user: Boss) => Math.floor(user.attackPower * 1.5),
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
        damageFormula: (user: Boss) => Math.floor(user.attackPower * 1.3),
        hitRate: 0.9,
        statusEffect: StatusEffectType.Fire,
        weight: 25
    },
    {
        type: ActionType.RestraintAttack,
        name: '尻尾巻き付き',
        description: '長い尻尾で対象を拘束する',
        messages: [
            '「グルル...」',
            '<USER>は尻尾で<TARGET>を巻き付けてきた！',
        ],
        damageFormula: (user: Boss) => Math.floor(user.attackPower * 0.9),
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
        damageFormula: (user: Boss) => user.attackPower,
        weight: 40,
        playerStateCondition: 'restrained'
    },
    {
        type: ActionType.Attack,
        name: 'べろちゅー',
        description: '拘束中の獲物を舌でキスする（与えたダメージ分回復）',
        damageFormula: (user: Boss) => Math.floor(user.attackPower * 1.3),
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
    icon: '🐲',
    personality: [
        'ふむ...良い匂いだな',
        'グルル...なかなか',
        'ガオー...逃がさん',
        'ウォォォ...',
        'グルルル...',
        'この匂い...悪くない'
    ],
    customVariables: {
        fireBreathCooldown: 0,
        aggressionLevel: 1,
        hasUsedFinisher: false,
        restraintAttempts: 0
    },
    aiStrategy: (boss, player, turn) => {
        // Swamp Dragon AI Strategy
        
        // カスタム変数を使用してクールダウン管理
        const fireBreathCooldown = boss.getCustomVariable<number>('fireBreathCooldown') || 0;
        const aggressionLevel = boss.getCustomVariable<number>('aggressionLevel') || 1;
        
        // クールダウンを減らす
        if (fireBreathCooldown > 0) {
            boss.setCustomVariable('fireBreathCooldown', fireBreathCooldown - 1);
        }
        
        // 体力に応じてアグレッションレベルを調整
        const hpPercentage = boss.getHpPercentage();
        if (hpPercentage < 30) {
            boss.setCustomVariable('aggressionLevel', 3);
        } else if (hpPercentage < 60) {
            boss.setCustomVariable('aggressionLevel', 2);
        }

        // If player is defeated, use special post-defeat actions
        if (player.isDefeated()) {
            const postDefeatedActions: BossAction[] = [
                {
                    type: ActionType.PostDefeatedAttack,
                    name: '深い体内での消化活動',
                    description: '深い体内で消化液を分泌し、獲物の体力を吸収し続ける',
                    messages: [
                        '「グルルル...」',
                        '<USER>の体内奥深くで消化液がゆっくりと分泌されている...',
                        '<TARGET>の体が徐々に体力を失っていく...'
                    ],
                    statusEffect: StatusEffectType.Weakness,
                    weight: 1
                },
                {
                    type: ActionType.PostDefeatedAttack,
                    name: '体内圧迫',
                    description: '体内の壁で獲物を優しく圧迫し続ける',
                    messages: [
                        '「ウォォォ...」',
                        '<USER>の体内の壁が<TARGET>をゆっくりと圧迫している...',
                        '<TARGET>は深い体内で身動きが取れない...'
                    ],
                    statusEffect: StatusEffectType.Exhausted,
                    weight: 1
                },
                {
                    type: ActionType.PostDefeatedAttack,
                    name: '体内栄養吸収',
                    description: '体内で獲物から栄養を吸収し続ける',
                    messages: [
                        '「グルル...」',
                        '<USER>が<TARGET>から栄養を吸収している...',
                        '<TARGET>の体力が徐々に奪われていく...'
                    ],
                    statusEffect: StatusEffectType.Weakness,
                    weight: 1
                },
                {
                    type: ActionType.PostDefeatedAttack,
                    name: '体内温熱療法',
                    description: '体内の温かさで獲物を包み込み続ける',
                    messages: [
                        '「ウォォォ...」',
                        '<USER>の体内の温かさが<TARGET>を包み込んでいる...',
                        '<TARGET>は深い体内で意識が朦朧としている...'
                    ],
                    statusEffect: StatusEffectType.Sleep,
                    weight: 1
                },
                {
                    type: ActionType.PostDefeatedAttack,
                    name: '体内マッサージ',
                    description: '体内の筋肉で獲物を優しくマッサージし続ける',
                    messages: [
                        '「グルル...」',
                        '<USER>の体内の筋肉が<TARGET>を優しくマッサージしている...',
                        '<TARGET>は抵抗することができない...'
                    ],
                    statusEffect: StatusEffectType.Charm,
                    weight: 1
                }
            ];
            return postDefeatedActions[Math.floor(Math.random() * postDefeatedActions.length)];
        }
        
        // If player is eaten, use varied devour actions
        if (player.isEaten()) {
            const eatenActions = [
                {
                    type: ActionType.DevourAttack,
                    name: '胃液分泌',
                    description: 'ネバネバな胃液を分泌して獲物を粘液まみれにする',
                    messages: [
                        '「グルルル...」',
                        '<USER>の胃袋が<TARGET>をネバネバな胃液まみれにする！'
                    ],
                    damageFormula: (user: Boss) => Math.floor(user.attackPower * 0.9),
                    statusEffect: StatusEffectType.Slimed,
                    weight: 1
                },
                {
                    type: ActionType.DevourAttack,
                    name: '体内締め付け',
                    description: '獲物を体内で締め付ける',
                    messages: [
                        '「ウォォォ...」',
                        '<USER>の胃壁が<TARGET>の体を圧迫する！'
                    ],
                    damageFormula: (user: Boss) => Math.floor(user.attackPower * 1.4),
                    weight: 1
                },
                {
                    type: ActionType.DevourAttack,
                    name: '体内マッサージ',
                    description: '獲物を体内で優しくマッサージする',
                    messages: [
                        '「グルル...」',
                        '<USER>の胃壁が<TARGET>を優しくマッサージしている...'
                    ],
                    damageFormula: (user: Boss) => Math.floor(user.attackPower * 1.4),
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
                    damageFormula: (user: Boss) => Math.floor(user.attackPower * 1.4),
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
                    // 拘束試行回数を記録
                    boss.modifyCustomVariable('restraintAttempts', 1);
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
        
        // Use fire breath more often when player is restrained (only if not on cooldown)
        if (player.isRestrained() && !player.statusEffects.hasEffect(StatusEffectType.Fire) && fireBreathCooldown === 0) {
            const fireBreath = swampDragonActions.find(action => action.statusEffect === StatusEffectType.Fire);
            if (fireBreath && Math.random() < 0.7 * aggressionLevel) {
                // 火のブレス使用時にクールダウンを設定
                boss.setCustomVariable('fireBreathCooldown', 3);
                return fireBreath;
            }
        }
        
        // Prefer powerful attacks when player has high HP (chance influenced by aggression level)
        if (player.getHpPercentage() > 50 && Math.random() < 0.5 + (0.2 * aggressionLevel)) {
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
        '「グルル...」',
        '<USER>は<TARGET>を体内の奥深くに送り込む！',
        '<TARGET>は体内奥深くに閉じ込められ、<USER>が満足するまで体力を吸収され続けることになった...'
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