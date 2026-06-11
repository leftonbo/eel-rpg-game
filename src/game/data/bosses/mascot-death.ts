import { Player } from '@/game/entities/Player';
import { ActionType, Boss, BossAction, BossData } from '@/game/entities/Boss';
import { StatusEffectType } from '@/game/systems/StatusEffectTypes';

// 拘束されたプレイヤーが刈り取られるまでの猶予ターン数
const RESTRAINT_GRACE_TURNS = 3;
// 敗北後に魔力を与え直す周期
const MANA_REGIFT_INTERVAL = 8;

// =============================================================
// 通常フェーズ: 闇魔法で弱らせつつ、大鎌の一撃を狙う
// =============================================================

const normalActions: BossAction[] = [
    {
        id: 'scythe-handle-bonk',
        type: ActionType.Attack,
        name: '鎌の柄でこつん',
        description: '身の丈以上の大鎌の柄で、こつんと小突く',
        damageFormula: (user: Boss) => user.attackPower * 0.8,
        hitRate: 0.95,
        weight: 30,
        playerStateCondition: 'normal',
        messages: [
            '{boss}は大鎌をくるりと回し、柄の先で{player}をこつんと小突いた！'
        ]
    },
    {
        id: 'dark-pulse',
        type: ActionType.StatusAttack,
        name: '闇の魔弾',
        description: '魂と体の結びつきを緩める闇魔法を放つ',
        damageFormula: (user: Boss) => user.attackPower * 0.6,
        statusEffect: StatusEffectType.SoulCurse,
        statusChance: 0.75,
        hitRate: 0.9,
        weight: 30,
        playerStateCondition: 'normal',
        messages: [
            '「よわく、なあれ...」',
            '{boss}の小さな手から、まっくろな魔力の弾が放たれた！'
        ]
    },
    {
        id: 'candle-wisp',
        type: ActionType.Attack,
        name: '蝋燭の鬼火',
        description: '頭の蝋燭から青白い鬼火を飛ばす',
        damageFormula: (user: Boss) => user.attackPower * 1.1,
        hitRate: 0.85,
        weight: 20,
        playerStateCondition: 'normal',
        messages: [
            '{boss}の頭の蝋燭がゆらりと揺れ、青白い鬼火が{player}に飛んでいく！'
        ]
    },
    {
        id: 'shadow-bind',
        type: ActionType.RestraintAttack,
        name: '影の縛り',
        description: '足元から伸びる影の手で{player}を縛り上げる',
        weight: 15,
        hitRate: 0.5,
        playerStateCondition: 'normal',
        canUse: (_boss: Boss, player: Player, _turn: number) => {
            return !player.isRestrained() && !player.isEaten();
        },
        messages: [
            '「つかまえちゃお」',
            '{player}の足元の影から、まっくろな手がにゅるりと伸びてきた！'
        ]
    }
];

// =============================================================
// 大鎌の溜め → 一閃 (1ターンの溜めが必要)
// =============================================================

const scytheRaiseAction: BossAction = {
    id: 'scythe-raise',
    type: ActionType.Skip,
    name: '大鎌振り上げ',
    description: '身の丈以上の大鎌を高々と振り上げ、魂刈りの構えを取る',
    weight: 1,
    messages: [
        '{boss}は身の丈以上の大鎌を、ずずず...と高々と振り上げた！',
        '「つぎのいちげき、とくべつだよ...」',
        '大鎌の刃が不気味に輝いている。防御しなければ、魂を刈り取られてしまう！'
    ],
    onPreUse: (action: BossAction, boss: Boss) => {
        boss.setCustomVariable('scytheCharging', true);
        boss.statusEffects.addEffect(StatusEffectType.ScytheStance);
        return action;
    }
};

// 魂を体から切り離す共通処理 (ダウンしていなければ強制ダウンさせる)
const reapSoul = (player: Player): void => {
    if (player.hp > 0) {
        player.takeDamage(player.hp);
    }
    if (!player.statusEffects.hasEffect(StatusEffectType.SoulForm)) {
        player.statusEffects.addEffect(StatusEffectType.SoulForm);
    }
};

const soulReapSwingAction: BossAction = {
    id: 'soul-reap-swing',
    type: ActionType.Attack,
    name: '魂刈りの一閃',
    description: '振り上げた大鎌を一気に振り下ろし、魂を刈り取る',
    damageFormula: (user: Boss) => user.attackPower * 3.0,
    hitRate: 1.0,
    weight: 1,
    messages: [
        '「ざんっ！」',
        '{boss}は大鎌を一気に振り下ろした！'
    ],
    onUse: (_boss: Boss, player: Player) => {
        reapSoul(player);
        return [
            '大鎌の刃が{player}の体をすうっと通り抜けた！',
            '{player}の体はがくりと崩れ落ち、半透明の魂がぽんっと抜け出してしまった...'
        ];
    }
};

