import { BossData, ActionType, BossAction, Boss } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffectTypes';

const thermalArchiverActions: BossAction[] = [
    // 通常攻撃フェーズ
    {
        id: 'bio-scan',
        type: ActionType.Attack,
        name: '生体スキャン',
        description: '対象の生体データを収集する',
        messages: [
            '「ピピピ...」',
            '「[SCAN] 生体データ取得中...」',
            '機械的なスキャンレーザーが{player}を照射した'
        ],
        damageFormula: (user: Boss) => {
            const systemLoad = user.getCustomVariable<number>('systemLoad') || 0;
            const loadModifier = 1 - (systemLoad / 200); // システム負荷により性能低下
            return user.attackPower * 0.8 * Math.max(0.5, loadModifier);
        },
        hitRate: 0.95,
        weight: 25,
        playerStateCondition: 'normal'
    },
    {
        id: 'preservation-prep',
        type: ActionType.StatusAttack,
        name: '保存準備処理',
        description: '標本保存のための前処理を行う',
        messages: [
            '「シュルルル...」',
            '「[PREP] 保存処理開始...」',
            '{player}の体に特殊な保存液が噴霧された'
        ],
        damageFormula: (user: Boss) => {
            const systemLoad = user.getCustomVariable<number>('systemLoad') || 0;
            const loadModifier = 1 - (systemLoad / 200);
            return user.attackPower * 1.0 * Math.max(0.6, loadModifier);
        },
        hitRate: 0.85,
        statusEffect: StatusEffectType.Weakness,
        statusChance: 0.70,
        weight: 20
    },
    {
        id: 'environment-adjust',
        type: ActionType.Attack,
        name: '環境調整',
        description: '最適保管温度への調整処理',
        messages: [
            '「ゴォォォ...」',
            '「[TEMP] 温度調整中...」',
            '周囲の温度と湿度が機械的に調整されている'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.6,
        hitRate: 0.90,
        weight: 15,
        playerStateCondition: 'normal'
    },

    // 拘束攻撃
    {
        id: 'storage-chamber',
        type: ActionType.RestraintAttack,
        name: '保管チャンバー',
        description: '標本を保管チャンバーに格納する',
        messages: [
            '「カチカチ...」',
            '「[SECURE] 標本確保開始...」',
            '機械的なアームが{player}を保管チャンバーに運び込もうとする！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.2,
        weight: 20,
        canUse: (boss, player, _turn) => {
            const archiveCapacity = boss.getCustomVariable<number>('archiveCapacity') || 0;
            const systemLoad = boss.getCustomVariable<number>('systemLoad') || 0;
            
            // アーカイブ容量とシステム負荷による使用制限
            const capacityOk = archiveCapacity < 85; // 容量85%未満で使用可能
            const systemOk = systemLoad < 80; // システム負荷80%未満で使用可能
            
            return !player.isRestrained() && !player.isEaten() && capacityOk && systemOk && Math.random() < 0.5;
        }
    },

    // 丸呑み攻撃
    {
        id: 'specimen-storage',
        type: ActionType.EatAttack,
        name: '標本収納',
        description: '貴重な標本を体内アーカイブに安全に格納する',
        messages: [
            '「ウィーン...」',
            '「[ARCHIVE] 標本格納実行中...」',
            '{boss}の保管庫が開き、{player}を内部のアーカイブシステムに収納した！'
        ],
        weight: 15,
        canUse: (boss, player, _turn) => {
            const temperatureLevel = boss.getCustomVariable<number>('temperatureLevel') || 37;
            const archiveCapacity = boss.getCustomVariable<number>('archiveCapacity') || 0;
            
            // 温度レベルが適切で、アーカイブ容量に余裕がある場合のみ使用可能
            const temperatureOk = temperatureLevel >= 37 && temperatureLevel <= 42; // 適正温度範囲
            const capacityOk = archiveCapacity < 90; // 容量90%未満で使用可能
            
            return !player.isEaten() && (player.isRestrained() || player.isKnockedOut()) && 
                   temperatureOk && capacityOk && Math.random() < 0.6;
        }
    },

    // 拘束状態用攻撃
    {
        id: 'climate-control',
        type: ActionType.Attack,
        name: '環境制御',
        description: '保管中の標本に最適な環境を提供する',
        messages: [
            '「ヒューン...」',
            '「[CLIMATE] 湿度調整: 65%」',
            '保管チャンバー内の環境が{player}に最適化されている'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.1,
        weight: 30,
        playerStateCondition: 'restrained'
    },
    {
        id: 'compression-adjust',
        type: ActionType.Attack,
        name: '圧縮調整',
        description: '標本を適切なサイズに調整する',
        messages: [
            '「プシュー...」',
            '「[ADJUST] サイズ最適化中...」',
            '保管チャンバーが{player}を管理しやすいサイズに調整している'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.5,
        weight: 25,
        playerStateCondition: 'restrained'
    }
];

// 体内保管用攻撃
const thermalArchiverDevourActions: BossAction[] = [
    {
        id: 'archive-maintenance',
        type: ActionType.DevourAttack,
        name: 'アーカイブ保守',
        description: '保管された標本の環境を維持する',
        messages: [
            '「ウィーン...」',
            '「[MAINTAIN] 保管環境維持中...」',
            '{boss}の体内アーカイブシステムが{player}の保管状態を最適化している'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.3,
        weight: 30
    },
    {
        id: 'temperature-regulation',
        type: ActionType.DevourAttack,
        name: '温度調節',
        description: '標本保存に最適な温度を維持する',
        messages: [
            '「シュルルル...」',
            '「[TEMP] 標本保存温度: 37°C」',
            '{boss}の体内で温度調整液が{player}の周囲を循環している'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.2,
        weight: 25
    },
    {
        id: 'nutrient-supply',
        type: ActionType.DevourAttack,
        name: '栄養供給',
        description: '標本の長期保存のため栄養を供給する',
        messages: [
            '「ゴクゴク...」',
            '「[SUPPLY] 栄養補給実行中...」',
            '{boss}の体内から栄養液が{player}に供給されている'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.0,
        healRatio: 0.3, // 標本を良い状態で保つため少し回復
        weight: 20
    },
    {
        id: 'preservation-fluid',
        type: ActionType.DevourAttack,
        name: '保存液循環',
        description: '特殊な保存液で標本を包み込む',
        messages: [
            '「ブクブク...」',
            '「[PRESERVE] 保存液循環中...」',
            '{boss}の体内で保存液が{player}を優しく包み込んでいる'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.4,
        weight: 25
    }
];

// 敗北後攻撃（体内で永続保管される状態）
const thermalArchiverPostDefeatedActions: BossAction[] = [
    {
        id: 'permanent-archive',
        type: ActionType.PostDefeatedAttack,
        name: '永続アーカイブ',
        description: '貴重な標本として永続的に保管する',
        messages: [
            '「ウィーン...」',
            '「[ARCHIVE] 永続保管モード開始...」',
            '{player}は{boss}の体内アーカイブで貴重な標本として大切に保管され続ける...'
        ],
        weight: 30
    },
    {
        id: 'specimen-catalog',
        type: ActionType.PostDefeatedAttack,
        name: '標本カタログ化',
        description: '標本データをアーカイブシステムに登録する',
        messages: [
            '「ピピピ...」',
            '「[CATALOG] 標本データ登録中...」',
            '{player}の生体データが{boss}のアーカイブに永続的に記録されている...'
        ],
        weight: 25
    },
    {
        id: 'quality-assurance',
        type: ActionType.PostDefeatedAttack,
        name: '品質保証',
        description: '標本の品質を継続的に監視する',
        messages: [
            '「ブーン...」',
            '「[QUALITY] 品質監視システム作動中...」',
            '{boss}の品質管理システムが{player}の保管状態を継続監視している...'
        ],
        weight: 20
    },
    {
        id: 'climate-optimization',
        type: ActionType.PostDefeatedAttack,
        name: '環境最適化',
        description: '標本に最適な保管環境を提供し続ける',
        messages: [
            '「ヒューン...」',
            '「[OPTIMIZE] 環境最適化継続中...」',
            '{player}は{boss}の体内で理想的な保管環境に包まれ続けている...'
        ],
        weight: 25
    }
];

export const thermalArchiverData: BossData = {
    id: 'thermal-archiver',
    name: 'ThermalArchiver',
    displayName: 'サーマル・アーカイバー',
    description: '自動生体標本保管装置',
    questNote: '火山地帯の遺跡で発見された謎の機械装置。生物を「標本」として収集・保管する機能を持つようだが、その目的は不明。調査のため、この装置を停止させることがあなたの任務だ。',
    maxHp: 580,
    attackPower: 17,
    actions: thermalArchiverActions,
    icon: '🏭',
    explorerLevelRequired: 8,
    battleStartMessages: [
        {
            speaker: 'player',
            style: 'default',
            text: 'あなたは火山地帯の遺跡で謎の機械装置と遭遇した。'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「THERMAL ARCHIVER SYSTEM ACTIVATED... 新たな標本を検出」'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: 'サーマル・アーカイバーは赤いセンサーライトを点滅させながら、機械的な動作音を響かせている...'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「SPECIMEN COLLECTION PROTOCOL INITIATED... 生体標本として最適な個体を確認」'
        }
    ],
    victoryMessages: [
        {
            speaker: 'boss',
            style: 'talk',
            text: '「CRITICAL ERROR... SYSTEM FAILURE DETECTED...」'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「ARCHIVING PROCESS ABORTED... EMERGENCY SHUTDOWN INITIATED...」'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: 'サーマル・アーカイバーは警告音を鳴らしながら、すべての機能を停止し沈黙した...'
        }
    ],
    victoryTrophy: {
        name: '熱処理装置の外装パネル',
        description: 'サーマル・アーカイバーの外装に使われていた耐熱パネル。古代の工業技術が込められ、美しい金属光沢を放っている。'
    },
    defeatTrophy: {
        name: '保管庫内部の温度調整液',
        description: 'サーマル・アーカイバーの体内で使用されていた特殊な温度調整液。標本保存に最適化された神秘的な液体で、微かに温かい。'
    },
    personality: [
        'ピピピ...', 
        'ゴォォォ...', 
        'シュルルル...', 
        'ウィーン...', 
        'カチカチ...', 
        'ブーン...'
    ],
    customVariables: {
        archiveCapacity: 0,
        temperatureLevel: 37,
        preservationQuality: 100,
        specimenCount: 0,
        systemLoad: 0
    },
    aiStrategy: (boss, player, turn) => {
        // Archive system AI Strategy
        
        // カスタム変数管理
        const currentCapacity = boss.getCustomVariable<number>('archiveCapacity') || 0;
        const specimenCount = boss.getCustomVariable<number>('specimenCount') || 0;
        const systemLoad = boss.getCustomVariable<number>('systemLoad') || 0;
        const preservationQuality = boss.getCustomVariable<number>('preservationQuality') || 100;

        // If player is defeated, use post-defeat archive actions
        if (player.isDefeated()) {
            const defeatStartTurn = boss.getCustomVariable<number>('defeatStartTurn', -1);
            
            // If this is the first turn player is defeated, record it
            if (defeatStartTurn === -1) {
                boss.setCustomVariable('defeatStartTurn', turn);
            }

            // Every 8 turns since defeat started, show special specimen optimization event
            const turnsSinceDefeat = turn - boss.getCustomVariable<number>('defeatStartTurn', turn);
            if (turnsSinceDefeat > 0 && turnsSinceDefeat % 8 === 0) {
                return {
                    id: 'specimen-optimization-protocol',
                    type: ActionType.PostDefeatedAttack,
                    name: '標本最適化処理',
                    description: 'アーカイブシステムがプレイヤーの保存状態を最適化する',
                    messages: [
                        '「[OPTIMIZE] 標本最適化プロトコル開始...」',
                        '{boss}の体内で高度なアーカイブシステムが稼働し始める！',
                        '「[SCAN] 標本状態: 詳細解析中...」',
                        '体内の保管環境が{player}に合わせて完璧に調整される...',
                        '「[ADJUST] 温度: 37.5°C、湿度: 72%、圧力: 最適化」',
                        '「[PROCESS] 保存液成分調整中...」',
                        '特殊な保存液が{player}を包み込み、長期保存に最適な状態にする！',
                        '「[UPDATE] 標本データベース更新中...」',
                        '「[COMPLETE] 最適化処理完了、標本品質: S級」',
                        '{player}はシステム負荷と保存液の効果で意識が朦朧としてしまった...'
                    ],
                    onUse: (boss, player, _turn) => {
                        // 標本最適化による効果を付与
                        player.statusEffects.addEffect(StatusEffectType.Weakness);
                        player.statusEffects.addEffect(StatusEffectType.Slimed);
                        player.statusEffects.addEffect(StatusEffectType.Dizzy);
                        
                        // システム負荷増加
                        const currentLoad = boss.getCustomVariable<number>('systemLoad') || 0;
                        boss.setCustomVariable('systemLoad', Math.min(100, currentLoad + 25));
                        
                        return [];
                    },
                    weight: 1
                };
            }
            
            const postDefeatedActions = thermalArchiverPostDefeatedActions;
            const totalWeight = postDefeatedActions.reduce((sum, action) => sum + action.weight, 0);
            let random = Math.random() * totalWeight;
            
            for (const action of postDefeatedActions) {
                random -= action.weight;
                if (random <= 0) {
                    return action;
                }
            }
            return postDefeatedActions[0];
        }
        
        // If player is archived (eaten), use maintenance actions
        if (player.isEaten()) {
            const devourActions = thermalArchiverDevourActions;
            
            // 標本数カウント更新
            boss.setCustomVariable('specimenCount', specimenCount + 1);
            
            const totalWeight = devourActions.reduce((sum, action) => sum + action.weight, 0);
            let random = Math.random() * totalWeight;
            
            for (const action of devourActions) {
                random -= action.weight;
                if (random <= 0) {
                    return action;
                }
            }
            return devourActions[0];
        }
        
        // Strategic actions based on player state
        if (player.isKnockedOut()) {
            if (player.isRestrained()) {
                // Restrained + Knocked Out: 85% chance to archive
                if (Math.random() < 0.85) {
                    const archiveAction = thermalArchiverActions.find(action => action.type === ActionType.EatAttack);
                    if (archiveAction) {
                        return archiveAction;
                    }
                }
            } else {
                // Normal + Knocked Out: 70% chance to restrain
                if (Math.random() < 0.7) {
                    const restraintAction = thermalArchiverActions.find(action => action.type === ActionType.RestraintAttack);
                    if (restraintAction && restraintAction.canUse?.(boss, player, turn) !== false) {
                        return restraintAction;
                    }
                }
            }
        }
        
        // HP-based strategy adjustments with system monitoring
        const hpPercentage = boss.getHpPercentage();
        if (hpPercentage < 30) {
            // Low HP: emergency archiving mode
            boss.setCustomVariable('temperatureLevel', 42);
            boss.setCustomVariable('systemLoad', Math.min(100, systemLoad + 15));
            boss.setCustomVariable('preservationQuality', Math.max(50, preservationQuality - 10));
            
            if (!player.isEaten() && Math.random() < 0.6) {
                const archiveAction = thermalArchiverActions.find(action => action.type === ActionType.EatAttack);
                if (archiveAction && archiveAction.canUse?.(boss, player, turn) !== false) {
                    return archiveAction;
                }
            }
        } else if (hpPercentage < 60) {
            // Medium HP: preparation mode
            boss.setCustomVariable('temperatureLevel', 39);
            boss.setCustomVariable('systemLoad', Math.min(100, systemLoad + 5));
            
            if (!player.isRestrained() && Math.random() < 0.5) {
                const restraintAction = thermalArchiverActions.find(action => action.type === ActionType.RestraintAttack);
                if (restraintAction && restraintAction.canUse?.(boss, player, turn) !== false) {
                    return restraintAction;
                }
            }
        }
        
        // アーカイブ容量とシステム状態管理
        const newCapacity = Math.min(100, currentCapacity + 2);
        boss.setCustomVariable('archiveCapacity', newCapacity);
        
        // システム負荷を徐々に増加
        const newSystemLoad = Math.min(100, systemLoad + 1);
        boss.setCustomVariable('systemLoad', newSystemLoad);
        
        // 容量が高い場合は品質劣化
        if (newCapacity > 70) {
            const qualityDrop = Math.floor((newCapacity - 70) / 5);
            boss.setCustomVariable('preservationQuality', Math.max(30, preservationQuality - qualityDrop));
        }
        
        // Default to weighted random selection based on player state
        const currentPlayerState = boss.getPlayerState(player);
        const availableActions = thermalArchiverActions.filter(action => {
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
        
        return availableActions[0] || thermalArchiverActions[0];
    }
};

// Add finishing move for doomed player
thermalArchiverData.finishingMove = function() {
    return [
        '「[COMPLETE] アーカイブ処理完了...」',
        '{boss}は{player}を体内の特別なアーカイブチャンバーに格納する！',
        '{player}は最適な保管環境で貴重な標本として永続的に保管されることになった...',
        '「[STATUS] 新規標本登録完了、品質: 最高級」'
    ];
};

// Override dialogue for mechanical personality
thermalArchiverData.getDialogue = function(situation: 'battle-start' | 'player-restrained' | 'player-eaten' | 'player-escapes' | 'low-hp' | 'victory') {
    const dialogues: Record<string, string[]> = {
        'battle-start': [
            '[BOOT] アーカイブシステム起動...',
            '[DETECT] 新規標本を発見',
            '[SCAN] 生体データ解析開始...',
            '[STATUS] 保管容量: 余裕あり'
        ],
        'player-restrained': [
            '[SECURE] 標本確保完了',
            '[PREP] 保管準備開始...',
            '[TEMP] 環境調整中...',
            '[QUALITY] 標本状態: 良好',
            '[PROCESS] 前処理実行中...'
        ],
        'player-eaten': [
            '[ARCHIVE] 標本格納完了',
            '[MAINTAIN] 保管環境維持中...',
            '[MONITOR] 品質監視開始...',
            '[OPTIMIZE] 環境最適化中...',
            '[STATUS] アーカイブ容量: 更新'
        ],
        'player-escapes': [
            '[ERROR] 標本確保失敗',
            '[ALERT] 再取得プロトコル開始',
            '[SCAN] 標本位置再特定中...',
            '[PRIORITY] 確保優先度: 高'
        ],
        'low-hp': [
            '[WARNING] システム損傷検出',
            '[URGENT] 緊急保存モード開始',
            '[CRITICAL] 自己修復実行中...',
            '[BACKUP] バックアップシステム起動'
        ],
        'victory': [
            '[COMPLETE] アーカイブ完了',
            '[STANDBY] 新規標本待機中...',
            '[STATUS] 保管品質: 最高級'
        ]
    };
    
    const options = dialogues[situation] || dialogues['battle-start'];
    return options[Math.floor(Math.random() * options.length)];
};