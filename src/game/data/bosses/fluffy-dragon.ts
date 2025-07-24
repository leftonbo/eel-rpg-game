import { Player } from '@/game/entities/Player';
import { BossData, ActionType, BossAction, Boss } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffectTypes';

const fluffyDragonActions: BossAction[] = [
    // 通常攻撃パターン（誘い込みフェーズ）
    {
        id: 'fluffy-hand',
        type: ActionType.Attack,
        name: 'ふかふかおてて',
        description: 'ふかふかした手で軽く攻撃',
        damageFormula: (user: Boss) => user.attackPower * 0.8,
        hitRate: 0.95,
        weight: 25,
        playerStateCondition: 'normal',
        messages: ['<USER>のふかふかした手が<TARGET>を優しく撫でていく...']
    },
    {
        id: 'lavender-breath',
        type: ActionType.StatusAttack,
        name: 'ラベンダーブレス',
        description: 'ラベンダーの香りで眠気を誘発',
        damageFormula: (user: Boss) => user.attackPower * 0.5,
        statusEffect: StatusEffectType.LavendasCent,
        statusChance: 0.80,
        hitRate: 0.90,
        weight: 20,
        playerStateCondition: 'normal',
        messages: ['<USER>は甘いラベンダーの香りを漂わせる...', '<TARGET>はほんのり眠気を感じ始める...']
    },
    {
        id: 'fluffy-wing-attack',
        type: ActionType.Attack,
        name: 'ふかふか翼撃',
        description: 'ふかふかの翼で包み込むような攻撃',
        damageFormula: (user: Boss) => user.attackPower * 0.9,
        hitRate: 0.85,
        weight: 20,
        playerStateCondition: 'normal',
        messages: ['<USER>のふかふかした翼が<TARGET>を包み込む！']
    },
    {
        id: 'fluffy-restraint',
        type: ActionType.RestraintAttack,
        name: 'ふかふか拘束',
        description: 'ふかふかの体毛で獲物を包み込んで拘束する',
        weight: 15,
        playerStateCondition: 'normal',
        messages: ['<USER>は<TARGET>を抱くようにふかふかの体毛で包み込む！', '<TARGET>は心地よい感触に包まれながらも身動きが取れなくなった...']
    },

    // 拘束中専用攻撃（拘束フェーズ）
    {
        id: 'fluffy-wrap-enhance',
        type: ActionType.StatusAttack,
        name: 'ふかふか強化包み',
        description: 'ふかふかの体毛でさらに深く包み込み、強化拘束状態にする',
        statusEffect: StatusEffectType.FluffyWrap,
        statusChance: 0.90,
        weight: 30,
        playerStateCondition: 'restrained',
        messages: ['<USER>の体毛がさらに厚く<TARGET>を包み込む...', '<TARGET>はより深い心地よさと眠気に包まれる...']
    },
    {
        id: 'sleep-breath',
        type: ActionType.StatusAttack,
        name: '眠りのブレス',
        description: '強力な眠気を誘発するブレス攻撃',
        damageFormula: (user: Boss) => user.attackPower * 0.6,
        statusEffect: StatusEffectType.Sleep,
        statusChance: 0.70,
        weight: 25,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>に向けて眠りのブレスを吐く...', '<TARGET>の意識がぼんやりしてくる...']
    },
    {
        id: 'fluffy-massage',
        type: ActionType.StatusAttack,
        name: 'ふかふかマッサージ',
        description: 'ふかふかの体毛で優しくマッサージして抵抗力を削ぐ',
        damageFormula: (user: Boss) => user.attackPower * 0.4,
        statusEffect: StatusEffectType.Weakness,
        statusChance: 0.60,
        weight: 20,
        playerStateCondition: 'restrained',
        messages: ['<USER>の体毛が<TARGET>を優しくマッサージする...', '<TARGET>は心地よさで力が抜けていく...']
    },

    // 拘束中＋プレイヤーダウン時の特殊攻撃（第一胃袋フェーズ）
    {
        id: 'first-stomach-transfer',
        type: ActionType.DevourAttack,
        name: 'ふかふか胃袋への移送',
        description: '眠り気味の獲物をふかふかな第一胃袋に送り込む',
        damageFormula: (user: Boss) => user.attackPower * 1.2,
        weight: 50,
        playerStateCondition: 'ko',
        messages: [
            '<USER>は<TARGET>を優しく持ち上げると、そのまま口の中に運んでいく...',
            'ふかふかな食道を通って、<TARGET>は第一の胃袋に到着した...',
            '第一胃袋はまるで毛布のようにふかふかで、<TARGET>を優しく包み込む...'
        ]
    },

    // 第一胃袋での行動（眠り誘導専用）
    {
        id: 'fluffy-stomach-lullaby',
        type: ActionType.PostDefeatedAttack,
        name: 'ふかふか胃袋の子守唄',
        description: 'ふかふかな胃袋が子守唄のように優しく収縮する',
        statusEffect: StatusEffectType.Sleep,
        statusChance: 0.9,
        weight: 35,
        playerStateCondition: 'defeated',
        canUse: (boss: Boss, _player: Player, _turn: number) => {
            const stomachPhase = boss.getCustomVariable<string>('stomachPhase', 'first');
            return stomachPhase === 'first';
        },
        messages: [
            'ふかふかな胃袋が心地よいリズムで収縮を繰り返す...',
            '<TARGET>は包まれるような安心感に深い眠りへ誘われていく...'
        ]
    },
    {
        id: 'fluffy-stomach-warmth',
        type: ActionType.PostDefeatedAttack,
        name: 'ふかふか胃袋の温もり',
        description: 'ふかふかな毛に覆われた胃袋の温もりで眠気を誘う',
        statusEffect: StatusEffectType.Drowsiness,
        statusChance: 0.8,
        weight: 30,
        playerStateCondition: 'defeated',
        canUse: (boss: Boss, _player: Player, _turn: number) => {
            const stomachPhase = boss.getCustomVariable<string>('stomachPhase', 'first');
            return stomachPhase === 'first';
        },
        messages: [
            'ふかふかな胃袋の温もりが<TARGET>を包み込む...',
            '<TARGET>は母の胸に抱かれるような安心感を感じる...'
        ]
    },
    {
        id: 'transfer-to-second-stomach',
        type: ActionType.PostDefeatedAttack,
        name: '第二胃袋への移送',
        description: '完全に眠った獲物を第二の胃袋に送り込む',
        weight: 100,
        playerStateCondition: 'defeated',
        canUse: (boss: Boss, player: Player, _turn: number) => {
            const stomachPhase = boss.getCustomVariable<string>('stomachPhase', 'first');
            const turnsSinceEaten = boss.getCustomVariable<number>('turnsSinceEaten', 0);
            const playerAsleep = player.statusEffects.hasEffect(StatusEffectType.Sleep);
            
            // 第一胃袋で5ターン経過し、プレイヤーが眠っている場合
            return stomachPhase === 'first' && turnsSinceEaten >= 5 && playerAsleep;
        },
        onUse: (boss: Boss, player: Player) => {
            // 第二胃袋フェーズに移行
            boss.setCustomVariable('stomachPhase', 'second');
            boss.setCustomVariable('dreamShareStarted', true);
            // 夢の共有状態を付与
            player.statusEffects.addEffect(StatusEffectType.DreamShare);
            return [];
        },
        messages: [
            '完全に眠りに落ちた<TARGET>は、ゆっくりと第二の胃袋へ運ばれていく...',
            '第二の胃袋は毛に覆われておらず、ヌメヌメした柔らかい胃壁が<TARGET>を迎える...',
            '<TARGET>は<USER>の睡眠を肩代わりすることになった...'
        ]
    },

    // 第二胃袋での行動（エネルギー吸収とマナ変換）
    {
        id: 'energy-absorption',
        type: ActionType.PostDefeatedAttack,
        name: 'エネルギー吸収',
        description: '第二胃袋でゆっくりと獲物のエネルギーを吸収する',
        damageFormula: (user: Boss) => user.attackPower * 1.5,
        weight: 30,
        playerStateCondition: 'defeated',
        canUse: (boss: Boss, _player: Player, _turn: number) => {
            const stomachPhase = boss.getCustomVariable<string>('stomachPhase', 'first');
            return stomachPhase === 'second';
        },
        messages: [
            '第二胃袋の柔らかい胃壁が<TARGET>からエネルギーを吸い取る...',
            '<TARGET>の生命力がゆっくりと<USER>に流れていく...'
        ]
    },
    {
        id: 'nightmare-generation',
        type: ActionType.PostDefeatedAttack,
        name: '悪夢の生成',
        description: '眠っている獲物に恐ろしい夢を見させる',
        statusEffect: StatusEffectType.Fear,
        statusChance: 0.7,
        weight: 25,
        playerStateCondition: 'defeated',
        canUse: (boss: Boss, _player: Player, _turn: number) => {
            const stomachPhase = boss.getCustomVariable<string>('stomachPhase', 'first');
            const dreamShareStarted = boss.getCustomVariable<boolean>('dreamShareStarted', false);
            return stomachPhase === 'second' && dreamShareStarted;
        },
        messages: [
            '<USER>は<TARGET>の夢を操作し始める...',
            '<TARGET>は食べられる恐ろしい夢を延々と見させられている...',
            '<TARGET>は夢の中で何度も何度も同じ恐怖を体験する...'
        ]
    },
    {
        id: 'mana-conversion',
        type: ActionType.PostDefeatedAttack,
        name: 'マナ変換',
        description: '獲物のエネルギーを自分のマナに変換する',
        weight: 20,
        playerStateCondition: 'defeated',
        canUse: (boss: Boss, _player: Player, _turn: number) => {
            const stomachPhase = boss.getCustomVariable<string>('stomachPhase', 'first');
            return stomachPhase === 'second';
        },
        onUse: (boss: Boss, _player: Player) => {
            // ボスのMPを少し回復
            boss.mp = Math.min(boss.maxMp, boss.mp + 10);
            return [];
        },
        messages: [
            '<TARGET>のエネルギーが<USER>のマナに変換されている...',
            '<USER>の魔力が徐々に回復していく...'
        ]
    },

    // とどめ攻撃（プレイヤーがDoomed状態時）
    {
        id: 'eternal-sleep-induction',
        type: ActionType.FinishingMove,
        name: '永遠の眠りへの誘い',
        description: '完全にエネルギーを吸い尽くされた獲物を永遠の眠りに誘う',
        weight: 100,
        playerStateCondition: 'defeated',
        canUse: (_boss: Boss, player: Player, _turn: number) => {
            return player.statusEffects.hasEffect(StatusEffectType.Doomed);
        },
        messages: [
            '<TARGET>のエネルギーは完全に<USER>に吸収された...',
            '<USER>は<TARGET>を永遠の眠りに誘い込む...',
            '「心配しなくても大丈夫...これからはずっと私の中で安らかに眠っていればいい」',
            '<TARGET>は<USER>の体内で永遠に眠り続けることになった...'
        ],
        onUse: (_boss: Boss, player: Player) => {
            // 再起不能状態を解除
            player.statusEffects.removeEffect(StatusEffectType.Doomed);
            // プレイヤーを敗北状態にする
            player.statusEffects.addEffect(StatusEffectType.Dead);
            // 食べられ状態にする
            player.statusEffects.addEffect(StatusEffectType.Eaten);
            // 夢の共有状態も継続
            player.statusEffects.addEffect(StatusEffectType.DreamShare);
            
            return [];
        }
    }
];

