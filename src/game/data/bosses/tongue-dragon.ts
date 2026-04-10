import { BossData, ActionType, BossAction, Boss } from '../../entities/Boss';
import { Player } from '../../entities/Player';
import { StatusEffectType } from '../../systems/StatusEffectTypes';

// ========================================
// 通常状態のアクション
// ========================================

const tongueDragonActions: BossAction[] = [
    {
        id: 'tongue-whip',
        type: ActionType.Attack,
        name: '舌ムチ',
        description: '長い舌をムチのように振り回す',
        damageFormula: (user: Boss) => user.attackPower * 1.0,
        hitRate: 0.95,
        weight: 35,
        playerStateCondition: 'normal',
        messages: [
            '{boss}が長い舌をムチのように振るった！'
        ]
    },
    {
        id: 'arm-slam',
        type: ActionType.Attack,
        name: '腕叩き',
        description: 'うねる腕で強力に叩きつける',
        damageFormula: (user: Boss) => user.attackPower * 1.5,
        hitRate: 0.75,
        weight: 20,
        playerStateCondition: 'normal',
        messages: [
            '{boss}がうねる腕を振り上げ、{player}に叩きつけた！'
        ]
    },
    {
        id: 'tongue-lick',
        type: ActionType.StatusAttack,
        name: 'ベロベロ舐め',
        description: '長い舌で舐めまわし粘液まみれにする',
        damageFormula: (user: Boss) => user.attackPower * 0.7,
        hitRate: 0.95,
        statusEffect: StatusEffectType.TongueMucus,
        statusChance: 0.80,
        weight: 25,
        playerStateCondition: 'normal',
        messages: [
            '「シュルルル...」',
            '{boss}が長い舌を伸ばして{player}をベロベロと舐め回した！',
            '{player}の体がぬるぬるの粘液まみれになっていく...'
        ]
    },
    {
        id: 'tongue-bind',
        type: ActionType.RestraintAttack,
        name: '舌巻き付き',
        description: '長い舌で獲物を絡め取る',
        hitRate: 0.85,
        weight: 15,
        playerStateCondition: 'normal',
        messages: [
            '「ヌルルル...」',
            '{boss}が長い舌を伸ばし、{player}の体に巻き付けてきた！',
            'ぬるぬるした舌が{player}の体をきつく締め上げる...'
        ],
        canUse: (_boss: Boss, player: Player, _turn: number) => {
            return !player.isRestrained() && !player.isEaten();
        }
    },

    // 拘束中の攻撃
    {
        id: 'tongue-squeeze',
        type: ActionType.Attack,
        name: '舌締め付け',
        description: '巻き付いた舌で締め付ける',
        damageFormula: (user: Boss) => user.attackPower * 1.2,
        hitRate: 0.95,
        weight: 40,
        playerStateCondition: 'restrained',
        messages: [
            '「シュル...シュル...」',
            '{boss}の舌が{player}の体をぎゅうぎゅうと締め付ける！'
        ]
    },
    {
        id: 'restrained-lick',
        type: ActionType.Attack,
        name: '舐め回し',
        description: '拘束した獲物を舌で舐め回す',
        damageFormula: (user: Boss) => user.attackPower * 1.0,
        hitRate: 0.95,
        weight: 30,
        playerStateCondition: 'restrained',
        healRatio: 0.5,
        messages: [
            '「ペロペロ...♪」',
            '{boss}は嬉しそうに{player}の全身を舌で舐め回している...',
            '{boss}は{player}を舐めて体力を回復した！'
        ]
    },
    {
        id: 'mucus-coat',
        type: ActionType.StatusAttack,
        name: '粘液塗り',
        description: '拘束した獲物を粘液まみれにする',
        damageFormula: (user: Boss) => user.attackPower * 0.5,
        hitRate: 0.95,
        statusEffect: StatusEffectType.TongueMucus,
        statusChance: 0.90,
        weight: 30,
        playerStateCondition: 'restrained',
        messages: [
            '{boss}の舌からどろりと粘液が分泌される...',
            '{player}の体が粘液でぬるぬるにコーティングされていく...'
        ]
    }
];

// ========================================
// 食べられ状態でのアクション（体内の舌による吸収）
// ========================================

