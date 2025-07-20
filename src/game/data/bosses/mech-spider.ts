import { BossData, ActionType, BossAction, Boss } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffectTypes';

const mechSpiderActions: BossAction[] = [
    // Normal state actions
    {
        type: ActionType.Attack,
        name: 'レーザーショット',
        description: '精密なレーザーで攻撃する',
        messages: ['<USER>は精密なレーザーで<TARGET>を狙撃する！'],
        damageFormula: (user: Boss) => user.attackPower * 1.0,
        hitRate: 0.9,
        weight: 20
    },
    {
        type: ActionType.Attack,
        name: 'クモキック',
        description: '強力だが不正確な蹴り攻撃',
        messages: ['<USER>は機械の脚で<TARGET>を蹴り飛ばそうとする！'],
        damageFormula: (user: Boss) => user.attackPower * 1.5,
        hitRate: 0.6,
        weight: 15,
        playerStateCondition: 'normal'
    },
    {
        // Shockbite (for normal state)
        type: ActionType.StatusAttack,
        name: 'ショックバイト',
        description: '噛みついて電気ショックを与える',
        messages: ['<USER>は<TARGET>に噛みついて電気ショックを流す！'],
        damageFormula: (user: Boss) => user.attackPower * 1.0,
        statusEffect: StatusEffectType.Stunned,
        statusChance: 0.30,
        hitRate: 0.7,
        weight: 12,
        canUse: (_boss, player, _turn) => {
            return !player.isRestrained();
        }
    },
    {
        type: ActionType.RestraintAttack,
        name: 'スパイダーグラブ',
        description: '抱きしめるように拘束する',
        messages: ['<USER>は機械の腕で<TARGET>を抱きしめて拘束しようとする！'],
        damageFormula: (user: Boss) => user.attackPower * 1.5,
        weight: 25,
        canUse: (_boss, player, _turn) => {
            return (!player.isRestrained() && !player.isCocoon() && !player.isEaten() && Math.random() < 0.6) || player.isKnockedOut();
        }
    },
    {
        type: ActionType.RestraintAttack,
        name: 'スパイダーネット',
        description: '機械の合成糸で作った網で拘束する',
        messages: ['<USER>は合成糸の網を<TARGET>に投げかける！'],
        damage: 0,
        weight: 30,
        canUse: (_boss, player, _turn) => {
            return (!player.isRestrained() && !player.isCocoon() && !player.isEaten() && Math.random() < 0.8) || player.isKnockedOut();
        }
    }
];

const mechSpiderActionsRestrained: BossAction[] = [
    // Restrained state actions
    {
        type: ActionType.Attack,
        name: 'クモキック',
        description: '強力だが不正確な蹴り攻撃',
        messages: ['<USER>は機械の脚で<TARGET>を蹴りつける！'],
        damageFormula: (user: Boss) => user.attackPower * 1.5,
        weight: 20
    },
    {
        // Shockbite (for restrained state)
        type: ActionType.StatusAttack,
        name: 'ショックバイト',
        description: '噛みついて電気ショックを与える',
        messages: ['<USER>は<TARGET>に噛みついて電気ショックを流す！'],
        damageFormula: (user: Boss) => user.attackPower * 1.0,
        statusEffect: StatusEffectType.Stunned,
        statusChance: 0.50,
        hitRate: 0.95,
        weight: 15
    },
    {
        type: ActionType.Attack,
        name: 'スパイダーハグ',
        description: '抱きしめるように締め付ける',
        messages: ['<USER>は機械の腕で<TARGET>を締め付ける！'],
        damageFormula: (user: Boss) => user.attackPower * 1.8,
        weight: 25
    }
];

const mechSpiderActionsKnockoutRestrained: BossAction[] = [
    // Cocoon Process - special transition attack
    {
        type: ActionType.CocoonAttack,
        name: '縮小プロセス',
        description: '捕まえた対象を繭にして縮小液で満たす',
        messages: [
            '<USER>は<TARGET>を合成糸でぐるぐる巻きにし始める！',
            '<TARGET>が繭の中に閉じ込められ、内部が縮小液で満たされる！'
        ],
        weight: 1,
        canUse: (_boss, player, _turn) => {
            // Only use when player is knocked out AND restrained
            return player.isKnockedOut() && player.isRestrained();
        }
    }
];

