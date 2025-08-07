import { BossData, ActionType, BossAction, Boss } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffectTypes';

const scorpionCarrierActions: BossAction[] = [
    // Normal state actions
    {
        id: 'claw-pincer-attack',
        type: ActionType.Attack,
        name: 'はさみ攻撃',
        description: '大きなはさみで攻撃する',
        messages: ['{boss}は大きなはさみで{player}を挟みつけようとする！'],
        damageFormula: (user: Boss) => user.attackPower * 1.25,
        hitRate: 0.8,
        weight: 20
    },
    {
        id: 'tire-stomp',
        type: ActionType.Attack,
        name: '踏みつけ',
        description: 'タイヤの足で踏みつける',
        messages: ['{boss}はタイヤの足で{player}を踏みつけようとする！'],
        damageFormula: (user: Boss) => user.attackPower * 1.5,
        hitRate: 0.9,
        weight: 15
    },
    {
        id: 'stinger-tail-swing',
        type: ActionType.Attack,
        name: 'しっぽ振り回し',
        description: '強力だが命中率が低い攻撃',
        messages: ['{boss}は巨大な注射器のような尻尾を振り回す！'],
        damageFormula: (user: Boss) => user.attackPower * 2.5,
        hitRate: 0.6,
        weight: 10,
        playerStateCondition: 'normal'
    },
    {
        id: 'anesthesia-injection',
        type: ActionType.StatusAttack,
        name: 'しっぽ麻酔',
        description: '尻尾の注射器で麻酔を注入する',
        messages: ['{boss}は尻尾の注射器で{player}に麻酔を注入しようとする！'],
        damageFormula: (user: Boss) => user.attackPower * 1.0,
        statusEffect: StatusEffectType.Anesthesia,
        statusChance: 0.70,
        hitRate: 0.7,
        weight: 12,
        canUse: (_boss, player, _turn) => {
            return !player.isRestrained() && !player.isCocoon() && !player.isEaten();
        }
    },
    {
        id: 'claw-catch',
        type: ActionType.RestraintAttack,
        name: 'はさみキャッチ',
        description: 'はさみで対象を捕まえる',
        messages: ['{boss}は巨大なはさみで{player}を捕まえようとする！'],
        damageFormula: (user: Boss) => user.attackPower * 0.6,
        weight: 25,
        canUse: (_boss, player, _turn) => {
            return (!player.isRestrained() && !player.isCocoon() && !player.isEaten() && Math.random() < 0.8) || player.isKnockedOut();
        }
    }
];

const scorpionCarrierActionsRestrained: BossAction[] = [
    // Restrained state actions
    {
        id: 'deadly-poison-injection',
        type: ActionType.StatusAttack,
        name: '猛毒注射',
        description: '拘束した対象に猛毒を注射する',
        messages: ['{boss}は拘束した{player}に猛毒を注射する！'],
        damageFormula: (user: Boss) => user.attackPower * 1.9,
        statusEffect: StatusEffectType.ScorpionPoison,
        statusChance: 0.90,
        hitRate: 0.95,
        weight: 30
    },
    {
        id: 'bite-lick-assault',
        type: ActionType.Attack,
        name: 'かみつき舐め回し',
        description: '拘束した対象を舐め回す',
        messages: ['{boss}は拘束した{player}を舐め回す！'],
        damageFormula: (user: Boss) => user.attackPower * 2.25,
        weight: 25
    },
    {
        id: 'restrained-claw-attack',
        type: ActionType.Attack,
        name: 'はさみ攻撃',
        description: '大きなはさみで攻撃する',
        messages: ['{boss}は大きなはさみで{player}を挟みつける！'],
        damageFormula: (user: Boss) => user.attackPower * 1.5,
        weight: 20
    }
];

const scorpionCarrierActionsKnockoutRestrained: BossAction[] = [
    // Eating Process - special transition attack
    {
        id: 'bold-swallow',
        type: ActionType.EatAttack,
        name: '大胆に丸呑み',
        description: '対象を丸呑みして体内に運ぶ',
        messages: [
            '{boss}は{player}を大胆に丸呑みする！',
            '{player}がサソリの体内に取り込まれる！'
        ],
        weight: 1,
        canUse: (_boss, player, _turn) => {
            // Only use when player is knocked out
            return player.isKnockedOut();
        }
    }
];