const tongueStomachActions: BossAction[] = [
    {
        id: 'internal-taste',
        type: ActionType.DevourAttack,
        name: '体内味見',
        description: '体内の無数の舌で獲物を味見する',
        damageFormula: (user: Boss) => user.attackPower * 1.3,
        messages: [
            '「シュルルル...♪」',
            '{boss}の体内で無数の細かい舌が{player}の全身をぺろぺろと味見している...',
            '{player}は体内の舌に絡め取られながら力を奪われていく...'
        ],
        weight: 30
    },
    {
        id: 'energy-absorb',
        type: ActionType.DevourAttack,
        name: 'エネルギー吸収',
        description: '体内の舌が吸い付いてエネルギーと魔力を吸収する',
        damageFormula: (user: Boss) => user.attackPower * 1.5,
        messages: [
            '{boss}の体内の舌が{player}に吸い付いた！',
            'ぬるぬるとした舌が{player}のエネルギーと魔力を貪欲に吸い上げていく...',
            '{player}の最大HPが減少していく...'
        ],
        weight: 30
    },
    {
        id: 'internal-tongue-wrap',
        type: ActionType.DevourAttack,
        name: '体内舌絡め',
        description: '体内の舌が獲物を絡め取りながら粘液まみれにする',
        damageFormula: (user: Boss) => user.attackPower * 1.0,
        statusEffect: StatusEffectType.TongueMucus,
        statusChance: 0.85,
        messages: [
            '{boss}の体内の舌が次々と{player}に絡みついていく...',
            'ぬるぬるの粘液が{player}の体中に塗りたくられる...'
        ],
        weight: 25
    },
    {
        id: 'mucus-soak',
        type: ActionType.DevourAttack,
        name: '粘液浸し',
        description: '体内を粘液で満たし獲物の動きを鈍らせる',
        damageFormula: (user: Boss) => user.attackPower * 0.8,
        statusEffect: StatusEffectType.Slow,
        statusChance: 0.80,
        messages: [
            '{boss}の体内に大量の粘液が分泌された...',
            '{player}は温かい粘液にどっぷりと浸かり、身体が重くなっていく...'
        ],
        weight: 15
    }
];

// ========================================
// 敗北後のアクション（体内永久ループ）
// ========================================

const postDefeatedActions: BossAction[] = [
    {
        id: 'post-tongue-constrict',
        type: ActionType.PostDefeatedAttack,
        name: '舌の締め付け',
        description: 'ぐるぐる巻きの舌がゆっくりと締め付ける',
        messages: [
            '{player}の全身を巻き付いた舌がゆっくりと締め付けていく...',
            'ぬるぬるした舌の圧迫感が{player}の意識を遠のかせる...'
        ],
        weight: 30
    },
    {
        id: 'post-tongue-taste',
        type: ActionType.PostDefeatedAttack,
        name: '味見蠕動',
        description: '巻き付いた舌が蠢いて味見する',
        messages: [
            '「シュルルル...♪」',
            '{player}に巻き付いた舌がうねうねと蠢き始める...',
            '舌の表面が{player}の全身を丁寧に味わっている...'
        ],
        weight: 30
    },
    {
        id: 'post-energy-siphon',
        type: ActionType.PostDefeatedAttack,
        name: 'エネルギー吸い上げ',
        description: '巻き付いた舌が吸い付いてエネルギーを吸収する',
        messages: [
            '{player}に巻き付いた舌が吸盤のように吸い付いた...',
            '{player}のわずかに残ったエネルギーが舌を通じてゆっくりと吸い取られていく...'
        ],
        weight: 25
    },
    {
        id: 'post-mucus-flood',
        type: ActionType.PostDefeatedAttack,
        name: '粘液浸潤',
        description: '巻き付いた舌から粘液が分泌され体内がぬるぬるになる',
        messages: [
            '{player}を巻き付けた舌からどろりと粘液が染み出してくる...',
            '温かい粘液が{player}の全身を覆い、体内がぬるぬるに満たされていく...',
            '{player}はぬるぬるの粘液の中でただ揺られている...'
        ],
        weight: 25
    }
];