const soulReapGuardedAction: BossAction = {
    id: 'soul-reap-guarded',
    type: ActionType.Attack,
    name: '受け止められた一閃',
    description: '大鎌の一閃が防御によって受け止められる',
    damageFormula: (user: Boss) => user.attackPower * 1.8,
    hitRate: 1.0,
    weight: 1,
    messages: [
        '{boss}は大鎌を一気に振り下ろした！',
        'しかし{player}は身構えて、魂ごと刈り取られる一撃をなんとか受け止めた！',
        '「むぅ...じょうずに ふせぐんだね」'
    ]
};

// =============================================================
// 拘束フェーズ: 3ターンの猶予ののち、鎌で刈り取る
// =============================================================

const restrainedActions: BossAction[] = [
    {
        id: 'dark-erosion',
        type: ActionType.StatusAttack,
        name: '闇の蝕み',
        description: '影に縛られた{player}に闇の魔力を流し込む',
        damageFormula: (user: Boss) => user.attackPower * 1.3,
        statusEffect: StatusEffectType.SoulCurse,
        statusChance: 0.7,
        hitRate: 1.0,
        weight: 30,
        playerStateCondition: 'restrained',
        messages: [
            '{boss}は影の手ごしに、{player}へ闇の魔力をじわじわと流し込む...',
            '「にげないと、かりとっちゃうよ...？」'
        ]
    },
    {
        id: 'whisper-of-end',
        type: ActionType.StatusAttack,
        name: '終わりの囁き',
        description: '耳元で恐ろしくも可愛らしい声で囁き、力を奪う',
        damageFormula: (user: Boss) => user.attackPower * 0.9,
        statusEffect: StatusEffectType.Weakness,
        statusChance: 0.7,
        hitRate: 1.0,
        weight: 25,
        playerStateCondition: 'restrained',
        messages: [
            '{boss}はとてとてと近づき、{player}の耳元に口を寄せた。',
            '「もうすぐ、おむかえのじかんだよ...」',
            '可愛らしい声なのに、{player}の背筋は凍りつき、力が抜けていく...'
        ]
    }
];

const restrainedSoulReapAction: BossAction = {
    id: 'restrained-soul-reap',
    type: ActionType.Attack,
    name: '拘束刈り取り',
    description: '影に縛られて逃げられない{player}の魂を、大鎌でゆっくりと刈り取る',
    damageFormula: (user: Boss) => user.attackPower * 2.0,
    hitRate: 1.0,
    weight: 1,
    playerStateCondition: 'restrained',
    messages: [
        '「じかんぎれ、だよ」',
        '{boss}は影に縛られた{player}の前で、大鎌をゆっくりと振りかぶった...'
    ],
    onUse: (_boss: Boss, player: Player) => {
        reapSoul(player);
        return [
            '大鎌の刃が{player}の体をすうっと撫でるように通り抜けた！',
            '{player}の体は影の手の中でぐったりと崩れ、半透明の魂がぽんっと抜け出してしまった...'
        ];
    }
};

// =============================================================
// ダウン中: 魂の切り離しと丸呑み
// =============================================================

const koSoulReapAction: BossAction = {
    id: 'ko-soul-reap',
    type: ActionType.Attack,
    name: '魂の切り離し',
    description: '倒れた{player}の魂を、大鎌の先でそっと切り離す',
    damageFormula: (user: Boss) => user.attackPower * 0.5,
    hitRate: 1.0,
    weight: 1,
    playerStateCondition: 'ko',
    messages: [
        '{boss}は倒れた{player}の上に大鎌をかざし、刃先をそっと滑らせた...'
    ],
    onUse: (_boss: Boss, player: Player) => {
        reapSoul(player);
        return [
            '{player}の体から、半透明の魂がふわりと引き出されてしまった...'
        ];
    }
};

const soulSwallowAction: BossAction = {
    id: 'soul-swallow',
    type: ActionType.EatAttack,
    name: '魂の丸呑み',
    description: '刈り取った魂を両手で掬い上げ、そのまま丸呑みにする',
    weight: 1,
    messages: [
        '「いただきま～す」',
        '{boss}は宙に浮かぶ{player}の魂を小さな両手でそっと掬い上げた。',
        'フードの奥の口が大きく開き、{player}の魂はあむっと丸呑みにされてしまった！',
        '{player}の魂は、ほんのり温かい漆黒の体内に閉じ込められてしまった...'
    ]
};