const scorpionCarrierActionsEaten: BossAction[] = [
    // Eaten state actions
    {
        id: 'weakening-injection',
        type: ActionType.StatusAttack,
        name: '脱力剤注入',
        description: '体内の生き物に脱力剤を注入する',
        messages: ['{boss}は体内の注射器で{player}に脱力剤を注入する！'],
        damageFormula: (user: Boss) => user.attackPower * 1.0,
        statusEffect: StatusEffectType.Weakening,
        statusChance: 0.80,
        hitRate: 0.9,
        weight: 25,
        playerStateCondition: 'eaten'
    },
    {
        id: 'internal-massage',
        type: ActionType.DevourAttack,
        name: '体内マッサージ',
        description: '体内の生き物にマッサージして最大HPを吸収',
        messages: ['{boss}は体内で{player}をマッサージし、エネルギーを吸収する！'],
        damageFormula: (user: Boss) => user.attackPower * 1.5, // Max HP reduction amount
        weight: 30,
        playerStateCondition: 'eaten',
        canUse: (_boss, player, _turn) => {
            return player.isEaten();
        }
    },
    {
        id: 'internal-squeeze',
        type: ActionType.DevourAttack,
        name: '体内締め付け',
        description: '体内で生き物を締め付けて最大HPを吸収',
        messages: ['{boss}は体内で{player}を締め付け、エネルギーを吸収する！'],
        damageFormula: (user: Boss) => user.attackPower * 1.9, // Max HP reduction amount
        weight: 25,
        playerStateCondition: 'eaten',
        canUse: (_boss, player, _turn) => {
            return player.isEaten();
        }
    }
];

