import { BossData, ActionType, BossAction, Boss } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffectTypes';

const seaKrakenActions: BossAction[] = [
    {
        id: 'tentacle-slap',
        type: ActionType.Attack,
        name: '触手ビンタ',
        description: '太い触手で相手を叩く',
        damageFormula: (user: Boss) => user.attackPower * 1.0,
        weight: 35,
        playerStateCondition: 'normal'
    },
    {
        id: 'tentacle-slam',
        type: ActionType.Attack,
        name: '叩きつけ',
        description: '触腕を大きく振り上げて叩きつける',
        damageFormula: (user: Boss) => user.attackPower * 1.9,
        weight: 20,
        hitRate: 0.65,
        playerStateCondition: 'normal',
        damageVarianceMin: -0.15,
        damageVarianceMax: 0.4
    },
    {
        id: 'ink-spray',
        type: ActionType.StatusAttack,
        name: 'イカスミブレス',
        description: '前方にイカスミを吐き出し、視界を奪う',
        damageFormula: (user: Boss) => user.attackPower * 0.8,
        hitRate: 0.9,
        statusEffect: StatusEffectType.VisionImpairment,
        weight: 25,
        messages: [
            '「グゥゥゥ...」',
            '<USER>が黒いイカスミを吐き出した！',
            '<TARGET>の視界が阻害される！'
        ]
    },
    {
        id: 'tentacle-wrap',
        type: ActionType.RestraintAttack,
        name: '触腕巻き付け',
        description: '長い触腕で対象を拘束する',
        messages: [
            '「グルルル...」',
            '<USER>の触腕が<TARGET>に巻き付いた！',
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.9,
        weight: 10,
        canUse: (_boss, player, _turn) => {
            return !player.isRestrained() && !player.isEaten() && Math.random() < 0.4;
        }
    },
    {
        id: 'tentacle-suction',
        type: ActionType.Attack,
        name: '触腕吸引',
        description: '拘束中の獲物を吸盤で吸引し、エネルギーを吸収する',
        messages: [
            '「シュゥゥゥ...」',
            '<USER>の触腕が<TARGET>を強く吸引する！',
            'エネルギーが吸収されていく...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.3,
        weight: 40,
        playerStateCondition: 'restrained',
        healRatio: 0.8
    },
    {
        id: 'ink-injection',
        type: ActionType.StatusAttack,
        name: 'イカスミ注入',
        description: '拘束中の獲物にイカスミを注入し、魅了状態にする',
        messages: [
            '「ゴポポポ...」',
            '<USER>が触腕を<TARGET>の口に入れてイカスミを注入した！',
            '<TARGET>は催眠効果で魅了されてしまう...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.5,
        weight: 30,
        playerStateCondition: 'restrained',
        statusEffect: StatusEffectType.Charm
    }
];

export const seaKrakenData: BossData = {
    id: 'sea-kraken',
    name: 'SeaKraken',
    displayName: '🦑 海のクラーケン',
    description: '深海に生息する巨大な紫色のイカ',
    questNote: `深海に生息する紫色の体と触手を持つ巨大イカが、海岸に現れて生き物をなんでも飲み込んでいる。その強力な吸引力とイカスミの催眠効果で多くの犠牲者を出している。このクラーケンを討伐し、海の平和を取り戻すことがあなたの任務だ。`,
    maxHp: 640,
    attackPower: 16,
    actions: seaKrakenActions,
    icon: '🦑',
    explorerLevelRequired: 2,
    victoryTrophy: {
        name: 'クラーケンの吸盤',
        description: '海のクラーケンの巨大な触手から採取した吸盤。驚異的な吸着力を持つ深海生物の証。'
    },
    defeatTrophy: {
        name: '催眠イカスミ',
        description: '海のクラーケンの体内で生成される特殊なイカスミ。意識を朦朧とさせる催眠効果がある。'
    },
    personality: [
        'グルルル...',
        'シュゥゥゥ...',
        'ゴポポポ...',
        'ズルズル...',
        'グォォォ...',
        '美味しそうな匂いだ...'
    ],
    aiStrategy: (boss, player, turn) => {
        // Sea Kraken AI Strategy

        // If player is defeated, use special post-defeat actions
        if (player.isDefeated()) {
            const postDefeatedActions: BossAction[] = [
                {
                    id: 'internal-ink-soak',
                    type: ActionType.PostDefeatedAttack,
                    name: '体内イカスミ漬け',
                    description: '獲物をイカスミ漬けにしながら体力を吸収し続ける',
                    messages: [
                        '「ゴポポポ...」',
                        '<USER>の体内でイカスミが<TARGET>を包み込んでいる...',
                        '<TARGET>は催眠状態のまま体力を吸収され続ける...'
                    ],
                    statusEffect: StatusEffectType.Charm,
                    weight: 1
                },
                {
                    id: 'stomach-sucker-drain',
                    type: ActionType.PostDefeatedAttack,
                    name: '胃袋吸盤吸引',
                    description: '体内の無数の吸盤で獲物の体力を永遠に吸収し続ける',
                    messages: [
                        '「シュゥゥゥ...」',
                        '<USER>の胃袋の吸盤が<TARGET>を吸引している...',
                        '<TARGET>のエネルギーが永遠に吸収されていく...'
                    ],
                    statusEffect: StatusEffectType.Weakness,
                    weight: 1
                }
            ];
            return postDefeatedActions[Math.floor(Math.random() * postDefeatedActions.length)];
        }
        
        // If player is eaten, use varied devour actions
        if (player.isEaten()) {
            const eatenActions = [
                {
                    id: 'stomach-sucker-attack',
                    type: ActionType.DevourAttack,
                    name: '胃袋吸盤吸引',
                    description: '体内の獲物のエネルギーを、胃袋にある無数の吸盤で吸収する',
                    messages: [
                        '「シュゥゥゥ...」',
                        '<USER>の胃袋の吸盤が<TARGET>を強く吸引している！'
                    ],
                    damageFormula: (user: Boss) => user.attackPower * 2.0,
                    weight: 1
                },
                {
                    id: 'internal-ink-marinate',
                    type: ActionType.DevourAttack,
                    name: '体内イカスミ漬け',
                    description: '体内の獲物をイカスミ漬けにして最大体力を吸収する',
                    messages: [
                        '「ゴポポポ...」',
                        '<USER>の体内でイカスミが<TARGET>を包み込む！',
                        '<TARGET>は催眠状態になってしまった...'
                    ],
                    damageFormula: (user: Boss) => user.attackPower * 1.3,
                    statusEffect: StatusEffectType.Charm,
                    weight: 1
                }
            ];
            return eatenActions[Math.floor(Math.random() * eatenActions.length)];
        }
        
        // Strategic actions based on player state
        if (player.isKnockedOut()) {
            if (player.isRestrained()) {
                // Restrained + Knocked Out: 85% chance to eat
                if (Math.random() < 0.85) {
                    return {
                        id: 'swallow-restrained',
                        type: ActionType.EatAttack,
                        name: '丸呑み',
                        description: '拘束した獲物を口に押し込み丸呑みする',
                        messages: [
                            '「グォォォ！」',
                            '<USER>が<TARGET>を触腕ごと大きな口に押し込んだ！',
                            '<TARGET>は体内に飲み込まれてしまった！'
                        ],
                        weight: 1
                    };
                }
            } else {
                // Normal + Knocked Out: 65% chance to restrain, 25% to eat directly
                const random = Math.random();
                if (random < 0.65) {
                    return {
                        id: 'ko-tentacle-wrap',
                        type: ActionType.RestraintAttack,
                        name: '触腕巻き付け',
                        description: '対象を触腕で拘束する',
                        messages: [
                            '「グルルル...」',
                            '<USER>の触腕が<TARGET>に巻き付いた！'
                        ],
                        weight: 1
                    };
                } else if (random < 0.9) {
                    return {
                        id: 'swallow-direct',
                        type: ActionType.EatAttack,
                        name: '丸呑み',
                        description: '獲物を丸呑みする',
                        messages: [
                            '「グォォォ！」',
                            '<USER>が大きな口を開け、<TARGET>を丸呑みにする！'
                        ],
                        weight: 1
                    };
                }
            }
        }
        
        // Use ink breath more often when player doesn't have vision impairment
        if (!player.statusEffects.hasEffect(StatusEffectType.VisionImpairment)) {
            const inkBreath = seaKrakenActions.find(action => action.statusEffect === StatusEffectType.VisionImpairment);
            if (inkBreath && Math.random() < 0.6) {
                return inkBreath;
            }
        }
        
        // Prefer restraint attacks when player has high HP and isn't restrained
        if (player.getHpPercentage() > 60 && !player.isRestrained()) {
            const restraintAction = seaKrakenActions.find(action => action.type === ActionType.RestraintAttack);
            if (restraintAction && Math.random() < 0.3) {
                return restraintAction;
            }
        }
        
        // Default to weighted random selection
        const currentPlayerState = boss.getPlayerState(player);
        const availableActions = seaKrakenActions.filter(action => {
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
seaKrakenData.finishingMove = function() {
    return [
        '「グルルル...」',
        '<USER>の胃袋吸盤が<TARGET>の腕と脚を吸い込み、体全体を吸盤で拘束する！',
        '<TARGET>はイカスミを注入されながら吸盤で吸収され続け、<USER>の体内でエネルギーを永遠に吸収されることになった...'
    ];
};

// Override dialogue for personality
seaKrakenData.getDialogue = function(situation: 'battle-start' | 'player-restrained' | 'player-eaten' | 'player-escapes' | 'low-hp' | 'victory') {
    const dialogues: Record<string, string[]> = {
        'battle-start': [
            'グルルル...美味しそうな獲物だ',
            'シュゥゥゥ...深海から上がってきた甲斐があった',
            'ゴポポポ...新鮮な匂いがする'
        ],
        'player-restrained': [
            'ズルズル...捕らえたぞ',
            'グルルル...逃がさん',
            'シュゥゥゥ...おとなしくしろ'
        ],
        'player-eaten': [
            'ゴポポポ...体内は快適だろう',
            'グルルル...ゆっくり味わうとしよう',
            'シュゥゥゥ...栄養を吸収させてもらう'
        ],
        'player-escapes': [
            'グォォォ...逃げたか',
            'ズルズル...次はそうはいかん',
            'グルルル...なかなかやる'
        ],
        'low-hp': [
            'グォォォ...まだ触腕は動く！',
            'ズルズル...深海の力を見せてやる',
            'シュゥゥゥ...これで終わりではない！'
        ],
        'victory': [
            'ゴポポポ...満足だ',
            'また深海に戻るとしよう'
        ]
    };
    
    const options = dialogues[situation] || dialogues['battle-start'];
    return options[Math.floor(Math.random() * options.length)];
};