const specialFeedAction: BossAction = {
    id: 'post-nutrient-feed',
    type: ActionType.PostDefeatedAttack,
    name: '養分供給',
    description: '獲物の口に舌を入れて養分を分泌し力尽きないようにする',
    messages: [
        '{boss}の体内の舌がそっと{player}の口元に伸びていく...',
        '舌の先端から甘い養分がゆっくりと分泌される...',
        '{player}は意識が朦朧とする中、養分を流し込まれ続ける...',
        '{boss}は大切な獲物が力尽きないよう、丁寧に養分を与えている...'
    ],
    weight: 1,
    onUse: (_boss: Boss, player: Player) => {
        player.statusEffects.addEffect(StatusEffectType.Weakness);
        return [];
    }
};

// ========================================
// カスタムとどめ（舌のぐるぐる巻き）
// ========================================

const tongueFullWrapAction: BossAction = {
    id: 'tongue-full-wrap',
    type: ActionType.FinishingMove,
    name: '舌のぐるぐる巻き',
    description: '体内の舌で獲物の全身をぐるぐる巻きにして完全に動けなくする',
    messages: [
        '{player}が力尽きたのを感じ取った{boss}の体内の舌が一斉に動き出した...',
        '無数の舌が{player}の手足に、胴体に、全身にぐるぐると巻き付いていく...',
        '{player}は体内の舌に完全に包み込まれ、指一本動かせなくなった...',
        '{boss}は満足そうに洞窟の奥で丸くなり、体内の獲物をゆっくりと味わい始めた...'
    ],
    weight: 1,
    onUse: (_boss: Boss, player: Player) => {
        player.statusEffects.removeEffect(StatusEffectType.Doomed);
        player.statusEffects.addEffect(StatusEffectType.Dead);
        return [];
    }
};

// ========================================
// ボスデータ定義
// ========================================

