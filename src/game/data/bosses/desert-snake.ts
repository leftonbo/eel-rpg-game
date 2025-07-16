import { BossData, ActionType, BossAction } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffect';
import { Boss } from '../../entities/Boss';
import { Player } from '../../entities/Player';

export const desertSnake: BossData = {
    id: 'desert-snake',
    name: 'DesertSnake',
    displayName: '🐍 砂漠のヘビ',
    description: '砂漠に生息する巨大なヘビ。砂漠で彷徨った生命体を何でも飲み込み、消化しながら遠くに連れ去ってしまう。',
    questNote: '砂漠に出現する巨大なヘビを倒せ！',
    maxHp: 180,
    attackPower: 22,
    actions: [
        {
            type: ActionType.Attack,
            name: '毒牙での攻撃',
            description: '鋭い毒牙で攻撃する',
            damage: 15,
            statusEffect: StatusEffectType.Poison,
            statusChance: 0.3,
            weight: 30,
            messages: ['<USER>は毒牙で<TARGET>を攻撃した！'],
            playerStateCondition: 'normal'
        },
        {
            type: ActionType.Attack,
            name: '締めつけ攻撃',
            description: '体で巻きつき締めつける',
            damage: 12,
            weight: 25,
            messages: ['<USER>は<TARGET>を巻きつき締めつけた！'],
            playerStateCondition: 'normal'
        },
        {
            type: ActionType.StatusAttack,
            name: '砂塵攻撃',
            description: '砂塵を巻き上げて視界を奪う',
            damage: 8,
            statusEffect: StatusEffectType.Confusion,
            statusChance: 0.7,
            weight: 20,
            messages: ['<USER>は砂塵を巻き上げて<TARGET>の視界を奪った！'],
            playerStateCondition: 'normal'
        },
        {
            type: ActionType.RestraintAttack,
            name: '尻尾による拘束',
            description: '強力な尻尾で相手を拘束する',
            damage: 10,
            weight: 35,
            messages: ['<USER>は尻尾で<TARGET>を拘束した！'],
            playerStateCondition: 'normal'
        },
        {
            type: ActionType.Attack,
            name: '拘束攻撃',
            description: '拘束状態の相手に攻撃',
            damage: 18,
            weight: 40,
            messages: ['<USER>は拘束した<TARGET>に攻撃した！'],
            playerStateCondition: 'restrained'
        },
        {
            type: ActionType.EatAttack,
            name: '丸呑み',
            description: '拘束状態の相手を丸呑みしてしまう',
            weight: 100,
            messages: ['<USER>は<TARGET>を丸呑みしてしまった！'],
            playerStateCondition: 'restrained',
            canUse: (boss: Boss, player: Player) => {
                const playerState = boss.getPlayerState(player);
                const restraintEffect = player.statusEffects.getEffect(StatusEffectType.Restrained);
                const restraintTurns = restraintEffect ? (5 - restraintEffect.duration) : 0;
                return playerState === 'restrained' && restraintTurns >= 3;
            }
        },
        {
            type: ActionType.DevourAttack,
            name: '消化液攻撃',
            description: '体内の消化液でダメージを与える',
            damage: 12,
            weight: 50,
            messages: ['<USER>の消化液が<TARGET>を蝕んだ！'],
            playerStateCondition: 'eaten'
        },
        {
            type: ActionType.DevourAttack,
            name: '最大HP吸収',
            description: '最大HPを吸収する',
            weight: 30,
            messages: ['<USER>は<TARGET>の生命力を吸収した！'],
            playerStateCondition: 'eaten'
        }
    ],
    personality: [
        'シャアアア...',
        'ここは私の縄張りだ...',
        '砂漠の掟に従え...',
        'お前も砂と化すのだ...',
        'この砂漠に骨を埋めるがいい...'
    ],
    aiStrategy: (boss: Boss, player: Player, turn: number) => {
        // If player is defeated, use special post-defeat actions
        if (player.isDefeated()) {
            const postDefeatedActions: BossAction[] = [
                {
                    type: ActionType.PostDefeatedAttack,
                    name: '砂漠の消化活動',
                    description: '砂漠のヘビの体内で消化液が分泌され、エルナルの体力を吸収し続ける',
                    messages: [
                        'シャアアア...',
                        '<USER>の体内で消化液がゆっくりと分泌されている...',
                        '<TARGET>の体が徐々に砂漠の一部となっていく...'
                    ],
                    statusEffect: StatusEffectType.Weakness,
                    weight: 1
                },
                {
                    type: ActionType.PostDefeatedAttack,
                    name: '砂漠の締めつけ',
                    description: '砂漠のヘビの体内で締めつけられ、エルナルの体力を削り続ける',
                    messages: [
                        'シャアアア...',
                        '<USER>の体内でじわじわと締めつけられている...',
                        '<TARGET>の体が砂漠の王者の胃袋に圧迫されている...'
                    ],
                    statusEffect: StatusEffectType.Exhausted,
                    weight: 1
                },
                {
                    type: ActionType.PostDefeatedAttack,
                    name: '砂漠の栄養吸収',
                    description: '砂漠のヘビが体内でエルナルの栄養を吸収し続ける',
                    messages: [
                        'シャアアア...',
                        '<USER>が<TARGET>の生命力を吸収している...',
                        '<TARGET>の体が砂漠の養分として取り込まれていく...'
                    ],
                    statusEffect: StatusEffectType.Weakness,
                    weight: 1
                },
                {
                    type: ActionType.PostDefeatedAttack,
                    name: '砂漠の眠り',
                    description: '砂漠のヘビの体内で暖かい眠りに包まれる',
                    messages: [
                        'シャアアア...',
                        '<USER>の体内で<TARGET>は深い眠りに包まれている...',
                        '砂漠の王者の胃袋で永遠の眠りに誘われている...'
                    ],
                    statusEffect: StatusEffectType.Sleep,
                    weight: 1
                },
                {
                    type: ActionType.PostDefeatedAttack,
                    name: '砂漠の魅了',
                    description: '砂漠のヘビの体内で心を奪われ続ける',
                    messages: [
                        'シャアアア...',
                        '<USER>の体内で<TARGET>は砂漠の魅力に取り憑かれている...',
                        '砂漠の王者の魅力に完全に支配されている...'
                    ],
                    statusEffect: StatusEffectType.Charm,
                    weight: 1
                }
            ];
            return postDefeatedActions[Math.floor(Math.random() * postDefeatedActions.length)];
        }
        
        const playerState = boss.getPlayerState(player);
        const availableActions = desertSnake.actions.filter(action => {
            if (action.playerStateCondition && action.playerStateCondition !== playerState) {
                return false;
            }
            
            if (action.canUse && !action.canUse(boss, player, turn)) {
                return false;
            }
            
            return true;
        });

        if (availableActions.length === 0) {
            return desertSnake.actions.find(action => action.type === ActionType.Skip) || desertSnake.actions[0];
        }
        
        if (player.isRestrained()) {
            const restraintEffect = player.statusEffects.getEffect(StatusEffectType.Restrained);
            const restraintTurns = restraintEffect ? (5 - restraintEffect.duration) : 0;
            
            if (restraintTurns >= 3) {
                const swallowAction = availableActions.find(action => action.type === ActionType.EatAttack);
                if (swallowAction) {
                    return swallowAction;
                }
            }
        }

        if (player.isEaten()) {
            const digestActions = availableActions.filter(action => action.type === ActionType.DevourAttack);
            if (digestActions.length > 0) {
                if (Math.random() < 0.7) {
                    return digestActions[0];
                } else {
                    return digestActions[1] || digestActions[0];
                }
            }
        }

        if (player.isRestrained()) {
            const restraintActions = availableActions.filter(action => 
                action.playerStateCondition === 'restrained'
            );
            if (restraintActions.length > 0 && Math.random() < 0.8) {
                return restraintActions[Math.floor(Math.random() * restraintActions.length)];
            }
        }

        if (!player.isRestrained() && !player.isEaten() && Math.random() < 0.4) {
            const restraintAction = availableActions.find(action => action.type === ActionType.RestraintAttack);
            if (restraintAction) {
                return restraintAction;
            }
        }

        if (turn % 3 === 0 && Math.random() < 0.6) {
            const statusActions = availableActions.filter(action => 
                action.type === ActionType.StatusAttack
            );
            if (statusActions.length > 0) {
                return statusActions[Math.floor(Math.random() * statusActions.length)];
            }
        }

        const totalWeight = availableActions.reduce((sum: number, action: BossAction) => sum + action.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const action of availableActions) {
            random -= action.weight;
            if (random <= 0) {
                return action;
            }
        }
        
        return availableActions[0];
    },
    getDialogue: (situation: 'battle-start' | 'player-restrained' | 'player-eaten' | 'player-escapes' | 'low-hp' | 'victory') => {
        const dialogues: Record<string, string[]> = {
            'battle-start': [
                'シャアアア... 新しい獲物か...',
                'この砂漠で迷子になったようだな...',
                '砂の中に沈んでしまえ...'
            ],
            'player-restrained': [
                'シャアアア... 逃げられないぞ...',
                'もがけばもがくほど締めつけが強くなる...',
                '諦めて私の餌になるがいい...'
            ],
            'player-eaten': [
                'シャアアア... 暖かい胃袋の中はどうだ？',
                'ゆっくりと消化してやろう...',
                '砂漠の養分になってもらおう...'
            ],
            'player-escapes': [
                'シャアアア... 逃げられるかな？',
                '砂漠の果てまで追いかけてやる...',
                '次はもっと強く縛り上げてやる...'
            ],
            'low-hp': [
                'グルルル... まだ終わらんぞ...',
                '砂漠の王者を舐めるなよ...',
                '最後の力を振り絞ってやる...'
            ],
            'victory': [
                'シャアアア... また一つ砂となった...',
                '砂漠に骨を埋めるがいい...',
                '私の縄張りから出ていけ...'
            ]
        };
        
        const messages = dialogues[situation] || ['シャアアア...'];
        return messages[Math.floor(Math.random() * messages.length)];
    },
    finishingMove: () => [
        '🐍 砂漠のヘビは最後の力を振り絞る...',
        '砂塵が舞い上がり、巨大な影が迫る...',
        'シャアアアアア！！！',
        '砂漠の王者の最期の咆哮が響いた...'
    ]
};