export const scorpionCarrierData: BossData = {
    id: 'scorpion-carrier',
    name: 'ScorpionCarrier',
    displayName: '運び屋のサソリ',
    description: `砂漠や荒れ地を漂う巨大なサソリ`,
    questNote: '砂漠を通る商人から報告によると、砂漠には巨大なサソリが生息しているという。足がタイヤになっていて、巨大な注射器のような尻尾を持つ、半機械のような見た目をしている。さまよう人間を様々な方法で捕まえては丸呑みし、その者が望む（と勝手に考える）場所へと運ぶという。',
    maxHp: 580,
    attackPower: 22,
    actions: scorpionCarrierActions,
    icon: '🦂',
    explorerLevelRequired: 1,
    battleStartMessages: [
        {
            speaker: 'player',
            style: 'default',
            text: 'あなたは砂漠の奥でタイヤの足を持つ巨大なサソリと遭遇した。'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「んー、迷い人のようだな？」'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: '運び屋のサソリは注射器のような尻尾をゆらゆらと揺らしながらこちらを見つめている...'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「おまえの足より、オレの足のほうが早いぞ？安全に運んでやるから、恥ずかしがらずに食べられろ」'
        }
    ],
    victoryMessages: [
        {
            speaker: 'boss',
            style: 'talk',
            text: '「ぐあ...まさか負けるとは...」'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「しかし、その実力なら一人でも大丈夫そうだな...安心したぞ」'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: '運び屋のサソリは満足そうに頷くと、タイヤを軋ませながら砂漠の彼方へと去っていった...'
        }
    ],
    victoryTrophy: {
        name: 'サソリの機械殻',
        description: '運び屋のサソリの機械化された外殻の一部。タイヤとして機能していた足部分の装甲。'
    },
    defeatTrophy: {
        name: '運搬用薬液',
        description: '運び屋のサソリの体内で生成される特殊な薬液。運搬対象を衝撃から守るだけでなく、精神を安定させる効果もある。'
    },
    personality: [
        'んー、迷い人のようだな？',
        'おまえの足より、オレの足のほうが早いぞ？',
        '恥ずかしがらずに食べられろ',
        '薬を打たれた気分はどうだ？'
    ],
    aiStrategy: (boss, player, turn) => {
        // Scorpion Carrier AI Strategy
        
        // If player is post-defeated, use special post-defeat actions
        if (player.isDefeated()) {
            const defeatStartTurn = boss.getCustomVariable<number>('defeatStartTurn', -1);
            
            // If this is the first turn player is defeated, record it
            if (defeatStartTurn === -1) {
                boss.setCustomVariable('defeatStartTurn', turn);
            }

            // Every 8 turns since defeat started, show special poison injection event
            const turnsSinceDefeat = turn - boss.getCustomVariable<number>('defeatStartTurn', turn);
            if (turnsSinceDefeat > 0 && turnsSinceDefeat % 8 === 0) {
                return {
                    id: 'poison-inspection',
                    type: ActionType.PostDefeatedAttack,
                    name: '毒液検査',
                    description: '体内の毒袋から採取した濃縮毒液を検査のため注射する',
                    messages: [
                        '「そろそろ毒の効き具合を検査してみるか」',
                        '{boss}の体内機構が作動し、毒袋から濃縮された毒液を採取する！',
                        '体内に保管されていた最も強力な毒液が{player}に注射される！',
                        '「これで運搬時の品質が保たれるな」',
                        '{player}は複数の毒の効果に苦しむが、サソリの薬剤によって死ぬことはない...',
                        '体内で毒液と薬剤が混合され、{player}の抵抗力が完全に奪われてしまう！'
                    ],
                    onUse: (_boss, player, _turn) => {
                        // 複数の毒系状態異常を付与
                        player.statusEffects.addEffect(StatusEffectType.ScorpionPoison);
                        player.statusEffects.addEffect(StatusEffectType.Poison);
                        player.statusEffects.addEffect(StatusEffectType.Weakness);
                        player.statusEffects.addEffect(StatusEffectType.Paralysis);
                        player.statusEffects.addEffect(StatusEffectType.Anesthesia);
                        
                        return [];
                    },
                    weight: 1
                };
            }
            
            const postDefeatedActions: BossAction[] = [
                {
                    id: 'internal-transport',
                    type: ActionType.PostDefeatedAttack,
                    name: '体内運搬',
                    description: '体内の生き物を目的地まで運搬する',
                    messages: [
                        '{boss}は体内の{player}を目的地まで運搬している...',
                        '{player}はサソリの体内で消化されることはないが、エネルギーを吸収され続ける...',
                        'タイヤの足音が響く中、運搬は続く...'
                    ],
                    weight: 1
                },
                {
                    id: 'nutrient-injection',
                    type: ActionType.PostDefeatedAttack,
                    name: '栄養剤注入',
                    description: '体内の生き物に栄養剤を注入する',
                    messages: [
                        '{boss}は体内の注射器で{player}に栄養剤を注入する...',
                        '{player}は強制的に栄養剤を摂取させられる...',
                        '栄養剤によって{player}の意識が朦朧としてくる...'
                    ],
                    weight: 1
                },
                {
                    id: 'energy-absorption',
                    type: ActionType.PostDefeatedAttack,
                    name: 'エネルギー吸収',
                    description: '体内の生き物からエネルギーを吸収する',
                    messages: [
                        '{boss}は{player}からエネルギーを吸収している...',
                        '{player}のエネルギーがサソリに吸収されていく...',
                        'エネルギーを吸収された{player}は動けなくなる...'
                    ],
                    weight: 1
                },
                {
                    id: 'mana-absorption',
                    type: ActionType.PostDefeatedAttack,
                    name: 'マナ吸収',
                    description: '体内の生き物からマナを吸収する',
                    messages: [
                        '{boss}は{player}からマナを吸収している...',
                        '{player}のマナがサソリに吸収されていく...'
                    ],
                    weight: 1
                },
                {
                    id: 'internal-drug-circulation',
                    type: ActionType.PostDefeatedAttack,
                    name: '体内薬剤循環',
                    description: '体内で薬剤を循環させて生き物を無力化する',
                    messages: [
                        '{boss}は体内で薬剤を循環させている...',
                        '{player}は薬剤によって完全に無力化される...',
                        '薬剤の効果で{player}は抵抗する力を失う...'
                    ],
                    weight: 1
                }
            ];
            return postDefeatedActions[Math.floor(Math.random() * postDefeatedActions.length)];
        }
        
        // State-based action selection
        const playerState = boss.getPlayerState(player);
        
        // If player is in eaten state, use eaten actions
        if (playerState === 'eaten') {
            const eatenActions = scorpionCarrierActionsEaten;
            
            if (eatenActions.length > 0) {
                // Weight-based selection among eaten actions
                const totalWeight = eatenActions.reduce((sum, action) => sum + action.weight, 0);
                let random = Math.random() * totalWeight;
                
                for (const action of eatenActions) {
                    random -= action.weight;
                    if (random <= 0) {
                        return action;
                    }
                }
                return eatenActions[0];
            }
        }
        
        // Special condition: eating process (KO)
        if (player.isKnockedOut() && !player.isRestrained()) {
            const eatingAttack = scorpionCarrierActionsKnockoutRestrained[0];
            if (eatingAttack) {
                return eatingAttack;
            }
        }
        
        // Knocked out (and restrained) state prioritization
        if (player.isKnockedOut() && player.isRestrained()) {
            // Go straight to eating
            const eatingAttack = scorpionCarrierActionsKnockoutRestrained[0];
            if (eatingAttack) {
                return eatingAttack;
            }
        }
        
        // Restrained state
        if (player.isRestrained()) {
            const restrainedActions = scorpionCarrierActionsRestrained.filter(action =>
                (!action.canUse || action.canUse(boss, player, turn))
            );
            if (restrainedActions.length > 0) {
                return restrainedActions[Math.floor(Math.random() * restrainedActions.length)];
            }
        }
        
        // Normal state: prioritize restraint attacks
        // 60% chance to use restraint attacks
        if (Math.random() < 0.6) {
            const restraintActions = scorpionCarrierActions.filter(action =>
                action.type === ActionType.RestraintAttack &&
                (!action.canUse || action.canUse(boss, player, turn))
            );
            if (restraintActions.length > 0) {
                return restraintActions[Math.floor(Math.random() * restraintActions.length)];
            }
        }

        // Otherwise use normal attacks or status attacks
        const normalActions = scorpionCarrierActions.filter(action =>
            (!action.canUse || action.canUse(boss, player, turn))
        );
        if (normalActions.length > 0) {
            return normalActions[Math.floor(Math.random() * normalActions.length)];
        }
        
        // Final fallback
        return scorpionCarrierActions[0];
    }
};