// =============================================================
// 体内フェーズ: 魂から生気を吸収する
// =============================================================

const eatenActions: BossAction[] = [
    {
        id: 'soul-sip',
        type: ActionType.DevourAttack,
        name: '生気すすり',
        description: '体内に閉じ込めた魂から、生気をちゅうちゅうと吸い取る',
        damageFormula: (user: Boss) => user.attackPower * 1.6,
        healRatio: 0.5,
        weight: 35,
        playerStateCondition: 'eaten',
        messages: [
            '「ちゅう...ちゅう...おいしい...」',
            '漆黒の体内が{player}の魂を優しく包み、生気をちゅうちゅうと吸い上げていく...'
        ]
    },
    {
        id: 'soul-cradle',
        type: ActionType.DevourAttack,
        name: '魂の揺り籠',
        description: '体内で魂をゆらゆらと揺らし、抵抗する力を溶かしていく',
        damageFormula: (user: Boss) => user.attackPower * 1.2,
        statusEffect: StatusEffectType.Weakness,
        statusChance: 0.6,
        weight: 30,
        playerStateCondition: 'eaten',
        messages: [
            '{boss}の体内が揺り籠のようにゆらゆらと揺れ、{player}の魂を心地よく包み込む...',
            '抗う気力が、少しずつ溶かされていく...'
        ]
    },
    {
        id: 'deep-soul-drain',
        type: ActionType.DevourAttack,
        name: '深い生気吸収',
        description: '魂の芯から生気をごっそりと吸い上げ、自分のものにする',
        damageFormula: (user: Boss) => user.attackPower * 2.0,
        healRatio: 0.6,
        weight: 25,
        playerStateCondition: 'eaten',
        messages: [
            '「きみのいきるちから、ぜーんぶ ちょうだい...」',
            '漆黒の体内が一斉に蠢き、{player}の魂の芯から生気をごっそりと吸い上げた！',
            '{boss}の頭の蝋燭の灯が、ぼうっと大きく燃え上がる...'
        ]
    }
];

// =============================================================
// カスタムとどめ: 永遠の魂の蝋燭
// =============================================================

const finishingMoveAction: BossAction = {
    id: 'eternal-soul-candle',
    type: ActionType.FinishingMove,
    name: '永遠の魂の蝋燭',
    description: '体内で力尽きた魂を、永遠に生気を分けてくれる特別な蝋燭の灯にする',
    weight: 1,
    messages: [
        '{boss}の体内で、{player}の魂はとうとう力尽きてしまった...',
        '「もう がんばらなくて いいよ。ずっと いっしょ、だからね」',
        '漆黒の体内の奥に小さな燭台がせり上がり、{player}の魂がそっと乗せられた。',
        '{player}の魂は蝋燭の灯のようにゆらゆらと揺れ、{boss}に永遠に生気を分け続けることになった...'
    ],
    onUse: (_boss: Boss, player: Player) => {
        player.statusEffects.removeEffect(StatusEffectType.Doomed);
        player.statusEffects.addEffect(StatusEffectType.Dead);
        if (!player.isEaten()) {
            player.statusEffects.addEffect(StatusEffectType.Eaten);
        }
        if (!player.statusEffects.hasEffect(StatusEffectType.SoulForm)) {
            player.statusEffects.addEffect(StatusEffectType.SoulForm);
        }
        return [];
    }
};

// =============================================================
// 敗北後フェーズ: 永続的な生気吸収と、時々の魔力の与え直し
// =============================================================

