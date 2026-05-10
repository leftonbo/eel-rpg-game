import { Player } from '@/game/entities/Player';
import { ActionType, Boss, BossAction, BossData } from '@/game/entities/Boss';
import { StatusEffectType } from '@/game/systems/StatusEffectTypes';

// =============================================================
// 通常攻撃アクション (黒ケモノは戦闘自体は得意ではない設定)
// =============================================================

const normalAttackActions: BossAction[] = [
    {
        id: 'claw-strike',
        type: ActionType.Attack,
        name: '黒爪の一撃',
        description: '毛深い両手の片方を振り下ろして殴る',
        damageFormula: (user: Boss) => user.attackPower * 1.0,
        hitRate: 0.7,
        weight: 35,
        playerStateCondition: 'normal',
        messages: [
            '{boss}が肉球の埋もれた毛深い腕を大きく振り上げ、{player}に振り下ろした！'
        ]
    },
    {
        id: 'tail-sweep',
        type: ActionType.Attack,
        name: '標識尻尾なぎ払い',
        description: '曲がった標識を絡ませた尻尾を振り回す',
        damageFormula: (user: Boss) => user.attackPower * 1.2,
        hitRate: 0.65,
        weight: 30,
        playerStateCondition: 'normal',
        messages: [
            '{boss}が標識を絡ませた長い尻尾を大きく振り回した！',
            '錆びた金属プレートが空を切り、{player}の脇をかすめていく...'
        ]
    },
    {
        id: 'gaze-pressure',
        type: ActionType.StatusAttack,
        name: '六瞳の催眠',
        description: '6つの瞳で覗き込み、抵抗意思を奪う',
        damageFormula: (user: Boss) => user.attackPower * 0.6,
        statusEffect: StatusEffectType.Charm,
        statusChance: 0.5,
        hitRate: 0.85,
        weight: 20,
        playerStateCondition: 'normal',
        messages: [
            '{boss}は丸い顔ごと{player}を覗き込んだ。',
            '左右の赤い大瞳と、その外側にある4つの白くて黒目のない瞳が、{player}の頭に「止まれ」「戻れ」「進め」と囁き始める...'
        ]
    },
    {
        id: 'paw-grab-attempt',
        type: ActionType.RestraintAttack,
        name: '両手で捕獲',
        description: '毛深い両手で{player}を抱え込もうとする',
        weight: 12,
        hitRate: 0.55,
        playerStateCondition: 'normal',
        canUse: (_boss: Boss, player: Player, _turn: number) => {
            return !player.isRestrained()
                && !player.isEaten()
                && !player.statusEffects.hasEffect(StatusEffectType.SignBound);
        },
        messages: [
            '{boss}が大きな黒い両手をぬっと伸ばして{player}を抱え込もうとしてきた！'
        ]
    }
];

// =============================================================
// 標識ウォームアップアクション (5ターン毎に発動)
// =============================================================

const signWarmupNoEntryAction: BossAction = {
    id: 'sign-warmup-no-entry',
    type: ActionType.Skip,
    name: '進入禁止標識を提示',
    description: '尻尾から外した「進入禁止」標識を{player}に見せつける',
    weight: 1,
    messages: [
        '{boss}が尻尾の標識から「進入禁止」の赤白プレートを外し、{player}の正面にゆっくりと掲げた。',
        '標識の周りで空気が歪み、見えない壁の気配が漂う...'
    ],
    onUse: (boss: Boss) => {
        boss.setCustomVariable('pendingSign', 'no-entry');
        return [];
    }
};

const signWarmupArrowAction: BossAction = {
    id: 'sign-warmup-arrow',
    type: ActionType.Skip,
    name: '矢印標識を提示',
    description: '矢印標識を自身の口元に向けて{player}に見せつける',
    weight: 1,
    messages: [
        '{boss}が黄色い矢印標識を尻尾から外し、矢印の先を裂けるほど大きな口に向けた。',
        '矢印の指す先に、薄く光る道筋がふわりと浮かび上がる...'
    ],
    onUse: (boss: Boss) => {
        boss.setCustomVariable('pendingSign', 'arrow');
        return [];
    }
};