const mechSpiderActionsCocoon: BossAction[] = [  
    // Cocoon state actions
    {
        type: ActionType.CocoonAction,
        name: '繭の抱擁',
        description: '繭状態の対象をゆらゆら揺らして縮小させる',
        messages: ['<USER>は繭を優しく抱擁し、ゆらゆらと揺らしている...'],
        damageFormula: (user: Boss) => user.attackPower * 1.0, // Max HP reduction amount
        weight: 30,
        playerStateCondition: 'cocoon',
        canUse: (_boss, player, _turn) => {
            return player.isCocoon();
        }
    },
    {
        type: ActionType.CocoonAction,
        name: '繭の圧縮',
        description: '繭を抱きしめて縮小液を馴染ませる',
        messages: ['<USER>は繭を強く抱きしめ、縮小液を<TARGET>に馴染ませる！'],
        damageFormula: (user: Boss) => user.attackPower * 1.8, // Max HP reduction amount
        weight: 25,
        playerStateCondition: 'cocoon',
        canUse: (_boss, player, _turn) => {
            return player.isCocoon();
        }
    },
    {
        type: ActionType.CocoonAction,
        name: '縮小液循環',
        description: '繭内部の縮小液を循環させてエネルギーを得る',
        messages: ['<USER>は繭内部の縮小液を循環させ、<TARGET>のエネルギーを吸収する！'],
        damageFormula: (user: Boss) => user.attackPower * 1.5, // Max HP reduction amount
        healRatio: 2.0, // Heal 2x the amount reduced + gain max HP
        weight: 20,
        playerStateCondition: 'cocoon',
        canUse: (_boss, player, _turn) => {
            return player.isCocoon();
        }
    }
];

export const mechSpiderData: BossData = {
    id: 'mech-spider',
    name: 'MechSpider',
    displayName: '🕷️ 機械のクモ',
    description: `汎用修理メカ`,
    questNote: '古代遺跡から逃げ延びた者によると、そこには奇妙なクモが生息しているという。遺跡の調査を安全にするために、あなたはそのクモを討伐することになった。',
    maxHp: 320,
    attackPower: 10,
    actions: mechSpiderActions,
    icon: '🕷️',
    explorerLevelRequired: 0,
    personality: [
        'ERROR: 損傷した機械を検出',
        '修理プロトコル開始',
        'ANALYZING... 重大な損傷あり',
        '修理が必要です',
        'CAPTURING TARGET...',
        '修理完了まで待機してください'
    ],
    aiStrategy: (boss, player, turn) => {
        // Repair Maniac Spider AI Strategy
        
        // If player is post-defeated, use special post-defeat actions
        if (player.isDefeated()) {
            const postDefeatedActions: BossAction[] = [
                {
                    type: ActionType.PostDefeatedAttack,
                    name: '体内修理装置起動',
                    description: '体内の修理装置で生命体に栄養剤を注入する',
                    messages: [
                        'REPAIR SYSTEM ACTIVE...',
                        '<USER>の体内修理装置が<TARGET>に栄養剤を注入している...',
                        '修理装置に拘束されて動けない<TARGET>は、栄養剤を飲まされ続ける...'
                    ],
                    weight: 1
                },
                {
                    type: ActionType.PostDefeatedAttack,
                    name: '体内マッサージ処理',
                    description: '体内の機械腕で生命体をマッサージする',
                    messages: [
                        'MASSAGE PROTOCOL INITIATED...',
                        '<USER>の体内マッサージ機が<TARGET>の体を挟み込む...',
                        '<TARGET>は機械的なマッサージを受けている...'
                    ],
                    weight: 1
                },
                {
                    type: ActionType.PostDefeatedAttack,
                    name: '無意味な修理作業',
                    description: '意味のない修理作業を生命体に施し続ける',
                    messages: [
                        'PROCESSING REPAIR SEQUENCE...',
                        '<USER>が<TARGET>にがらくたのようなパーツを接着しようとする...',
                        'しかし、糊でくっつけられたパーツはすぐに外れてしまう...'
                    ],
                    weight: 1
                },
                {
                    type: ActionType.PostDefeatedAttack,
                    name: '体内拘束システム',
                    description: '体内の拘束システムで生命体を固定し続ける',
                    messages: [
                        'RESTRAINT SYSTEM ACTIVE...',
                        '<USER>の体内拘束システムが<TARGET>を固定している...',
                        '<TARGET>は機械的な拘束から逃れられない...'
                    ],
                    weight: 1
                },
                {
                    type: ActionType.PostDefeatedAttack,
                    name: '修理完了検査',
                    description: '修理が完了したか生命体を検査し続ける',
                    messages: [
                        'REPAIR INSPECTION PROTOCOL...',
                        '<USER>が<TARGET>の修理完了を検査している...',
                        '不整合を検知した<USER>は<TARGET>の修理を続ける...'
                    ],
                    weight: 1
                }
            ];
            return postDefeatedActions[Math.floor(Math.random() * postDefeatedActions.length)];
        }
        
        // State-based action selection
        const playerState = boss.getPlayerState(player);
        
        // If player is in cocoon state, use cocoon actions
        if (playerState === 'cocoon') {
            const cocoonActions = mechSpiderActionsCocoon;
            
            if (cocoonActions.length > 0) {
                // Weight-based selection among cocoon actions
                const totalWeight = cocoonActions.reduce((sum, action) => sum + action.weight, 0);
                let random = Math.random() * totalWeight;
                
                for (const action of cocoonActions) {
                    random -= action.weight;
                    if (random <= 0) {
                        return action;
                    }
                }
                return cocoonActions[0];
            }
        }
        
        // Special condition: cocoon process (KO + restrained)
        if (player.isKnockedOut() && player.isRestrained()) {
            const cocoonAttack = mechSpiderActionsKnockoutRestrained[0];
            if (cocoonAttack) {
                return cocoonAttack;
            }
        }
        
        // Knocked out (but not restrained) state prioritization
        if (player.isKnockedOut()) {
            // 80% chance to restrain
            if (Math.random() < 0.8) {
                const restraintActions = mechSpiderActions.filter(action => 
                    action.type === ActionType.RestraintAttack && 
                    (!action.canUse || action.canUse(boss, player, turn))
                );
                if (restraintActions.length > 0) {
                    return restraintActions[Math.floor(Math.random() * restraintActions.length)];
                }
            }
            
            // Otherwise use shock bite or normal attacks
            const koActions = mechSpiderActions.filter(action => 
                (action.type === ActionType.StatusAttack || action.type === ActionType.Attack) &&
                (!action.canUse || action.canUse(boss, player, turn))
            );
            if (koActions.length > 0) {
                return koActions[Math.floor(Math.random() * koActions.length)];
            }
        }
        
        // Restrained state
        if (player.isRestrained()) {
            const restrainedActions = mechSpiderActionsRestrained.filter(action =>
                (!action.canUse || action.canUse(boss, player, turn))
            );
            if (restrainedActions.length > 0) {
                return restrainedActions[Math.floor(Math.random() * restrainedActions.length)];
            }
        }
        
        // Normal state: prioritize restraint attacks
        // 70% chance to use restraint attacks
        if (Math.random() < 0.7) {
            const restraintActions = mechSpiderActions.filter(action =>
                action.type === ActionType.RestraintAttack &&
                (!action.canUse || action.canUse(boss, player, turn))
            );
            if (restraintActions.length > 0) {
                return restraintActions[Math.floor(Math.random() * restraintActions.length)];
            }
        }

        // Otherwise use normal attacks or shock bite
        const normalActions = mechSpiderActions.filter(action =>
            (!action.canUse || action.canUse(boss, player, turn))
        );
        if (normalActions.length > 0) {
            return normalActions[Math.floor(Math.random() * normalActions.length)];
        }
        
        // Final fallback
        return mechSpiderActions[0];
    }
};