// Override dialogue for Scorpion Carrier personality
scorpionCarrierData.getDialogue = function(situation: 'battle-start' | 'player-restrained' | 'player-cocoon' | 'player-eaten' | 'player-escapes' | 'low-hp' | 'victory') {
    const dialogues: Record<string, string[]> = {
        'battle-start': [
            'んー、迷い人のようだな？',
            'おまえの足より、オレの足のほうが早いぞ？',
            '恥ずかしがらずに食べられろ',
            '薬を打たれた気分はどうだ？'
        ],
        'player-restrained': [
            'はさみに捕まったな',
            'そのまま大人しくしていろ',
            '毒を注射してやろうか？',
            '拘束されて逃げられないな'
        ],
        'player-cocoon': [
            'んー、迷い人のようだな？',
            'おまえの足より、オレの足のほうが早いぞ？',
            '恥ずかしがらずに食べられろ',
            '薬を打たれた気分はどうだ？'
        ],
        'player-eaten': [
            '体内は居心地がいいだろう？',
            '薬剤でエネルギーを吸収させてもらう',
            '目的地まで運んでやろう',
            '体内で消化されることはないが、エネルギーは頂く'
        ],
        'player-escapes': [
            'おっと、逃げられたか',
            'まだ運搬が終わっていないぞ',
            'もう一度捕まえてやる',
            '逃げても無駄だ'
        ],
        'low-hp': [
            'くそっ、機械部分が故障しているか',
            'まだ運搬の仕事が残っているんだ',
            'タイヤがパンクしそうだ',
            '注射器も調子が悪い'
        ],
        'victory': [
            '運搬完了だ',
            'お疲れ様',
            'また迷い人を探しに行くか',
            '次の目的地はどこだろうな'
        ]
    };
    
    const options = dialogues[situation] || dialogues['battle-start'];
    return options[Math.floor(Math.random() * options.length)];
};

// Special finishing move sequence for eaten doomed state
scorpionCarrierData.finishingMove = function(): string[] {
    return [
        'サソリは体内の{player}を完全に支配下に置く！',
        '{player}はサソリの体内で永遠に運搬され続ける！',
        'サソリは満足そうに砂漠を歩き始める...',
        '{player}は運び屋のサソリの永遠の荷物となった...',
    ];
};