const signWarmupDangerAction: BossAction = {
    id: 'sign-warmup-danger',
    type: ActionType.Skip,
    name: '危険標識を提示',
    description: '危険標識を{player}に見せつける',
    weight: 1,
    messages: [
        '{boss}が赤縁の「危険」標識を尻尾から外し、{player}に向けて高々と掲げた！',
        '標識の絵柄が黒い炎のようにゆらぎ、嫌な予感が辺りに満ちる...'
    ],
    onUse: (boss: Boss) => {
        boss.setCustomVariable('pendingSign', 'danger');
        boss.setCustomVariable('dangerVariant', Math.random() < 0.5 ? 1 : 2);
        return [];
    }
};

// =============================================================
// 標識エフェクトアクション (ウォームアップの次ターンに発動)
// =============================================================

const signEffectNoEntryBindAction: BossAction = {
    id: 'sign-effect-no-entry-bind',
    type: ActionType.StatusAttack,
    name: '進入禁止発動',
    description: '攻撃に踏み込んだ{player}を進入禁止の壁が押さえ込む',
    weight: 1,
    statusEffect: StatusEffectType.SignBound,
    statusChance: 1.0,
    hitRate: 1.0,
    messages: [
        '攻撃に踏み込もうとした{player}の前に、突如として透明な「進入禁止」の壁がせり上がった！',
        '{boss}は満足そうに喉を低く鳴らしている...'
    ]
};

const signEffectNoEntryFailAction: BossAction = {
    id: 'sign-effect-no-entry-fail',
    type: ActionType.Skip,
    name: '進入禁止不発',
    description: '身を引いた{player}には標識の効果が発動しない',
    weight: 1,
    messages: [
        '身構えて踏み込まなかった{player}の前で、進入禁止の壁は形を成さなかった...',
        '{boss}は「ガウ...」と残念そうに耳を伏せた。'
    ]
};

const signEffectArrowEatAction: BossAction = {
    id: 'sign-effect-arrow-eat',
    type: ActionType.EatAttack,
    name: '矢印誘導丸呑み',
    description: '矢印に沿って引き寄せられた{player}を一気に丸呑みにする',
    weight: 1,
    messages: [
        '一歩動きを止めた{player}の足元に、矢印の光線がまっすぐ走った！',
        '矢印に沿って{player}の体が滑るように{boss}の口元へ引き寄せられていく...',
        '{boss}は裂けるほど大きな口を開け、{player}を真紅の体内に飲み込んだ！'
    ],
    onUse: (_boss: Boss, player: Player) => {
        if (player.isRestrained()) {
            player.statusEffects.removeEffect(StatusEffectType.Restrained);
        }
        return [];
    }
};

const signEffectArrowFailAction: BossAction = {
    id: 'sign-effect-arrow-fail',
    type: ActionType.Skip,
    name: '矢印不発',
    description: '攻撃で矢印が乱され、ボスが驚いて固まる',
    weight: 1,
    messages: [
        '{player}の踏み込みで矢印の光線が断ち切られた！',
        '{boss}は丸い顔の瞳をきょろきょろさせ、矢印標識を抱えたまま固まってしまった...'
    ]
};

const signEffectDangerPierceAction: BossAction = {
    id: 'sign-effect-danger-pierce',
    type: ActionType.Attack,
    name: '危険標識落下',
    description: '頭上に転送された巨大標識が{player}を直撃する',
    weight: 1,
    damageFormula: (user: Boss) => user.attackPower * 2.0,
    hitRate: 0.85,
    criticalRate: 0.1,
    messages: [
        '{player}の頭上の空間に「落下注意」の巨大な標識が突如として転送された！',
        '錆びた金属プレートが重力に従って{player}に向けて真っ直ぐに落ちてくる！'
    ]
};

const signEffectDangerShockAction: BossAction = {
    id: 'sign-effect-danger-shock',
    type: ActionType.Attack,
    name: '危険標識放電',
    description: '高電圧標識から走った電撃が{player}を貫く',
    weight: 1,
    damageFormula: (user: Boss) => user.attackPower * 1.9,
    hitRate: 0.85,
    criticalRate: 0.1,
    statusEffect: StatusEffectType.Stunned,
    statusChance: 0.3,
    messages: [
        '{boss}が掲げた「高電圧危険」標識から、青白い火花が一気に膨れ上がる！',
        '迸る電撃が{player}の全身を貫いて駆け抜けた！'
    ]
};

// =============================================================
// 拘束中行動
// =============================================================

