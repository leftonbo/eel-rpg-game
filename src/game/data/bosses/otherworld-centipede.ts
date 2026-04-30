import { BossData, ActionType, BossAction, Boss } from '../../entities/Boss';
import { Player } from '../../entities/Player';
import { StatusEffectType } from '../../systems/StatusEffectTypes';

// ========================================
// 通常状態のアクション
// ========================================

const otherworldCentipedeActions: BossAction[] = [
    // 体当たり予告（2ターン溜め）
    {
        id: 'body-slam-prepare',
        type: ActionType.Attack,
        name: '体当たり準備',
        description: '体当たりの構えを取る（次のターンに強烈な体当たりが来る！）',
        damageFormula: (_user: Boss) => 0,
        hitRate: 1.0,
        weight: 12,
        playerStateCondition: 'normal',
        messages: [
            '「ほう……見事にかわそうとするか」',
            '{boss}が長大な体をぐねらせ、体当たりの構えを取り始めた！',
            '次のターン、強烈な体当たりが来る予感がする…！'
        ],
        canUse: (boss: Boss, _player: Player, _turn: number) => {
            return !boss.getCustomVariable<boolean>('charging', false);
        },
        onUse: (boss: Boss, _player: Player, _turn: number) => {
            boss.setCustomVariable('charging', true);
            return [];
        }
    },
    // 水圧弾
    {
        id: 'water-pressure-bullet',
        type: ActionType.Attack,
        name: '水圧弾',
        description: '銃器のような道具から圧縮した水を発射する',
        damageFormula: (user: Boss) => user.attackPower * 1.1,
        hitRate: 0.90,
        weight: 30,
        playerStateCondition: 'normal',
        messages: [
            '{boss}が無数の腕で奇妙な装置を取り出した！',
            '「食らえ！」',
            '装置から圧縮された水が{player}に向かって射出された！'
        ]
    },
    // ネバネバ弾
    {
        id: 'sticky-bullet',
        type: ActionType.StatusAttack,
        name: 'ネバネバ弾',
        description: '粘着性の高い液体を発射して動きを鈍らせる',
        damageFormula: (user: Boss) => user.attackPower * 0.7,
        hitRate: 0.93,
        statusEffect: StatusEffectType.CentipedeSlime,
        statusChance: 0.90,
        weight: 25,
        playerStateCondition: 'normal',
        messages: [
            '{boss}が腕に持った装置の照準を{player}に合わせた！',
            '粘着性の高い液体が{player}めがけて放射された！',
            'ぬるりと…{player}の体がねばねばした液体でまみれた！'
        ]
    },
    // 毒弾
    {
        id: 'poison-bullet',
        type: ActionType.StatusAttack,
        name: '毒弾',
        description: '微量の毒を含んだ弾を発射する。弱いが継続ダメージを与える',
        damageFormula: (user: Boss) => user.attackPower * 0.6,
        hitRate: 0.93,
        statusEffect: StatusEffectType.CentipedePoison,
        statusChance: 0.85,
        weight: 20,
        playerStateCondition: 'normal',
        messages: [
            '{boss}が別の装置を取り出した！',
            '小さな毒弾が{player}に向けて放たれた！',
            '「ムカデの毒はじわじわと浸かるのだ」'
        ]
    },
    // 巻き付き（拘束）
    {
        id: 'wrap-up',
        type: ActionType.RestraintAttack,
        name: '巻き付き',
        description: '長い体を巻き付けて拘束する。ネバネバか毒状態なら使いやすくなる',
        hitRate: 0.85,
        weight: 13,
        playerStateCondition: 'normal',
        messages: [
            '「逃げられると思うたか？」',
            '{boss}の長大な体が素早く{player}に巻き付いた！',
            '無数の腕が{player}の全身を押さえ込み、ぴたりと固定される…！'
        ],
        canUse: (_boss: Boss, player: Player, _turn: number) => {
            return !player.isRestrained() && !player.isEaten();
        }
    }
];

// ========================================
// 拘束中のアクション
// ========================================

