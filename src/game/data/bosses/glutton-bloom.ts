import { Boss, BossAction, BossData, ActionType } from '../../entities/Boss';
import type { Player } from '../../entities/Player';
import { StatusEffectType } from '../../systems/StatusEffectTypes';

const selectWeightedAction = (actions: BossAction[]): BossAction => {
    const totalWeight = actions.reduce((sum, action) => sum + action.weight, 0);
    let random = Math.random() * totalWeight;

    for (const action of actions) {
        random -= action.weight;
        if (random <= 0) {
            return action;
        }
    }

    return actions[0];
};

const gluttonBloomNormalActions: BossAction[] = [
    {
        id: 'thorn-vine-lash',
        type: ActionType.Attack,
        name: '棘蔓のしなり打ち',
        description: '棘のついた蔓でしなるように打ち据える',
        messages: [
            '{boss}の蔓が鞭のようにしなり、{player}を打ち据えた！',
            '棘についた甘い樹液が、じわりと肌に残る...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.0,
        hitRate: 0.92,
        weight: 30,
        playerStateCondition: 'normal'
    },
    {
        id: 'snap-blossom-bite',
        type: ActionType.Attack,
        name: '捕食花の噛みつき',
        description: '花弁を顎のように閉じて噛みつく',
        messages: [
            '「ぱくり、の練習なのよ」',
            '{boss}が大きな花弁を顎のように閉じ、{player}へ噛みついた！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.35,
        hitRate: 0.82,
        weight: 20,
        playerStateCondition: 'normal'
    },
    {
        id: 'honeyed-nectar-mist',
        type: ActionType.StatusAttack,
        name: '蜜香ミスト',
        description: '甘い花蜜の霧で集中を奪う',
        messages: [
            '{boss}の花冠から金色の霧がふわりと広がる...',
            '甘すぎる香りが{player}の判断を鈍らせる！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.65,
        hitRate: 0.95,
        statusEffect: StatusEffectType.Charm,
        statusChance: 0.45,
        weight: 25,
        playerStateCondition: 'normal'
    },
    {
        id: 'digestive-sap-splash',
        type: ActionType.StatusAttack,
        name: '消化樹液しぶき',
        description: '粘つく樹液を浴びせて動きを鈍らせる',
        messages: [
            '{boss}が葉の隙間から琥珀色の樹液を弾けさせた！',
            '{player}は甘く粘つく樹液を浴びてしまった...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.75,
        hitRate: 0.9,
        statusEffect: StatusEffectType.Slimed,
        statusChance: 0.85,
        weight: 25,
        playerStateCondition: 'normal'
    },
    {
        id: 'root-vine-snare',
        type: ActionType.RestraintAttack,
        name: '根蔓の捕獲',
        description: '地面から伸びる根と蔓で獲物を絡め取る',
        messages: [
            '「逃げ足の速い子は、根っこから絡めるの」',
            '足元の土が割れ、根と蔓が{player}を絡め取った！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.8,
        hitRate: 0.86,
        weight: 18,
        playerStateCondition: 'normal',
        canUse: (_boss: Boss, player: Player) => {
            return !player.isRestrained() && !player.isCocoon() && !player.isEaten();
        }
    }
];

const greenhouseOvergrowthAction: BossAction = {
    id: 'greenhouse-overgrowth',
    type: ActionType.StatusAttack,
    name: '飢えた温室',
    description: '周囲の蔓を一斉に繁茂させ、甘い花粉で獲物を包む',
    messages: [
        '「そろそろ温室を閉める時間ね」',
        '{boss}が花芯を震わせると、周囲の蔓が一斉に繁茂した！',
        '濃い花粉と樹液の匂いが戦場を満たしていく...'
    ],
    damageFormula: (user: Boss) => user.attackPower * 1.1,
    hitRate: 1.0,
    statusEffect: StatusEffectType.Slimed,
    statusChance: 1.0,
    weight: 1,
    playerStateCondition: 'normal',
    onUse: (boss: Boss, player: Player) => {
        boss.setCustomVariable('hasUsedOvergrowth', true);
        player.statusEffects.addEffect(StatusEffectType.Lethargy, 4);
        return ['{player}の体に花粉がまとわりつき、まぶたが重くなる...'];
    }
};

const gluttonBloomRestrainedActions: BossAction[] = [
    {
        id: 'vine-squeeze',
        type: ActionType.Attack,
        name: '蔓締め',
        description: '絡め取った蔓をゆっくり締める',
        messages: [
            '{boss}の蔓が{player}をゆっくり締めつける...',
            '「暴れるほど、よく味がしみるのよ」'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.05,
        hitRate: 0.96,
        weight: 35,
        playerStateCondition: 'restrained'
    },
    {
        id: 'nectar-basting',
        type: ActionType.StatusAttack,
        name: '花蜜漬け',
        description: '拘束した獲物に花蜜をまとわせる',
        messages: [
            '{boss}の花弁からとろりとした蜜が落ち、{player}を包んでいく...',
            '甘い香りが濃くなり、抵抗する気持ちがふわついてしまう。'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.85,
        hitRate: 0.95,
        statusEffect: StatusEffectType.Slimed,
        statusChance: 1.0,
        weight: 30,
        playerStateCondition: 'restrained'
    },
    {
        id: 'pollen-lullaby',
        type: ActionType.StatusAttack,
        name: '花粉の子守唄',
        description: '眠気を誘う花粉を吹きかける',
        messages: [
            '「怖がらなくていいの。蕾の中はあたたかいわ」',
            '{boss}が淡い花粉を吹きかけ、{player}の力を抜いていく...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.7,
        hitRate: 0.94,
        statusEffect: StatusEffectType.Lethargy,
        statusChance: 0.8,
        weight: 25,
        playerStateCondition: 'restrained'
    },
    {
        id: 'bud-cradle',
        type: ActionType.CocoonAttack,
        name: '蕾ゆりかご',
        description: '拘束した獲物を巨大な蕾で包む',
        messages: [
            '{boss}の足元から肉厚な花弁が伸び、{player}を包み始める！',
            '「少し寝かせて、甘くしてからいただくわ」'
        ],
        weight: 1,
        playerStateCondition: 'restrained'
    }
];

const gluttonBloomCocoonActions: BossAction[] = [
    {
        id: 'bud-compression',
        type: ActionType.CocoonAction,
        name: '蕾の圧縮',
        description: '蕾の花弁を閉じてじわじわ養分を奪う',
        messages: [
            '蕾の花弁がきゅっと閉じ、{player}をやわらかく押し包む...',
            '外では{boss}が満足げに葉を揺らしている。'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.85,
        weight: 35,
        playerStateCondition: 'cocoon'
    },
    {
        id: 'sap-circulation',
        type: ActionType.CocoonAction,
        name: '樹液循環',
        description: '蕾の中へ樹液を巡らせて栄養を吸い上げる',
        messages: [
            '蕾の内部を温かな樹液が満たし、{player}の力を少しずつ吸い上げる...',
            '「いい養分ね。葉先までしゃきっとするわ」'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.05,
        healRatio: 1.0,
        weight: 25,
        playerStateCondition: 'cocoon'
    },
    {
        id: 'dream-pollen-in-bud',
        type: ActionType.CocoonAction,
        name: '蕾内花粉',
        description: '蕾の中で甘い花粉を満たす',
        messages: [
            '蕾の内側で淡い花粉が舞い、{player}の思考をふんわり包んでいく...',
            '外から聞こえる葉擦れが、妙に心地よい。'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.7,
        statusEffect: StatusEffectType.Charm,
        statusChance: 0.75,
        weight: 25,
        playerStateCondition: 'cocoon'
    }
];

const petalSwallowAction: BossAction = {
    id: 'petal-swallow',
    type: ActionType.EatAttack,
    name: '花芯への丸呑み',
    description: '蕾や蔓ごと獲物を花芯へ送り込む',
    messages: [
        '{boss}が大きな花弁をぱっくり開いた！',
        '蔓が{player}を持ち上げ、甘い香りのする花芯へゆっくり運んでいく...',
        '「ごちそうさま。中でゆっくり芽吹いてね」'
    ],
    weight: 1,
    onUse: (_boss: Boss, player: Player) => {
        player.statusEffects.removeEffect(StatusEffectType.Cocoon);
        player.statusEffects.removeEffect(StatusEffectType.Restrained);
        return [];
    }
};

const gluttonBloomStomachActions: BossAction[] = [
    {
        id: 'inner-petal-knead',
        type: ActionType.DevourAttack,
        name: '内花弁もみほぐし',
        description: '体内の花弁で獲物をもみほぐして吸収する',
        messages: [
            '{boss}の体内で、やわらかな花弁が{player}を押し包む...',
            '花蜜の香りとともに、少しずつ力が抜けていく。'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.95,
        weight: 35,
        playerStateCondition: 'eaten'
    },
    {
        id: 'rootlet-drain',
        type: ActionType.DevourAttack,
        name: '根毛吸収',
        description: '細かな根毛で生命力を吸い上げる',
        messages: [
            '細い根毛が体内の壁から伸び、{player}の力をちゅうちゅう吸い上げる...',
            '「日差しより、あなたの方がずっと栄養になるわ」'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.2,
        weight: 30,
        playerStateCondition: 'eaten'
    },
    {
        id: 'nectar-tide',
        type: ActionType.DevourAttack,
        name: '花蜜の満潮',
        description: '体内を花蜜で満たし、甘い眠気を誘う',
        messages: [
            '{boss}の体内に温かな花蜜が満ちていく...',
            '{player}は甘い流れに浮かびながら、抵抗する感覚を失っていく。'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.85,
        statusEffect: StatusEffectType.Lethargy,
        statusChance: 0.9,
        weight: 25,
        playerStateCondition: 'eaten'
    }
];

const deepCompostCradleAction: BossAction = {
    id: 'deep-compost-cradle',
    type: ActionType.FinishingMove,
    name: '腐葉土のゆりかご',
    description: '体内深くの温かな養分層へ獲物を寝かせる',
    messages: [
        '{player}が力尽きたのを感じ取ると、{boss}の体内の根が静かに動き出した...',
        '「大丈夫。あなたはもう、私の温室のいちばん大事な肥料よ」',
        'やわらかな根と花弁が{player}を抱え、体内のさらに奥へ運んでいく...',
        '{player}は温かな腐葉土のゆりかごに包まれ、完全に捕らえられてしまった。'
    ],
    weight: 1,
    onUse: (_boss: Boss, player: Player) => {
        player.statusEffects.removeEffect(StatusEffectType.Doomed);
        player.statusEffects.addEffect(StatusEffectType.Dead);
        player.statusEffects.addEffect(StatusEffectType.Eaten);
        player.statusEffects.addEffect(StatusEffectType.Charm, -1);
        return [];
    }
};

const gluttonBloomPostDefeatedActions: BossAction[] = [
    {
        id: 'warm-compost-rest',
        type: ActionType.PostDefeatedAttack,
        name: '温かな腐葉土休み',
        description: '体内の腐葉土層で獲物を休ませ続ける',
        messages: [
            '{boss}の体内奥で、温かな腐葉土と根が{player}を包み込んでいる...',
            '「よしよし。逃げない肥料は、とてもえらいの」'
        ],
        weight: 35
    },
    {
        id: 'nectar-feeding-loop',
        type: ActionType.PostDefeatedAttack,
        name: '花蜜給餌',
        description: '体内で花蜜を飲ませて眠気を深める',
        messages: [
            '細い蔓が花蜜を運び、{player}の周囲を甘い香りで満たしていく...',
            '{player}は温室の夢を見ながら、さらに深く眠っていく。'
        ],
        statusEffect: StatusEffectType.Lethargy,
        weight: 30
    },
    {
        id: 'root-hum-song',
        type: ActionType.PostDefeatedAttack,
        name: '根鳴りの子守歌',
        description: '根を震わせて体内に低い子守歌を響かせる',
        messages: [
            '{boss}の根が低く震え、体内いっぱいに葉擦れのような音が響く...',
            '「眠って、芽吹いて、また私を元気にしてね」'
        ],
        statusEffect: StatusEffectType.Charm,
        weight: 30
    }
];

const periodicBloomingAction: BossAction = {
    id: 'periodic-blooming',
    type: ActionType.PostDefeatedAttack,
    name: '体内開花',
    description: '体内で小さな花を咲かせ、花蜜と花粉で満たす',
    messages: [
        '{boss}の体内奥で、小さな蕾がぽつぽつと開いていく...',
        '「八つ数えたら、お花の時間。たっぷり香りを浴びてね」',
        '花蜜と花粉が温かな雨のように降り、{player}を甘く包み込む。'
    ],
    weight: 1,
    onUse: (_boss: Boss, player: Player) => {
        player.statusEffects.addEffect(StatusEffectType.Charm, 8);
        player.statusEffects.addEffect(StatusEffectType.Lethargy, 8);
        player.statusEffects.addEffect(StatusEffectType.Slimed, 8);
        return [];
    }
};

export const gluttonBloomData: BossData = {
    id: 'glutton-bloom',
    name: 'GluttonBloom',
    displayName: 'グラットン・ブルーム',
    icon: '🌺',
    description: '温室跡に根を張る、人食い植物の捕食者',
    appearanceNote: '巨大な捕食植物。深紅の花弁、内側に並ぶ白い歯状の花芯、獲物を絡め取る緑の蔓、蜜を溜めた琥珀色の袋、足元に広がる根の巣を持つ。',
    questNote: '廃温室の奥で、旅人を甘い香りで誘い込む巨大な人食い植物が根を張ったという。温室に入った者は花蜜の匂いに包まれ、いつの間にか蔓に絡め取られるらしい。捕食花グラットン・ブルームを調査し、危険な根の広がりを止めてほしい。',
    maxHp: 680,
    attackPower: 17,
    actions: [
        ...gluttonBloomNormalActions,
        greenhouseOvergrowthAction,
        ...gluttonBloomRestrainedActions,
        ...gluttonBloomCocoonActions,
        petalSwallowAction,
        ...gluttonBloomStomachActions,
        ...gluttonBloomPostDefeatedActions
    ],
    suppressAutoFinishingMove: true,
    explorerLevelRequired: 4,
    victoryTrophy: {
        name: '捕食花の棘花弁',
        description: 'グラットン・ブルームの外側から剥がれた深紅の花弁。縁には小さな棘が並び、乾いても甘い香りを残している。'
    },
    defeatTrophy: {
        name: '温室花蜜',
        description: 'グラットン・ブルームの体内で集められた濃厚な花蜜。温かな腐葉土の香りが混じり、植物の生命力がぎゅっと詰まっている。'
    },
    personality: [
        'いい匂いでしょう？近くで嗅いでいきなさい',
        '暴れる子ほど、蔓に味がしみるの',
        '私の温室で、ゆっくり芽吹いてね',
        'ぱくり。うふふ、今のは練習よ',
        'あなた、日差しより栄養がありそう'
    ],
    customVariables: {
        hasUsedOvergrowth: false,
        innerBloomTurn: 0,
        defeatStartTurn: -1
    },
    battleStartMessages: [
        {
            speaker: 'player',
            style: 'default',
            text: '廃温室に足を踏み入れると、甘い花蜜の香りが空気いっぱいに満ちていた。'
        },
        {
            speaker: 'system',
            style: 'default',
            text: '割れたガラス屋根から差す光の下で、巨大な花がゆっくりと開く。'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「ようこそ、私の温室へ。ちょうどお腹が空いていたの」'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: 'グラットン・ブルームの根が床を這い、蔓が獲物を探すように揺れている...'
        }
    ],
    victoryMessages: [
        {
            speaker: 'boss',
            style: 'talk',
            text: '「あら...この栄養、私には少し強すぎたみたい」'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: 'グラットン・ブルームは花弁を閉じ、根をゆっくり温室の奥へ引いていく。'
        },
        {
            speaker: 'system',
            style: 'default',
            text: '甘い香りが薄れ、廃温室には久しぶりの静けさが戻った。'
        }
    ],
    aiStrategy: (boss: Boss, player: Player, turn: number): BossAction => {
        if (player.isDefeated()) {
            const defeatStartTurn = boss.getCustomVariable<number>('defeatStartTurn', -1);
            if (defeatStartTurn === -1) {
                boss.setCustomVariable('defeatStartTurn', turn);
            }

            const turnsSinceDefeat = turn - boss.getCustomVariable<number>('defeatStartTurn', turn);
            if (turnsSinceDefeat > 0 && turnsSinceDefeat % 8 === 0) {
                return periodicBloomingAction;
            }

            return selectWeightedAction(gluttonBloomPostDefeatedActions);
        }

        if (player.isEaten()) {
            if (player.isDoomed()) {
                return deepCompostCradleAction;
            }

            const innerBloomTurn = boss.getCustomVariable<number>('innerBloomTurn', 0) + 1;
            boss.setCustomVariable('innerBloomTurn', innerBloomTurn);

            return selectWeightedAction(gluttonBloomStomachActions);
        }

        if (player.isKnockedOut() && (player.isRestrained() || player.isCocoon())) {
            return petalSwallowAction;
        }

        if (player.isKnockedOut()) {
            const vineSnare = gluttonBloomNormalActions.find(action => action.id === 'root-vine-snare');
            return vineSnare ?? gluttonBloomNormalActions[0];
        }

        if (player.isCocoon()) {
            return selectWeightedAction(gluttonBloomCocoonActions);
        }

        if (player.isRestrained()) {
            if (Math.random() < 0.35) {
                return gluttonBloomRestrainedActions.find(action => action.id === 'bud-cradle') ?? gluttonBloomRestrainedActions[0];
            }

            return selectWeightedAction(gluttonBloomRestrainedActions.filter(action => action.id !== 'bud-cradle'));
        }

        const hasUsedOvergrowth = boss.getCustomVariable<boolean>('hasUsedOvergrowth', false);
        if (!hasUsedOvergrowth && boss.getHpPercentage() <= 45) {
            return greenhouseOvergrowthAction;
        }

        const isPreparedPrey =
            player.statusEffects.hasEffect(StatusEffectType.Slimed) ||
            player.statusEffects.hasEffect(StatusEffectType.Charm) ||
            player.statusEffects.hasEffect(StatusEffectType.Lethargy);

        if (isPreparedPrey && Math.random() < 0.3) {
            const vineSnare = gluttonBloomNormalActions.find(action => action.id === 'root-vine-snare');
            if (vineSnare) {
                return vineSnare;
            }
        }

        const availableActions = gluttonBloomNormalActions.filter(action => {
            if (action.canUse) {
                return action.canUse(boss, player, turn);
            }
            return true;
        });

        return selectWeightedAction(availableActions);
    }
};
