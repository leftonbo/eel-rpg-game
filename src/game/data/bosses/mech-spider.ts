import { BossData, ActionType, BossAction } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffect';

const mechSpiderActions: BossAction[] = [
    {
        type: ActionType.Attack,
        name: 'レーザー射撃',
        description: '精密なレーザーで攻撃',
        damage: 3,
        hitRate: 0.95,
        weight: 15
    },
    {
        type: ActionType.Attack,
        name: '機械パンチ',
        description: '機械の腕で殴る',
        damage: 5,
        hitRate: 0.7,
        criticalRate: 0.1,
        weight: 10
    },
    {
        type: ActionType.RestraintAttack,
        name: 'ワイヤー拘束',
        description: '金属ワイヤーで拘束する',
        weight: 35,
        canUse: (_boss, player, _turn) => {
            // Very frequently use restraint attacks
            return !player.isRestrained() && !player.isEaten() && Math.random() < 0.8;
        }
    },
    {
        type: ActionType.RestraintAttack,
        name: '修理アーム展開',
        description: '修理用アームで対象を掴む',
        weight: 30,
        canUse: (_boss, player, _turn) => {
            return !player.isRestrained() && !player.isEaten() && Math.random() < 0.7;
        }
    },
    {
        type: ActionType.StatusAttack,
        name: '電気ショック',
        description: '軽い電流で動きを鈍らせる',
        damage: 2,
        statusEffect: StatusEffectType.Slow,
        weight: 10
    }
];

export const mechSpiderData: BossData = {
    id: 'mech-spider',
    name: 'MechSpider',
    displayName: '🕷️ 機械のクモ',
    description: '眼の前の生き物をなんでも壊れた機械と見なして修理しようとする機械クモ。攻撃力は低いが拘束攻撃を頻発する。',
    maxHp: 360,
    attackPower: 8,
    actions: mechSpiderActions,
    personality: [
        'ERROR: 損傷した機械を検出',
        '修理プロトコル開始',
        'ANALYZING... 重大な損傷あり',
        '修理が必要です',
        'CAPTURING TARGET...',
        '修理完了まで待機してください'
    ],
    aiStrategy: (_boss, player, _turn) => {
        // Mech Spider AI Strategy - Focus heavily on restraint attacks
        
        // If player is eaten, devour them (process as "recycling")
        if (player.isEaten()) {
            return {
                type: ActionType.DevourAttack,
                name: 'リサイクル処理',
                description: '対象を原材料として分解する',
                weight: 1
            };
        }
        
        // Strategic actions based on player state
        if (player.isKnockedOut()) {
            if (player.isRestrained()) {
                // Restrained + Knocked Out: 95% chance to "repair" (eat)
                if (Math.random() < 0.95) {
                    return {
                        type: ActionType.EatAttack,
                        name: '内部修理開始',
                        description: '拘束された対象を修理するために体内に取り込む',
                        weight: 1
                    };
                }
            } else {
                // Normal + Knocked Out: 80% chance to restrain, 15% to eat directly
                const random = Math.random();
                if (random < 0.8) {
                    return {
                        type: ActionType.RestraintAttack,
                        name: 'ワイヤー拘束',
                        description: '損傷した機械を修理アームで固定する',
                        weight: 1
                    };
                } else if (random < 0.95) {
                    return {
                        type: ActionType.EatAttack,
                        name: '内部修理開始',
                        description: '拘束された対象を修理するために体内に取り込む',
                        weight: 1
                    };
                }
            }
        }
        
        // Almost always prioritize restraint if player is not restrained
        if (!player.isRestrained() && !player.isEaten()) {
            const restraintActions = mechSpiderActions.filter(action => action.type === ActionType.RestraintAttack);
            
            // 80% chance to use restraint attack
            if (restraintActions.length > 0 && Math.random() < 0.8) {
                return restraintActions[Math.floor(Math.random() * restraintActions.length)];
            }
        }
        
        // If player is restrained, occasionally use electric shock
        if (player.isRestrained() && !player.statusEffects.hasEffect(StatusEffectType.Slow)) {
            const electricShock = mechSpiderActions.find(action => action.statusEffect === StatusEffectType.Slow);
            if (electricShock && Math.random() < 0.4) {
                return electricShock;
            }
        }
        
        // Use weak attacks as fallback
        const attackActions = mechSpiderActions.filter(action => action.type === ActionType.Attack);
        if (attackActions.length > 0) {
            return attackActions[Math.floor(Math.random() * attackActions.length)];
        }
        
        // Default fallback
        return mechSpiderActions[0];
    }
};

// Add special dialogues for specific actions
mechSpiderData.specialDialogues = new Map([
    ['糸拘束', '機械のクモが特殊な糸でエルナルを拘束した！'],
    ['電気糸', '機械のクモの電気糸がエルナルに絡みついた！'],
    ['修理作業', '機械のクモがエルナルに「修理」を施している...'],
    ['内部修理', '機械のクモがエルナルを内部で修理している...'],
    ['システム診断', '機械のクモがエルナルをシステム診断中...'],
    ['回路調整', '機械のクモがエルナルの回路を調整している...']
]);

// Override dialogue for robotic personality
mechSpiderData.getDialogue = function(situation: 'battle-start' | 'player-restrained' | 'player-eaten' | 'player-escapes' | 'low-hp' | 'victory') {
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
        'player-eaten': [
            'PROCESSING... 内部修理を実行中',
            'REPAIR IN PROGRESS... しばらくお待ちください',
            'SYSTEM MAINTENANCE... 完了まで待機',
            'INTERNAL REPAIR SEQUENCE ACTIVE...',
            'RECYCLING PROTOCOL... 原材料として処理中'
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