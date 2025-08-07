import { BossData, ActionType, BossAction, Boss } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffectTypes';

// Swamp Dragon
// 沼竜ヌリグ
// Reference document: /docs/bosses/swamp-dragon.md

const swampDragonActions: BossAction[] = [
    {
        id: 'claw-attack',
        type: ActionType.Attack,
        name: 'クロー攻撃',
        description: '鋭い爪で引っ掻く',
        damageFormula: (user: Boss) => user.attackPower,
        weight: 40,
        playerStateCondition: 'normal'
    },
    {
        id: 'bite-attack',
        type: ActionType.Attack,
        name: '噛みつき',
        description: '強力な顎で噛みつく',
        damageFormula: (user: Boss) => user.attackPower * 1.5,
        weight: 25,
        hitRate: 0.7,
        criticalRate: 0.08,
        playerStateCondition: 'normal',
        damageVarianceMin: -0.2,
        damageVarianceMax: 0.5
    },
    {
        id: 'fire-breath',
        type: ActionType.StatusAttack,
        name: '炎のブレス',
        description: '灼熱の炎を吐く',
        damageFormula: (user: Boss) => user.attackPower * 1.3,
        hitRate: 0.9,
        statusEffect: StatusEffectType.Fire,
        weight: 25
    },
    {
        id: 'tail-wrap',
        type: ActionType.RestraintAttack,
        name: '尻尾巻き付き',
        description: '長い尻尾で対象を拘束する',
        messages: [
            '「グルル...」',
            '{boss}は尻尾で{player}を巻き付けてきた！',
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.9,
        weight: 10,
        canUse: (_boss, player, _turn) => {
            // Only use restraint if player isn't already restrained and occasionally
            return !player.isRestrained() && !player.isEaten() && Math.random() < 0.3;
        }
    },
    {
        id: 'tail-squeeze',
        type: ActionType.Attack,
        name: '尻尾しめつけ',
        description: '拘束中の獲物を尻尾でしめつける',
        messages: [
            '「グオオオ...」',
            '{boss}は{player}を尻尾で締め付ける！'
        ],
        damageFormula: (user: Boss) => user.attackPower,
        weight: 40,
        playerStateCondition: 'restrained'
    },
    {
        id: 'tongue-kiss',
        type: ActionType.Attack,
        name: 'べろちゅー',
        description: '拘束中の獲物を舌でキスする（与えたダメージ分回復）',
        messages: [
            '「グルル...」',
            '{boss}は{player}の口に舌を押し付けながら深いキスをする！',
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.3,
        weight: 30,
        playerStateCondition: 'restrained',
        healRatio: 1.0
    },
];

export const swampDragonData: BossData = {
    id: 'swamp-dragon',
    name: 'SwampDragon',
    displayName: '沼のドラゴン',
    description: '沼地に生息するドラゴン',
    questNote: `沼地に生息する焼け茶色のドラゴンが、通りかかる旅人を襲い続けている。そのドラゴンを討伐し、平和を取り戻すことがあなたの任務だ。`,
    appearanceNote: 'ドラゴン、焼け茶色の体毛、薄茶色の蛇腹、長い尻尾、薄紫の瞳、焦げ緑色のたてがみ、薄緑色の角、ピンクの体内',
    maxHp: 400,
    attackPower: 24,
    actions: swampDragonActions,
    icon: '🐲',
    explorerLevelRequired: 0,
    battleStartMessages: [
        {
            speaker: 'player',
            style: 'default',
            text: 'あなたは沼地の奥で巨大なドラゴンと遭遇した。'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「グルル...獲物のニオイ...」'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: '沼のドラゴンは威厳ある眼差しであなたを見つめている...'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「この沼地はオイラの縄張り！オマエを食べちゃうゾ！」'
        }
    ],
    victoryMessages: [
        {
            speaker: 'boss',
            style: 'talk',
            text: '「グオオオ...！オマエは強いな！」'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「オイラ、負けた...」'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: '沼のドラゴンは誇り高い戦士として敗北を受け入れ、静かに沼の奥へと引いていった...'
        }
    ],
    victoryTrophy: {
        name: '沼竜のたてがみ',
        description: '沼のドラゴンの立派なたてがみ。荒々しい戦いの証として威厳を放っている。'
    },
    defeatTrophy: {
        name: '沼のような粘液',
        description: '沼のドラゴンの体内から採取した、底なし沼のようにネバネバした粘液。沼地の神秘的な力が宿っている。'
    },
    customVariables: {
        defeatStartTurn: -1,
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
            let defeatStartTurn = boss.getCustomVariable('defeatStartTurn', -1);
            if (defeatStartTurn === -1) {
                // 敗北開始ターンを記録
                defeatStartTurn = turn - 1;
                boss.setCustomVariable('defeatStartTurn', defeatStartTurn);
            }

            const turnsSinceDefeat = turn - boss.getCustomVariable<number>('defeatStartTurn', turn);
            // 8 ターンごとに特殊演出
            if (turnsSinceDefeat > 0 && turnsSinceDefeat % 8 === 0) {
                return {
                    id: 'swamp-stew-shower',
                    type: ActionType.PostDefeatedAttack,
                    name: '沼のシチューかけ',
                    description: '沼のシチューを食べて、体内のプレイヤーに浴びせる',
                    messages: [
                        '「グルル...！」',
                        '{boss}が沼のシチューをゆっくりと味わって食べている...',
                        '突然、温かい沼のシチューが{player}の体に降り注ぐ！',
                        '{player}は体内で沼の風味豊かなシチューまみれになってしまった...'
                    ],
                    weight: 1
                };
            }
            
            const postDefeatedActions: BossAction[] = [
                {
                    id: 'deep-digestion',
                    type: ActionType.PostDefeatedAttack,
                    name: '深い体内での消化活動',
                    description: '深い体内で消化液を分泌し、獲物の体力を吸収し続ける',
                    messages: [
                        '「グルルル...」',
                        '{boss}の体内奥深くで消化液がゆっくりと分泌されている...',
                        '{player}の体が徐々に体力を失っていく...'
                    ],
                    weight: 1
                },
                {
                    id: 'internal-pressure',
                    type: ActionType.PostDefeatedAttack,
                    name: '体内圧迫',
                    description: '体内の壁で獲物を優しく圧迫し続ける',
                    messages: [
                        '「ウォォォ...」',
                        '{boss}の体内の壁が{player}をゆっくりと圧迫している...',
                        '{player}は深い体内で身動きが取れない...'
                    ],
                    weight: 1
                },
                {
                    id: 'nutrition-absorption',
                    type: ActionType.PostDefeatedAttack,
                    name: '体内栄養吸収',
                    description: '体内で獲物から栄養を吸収し続ける',
                    messages: [
                        '「グルル...」',
                        '{boss}が{player}から栄養を吸収している...',
                        '{player}の体力が徐々に奪われていく...'
                    ],
                    statusEffect: StatusEffectType.Weakness,
                    weight: 1
                },
                {
                    id: 'internal-warmth',
                    type: ActionType.PostDefeatedAttack,
                    name: '体内温熱療法',
                    description: '体内の温かさで獲物を包み込み続ける',
                    messages: [
                        '「ウォォォ...」',
                        '{boss}の体内の温かさが{player}を包み込んでいる...',
                        '{player}は深い体内で意識が朦朧としている...'
                    ],
                    statusEffect: StatusEffectType.Sleep,
                    weight: 1
                },
                {
                    id: 'internal-massage',
                    type: ActionType.PostDefeatedAttack,
                    name: '体内マッサージ',
                    description: '体内の筋肉で獲物を優しくマッサージし続ける',
                    messages: [
                        '「グルル...」',
                        '{boss}の体内の筋肉が{player}を優しくマッサージしている...',
                        '{player}は抵抗することができない...'
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
                    id: 'stomach-acid',
                    type: ActionType.DevourAttack,
                    name: '胃液分泌',
                    description: 'ネバネバな胃液を分泌して獲物を粘液まみれにする',
                    messages: [
                        '「グルルル...」',
                        '{boss}の胃袋が{player}をネバネバな胃液まみれにする！'
                    ],
                    damageFormula: (user: Boss) => user.attackPower * 0.9,
                    statusEffect: StatusEffectType.Slimed,
                    weight: 1
                },
                {
                    id: 'stomach-squeeze',
                    type: ActionType.DevourAttack,
                    name: '体内締め付け',
                    description: '獲物を体内で締め付ける',
                    messages: [
                        '「ウォォォ...」',
                        '{boss}の胃壁が{player}の体を圧迫する！'
                    ],
                    damageFormula: (user: Boss) => user.attackPower * 1.4,
                    weight: 1
                },
                {
                    id: 'stomach-massage',
                    type: ActionType.DevourAttack,
                    name: '体内マッサージ',
                    description: '獲物を体内で優しくマッサージする',
                    messages: [
                        '「グルル...」',
                        '{boss}の胃壁が{player}を優しくマッサージしている...'
                    ],
                    damageFormula: (user: Boss) => user.attackPower * 1.4,
                    weight: 1
                },
                {
                    id: 'belly-sway',
                    type: ActionType.DevourAttack,
                    name: 'お腹ゆらし',
                    description: '獲物の入ったお腹をゆらゆらと揺らす',
                    messages: [
                        '「ガオー...」',
                        '{boss}がお腹を揺らして{player}を翻弄している...'
                    ],
                    damageFormula: (user: Boss) => user.attackPower * 1.4,
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
                        id: 'swallow-whole-restrained',
                        type: ActionType.EatAttack,
                        name: '丸呑み',
                        description: '拘束した獲物を丸呑みする',
                        messages: [
                            '「ガオー！」',
                            '{boss}が大きな口を開け、{player}を丸呑みにする！'
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
                        id: 'tail-wrap-ko',
                        type: ActionType.RestraintAttack,
                        name: '尻尾巻き付き',
                        description: '対象を尻尾で拘束する',
                        messages: [
                            '「グルル...」',
                            '{boss}は尻尾で{player}を巻き付けてきた！'
                        ],
                        weight: 1
                    };
                } else if (random < 0.9) {
                    return {
                        id: 'swallow-whole-direct',
                        type: ActionType.EatAttack,
                        name: '丸呑み',
                        description: '拘束した獲物を丸呑みする',
                        messages: [
                            '「ガオー！」',
                            '{boss}が大きな口を開け、{player}を丸呑みにする！'
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
        '{boss}は{player}を体内の奥深くに送り込む！',
        '{player}は体内奥深くに閉じ込められ、{boss}が満足するまで体力を吸収され続けることになった...'
    ];
};
