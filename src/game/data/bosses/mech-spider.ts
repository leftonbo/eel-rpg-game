import { BossData, ActionType, BossAction } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffect';

const mechSpiderActions: BossAction[] = [
    // Normal state actions
    {
        type: ActionType.Attack,
        name: 'レーザーショット',
        description: '精密なレーザーで攻撃する',
        messages: ['<USER>は精密なレーザーで<TARGET>を狙撃する！'],
        damage: 4,
        hitRate: 0.9,
        weight: 20,
        playerStateCondition: 'normal'
    },
    {
        type: ActionType.Attack,
        name: 'クモキック',
        description: '強力だが不正確な蹴り攻撃',
        messages: ['<USER>は機械の脚で<TARGET>を蹴り飛ばそうとする！'],
        damage: 8,
        hitRate: 0.6,
        weight: 15,
        playerStateCondition: 'normal'
    },
    {
        type: ActionType.StatusAttack,
        name: 'ショックバイト',
        description: '噛みついて電気ショックを与える',
        messages: ['<USER>は<TARGET>に噛みついて電気ショックを流す！'],
        damage: 3,
        statusEffect: StatusEffectType.Stunned,
        statusChance: 30,
        hitRate: 0.7,
        weight: 12,
        canUse: (_boss, player, _turn) => {
            return player.isKnockedOut() || !player.isRestrained();
        }
    },
    {
        type: ActionType.RestraintAttack,
        name: 'スパイダーグラブ',
        description: '抱きしめるように拘束する',
        messages: ['<USER>は機械の腕で<TARGET>を抱きしめて拘束しようとする！'],
        damage: 4,
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
    },
    
    // Cocoon Process - special transition attack
    {
        type: ActionType.CocoonAttack,
        name: '縮小プロセス',
        description: 'エルナルを繭にして縮小液で満たす',
        messages: [
            '<USER>は<TARGET>を合成糸でぐるぐる巻きにし始める！',
            '<TARGET>が繭の中に閉じ込められ、内部が縮小液で満たされる！'
        ],
        weight: 1,
        canUse: (_boss, player, _turn) => {
            // Only use when player is knocked out AND restrained
            return player.isKnockedOut() && player.isRestrained();
        }
    },
    
    // Cocoon state actions
    {
        type: ActionType.CocoonAction,
        name: '繭の抱擁',
        description: '繭状態のエルナルをゆらゆら揺らして縮小させる',
        messages: ['<USER>は繭を優しく抱擁し、ゆらゆらと揺らしている...'],
        damage: 8, // Max HP reduction amount
        weight: 30,
        playerStateCondition: 'cocoon'
    },
    {
        type: ActionType.CocoonAction,
        name: '繭の圧縮',
        description: '繭を抱きしめて縮小液を馴染ませる',
        messages: ['<USER>は繭を強く抱きしめ、縮小液を<TARGET>に馴染ませる！'],
        damage: 15, // Max HP reduction amount
        weight: 25,
        playerStateCondition: 'cocoon'
    },
    {
        type: ActionType.CocoonAction,
        name: '縮小液循環',
        description: '繭内部の縮小液を循環させてエネルギーを得る',
        messages: ['<USER>は繭内部の縮小液を循環させ、<TARGET>のエネルギーを吸収する！'],
        damage: 12, // Max HP reduction amount
        healRatio: 2.0, // Heal 2x the amount reduced + gain max HP
        weight: 20,
        playerStateCondition: 'cocoon'
    }
];

export const mechSpiderData: BossData = {
    id: 'mech-spider',
    name: 'MechSpider',
    displayName: '🕷️ 機械のクモ',
    description: '眼の前の生き物をなんでも壊れた機械と見なして修理しようとする機械クモ。エルナルを「壊れた機械」として修理しようと執拗に追い詰める。',
    maxHp: 320,
    attackPower: 6,
    actions: mechSpiderActions,
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
        
        // State-based action selection
        const playerState = boss.getPlayerState(player);
        
        // If player is in cocoon state, use cocoon actions
        if (playerState === 'cocoon') {
            const cocoonActions = mechSpiderActions.filter(action => 
                action.type === ActionType.CocoonAction && 
                (!action.playerStateCondition || action.playerStateCondition === 'cocoon')
            );
            
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
        
        // If player is eaten, devour them (process as "recycling")
        if (playerState === 'eaten') {
            return {
                type: ActionType.DevourAttack,
                name: 'リサイクル処理',
                description: '対象を原材料として分解する',
                weight: 1
            };
        }
        
        // Special condition: cocoon process (KO + restrained)
        if (player.isKnockedOut() && player.isRestrained()) {
            const cocoonAttack = mechSpiderActions.find(action => action.type === ActionType.CocoonAttack);
            if (cocoonAttack) {
                return cocoonAttack;
            }
        }
        
        // Knocked out state prioritization
        if (playerState === 'ko') {
            // 80% chance to restrain if not already restrained
            if (!player.isRestrained() && Math.random() < 0.8) {
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
        
        // Restrained state: use electric shock occasionally
        if (playerState === 'restrained') {
            const shockBite = mechSpiderActions.find(action => 
                action.name === 'ショックバイト' && 
                (!action.canUse || action.canUse(boss, player, turn))
            );
            if (shockBite && Math.random() < 0.3) {
                return shockBite;
            }
        }
        
        // Normal state: prioritize restraint attacks
        if (playerState === 'normal') {
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
                (action.type === ActionType.Attack || action.type === ActionType.StatusAttack) &&
                action.playerStateCondition === 'normal' &&
                (!action.canUse || action.canUse(boss, player, turn))
            );
            if (normalActions.length > 0) {
                return normalActions[Math.floor(Math.random() * normalActions.length)];
            }
        }
        
        // Fallback: any available action
        const availableActions = mechSpiderActions.filter(action => 
            !action.canUse || action.canUse(boss, player, turn)
        );
        if (availableActions.length > 0) {
            return availableActions[Math.floor(Math.random() * availableActions.length)];
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
        'エルナルは繭の中で完全に小さくなってしまった...',
        '機械のクモは繭に噛みつき、中身をエルナルごと吸い上げる！',
        'エルナルが機械のクモの体内に取り込まれた！',
        '機械のクモは体内のエルナルを合成糸で拘束し、体内修理装置に縛りつける！',
        '修理装置に縛り付けられたエルナルは、機械のクモが満足するまで意味のない修理をされ続ける...',
    ];
};