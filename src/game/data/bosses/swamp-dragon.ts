import { BossData, ActionType, BossAction } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffect';

const swampDragonActions: BossAction[] = [
    {
        type: ActionType.Attack,
        name: 'クロー攻撃',
        description: '鋭い爪で引っ掻く',
        damage: 8,
        weight: 40,
        playerStateCondition: 'normal'
    },
    {
        type: ActionType.Attack,
        name: '噛みつき',
        description: '強力な顎で噛みつく',
        damage: 15,
        weight: 30,
        hitRate: 70,
        playerStateCondition: 'normal'
    },
    {
        type: ActionType.StatusAttack,
        name: '炎のブレス',
        description: '灼熱の炎を吐く',
        damage: 6,
        statusEffect: StatusEffectType.Fire,
        weight: 25
    },
    {
        type: ActionType.RestraintAttack,
        name: '尻尾巻き付き',
        description: '長い尻尾でエルナルを拘束する',
        weight: 5,
        canUse: (_boss, player, _turn) => {
            // Only use restraint if player isn't already restrained and occasionally
            return !player.isRestrained() && !player.isEaten() && Math.random() < 0.3;
        }
    },
    {
        type: ActionType.Attack,
        name: '尻尾しめつけ',
        description: '拘束中のエルナルを尻尾でしめつける',
        damage: 8,
        weight: 40,
        playerStateCondition: 'restrained'
    },
    {
        type: ActionType.Attack,
        name: 'べろちゅー',
        description: '拘束中のエルナルを舌で舐め回す',
        damage: 12,
        weight: 30,
        playerStateCondition: 'restrained'
    },
];

export const swampDragonData: BossData = {
    id: 'swamp-dragon',
    name: 'SwampDragon',
    displayName: '🐲 沼のドラゴン',
    description: 'エルナルを美味しいウナギだと思って食べようとする古代のドラゴン。高い攻撃力と炎のブレスが特徴。',
    maxHp: 200,
    attackPower: 10,
    actions: swampDragonActions,
    personality: [
        '美味しそうなウナギだ...！',
        'その香り、堪らないな',
        '焼いて食べてやろう',
        'もっと熱くしてやる！',
        '逃がさないぞ',
        'この香ばしい匂い...'
    ],
    aiStrategy: (boss, player, turn) => {
        // Swamp Dragon AI Strategy
        
        // If player is eaten, use varied devour actions
        if (player.isEaten()) {
            const eatenActions = [
                {
                    type: ActionType.DevourAttack,
                    name: '消化',
                    description: 'エルナルを消化する',
                    weight: 1
                },
                {
                    type: ActionType.DevourAttack,
                    name: '体内締め付け',
                    description: 'エルナルを体内で締め付ける',
                    weight: 1
                },
                {
                    type: ActionType.DevourAttack,
                    name: '体内マッサージ',
                    description: 'エルナルを体内で優しくマッサージする',
                    weight: 1
                },
                {
                    type: ActionType.DevourAttack,
                    name: 'お腹ゆらし',
                    description: 'エルナルの入ったお腹をゆらゆらと揺らす',
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
                        description: '拘束されたエルナルを丸呑みする',
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
                        description: '無力なエルナルを尻尾で拘束する',
                        weight: 1
                    };
                } else if (random < 0.9) {
                    return {
                        type: ActionType.EatAttack,
                        name: '丸呑み',
                        description: '無力なエルナルを直接丸呑みする',
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

// Override dialogue for personality
swampDragonData.getDialogue = function(situation: 'battle-start' | 'player-restrained' | 'player-eaten' | 'player-escapes' | 'low-hp' | 'victory') {
    const dialogues: Record<string, string[]> = {
        'battle-start': [
            'おお！なんて香ばしい匂いだ！',
            '美味しそうなウナギが来たじゃないか',
            'その身、じっくりと味わってやろう'
        ],
        'player-restrained': [
            'よし、捕まえた！動くな',
            'いい匂いがするぞ...',
            'これで逃げられまい'
        ],
        'player-eaten': [
            'むむむ...この味、最高だ！',
            'もっと味わってやろう',
            'ゆっくりと消化してやる'
        ],
        'player-escapes': [
            'ちっ！逃げられたか',
            'また捕まえてやる',
            'その程度では逃げられん！'
        ],
        'low-hp': [
            'この程度でワシが倒れると思うな！',
            'まだまだやれるわ！',
            '美味い獲物は手放さん！'
        ],
        'victory': [
            'ふははは！美味かったぞ！',
            'また美味しいウナギが来るのを待っておろう'
        ]
    };
    
    const options = dialogues[situation] || dialogues['battle-start'];
    return options[Math.floor(Math.random() * options.length)];
};