const restrainedActions: BossAction[] = [
    {
        id: 'dual-paw-squeeze',
        type: ActionType.Attack,
        name: '両手で締め付け',
        description: '抱え込んだ{player}を毛深い両腕でじわじわ締め上げる',
        damageFormula: (user: Boss) => user.attackPower * 1.1,
        hitRate: 0.95,
        weight: 35,
        playerStateCondition: 'restrained',
        messages: [
            '{boss}は毛深い両手で{player}をぎゅうぎゅうと締め付けている...'
        ]
    },
    {
        id: 'tongue-licking',
        type: ActionType.StatusAttack,
        name: '裂け口舐め',
        description: '裂けるほど大きな口で{player}を一面に舐め回す',
        damageFormula: (user: Boss) => user.attackPower * 0.8,
        hitRate: 0.95,
        statusEffect: StatusEffectType.Slimed,
        statusChance: 0.6,
        weight: 30,
        playerStateCondition: 'restrained',
        messages: [
            '{boss}が裂けるほど大きな口を開け、生暖かい舌で{player}の全身をベロリと舐め上げた...',
            '甘く金属的な唾液が{player}にまとわりつく...'
        ]
    },
    {
        id: 'gaze-pressure-restrained',
        type: ActionType.StatusAttack,
        name: '至近距離の催眠',
        description: '抱え込んだ獲物に6つの瞳を近づけて見つめる',
        damageFormula: (user: Boss) => user.attackPower * 0.5,
        hitRate: 0.95,
        statusEffect: StatusEffectType.Charm,
        statusChance: 0.7,
        weight: 25,
        playerStateCondition: 'restrained',
        messages: [
            '{boss}は丸い顔を{player}にぴたりと近づけ、6つの瞳でじっと見つめてくる...',
            '頭の中に「動くな」「進め」「我のもの」という囁きが満ちていく...'
        ]
    }
];

// =============================================================
// 拘束＋KO 状態の専用丸呑み (持ち上げて落とす)
// =============================================================

const liftAndDropSwallowAction: BossAction = {
    id: 'lift-and-drop-swallow',
    type: ActionType.EatAttack,
    name: '持ち上げ落下丸呑み',
    description: '抱え上げた{player}を裂け口の真上から落として丸呑みにする',
    weight: 1,
    messages: [
        '{boss}が抱え込んだ{player}を高々と持ち上げ、自分の頭上にかざした！',
        '裂けるほど大きな口の真上から、{player}が真紅の体内へぽとりと落ちていく...',
        '{boss}は満足そうに口を閉じ、{player}を完全に飲み込んだ。'
    ]
};

const directSwallowAction: BossAction = {
    id: 'direct-swallow',
    type: ActionType.EatAttack,
    name: '直接丸呑み',
    description: '抵抗できない{player}を直接抱え上げて飲み込む',
    weight: 1,
    messages: [
        '{boss}が動けない{player}を毛深い腕でひょいと抱え上げ、裂け口の真上に運んでいく...',
        '真紅の体内へ{player}が落とし込まれていく...'
    ]
};

// SignBound 中の確定拘束
const pawGrabSignBoundAction: BossAction = {
    id: 'paw-grab-signbound',
    type: ActionType.RestraintAttack,
    name: '両手で確保',
    description: '進入禁止で動けない{player}を確実に抱え込む',
    weight: 1,
    hitRate: 1.0,
    messages: [
        '進入禁止の壁に押さえつけられて動けない{player}に、{boss}が大きな黒い両手をゆっくり伸ばしてきた...',
        '{boss}は{player}を毛深い両腕にすっぽりと抱え込んだ！'
    ]
};

// =============================================================
// 丸呑み中行動 (体内攻撃)
// =============================================================

