import { BossData, ActionType, BossAction, Boss } from '../../entities/Boss';
import { Player } from '../../entities/Player';
import { StatusEffectType } from '../../systems/StatusEffectTypes';

const selectWeightedAction = (actions: BossAction[], boss: Boss, player: Player, turn: number): BossAction => {
    const availableActions = actions.filter(action => {
        if (action.weight <= 0) {
            return false;
        }
        if (action.canUse) {
            return action.canUse(boss, player, turn);
        }
        return true;
    });

    if (availableActions.length === 0) {
        return actions[0];
    }

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

const xenoTendrilBeastActions: BossAction[] = [
    {
        id: 'tendril-rake',
        type: ActionType.Attack,
        name: '触手ひっかき',
        description: '無数の細い触手で獲物を素早くひっかく',
        messages: [
            '「ギィィッ！」',
            '{boss}の触手群が一斉にしなり、{player}を鋭くひっかいた！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.05,
        hitRate: 0.92,
        weight: 34,
        playerStateCondition: 'normal'
    },
    {
        id: 'maw-feint',
        type: ActionType.Attack,
        name: '牙顎フェイント',
        description: '噛みつくふりで体勢を崩し、触手で横から打つ',
        messages: [
            '{boss}が大きな顎を開いて飛びかかる！',
            '直前で軌道を変えた触手が、横合いから{player}を叩いた！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.35,
        hitRate: 0.82,
        statusEffect: StatusEffectType.Dizzy,
        statusChance: 0.25,
        damageVarianceMin: -0.1,
        damageVarianceMax: 0.25,
        weight: 24,
        playerStateCondition: 'normal'
    },
    {
        id: 'biolume-spores',
        type: ActionType.StatusAttack,
        name: '発光胞子噴霧',
        description: '触手の先から発光する胞子を撒き、視界を乱す',
        messages: [
            '「シュルルルル...」',
            '{boss}の触手先端が青白く光り、発光胞子を吹きつけた！',
            '{player}の視界がちらちらと歪む...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.65,
        hitRate: 0.9,
        statusEffect: StatusEffectType.VisionImpairment,
        statusChance: 0.85,
        weight: 22,
        playerStateCondition: 'normal'
    },
    {
        id: 'scent-lock',
        type: ActionType.StatusAttack,
        name: '獲物の匂い刻み',
        description: '触角と粘液で獲物の位置を覚え、拘束を狙いやすくする',
        messages: [
            '{boss}が床を這うように近づき、触角を震わせた。',
            'ぬるい粘液の匂いが{player}の周囲にまとわりつく！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.55,
        hitRate: 0.95,
        statusEffect: StatusEffectType.Weakness,
        statusChance: 0.45,
        weight: 14,
        playerStateCondition: 'normal',
        canUse: (boss: Boss) => {
            return boss.getCustomVariable<number>('scentLockTurns', 0) <= 0;
        },
        onUse: (boss: Boss) => {
            boss.setCustomVariable('scentLockTurns', 3);
            return ['{boss}の触手が空気の流れを読み、獲物の位置を完全に覚えた！'];
        }
    },
    {
        id: 'tendril-snare',
        type: ActionType.RestraintAttack,
        name: '触手の群れ絡め',
        description: '床や壁から伸びた触手で獲物を拘束する',
        messages: [
            '「ギチギチギチ...」',
            '四方から伸びた触手が{player}に絡みついた！',
            '{player}は触手の群れに押さえ込まれてしまう！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.75,
        hitRate: 0.88,
        weight: 11,
        playerStateCondition: 'normal',
        canUse: (boss: Boss, player: Player) => {
            const scentLockTurns = boss.getCustomVariable<number>('scentLockTurns', 0);
            return !player.isRestrained() && !player.isEaten() && (scentLockTurns > 0 || Math.random() < 0.35);
        }
    },
    {
        id: 'pounce-prepare',
        type: ActionType.Attack,
        name: '跳躍姿勢',
        description: '全身の触手を地面に突き立て、次の突進に備える',
        messages: [
            '{boss}が低く伏せ、無数の触手を地面に突き立てた。',
            '次の瞬間、獣のような跳躍が来る予感がする...！'
        ],
        damageFormula: (_user: Boss) => 0,
        hitRate: 1.0,
        weight: 7,
        playerStateCondition: 'normal',
        canUse: (boss: Boss) => {
            return !boss.getCustomVariable<boolean>('pounceCharging', false) && boss.getHpPercentage() <= 55;
        },
        onUse: (boss: Boss) => {
            boss.setCustomVariable('pounceCharging', true);
            return [];
        }
    }
];

const restrainedActions: BossAction[] = [
    {
        id: 'coil-crush',
        type: ActionType.Attack,
        name: '触手締めつけ',
        description: '拘束した獲物を触手で締めつける',
        messages: [
            '{boss}の触手が脈打つように収縮し、{player}を締めつけている！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.15,
        healRatio: 0.35,
        weight: 36,
        playerStateCondition: 'restrained'
    },
    {
        id: 'sensory-buzz',
        type: ActionType.StatusAttack,
        name: '感覚震動',
        description: '触手から伝わる震動で獲物の感覚を乱す',
        messages: [
            '触手の内側から低い震動が伝わってくる...',
            '{player}は方向感覚を奪われ、力が抜けていく。'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.7,
        statusEffect: StatusEffectType.Weakness,
        statusChance: 0.8,
        weight: 30,
        playerStateCondition: 'restrained'
    },
    {
        id: 'feeding-tendrils',
        type: ActionType.Attack,
        name: '補食触手',
        description: '拘束中の獲物から少しずつ活力を吸い上げる',
        messages: [
            '{boss}の細い触手が{player}を探るようにまとわりつく。',
            'ぬるい粘液が活力を吸い上げ、{boss}の体表が淡く光った。'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.35,
        healRatio: 0.75,
        weight: 25,
        playerStateCondition: 'restrained'
    }
];

const eatenActions: BossAction[] = [
    {
        id: 'inner-pulse',
        type: ActionType.DevourAttack,
        name: '体内脈動',
        description: '体内の触手壁が脈動して獲物を奥へ押し込む',
        messages: [
            '{boss}の体内で、壁のような触手がゆっくりとうねる。',
            '{player}は柔らかな圧力でさらに奥へ押し流されていく...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.1,
        weight: 34,
        playerStateCondition: 'eaten'
    },
    {
        id: 'acidic-hum',
        type: ActionType.DevourAttack,
        name: '酸性の低鳴り',
        description: '体内に響く低い唸りで獲物の体力を削る',
        messages: [
            '「ヴゥゥゥゥ...」',
            '{boss}の体内に低い振動が響き、温かな消化液が波打つ。'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.35,
        statusEffect: StatusEffectType.VisionImpairment,
        statusChance: 0.55,
        weight: 26,
        playerStateCondition: 'eaten'
    },
    {
        id: 'stomach-tendrils',
        type: ActionType.DevourAttack,
        name: '胃内触手まさぐり',
        description: '体内の細い触手が獲物を探り、活力を吸い上げる',
        messages: [
            '内壁から伸びた細い触手が、{player}の周囲を探るように動く。',
            '{player}の活力が少しずつ吸い上げられていく...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.0,
        healRatio: 0.6,
        statusEffect: StatusEffectType.Dizzy,
        statusChance: 0.45,
        weight: 24,
        playerStateCondition: 'eaten'
    }
];

const ravagePounceAction: BossAction = {
    id: 'ravage-pounce',
    type: ActionType.Attack,
    name: '猛獣跳躍',
    description: '溜めた触手の反動で獣のように飛びかかる',
    messages: [
        '「ギャアアッ！」',
        '{boss}が触手の反動で弾けるように跳び、{player}へ襲いかかった！'
    ],
    damageFormula: (user: Boss) => user.attackPower * 2.35,
    hitRate: 0.78,
    statusEffect: StatusEffectType.Weakness,
    statusChance: 0.65,
    damageVarianceMin: -0.2,
    damageVarianceMax: 0.35,
    weight: 1
};

const swallowAction: BossAction = {
    id: 'xeno-swallow',
    type: ActionType.EatAttack,
    name: '異星の丸呑み',
    description: '力尽きた獲物を触手で口まで運び、そのまま丸呑みにする',
    messages: [
        '{boss}の触手が力尽きた{player}を持ち上げる。',
        '裂けるように開いた顎が近づき、{player}はぬるい体内へ飲み込まれてしまった！'
    ],
    weight: 1,
    playerStateCondition: 'ko'
};

const innerCorePulseAction: BossAction = {
    id: 'inner-core-pulse',
    type: ActionType.DevourAttack,
    name: '体内核の脈動',
    description: '体内の核が光り、獲物を弱らせる一度きりの大きな脈動を起こす',
    messages: [
        '{boss}の体内奥で、青白い核がぱっと明滅した。',
        '触手壁が一斉に収縮し、{player}の力と方向感覚を奪っていく！'
    ],
    damageFormula: (user: Boss) => user.attackPower * 1.55,
    statusEffect: StatusEffectType.Weakness,
    statusChance: 1.0,
    weight: 1,
    playerStateCondition: 'eaten',
    onUse: (boss: Boss, player: Player) => {
        boss.setCustomVariable('innerCorePulseUsed', true);
        player.statusEffects.addEffect(StatusEffectType.Dizzy, 3);
        return [];
    }
};

const xenoFinishAction: BossAction = {
    id: 'core-nest-finish',
    type: ActionType.FinishingMove,
    name: '核巣への固定',
    description: '体内で動けなくなった獲物を核のそばに固定する',
    messages: [
        '{player}は{boss}の体内で、青白い核のそばまでゆっくり運ばれていく...',
        '無数の柔らかな触手が{player}を包み、外へ戻る道を静かに閉じた。',
        '{boss}は満足したように低く唸り、体内の核が獲物を穏やかに照らし続ける...'
    ],
    weight: 1,
    playerStateCondition: 'eaten',
    onUse: (_boss: Boss, player: Player) => {
        player.statusEffects.removeEffect(StatusEffectType.Doomed);
        player.statusEffects.addEffect(StatusEffectType.Dead);
        return [];
    }
};

const postDefeatedActions: BossAction[] = [
    {
        id: 'post-core-rocking',
        type: ActionType.PostDefeatedAttack,
        name: '核巣の揺籠',
        description: '核の近くで獲物を触手の揺りかごに固定し続ける',
        messages: [
            '{boss}の体内で、触手の揺りかごがゆっくり揺れている。',
            '{player}は青白い光に包まれたまま、静かに固定され続ける...'
        ],
        weight: 34,
        playerStateCondition: 'defeated'
    },
    {
        id: 'post-biolume-soak',
        type: ActionType.PostDefeatedAttack,
        name: '発光粘液浸し',
        description: '体内の発光粘液で獲物を包み、外の感覚を遠ざける',
        messages: [
            '温かな発光粘液が{player}を包み込む。',
            '外の気配は遠くなり、体内の低い唸りだけが響いている...'
        ],
        statusEffect: StatusEffectType.VisionImpairment,
        weight: 28,
        playerStateCondition: 'defeated'
    },
    {
        id: 'post-tendril-nest',
        type: ActionType.PostDefeatedAttack,
        name: '触手巣の編み直し',
        description: '体内の触手巣を編み直し、獲物をさらに奥へ包む',
        messages: [
            '{boss}の体内触手が巣の形を変え、{player}を包み直した。',
            '逃げ道は見えず、核の光だけがゆっくり脈打っている...'
        ],
        statusEffect: StatusEffectType.Weakness,
        weight: 24,
        playerStateCondition: 'defeated'
    }
];

const periodicMoltAction: BossAction = {
    id: 'post-molt-cycle',
    type: ActionType.PostDefeatedAttack,
    name: '体内脱皮サイクル',
    description: '8ターンごとに体内の粘膜を入れ替え、獲物を新しい巣材で包む',
    messages: [
        '{boss}の体内全体が大きく脈打った。',
        '古い発光粘液が流れ、新しい膜が{player}を包み直していく！',
        '触手巣はさらに柔らかく、さらに抜け出しにくい形へ変わった...'
    ],
    statusEffect: StatusEffectType.Slimed,
    weight: 1,
    playerStateCondition: 'defeated',
    onUse: (_boss: Boss, player: Player) => {
        player.statusEffects.addEffect(StatusEffectType.Weakness, 4);
        player.statusEffects.addEffect(StatusEffectType.Dizzy, 3);
        return [];
    }
};

export const xenoTendrilBeastData: BossData = {
    id: 'xeno-tendril-beast',
    name: 'XenoTendrilBeast',
    displayName: 'ゼノ触獣',
    icon: '👾',
    description: '隕石孔に潜む、言葉を持たない触手まみれの異星猛獣',
    appearanceNote: '灰白色の外皮、裂けるような顎、体表を覆う無数の触手、青白く光る体内核を持つ異星生物。言葉は話さず、唸り声と触手の震動で獲物を追う。',
    questNote: '工業地帯の外れに落ちた隕石孔で、触手に覆われた異星生物が目撃された。獣のように素早く、獲物を匂いと振動で追跡するらしい。被害が広がる前に、この危険なゼノ触獣を退けてほしい。',
    maxHp: 1180,
    attackPower: 22,
    actions: [
        ...xenoTendrilBeastActions,
        ...restrainedActions,
        ...eatenActions,
        ravagePounceAction,
        swallowAction,
        innerCorePulseAction,
        xenoFinishAction,
        periodicMoltAction,
        ...postDefeatedActions
    ],
    explorerLevelRequired: 8,
    suppressAutoFinishingMove: true,
    customVariables: {
        pounceCharging: false,
        scentLockTurns: 0,
        innerBodyTurn: 0,
        innerCorePulseUsed: false,
        defeatStartTurn: -1
    },
    battleStartMessages: [
        {
            speaker: 'player',
            style: 'default',
            text: '隕石孔の底で、湿った金属音のようなものが響いている。'
        },
        {
            speaker: 'system',
            style: 'default',
            text: '灰白色の異星生物が、無数の触手を床に這わせながら姿を現した！'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: 'ギィィィ...'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: 'ゼノ触獣は言葉を発さず、獣のような姿勢でこちらの匂いを探っている...'
        }
    ],
    victoryMessages: [
        {
            speaker: 'system',
            style: 'default',
            text: 'ゼノ触獣は無数の触手を丸め、隕石孔の奥へ後退していった。'
        },
        {
            speaker: 'player',
            style: 'default',
            text: '危険な異星猛獣を退けた！'
        }
    ],
    victoryTrophy: {
        name: 'ゼノ触獣の外殻片',
        description: 'ゼノ触獣の灰白色の外皮から剥がれた硬い破片。表面には細い触手跡のような溝が走り、かすかに青白く光る。'
    },
    defeatTrophy: {
        name: '核巣の発光粘液',
        description: 'ゼノ触獣の体内核の周囲で採れる温かな発光粘液。触れると低い振動が伝わり、宇宙由来の生命力を感じる。'
    },
    personality: [
        'ギィィィ...',
        'シュルルルル...',
        'ヴゥゥゥゥ...',
        '獲物の匂いを覚えると、触手の動きが明らかに速くなる。',
        '言葉は理解していないが、弱った相手を見逃さない。',
        '満足すると低く唸り、体内の核を青白く明滅させる。'
    ],
    aiStrategy: (boss: Boss, player: Player, turn: number): BossAction => {
        const scentLockTurns = boss.getCustomVariable<number>('scentLockTurns', 0);
        if (scentLockTurns > 0 && !player.isDefeated()) {
            boss.setCustomVariable('scentLockTurns', scentLockTurns - 1);
        }

        if (player.isDefeated()) {
            const defeatStartTurn = boss.getCustomVariable<number>('defeatStartTurn', -1);
            if (defeatStartTurn === -1) {
                boss.setCustomVariable('defeatStartTurn', turn);
            }

            const turnsSinceDefeat = turn - boss.getCustomVariable<number>('defeatStartTurn', turn);
            if (turnsSinceDefeat > 0 && turnsSinceDefeat % 8 === 0) {
                return periodicMoltAction;
            }

            return selectWeightedAction(postDefeatedActions, boss, player, turn);
        }

        if (player.isEaten() && player.isDoomed()) {
            return xenoFinishAction;
        }

        if (player.isEaten()) {
            const innerBodyTurn = boss.getCustomVariable<number>('innerBodyTurn', 0) + 1;
            boss.setCustomVariable('innerBodyTurn', innerBodyTurn);

            if (innerBodyTurn >= 3 && !boss.getCustomVariable<boolean>('innerCorePulseUsed', false)) {
                return innerCorePulseAction;
            }

            return selectWeightedAction(eatenActions, boss, player, turn);
        }

        if (player.isKnockedOut()) {
            if (player.isRestrained() && Math.random() < 0.85) {
                return swallowAction;
            }

            if (!player.isRestrained()) {
                return xenoTendrilBeastActions.find(action => action.id === 'tendril-snare') ?? xenoTendrilBeastActions[0];
            }
        }

        if (player.isRestrained()) {
            return selectWeightedAction(restrainedActions, boss, player, turn);
        }

        if (boss.getCustomVariable<boolean>('pounceCharging', false)) {
            boss.setCustomVariable('pounceCharging', false);
            return ravagePounceAction;
        }

        if (boss.getCustomVariable<number>('scentLockTurns', 0) > 0 && !player.isRestrained() && Math.random() < 0.45) {
            const snareAction = xenoTendrilBeastActions.find(action => action.id === 'tendril-snare');
            if (snareAction) {
                return snareAction;
            }
        }

        if (!player.statusEffects.hasEffect(StatusEffectType.VisionImpairment) && Math.random() < 0.35) {
            const sporesAction = xenoTendrilBeastActions.find(action => action.id === 'biolume-spores');
            if (sporesAction) {
                return sporesAction;
            }
        }

        return selectWeightedAction(xenoTendrilBeastActions, boss, player, turn);
    }
};
