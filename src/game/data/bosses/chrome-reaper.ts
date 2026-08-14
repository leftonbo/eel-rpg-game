import { Player } from '@/game/entities/Player';
import { BossData, ActionType, BossAction, Boss } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffectTypes';

const selectWeightedAction = (actions: BossAction[]): BossAction => {
    const usableActions = actions.filter(action => action.weight > 0);
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

const chromeReaperActions: BossAction[] = [
    {
        id: 'predator-scan',
        type: ActionType.StatusAttack,
        name: '捕食スキャン',
        description: '獲物の動きを読み取り、弱点を記録する',
        messages: [
            '「[HUNT] 熱源捕捉。歩行パターン解析」',
            '{boss}の複眼センサーが{player}を細かく走査する！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.7,
        statusEffect: StatusEffectType.Weakness,
        statusChance: 0.65,
        hitRate: 0.95,
        weight: 28,
        playerStateCondition: 'normal',
        onUse: (boss: Boss, _player: Player, _turn: number) => {
            const huntData = boss.getCustomVariable<number>('huntData', 0);
            boss.setCustomVariable('huntData', Math.min(3, huntData + 1));
            return [];
        }
    },
    {
        id: 'razor-mandibles',
        type: ActionType.Attack,
        name: 'レイザーマンディブル',
        description: '金属の顎で素早く噛みつく',
        messages: [
            '{boss}の金属顎がシャキンと展開し、{player}へ噛みついた！'
        ],
        damageFormula: (user: Boss) => {
            const huntData = user.getCustomVariable<number>('huntData', 0);
            return user.attackPower * (1.0 + huntData * 0.15);
        },
        hitRate: 0.9,
        criticalRate: 0.12,
        weight: 30,
        playerStateCondition: 'normal'
    },
    {
        id: 'hydraulic-pounce',
        type: ActionType.Attack,
        name: '油圧跳躍',
        description: '獣のように跳びかかる高威力攻撃',
        messages: [
            '「[PREDICT] 逃走経路、封鎖」',
            '{boss}は油圧脚を沈め、獣のような軌道で跳びかかった！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.8,
        hitRate: 0.68,
        damageVarianceMin: -0.1,
        damageVarianceMax: 0.35,
        weight: 18,
        playerStateCondition: 'normal'
    },
    {
        id: 'servo-net',
        type: ActionType.RestraintAttack,
        name: 'サーボネット',
        description: '自律ワイヤーで獲物を絡め取る',
        messages: [
            '{boss}の背中から銀色のワイヤー群が射出され、{player}を絡め取ろうとする！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.8,
        hitRate: 0.78,
        weight: 22,
        playerStateCondition: 'normal',
        canUse: (_boss, player, _turn) => {
            return !player.isRestrained() && !player.isCocoon() && !player.isEaten();
        }
    },
    {
        id: 'stun-needle',
        type: ActionType.StatusAttack,
        name: 'スタンニードル',
        description: '細い針で電気信号を流し、動きを鈍らせる',
        messages: [
            '{boss}の尾部ニードルが閃き、{player}に細い電撃を流した！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.9,
        statusEffect: StatusEffectType.Stunned,
        statusChance: 0.35,
        hitRate: 0.82,
        weight: 16,
        playerStateCondition: 'normal'
    },
    {
        id: 'wire-tighten',
        type: ActionType.Attack,
        name: 'ワイヤー締め上げ',
        description: '拘束中の獲物をワイヤーで締め上げる',
        messages: [
            '{boss}は拘束ワイヤーを巻き取り、{player}の動きをさらに封じる！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.25,
        weight: 34,
        playerStateCondition: 'restrained'
    },
    {
        id: 'digestive-primer',
        type: ActionType.StatusAttack,
        name: '分解液プライマー',
        description: '体内搬送に備え、銀色の分解液を吹き付ける',
        messages: [
            '「[PREP] 外皮なじませ処理」',
            '{boss}は銀色の分解液を霧状にして{player}へ吹き付けた！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.75,
        statusEffect: StatusEffectType.Slimed,
        statusChance: 0.85,
        hitRate: 0.9,
        weight: 28,
        playerStateCondition: 'restrained'
    },
    {
        id: 'coil-cradle',
        type: ActionType.Attack,
        name: 'コイルクレードル',
        description: '拘束中の獲物を腹部の搬送コイルへ引き寄せる',
        messages: [
            '{boss}の腹部コイルが低く唸り、拘束された{player}をゆっくり引き寄せていく...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.05,
        healRatio: 0.35,
        weight: 24,
        playerStateCondition: 'restrained'
    },
    {
        id: 'capture-pod',
        type: ActionType.CocoonAttack,
        name: '捕獲ポッド形成',
        description: '戦闘不能の獲物をワイヤーと透明樹脂で包み込む',
        messages: [
            '{boss}は動けない{player}の周囲にワイヤーを編み込み始める！',
            '透明な樹脂が流れ込み、{player}は銀色の捕獲ポッドに包まれた！'
        ],
        weight: 1,
        playerStateCondition: 'ko',
        canUse: (_boss, player, _turn) => {
            return player.isKnockedOut() && !player.isCocoon() && !player.isEaten();
        }
    },
    {
        id: 'pod-compression',
        type: ActionType.CocoonAction,
        name: 'ポッド圧縮',
        description: '捕獲ポッドを縮め、内部の獲物を搬送しやすくする',
        messages: [
            '{boss}は捕獲ポッドを腹部アームで抱え、ゆっくり圧縮していく...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.25,
        weight: 34,
        playerStateCondition: 'cocoon'
    },
    {
        id: 'sensor-marination',
        type: ActionType.CocoonAction,
        name: 'センサー浸漬',
        description: 'ポッド内部に解析液を循環させる',
        messages: [
            '「[ANALYZE] 内部反応、良好」',
            '捕獲ポッドの中を冷たい解析液が巡り、{player}の抵抗を弱めていく...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.9,
        statusEffect: StatusEffectType.Dizzy,
        statusChance: 0.75,
        weight: 26,
        playerStateCondition: 'cocoon'
    },
    {
        id: 'whole-ingestion',
        type: ActionType.EatAttack,
        name: '丸呑み搬送',
        description: '捕獲ポッドごと体内の処理炉へ送り込む',
        messages: [
            '{boss}の胸部装甲が左右に開き、内部の柔らかな搬送路が露出する。',
            '捕獲ポッドごと{player}が奥へ引き込まれ、静かな駆動音とともに飲み込まれていった！'
        ],
        weight: 100,
        playerStateCondition: 'ko',
        canUse: (_boss, player, _turn) => {
            return player.isKnockedOut() && (player.isRestrained() || player.isCocoon());
        }
    },
    {
        id: 'internal-conveyor',
        type: ActionType.DevourAttack,
        name: '体内コンベア',
        description: '体内の柔らかな搬送路で奥へ運び込む',
        messages: [
            '{boss}の体内コンベアが静かに動き、{player}を温かな処理炉へ運んでいく...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.25,
        weight: 32,
        playerStateCondition: 'eaten'
    },
    {
        id: 'nutrient-drain',
        type: ActionType.DevourAttack,
        name: '栄養抽出',
        description: '体内チューブでエネルギーを吸い取り、自己修復する',
        messages: [
            '「[FEED] エネルギー抽出、開始」',
            '細いチューブが{player}に絡み、{boss}の装甲の傷を修復していく...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.45,
        healRatio: 0.55,
        weight: 30,
        playerStateCondition: 'eaten'
    },
    {
        id: 'soft-recycler-bath',
        type: ActionType.DevourAttack,
        name: '軟質リサイクル槽',
        description: '体内の銀色の液槽で獲物を包む',
        messages: [
            '{player}は銀色のリサイクル液に包まれ、体の力がふわりと抜けていく...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.1,
        statusEffect: StatusEffectType.Weakness,
        statusChance: 0.8,
        weight: 24,
        playerStateCondition: 'eaten'
    },
    {
        id: 'post-hunt-catalog',
        type: ActionType.PostDefeatedAttack,
        name: '狩猟ログ登録',
        description: '捕獲した獲物の情報をログに登録する',
        messages: [
            '「[LOG] 捕獲成功。行動データを保存」',
            '{boss}の体内で静かな記録音が続き、{player}は大切な狩猟ログとして登録されていく...'
        ],
        weight: 34,
        playerStateCondition: 'defeated'
    },
    {
        id: 'post-maintenance-feed',
        type: ActionType.PostDefeatedAttack,
        name: '保守給餌',
        description: '体内でエネルギー循環を維持する',
        messages: [
            '「[MAINTAIN] 捕獲個体、安定」',
            '温かな循環液が{player}を包み、{boss}の炉心へ穏やかにエネルギーを送り続けている...'
        ],
        weight: 30,
        playerStateCondition: 'defeated'
    },
    {
        id: 'post-purring-motor',
        type: ActionType.PostDefeatedAttack,
        name: '満腹駆動音',
        description: '捕食後の低いモーター音で獲物を包む',
        messages: [
            '{boss}の内部モーターが満足げに低く鳴り、{player}の周囲をやわらかな振動が満たしている...'
        ],
        weight: 24,
        playerStateCondition: 'defeated'
    }
];

const findAction = (id: string): BossAction => {
    const action = chromeReaperActions.find(candidate => candidate.id === id);
    return action ?? chromeReaperActions[0];
};

const createPredatoryOverride = (): BossAction => ({
    id: 'predatory-override',
    type: ActionType.Attack,
    name: '捕食オーバーライド',
    description: '解析済みの弱点へ連続攻撃を仕掛ける',
    messages: [
        '「[OVERRIDE] 狩猟データ、臨界」',
        '{boss}の全身のサーボが一斉に唸り、解析済みの逃げ道を塞いで連続攻撃を仕掛けた！'
    ],
    damageFormula: (user: Boss) => user.attackPower * 2.0,
    hitRate: 0.82,
    criticalRate: 0.2,
    weight: 1,
    playerStateCondition: 'normal',
    onUse: (boss: Boss, _player: Player, _turn: number) => {
        boss.setCustomVariable('huntData', 0);
        boss.setCustomVariable('overrideCooldown', 4);
        return [];
    }
});

const createCoreAssimilation = (): BossAction => ({
    id: 'core-assimilation',
    type: ActionType.PostDefeatedAttack,
    name: '炉心同調',
    description: '8ターンごとに捕獲個体を炉心へ同調させる',
    messages: [
        '「[CORE] 炉心同調プロトコル、開始」',
        '{boss}の体内で銀色の光がゆっくり脈打つ。',
        'リサイクル液と柔らかなチューブが{player}を包み込み、捕食炉のリズムへ穏やかに合わせていく...',
        '「[STATUS] 捕獲個体、安定。次回狩猟まで保管継続」'
    ],
    onUse: (_boss: Boss, player: Player, _turn: number) => {
        player.statusEffects.addEffect(StatusEffectType.Weakness);
        player.statusEffects.addEffect(StatusEffectType.Slimed);
        player.statusEffects.addEffect(StatusEffectType.Dizzy);
        return [];
    },
    weight: 1,
    playerStateCondition: 'defeated'
});

const getAvailableActions = (boss: Boss, player: Player, turn: number): BossAction[] => {
    const currentPlayerState = boss.getPlayerState(player);
    return chromeReaperActions.filter(action => {
        if (action.playerStateCondition && action.playerStateCondition !== currentPlayerState) {
            return false;
        }

        if (action.canUse) {
            return action.canUse(boss, player, turn);
        }

        return true;
    });
};

export const chromeReaperData: BossData = {
    id: 'chrome-reaper',
    name: 'ChromeReaper',
    displayName: 'クローム・リーパー',
    description: '機械獣として進化した銀色の捕食者',
    questNote: '工業区画の外れで、廃棄機械を食べて増殖する銀色の獣が目撃された。生き物の熱源にも反応し、獲物として追跡するという。これ以上狩猟範囲が広がる前に、その捕食炉を停止させる必要がある。',
    appearanceNote: '銀色の装甲、獣のような四肢、複眼センサー、金属顎、背部ワイヤー、柔らかな体内コンベア、炉心',
    maxHp: 820,
    attackPower: 21,
    actions: chromeReaperActions,
    icon: '⚙️',
    explorerLevelRequired: 8,
    battleStartMessages: [
        {
            speaker: 'player',
            style: 'default',
            text: 'あなたは廃工業区画で、金属を噛み砕く銀色の機械獣と遭遇した。'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「[BOOT] HUNTING FRAME 起動。熱源、確認」'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: 'クローム・リーパーは複眼センサーを細く光らせ、獣のように低く身構えている...'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「[TARGET] 有機燃料候補。捕獲優先度、高」'
        }
    ],
    victoryMessages: [
        {
            speaker: 'boss',
            style: 'talk',
            text: '「[ERROR] 捕食炉、出力低下...」'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: 'クローム・リーパーはワイヤーをだらりと垂らし、銀色の装甲から光を失っていく。'
        },
        {
            speaker: 'player',
            style: 'default',
            text: '機械獣の捕食炉を停止させた！'
        }
    ],
    victoryTrophy: {
        name: 'クロームの捕食顎',
        description: 'クローム・リーパーの外装から回収した銀色の金属顎。獲物の装甲を噛み砕くため、刃のような精密な噛み合わせを持つ。'
    },
    defeatTrophy: {
        name: '炉心リサイクル液',
        description: 'クローム・リーパーの体内炉で循環する銀色の液体。捕獲した獲物を穏やかに包み、機械獣のエネルギーへ変換するための媒体。'
    },
    personality: [
        '[HUNT] 熱源捕捉',
        '[PREDICT] 逃走経路解析',
        '[FEED] エネルギー抽出',
        '[MAINTAIN] 捕獲個体安定',
        '低いモーター音が喉鳴りのように響く'
    ],
    customVariables: {
        huntData: 0,
        overrideCooldown: 0,
        defeatStartTurn: -1
    },
    aiStrategy: (boss, player, turn) => {
        if (player.isDefeated()) {
            const defeatStartTurn = boss.getCustomVariable<number>('defeatStartTurn', -1);
            if (defeatStartTurn === -1) {
                boss.setCustomVariable('defeatStartTurn', turn);
            }

            const turnsSinceDefeat = turn - boss.getCustomVariable<number>('defeatStartTurn', turn);
            if (turnsSinceDefeat > 0 && turnsSinceDefeat % 8 === 0) {
                return createCoreAssimilation();
            }

            return selectWeightedAction(getAvailableActions(boss, player, turn));
        }

        if (player.isEaten()) {
            return selectWeightedAction(getAvailableActions(boss, player, turn));
        }

        if (player.isKnockedOut()) {
            if (player.isRestrained() || player.isCocoon()) {
                return findAction('whole-ingestion');
            }
            return findAction('capture-pod');
        }

        const overrideCooldown = boss.getCustomVariable<number>('overrideCooldown', 0);
        if (overrideCooldown > 0) {
            boss.setCustomVariable('overrideCooldown', overrideCooldown - 1);
        }

        const huntData = boss.getCustomVariable<number>('huntData', 0);
        if (huntData >= 3 && overrideCooldown <= 0 && !player.isRestrained() && Math.random() < 0.65) {
            return createPredatoryOverride();
        }

        if (player.getHpPercentage() > 55 && !player.isRestrained() && Math.random() < 0.35) {
            return findAction('servo-net');
        }

        const availableActions = getAvailableActions(boss, player, turn);
        return selectWeightedAction(availableActions.length > 0 ? availableActions : chromeReaperActions);
    }
};

chromeReaperData.finishingMove = function() {
    return [
        '「[COMPLETE] 捕獲プロトコル完了」',
        '{boss}の炉心が柔らかく明滅し、{player}は銀色のリサイクル液に包まれていく...',
        '機械獣は満腹のような低い駆動音を鳴らし、捕獲した獲物を体内で大切に保管し続ける。'
    ];
};
