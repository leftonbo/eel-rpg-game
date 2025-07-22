import { BossData, ActionType, BossAction, Boss } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffectTypes';

const batVampireActions: BossAction[] = [
    // 通常攻撃パターン
    {
        type: ActionType.Attack,
        name: '爪で引っ掻く',
        description: '鋭い爪で引っ掻き攻撃',
        damageFormula: (user: Boss) => user.attackPower * 0.9,
        hitRate: 0.90,
        weight: 20,
        playerStateCondition: 'normal'
    },
    {
        type: ActionType.Attack,
        name: '尻尾で叩く',
        description: 'コウモリの尻尾で叩きつける',
        damageFormula: (user: Boss) => user.attackPower * 0.8,
        hitRate: 0.95,
        weight: 20,
        playerStateCondition: 'normal'
    },
    {
        type: ActionType.Attack,
        name: '子コウモリ放出',
        description: '複数のコウモリを放出して攻撃',
        damageFormula: (user: Boss) => user.attackPower * 1.1,
        hitRate: 0.85,
        weight: 15,
        playerStateCondition: 'normal',
        messages: ['<USER>は無数の子コウモリを放った！', '小さなコウモリが<TARGET>を襲う！']
    },
    {
        type: ActionType.StatusAttack,
        name: 'シャドウバレット',
        description: '影の弾を放出、命中率は低いが暗闇状態にする',
        damageFormula: (user: Boss) => user.attackPower * 0.6,
        statusEffect: StatusEffectType.Darkness,
        statusChance: 0.70,
        hitRate: 0.60,
        weight: 15,
        playerStateCondition: 'normal',
        messages: ['<USER>は影の弾を放った！', '<TARGET>の視界が暗闇に包まれた...']
    },
    {
        type: ActionType.StatusAttack,
        name: 'ヴァンパイアホールド',
        description: '強力な握力でエルナルを拘束する',
        statusEffect: StatusEffectType.Restrained,
        statusChance: 0.85,
        weight: 25,
        playerStateCondition: 'normal',
        messages: ['<USER>は<TARGET>を強力に掴んだ！', '<TARGET>は拘束されて動けない！']
    },

    // 拘束中専用攻撃
    {
        type: ActionType.StatusAttack,
        name: '生気吸収',
        description: 'エルナルの体力とMPを吸収する',
        damageFormula: (user: Boss) => user.attackPower * 1.2,
        mpDamage: 15,
        statusEffect: StatusEffectType.Weakness,
        statusChance: 0.60,
        weight: 30,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>の生気を吸い取った！', '<TARGET>の力が奪われていく...']
    },
    {
        type: ActionType.StatusAttack,
        name: 'コウモリのキス',
        description: 'エルナルに深いキスをして生気を吸い取りながら魅了する',
        damageFormula: (user: Boss) => user.attackPower * 0.8,
        statusEffect: StatusEffectType.Charm,
        statusChance: 0.90,
        weight: 25,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>に深いキスをした...', '<TARGET>は魅了されてしまった...']
    },

    // 拘束中＋エルナルダウン時の特殊攻撃
    {
        type: ActionType.DevourAttack,
        name: '生気吸収（強化版）',
        description: 'エルナルの最大HPを吸収する',
        maxHpDrain: 15,
        damageFormula: (user: Boss) => user.attackPower * 0.5,
        weight: 50,
        playerStateCondition: 'ko',
        restrictedConditions: ['restrained'],
        messages: ['<USER>は<TARGET>の生命力そのものを吸い取った！', '<TARGET>の最大HPが減少した...']
    }
];

