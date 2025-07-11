import { BossData, ActionType, BossAction } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffect';

const swampDragonActions: BossAction[] = [
    {
        type: ActionType.Attack,
        name: 'クロー攻撃',
        description: '鋭い爪で引っ掻く',
        damage: 8,
        weight: 40
    },
    {
        type: ActionType.Attack,
        name: '噛みつき',
        description: '強力な顎で噛みつく',
        damage: 12,
        weight: 30
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
    }
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
        
        // If player is eaten, devour them
        if (player.isEaten()) {
            return {
                type: ActionType.DevourAttack,
                name: '消化',
                description: 'エルナルを消化する',
                weight: 1
            };
        }
        
        // Prefer powerful attacks when player has high HP
        if (player.getHpPercentage() > 50) {
            const highDamageActions = swampDragonActions.filter(action => 
                action.type === ActionType.Attack && (action.damage || 0) >= 80
            );
            
            if (highDamageActions.length > 0) {
                return highDamageActions[Math.floor(Math.random() * highDamageActions.length)];
            }
        }
        
        // Use fire breath more often when player is restrained
        if (player.isRestrained() && !player.statusEffects.hasEffect(StatusEffectType.Fire)) {
            const fireBreath = swampDragonActions.find(action => action.statusEffect === StatusEffectType.Fire);
            if (fireBreath && Math.random() < 0.7) {
                return fireBreath;
            }
        }
        
        // Default to weighted random selection
        const availableActions = swampDragonActions.filter(action => {
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