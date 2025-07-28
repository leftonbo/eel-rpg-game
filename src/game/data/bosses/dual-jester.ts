import { BossData, ActionType, BossAction, Boss } from '../../entities/Boss';
import { Player } from '../../entities/Player';
import { StatusEffectType } from '../../systems/StatusEffectTypes';

// 第1フェーズ: 表の顔（偽装フェーズ）- 可愛い演技と手加減
const dualJesterPhase1Actions: BossAction[] = [
    {
        id: 'playful-pat',
        type: ActionType.Attack,
        name: '遊びのぽんぽん',
        description: '可愛く手をぽんぽんと叩く',
        messages: [
            '「一緒に遊ぼうよ〜♪」',
            '<USER>は<TARGET>を可愛く軽くぽんぽんと叩く！',
            'とても軽いタッチで、まるで遊んでいるようだ'
        ],
        damageFormula: (user: Boss) => Math.max(1, user.attackPower * 0.15), // 非常に軽いダメージ
        hitRate: 0.98,
        weight: 20,
        playerStateCondition: 'normal'
    },
    {
        id: 'playful-bind',
        type: ActionType.RestraintAttack,
        name: 'お遊び拘束',
        description: '遊びのつもりで軽く拘束する',
        messages: [
            '「はーい、おいかけっこの時間だよ〜♪」',
            '<USER>は<TARGET>を遊びのつもりで軽く捕まえる！',
            '<TARGET>は拘束されたが、なんとなく脱出しやすそうだ...'
        ],
        statusEffect: StatusEffectType.FalseSecurity,
        statusChance: 0.60,
        weight: 18,
        canUse: (_boss, player, _turn) => {
            return !player.isRestrained() && !player.isEaten() && Math.random() < 0.40;
        }
    },
    {
        id: 'tickle-attack',
        type: ActionType.StatusAttack,
        name: 'くすぐり攻撃',
        description: 'くすぐって笑わせようとする',
        messages: [
            '「くすぐっちゃうぞ〜♪」',
            '<USER>は<TARGET>をくすぐって笑わせようとする！',
            '<TARGET>は笑いそうになった...'
        ],
        damageFormula: (user: Boss) => Math.max(1, user.attackPower * 0.20),
        statusEffect: StatusEffectType.Charm,
        statusChance: 0.50,
        weight: 22,
        playerStateCondition: 'normal'
    },
    {
        id: 'pretend-swallow',
        type: ActionType.Attack,
        name: '捕食ごっこ',
        description: '食べる真似をするが実際は食べない',
        messages: [
            '「食べちゃうぞ〜♪ でも冗談だよ〜」',
            '<USER>は<TARGET>を口に入れるような素振りを見せる！',
            'でも実際は演技のようで、本気ではないようだ...'
        ],
        hitRate: 0.0,
        weight: 15,
        canUse: (_boss, player, _turn) => {
            return player.isRestrained() && Math.random() < 0.25;
        }
    },
    {
        id: 'hand-holding-shock',
        type: ActionType.Attack,
        name: 'お手々つなぎ',
        description: '手を繋ぐ振りで軽い電撃攻撃',
        messages: [
            '「お手々つなごうよ〜♪」',
            '<USER>は<TARGET>の手を取って可愛く手を繋ごうとする！',
            'しかし手から軽い電撃がビリッと流れた！',
            '「あれ？静電気かな〜？ えへへ♪」'
        ],
        damageFormula: (user: Boss) => Math.max(2, user.attackPower * 0.25),
        statusEffect: StatusEffectType.Paralysis,
        statusChance: 0.25,
        hitRate: 0.95,
        weight: 20,
        playerStateCondition: 'normal'
    },
    {
        id: 'spinning-play',
        type: ActionType.StatusAttack,
        name: '回転あそび',
        description: 'くるくる回って相手を混乱させる',
        messages: [
            '「くるくる〜♪ 一緒に回ろうよ〜♪」',
            '<USER>が高速でくるくる回転しながら<TARGET>の周りを飛び回る！',
            '目が回るような動きに<TARGET>は混乱してしまった...',
            '「どっちが前でどっちが後ろかな〜♪」'
        ],
        damageFormula: (user: Boss) => Math.max(1, user.attackPower * 0.20),
        statusEffect: StatusEffectType.Confusion,
        statusChance: 0.60,
        hitRate: 0.90,
        weight: 24,
        playerStateCondition: 'normal'
    },
    {
        id: 'hide-and-seek-attack',
        type: ActionType.Attack,
        name: 'かくれんぼ攻撃',
        description: '瞬間移動して不意打ち攻撃',
        messages: [
            '「かくれんぼしよう〜♪」',
            '<USER>がぱっと姿を消した！',
            '「もーいいかい？」',
            '後ろから現れた<USER>が<TARGET>を軽くぽんと叩く！'
        ],
        damageFormula: (user: Boss) => Math.max(3, user.attackPower * 0.30),
        hitRate: 0.85,
        weight: 20,
        playerStateCondition: 'normal'
    }
];