// AI戦略: 拘束→魅了→最大HP吸収の段階的戦術
const batVampireAIStrategy = (boss: Boss, player: any, turn: number): BossAction[] => {
    const playerRestrained = player.statusEffects.hasEffect(StatusEffectType.Restrained);
    const playerCharmed = player.statusEffects.hasEffect(StatusEffectType.Charm);
    const playerKO = player.hp <= 0;
    const playerHasDarkness = player.statusEffects.hasEffect(StatusEffectType.Darkness);
    const playerHPPercent = player.hp / player.maxHp;
    
    // プレイヤーがKO状態で拘束中なら最大HP吸収を最優先
    if (playerKO && playerRestrained) {
        return batVampireActions.filter(action => 
            action.name === '生気吸収（強化版）'
        );
    }
    
    // 拘束中の場合は生気吸収と魅了を優先
    if (playerRestrained) {
        const restrainedActions = batVampireActions.filter(action => 
            action.playerStateCondition === 'restrained'
        );
        
        // プレイヤーのHPが低い場合は生気吸収を重視
        if (playerHPPercent <= 0.3) {
            const drainAction = restrainedActions.filter(action => 
                action.name === '生気吸収'
            );
            if (drainAction.length > 0) {
                return [...drainAction, ...drainAction, ...restrainedActions];
            }
        }
        
        // 魅了されていなければコウモリのキスを優先
        if (!playerCharmed) {
            const charmAction = restrainedActions.filter(action => 
                action.name === 'コウモリのキス'
            );
            if (charmAction.length > 0) {
                return [...charmAction, ...charmAction, ...restrainedActions];
            }
        }
        
        return restrainedActions;
    }
    
    // 通常状態での戦術選択
    const normalActions = batVampireActions.filter(action => 
        action.playerStateCondition === 'normal'
    );
    
    // 戦闘初期（1-2ターン）：暗闇攻撃で有利を取る
    if (turn <= 2 && !playerHasDarkness) {
        const darknessAction = normalActions.filter(action => 
            action.name === 'シャドウバレット'
        );
        if (darknessAction.length > 0) {
            return [...darknessAction, ...darknessAction, ...normalActions];
        }
    }
    
    // 中盤（3-5ターン）：拘束攻撃を重視
    if (turn >= 3 && turn <= 5) {
        const restraintAction = normalActions.filter(action => 
            action.name === 'ヴァンパイアホールド'
        );
        if (restraintAction.length > 0) {
            return [...restraintAction, ...restraintAction, ...restraintAction, ...normalActions];
        }
    }
    
    // 終盤（6ターン以降）または低HP時：拘束を最優先
    if (turn >= 6 || boss.hp / boss.maxHp <= 0.4) {
        const restraintAction = normalActions.filter(action => 
            action.name === 'ヴァンパイアホールド'
        );
        if (restraintAction.length > 0) {
            // 拘束攻撃の重みを大幅に上げる
            return [...restraintAction, ...restraintAction, ...restraintAction, ...restraintAction, ...normalActions];
        }
    }
    
    // プレイヤーのHPが高い場合は子コウモリ攻撃を増やす
    if (playerHPPercent >= 0.7) {
        const batAttack = normalActions.filter(action => 
            action.name === '子コウモリ放出'
        );
        if (batAttack.length > 0) {
            return [...batAttack, ...normalActions];
        }
    }
    
    return normalActions;
};

export const batVampireData: BossData = {
    id: 'bat-vampire',
    name: 'コウモリヴァンパイア',
    description: '古城に住む紳士的なコウモリの獣人。表向きは優雅だが、内心は獲物を陥れることに喜びを感じている。',
    flavorText: '「ようこそ、我が城へ...君のような美しい獲物は久々だ」',
    maxHp: 310,
    attackPower: 14,
    actions: batVampireActions,
    aiStrategy: batVampireAIStrategy,
    
    // エクスプローラーレベル6で解禁
    explorerLevelRequirement: 6,
    explorerExperience: 9800,
    
    // 勝利・敗北時のトロフィー
    victoryTrophies: [
        {
            id: 'vampire_hunter',
            name: 'ヴァンパイアハンター',
            description: 'コウモリヴァンパイアを倒した',
            rarity: 'epic'
        }
    ],
    
    defeatTrophies: [
        {
            id: 'vampire_victim',
            name: 'ヴァンパイアの獲物',
            description: 'コウモリヴァンパイアに敗北した',
            rarity: 'common'
        },
        {
            id: 'drained_completely',
            name: '完全なる生気吸収',
            description: '最大HPを吸収されて敗北した',
            rarity: 'rare'
        }
    ],
    
    // 特殊敗北条件の処理
    specialDefeatCondition: (player: any): boolean => {
        return player.maxHp <= 0;
    },
    
    specialDefeatMessage: 'エルナルの生気は完全に吸い尽くされ、体が小さくなってしまった...\nコウモリヴァンパイアは小さくなったエルナルを優しく抱き上げると、そのまま口の中に運んでいく...'
};