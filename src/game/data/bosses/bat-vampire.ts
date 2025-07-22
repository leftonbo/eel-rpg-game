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
        messages: ['<USER>は無数の子コウモリを放った！']
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
        messages: ['<USER>は影の弾を放った！']
    },
    {
        type: ActionType.RestraintAttack,
        name: 'ヴァンパイアホールド',
        description: '強力な握力でエルナルを拘束する',
        weight: 10,
        playerStateCondition: 'normal',
        messages: ['<USER>は<TARGET>を掴み上げる！']
    },

    // 拘束中専用攻撃
    {
        type: ActionType.StatusAttack,
        name: '生気吸収',
        description: 'エルナルの体力と魔力を吸収する',
        damageFormula: (user: Boss) => user.attackPower * 1.2,
        statusEffect: StatusEffectType.Weakness,
        statusChance: 0.60,
        weight: 30,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>に噛みつき、生気を吸い取る！', '<TARGET>の力と魔力が奪われていく...']
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
        description: 'エルナルの生命力そのものを吸収する',
        damageFormula: (user: Boss) => user.attackPower * 0.5,
        weight: 50,
        playerStateCondition: 'ko',
        messages: ['<USER>は<TARGET>に噛みつき、生命力そのものを吸い取る...']
    }
];

// AI戦略: 拘束→魅了→最大HP吸収の段階的戦術
const batVampireAIStrategy = (boss: Boss, player: any, turn: number): BossAction => {
    const playerRestrained = player.statusEffects.hasEffect(StatusEffectType.Restrained);
    const playerCharmed = player.statusEffects.hasEffect(StatusEffectType.Charm);
    const playerKO = player.hp <= 0;
    const playerHasDarkness = player.statusEffects.hasEffect(StatusEffectType.Darkness);
    const playerHPPercent = player.hp / player.maxHp;
    
    // プレイヤーがKO状態で拘束中なら最大HP吸収を最優先
    if (playerKO && playerRestrained) {
        const action = batVampireActions.find(action => 
            action.name === '生気吸収（強化版）'
        );
        if (action) return action;
    }
    
    // 拘束中の場合は生気吸収と魅了を優先
    if (playerRestrained) {
        // プレイヤーのHPが低い場合は生気吸収を重視
        if (playerHPPercent <= 0.3) {
            const drainAction = batVampireActions.find(action => 
                action.name === '生気吸収'
            );
            if (drainAction) return drainAction;
        }
        
        // 魅了されていなければコウモリのキスを優先
        if (!playerCharmed) {
            const charmAction = batVampireActions.find(action => 
                action.name === 'コウモリのキス'
            );
            if (charmAction) return charmAction;
        }
        
        // デフォルトで生気吸収
        const drainAction = batVampireActions.find(action => 
            action.name === '生気吸収'
        );
        if (drainAction) return drainAction;
    }
    
    // 通常状態での行動選択 - weightによるランダム選択
    const normalActions = batVampireActions.filter(action => 
        action.playerStateCondition === 'normal'
    );
    
    // HPが低い場合は拘束攻撃の重みを上げる
    let modifiedActions = [...normalActions];
    if (boss.hp / boss.maxHp <= 0.4) {
        const restraintAction = normalActions.find(action =>
            action.name === 'ヴァンパイアホールド'
        );
        if (restraintAction) {
            modifiedActions.push(restraintAction);
        }
    }
    
    // 戦闘初期で暗闇がかかっていない場合、シャドウバレットの重みを上げる
    if (turn <= 2 && !playerHasDarkness) {
        const darknessAction = normalActions.find(action => 
            action.name === 'シャドウバレット'
        );
        if (darknessAction) {
            modifiedActions.push(darknessAction);
        }
    }
    
    // weightに基づくランダム選択
    const totalWeight = modifiedActions.reduce((sum, action) => sum + action.weight, 0);
    let randomValue = Math.random() * totalWeight;
    
    for (const action of modifiedActions) {
        randomValue -= action.weight;
        if (randomValue <= 0) {
            return action;
        }
    }
    
    // フォールバック
    return normalActions[0] || batVampireActions[0];
};

export const batVampireData: BossData = {
    id: 'bat-vampire',
    name: 'コウモリヴァンパイア',
    displayName: 'コウモリヴァンパイア',
    description: '古城に住む紳士的なコウモリの獣人。表向きは優雅だが、内心は獲物を陥れることに喜びを感じている。',
    questNote: '「ようこそ、我が城へ...君のような美しい獲物は久々だ」',
    maxHp: 310,
    attackPower: 14,
    actions: batVampireActions,
    aiStrategy: batVampireAIStrategy,
    
    // エクスプローラーレベル6で解禁
    explorerLevelRequired: 6
};