const postDefeatedActions: BossAction[] = [
    {
        id: 'eternal-drain',
        type: ActionType.PostDefeatedAttack,
        name: '永遠の生気吸収',
        description: '燭台に灯る魂から、生気をゆっくりと吸い続ける',
        weight: 30,
        playerStateCondition: 'defeated',
        messages: [
            '{boss}の体内で、燭台に灯る{player}の魂から生気がゆっくりと吸い上げられていく...',
            '「すぅ...はぁ...きみのひかり、あったかいね...」'
        ]
    },
    {
        id: 'candle-gazing',
        type: ActionType.PostDefeatedAttack,
        name: '蝋燭眺め',
        description: 'お腹の中の魂の灯を、うっとりと眺める',
        weight: 25,
        playerStateCondition: 'defeated',
        messages: [
            '{boss}は自分のお腹をそっと撫で、中で揺れる{player}の魂の灯をうっとりと感じている...',
            '「きれい...ぼくのたからもの...」'
        ]
    },
    {
        id: 'soul-polish',
        type: ActionType.PostDefeatedAttack,
        name: '魂磨き',
        description: '体内の器官で魂を丁寧に磨き、灯を整える',
        weight: 25,
        playerStateCondition: 'defeated',
        messages: [
            '漆黒の体内の柔らかな器官が、{player}の魂を丁寧に撫でて磨き上げていく...',
            '磨かれた魂はぴかぴかと輝き、{player}は不思議な心地よさに包まれる...'
        ]
    },
    {
        id: 'belly-lullaby',
        type: ActionType.PostDefeatedAttack,
        name: '死神の子守唄',
        description: '小さな声で子守唄を歌い、体内の魂を揺らす',
        weight: 20,
        playerStateCondition: 'defeated',
        messages: [
            '{boss}は小さな声で、ふしぎな子守唄を歌い始めた...',
            '歌声は漆黒の体内に染みわたり、{player}の魂をゆらゆらと揺らしている...'
        ]
    }
];

const manaRegiftAction: BossAction = {
    id: 'mana-regift',
    type: ActionType.PostDefeatedAttack,
    name: '魔力の与え直し',
    description: '吸いすぎて小さくなった魂の灯に、自分の魔力を注ぎ直す',
    weight: 1,
    playerStateCondition: 'defeated',
    messages: [
        '「あ...ちょっと すいすぎちゃった」',
        '{boss}は小さくなった{player}の魂の灯に、自分のまっくろな魔力をとくとくと注ぎ直した。',
        '{player}の魂はふたたび明るく灯り、{boss}は満足そうに頷いた。',
        '「これで また いっぱい すえるね」'
    ],
    onUse: (_boss: Boss, player: Player) => {
        player.recoverMp(player.maxMp);
        return [];
    }
};

// =============================================================
// すべてのアクションを統合
// =============================================================

const mascotDeathActions: BossAction[] = [
    ...normalActions,
    scytheRaiseAction,
    soulReapSwingAction,
    soulReapGuardedAction,
    ...restrainedActions,
    restrainedSoulReapAction,
    koSoulReapAction,
    soulSwallowAction,
    ...eatenActions,
    finishingMoveAction,
    ...postDefeatedActions,
    manaRegiftAction
];

// =============================================================
// AI 戦略
// =============================================================

const pickWeighted = (actions: BossAction[]): BossAction => {
    const total = actions.reduce((sum, action) => sum + action.weight, 0);
    let random = Math.random() * total;
    for (const action of actions) {
        random -= action.weight;
        if (random <= 0) return action;
    }
    return actions[0];
};

const clearScytheStance = (boss: Boss): void => {
    boss.setCustomVariable('scytheCharging', false);
    boss.statusEffects.removeEffect(StatusEffectType.ScytheStance);
};