const eatenActions: BossAction[] = [
    {
        id: 'internal-squeeze',
        type: ActionType.DevourAttack,
        name: '体内締め付け',
        description: '温かい壁が規則的に収縮して{player}を圧迫する',
        damageFormula: (user: Boss) => user.attackPower * 1.2,
        weight: 30,
        playerStateCondition: 'eaten',
        messages: [
            '真紅の柔らかい壁が一斉に収縮し、{player}の全身を均等に締め付ける...',
            '温かな圧迫が{player}から少しずつ生気を吸い上げていく...'
        ]
    },
    {
        id: 'internal-massage',
        type: ActionType.DevourAttack,
        name: '体内マッサージ',
        description: '温かい壁が波打ちながら{player}を揉みほぐす',
        damageFormula: (user: Boss) => user.attackPower * 1.0,
        weight: 30,
        playerStateCondition: 'eaten',
        messages: [
            '体内の温かい壁が波打ちながら{player}を揉みほぐしていく...',
            '甘い金属臭の粘液が肌に染み込み、{player}の魔力が滲み出していく...'
        ]
    },
    {
        id: 'internal-roll',
        type: ActionType.DevourAttack,
        name: '体内転がし',
        description: '蠕動が向きを変え{player}を転がし続ける',
        damageFormula: (user: Boss) => user.attackPower * 1.1,
        weight: 25,
        playerStateCondition: 'eaten',
        messages: [
            '体内の蠕動が一気に向きを変え、{player}が真紅の壁の間でくるくると転がされる...',
            '{boss}は「グルル...♪」と低く喉を鳴らして楽しんでいる...'
        ]
    },
    {
        id: 'mucus-soak',
        type: ActionType.DevourAttack,
        name: '粘液漬け',
        description: '甘い真紅の粘液で{player}を全身漬けにする',
        damageFormula: (user: Boss) => user.attackPower * 0.85,
        statusEffect: StatusEffectType.Slimed,
        statusChance: 0.85,
        weight: 25,
        playerStateCondition: 'eaten',
        messages: [
            '体内の粘液腺が一斉に開き、甘く金属的な粘液が真紅の空間に流れ込む...',
            '{player}は温かい粘液にどっぷりと浸かり、身動きすら緩やかになっていく...'
        ]
    }
];

// =============================================================
// カスタムとどめ (KO=最大HP0 → 所有マーク巻きつけ)
// =============================================================

const ownershipMarkingAction: BossAction = {
    id: 'ownership-marking',
    type: ActionType.FinishingMove,
    name: '所有マーク巻きつけ',
    description: '力尽きた{player}に青い所有マークを巻きつけ、自分のものとする',
    weight: 1,
    messages: [
        '{boss}は体内の{player}が完全に力尽きたのを感じ取り、低く満足そうに唸った...',
        '真紅の壁から青く光るリボン状の標識マークがするりと現れ、{player}の体に何重にも巻きついていく...',
        '「クルル...♪」 {boss}は{player}に「所有マーク」をしっかりと刻みつけた。',
        '{player}はもう自分の意思で動くことはできない...'
    ],
    onUse: (_boss: Boss, player: Player) => {
        player.statusEffects.removeEffect(StatusEffectType.Doomed);
        player.statusEffects.addEffect(StatusEffectType.Dead);
        if (!player.isEaten()) {
            player.statusEffects.addEffect(StatusEffectType.Eaten);
        }
        player.statusEffects.addEffect(StatusEffectType.OwnershipMark);
        return [];
    }
};

// =============================================================
// KO 後フェイズ 1: 体内・優しい行動
// =============================================================

const postPhase1Actions: BossAction[] = [
    {
        id: 'phase1-gentle-massage',
        type: ActionType.PostDefeatedAttack,
        name: 'やさしい体内マッサージ',
        description: '温かい壁がそっと収縮し、{player}を優しく揉みほぐす',
        weight: 1,
        messages: [
            '真紅の壁が呼吸のように緩やかに収縮し、{player}を優しく揉みほぐしていく...',
            '甘い金属臭の粘液が肌に染みこみ、{player}は深く沈み込んでいく...'
        ]
    },
    {
        id: 'phase1-cradle-rocking',
        type: ActionType.PostDefeatedAttack,
        name: '体内であやす',
        description: '蠕動が揺りかごのように{player}を抱きとる',
        weight: 1,
        messages: [
            '蠕動の波がふわりと向きを揃え、{player}を揺りかごのように抱きとる...',
            '外から「クルル...クルル...♪」と{player}をあやす{boss}の声が漏れている...'
        ]
    },
    {
        id: 'phase1-warm-mucus-bath',
        type: ActionType.PostDefeatedAttack,
        name: '甘い粘液浴',
        description: '甘い粘液が滴り、{player}を全身丁寧に包み込む',
        weight: 1,
        messages: [
            '体内の粘液腺から温かい真紅の粘液がたっぷりと滴り、{player}の全身を丁寧に包んでいく...',
            '甘い金属の匂いが{player}を心地よく満たしていく...'
        ]
    },
    {
        id: 'phase1-slow-peristalsis',
        type: ActionType.PostDefeatedAttack,
        name: 'ゆるやかな蠕動',
        description: 'ゆったりとした蠕動が{player}を奥から手前へと運ぶ',
        weight: 1,
        messages: [
            'ゆるやかな蠕動が{player}を体内の奥から手前へ、また奥へと丁寧に運んでいる...',
            '{player}に巻きついた所有マークが、粘液の中で静かに青く光り続けている...'
        ]
    },
    {
        id: 'phase1-lullaby-hum',
        type: ActionType.PostDefeatedAttack,
        name: '体内に響く子守唄',
        description: '黒ケモノの低い唸りが体内を子守唄のように震わせる',
        weight: 1,
        messages: [
            '{boss}の低い唸り声が体内の壁を伝い、子守唄のように{player}を包む...',
            '「グルル...クルル...♪」 黒ケモノは{player}を大切な「保管物」として扱っている...'
        ]
    }
];

