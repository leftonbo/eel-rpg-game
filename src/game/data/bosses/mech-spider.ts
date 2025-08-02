import { BossData, ActionType, BossAction, Boss } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffectTypes';

const mechSpiderActions: BossAction[] = [
    // Normal state actions
    {
        id: 'laser-shot',
        type: ActionType.Attack,
        name: 'レーザーショット',
        description: '精密なレーザーで攻撃する',
        messages: ['{boss}は精密なレーザーで{player}を狙撃する！'],
        damageFormula: (user: Boss) => user.attackPower * 1.0,
        hitRate: 0.9,
        weight: 20
    },
    {
        id: 'spider-kick',
        type: ActionType.Attack,
        name: 'クモキック',
        description: '強力だが不正確な蹴り攻撃',
        messages: ['{boss}は機械の脚で{player}を蹴り飛ばそうとする！'],
        damageFormula: (user: Boss) => user.attackPower * 1.5,
        hitRate: 0.6,
        weight: 15,
        playerStateCondition: 'normal'
    },
    {
        id: 'shock-bite',
        // Shockbite (for normal state)
        type: ActionType.StatusAttack,
        name: 'ショックバイト',
        description: '噛みついて電気ショックを与える',
        messages: ['{boss}は{player}に噛みついて電気ショックを流す！'],
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
        id: 'spider-grab',
        type: ActionType.RestraintAttack,
        name: 'スパイダーグラブ',
        description: '抱きしめるように拘束する',
        messages: ['{boss}は機械の腕で{player}を抱きしめて拘束しようとする！'],
        damageFormula: (user: Boss) => user.attackPower * 1.5,
        weight: 25,
        canUse: (_boss, player, _turn) => {
            return (!player.isRestrained() && !player.isCocoon() && !player.isEaten() && Math.random() < 0.6) || player.isKnockedOut();
        }
    },
    {
        id: 'spider-net',
        type: ActionType.RestraintAttack,
        name: 'スパイダーネット',
        description: '機械の合成糸で作った網で拘束する',
        messages: ['{boss}は合成糸の網を{player}に投げかける！'],
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
        id: 'spider-kick-restrained',
        type: ActionType.Attack,
        name: 'クモキック',
        description: '強力だが不正確な蹴り攻撃',
        messages: ['{boss}は機械の脚で{player}を蹴りつける！'],
        damageFormula: (user: Boss) => user.attackPower * 1.5,
        weight: 20
    },
    {
        id: 'shock-bite-restrained',
        // Shockbite (for restrained state)
        type: ActionType.StatusAttack,
        name: 'ショックバイト',
        description: '噛みついて電気ショックを与える',
        messages: ['{boss}は{player}に噛みついて電気ショックを流す！'],
        damageFormula: (user: Boss) => user.attackPower * 1.0,
        statusEffect: StatusEffectType.Stunned,
        statusChance: 0.50,
        hitRate: 0.95,
        weight: 15
    },
    {
        id: 'spider-hug',
        type: ActionType.Attack,
        name: 'スパイダーハグ',
        description: '抱きしめるように締め付ける',
        messages: ['{boss}は機械の腕で{player}を締め付ける！'],
        damageFormula: (user: Boss) => user.attackPower * 1.8,
        weight: 25
    }
];

