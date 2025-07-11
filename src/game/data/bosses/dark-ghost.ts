import { BossData, ActionType, BossAction } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffect';

const darkGhostActions: BossAction[] = [
    {
        type: ActionType.Attack,
        name: '影の爪',
        description: '闇から現れる爪で攻撃',
        damage: 40,
        weight: 20
    },
    {
        type: ActionType.StatusAttack,
        name: '魅惑の囁き',
        description: '心を惑わす声で魅了する',
        damage: 20,
        statusEffect: StatusEffectType.Charm,
        weight: 30
    },
    {
        type: ActionType.StatusAttack,
        name: '毒の息',
        description: '有毒な息を吐く',
        damage: 30,
        statusEffect: StatusEffectType.Poison,
        weight: 25
    },
    {
        type: ActionType.StatusAttack,
        name: '鈍化の呪い',
        description: '動きを鈍らせる呪いをかける',
        damage: 15,
        statusEffect: StatusEffectType.Slow,
        weight: 20
    },
    {
        type: ActionType.RestraintAttack,
        name: '影の縛り',
        description: '影の触手でエルナルを拘束する',
        weight: 15,
        canUse: (_boss, player, _turn) => {
            // Use restraint more often when player is charmed
            const baseChance = player.statusEffects.hasEffect(StatusEffectType.Charm) ? 0.6 : 0.3;
            return !player.isRestrained() && !player.isEaten() && Math.random() < baseChance;
        }
    }
];

export const darkGhostData: BossData = {
    id: 'dark-ghost',
    name: 'DarkGhost',
    displayName: '👻 闇のおばけ',
    description: 'エルナルの魂を吸い取ろうとする邪悪なおばけ。状態異常攻撃を多用し、魅了で拘束からの脱出を困難にする。',
    maxHp: 1500,
    attackPower: 60,
    actions: darkGhostActions,
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
        
        // If player is eaten, devour them
        if (player.isEaten()) {
            return {
                type: ActionType.DevourAttack,
                name: '魂の吸収',
                description: 'エルナルの魂を吸い取る',
                weight: 1
            };
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

// Override dialogue for talkative personality
darkGhostData.getDialogue = function(situation: 'battle-start' | 'player-restrained' | 'player-eaten' | 'player-escapes' | 'low-hp' | 'victory') {
    const dialogues: Record<string, string[]> = {
        'battle-start': [
            'ケケケ...なんて美しい魂だろう',
            'その魂、私にちょうだい',
            'フフフ...いい獲物が来たね',
            '魂の匂いが堪らないよ...'
        ],
        'player-restrained': [
            'ケケケ...動けないね？',
            'その絶望した顔、いいよ〜',
            'もがけばもがくほど美味しくなる',
            'フフフ...無駄な抵抗だよ',
            'その恐怖、とても美味しい'
        ],
        'player-eaten': [
            'ああ〜美味しい魂だ',
            'もっと味わわせておくれ',
            'この絶望...最高だよ',
            'ゆっくりと魂を吸い取ってあげる',
            'ケケケ...もう逃げられないよ'
        ],
        'player-escapes': [
            'ちっ！生意気な...',
            'まだまだ諦めないよ',
            'その程度では逃げられない',
            '今度こそ捕まえてやる',
            'フン...運が良かっただけだ'
        ],
        'low-hp': [
            'くっ...まだ負けない！',
            'この程度で倒れる私じゃない',
            '魂への渇望は止まらない！',
            'もっと...もっと魂が欲しい'
        ],
        'victory': [
            'ケケケ...美味しい魂をありがとう',
            'また新しい魂を探しに行こうかね',
            'フフフ...満足だよ'
        ]
    };
    
    const options = dialogues[situation] || dialogues['battle-start'];
    return options[Math.floor(Math.random() * options.length)];
};