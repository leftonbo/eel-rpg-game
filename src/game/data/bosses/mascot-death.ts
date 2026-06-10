import { Player } from '../../entities/Player';
import { BossData, ActionType, BossAction, Boss } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffectTypes';

const selectWeightedAction = (actions: BossAction[]): BossAction => {
    const usableActions = actions.filter((action) => action.weight > 0);
    const totalWeight = usableActions.reduce((sum, action) => sum + action.weight, 0);
    let random = Math.random() * totalWeight;

    for (const action of usableActions) {
        random -= action.weight;
        if (random <= 0) {
            return action;
        }
    }

    return usableActions[0];
};

const mascotDeathNormalActions: BossAction[] = [
    {
        id: 'candle-flame-flick',
        type: ActionType.Attack,
        name: 'ろうそく火のぱちん',
        description: '魂灯の小さな火を弾いて攻撃する',
        messages: [
            '「はい、ちょっと熱いよ〜。でも怖くない怖くない♪」',
            '{boss}が魂灯の火を指先でぱちんと弾いた！',
            '青白い火花が{player}の周りで弾ける！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.0,
        hitRate: 0.95,
        weight: 28,
        playerStateCondition: 'normal'
    },
    {
        id: 'tiny-scythe-boomerang',
        type: ActionType.StatusAttack,
        name: 'ちび鎌ブーメラン',
        description: '小さな鎌を投げて動きを鈍らせる',
        messages: [
            '「刈り取りじゃなくて、タグ付けだよ♪」',
            '{boss}が玩具のような小さな鎌をくるりと投げた！',
            '鎌は{player}の足元をかすめ、冷たい風だけを残して戻っていく...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.9,
        statusEffect: StatusEffectType.Slow,
        statusChance: 0.65,
        hitRate: 0.9,
        weight: 24,
        playerStateCondition: 'normal'
    },
    {
        id: 'lantern-peek',
        type: ActionType.StatusAttack,
        name: '魂灯のぞき',
        description: '魂灯を覗かせて恐怖を与える',
        messages: [
            '「中を見てみる？かわいい迷子魂がいっぱいだよ〜」',
            '{boss}が持つ魂灯の中で、小さな青い灯りがくるくる回っている...',
            '{player}は吸い込まれそうな灯りにぞくりとした！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.6,
        statusEffect: StatusEffectType.Fear,
        statusChance: 0.75,
        hitRate: 0.95,
        weight: 24,
        playerStateCondition: 'normal'
    },
    {
        id: 'memory-tag',
        type: ActionType.StatusAttack,
        name: '迷子札ぺたり',
        description: '魂の迷子札を貼ってスキルの記憶をぼんやりさせる',
        messages: [
            '「迷子になったら困るから、札を貼っておくね♪」',
            '{boss}が{player}の胸元に小さな迷子札をぺたりと貼った！',
            '札から青白い光が広がり、覚えていた手順が少しぼやける...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.45,
        statusEffect: StatusEffectType.Oblivion,
        statusChance: 0.55,
        hitRate: 0.9,
        weight: 18,
        playerStateCondition: 'normal'
    },
    {
        id: 'candlewick-binding',
        type: ActionType.RestraintAttack,
        name: '灯芯リボン',
        description: '柔らかい灯芯リボンで対象を拘束する',
        messages: [
            '「じっとしててね。魂のサイズを測るだけだから♪」',
            '{boss}のローブから灯芯のようなリボンが伸びてきた！',
            'ふわふわしたリボンが{player}をくるくる巻きにする！'
        ],
        hitRate: 0.86,
        weight: 20,
        playerStateCondition: 'normal',
        canUse: (_boss, player, _turn) => {
            return !player.isRestrained() && !player.isEaten();
        }
    }
];

const mascotDeathRestrainedActions: BossAction[] = [
    {
        id: 'lantern-audit',
        type: ActionType.StatusAttack,
        name: '魂の棚卸し',
        description: '拘束した対象の魂を検品して恐怖を与える',
        messages: [
            '「えーっと、勇気が三つ、根性が二つ、あとおやつの匂いが一つ♪」',
            '{boss}が拘束された{player}の周りを飛び回り、魂の棚卸しを始めた！',
            '細かく点検される感覚に、{player}は落ち着かなくなる...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.9,
        statusEffect: StatusEffectType.Fear,
        statusChance: 0.8,
        weight: 32,
        playerStateCondition: 'restrained'
    },
    {
        id: 'wick-ribbon-squeeze',
        type: ActionType.Attack,
        name: '灯芯ぎゅうぎゅう',
        description: '灯芯リボンを締めて生命力を吸い取る',
        messages: [
            '「きつかったら言ってね。たぶん聞こえないけど♪」',
            '灯芯リボンが{player}をぎゅっと締め付ける！',
            '{boss}の魂灯が少しだけ明るくなった...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.25,
        healRatio: 0.35,
        weight: 30,
        playerStateCondition: 'restrained'
    },
    {
        id: 'wax-stamp',
        type: ActionType.StatusAttack,
        name: '封蝋スタンプ',
        description: '冥界行きではない封蝋で動きを鈍らせる',
        messages: [
            '「正式な手続きにはスタンプが必要なんだよ〜」',
            '{boss}がぷにっとした封蝋スタンプを{player}に押した！',
            'ひんやりした蝋が広がり、体の動きが重くなる...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.7,
        statusEffect: StatusEffectType.Slimed,
        statusChance: 0.9,
        weight: 24,
        playerStateCondition: 'restrained'
    }
];

const mascotDeathEatAction: BossAction = {
    id: 'lantern-pocket',
    type: ActionType.EatAttack,
    name: '魂灯ポケット',
    description: '戦闘不能の対象を魂灯の中へ一時保管する',
    messages: [
        '「はい、迷子魂さんはこちらでーす♪」',
        '{boss}が魂灯の蓋をぱかっと開けると、青白い光が{player}を包み込んだ！',
        '{player}は小さな灯りに押されるように、魂灯の中へすぽんと収められてしまった！'
    ],
    weight: 100,
    playerStateCondition: 'ko',
    canUse: (_boss, player, _turn) => {
        return player.isKnockedOut() && player.isRestrained();
    }
};

const mascotDeathEatenActions: BossAction[] = [
    {
        id: 'soul-warm-bath',
        type: ActionType.DevourAttack,
        name: '魂あたため',
        description: '魂灯の内側で生命力をじんわり吸い上げる',
        messages: [
            '「冷えた魂はよくないから、あっためてあげるね♪」',
            '魂灯の内側がぽかぽかと光り、{player}の力をじんわり吸い上げる...',
            '{boss}は外で満足そうに魂灯をゆらゆら揺らしている。'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.45,
        healRatio: 0.25,
        weight: 34,
        playerStateCondition: 'eaten'
    },
    {
        id: 'waxy-tummy-knead',
        type: ActionType.DevourAttack,
        name: '蝋まみれもみもみ',
        description: '魂灯内の柔らかい蝋で包み込む',
        messages: [
            '「形が崩れないように、やさしくもみもみするね〜」',
            '魂灯の内側から柔らかい蝋があふれ、{player}をぷにぷに包み込む！',
            '動こうとしても、蝋がくっついてなかなか離れない...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.1,
        statusEffect: StatusEffectType.Slimed,
        statusChance: 1.0,
        weight: 28,
        playerStateCondition: 'eaten'
    },
    {
        id: 'forgotten-route',
        type: ActionType.DevourAttack,
        name: '帰り道わすれ',
        description: '魂灯内で方向感覚と記憶をぼんやりさせる',
        messages: [
            '「出口？さっきまであった気がするね〜♪」',
            '魂灯の中で青い火がくるくる回り、{player}の方向感覚を奪っていく...',
            '覚えていた脱出の手順が、ろうそくの煙みたいに薄れていく。'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.8,
        statusEffect: StatusEffectType.Oblivion,
        statusChance: 0.75,
        weight: 22,
        playerStateCondition: 'eaten'
    },
    {
        id: 'scythe-shadow-tickle',
        type: ActionType.DevourAttack,
        name: '鎌影くすぐり',
        description: '鎌の影で魂灯内をくすぐり混乱させる',
        messages: [
            '「まだ元気かな？反応チェックだよ♪」',
            '魂灯の壁に映った小さな鎌の影が、{player}の周りをちょこまか動き回る！',
            'くすぐったいような怖いような感覚に、{player}は目を回してしまう...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.95,
        statusEffect: StatusEffectType.Confusion,
        statusChance: 0.65,
        weight: 20,
        playerStateCondition: 'eaten'
    }
];

const mascotDeathFinishMove: BossAction = {
    id: 'soul-lantern-storage',
    type: ActionType.FinishingMove,
    name: '魂灯の仮宿',
    description: '力尽きた対象を魂灯の奥に一時保管する',
    messages: [
        '魂灯の中で力を使い果たした{player}は、小さな青い灯りのようにふわりと浮かび上がった...',
        '「あ、迷子魂モードになっちゃった。じゃあ奥の棚にしまっておくね♪」',
        '{boss}は魂灯の奥にある小さな棚を開き、{player}を柔らかな灯りのクッションへそっと押し込む！',
        '「あとでちゃんと返すから安心してね。たぶん、手続きが終わったら♪」',
        '{player}は魂灯の奥でゆらゆら揺れる仮宿に収められ、しばらく外へ戻れなくなってしまった...'
    ],
    weight: 1,
    playerStateCondition: 'eaten',
    onUse: (_boss: Boss, player: Player, _turn: number) => {
        player.statusEffects.removeEffect(StatusEffectType.Doomed);
        player.statusEffects.addEffect(StatusEffectType.Dead);
        player.statusEffects.addEffect(StatusEffectType.Shrunk, -1);
        player.statusEffects.addEffect(StatusEffectType.Oblivion, -1);

        return [];
    }
};

const mascotDeathPostDefeatedActions: BossAction[] = [
    {
        id: 'lantern-shelf-polish',
        type: ActionType.PostDefeatedAttack,
        name: '魂棚みがき',
        description: '魂灯の棚を磨きながら保管した対象をゆらす',
        messages: [
            '「棚は清潔第一だよ〜。ほこりがつくと魂がくしゃみするからね♪」',
            '{boss}が魂灯をきゅっきゅっと磨くたび、中の{player}も小さく揺れる...',
            '青い灯りのクッションは柔らかいが、揺れが止まらず落ち着かない。'
        ],
        weight: 30,
        playerStateCondition: 'defeated'
    },
    {
        id: 'receipt-stamp',
        type: ActionType.PostDefeatedAttack,
        name: '受領印ぺたぺた',
        description: '保管中の魂に冥界の受領印を押す',
        messages: [
            '「受け取りました、っと。これで迷子じゃないね♪」',
            '{boss}が魂灯の内側へぷにぷにした受領印を押していく！',
            '{player}はスタンプのたびに、柔らかい蝋へぽふんと押し戻される...'
        ],
        statusEffect: StatusEffectType.Slimed,
        statusChance: 0.9,
        weight: 26,
        playerStateCondition: 'defeated'
    },
    {
        id: 'lullaby-countdown',
        type: ActionType.PostDefeatedAttack,
        name: 'ろうそく子守唄',
        description: '魂灯越しに子守唄を歌い、記憶をぼんやりさせる',
        messages: [
            '「ひとーつ、ふたーつ、魂さん。みっつ数えたら、おやすみだよ♪」',
            '{boss}の小さな歌声が魂灯の中で反響する...',
            '歌を聞いているうちに、{player}の意識はふわふわと霞んでいく。'
        ],
        statusEffect: StatusEffectType.Oblivion,
        statusChance: 0.8,
        weight: 24,
        playerStateCondition: 'defeated'
    },
    {
        id: 'cute-reaper-peek',
        type: ActionType.PostDefeatedAttack,
        name: '死神のぞき見',
        description: '魂灯を覗き込んで保管状態を確認する',
        messages: [
            '「元気かな〜？あ、元気じゃなくて保管中だった♪」',
            '{boss}の大きな顔が魂灯の窓いっぱいに映る！',
            'にこにこした顔なのに、鎌の影だけは妙に怖い...'
        ],
        statusEffect: StatusEffectType.Fear,
        statusChance: 0.85,
        weight: 20,
        playerStateCondition: 'defeated'
    }
];

const mascotDeathGrandAuditAction: BossAction = {
    id: 'grand-soul-audit',
    type: ActionType.PostDefeatedAttack,
    name: '大魂棚卸し',
    description: '8ターンごとに魂灯内の保管状態をまとめて確認する',
    messages: [
        '「定期棚卸しの時間だよ〜。番号札、灯り具合、もちもち度を確認しまーす♪」',
        '{boss}が魂灯を両手で抱え、しゃかしゃかと軽く振り始めた！',
        '魂灯の中の棚がくるくる回り、{player}は青い灯りと蝋に包まれて目を回す...',
        '「うん、保管状態ばっちり。逃げ道は...あ、間違えて消しちゃった♪」',
        '棚卸しが終わるころには、{player}の記憶も体もすっかりふわふわになっていた。'
    ],
    onUse: (_boss: Boss, player: Player, _turn: number) => {
        player.statusEffects.addEffect(StatusEffectType.Fear);
        player.statusEffects.addEffect(StatusEffectType.Confusion);
        player.statusEffects.addEffect(StatusEffectType.Slimed);
        player.statusEffects.addEffect(StatusEffectType.Oblivion);

        return [];
    },
    weight: 1,
    playerStateCondition: 'defeated'
};

const mascotDeathAIStrategy = (boss: Boss, player: Player, turn: number): BossAction => {
    boss.setCustomVariable('currentTurn', turn);

    if (player.isDefeated()) {
        let postDefeatedTurn = boss.getCustomVariable<number>('postDefeatedTurn', 0);
        postDefeatedTurn++;
        boss.setCustomVariable('postDefeatedTurn', postDefeatedTurn);

        if (postDefeatedTurn % 8 === 0) {
            return mascotDeathGrandAuditAction;
        }

        return selectWeightedAction(mascotDeathPostDefeatedActions);
    }

    if (player.isEaten()) {
        if (player.isDoomed()) {
            return mascotDeathFinishMove;
        }

        return selectWeightedAction(mascotDeathEatenActions);
    }

    if (player.isKnockedOut()) {
        if (player.isRestrained() && mascotDeathEatAction.canUse?.(boss, player, turn)) {
            return mascotDeathEatAction;
        }

        const restraintAction = mascotDeathNormalActions.find((action) => action.id === 'candlewick-binding');
        return restraintAction || mascotDeathNormalActions[0];
    }

    if (player.isRestrained()) {
        return selectWeightedAction(mascotDeathRestrainedActions);
    }

    const availableNormalActions = mascotDeathNormalActions.filter((action) => {
        return action.canUse ? action.canUse(boss, player, turn) : true;
    });

    return selectWeightedAction(availableNormalActions);
};

export const mascotDeathData: BossData = {
    id: 'mascot-death',
    name: 'MascotDeath',
    displayName: '魂喰いの死神',
    description: '魂灯を抱えた可愛らしい死神マスコット',
    questNote: '冥界地方の入口に、ろうそく型の魂灯を抱えた小さな死神マスコットが現れた。見た目は丸くて愛らしいが、旅人の魂を「迷子さん」と呼んで魂灯に一時保管してしまうらしい。あなたの任務は、その危険な魂の棚卸しを止め、冥界の入口を安全にすることだ。',
    appearanceNote: '白い球体マスコット、黒いフード付きローブ、青白く光るモニター顔、ろうそく型の魂灯、小さな鎌、灯芯リボン、ぷにぷにした封蝋スタンプ',
    maxHp: 1480,
    attackPower: 24,
    actions: mascotDeathNormalActions
        .concat(mascotDeathRestrainedActions)
        .concat([mascotDeathEatAction])
        .concat(mascotDeathEatenActions)
        .concat([mascotDeathFinishMove])
        .concat(mascotDeathPostDefeatedActions)
        .concat([mascotDeathGrandAuditAction]),
    suppressAutoFinishingMove: true,
    icon: '🕯️',
    explorerLevelRequired: 10,
    battleStartMessages: [
        {
            speaker: 'player',
            style: 'default',
            text: 'あなたは冥界地方の入口で、魂灯を抱えた小さな死神マスコットと遭遇した。'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「あ、新しい迷子魂さんだ〜♪ 受付はこちらだよ〜」'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: '丸い体の死神マスコットは、かわいらしく首をかしげながらも、魂灯の蓋をそっと開いている...'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「怖がらなくていいよ。ちょっと保管して、ちょっと味見して、ちゃんと棚に並べるだけだから♪」'
        }
    ],
    victoryMessages: [
        {
            speaker: 'boss',
            style: 'talk',
            text: '「あれれ、棚卸し失敗？魂灯の明かりがしょんぼりだよ〜」'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「でも君の魂、すごく元気だったね。次はもっと大きい札を用意しておくね♪」'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: '魂喰いの死神は魂灯を抱え直し、ろうそくの煙のように冥界の霧へ溶けていった...'
        }
    ],
    victoryTrophy: {
        name: '青白い灯芯',
        description: '魂喰いの死神が魂灯に使っていた青白く光る灯芯。外側の魂灯からこぼれ落ちたもので、火をつけなくても淡い光を放つ。'
    },
    defeatTrophy: {
        name: '魂蜜キャンドル',
        description: '魂灯の内側で柔らかな蝋と魂の灯りが混ざって固まった小さなキャンドル。甘い香りがするが、火をつけると持ち主の名前を呼ぶように揺れる。'
    },
    personality: [
        '迷子魂さん、受付はこちらだよ〜',
        '怖くないよ、棚にしまうだけだから♪',
        '魂のサイズ、測ってもいい？',
        'ちょっと味見、ちょっと保管♪',
        '逃げ道は安全のため閉めておくね〜',
        '棚卸しは冥界のおしごとなんだよ♪'
    ],
    aiStrategy: mascotDeathAIStrategy,
    customVariables: {
        currentTurn: 0,
        postDefeatedTurn: 0
    }
};