// AI戦略: 段階的な拘束→眠り→二段階胃袋システム
const fluffyDragonAIStrategy = (boss: Boss, player: Player, turn: number): BossAction => {
    const playerRestrained = player.statusEffects.hasEffect(StatusEffectType.Restrained);
    const playerKO = player.statusEffects.hasEffect(StatusEffectType.KnockedOut);
    const playerDoomed = player.statusEffects.hasEffect(StatusEffectType.Doomed);
    const playerDefeated = player.isDefeated();
    const playerAsleep = player.statusEffects.hasEffect(StatusEffectType.Sleep);
    const playerHasFluffyWrap = player.statusEffects.hasEffect(StatusEffectType.FluffyWrap);
    const playerHPPercent = player.hp / player.maxHp;
    
    // 現在のターンを記録
    boss.setCustomVariable('currentBattleTurn', turn);
    
    // プレイヤーが敗北状態の場合の処理
    if (playerDefeated) {
        // 敗北後のターン数を追跡
        let turnsSinceEaten = boss.getCustomVariable<number>('turnsSinceEaten', 0);
        turnsSinceEaten++;
        boss.setCustomVariable('turnsSinceEaten', turnsSinceEaten);
        
        const stomachPhase = boss.getCustomVariable<string>('stomachPhase', 'first');
        
        // 第一胃袋フェーズ（眠り誘導）
        if (stomachPhase === 'first') {
            // 5ターン経過かつプレイヤーが眠っている場合、第二胃袋に移送
            if (turnsSinceEaten >= 5 && playerAsleep) {
                const transferAction = fluffyDragonActions.find(action => 
                    action.id === 'transfer-to-second-stomach'
                );
                if (transferAction && transferAction.canUse && transferAction.canUse(boss, player, turn)) {
                    return transferAction;
                }
            }
            
            // 第一胃袋での眠り誘導行動
            const firstStomachActions = fluffyDragonActions.filter(action => 
                action.playerStateCondition === 'defeated' && 
                action.canUse && action.canUse(boss, player, turn) &&
                action.id !== 'transfer-to-second-stomach'
            );
            
            if (firstStomachActions.length > 0) {
                const totalWeight = firstStomachActions.reduce((sum, action) => sum + action.weight, 0);
                let randomValue = Math.random() * totalWeight;
                
                for (const action of firstStomachActions) {
                    randomValue -= action.weight;
                    if (randomValue <= 0) {
                        return action;
                    }
                }
            }
        }
        
        // 第二胃袋フェーズ（エネルギー吸収）
        if (stomachPhase === 'second') {
            const secondStomachActions = fluffyDragonActions.filter(action => 
                action.playerStateCondition === 'defeated' && 
                action.canUse && action.canUse(boss, player, turn)
            );
            
            if (secondStomachActions.length > 0) {
                const totalWeight = secondStomachActions.reduce((sum, action) => sum + action.weight, 0);
                let randomValue = Math.random() * totalWeight;
                
                for (const action of secondStomachActions) {
                    randomValue -= action.weight;
                    if (randomValue <= 0) {
                        return action;
                    }
                }
            }
        }
        
        // フォールバック
        return fluffyDragonActions.find(action => action.id === 'energy-absorption') || fluffyDragonActions[0];
    }
    
    // プレイヤーが再起不能状態であれば、とどめ攻撃
    if (playerDoomed) {
        const finishingAction = fluffyDragonActions.find(action =>
            action.id === 'eternal-sleep-induction'
        );
        if (finishingAction && finishingAction.canUse && finishingAction.canUse(boss, player, turn)) {
            return finishingAction;
        }
    }
    
    // プレイヤーがKO状態で拘束中なら第一胃袋に移送
    if (playerKO && playerRestrained) {
        // 初期化（まだ設定されていない場合）
        if (!boss.getCustomVariable<string>('stomachPhase')) {
            boss.setCustomVariable('stomachPhase', 'first');
            boss.setCustomVariable('turnsSinceEaten', 0);
        }
        
        const action = fluffyDragonActions.find(action => 
            action.id === 'first-stomach-transfer'
        );
        if (action) return action;
    }
    
    // 拘束中の場合の行動選択
    if (playerRestrained) {
        // プレイヤーのHPが低い場合は眠りのブレスを重視
        if (playerHPPercent <= 0.4 && !playerAsleep) {
            const sleepAction = fluffyDragonActions.find(action => 
                action.id === 'sleep-breath'
            );
            if (sleepAction) return sleepAction;
        }
        
        // ふかふか強化包みがまだ付与されていない場合は優先
        if (!playerHasFluffyWrap) {
            const enhanceAction = fluffyDragonActions.find(action => 
                action.id === 'fluffy-wrap-enhance'
            );
            if (enhanceAction) return enhanceAction;
        }
        
        // 拘束中の行動をランダム選択
        const restrainedActions = fluffyDragonActions.filter(action => 
            action.playerStateCondition === 'restrained'
        );
        
        const totalWeight = restrainedActions.reduce((sum, action) => sum + action.weight, 0);
        let randomValue = Math.random() * totalWeight;
        
        for (const action of restrainedActions) {
            randomValue -= action.weight;
            if (randomValue <= 0) {
                return action;
            }
        }
    }
    
    // 通常状態での行動選択
    const normalActions = fluffyDragonActions.filter(action => 
        action.playerStateCondition === 'normal'
    );
    
    // ボスのHPが低い場合は拘束攻撃の重みを上げる
    const modifiedActions = [...normalActions];
    if (boss.hp / boss.maxHp <= 0.5) {
        const restraintAction = normalActions.find(action =>
            action.id === 'fluffy-restraint'
        );
        if (restraintAction) {
            modifiedActions.push(restraintAction);
        }
    }
    
    // ラベンダーの香りが付与されていない場合、ラベンダーブレスの重みを上げる
    if (!player.statusEffects.hasEffect(StatusEffectType.LavendasCent)) {
        const lavenderAction = normalActions.find(action => 
            action.id === 'lavender-breath'
        );
        if (lavenderAction) {
            modifiedActions.push(lavenderAction);
        }
    }
    
    // weightに基づくランダム選択
    const totalWeight = modifiedActions.reduce((sum, action) => sum + action.weight, 0);
    let randomValue = Math.random() * totalWeight;
    
    for (const action of modifiedActions) {
        randomValue -= action.weight;
        if (randomValue <= 0) {
            return action;
        }
    }
    
    // フォールバック
    return normalActions[0] || fluffyDragonActions[0];
};