// =============================================================
// KO 後フェイズ 2: 外で抱きしめ
// =============================================================

const postPhase2Actions: BossAction[] = [
    {
        id: 'phase2-tight-embrace',
        type: ActionType.PostDefeatedAttack,
        name: '毛深い腕で抱きしめ',
        description: '黒い毛むくじゃらの両腕で{player}をぎゅっと抱きしめる',
        weight: 1,
        messages: [
            '{boss}は{player}を黒い毛むくじゃらの両腕でぎゅっと抱きしめている...',
            '深い黒の毛が{player}を底なしの夜のように包み込む...'
        ]
    },
    {
        id: 'phase2-head-petting',
        type: ActionType.PostDefeatedAttack,
        name: '頭を撫でる',
        description: '大きな黒い手のひらが{player}の頭をゆっくり撫でる',
        weight: 1,
        messages: [
            '{boss}は大きな黒い手のひらで{player}の頭を何度もゆっくり撫でている...',
            '肉球の埋もれた毛深い手から、温かさだけが{player}に伝わってくる...'
        ]
    },
    {
        id: 'phase2-gentle-licking',
        type: ActionType.PostDefeatedAttack,
        name: '頬を舐める',
        description: '丸い顔を寄せ、{player}の頬を生暖かい舌で舐める',
        weight: 1,
        messages: [
            '{boss}は丸い顔を寄せ、生暖かい舌で{player}の頬をぺろぺろと舐めている...',
            '甘く金属的な唾液が、所有マークと一緒に{player}に染みこんでいく...'
        ]
    },
    {
        id: 'phase2-cheek-rubbing',
        type: ActionType.PostDefeatedAttack,
        name: '頬擦り',
        description: '黒い丸顔を{player}に擦りつける',
        weight: 1,
        messages: [
            '{boss}は丸いぬいぐるみのような顔を{player}にぐりぐりと擦りつけている...',
            '深い黒の毛が肌をくすぐり、{player}の意識をふんわりと溶かしていく...'
        ]
    },
    {
        id: 'phase2-whispered-mark',
        type: ActionType.PostDefeatedAttack,
        name: '所有マークを撫でつける',
        description: '所有マークの上から黒い手で何度も撫でつける',
        weight: 1,
        messages: [
            '{boss}は{player}に巻きついた青い所有マークを、毛深い手のひらで何度も撫でつけている...',
            'マークが黒ケモノの体温で温まり、{player}の中にしっかりと根づいていく...'
        ]
    }
];

// =============================================================
// フェイズ切替アクション
// =============================================================

const spitAndHugAction: BossAction = {
    id: 'spit-and-hug',
    type: ActionType.PostDefeatedAttack,
    name: '吐き出して抱きしめ',
    description: '{player}を口から取り出し、両腕でしっかり抱きしめる',
    weight: 1,
    messages: [
        '{boss}が裂けるほど大きな口を開け、真紅の体内から{player}をそっと舌に乗せて取り出した...',
        '甘い粘液まみれの{player}を、{boss}は黒い毛むくじゃらの両腕でしっかりと抱きしめる...',
        '青い所有マークが粘液越しにきらりと光り、{boss}は{player}に頬擦りを始めた。'
    ],
    onUse: (_boss: Boss, player: Player) => {
        player.statusEffects.removeEffect(StatusEffectType.Eaten);
        return [];
    }
};