const otherworldCentipedeRestrainedActions: BossAction[] = [
    {
        id: 'squeeze',
        type: ActionType.Attack,
        name: '締め付け',
        description: '巻き付いた体でぎゅうっと締め付ける',
        damageFormula: (user: Boss) => user.attackPower * 1.0,
        hitRate: 0.97,
        weight: 40,
        playerStateCondition: 'restrained',
        messages: [
            '{boss}の巨体が{player}をぎゅうっと締め付けた！',
            '無数の脚が{player}の体をがっちりと押さえ込んでいる…'
        ]
    },
    {
        id: 'pin-down',
        type: ActionType.Attack,
        name: '押さえつけ',
        description: '無数の腕で全身を押さえ込む',
        damageFormula: (user: Boss) => user.attackPower * 0.9,
        hitRate: 0.97,
        weight: 30,
        playerStateCondition: 'restrained',
        messages: [
            '{boss}の無数の腕が{player}の体中に押し付けられた！',
            'どこにも逃げ場がない…ありとあらゆる方向から押さえ込まれている…！'
        ]
    },
    {
        id: 'restraint-bite',
        type: ActionType.StatusAttack,
        name: '噛みつき',
        description: '大きな顎で噛みつき、毒を注入する',
        damageFormula: (user: Boss) => user.attackPower * 0.6,
        hitRate: 0.93,
        statusEffect: StatusEffectType.CentipedePoison,
        statusChance: 0.90,
        weight: 30,
        playerStateCondition: 'restrained',
        messages: [
            '{boss}の大きな顎が{player}にがぶっと噛みついた！',
            '「ムカデの毒を直接注いでやろう……」',
            '毒液が{player}の体内に流れ込んでいく…！'
        ]
    }
];

// ========================================
// 食べられ状態でのアクション
// ========================================

const otherworldCentipedeStomachActions: BossAction[] = [
    {
        id: 'internal-squeeze',
        type: ActionType.DevourAttack,
        name: '体内締め付け',
        description: '体内で巻き付いてぎゅっと締め付ける',
        damageFormula: (user: Boss) => user.attackPower * 1.0,
        messages: [
            '{boss}の体内が{player}の周囲でぎゅっと収縮した！',
            '暗闇の中、ムカデの体が{player}をじわじわと締め付けていく…'
        ],
        weight: 40
    },
    {
        id: 'internal-hug',
        type: ActionType.DevourAttack,
        name: '体内抱擁',
        description: '体内で無数の腕に包み込まれる',
        damageFormula: (user: Boss) => user.attackPower * 0.8,
        messages: [
            '{boss}の体内で無数の腕が{player}をそっと包み込んだ…',
            '「気に入ったぞ、お前のことが……」',
            '腕に包まれながら、{player}は力を徐々に吸われていく…'
        ],
        weight: 35
    },
    {
        id: 'internal-coil',
        type: ActionType.DevourAttack,
        name: '体内巻き付き',
        description: '体内でぐるぐると巻き付いてくる',
        damageFormula: (user: Boss) => user.attackPower * 0.9,
        messages: [
            '{boss}の体内で細長い体がぐるぐると{player}に巻き付いた！',
            '息が苦しくなるほど密着してくる…でも、なぜか温かい…'
        ],
        weight: 25
    }
];

// 体内3ターン目のネバネバ毒漬けイベント（一回限り）
const internalSlimePoisonBathAction: BossAction = {
    id: 'internal-slime-poison-bath',
    type: ActionType.DevourAttack,
    name: 'ネバネバ毒漬け',
    description: '体内をネバネバの毒液で満たして全身に浸透させる',
    damageFormula: (user: Boss) => user.attackPower * 1.2,
    messages: [
        '「私の体内は気に入っただろう？」',
        '{boss}の体内に大量のねばねばした液体が分泌され始めた！',
        '「これはムカデの特別な液……浸かれば浸かるほど……」',
        '{player}の全身がネバネバの毒液に浸かっていく…！',
        '「病みつきになるぞ……ふふ」'
    ],
    weight: 1,
    onUse: (boss: Boss, player: Player, _turn: number) => {
        boss.setCustomVariable('slimePoisonBathDone', true);
        player.statusEffects.addEffect(StatusEffectType.CentipedeSlime, 6);
        player.statusEffects.addEffect(StatusEffectType.CentipedePoison, 6);
        return [];
    }
};