export const fluffyDragonData: BossData = {
    id: 'fluffy-dragon',
    name: 'FluffyDragon',
    icon: '🐉',
    displayName: 'ふかふかドラゴン',
    description: '寒冷地地方に住む真っ白でふかふかなドラゴン',
    questNote: 'あなたは寒冷地の探検中、雪深い洞窟の奥で不思議な温もりを感じた。そこには真っ白でふかふかな体毛に覆われたドラゴンがいた。甘いラベンダーの香りが漂う中、ドラゴンはあなたを見つめている...',
    personality: [
        'ふふ...温かい獲物が来てくれたのね',
        'ここは寒いでしょう？私が温めてあげる',
        'そんなに緊張しなくても大丈夫...とても心地よいから'
    ],
    maxHp: 420,
    attackPower: 24,
    actions: fluffyDragonActions,
    aiStrategy: fluffyDragonAIStrategy,
    suppressAutoFinishingMove: true, // カスタムとどめ攻撃を使用
    
    // エクスプローラーレベル7で解禁（氷河・雪山地域）
    explorerLevelRequired: 7,
    
    victoryTrophy: {
        name: 'ふかふかドラゴンの綿毛',
        description: 'ふかふかドラゴンの美しい白い綿毛。触れると心地よい温もりと安らぎを感じられる。'
    },
    defeatTrophy: {
        name: 'ふかふかドラゴンの体液',
        description: 'ふかふかドラゴンの体内から採取した甘い香りのする特殊な体液。ラベンダーの香りが漂い、安眠効果があるという。'
    },
    
    // カスタム変数の初期化
    customVariables: {
        stomachPhase: 'first',  // 'first' or 'second'
        turnsSinceEaten: 0,     // 食べられてからのターン数
        dreamShareStarted: false // 夢の共有が開始されているか
    }
};

