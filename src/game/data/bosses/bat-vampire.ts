import { Player } from '@/game/entities/Player';
import { BossData, ActionType, BossAction, Boss } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffectTypes';

const batVampireActions: BossAction[] = [
    // 通常攻撃パターン
    {
        id: 'claw-scratch',
        type: ActionType.Attack,
        name: '爪で引っ掻く',
        description: '鋭い爪で引っ掻き攻撃',
        damageFormula: (user: Boss) => user.attackPower * 0.9,
        hitRate: 0.90,
        weight: 20,
        playerStateCondition: 'normal'
    },
    {
        id: 'tail-strike',
        type: ActionType.Attack,
        name: '尻尾で叩く',
        description: 'コウモリの尻尾で叩きつける',
        damageFormula: (user: Boss) => user.attackPower * 0.8,
        hitRate: 0.95,
        weight: 20,
        playerStateCondition: 'normal'
    },
    {
        id: 'bat-swarm',
        type: ActionType.Attack,
        name: '子コウモリ放出',
        description: '複数のコウモリを放出して攻撃',
        damageFormula: (user: Boss) => user.attackPower * 1.1,
        hitRate: 0.85,
        weight: 15,
        playerStateCondition: 'normal',
        messages: ['<USER>は無数の子コウモリを放った！']
    },
    {
        id: 'shadow-bullet',
        type: ActionType.StatusAttack,
        name: 'シャドウバレット',
        description: '影の弾を放出、命中率は低いが暗闇状態にする',
        damageFormula: (user: Boss) => user.attackPower * 0.6,
        statusEffect: StatusEffectType.Darkness,
        statusChance: 0.70,
        hitRate: 0.60,
        weight: 15,
        playerStateCondition: 'normal',
        messages: ['<USER>は影の弾を放った！']
    },
    {
        id: 'vampire-hold',
        type: ActionType.RestraintAttack,
        name: 'ヴァンパイアホールド',
        description: '強力な握力で対象を拘束する',
        weight: 10,
        playerStateCondition: 'normal',
        messages: ['<USER>は<TARGET>を掴み上げる！']
    },

    // 拘束中専用攻撃
    {
        id: 'life-drain',
        type: ActionType.StatusAttack,
        name: '生気吸収',
        description: '捕まえた獲物の体力と魔力を吸収する',
        damageFormula: (user: Boss) => user.attackPower * 1.5,
        statusEffect: StatusEffectType.Weakness,
        statusChance: 0.60,
        weight: 30,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>に噛みつき、生気を吸い取る！', '<TARGET>の力と魔力が奪われていく...']
    },
    {
        id: 'vampire-kiss',
        type: ActionType.StatusAttack,
        name: 'コウモリのキス',
        description: '捕まえた獲物に深いキスをして生気を吸い取りながら魅了する',
        damageFormula: (user: Boss) => user.attackPower * 0.8,
        statusEffect: StatusEffectType.Charm,
        statusChance: 0.90,
        weight: 25,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>に深いキスをした...']
    },
    {
        id: 'minion-hypnosis',
        type: ActionType.StatusAttack,
        name: '眷属の催眠術',
        description: '拘束状態が連続5ターン続いた獲物に強力な催眠術をかける',
        statusEffect: StatusEffectType.Hypnosis,
        statusDuration: 2,
        statusChance: 0.90,
        weight: 35,
        playerStateCondition: 'restrained',
        canUse: (boss: Boss, _player: Player, _turn: number) => {
            // 連続拘束ターン数とクールダウンの確認
            const consecutiveRestraintTurns = boss.getCustomVariable<number>('consecutiveRestraintTurns', 0);
            const lastHypnosisUsed = boss.getCustomVariable<number>('lastHypnosisUsed', -20);
            const currentTurn = boss.getCustomVariable<number>('currentBattleTurn', _turn);
            
            // 連続5ターン拘束 & 20ターンクールダウン経過
            return consecutiveRestraintTurns >= 5 && (currentTurn - lastHypnosisUsed) >= 20;
        },
        onUse: (boss: Boss, _player: Player, turn: number) => {
            // 使用ターンを記録してクールダウン開始
            boss.setCustomVariable('lastHypnosisUsed', turn);
            // 連続拘束ターンをリセット
            boss.setCustomVariable('consecutiveRestraintTurns', 0);
            return [];
        },
        messages: [
            '<USER>の瞳が妖艶に光り始める...',
            '「我が眷属となり、永遠の眠りにつきなさい...」',
            '<TARGET>は<USER>の催眠術にかかり、深い眠りに落ちた！'
        ]
    },

    // 拘束中＋プレイヤーダウン時の特殊攻撃
    {
        id: 'life-drain-enhanced',
        type: ActionType.DevourAttack,
        name: '生気吸収（強化版）',
        description: '捕まえた獲物の生命力そのものを吸収する',
        damageFormula: (user: Boss) => user.attackPower * 1.5,
        weight: 50,
        playerStateCondition: 'ko',
        messages: ['<USER>は<TARGET>に噛みつき、生命力そのものを吸い取る...', `生命力を吸われた<TARGET>の体が縮小していく！`]
    },

    // とどめ攻撃（プレイヤーがDoomed状態時）
    {
        id: 'finishing-devour',
        type: ActionType.FinishingMove,
        name: '小さくなった獲物の丸呑み',
        description: '生気を吸い尽くされ小さくなった獲物を丸呑みにする',
        weight: 100,
        playerStateCondition: 'defeated',
        messages: [
            '<TARGET>の生気は完全に吸い尽くされ、体が小さくなってしまった...',
            '<USER>は小さくなった<TARGET>を優しく抱き上げると、そのまま口の中に運んでいく...',
            '「ふふ...君のような美しい獲物は、永遠に私の体内で愛でてあげよう」',
            '<TARGET>は<USER>の体内でペットのように飼われることになった...'
        ],
        onUse: (_boss: Boss, player: Player) => {
            // 再起不能状態を解除 (TODO: Dead 状態付与時に自動解除したい)
            player.statusEffects.removeEffect(StatusEffectType.Doomed);
            // プレイヤーを敗北状態にする
            player.statusEffects.addEffect(StatusEffectType.Dead);
            // 食べられ状態にする (フレーバー)
            player.statusEffects.addEffect(StatusEffectType.Eaten);
            
            // メッセージは設定されているのでここでは何もしない
            return [];
        }
    },

    // 体内での行動（敗北後の継続行動）
    {
        id: 'stomach-absorption',
        type: ActionType.PostDefeatedAttack,
        name: '胃袋の吸収器官',
        description: '胃袋の様々な器官で、体内のペットの生気を吸い続ける',
        weight: 25,
        playerStateCondition: 'defeated',
        messages: [
            '<USER>の胃袋にある吸収器官が<TARGET>をやさしく包み込む',
            '<TARGET>の生気がゆっくりと吸い取られていく...'
        ]
    },
    {
        id: 'stomach-tentacles',
        type: ActionType.PostDefeatedAttack,
        name: '体内触手の愛撫',
        description: '体内の触手がペットを愛撫して生気を吸収する',
        weight: 20,
        playerStateCondition: 'defeated',
        statusEffect: StatusEffectType.Charm,
        statusChance: 0.8,
        messages: [
            '<USER>の体内で柔らかい触手が<TARGET>を優しく愛撫する',
            '<TARGET>は心地よい感覚に包まれながら生気を奪われていく...'
        ]
    },
    {
        id: 'stomach-massage',
        type: ActionType.PostDefeatedAttack,
        name: '胃袋マッサージ',
        description: '胃壁で優しくマッサージして体内のペットを魅了する',
        weight: 20,
        playerStateCondition: 'defeated',
        statusEffect: StatusEffectType.Fascination,
        statusChance: 0.9,
        messages: [
            '<USER>の胃袋が<TARGET>を包み込むようにマッサージする',
            '<TARGET>は至福の感覚に魅了されてしまう...'
        ]
    },
    {
        id: 'stomach-tickling',
        type: ActionType.PostDefeatedAttack,
        name: '体内くすぐり',
        description: '体内の細かい器官でペットをくすぐって楽しませる',
        weight: 15,
        playerStateCondition: 'defeated',
        statusEffect: StatusEffectType.Bliss,
        statusChance: 0.7,
        messages: [
            '<USER>の体内で無数の細かい器官が<TARGET>をくすぐり始める',
            '<TARGET>は笑いと快感で意識が朦朧としてくる...'
        ]
    },
    {
        id: 'meal-time',
        type: ActionType.PostDefeatedAttack,
        name: '食事の時間',
        description: 'コウモリヴァンパイアが自身の胃袋（獲物とは別の）にパンを入れて消化する',
        weight: 10,
        playerStateCondition: 'defeated',
        messages: [
            '「さあ、私も食事をしようか...」',
            '<USER>は大きなパンをかじっては飲み込み、もう一つの胃袋に送り込む！',
            '<TARGET>が収められた胃袋の外側から、くぐもった蠕動の音と、食べ物が消化されていく轟音が響き渡る...',
            '<TARGET>は別の胃袋に入れられた食べ物の末路を想像し不安になる...'
        ]
    },
    {
        id: 'feeding-time',
        type: ActionType.PostDefeatedAttack,
        name: '給餌の時間',
        description: '消化されて液状になった食べ物を体内器官を通じてペットに給餌する',
        weight: 10,
        playerStateCondition: 'defeated',
        messages: [
            '「君にも栄養を分けてあげよう...」',
            '<USER>の体内で管のような器官が<TARGET>の口元に伸びてくる！',
            '<TARGET>は管のような器官を口に入れられ、どろどろになった食べ物を飲まされ続ける...',
            '「よい子だ...これで君はずっと私の大切な宝物でいられる」'
        ]
    }
];