// ========================================
// 敗北後のアクション（体内捕囚ループ）
// ========================================

const captiveActions: BossAction[] = [
    {
        id: 'captive-coil-1',
        type: ActionType.PostDefeatedAttack,
        name: '囚われ巻き付き',
        description: 'ぐるぐると巻き付いて可愛がる',
        messages: [
            '{boss}の体がぐるぐると{player}の周囲を巻き付いていく…',
            '「可愛い獲物め……ずっとここにいるがいい」',
            '{player}は温かい暗闇の中で巻き付かれ続けている…'
        ],
        weight: 35
    },
    {
        id: 'captive-coil-2',
        type: ActionType.PostDefeatedAttack,
        name: '囚われ締め付け',
        description: '体内でじわじわと締め付けながら可愛がる',
        messages: [
            '{boss}の体内がじわりと収縮し、{player}をやさしく締め付けた…',
            '「逃げようとはしないか……賢い生き物だ」',
            '{player}はムカデの温もりに包まれながら意識が朦朧としてくる…'
        ],
        weight: 30
    },
    {
        id: 'captive-hug',
        type: ActionType.PostDefeatedAttack,
        name: '囚われ抱擁',
        description: '無数の腕で全身をやさしく包み込む',
        messages: [
            '{boss}の無数の腕が{player}を優しくそっと包み込んだ…',
            '「お前のことが気に入った……私の一番のお気に入りにしてやろう」',
            'ねばねばした腕の感触が{player}の意識を遠のかせていく…'
        ],
        weight: 35
    }
];

// 8ターン毎の定期ネバネバ毒漬けイベント（永続魅了付与）
const periodicPoisonBathAction: BossAction = {
    id: 'periodic-poison-bath',
    type: ActionType.PostDefeatedAttack,
    name: '定期ネバネバ毒漬け',
    description: '定期的に体内をネバネバ毒液で満たす。浸かりすぎると病みつきになる…',
    messages: [
        '{boss}の体内に再びねばねばした毒液が分泌され始めた…',
        '「もう随分と浸かっているな……ムカデが好きになってきたか？」',
        '{player}の全身が温かいネバネバ毒液に再び包まれていく…',
        '「そうだ……もっと浸かれ……病みつきになるがいい……」',
        '何度も浸かるうち、{player}はなぜかこの感触が嫌いではなくなってきた気がする…'
    ],
    weight: 1,
    onUse: (boss: Boss, player: Player, _turn: number) => {
        player.statusEffects.addEffect(StatusEffectType.CentipedeSlime, 10);
        player.statusEffects.addEffect(StatusEffectType.CentipedePoison, 10);
        // 永続魅了は最初の1回のみ付与
        if (!boss.getCustomVariable<boolean>('permanentCharmApplied', false)) {
            boss.setCustomVariable('permanentCharmApplied', true);
            player.statusEffects.addEffect(StatusEffectType.Charm, -1);
        }
        return [];
    }
};

// ========================================
// カスタムとどめ（奥深くへ引きずり込み）
// ========================================

const deepInnerCaptureAction: BossAction = {
    id: 'deep-inner-capture',
    type: ActionType.FinishingMove,
    name: '奥深くへの引きずり込み',
    description: '体内の奥深くへと引きずり込み、永遠に閉じ込める',
    messages: [
        '{player}が力尽きたのを察知した{boss}の体内の腕が一斉に動き出した…',
        '「ほう……ついに力尽きたか。それでよい」',
        '無数の腕が{player}を体内の奥の奥へとゆっくりと引きずり込んでいく…',
        '「私の体内は気に入っただろう？これからは……ずっとここにいるがいい」',
        '{player}は異界のムカデの体内深くに完全に封じ込められてしまった…'
    ],
    weight: 1,
    onUse: (_boss: Boss, player: Player) => {
        player.statusEffects.removeEffect(StatusEffectType.Doomed);
        player.statusEffects.addEffect(StatusEffectType.Dead);
        player.statusEffects.addEffect(StatusEffectType.Eaten);
        return [];
    }
};