// 第2フェーズ: 裏の顔（本気フェーズ）- HP50%以下で豹変
const dualJesterPhase2Actions: BossAction[] = [
    {
        id: 'madness-gaze',
        type: ActionType.StatusAttack,
        name: '狂気の瞳光',
        description: '不気味な瞳で威嚇攻撃',
        messages: [
            '「...フフフ、怖がってるね」（瞳が狂気に光る）',
            '<USER>の瞳が異様な光を放ち、<TARGET>を見据える！',
            '<TARGET>は恐怖で体が震えてしまった...',
            '「その表情...とても美しいよ」'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.2,
        statusEffect: StatusEffectType.Fear,
        statusChance: 0.65,
        hitRate: 0.90,
        weight: 25,
        playerStateCondition: 'normal'
    },
    {
        id: 'nightmare-whisper',
        type: ActionType.StatusAttack,
        name: '悪夢の囁き',
        description: '心理攻撃で恐怖を植え付ける',
        messages: [
            '「聞こえるかい？君の心の奥の悲鳴が...」',
            '<USER>が<TARGET>の耳元で何か囁いている...',
            '<TARGET>は得体の知れない恐怖に包まれた！',
            '「これはまだ始まりに過ぎない...」'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.8,
        statusEffect: StatusEffectType.Bipolar,
        statusChance: 0.55,
        hitRate: 0.95,
        weight: 27,
        playerStateCondition: 'normal'
    },
    {
        id: 'dual-personality-rush',
        type: ActionType.Attack,
        name: '二重人格突進',
        description: '表裏が入れ替わりながらの体当たり',
        messages: [
            '「一緒に遊ぼう♪」',
            '「死ね」',
            '「楽しいね〜♪」',
            '「苦しめ」',
            '<USER>が表情を高速で切り替えながら突進してくる！',
            '<TARGET>は人格の急変に混乱しながら攻撃を受けた！',
            '「どっちが本当？...両方とも本当さ」'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.5,
        statusEffect: StatusEffectType.Confusion,
        statusChance: 0.50,
        hitRate: 0.85,
        weight: 23,
        playerStateCondition: 'normal'
    },
    {
        id: 'toy-box-explosion',
        type: ActionType.Attack,
        name: '玩具箱爆発',
        description: '周囲の玩具を操って攻撃',
        messages: [
            '「僕の大切な玩具たちよ...遊んでおやり」',
            '<USER>が手を振ると周囲の壊れた玩具が一斉に浮き上がる！',
            '玩具たちが<TARGET>に向かって飛んできた！',
            '「みんな君と遊びたがってるよ...永遠にね」'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.4,
        hitRate: 0.80,
        weight: 22,
        playerStateCondition: 'normal'
    },
    {
        id: 'true-restraint',
        type: ActionType.RestraintAttack,
        name: '真の拘束',
        description: '本気の拘束技を繰り出す',
        messages: [
            '「...さっきは手加減していただけだ」（声が低く変化）',
            '<USER>の顔が反転し、色調が暗く変化する！',
            '<TARGET>が強力な拘束に捕らわれた！'
        ],
        statusEffect: StatusEffectType.Manic,
        statusChance: 0.70,
        weight: 30,
        canUse: (_boss, player, _turn) => {
            return !player.isRestrained() && !player.isEaten();
        }
    },
    {
        id: 'manic-squeeze',
        type: ActionType.Attack,
        name: '狂気締め付け',
        description: '狂気の笑いと共に強く締め付ける',
        messages: [
            '「もっと...もっと一緒にいよう...♪」（狂気の笑い）',
            '<USER>は<TARGET>を狂気的な力で締め付ける！',
            '<TARGET>は強力な圧迫感に苦しんだ！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.8,
        statusEffect: StatusEffectType.Bipolar,
        statusChance: 0.60,
        weight: 30,
        playerStateCondition: 'restrained'
    },
    {
        id: 'dual-personality-lick',
        type: ActionType.StatusAttack,
        name: '二重人格なめまわし',
        description: '表裏の人格が交互に現れる攻撃',
        messages: [
            '「大丈夫、痛くないよ〜」',
            '「痛がってる顔、とても美しいね」',
            '<USER>の人格が急激に変化しながら<TARGET>を舐め回す！',
            '<TARGET>は混乱と恐怖に包まれた！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.5,
        statusEffect: StatusEffectType.Confusion,
        statusChance: 0.80,
        weight: 25,
        playerStateCondition: 'restrained'
    },
    {
        id: 'true-devour',
        type: ActionType.EatAttack,
        name: '真の捕食',
        description: '今度は本当に食べてしまう',
        messages: [
            '「今度は本当に食べてあげる...永遠に一緒にいられるよ」',
            '<USER>の狂気の笑みが<TARGET>を恐怖に陥れる！',
            '<TARGET>は真の恐怖の中で飲み込まれていく！'
        ],
        weight: 25,
        canUse: (_boss, player, _turn) => {
            return player.isRestrained() && player.getHpPercentage() < 30;
        }
    }
];

// 第3フェーズ: 体内環境（狂気の遊び場）
const dualJesterDevourActions: BossAction[] = [
    {
        id: 'madness-playground',
        type: ActionType.DevourAttack,
        name: '狂気の遊び場',
        description: '体内の歪んだ空間でプレイヤーを翻弄する',
        messages: [
            '「ずっと一緒にいようね♪」',
            '「君はとても美味しいよ...もう離さない」',
            '<TARGET>は二重人格の狂気に翻弄され続ける！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.8,
        statusEffect: StatusEffectType.Bipolar,
        statusChance: 0.70,
        weight: 35,
        playerStateCondition: 'eaten'
    },
    {
        id: 'dual-digestion',
        type: ActionType.DevourAttack,
        name: '二重消化',
        description: '表裏の人格が同時に消化を進める',
        messages: [
            '「一緒に遊ぼうよ〜♪」',
            '「永遠に我が物にしてやる...」',
            '<USER>の二つの人格が同時に<TARGET>を消化しようとする！',
            '<TARGET>の最大HPが二重の力で削られていく...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 2.0,
        weight: 30,
        playerStateCondition: 'eaten'
    },
    {
        id: 'nightmare-embrace',
        type: ActionType.DevourAttack,
        name: '悪夢の抱擁',
        description: '甘い夢と恐ろしい悪夢を同時に見せる',
        messages: [
            '「楽しい夢を見せてあげる♪」',
            '「...それとも悪夢がお好み？」',
            '<USER>は<TARGET>に甘美な夢と恐ろしい悪夢を同時に体験させる！',
            '<TARGET>は現実と幻想の境界を見失った！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.8,
        statusEffect: StatusEffectType.FalseSecurity,
        statusChance: 0.60,
        weight: 25,
        playerStateCondition: 'eaten'
    }
];

// 第4フェーズ: 敗北後の永続支配
const dualJesterEternalActions: BossAction[] = [
    {
        id: 'eternal-playmate',
        type: ActionType.PostDefeatedAttack,
        name: '永遠の遊び相手',
        description: '永遠に遊び続ける相手として保管する',
        messages: [
            '「今日から君は僕だけのもの」',
            '<USER>は<TARGET>を永遠の遊び相手として体内に留める！',
            '目覚めることはないが、それも愛の形だと囁かれる...'
        ],
        weight: 35,
        playerStateCondition: 'defeated'
    },
    {
        id: 'perfect-toy',
        type: ActionType.PostDefeatedAttack,
        name: '完璧な玩具',
        description: '理想的な玩具として永続的に保管する',
        messages: [
            '「君はとても良い玩具だった...永遠に大切にしよう」',
            '<USER>は<TARGET>を最高の玩具として認定し、大切に保管する！',
            '心配しないで、とても楽しい夢を見せてあげると約束される...'
        ],
        statusEffect: StatusEffectType.Bipolar,
        statusChance: 0.80,
        weight: 30,
        playerStateCondition: 'defeated'
    },
    {
        id: 'endless-game',
        type: ActionType.PostDefeatedAttack,
        name: '終わらない遊び',
        description: '永続的な遊びのサイクルを開始する',
        messages: [
            '「遊びは終わらないよ...ずっと、ずっと♪」',
            '<USER>は<TARGET>を永続的な遊びのサイクルに組み込む！',
            '<TARGET>は表裏の人格に代わる代わる遊ばれ続ける...'
        ],
        weight: 25,
        playerStateCondition: 'defeated'
    }
];

// AI戦略: 二面性とフェーズ管理
const dualJesterAIStrategy = (boss: Boss, player: Player, turn: number): BossAction => {
    const bossHpPercentage = boss.getHpPercentage();
    
    // フェーズ判定: HP50%以下で第2フェーズ（裏の顔）に切り替え
    const isPhase2 = bossHpPercentage <= 50;
    
    // カスタム変数でフェーズ切り替えを管理
    const hasTransformed = boss.getCustomVariable<boolean>('hasTransformed', false);
    if (isPhase2 && !hasTransformed) {
        boss.setCustomVariable('hasTransformed', true);
        // 専用の変身メッセージを追加
        return {
            id: 'phase-transform',
            type: ActionType.Attack,
            name: '本性覚醒',
            description: '双面の道化師の真の姿が露わになる',
            messages: [
                '「...あれ？まだ遊びたいの？」（声が低く変化）',
                'デュアルの顔が反転し、その瞳が狂気に染まった！',
                '可愛らしい道化師の仮面が剥がれ落ち、真の恐怖が姿を現す！',
                '「なら...本気で遊ぼうか」（完全に別人格）'
            ],
            damageFormula: (user: Boss) => user.attackPower * 1.2,
            weight: 1,
            playerStateCondition: 'normal'
        };
    }
    
    boss.setCustomVariable('currentPhase', isPhase2 ? 2 : 1);
    boss.setCustomVariable('currentTurn', turn);
    
    // プレイヤーが敗北状態の場合
    if (player.isDefeated()) {
        let postDefeatedTurn = boss.getCustomVariable<number>('postDefeatedTurn', 0);
        postDefeatedTurn++;
        boss.setCustomVariable('postDefeatedTurn', postDefeatedTurn);
        
        const eternalActions = dualJesterEternalActions;
        const totalWeight = eternalActions.reduce((sum, action) => sum + action.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const action of eternalActions) {
            random -= action.weight;
            if (random <= 0) {
                return action;
            }
        }
        return eternalActions[0];
    }
    
    // プレイヤーが食べられた状態
    if (player.isEaten()) {
        const devourActions = dualJesterDevourActions;
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
    
    // プレイヤーが戦闘不能状態
    if (player.isKnockedOut()) {
        if (player.isRestrained() && isPhase2) {
            // 第2フェーズで拘束+戦闘不能時は90%で捕食
            if (Math.random() < 0.90) {
                return {
                    id: 'final-swallow',
                    type: ActionType.EatAttack,
                    name: '最終捕食',
                    description: '完全に支配下に置くために飲み込む',
                    messages: [
                        '「これで君は永遠に僕のものだ...」',
                        '<USER>は<TARGET>を完全に支配するために飲み込む！',
                        '<TARGET>は狂気の遊び場へと運ばれていく！'
                    ],
                    weight: 1
                };
            }
        }
    }
    
    // フェーズに応じた行動選択
    let availableActions: BossAction[];
    
    if (isPhase2) {
        // 第2フェーズ: 裏の顔（本気モード）
        if (player.isRestrained()) {
            availableActions = dualJesterPhase2Actions.filter(action => 
                action.playerStateCondition === 'restrained' || !action.playerStateCondition
            );
        } else {
            availableActions = dualJesterPhase2Actions.filter(action => 
                action.playerStateCondition === 'normal' || !action.playerStateCondition
            );
        }
    } else {
        // 第1フェーズ: 表の顔（演技モード）
        if (player.isRestrained()) {
            // 第1フェーズでは拘束状態でも軽い攻撃のみ
            availableActions = dualJesterPhase1Actions.filter(action => 
                action.type !== ActionType.RestraintAttack
            );
        } else {
            availableActions = dualJesterPhase1Actions;
        }
    }
    
    // canUse条件でフィルタリング
    availableActions = availableActions.filter(action => {
        if (action.canUse) {
            return action.canUse(boss, player, turn);
        }
        return true;
    });
    
    if (availableActions.length === 0) {
        return isPhase2 ? dualJesterPhase2Actions[0] : dualJesterPhase1Actions[0];
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
};

export const dualJesterData: BossData = {
    id: 'dual-jester',
    name: 'DualJester',
    displayName: '🎭 双面の道化師デュアル',
    description: '二面性を持つ不気味で可愛い道化師',
    questNote: '廃遊園地の奥から、可愛らしい道化師が現れた。子供のような無邪気な笑顔で「一緒に遊ぼうよ〜♪」と誘いかけてくるが、その瞳の奥に何か別の意図が見え隠れしている。時折見せる表情の変化が、この存在の真の危険性を物語っている...',
    maxHp: 280,
    attackPower: 20,
    actions: dualJesterPhase1Actions
        .concat(dualJesterPhase2Actions)
        .concat(dualJesterDevourActions)
        .concat(dualJesterEternalActions),
    icon: '🎭',
    explorerLevelRequired: 9,
    
    battleStartMessages: [
        {
            speaker: 'player',
            style: 'default',
            text: 'あなたは廃遊園地の奥で小さな道化師と遭遇した。'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: 'わーい！新しいお友達だ〜♪ 一緒に遊ぼうよ〜！'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: '双面の道化師デュアルがくるくる回りながらあなたに近づいてくる。その無邪気な笑顔の裏に、何か別の感情が見え隠れしている...'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: 'ねぇねぇ、どんな遊びがしたい？ 僕はどんな遊びでも知ってるよ〜♪'
        }
    ],
    
    victoryMessages: [
        {
            speaker: 'boss',
            style: 'talk',
            text: 'あ〜あ、疲れちゃった...でも楽しかったよ♪',
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: 'また遊ぼうね！今度はもっと、もっと楽しい遊びをしようね〜♪'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: '双面の道化師デュアルは満足そうに微笑んで、くるくる回りながら廃遊園地の奥へと消えていった...'
        }
    ],
    
    // 記念品設定
    victoryTrophy: {
        name: '二面鏡',
        description: '双面の道化師が持っていた特殊な鏡。写した者の裏の姿が見える不思議な力を秘めている。表と裏、どちらが真実なのかは見る者次第。'
    },
    defeatTrophy: {
        name: '道化師の鈴',
        description: '双面の道化師の帽子についていた金色の鈴。可愛い音色に隠された狂気により、聞いた者は現実と幻想の境界を見失う。'
    },
    
    personality: [
        '一緒に遊ぼうよ〜♪',
        'どっちが本当の僕かな〜？',
        'もっと楽しい遊びをしようね♪',
        '君はとても良い玩具だね...',
        '永遠に一緒にいようね',
        'フフフ...面白い'
    ],
    
    aiStrategy: dualJesterAIStrategy,
    
    // カスタム変数の初期値
    customVariables: {
        hasTransformed: false,       // 第2フェーズへの変身フラグ
        currentPhase: 1,             // 現在のフェーズ (1: 表の顔, 2: 裏の顔)
        currentTurn: 0,              // 現在ターン数
        postDefeatedTurn: 0,         // 敗北後ターン数
        dualPersonalityMode: false   // 二重人格モード
    }
};

// フィニッシュムーブの実装
dualJesterData.finishingMove = function(): string[] {
    return [
        '双面の道化師デュアルは<TARGET>を完全に支配した！',
        '「だいすき〜♪ ずっと一緒にいようね〜♪」',
        '「...ついに完璧な玩具を手に入れた」',
        '<TARGET>は道化師の精神世界に取り込まれ、表裏の人格が延々と入れ替わる空間で永遠に遊ばれ続けることになった！',
        '可愛い笑い声と不気味な笑い声が交互に響く中、<TARGET>は現実と幻想の境界を完全に見失ってしまった...'
    ];
};

// 状況別台詞システム
dualJesterData.getDialogue = function(situation: 'battle-start' | 'player-restrained' | 'player-eaten' | 'player-escapes' | 'low-hp' | 'victory') {
    const dialogues: Record<string, string[]> = {
        'battle-start': [
            'わーい！新しいお友達だ〜♪',
            '一緒に遊ぼうよ〜♪',
            'どんな遊びがしたい？',
            'ねぇねぇ、遊ぼうよ〜♪'
        ],
        'player-restrained': [
            'やったぁ〜！捕まえた♪',
            'もう逃げちゃダメだよ〜♪',
            'これでゆっくり遊べるね〜',
            '...フフフ、動けないね（声が低く）'
        ],
        'player-eaten': [
            '表：「お腹の中であったか〜い♪」',
            '裏：「もう二度と外には出さない...」',
            '表：「ずっと一緒だね〜♪」',
            '裏：「完璧な玩具の完成だ...」'
        ],
        'player-escapes': [
            'あ〜、逃げちゃった...',
            '今度はもっと上手に捕まえなきゃ♪',
            'でも逃げられっこないよ〜♪',
            '...覚えておくぞ（声が低く）'
        ],
        'low-hp': [
            'あれ？なんか痛い...（表の顔）',
            '...面白くなってきたな（裏の顔）',
            'でもまだまだ遊べるもん♪',
            '本気を出す時が来たようだな...'
        ],
        'victory': [
            '表：「やったぁ〜！勝った勝った♪」',
            '裏：「当然の結果だ...」',
            '表：「また遊ぼうね〜♪」',
            '裏：「次は逃がさないぞ...」'
        ]
    };
    
    const options = dialogues[situation] || dialogues['battle-start'];
    return options[Math.floor(Math.random() * options.length)];
};