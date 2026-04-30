import { BossData, ActionType, BossAction, Boss } from '../../entities/Boss';
import { Player } from '../../entities/Player';
import { StatusEffectType } from '../../systems/StatusEffectTypes';

const yumewataGreetingActions: BossAction[] = [
    {
        id: 'welcome-waggle',
        type: ActionType.StatusAttack,
        name: 'おいでおいで尻尾',
        description: 'リボンのような尻尾を揺らし、甘い匂いで警戒心をほどく',
        messages: [
            '「こわくないよ、こっちで休んでいこ？」',
            '{boss}がリボンのような尻尾をゆらゆら揺らす。',
            'ふわふわした毛並みから甘く安心する匂いが広がっていく...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.35,
        statusEffect: StatusEffectType.CozyScent,
        statusChance: 0.9,
        hitRate: 0.98,
        weight: 28,
        playerStateCondition: 'normal'
    },
    {
        id: 'soft-paw-tap',
        type: ActionType.Attack,
        name: 'ぷに肉球タップ',
        description: '遊ぶように肉球でぽんぽん叩く',
        messages: [
            '「えい、えいっ。ちゃんとこっち見て？」',
            '{boss}が丸い肉球で{player}をぽんぽんと叩いた！',
            '軽いはずなのに、魔力を含んだ弾力がじんわり響く...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.75,
        hitRate: 0.95,
        weight: 20,
        playerStateCondition: 'normal'
    },
    {
        id: 'ghost-muzzle-lick',
        type: ActionType.StatusAttack,
        name: 'おばけ舌の鼻先ぺろり',
        description: '小さなおばけマスコットが顔と鼻先を重点的に舐めて意識をとろけさせる',
        messages: [
            '「まずは味見係さん、お願いね」',
            '半透明のおばけマスコットがふわりと近づき、{player}の顔を包み込む。',
            'あたたかく魔力を帯びた舌が鼻先をぺろりとなぞった...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.55,
        statusEffect: StatusEffectType.MuzzleMelt,
        statusChance: 0.85,
        hitRate: 0.95,
        weight: 25,
        playerStateCondition: 'normal'
    },
    {
        id: 'tiny-flock-tickle',
        type: ActionType.StatusAttack,
        name: 'ちびわた群れくすぐり',
        description: '小さなぬいぐるみ群体が足元からまとわりついて集中力を削る',
        messages: [
            '「みんな、逃げ道をふわふわにしてあげて」',
            'ちびわた達が足元に集まり、手足や脇腹をふわふわとくすぐってくる！',
            '{player}は笑いをこらえながら距離を取ろうとした...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.45,
        statusEffect: StatusEffectType.Euphoria,
        statusChance: 0.75,
        hitRate: 0.92,
        weight: 22,
        playerStateCondition: 'normal'
    },
    {
        id: 'ribbon-wing-embrace',
        type: ActionType.RestraintAttack,
        name: '翼リボンの抱擁',
        description: '翼とリボンを広げ、獲物を外から見えないほど優しく包む',
        messages: [
            '「もう迷わないように、包んであげる」',
            '{boss}が丸い翼とリボンを広げ、{player}をふわりと抱き込む！',
            '外の音が遠ざかり、あたたかな羽毛と布の感触だけが残った...'
        ],
        statusEffect: StatusEffectType.CozyScent,
        statusChance: 0.75,
        hitRate: 0.9,
        weight: 20,
        playerStateCondition: 'normal',
        canUse: (_boss: Boss, player: Player) => !player.isRestrained() && !player.isEaten()
    },
    {
        id: 'soft-wing-sweep',
        type: ActionType.Attack,
        name: 'ふかふか翼払い',
        description: '大きな翼で転ばせ、ふわふわの群れの中心へ押し戻す',
        messages: [
            '「そっちは冷たいよ。こっちが巣だよ」',
            '{boss}の翼がふわりと広がり、{player}を群れの中心へ押し戻した！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.0,
        hitRate: 0.88,
        weight: 16,
        playerStateCondition: 'normal'
    }
];

const yumewataRestrainedActions: BossAction[] = [
    {
        id: 'nose-melting-groom',
        type: ActionType.StatusAttack,
        name: '鼻先集中グルーミング',
        description: '拘束した獲物の顔と鼻先を重点的に舐め、呼吸ごと魔力を染み込ませる',
        messages: [
            '「ここがいちばん緊張してるね。ほどいてあげる」',
            '{boss}とおばけマスコット達が、拘束された{player}の顔を覗き込む。',
            '鼻先を中心に、あたたかい魔法のぺろぺろが何度も重ねられていく...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.9,
        statusEffect: StatusEffectType.MuzzleMelt,
        statusChance: 0.95,
        hitRate: 0.98,
        weight: 30,
        playerStateCondition: 'restrained',
        healRatio: 0.25
    },
    {
        id: 'multi-sense-carousel',
        type: ActionType.StatusAttack,
        name: '感覚メリーゴーランド',
        description: '顔、耳、手足、魔力感覚を群れで同時に刺激し、処理を追いつかなくする',
        messages: [
            '「ひとりずつじゃ足りないよね。みんなでやさしく落としてあげよう」',
            '顔にはおばけ舌、耳元には甘いささやき、手足にはちびわたのくすぐり。',
            '複数の感覚が同時に押し寄せ、{player}は何に抵抗すればいいのか分からなくなる！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.0,
        statusEffect: StatusEffectType.SensoryOverload,
        statusChance: 0.9,
        hitRate: 0.95,
        weight: 28,
        playerStateCondition: 'restrained'
    },
    {
        id: 'ribbon-nest-weave',
        type: ActionType.StatusAttack,
        name: 'リボン巣編み',
        description: 'リボン状の器官で巣を編み、やわらかく動きを封じる',
        messages: [
            '「暴れると疲れちゃうから、巣で支えてあげるね」',
            '{boss}のリボンが{player}の周囲で結ばれ、ほどけない巣を作っていく。',
            '締め付けは強くないのに、支えられるほど力が抜けていく...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.65,
        statusEffect: StatusEffectType.RibbonNest,
        statusChance: 0.85,
        hitRate: 0.95,
        weight: 24,
        playerStateCondition: 'restrained'
    },
    {
        id: 'warm-energy-sip',
        type: ActionType.StatusAttack,
        name: 'ぬくもりエナジー吸い',
        description: '安心して力が抜けたところから体力と魔力を少しずつ吸う',
        messages: [
            '「こわばりがほどけると、おいしい魔力がこぼれるんだ」',
            '{boss}が翼の内側を{player}に密着させ、あたたかな魔力を循環させる。',
            '力が抜けるほど、体力と魔力がゆっくり吸い上げられていく...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.25,
        statusEffect: StatusEffectType.Weakness,
        statusChance: 0.75,
        hitRate: 0.96,
        weight: 26,
        playerStateCondition: 'restrained',
        healRatio: 0.55
    },
    {
        id: 'kinship-lullaby',
        type: ActionType.StatusAttack,
        name: '同族化の子守唄',
        description: '群れの声で眠気と仲間意識を流し込み、戦う意思を薄れさせる',
        messages: [
            '「こっちの毛並みになれば、ずっとあたたかいよ」',
            'ちびわた達が小さな声で同じ旋律を歌い始める。',
            'その歌は、敵ではなく巣の仲間として迎えられる夢を見せてくる...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.75,
        statusEffect: StatusEffectType.KinshipDrift,
        statusChance: 0.85,
        hitRate: 0.94,
        weight: 18,
        playerStateCondition: 'restrained'
    },
    {
        id: 'pillow-paw-press',
        type: ActionType.Attack,
        name: 'まくら肉球プレス',
        description: 'ぬいぐるみのような腕で抱きしめ、逃げる方向感覚を奪う',
        messages: [
            '「じっとしてたら、もっと楽になるよ」',
            '{boss}の丸い腕がまくらのように{player}を押さえ込む！',
            'ふかふかの圧力に、逃げる向きすら分かりにくくなる...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.35,
        hitRate: 0.95,
        weight: 20,
        playerStateCondition: 'restrained'
    },
    {
        id: 'dream-pocket-swallow',
        type: ActionType.EatAttack,
        name: 'ゆめポケット丸呑み',
        description: '拘束した獲物を夢の体内ポケットへ送り込み、安全に閉じ込める',
        messages: [
            '「外でがんばるのはもうおしまい。巣の奥で休も？」',
            '{boss}のリボンと翼が{player}を小さな夢のポケットへ導いていく。',
            'あたたかい闇と甘い匂いに包まれ、外の景色が見えなくなった...'
        ],
        weight: 14,
        playerStateCondition: 'restrained',
        canUse: (boss: Boss, player: Player, _turn: number) => {
            const restraintTurns = boss.getCustomVariable<number>('restraintTurns', 0);
            return player.isRestrained() && !player.isEaten() && restraintTurns >= 3;
        }
    }
];

const yumewataEatenActions: BossAction[] = [
    {
        id: 'dream-pocket-drain',
        type: ActionType.DevourAttack,
        name: '夢ポケット吸収',
        description: '体内ポケットの柔らかい壁で魔力と最大HPを吸収する',
        messages: [
            '夢のポケットの壁が、{player}をふわふわと抱き直す。',
            '痛みはないのに、体力と魔力が温かい波に変わって{boss}へ流れていく...',
            '「暴れないでくれると、すごくおいしくて幸せなんだ」'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.35,
        statusEffect: StatusEffectType.CozyScent,
        statusChance: 0.7,
        weight: 28,
        playerStateCondition: 'eaten'
    },
    {
        id: 'inner-face-lick',
        type: ActionType.DevourAttack,
        name: '体内おばけぺろぺろ',
        description: '体内に棲む小さなおばけが顔と鼻先を舐め、抵抗心を溶かす',
        messages: [
            '体内ポケットの奥から、小さなおばけマスコット達がふわふわ現れる。',
            '見えない場所でも、顔と鼻先へのあたたかいぺろぺろは正確に続いていく...',
            '{player}は外へ出る考えを保つのが難しくなってきた...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.05,
        statusEffect: StatusEffectType.MuzzleMelt,
        statusChance: 0.9,
        weight: 25,
        playerStateCondition: 'eaten'
    },
    {
        id: 'inner-tickle-cloud',
        type: ActionType.DevourAttack,
        name: '体内ふわくすぐり雲',
        description: '体内の毛玉雲が全身をくすぐり、力を抜かせる',
        messages: [
            'ふわふわした毛玉雲が体内ポケットを満たしていく。',
            '顔、首元、手足に同時に触れるやわらかい感触が、{player}の力を抜いていく...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.9,
        statusEffect: StatusEffectType.Bliss,
        statusChance: 0.85,
        weight: 22,
        playerStateCondition: 'eaten'
    },
    {
        id: 'kinship-dye',
        type: ActionType.DevourAttack,
        name: '同族化の綿染め',
        description: '体内ポケットでふわふわの魔力を染み込ませ、群れに馴染ませる',
        messages: [
            '「そのまま、こっちの匂いと毛並みに慣れていこうね」',
            '{boss}の体内ポケットが淡い光を帯び、綿のような魔力を{player}へ染み込ませる。',
            '自分の輪郭が、巣のぬくもりに少しずつ馴染んでいく感覚がする...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.15,
        statusEffect: StatusEffectType.KinshipDrift,
        statusChance: 0.9,
        weight: 20,
        playerStateCondition: 'eaten'
    },
    {
        id: 'ribbon-peristalsis',
        type: ActionType.DevourAttack,
        name: 'リボン蠕動',
        description: '体内リボンがゆっくり蠢き、逃げ道をやさしく閉じる',
        messages: [
            '体内に伸びるリボンが波打ち、{player}を奥へ奥へと抱き直す。',
            'どの向きへ進んでも、やわらかいリボンが先回りして戻してしまう...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.2,
        statusEffect: StatusEffectType.RibbonNest,
        statusChance: 0.65,
        weight: 18,
        playerStateCondition: 'eaten'
    },
    {
        id: 'happiness-overflow',
        type: ActionType.DevourAttack,
        name: '幸福感オーバーフロー',
        description: '安心感と多重刺激を同時に流し込み、思考を幸福感で満たす',
        messages: [
            '「もう逃げなくていいって、体が覚えてくれるよ」',
            '甘い匂い、あたたかい吐息、ふわふわの圧力、魔力の振動が一度に満ちる！',
            '{player}の考えは幸福感でいっぱいになり、抵抗の輪郭がぼやけていく...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.0,
        statusEffect: StatusEffectType.SensoryOverload,
        statusChance: 0.85,
        weight: 18,
        playerStateCondition: 'eaten'
    }
];

const yumewataFinishingAction: BossAction = {
    id: 'mellow-kinship-finish',
    type: ActionType.FinishingMove,
    name: 'まどろみ同族化',
    description: '力尽きた獲物を群れの奥へ迎え、ふわふわのマスコット眷属として眠らせる',
    messages: [
        '{player}の最大HPが尽き、夢のポケットの中で体が小さくなっていく...',
        '「がんばったね。もう獲物じゃなくて、巣の子になろう？」',
        '{boss}とちびわた達が小さくなった{player}を囲み、リボンと綿毛でそっと包む。',
        '顔も鼻先も甘い匂いとぬくもりに覆われ、外へ戻る理由が遠くなっていく...',
        '淡い光がほどける頃、{player}はゆめわた達の群れに馴染む小さなマスコット眷属として、巣の奥で眠り続けることになった...'
    ],
    weight: 100,
    playerStateCondition: 'defeated',
    onUse: (_boss: Boss, player: Player) => {
        player.statusEffects.removeEffect(StatusEffectType.Doomed);
        player.statusEffects.addEffect(StatusEffectType.Dead);
        player.statusEffects.addEffect(StatusEffectType.Shrunk, -1);
        player.statusEffects.addEffect(StatusEffectType.Plushified, -1);
        player.statusEffects.addEffect(StatusEffectType.KinshipDrift, -1);
        player.statusEffects.addEffect(StatusEffectType.Eaten);
        return [];
    }
};

const yumewataPostDefeatedActions: BossAction[] = [
    {
        id: 'post-nest-rocking',
        type: ActionType.PostDefeatedAttack,
        name: '巣のゆりかご',
        description: '体内の巣で小さな眷属をゆっくり揺らす',
        messages: [
            '{boss}の体内巣がゆっくり揺れ、{player}を寝かしつけている...',
            'ちびわた達が周りで丸くなり、外の音を全部ふわふわに変えてしまう。'
        ],
        weight: 26,
        playerStateCondition: 'defeated'
    },
    {
        id: 'post-muzzle-care',
        type: ActionType.PostDefeatedAttack,
        name: 'お顔のお世話',
        description: 'おばけマスコット達が顔と鼻先を清め続ける',
        messages: [
            'おばけマスコット達が、眠る{player}の顔を順番にぺろぺろと整えている...',
            '鼻先に残る甘い魔力が、巣の匂いを当たり前のものにしていく。'
        ],
        statusEffect: StatusEffectType.MuzzleMelt,
        statusChance: 1.0,
        weight: 24,
        playerStateCondition: 'defeated'
    },
    {
        id: 'post-ribbon-brushing',
        type: ActionType.PostDefeatedAttack,
        name: 'リボン毛並みブラシ',
        description: 'リボンで新しい毛並みを整える',
        messages: [
            '{boss}のリボンがブラシのように動き、{player}の新しい毛並みを整えていく...',
            '撫でられるたびに、群れの一員としての匂いが濃くなっていく。'
        ],
        statusEffect: StatusEffectType.KinshipDrift,
        statusChance: 1.0,
        weight: 22,
        playerStateCondition: 'defeated'
    },
    {
        id: 'post-energy-sharing',
        type: ActionType.PostDefeatedAttack,
        name: '幸福エネルギー分け合い',
        description: '巣の中で幸福感を循環させ、ゆめわた達の栄養にする',
        messages: [
            '体内巣の中で、{player}からこぼれた幸福感が淡い光になって巡っている...',
            '{boss}とちびわた達はその光を少しずつ分け合い、満足そうに寄り添った。'
        ],
        statusEffect: StatusEffectType.Bliss,
        statusChance: 1.0,
        weight: 20,
        playerStateCondition: 'defeated'
    },
    {
        id: 'post-group-cuddle',
        type: ActionType.PostDefeatedAttack,
        name: 'ちびわた集合抱っこ',
        description: '小さな群れが集まり、動けないほどやさしく抱きしめる',
        messages: [
            'ちびわた達が次々と集まり、{player}を中心に小さな山を作った...',
            '重さはほとんどないのに、どこにも隙間がなく、ただ温かい。'
        ],
        statusEffect: StatusEffectType.RibbonNest,
        statusChance: 0.8,
        weight: 18,
        playerStateCondition: 'defeated'
    }
];

const yumewataSpecialGroomingAction: BossAction = {
    id: 'post-kinship-grooming-festival',
    type: ActionType.PostDefeatedAttack,
    name: '同族化仕上げのお祭り',
    description: '8ターンごとに群れ全員で眷属の匂いと毛並みを仕上げる',
    messages: [
        '「今日は仕上げの日だよ。みんな、順番にお世話してあげて」',
        'ちびわた達が列を作り、{player}の顔、耳、手足、尻尾代わりのリボンを順番に整えていく。',
        'おばけマスコットは鼻先に甘い魔力を重ね、コウモリ羽の子は翼で外の光を遮った。',
        '最後に{boss}が体内巣全体をやさしく揺らすと、{player}は群れの匂いの中で深くまどろんだ...'
    ],
    statusEffect: StatusEffectType.SensoryOverload,
    statusChance: 1.0,
    weight: 200,
    playerStateCondition: 'defeated'
};

function getAction(actions: BossAction[], id: string): BossAction {
    const action = actions.find(candidate => candidate.id === id);
    if (!action) {
        throw new Error(`Yumewata Mellow action not found: ${id}`);
    }
    return action;
}

function weightedRandom(actions: BossAction[]): BossAction {
    const totalWeight = actions.reduce((sum, action) => sum + action.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const action of actions) {
        random -= action.weight;
        if (random <= 0) {
            return action;
        }
    }
    
    return actions[0];
}

const yumewataMellowActions = [
    ...yumewataGreetingActions,
    ...yumewataRestrainedActions,
    ...yumewataEatenActions,
    yumewataFinishingAction,
    yumewataSpecialGroomingAction,
    ...yumewataPostDefeatedActions
];

const yumewataMellowAIStrategy = (boss: Boss, player: Player, turn: number): BossAction => {
    const playerHasCozyScent = player.statusEffects.hasEffect(StatusEffectType.CozyScent);
    const playerHasMuzzleMelt = player.statusEffects.hasEffect(StatusEffectType.MuzzleMelt);
    const playerHasSensoryOverload = player.statusEffects.hasEffect(StatusEffectType.SensoryOverload);
    const playerHasRibbonNest = player.statusEffects.hasEffect(StatusEffectType.RibbonNest);
    const playerHasKinshipDrift = player.statusEffects.hasEffect(StatusEffectType.KinshipDrift);
    const playerHpRate = player.getHpPercentage();
    const playerMpRate = player.mp / Math.max(1, player.maxMp);
    
    boss.setCustomVariable('currentTurn', turn);
    
    if (player.isRestrained() && !player.isEaten() && !player.isKnockedOut()) {
        const restraintTurns = boss.getCustomVariable<number>('restraintTurns', 0) + 1;
        boss.setCustomVariable('restraintTurns', restraintTurns);
    } else {
        boss.setCustomVariable('restraintTurns', 0);
    }
    
    if (player.isDefeated()) {
        const postDefeatedTurn = boss.getCustomVariable<number>('postDefeatedTurn', 0) + 1;
        boss.setCustomVariable('postDefeatedTurn', postDefeatedTurn);
        
        if (postDefeatedTurn % 8 === 0) {
            return yumewataSpecialGroomingAction;
        }
        
        return weightedRandom(yumewataPostDefeatedActions);
    }
    
    if (player.isDoomed()) {
        return yumewataFinishingAction;
    }
    
    if (player.isEaten()) {
        if (!playerHasKinshipDrift && Math.random() < 0.55) {
            return getAction(yumewataEatenActions, 'kinship-dye');
        }
        
        if (!playerHasMuzzleMelt && Math.random() < 0.45) {
            return getAction(yumewataEatenActions, 'inner-face-lick');
        }
        
        if (playerHpRate < 0.35 || playerMpRate < 0.25) {
            return getAction(yumewataEatenActions, 'happiness-overflow');
        }
        
        return weightedRandom(yumewataEatenActions);
    }
    
    if (player.isKnockedOut()) {
        if (player.isRestrained()) {
            return getAction(yumewataRestrainedActions, 'dream-pocket-swallow');
        }
        
        return getAction(yumewataGreetingActions, 'ribbon-wing-embrace');
    }
    
    if (player.isRestrained()) {
        const restraintTurns = boss.getCustomVariable<number>('restraintTurns', 0);
        
        if (!playerHasMuzzleMelt) {
            return getAction(yumewataRestrainedActions, 'nose-melting-groom');
        }
        
        if (restraintTurns >= 2 && !playerHasSensoryOverload) {
            return getAction(yumewataRestrainedActions, 'multi-sense-carousel');
        }
        
        if (restraintTurns >= 3 && !playerHasRibbonNest) {
            return getAction(yumewataRestrainedActions, 'ribbon-nest-weave');
        }
        
        if (restraintTurns >= 4 && (playerHpRate < 0.45 || playerMpRate < 0.35 || Math.random() < 0.35)) {
            return getAction(yumewataRestrainedActions, 'dream-pocket-swallow');
        }
        
        if (!playerHasKinshipDrift && turn >= 5) {
            return getAction(yumewataRestrainedActions, 'kinship-lullaby');
        }
        
        return weightedRandom(yumewataRestrainedActions.filter(action => action.id !== 'dream-pocket-swallow'));
    }
    
    if (!playerHasCozyScent && (turn <= 2 || Math.random() < 0.35)) {
        return getAction(yumewataGreetingActions, 'welcome-waggle');
    }
    
    if (!playerHasMuzzleMelt && Math.random() < 0.25) {
        return getAction(yumewataGreetingActions, 'ghost-muzzle-lick');
    }
    
    if (!playerHasSensoryOverload && turn > 3 && turn % 4 === 0) {
        return getAction(yumewataGreetingActions, 'tiny-flock-tickle');
    }
    
    if (boss.getHpPercentage() < 0.45 && Math.random() < 0.45) {
        return getAction(yumewataGreetingActions, 'ribbon-wing-embrace');
    }
    
    return weightedRandom(yumewataGreetingActions);
};

export const yumewataMellowData: BossData = {
    id: 'yumewata-mellow',
    name: 'YumewataMellow',
    displayName: 'ゆめわたメロウ',
    icon: '🧸',
    description: '甘い巣へ迎えるケモノマスコット群体',
    appearanceNote: '成人相当の人格を持つ、ふわふわのケモノマスコット。小さなコウモリ翼、リボン状の尻尾、半透明のおばけマスコット、ちびぬいぐるみの群れを連れている。',
    questNote: '夜の森に、迷い人を傷つけずに連れ帰る「ふわふわの巣」が現れた。戻ってきた者は皆、怖い目に遭ったとは言わず、ただ甘い匂いとぬくもりを恋しがるという。あなたはその巣の中心にいるマスコット生物の生態を確かめるため、灯りの消えた小道へ向かった...',
    maxHp: 1480,
    attackPower: 24,
    actions: yumewataMellowActions,
    aiStrategy: yumewataMellowAIStrategy,
    suppressAutoFinishingMove: true,
    explorerLevelRequired: 10,
    battleStartMessages: [
        {
            speaker: 'player',
            style: 'default',
            text: '夜の森の奥、綿毛のような明かりが集まる巣で、あなたは小さなマスコット達に囲まれた。'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「見つけた。がんばりすぎてる子の匂いがする」'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: '中央に座るゆめわたメロウが、コウモリのような翼とリボンの尻尾をゆっくり広げる。'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「ここでは怖がらせないよ。安心させて、動けなくして、こぼれた魔力を少し分けてもらうだけ」'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「最後まで気持ちよく負けられたら、きっと巣の匂いも好きになるよ」'
        }
    ],
    victoryMessages: [
        {
            speaker: 'boss',
            style: 'talk',
            text: '「あれ、まだ巣に馴染まないんだ。強い子だね」'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: 'ゆめわたメロウはちびわた達を集め、ほどけたリボンを丁寧に結び直した。'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「今日はおしまい。また疲れた匂いがしたら迎えに来るね」'
        }
    ],
    personality: [
        '怖がらせるより、安心して力を抜いてくれる方がおいしいんだ',
        '顔がこわばってるね。鼻先からほどいてあげる',
        '逃げ道はふわふわにしておいたよ',
        '巣の中なら、外のことを考えなくていいよ',
        '同じ匂いになれば、もう迷子じゃなくなるね',
        '暴れないでくれる子は、群れのみんなで大切にするよ'
    ],
    victoryTrophy: {
        name: 'ゆめわたリボン',
        description: 'ゆめわたメロウの尻尾からほどけた柔らかなリボン。甘い匂いは薄いが、握ると不思議と緊張がほぐれる。'
    },
    defeatTrophy: {
        name: '巣綿のまくら',
        description: 'ゆめわたメロウの体内巣で育った綿を詰めた小さなまくら。顔を近づけると、巣の奥で過ごした幸福な敗北の記憶が淡くよみがえる。'
    },
    customVariables: {
        currentTurn: 0,
        restraintTurns: 0,
        postDefeatedTurn: 0
    }
};