export const tongueDragonData: BossData = {
    id: 'tongue-dragon',
    name: 'TongueDragon',
    displayName: '舌のドラゴン',
    icon: '👅',
    description: '洞窟の奥深くに住む長い舌のドラゴン',
    appearanceNote: '紫色の体に長い舌が特徴のドラゴン。腕や尻尾がうねるような形状で、先端は舌のようになっている。口から伸びる長い舌のほか、口内には獲物を絡め取る細かい舌が多数生えている。',
    questNote: '洞窟の探検隊がドラゴンに襲われ、全身を粘液まみれにされて帰ってくるという報告が相次いでいる。洞窟の奥に潜む長い舌を持つドラゴンを退治してほしい。報酬は探検ギルドが用意する。',
    maxHp: 680,
    attackPower: 16,
    actions: tongueDragonActions,
    suppressAutoFinishingMove: true,
    explorerLevelRequired: 5,

    victoryTrophy: {
        name: '舌竜の鱗',
        description: '舌のドラゴンの紫色の鱗。しっとりとした手触りで、不思議な光沢を放っている。'
    },
    defeatTrophy: {
        name: '舌竜の粘液',
        description: '舌のドラゴンの体内で採取された特殊な粘液。非常に粘り気が強く、独特の温かさが宿っている。'
    },

    personality: [
        'シュルルル...',
        'ヌルルル...',
        'ベロベロ...',
        'ペロペロ...♪',
        'シュル...シュル...'
    ],

    customVariables: {
        postDefeatedTurn: 0
    },

    battleStartMessages: [
        {
            speaker: 'player',
            style: 'default',
            text: '洞窟の奥深くに足を踏み入れると、湿った空気と独特の匂いが漂ってくる...'
        },
        {
            speaker: 'system',
            style: 'default',
            text: '暗闇の中から、長い舌をチロチロと出す紫色のドラゴンが姿を現した。'
        },
        {
            speaker: 'system',
            style: 'default',
            text: '舌のドラゴンは獲物を見つけ、嬉しそうに舌なめずりをしている...'
        }
    ],

    victoryMessages: [
        {
            speaker: 'system',
            style: 'default',
            text: '舌のドラゴンは悔しそうに長い舌を引っ込め、洞窟の奥へと退いていった...'
        },
        {
            speaker: 'system',
            style: 'default',
            text: '粘液まみれの装備を拭いながら、エルナルは勝利を確信した。'
        }
    ],

    // ========================================
    // AI戦略
    // ========================================
    aiStrategy: (boss: Boss, player: Player, turn: number): BossAction => {

        // ------ 敗北後：体内永久ループ ------
        if (player.isDefeated()) {
            let postDefeatedTurn = boss.getCustomVariable<number>('postDefeatedTurn') ?? 0;
            postDefeatedTurn += 1;
            boss.setCustomVariable('postDefeatedTurn', postDefeatedTurn);

            if (postDefeatedTurn % 8 === 0) {
                return specialFeedAction;
            }

            const totalWeight = postDefeatedActions.reduce((sum, a) => sum + a.weight, 0);
            let rand = Math.random() * totalWeight;
            for (const action of postDefeatedActions) {
                rand -= action.weight;
                if (rand <= 0) return action;
            }
            return postDefeatedActions[0];
        }

        // ------ 食べられ状態 ------
        if (player.isEaten()) {
            if (player.isDoomed()) {
                return tongueFullWrapAction;
            }

            const totalWeight = tongueStomachActions.reduce((sum, a) => sum + a.weight, 0);
            let rand = Math.random() * totalWeight;
            for (const action of tongueStomachActions) {
                rand -= action.weight;
                if (rand <= 0) return action;
            }
            return tongueStomachActions[0];
        }

        // ------ KO状態 ------
        if (player.isKnockedOut()) {
            if (player.isRestrained()) {
                if (Math.random() < 0.9) {
                    return {
                        id: 'tongue-swallow',
                        type: ActionType.EatAttack,
                        name: '丸呑み',
                        description: '舌で獲物を喉に押し込み飲み込む',
                        messages: [
                            '「ヌルルル...♪」',
                            '{boss}は長い舌で{player}を喉の奥へとゆっくり押し込んでいく...',
                            'ぬるぬるした舌に押されて、{player}は{boss}の体内へと飲み込まれた...'
                        ],
                        weight: 1
                    };
                }
            } else {
                const rand = Math.random();
                if (rand < 0.70) {
                    const restraintAction = tongueDragonActions.find(a => a.type === ActionType.RestraintAttack);
                    if (restraintAction) return restraintAction;
                } else if (rand < 0.90) {
                    return {
                        id: 'tongue-swallow-direct',
                        type: ActionType.EatAttack,
                        name: '丸呑み',
                        description: '舌で獲物を喉に押し込み飲み込む',
                        messages: [
                            '「ヌルルル...♪」',
                            '{boss}は動けなくなった{player}に長い舌を巻き付け、大きな口を開けた...',
                            'ぬるぬるした舌に誘導されて、{player}は{boss}の体内へと飲み込まれた...'
                        ],
                        weight: 1
                    };
                }
            }
        }

        // ------ 拘束中 ------
        if (player.isRestrained()) {
            const restrainedActions = tongueDragonActions.filter(
                a => a.playerStateCondition === 'restrained'
            );
            if (restrainedActions.length > 0 && Math.random() < 0.85) {
                const totalWeight = restrainedActions.reduce((sum, a) => sum + a.weight, 0);
                let rand = Math.random() * totalWeight;
                for (const action of restrainedActions) {
                    rand -= action.weight;
                    if (rand <= 0) return action;
                }
                return restrainedActions[0];
            }
        }

        // ------ 通常状態の戦略 ------

        const hasMucus = player.statusEffects.hasEffect(StatusEffectType.TongueMucus);

        if (!hasMucus && turn >= 2 && Math.random() < 0.50) {
            const lickAction = tongueDragonActions.find(a => a.id === 'tongue-lick');
            if (lickAction) return lickAction;
        }

        if (hasMucus && !player.isRestrained() && Math.random() < 0.40) {
            const restraintAction = tongueDragonActions.find(a => a.type === ActionType.RestraintAttack);
            if (restraintAction) return restraintAction;
        }

        // 重み付きランダム選択（通常アクション）
        const availableActions = tongueDragonActions.filter(a => {
            if (a.playerStateCondition === 'restrained') return false;
            if (a.type === ActionType.RestraintAttack) return false;
            if (a.type === ActionType.EatAttack) return false;
            if (a.canUse) return a.canUse(boss, player, turn);
            return true;
        });

        const totalWeight = availableActions.reduce((sum, a) => sum + a.weight, 0);
        let rand = Math.random() * totalWeight;
        for (const action of availableActions) {
            rand -= action.weight;
            if (rand <= 0) return action;
        }

        return availableActions[0] || tongueDragonActions[0];
    }
};