// getDialogue メソッドの実装
fluffyDragonData.getDialogue = function(situation: 'battle-start' | 'player-restrained' | 'player-eaten' | 'player-escapes' | 'low-hp' | 'victory') {
    const dialogues: Record<string, string[]> = {
        'battle-start': [
            'あら、こんな寒い場所まで...可愛い獲物ね',
            'ふふ、震えているの？すぐに温めてあげる',
            'ラベンダーの香りでリラックスしましょう？'
        ],
        'player-restrained': [
            'ほら、ふかふかで気持ちいいでしょう？',
            'もう抵抗しなくていいのよ...',
            'このまま眠ってしまえば楽になれるわ'
        ],
        'player-eaten': [
            'ふかふかな胃袋はどう？心地よいでしょう？',
            'ゆっくり眠りなさい...私が子守唄を歌ってあげる',
            'これからは私の中で安らかに過ごしましょう'
        ],
        'player-escapes': [
            'あら、もう行ってしまうの？',
            '寒くなったらまた来なさい...',
            'いつでも温めてあげるから'
        ],
        'low-hp': [
            '少し本気を出させてもらうわね...',
            'もう逃がさない...永遠に私の中で眠りなさい',
            'ふかふかの温もりから逃れることはできないのよ'
        ],
        'victory': [
            'いい戦いだったわ...満足よ',
            'また寒くなったら来なさい'
        ]
    };
    
    const options = dialogues[situation] || dialogues['battle-start'];
    return options[Math.floor(Math.random() * options.length)];
};