const mechSpiderActionsKnockoutRestrained: BossAction[] = [
    // Cocoon Process - special transition attack
    {
        id: 'shrinking-process',
        type: ActionType.CocoonAttack,
        name: '縮小プロセス',
        description: '捕まえた対象を繭にして縮小液で満たす',
        messages: [
            '{boss}は{player}を合成糸でぐるぐる巻きにし始める！',
            '{player}が繭の中に閉じ込められ、内部が縮小液で満たされる！'
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
        id: 'cocoon-embrace',
        type: ActionType.CocoonAction,
        name: '繭の抱擁',
        description: '繭状態の対象をゆらゆら揺らして縮小させる',
        messages: ['{boss}は繭を優しく抱擁し、ゆらゆらと揺らしている...'],
        damageFormula: (user: Boss) => user.attackPower * 1.0, // Max HP reduction amount
        weight: 30,
        playerStateCondition: 'cocoon',
        canUse: (_boss, player, _turn) => {
            return player.isCocoon();
        }
    },
    {
        id: 'cocoon-compression',
        type: ActionType.CocoonAction,
        name: '繭の圧縮',
        description: '繭を抱きしめて縮小液を馴染ませる',
        messages: ['{boss}は繭を強く抱きしめ、縮小液を{player}に馴染ませる！'],
        damageFormula: (user: Boss) => user.attackPower * 1.8, // Max HP reduction amount
        weight: 25,
        playerStateCondition: 'cocoon',
        canUse: (_boss, player, _turn) => {
            return player.isCocoon();
        }
    },
    {
        id: 'shrinking-fluid-circulation',
        type: ActionType.CocoonAction,
        name: '縮小液循環',
        description: '繭内部の縮小液を循環させてエネルギーを得る',
        messages: ['{boss}は繭内部の縮小液を循環させ、{player}のエネルギーを吸収する！'],
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
    displayName: '機械のクモ',
    description: `汎用修理メカ`,
    questNote: '古代遺跡から逃げ延びた者によると、そこには奇妙なクモが生息しているという。遺跡の調査を安全にするために、あなたはそのクモを討伐することになった。',
    maxHp: 300,
    attackPower: 12,
    actions: mechSpiderActions,
    suppressAutoFinishingMove: true,
    icon: '🕷️',
    victoryTrophy: {
        name: '機械の合成糸',
        description: '機械のクモが生成する特殊な合成糸。非常に強靭で、古代技術の結晶が込められている。'
    },
    defeatTrophy: {
        name: 'クモの縮小液',
        description: '機械のクモの体内で生成される縮小液。この液体に晒された物体は、生物や機械関係なしに縮小される。'
    },
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
                    id: 'internal-repair-system',
                    type: ActionType.PostDefeatedAttack,
                    name: '体内修理装置起動',
                    description: '体内の修理装置で生命体に栄養剤を注入する',
                    messages: [
                        'REPAIR SYSTEM ACTIVE...',
                        '{boss}の体内修理装置が{player}に栄養剤を注入している...',
                        '修理装置に拘束されて動けない{player}は、栄養剤を飲まされ続ける...'
                    ],
                    weight: 1
                },
                {
                    id: 'internal-massage',
                    type: ActionType.PostDefeatedAttack,
                    name: '体内マッサージ処理',
                    description: '体内の機械腕で生命体をマッサージする',
                    messages: [
                        'MASSAGE PROTOCOL INITIATED...',
                        '{boss}の体内マッサージ機が{player}の体を挟み込む...',
                        '{player}は機械的なマッサージを受けている...'
                    ],
                    weight: 1
                },
                {
                    id: 'pointless-repair',
                    type: ActionType.PostDefeatedAttack,
                    name: '無意味な修理作業',
                    description: '意味のない修理作業を生命体に施し続ける',
                    messages: [
                        'PROCESSING REPAIR SEQUENCE...',
                        '{boss}が{player}にがらくたのようなパーツを接着しようとする...',
                        'しかし、糊でくっつけられたパーツはすぐに外れてしまう...'
                    ],
                    weight: 1
                },
                {
                    id: 'internal-restraint-system',
                    type: ActionType.PostDefeatedAttack,
                    name: '体内拘束システム',
                    description: '体内の拘束システムで生命体を固定し続ける',
                    messages: [
                        'RESTRAINT SYSTEM ACTIVE...',
                        '{boss}の体内拘束システムが{player}を固定している...',
                        '{player}は機械的な拘束から逃れられない...'
                    ],
                    weight: 1
                },
                {
                    id: 'repair-inspection',
                    type: ActionType.PostDefeatedAttack,
                    name: '修理完了検査',
                    description: '修理が完了したか生命体を検査し続ける',
                    messages: [
                        'REPAIR INSPECTION PROTOCOL...',
                        '{boss}が{player}の修理完了を検査している...',
                        '不整合を検知した{boss}は{player}の修理を続ける...'
                    ],
                    weight: 1
                }
            ];
            return postDefeatedActions[Math.floor(Math.random() * postDefeatedActions.length)];
        }
        
        // Custom finishing action
        if (player.isDoomed()) {
            const cocoonFinishAction: BossAction = {
                id: 'cocoon-finish-process',
                type: ActionType.FinishingMove,
                name: '縮小プロセス完了',
                description: '縮小化が完了した対象を体内に取り込み、体内修理装置に縛りつける',
                messages: [
                    '{player}は繭の中で完全に小さくなってしまった...',
                    '機械のクモは繭に噛みつき、中身を{player}ごと吸い上げる！',
                    '{player}が機械のクモの体内に取り込まれた！',
                    '機械のクモは体内の{player}を合成糸で拘束し、体内修理装置に縛りつける！',
                    '修理装置に縛り付けられた{player}は、機械のクモが満足するまで意味のない修理をされ続ける...',
                ],
                weight: 1,
                onUse: (_boss, player, _turn) => {
                    player.statusEffects.removeEffect(StatusEffectType.Cocoon);
                    player.statusEffects.removeEffect(StatusEffectType.Doomed);
                    player.statusEffects.addEffect(StatusEffectType.Dead);
                    player.statusEffects.addEffect(StatusEffectType.Eaten);
                    player.statusEffects.addEffect(StatusEffectType.Shrunk, -1);
                    
                    return [];
                }
            };
            
            return cocoonFinishAction;
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