const mascotDeathAIStrategy = (boss: Boss, player: Player, turn: number): BossAction => {
    const hasSoulForm = player.statusEffects.hasEffect(StatusEffectType.SoulForm);

    // 1. カスタムとどめ: 体内で力尽きた魂を永遠の蝋燭にする
    if (player.isDoomed() && !player.isDefeated()) {
        clearScytheStance(boss);
        return finishingMoveAction;
    }

    // 2. 敗北後: 永続吸収と、一定周期での魔力の与え直し
    if (player.isDefeated()) {
        clearScytheStance(boss);
        let postDefeatedTurn = boss.getCustomVariable<number>('postDefeatedTurn', 0);
        postDefeatedTurn++;
        boss.setCustomVariable('postDefeatedTurn', postDefeatedTurn);

        if (postDefeatedTurn % MANA_REGIFT_INTERVAL === 0) {
            return manaRegiftAction;
        }
        return pickWeighted(postDefeatedActions);
    }

    // 3. 体外に脱出した魂はすぐに元の体へ戻る
    if (hasSoulForm && !player.isEaten() && !player.isKnockedOut()) {
        player.statusEffects.removeEffect(StatusEffectType.SoulForm);
    }

    // 4. 体内: 魂から生気を吸収する
    if (player.isEaten()) {
        return pickWeighted(eatenActions);
    }

    // 5. ダウン中: 魂を切り離し、刈り取った魂を丸呑みにする
    if (player.isKnockedOut()) {
        clearScytheStance(boss);
        if (hasSoulForm) {
            return soulSwallowAction;
        }
        return koSoulReapAction;
    }

    // 6. 拘束中: 3ターンの猶予ののち、大鎌で刈り取る
    if (player.isRestrained()) {
        clearScytheStance(boss);
        let restraintTurns = boss.getCustomVariable<number>('consecutiveRestraintTurns', 0);
        restraintTurns++;
        boss.setCustomVariable('consecutiveRestraintTurns', restraintTurns);

        if (restraintTurns > RESTRAINT_GRACE_TURNS) {
            boss.setCustomVariable('consecutiveRestraintTurns', 0);
            return restrainedSoulReapAction;
        }
        return pickWeighted(restrainedActions);
    }
    boss.setCustomVariable('consecutiveRestraintTurns', 0);

    // 7. 溜め済みなら大鎌を振り下ろす (防御していれば耐えられる)
    const scytheCharging = boss.getCustomVariable<boolean>('scytheCharging', false);
    if (scytheCharging) {
        clearScytheStance(boss);
        const isPlayerDefending = player.statusEffects.hasEffect(StatusEffectType.Defending);
        return isPlayerDefending ? soulReapGuardedAction : soulReapSwingAction;
    }

    // 8. 魂の呪いで弱った相手には、大鎌の溜めを狙う
    const hasSoulCurse = player.statusEffects.hasEffect(StatusEffectType.SoulCurse);
    if (hasSoulCurse && turn >= 3 && Math.random() < 0.45) {
        return scytheRaiseAction;
    }

    // 9. 通常行動
    const availableActions = normalActions.filter(action =>
        action.canUse ? action.canUse(boss, player, turn) : true
    );
    return pickWeighted(availableActions);
};

// =============================================================
// BossData
// =============================================================

export const mascotDeathData: BossData = {
    id: 'mascot-death',
    name: 'MascotDeath',
    displayName: '魂喰いの死神',
    icon: '🕯',
    description: '可愛らしいが恐ろしい死神マスコット',
    questNote: '天空地方の外れにある「黄昏の霊園」で、迷い込んだ旅人の魂が刈り取られるという噂が広がっている。目撃者いわく、それは小さくて可愛らしい死神の姿をしているが、身の丈以上の大鎌を軽々と振るうのだという。噂の真相を確かめ、討伐してほしい。',
    appearanceNote: 'ずんぐりした小さな黒ローブのマスコット死神。フードの奥はまんまるで真っ白な顔と黒くつぶらな瞳。頭にちょこんと灯る蝋燭、身の丈以上の大鎌、ほんのり温かい漆黒の体内。',
    maxHp: 1050,
    attackPower: 26,
    actions: mascotDeathActions,
    suppressAutoFinishingMove: true,
    explorerLevelRequired: 9,

    victoryTrophy: {
        name: '大鎌の欠片',
        description: '魂喰いの死神が振るっていた大鎌の刃の欠片。月光のように淡く輝き、触れても何も刈り取られないのに、なぜか背筋がひやりとする。'
    },
    defeatTrophy: {
        name: '魂の蝋燭',
        description: '魂喰いの死神の体内の燭台に灯っていた小さな蝋燭。灯をともすと生気を少しずつ吸われる気がするが、不思議と心は安らぐ。'
    },

    personality: [
        '「きみのたましい、とってもきれいだね...」',
        '「かりとっちゃうよ...？」',
        '「こわくないよ。ちょっとだけ、ちくっとするだけ」',
        '「おなかのなか、あったかいでしょ？」',
        '「ずっといっしょ、だよ」'
    ],

    customVariables: {
        scytheCharging: false,
        consecutiveRestraintTurns: 0,
        postDefeatedTurn: 0
    },

    battleStartMessages: [
        {
            speaker: 'player',
            style: 'default',
            text: '黄昏の霊園の奥、蝋燭の小さな灯がぽつんと揺れている。'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: '灯に近づくと、身の丈以上の大鎌を携えた小さな死神が、とてとてと姿を現した。'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「わぁ...きみのたましい、とってもきれい...」'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「ねえ、ちょうだい？ だいじにするから...ずっと、ずーっと」'
        }
    ],

    victoryMessages: [
        {
            speaker: 'boss',
            style: 'talk',
            text: '「まけちゃった...きょうは、おむかえできないね」'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「でも、きみのたましいのいろ、おぼえたよ。またね...」'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: '魂喰いの死神は大鎌を引きずりながら、黄昏の霧の中へとことこと消えていった...'
        }
    ],

    aiStrategy: mascotDeathAIStrategy
};