const bellyReswallowAction: BossAction = {
    id: 'belly-reswallow',
    type: ActionType.PostDefeatedAttack,
    name: '再丸呑み',
    description: '抱きしめていた{player}を再び体内へと飲み込む',
    weight: 1,
    messages: [
        '{boss}が抱きしめていた{player}を高々と持ち上げ、裂けるほど大きな口を開いた...',
        '所有マークの輝きと共に、{player}が真紅の体内へとゆっくり落とし込まれていく...',
        '{boss}はまた{player}を体内に「保管」してしまった。'
    ],
    onUse: (_boss: Boss, player: Player) => {
        if (!player.isEaten()) {
            player.statusEffects.addEffect(StatusEffectType.Eaten);
        }
        return [];
    }
};

// =============================================================
// すべてのアクションを統合
// =============================================================

const fluffyNoirActions: BossAction[] = [
    ...normalAttackActions,
    pawGrabSignBoundAction,
    signWarmupNoEntryAction,
    signWarmupArrowAction,
    signWarmupDangerAction,
    signEffectNoEntryBindAction,
    signEffectNoEntryFailAction,
    signEffectArrowEatAction,
    signEffectArrowFailAction,
    signEffectDangerPierceAction,
    signEffectDangerShockAction,
    ...restrainedActions,
    liftAndDropSwallowAction,
    directSwallowAction,
    ...eatenActions,
    ownershipMarkingAction,
    ...postPhase1Actions,
    ...postPhase2Actions,
    spitAndHugAction,
    bellyReswallowAction
];

// =============================================================
// AI 戦略
// =============================================================

const pickWeighted = (actions: BossAction[]): BossAction => {
    const total = actions.reduce((sum, a) => sum + a.weight, 0);
    let r = Math.random() * total;
    for (const a of actions) {
        r -= a.weight;
        if (r <= 0) return a;
    }
    return actions[0];
};

const pickSignWarmup = (): BossAction => {
    const choices = [signWarmupNoEntryAction, signWarmupArrowAction, signWarmupDangerAction];
    return choices[Math.floor(Math.random() * choices.length)];
};

const aiStrategy = (boss: Boss, player: Player, _turn: number): BossAction => {
    // 1. Doomed (最大HP=0だがまだ Dead 化していない) → カスタムとどめで所有マーク付与
    if (player.isDoomed() && !player.isDefeated()) {
        return ownershipMarkingAction;
    }

    // 2. Defeated (Dead 状態) → KO 後フェーズ管理
    if (player.isDefeated()) {
        let postDefeatedTurn = boss.getCustomVariable<number>('postDefeatedTurn') ?? 0;
        const postDefeatedPhase = boss.getCustomVariable<number>('postDefeatedPhase') ?? 1;
        postDefeatedTurn += 1;
        boss.setCustomVariable('postDefeatedTurn', postDefeatedTurn);

        if (postDefeatedTurn % 8 === 0) {
            if (postDefeatedPhase === 1) {
                boss.setCustomVariable('postDefeatedPhase', 2);
                return spitAndHugAction;
            }
            boss.setCustomVariable('postDefeatedPhase', 1);
            return bellyReswallowAction;
        }

        const phaseActions = postDefeatedPhase === 1 ? postPhase1Actions : postPhase2Actions;
        return pickWeighted(phaseActions);
    }

    // 3. 標識エフェクト発動 (前ターンのウォームアップを受けて)
    const pendingSign = boss.getCustomVariable<string | null>('pendingSign') ?? null;
    if (pendingSign) {
        boss.setCustomVariable('pendingSign', null);

        const isPlayerDefending = player.statusEffects.hasEffect(StatusEffectType.Defending);

        if (pendingSign === 'no-entry') {
            return isPlayerDefending ? signEffectNoEntryFailAction : signEffectNoEntryBindAction;
        }
        if (pendingSign === 'arrow') {
            // 防御=非攻撃時のみ丸呑みが発動。それ以外はボスがびっくりして不発
            if (isPlayerDefending && !player.isEaten() && !player.isRestrained()) {
                return signEffectArrowEatAction;
            }
            return signEffectArrowFailAction;
        }
        if (pendingSign === 'danger') {
            const variant = boss.getCustomVariable<number>('dangerVariant') ?? 1;
            return variant === 2 ? signEffectDangerShockAction : signEffectDangerPierceAction;
        }
    }

    // 4. 食べられ状態 (敗北前: 矢印で丸呑みされた直後など)
    if (player.isEaten()) {
        return pickWeighted(eatenActions);
    }

    // 5. KO 状態 (HP=0、まだ doomed ではない)
    if (player.isKnockedOut()) {
        if (player.isRestrained()) {
            return liftAndDropSwallowAction;
        }
        if (Math.random() < 0.7) {
            return pawGrabSignBoundAction;
        }
        return directSwallowAction;
    }

    // 6. 拘束中
    if (player.isRestrained()) {
        return pickWeighted(restrainedActions);
    }

    // 7. SignBound 中 → 確定拘束狙い
    if (player.statusEffects.hasEffect(StatusEffectType.SignBound)) {
        return pawGrabSignBoundAction;
    }

    // 8. 通常状態: 5ターン毎に標識ウォームアップ。それ以外は通常攻撃
    let normalTurnCounter = boss.getCustomVariable<number>('normalTurnCounter') ?? 0;
    normalTurnCounter += 1;
    boss.setCustomVariable('normalTurnCounter', normalTurnCounter);

    if (normalTurnCounter % 5 === 0) {
        return pickSignWarmup();
    }

    return pickWeighted(normalAttackActions);
};