// Override dialogue for robotic personality
mechSpiderData.getDialogue = function(situation: 'battle-start' | 'player-restrained' | 'player-cocoon' | 'player-eaten' | 'player-escapes' | 'low-hp' | 'victory') {
    const dialogues: Record<string, string[]> = {
        'battle-start': [
            'SYSTEM BOOT... 修理対象を検出しました',
            'ERROR: 深刻な機械的損傷を確認',
            'REPAIR PROTOCOL INITIATED...',
            'ANALYZING TARGET... 修理が必要です'
        ],
        'player-restrained': [
            'CAPTURE SUCCESSFUL... 修理を開始します',
            'TARGET SECURED... 診断中',
            'RESTRAINT ACTIVE... 動かないでください',
            'REPAIR MODE ACTIVATED...',
            'WARNING: 修理中は動かないでください'
        ],
        'player-cocoon': [
            'COCOON PROCESS INITIATED... 縮小修理開始',
            'SHRINKING PROTOCOL ACTIVE... サイズ調整中',
            'REPAIR CHAMBER SEALED... 修理環境最適化',
            'MINIATURIZATION IN PROGRESS... 適正サイズに調整中',
            'SIZE OPTIMIZATION... 修理しやすいサイズに変更中'
        ],
        'player-eaten': [
            'INTERNAL REPAIR INITIATED... 体内修理開始',
            'REPAIR BAY ACTIVATED... 修理装置起動',
            'PROCESSING DAMAGED UNIT... 損傷部位を修復中',
            'INTERNAL MAINTENANCE... 精密修理実行中',
            'REPAIR SEQUENCE COMPLETE... 修理完了まで待機'
        ],
        'player-escapes': [
            'ERROR: ターゲットロスト',
            'WARNING: 修理が完了していません',
            'RECAPTURE PROTOCOL... 再取得を試行',
            'SYSTEM ERROR... 修理を継続する必要があります',
            'TARGET ESCAPED... 再捕獲します'
        ],
        'low-hp': [
            'WARNING: システム損傷レベル高',
            'ERROR: 修理システム不安定',
            'CRITICAL: 自己修復が必要',
            'DAMAGE DETECTED... 修理継続'
        ],
        'victory': [
            'REPAIR COMPLETE... システム正常',
            'MISSION ACCOMPLISHED... 待機モードに移行',
            'SUCCESS: 修理プロトコル完了'
        ]
    };
    
    const options = dialogues[situation] || dialogues['battle-start'];
    return options[Math.floor(Math.random() * options.length)];
};

// Special finishing move sequence for cocoon doomed state
mechSpiderData.finishingMove = function(): string[] {
    return [
        '<TARGET>は繭の中で完全に小さくなってしまった...',
        '機械のクモは繭に噛みつき、中身を<TARGET>ごと吸い上げる！',
        '<TARGET>が機械のクモの体内に取り込まれた！',
        '機械のクモは体内の<TARGET>を合成糸で拘束し、体内修理装置に縛りつける！',
        '修理装置に縛り付けられた<TARGET>は、機械のクモが満足するまで意味のない修理をされ続ける...',
    ];
};