// ========================================
// ボスデータ定義
// ========================================

export const otherworldCentipedeData: BossData = {
    id: 'otherworld-centipede',
    name: 'OtherworldCentipede',
    displayName: '異界のムカデ',
    icon: '🐛',
    description: '辺境に現れた巨大な異界のムカデ',
    appearanceNote: '全身が深紫と黒の甲殻に覆われた巨大なムカデ。無数の腕のそれぞれに様々な道具や装置を握り、奇妙な武器として使いこなす。大きな顎と鋭い毒牙を持ち、体内に閉じ込めた獲物を特別な粘液で保管する習性がある。',
    questNote: '辺境の村に巨大なムカデが現れ、暴れまわっているという報告が届いた。冒険者を捕まえては体内に閉じ込めてしまうという噂もある。異界のムカデを討伐し、被害を食い止めてほしい。',
    maxHp: 700,
    attackPower: 15,
    actions: [
        ...otherworldCentipedeActions,
        ...otherworldCentipedeRestrainedActions,
        ...otherworldCentipedeStomachActions,
        ...captiveActions
    ],
    suppressAutoFinishingMove: true,
    explorerLevelRequired: 6,

    victoryTrophy: {
        name: '異界の甲殻片',
        description: '異界のムカデの外皮から剥がれた甲殻の欠片。深紫に輝く異様な光沢を放ち、触れると不思議な温もりがある。'
    },
    defeatTrophy: {
        name: '異界の粘液',
        description: '異界のムカデの体内で分泌された特殊な粘液。独特の甘い香りがあり、浸かりすぎるとムカデへの親しみが増すという噂がある。'
    },

    personality: [
        'ほう……？',
        'ふふ……',
        '「可愛い生き物め」',
        '「逃げられると思うたか？」',
        '「私の体内へ……来い」'
    ],

    customVariables: {
        charging: false,
        innerBodyTurn: 0,
        slimePoisonBathDone: false,
        defeatStartTurn: -1,
        permanentCharmApplied: false
    },

    battleStartMessages: [
        {
            speaker: 'player',
            style: 'default',
            text: '辺境の荒れ地に足を踏み入れると、地面が微かに揺れている…'
        },
        {
            speaker: 'system',
            style: 'default',
            text: '地中から巨大な多脚の生物が這い出してきた！無数の腕に様々な道具を握っている！'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: 'ほう……？可愛い生き物がまた私を倒しに来たな。'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: '私を倒してみせよ、さもなくば食ってやろう。'
        }
    ],

    victoryMessages: [
        {
            speaker: 'boss',
            style: 'default',
            text: 'ぐぅ……やられた、降参だ！'
        },
        {
            speaker: 'system',
            style: 'default',
            text: '異界のムカデは悔しそうに体をのたくらせ、地中へと潜っていった。'
        },
        {
            speaker: 'system',
            style: 'default',
            text: 'どうやら今回は諦めたようだ。しかし……また戻ってくるかもしれない。'
        }
    ],

    // ========================================
    // AI戦略
    // ========================================
    aiStrategy: (boss: Boss, player: Player, turn: number): BossAction => {

        // ------ 体当たり炸裂（2ターン溜め後）------
        const charging = boss.getCustomVariable<boolean>('charging', false);
        if (charging) {
            boss.setCustomVariable('charging', false);
            return {
                id: 'body-slam',
                type: ActionType.Attack,
                name: '体当たり',
                description: '全体重をかけた強烈な体当たり',
                damageFormula: (user: Boss) => user.attackPower * 3.0,
                hitRate: 0.80,
                weight: 1,
                messages: [
                    '「くらえ！」',
                    '{boss}が全体重を乗せた猛烈な体当たりを繰り出した！',
                    '巨大な体が{player}に直撃する！'
                ]
            };
        }

        // ------ 敗北後：体内捕囚ループ ------
        if (player.isDefeated()) {
            const defeatStartTurn = boss.getCustomVariable<number>('defeatStartTurn', -1);
            if (defeatStartTurn === -1) {
                boss.setCustomVariable('defeatStartTurn', turn);
            }

            const turnsSinceDefeat = turn - boss.getCustomVariable<number>('defeatStartTurn', turn);
            if (turnsSinceDefeat > 0 && turnsSinceDefeat % 8 === 0) {
                return periodicPoisonBathAction;
            }

            const totalWeight = captiveActions.reduce((sum, a) => sum + a.weight, 0);
            let rand = Math.random() * totalWeight;
            for (const action of captiveActions) {
                rand -= action.weight;
                if (rand <= 0) return action;
            }
            return captiveActions[0];
        }

        // ------ 食べられ状態 ------
        if (player.isEaten()) {
            // Doomed状態ならカスタムとどめ
            if (player.isDoomed()) {
                return deepInnerCaptureAction;
            }

            // 体内ターンカウンター更新
            const innerBodyTurn = boss.getCustomVariable<number>('innerBodyTurn', 0) + 1;
            boss.setCustomVariable('innerBodyTurn', innerBodyTurn);

            // 3ターン目以降、ネバネバ毒漬けイベントを一回発動
            const slimePoisonBathDone = boss.getCustomVariable<boolean>('slimePoisonBathDone', false);
            if (innerBodyTurn >= 3 && !slimePoisonBathDone) {
                return internalSlimePoisonBathAction;
            }

            // 通常の体内アクションをランダム選択
            const totalWeight = otherworldCentipedeStomachActions.reduce((sum, a) => sum + a.weight, 0);
            let rand = Math.random() * totalWeight;
            for (const action of otherworldCentipedeStomachActions) {
                rand -= action.weight;
                if (rand <= 0) return action;
            }
            return otherworldCentipedeStomachActions[0];
        }

        // ------ KO状態 ------
        if (player.isKnockedOut()) {
            if (player.isRestrained()) {
                // 拘束+KO → 80%で丸呑み
                if (Math.random() < 0.80) {
                    return {
                        id: 'eat-attack',
                        type: ActionType.EatAttack,
                        name: '丸呑み',
                        description: '力尽きた獲物を体内に取り込む',
                        messages: [
                            '「ふふ……力尽きたか。では体内に迎えてやろう」',
                            '{boss}が大きな口を開け、{player}をゆっくりと飲み込んでいく…',
                            '{player}は{boss}の体内へと引き込まれてしまった…！'
                        ],
                        weight: 1
                    };
                }
                // それ以外は締め付け
                return otherworldCentipedeRestrainedActions.find(a => a.id === 'squeeze') ?? otherworldCentipedeRestrainedActions[0];
            } else {
                // 未拘束+KO → 必ず巻き付き
                return otherworldCentipedeActions.find(a => a.id === 'wrap-up') ?? otherworldCentipedeActions[0];
            }
        }

        // ------ 拘束中 ------
        if (player.isRestrained()) {
            const totalWeight = otherworldCentipedeRestrainedActions.reduce((sum, a) => sum + a.weight, 0);
            let rand = Math.random() * totalWeight;
            for (const action of otherworldCentipedeRestrainedActions) {
                rand -= action.weight;
                if (rand <= 0) return action;
            }
            return otherworldCentipedeRestrainedActions[0];
        }

        // ------ 通常状態 ------
        // ネバネバか毒を受けている場合、巻き付きを30%追加優先
        const hasSlime = player.statusEffects.hasEffect(StatusEffectType.CentipedeSlime);
        const hasPoison = player.statusEffects.hasEffect(StatusEffectType.CentipedePoison);
        if ((hasSlime || hasPoison) && !boss.getCustomVariable<boolean>('charging', false) && Math.random() < 0.30) {
            const wrapUp = otherworldCentipedeActions.find(a => a.id === 'wrap-up');
            if (wrapUp) return wrapUp;
        }

        // 重み付きランダム選択（body-slam-prepareはcanUseで制御）
        const availableActions = otherworldCentipedeActions.filter(a => {
            if (a.canUse) return a.canUse(boss, player, turn);
            return true;
        });
        const totalWeight = availableActions.reduce((sum, a) => sum + a.weight, 0);
        let rand = Math.random() * totalWeight;
        for (const action of availableActions) {
            rand -= action.weight;
            if (rand <= 0) return action;
        }
        return availableActions[0];
    }
};