// =============================================================
// BossData
// =============================================================

export const fluffyNoirData: BossData = {
    id: 'fluffy-noir',
    name: 'FluffyNoir',
    displayName: '怪異の黒ケモノ',
    icon: '⛔',
    description: '標識に宿る怪異',
    appearanceNote: '漆黒の長毛をまとった、二足歩行のオオカミ系巨大ケモノ。ぬいぐるみのように丸い顔、左右一対の赤い大瞳とその外側に2つずつの白くて黒目のない瞳、肉球が埋もれるほど毛深い手、長い尻尾に絡む曲がった道路標識、裂けるほど大きな口と真紅にほのかに光る体内。',
    questNote: '廃棄工場跡で、「標識住み」の怪異の目撃情報が相次いでいる。その情報を確かめ、討伐してほしい。気をつけろ……その怪異は標識を操り、縄張りに入るものを一呑みにしてしまうといわれている。',
    maxHp: 720,
    attackPower: 16,
    actions: fluffyNoirActions,
    suppressAutoFinishingMove: true,
    explorerLevelRequired: 6,

    victoryTrophy: {
        name: '曲がった危険標識',
        description: '黒ケモノの尻尾に絡みついていた危険標識。示される図柄は非常に抽象的で、何の危険を示すか分からない。'
    },
    defeatTrophy: {
        name: '黒ケモノの標識リボン',
        description: '黒ケモノの示すような図柄が描かれた、黒ケモノの所有物であることを示す標識の着いたリボン。体に付けて夜を過ごすと黒ケモノが察知してやってくるらしい。'
    },

    personality: [
        '「ガウ...」',
        '「グルル...♪」',
        '「クルル...クルル...」',
        '「ウォオ...」',
        '（黒ケモノは標識をくるりと回し、無言で「進入禁止」を示している）',
        '（黒ケモノは赤い大瞳で{player}をじっと見つめている）'
    ],

    customVariables: {
        pendingSign: null,
        dangerVariant: 0,
        normalTurnCounter: 0,
        postDefeatedTurn: 0,
        postDefeatedPhase: 1
    },

    battleStartMessages: [
        {
            speaker: 'player',
            style: 'default',
            text: '廃棄工場跡の入口、転がる標識の山の奥から、底なしの黒い影がぬっと立ち上がった。'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「ガウ...」'
        },
        {
            speaker: 'system',
            style: 'default',
            text: '深い黒の長毛をまとった巨大な二足歩行のケモノが、赤い大瞳と4つの白い小瞳でこちらを見下ろしている。'
        }
    ],

    victoryMessages: [
        {
            speaker: 'boss',
            style: 'talk',
            text: '「ガウゥ...」'
        },
        {
            speaker: 'system',
            style: 'default',
            text: '黒ケモノはしょんぼりと耳を伏せ、尻尾の標識を抱え直しながら廃棄工場の奥へと退いていった...'
        },
        {
            speaker: 'system',
            style: 'default',
            text: '頭の中に響いていた「止まれ」「戻れ」「進め」の囁きも、ふっと消えていった。'
        }
    ],

    aiStrategy: aiStrategy
};
