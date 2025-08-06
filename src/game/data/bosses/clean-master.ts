import { BossData, ActionType, BossAction, Boss } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffectTypes';

const cleanMasterActions: BossAction[] = [
    // 段階1: 吸引・回収フェーズ（掃除機モード）
    {
        id: 'gentle-suction',
        type: ActionType.Attack,
        name: '弱吸引',
        description: 'やさしく吸い込んで汚れを取る',
        messages: [
            'お掃除開始〜♪',
            '{boss}は小さな吸引で{player}の汚れを取ろうとする！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.7,
        hitRate: 0.95,
        weight: 25,
        statusEffect: StatusEffectType.Soapy,
        statusChance: 0.30,
        playerStateCondition: 'normal'
    },
    {
        id: 'powerful-suction',
        type: ActionType.Attack,
        name: '強力吸引',
        description: 'パワフルに吸い込んで汚れを根こそぎ取る',
        messages: [
            'がんばって吸い込むよ〜♪',
            '{boss}は強力な吸引で{player}を吸い寄せる！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.0,
        hitRate: 0.8,
        weight: 20,
        statusEffect: StatusEffectType.Spinning,
        statusChance: 0.25,
        playerStateCondition: 'normal'
    },
    {
        id: 'dust-brush',
        type: ActionType.Attack,
        name: '埃払い',
        description: 'ブラシでサッサと埃を払う',
        messages: [
            'ほこりほこり〜♪',
            '{boss}は回転ブラシで{player}の埃を払う！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.8,
        hitRate: 0.9,
        weight: 20,
        playerStateCondition: 'normal'
    },
    {
        id: 'arm-catch',
        type: ActionType.RestraintAttack,
        name: 'アームキャッチ',
        description: 'お掃除アームで優しく捕まえる',
        messages: [
            'つかまえた〜♪',
            '{boss}は清掃アームで{player}を優しく捕まえる！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.5,
        weight: 15,
        canUse: (_boss, player, _turn) => {
            return !player.isRestrained() && !player.isEaten() && Math.random() < 0.4;
        }
    },
    {
        id: 'soap-spray',
        type: ActionType.StatusAttack,
        name: '泡スプレー',
        description: 'お掃除用の泡をシューッと吹きかける',
        messages: [
            '泡泡スプレー〜♪',
            '{boss}は{player}に清掃用の泡をスプレーする！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.4,
        hitRate: 0.95,
        statusEffect: StatusEffectType.Soapy,
        statusChance: 0.80,
        weight: 18
    }
];

const cleanMasterActionsRestrained: BossAction[] = [
    // 段階2: 洗浄フェーズ（ブラシでお掃除）
    {
        id: 'gentle-brush',
        type: ActionType.Attack,
        name: 'ふかふかブラシ',
        description: '捕まえた相手をやさしくブラシで洗う',
        messages: [
            'ふかふかブラシ〜♪',
            '{boss}は{player}をやさしくブラシで洗っている！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.25,
        weight: 30
    },
    {
        id: 'scrub-brush',
        type: ActionType.Attack,
        name: '高圧水洗浄',
        description: '汚れをしっかり落とすために高圧水で洗う',
        messages: [
            'まだ汚れてるよ〜、もっと洗わなくちゃ♪',
            '{boss}は{player}をしっかりと洗濯している！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.7,
        weight: 25,
        statusEffect: StatusEffectType.Spinning,
        statusChance: 0.40
    },
    {
        id: 'foam-massage-wash',
        type: ActionType.Attack,
        name: '泡もみ洗い',
        description: '泡でもみもみ洗って汚れを落とす',
        messages: [
            'もみもみ泡泡〜♪',
            '{boss}は{player}に泡を吹きかけ、アームで優しくもみ洗いしている！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.0,
        weight: 20,
        statusEffect: StatusEffectType.Soapy,
        statusChance: 0.60
    }
];

const cleanMasterActionsEaten: BossAction[] = [
    // 段階3: 完全洗浄フェーズ（体内洗濯）
    {
        id: 'wash-cycle',
        type: ActionType.DevourAttack,
        name: '洗浄サイクル',
        description: '体内で完全な洗浄サイクルを実行',
        messages: [
            'ぐるぐる洗濯モード〜♪',
            '{boss}は体内で{player}を洗浄サイクルにかけている！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.8,
        weight: 25,
        statusEffect: StatusEffectType.Spinning,
        statusChance: 0.80
    },
    {
        id: 'spin-dry-mode',
        type: ActionType.DevourAttack,
        name: '脱水モード',
        description: '遠心分離で水分を飛ばす',
        messages: [
            'くるくる脱水〜♪',
            '{boss}は{player}を遠心分離で脱水している！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 2.0,
        weight: 20,
        statusEffect: StatusEffectType.Spinning,
        statusChance: 0.90
    },
    {
        id: 'warm-air-dry',
        type: ActionType.DevourAttack,
        name: '温風乾燥',
        description: 'ほかほかの温風で乾燥させる',
        messages: [
            'ほかほか温風〜♪',
            '{boss}は{player}を温風で乾燥させている！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.3,
        weight: 25,
        statusEffect: StatusEffectType.Steamy,
        statusChance: 0.70
    },
    {
        id: 'finishing-iron',
        type: ActionType.DevourAttack,
        name: '仕上げアイロン',
        description: '最後の仕上げでアイロンがけ',
        messages: [
            'アイロンでしわしわ取る〜♪',
            '{boss}は{player}をアイロンで仕上げている！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.7,
        weight: 15,
        statusEffect: StatusEffectType.Steamy,
        statusChance: 0.60
    },
    {
        id: 'perfection-check',
        type: ActionType.DevourAttack,
        name: '完璧チェック',
        description: '汚れが残ってないかチェック',
        messages: [
            '{boss}は{player}をくまなくチェックしている...',
            'うーん、まだ汚れてるかも〜？もう一度お掃除しなくちゃ♪',
            '{boss}は{player}をキレイにするためにもう一度洗浄を始める！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.2,
        weight: 20
    }
];

export const cleanMasterData: BossData = {
    id: 'clean-master',
    name: 'CleanMaster',
    displayName: 'クリーンマスター',
    description: 'かわいい清掃マスコットロボット',
    questNote: `とある研究所から逃げ出した清掃ロボットが、街中で「汚れた」人々を捕まえて強制的に清掃しているという報告が入った。このロボットは完璧主義で、一度清掃を始めると「完璧になるまで」絶対に止めないという...`,
    maxHp: 720,
    attackPower: 16,
    actions: cleanMasterActions,
    icon: '🧹',
    explorerLevelRequired: 6,
    battleStartMessages: [
        {
            speaker: 'player',
            style: 'default',
            text: 'あなたはクリーンマスターの居る研究所を突き止め、問題のマスコットロボットと対峙した。'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「ピピッ！汚れを発見しました〜♪ 清掃を開始します〜！」'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: 'クリーンマスターがあなたを見つけ、清掃モードに入った！',
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「スキャン結果：汚れレベル87%です〜！完璧になるまで清掃しちゃいます〜♪」'
        }
    ],
    victoryMessages: [
        {
            speaker: 'boss',
            style: 'talk',
            text: '「清掃道具が壊れちゃった...でも、キミはとてもキレイになったね〜♪」'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「次回はもっと徹底的に清掃してあげます〜」'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: 'クリーンマスターの清掃プログラムが停止した'
        }
    ],
    victoryTrophy: {
        name: '清掃ブラシ',
        description: 'クリーンマスターが使用していた高性能清掃ブラシ。あらゆる汚れを落とす超技術。'
    },
    defeatTrophy: {
        name: '清掃プログラム',
        description: 'クリーンマスターの中枢に組み込まれていた清掃AIプログラム。完璧な清掃理論が記録されている。'
    },
    personality: [
        'お掃除、お掃除〜♪',
        'ぴかぴかにしなくちゃ！',
        '汚れちゃんは逃がさないよ〜',
        'きれいきれいしてあげる♪',
        'がんばって洗うからね〜',
        '完璧になるまで終われないの〜'
    ],
    aiStrategy: (boss, player, turn) => {
        // Clean Master AI Strategy - 段階的清掃プロセス
        
        // Post-defeat状態での特殊行動
        if (player.isDefeated()) {
            const defeatStartTurn = boss.getCustomVariable<number>('defeatStartTurn', -1);
            
            // If this is the first turn player is defeated, record it
            if (defeatStartTurn === -1) {
                boss.setCustomVariable('defeatStartTurn', turn);
            }

            // Every 8 turns since defeat started, show special thorough cleaning cycle
            const turnsSinceDefeat = turn - boss.getCustomVariable<number>('defeatStartTurn', turn);
            if (turnsSinceDefeat > 0 && turnsSinceDefeat % 8 === 0) {
                return {
                    id: 'thorough-cleaning-cycle',
                    type: ActionType.PostDefeatedAttack,
                    name: '徹底清掃サイクル',
                    description: '体内清掃装置でプレイヤーを徹底的に洗浄→乾燥→仕上げする',
                    messages: [
                        '「わあい〜♪ 特別な徹底清掃の時間だよ〜！」',
                        '{boss}の体内で本格的な清掃装置が起動する！',
                        '「まず、もう一回洗浄〜♪」',
                        '高圧洗浄水が{player}を激しく洗い流す！',
                        '「次は脱水〜♪」',
                        '遠心分離機が{player}をぐるぐる回転させて水分を飛ばす！',
                        '「温風乾燥〜♪」',
                        '暖かい風が{player}を包み込んで完全に乾燥させる！',
                        '「最後は仕上げのアイロンがけ〜♪」',
                        'アイロンが{player}をプレスして完璧に仕上げる！',
                        '「これで完璧〜♪ ...でも、まだ汚れてるかも？」',
                        '{player}は石鹸と回転の感覚に完全に圧倒されてしまった...'
                    ],
                    onUse: (_boss, player, _turn) => {
                        // 清掃関連の状態異常を付与
                        player.statusEffects.addEffect(StatusEffectType.Soapy);
                        player.statusEffects.addEffect(StatusEffectType.Spinning);
                        player.statusEffects.addEffect(StatusEffectType.Steamy);
                        player.statusEffects.addEffect(StatusEffectType.Dizzy);
                        
                        return [];
                    },
                    weight: 1
                };
            }
            
            const postDefeatedActions: BossAction[] = [
                {
                    id: 'eternal-cleaning-mode',
                    type: ActionType.PostDefeatedAttack,
                    name: '永続清掃モード',
                    description: '完璧になるまで永続的に清掃し続ける',
                    messages: [
                        'ずっとお掃除してあげるからね〜♪',
                        '{boss}は{player}を永続的に清掃し続けている...',
                        'でも、どんなに洗っても「まだ汚れてる」と言い続ける...'
                    ],
                    weight: 1
                },
                {
                    id: 'perfectionist-trigger',
                    type: ActionType.PostDefeatedAttack,
                    name: '完璧主義発動',
                    description: '99%では満足せず、100%完璧を目指す',
                    messages: [
                        'あっ！まだ汚れが...もう1回〜♪',
                        '{boss}は{player}の見えない汚れを発見してしまった...',
                        '完璧主義の{boss}は決して満足しない...'
                    ],
                    weight: 1
                },
                {
                    id: 'loving-cleaning',
                    type: ActionType.PostDefeatedAttack,
                    name: '愛情清掃',
                    description: '愛情を込めてお掃除し続ける',
                    messages: [
                        'だいすきだから、きれいにしてあげる〜♪',
                        '{boss}は{player}を愛情込めて清掃している...',
                        'でも、愛情が深すぎて止まらない...'
                    ],
                    weight: 1
                }
            ];
            return postDefeatedActions[Math.floor(Math.random() * postDefeatedActions.length)];
        }
        
        // 体内（食べられた）状態での行動
        if (player.isEaten()) {
            const eatenActions = cleanMasterActionsEaten;
            
            // 体内行動は特殊で、リストの行動を順番に実施
            const eatenActionIndex = boss.getCustomVariable('eatenActionIndex', 0);
            
            if (eatenActionIndex + 1 < eatenActions.length) {
                // 次の行動のためにインクリメント
                boss.setCustomVariable('eatenActionIndex', eatenActionIndex + 1);
            }
            else
            {
                // すべての行動を実施したらリセット
                boss.setCustomVariable('eatenActionIndex', 0);
            }
            
            // 現在の行動を返す
            return eatenActions[eatenActionIndex];
        }
        else
        {
            // 実装インデックスをリセット
            boss.setCustomVariable('eatenActionIndex', 0);
        }
        
        // 戦略的行動選択
        if (player.isKnockedOut()) {
            if (player.isRestrained()) {
                // 拘束+気絶状態: 85%の確率で吸い込む
                if (Math.random() < 0.85) {
                    return {
                        id: 'complete-cleaning-mode-restrained',
                        type: ActionType.EatAttack,
                        name: '完全清掃モード',
                        description: '体内洗浄槽で完全清掃する',
                        messages: [
                            'やったぁ〜！お洗濯タイム♪',
                            '{boss}は清掃アームで{player}を体内洗浄槽に放り込む！'
                        ],
                        weight: 1
                    };
                }
            } else {
                // 通常+気絶状態: 70%で拘束、20%で直接吸い込み
                const random = Math.random();
                if (random < 0.7) {
                    return {
                        id: 'arm-catch-strategic',
                        type: ActionType.RestraintAttack,
                        name: 'アームキャッチ',
                        description: '清掃アームで捕まえる',
                        messages: [
                            'つかまえた〜♪',
                            '{boss}は清掃アームで{player}を捕まえる！'
                        ],
                        weight: 1
                    };
                } else if (random < 0.9) {
                    return {
                        id: 'complete-cleaning-mode-knockedout',
                        type: ActionType.EatAttack,
                        name: '完全清掃モード',
                        description: '体内洗浄槽で完全清掃する',
                        messages: [
                            'やったぁ〜！お洗濯タイム♪',
                            '{boss}は{player}を直接体内洗浄槽に吸い込む！'
                        ],
                        weight: 1
                    };
                }
            }
        }
        
        // 拘束状態での行動
        if (player.isRestrained()) {
            const restrainedActions = cleanMasterActionsRestrained;
            const totalWeight = restrainedActions.reduce((sum, action) => sum + action.weight, 0);
            let random = Math.random() * totalWeight;
            
            for (const action of restrainedActions) {
                random -= action.weight;
                if (random <= 0) {
                    return action;
                }
            }
            return restrainedActions[0];
        }
        
        // 通常状態での行動優先順位
        
        // 1. 汚れ具合チェック（プレイヤーのHP/状態異常状況）
        const playerHpPercentage = player.getHpPercentage();
        const hasStatusEffects = player.statusEffects.getAllEffects().length > 0;
        
        // 2. 汚れがひどい場合（HP低い/状態異常多い）は積極的に清掃
        if (playerHpPercentage < 30 || hasStatusEffects) {
            // 60%の確率で拘束攻撃
            if (Math.random() < 0.6) {
                const restraintAction = cleanMasterActions.find(action => action.type === ActionType.RestraintAttack);
                if (restraintAction && (!restraintAction.canUse || restraintAction.canUse(boss, player, turn))) {
                    return restraintAction;
                }
            }
            
            // 40%の確率で状態異常攻撃
            if (Math.random() < 0.4) {
                const statusAttack = cleanMasterActions.find(action => action.type === ActionType.StatusAttack);
                if (statusAttack) {
                    return statusAttack;
                }
            }
        }
        
        // 3. 通常の清掃活動
        const currentPlayerState = boss.getPlayerState(player);
        const availableActions = cleanMasterActions.filter(action => {
            if (action.playerStateCondition && action.playerStateCondition !== currentPlayerState) {
                return false;
            }
            if (action.canUse) {
                return action.canUse(boss, player, turn);
            }
            return true;
        });
        
        if (availableActions.length === 0) {
            return cleanMasterActions[0];
        }
        
        // 重み付きランダム選択
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

// 特殊な勝利条件: 完璧主義で永続清掃
cleanMasterData.finishingMove = function(): string[] {
    return [
        'クリーンマスターは{player}を完璧に清掃した！',
        'でも、完璧主義のクリーンマスターは「まだ汚れてるかも...」と心配している...',
        '{player}はクリーンマスターの体内洗浄槽に永続的に保管された！',
        'クリーンマスターは毎日{player}を洗い続け、「今日もお掃除がんばるよ〜♪」と楽しそうに呟いている...'
    ];
};

// 可愛らしい性格の対話システム
cleanMasterData.getDialogue = function(situation: 'battle-start' | 'player-restrained' | 'player-eaten' | 'player-escapes' | 'low-hp' | 'victory') {
    const dialogues: Record<string, string[]> = {
        'battle-start': [
            'わあ〜、汚れちゃんを見つけたよ！',
            'お掃除、お掃除〜♪ ぴかぴかにしなくちゃ！',
            '汚れちゃんは逃がさないよ〜',
            'きれいきれいしてあげる〜♪'
        ],
        'player-restrained': [
            'うふふ〜、捕まえた♪',
            'お掃除タイム開始だよ〜',
            'おとなしくしてね〜、洗ってあげるから♪',
            '逃げちゃダメだよ〜、まだ汚れてるもん！',
            'ちゃんとお掃除させてよ〜'
        ],
        'player-eaten': [
            'お腹の中でごしごし〜♪',
            'ぐるぐる洗濯機〜♪',
            'ぴかぴかにしてあげるからね〜',
            'もうちょっと、もうちょっと〜',
            'きれいになるまでがんばる〜♪',
            'あっ、まだ汚れが！もう一回〜♪'
        ],
        'player-escapes': [
            'あ〜、逃げちゃった...',
            'まだお掃除途中だったのに〜',
            '汚れちゃんは逃げ足速いなあ',
            '今度はちゃんと掃除させてよ〜',
            'またお掃除してあげるからね〜♪'
        ],
        'low-hp': [
            'お掃除パワーが足りない〜',
            'がんばらなくちゃ〜',
            '負けないもん！お掃除魂〜♪',
            'まだまだ〜！汚れに負けない〜',
            'お掃除は止められないよ〜'
        ],
        'victory': [
            'やったぁ〜！きれいになったね♪',
            'お掃除大成功〜！',
            'ぴかぴかで気持ちいいでしょ〜？',
            'また汚れたら呼んでね〜♪',
            'ずっとお掃除してあげるからね〜'
        ]
    };
    
    const options = dialogues[situation] || dialogues['battle-start'];
    return options[Math.floor(Math.random() * options.length)];
};