// AI戦略: 拘束→魅了→最大HP吸収の段階的戦術
const batVampireAIStrategy = (boss: Boss, player: Player, turn: number): BossAction => {
    const playerRestrained = player.statusEffects.hasEffect(StatusEffectType.Restrained);
    const playerCharmed = player.statusEffects.hasEffect(StatusEffectType.Charm);
    const playerKO = player.statusEffects.hasEffect(StatusEffectType.KnockedOut);
    const playerHasDarkness = player.statusEffects.hasEffect(StatusEffectType.Darkness);
    const playerHPPercent = player.hp / player.maxHp;
    const playerDoomed = player.statusEffects.hasEffect(StatusEffectType.Doomed);
    const playerDefeated = player.isDefeated();
    
    // 現在のターンを記録
    boss.setCustomVariable('currentBattleTurn', turn);
    
    // 拘束状態の連続ターン数を追跡
    if (playerRestrained) {
        const consecutiveRestraintTurns = boss.getCustomVariable<number>('consecutiveRestraintTurns', 0);
        boss.setCustomVariable('consecutiveRestraintTurns', consecutiveRestraintTurns + 1);
    } else {
        // 拘束が解けたらリセット
        boss.setCustomVariable('consecutiveRestraintTurns', 0);
    }
    
    // プレイヤーが敗北状態の場合の処理
    if (playerDefeated) {
        // 敗北後のターン数をカスタム変数から取得
        let postDefeatedTurn = boss.getCustomVariable<number>('postDefeatedTurn', 0);
        
        // ターンカウンターが 0 の場合、カスタム変数の初期化
        if (postDefeatedTurn === 0) {
            postDefeatedTurn = 1; // 初回は1ターン目として扱う
            boss.setCustomVariable('postDefeatedTurn', 1);
            boss.setCustomVariable('lastFeedingTurn', 0);
        }
        else
        {
            // ターンカウンターをインクリメント
            postDefeatedTurn++;
            boss.setCustomVariable('postDefeatedTurn', postDefeatedTurn);
        }
        
        const lastFeedingTurn = boss.getCustomVariable<number>('lastFeedingTurn', 0);
        
        // 給餌システムの判定（15-20ターンごとに2ターンシーケンス）
        const turnsSinceFeeding = postDefeatedTurn - lastFeedingTurn;
        const feedingState = boss.getCustomVariable<string>('feedingState', 'none');
        
        // 給餌シーケンスの開始判定
        if (feedingState === 'none' && turnsSinceFeeding >= 15 && Math.random() < 0.3) {
            // 食事の時間を開始
            boss.setCustomVariable('feedingState', 'meal');
            const mealAction = batVampireActions.find(action => 
                action.id === 'meal-time'
            );
            if (mealAction) return mealAction;
        }
        
        // 給餌シーケンスの続行判定
        if (feedingState === 'meal') {
            // 食事の時間の次ターンは給餌の時間
            boss.setCustomVariable('feedingState', 'feeding');
            const feedingAction = batVampireActions.find(action => 
                action.id === 'feeding-time'
            );
            if (feedingAction) return feedingAction;
        }
        
        if (feedingState === 'feeding') {
            // 給餌シーケンス完了、次の給餌まで待機
            boss.setCustomVariable('feedingState', 'none');
            boss.setCustomVariable('lastFeedingTurn', postDefeatedTurn);
        }
        
        // 通常の体内行動（weightベースのランダム選択）
        const postDefeatedActions = batVampireActions.filter(action => 
            action.playerStateCondition === 'defeated' && action.id !== 'finishing-devour' && action.id !== 'feeding-time' && action.id !== 'meal-time'
        );
        
        if (postDefeatedActions.length > 0) {
            const totalWeight = postDefeatedActions.reduce((sum, action) => sum + action.weight, 0);
            let randomValue = Math.random() * totalWeight;
            
            for (const action of postDefeatedActions) {
                randomValue -= action.weight;
                if (randomValue <= 0) {
                    return action;
                }
            }
        }
        
        // フォールバック
        return batVampireActions.find(action => action.id === 'stomach-absorption') || batVampireActions[0];
    }
    
    // プレイヤーが再起不能状態であれば、特別な行動を優先
    if (playerDoomed) {
        // とどめ攻撃（丸呑み）
        const finishingAction = batVampireActions.find(action =>
            action.id === 'finishing-devour'
        );
        if (finishingAction) return finishingAction;
    }
    
    // プレイヤーがKO状態で拘束中なら最大HP吸収を最優先
    if (playerKO && playerRestrained) {
        const action = batVampireActions.find(action => 
            action.id === 'life-drain-enhanced'
        );
        if (action) return action;
    }
    
    // 拘束中の場合は生気吸収と魅了を優先
    if (playerRestrained) {
        // プレイヤーのHPが低い場合は生気吸収を重視
        if (playerHPPercent <= 0.3) {
            const drainAction = batVampireActions.find(action => 
                action.id === 'life-drain'
            );
            if (drainAction) return drainAction;
        }
        
        // 魅了されていなければコウモリのキスを優先
        if (!playerCharmed) {
            const charmAction = batVampireActions.find(action => 
                action.id === 'vampire-kiss'
            );
            if (charmAction) return charmAction;
        }
        
        // デフォルトで生気吸収
        const drainAction = batVampireActions.find(action => 
            action.id === 'life-drain'
        );
        if (drainAction) return drainAction;
    }
    
    // 通常状態での行動選択 - weightによるランダム選択
    const normalActions = batVampireActions.filter(action => 
        action.playerStateCondition === 'normal'
    );
    
    // HPが低い場合は拘束攻撃の重みを上げる
    let modifiedActions = [...normalActions];
    if (boss.hp / boss.maxHp <= 0.4) {
        const restraintAction = normalActions.find(action =>
            action.id === 'vampire-hold'
        );
        if (restraintAction) {
            modifiedActions.push(restraintAction);
        }
    }
    
    // 戦闘初期で暗闇がかかっていない場合、シャドウバレットの重みを上げる
    if (turn <= 2 && !playerHasDarkness) {
        const darknessAction = normalActions.find(action => 
            action.id === 'shadow-bullet'
        );
        if (darknessAction) {
            modifiedActions.push(darknessAction);
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
    return normalActions[0] || batVampireActions[0];
};

export const batVampireData: BossData = {
    id: 'bat-vampire',
    name: 'BatVampire',
    icon: '🦇',
    displayName: '蝙蝠のヴァンパイア',
    description: `古城に住む蝙蝠の獣人`,
    questNote: 'あなたの元に奇妙な招待状が届いた。そこには「君の成果を称える宴に招待する」とだけ書かれたメッセージと、古城の地図が添えられていた。あなたはその城へ向かうことにした...',
    personality: [
        'ようこそ、我が城へ...君のような美しい獲物は久々だ'
    ],
    maxHp: 310,
    attackPower: 14,
    actions: batVampireActions,
    aiStrategy: batVampireAIStrategy,
    suppressAutoFinishingMove: true, // カスタムとどめ攻撃を使用
    
    // エクスプローラーレベル6で解禁
    explorerLevelRequired: 6
};

// TODO: どっかで使いたいのでメモ: '古城に住む紳士的なコウモリの獣人。表向きは優雅だが、内心は獲物を眷属へと陥れることに執着している。彼の城に招待され、城に足を踏み入れた者は、彼の魅力に抗えず、気が済むまでペットとして飼われることになるという。'