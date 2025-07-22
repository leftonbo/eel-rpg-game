import { BossData, ActionType, BossAction, Boss } from '../../entities/Boss';
import { Player } from '../../entities/Player';
import { StatusEffectType } from '../../systems/StatusEffectTypes';

const undergroundWormActions: BossAction[] = [
    {
        type: ActionType.Attack,
        name: '地割れ',
        description: '地面を割いて攻撃',
        messages: [
            '「グルルル...」',
            '<USER>は地面を割って<TARGET>を攻撃した！',
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.2,
        weight: 40,
        hitRate: 0.85,
        playerStateCondition: 'normal'
    },
    {
        type: ActionType.StatusAttack,
        name: '石化の息',
        description: '石を溶かす息を吐いて敵を石化させる',
        messages: [
            '「シュルシュル...」',
            '<USER>は石を溶かす息を吐いた！',
            '<TARGET>は石のように固まってしまった！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.8,
        hitRate: 0.75,
        statusEffect: StatusEffectType.Petrified,
        weight: 25,
        canUse: (_boss, player, _turn) => {
            return !player.statusEffects.hasEffect(StatusEffectType.Petrified);
        }
    },
    {
        type: ActionType.RestraintAttack,
        name: '巻き込み拘束',
        description: '巨大な体で相手を巻き込む',
        messages: [
            '「グオオオ...」',
            '<USER>は巨大な体で<TARGET>を巻き込んだ！',
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.9,
        weight: 15,
        canUse: (_boss, player, _turn) => {
            return !player.isRestrained() && !player.isEaten() && Math.random() < 0.4;
        }
    },
    {
        type: ActionType.EatAttack,
        name: '丸呑み',
        description: '巨大な口で相手を呑み込む',
        messages: [
            '「ガバッ！」',
            '<USER>は巨大な口を開いて<TARGET>を呑み込んだ！',
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.1,
        weight: 20,
        canUse: (_boss, player, _turn) => {
            return !player.isEaten() && Math.random() < 0.6;
        }
    }
];

const undergroundWormDevourActions: BossAction[] = [
    {
        type: ActionType.DevourAttack,
        name: '砂利研磨',
        description: '体内の砂利でプレイヤーを研磨する',
        messages: [
            '<USER>の体内で砂利が<TARGET>を研磨する...',
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.4,
        weight: 35
    },
    {
        type: ActionType.DevourAttack,
        name: '消化液攻撃',
        description: '強酸性の消化液で溶解攻撃',
        messages: [
            '<USER>の強酸性の消化液が<TARGET>を溶かす...',
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.7,
        weight: 40
    },
    {
        type: ActionType.StatusAttack,
        name: '石化消化',
        description: '体内で石化させて消化を遅らせる',
        messages: [
            '<USER>の体内で特殊な消化液により<TARGET>は石化してしまった！',
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.2,
        statusEffect: StatusEffectType.Petrified,
        weight: 25,
        canUse: (_boss, player, _turn) => {
            return !player.statusEffects.hasEffect(StatusEffectType.Petrified);
        }
    }
];

// 敗北後の継続攻撃（プレイヤーがKO状態で体内にいる時）
const undergroundWormPostDefeatedActions: BossAction[] = [
    {
        type: ActionType.PostDefeatedAttack,
        name: '地底の静寂',
        description: '深い地底の静かな環境でプレイヤーを包み込む',
        messages: [
            '<USER>は地底深くへと潜っていく...',
            '<TARGET>は静寂な地底の暗闇に包まれ、安らかな眠りに落ちていく'
        ],
        weight: 30,
        playerStateCondition: 'defeated'
    },
    {
        type: ActionType.PostDefeatedAttack,
        name: '鉱物吸収',
        description: '体内で地底の鉱物を使ってプレイヤーを石化保存する',
        messages: [
            '<USER>の体内に地底の鉱物が流れ込む...',
            '<TARGET>の体がゆっくりと美しい鉱石へと変化していく'
        ],
        statusEffect: StatusEffectType.Petrified,
        statusChance: 0.8,
        weight: 25,
        playerStateCondition: 'defeated'
    },
    {
        type: ActionType.PostDefeatedAttack,
        name: '地下水循環',
        description: '体内の地下水系でプレイヤーを優しく循環させる',
        messages: [
            '<USER>の体内で清らかな地下水が流れている...',
            '<TARGET>は地下水流に包まれながら永遠の安息を得る'
        ],
        weight: 20,
        playerStateCondition: 'defeated'
    },
    {
        type: ActionType.PostDefeatedAttack,
        name: '化石化保存',
        description: '時間をかけて獲物を化石として完全保存する',
        messages: [
            '<USER>は獲物を大切に保存しようとしている...',
            '<TARGET>は悠久の時を超えて保存されるため、ゆっくりと化石へと変化していく'
        ],
        weight: 15,
        playerStateCondition: 'defeated'
    }
];

export const undergroundWormData: BossData = {
    id: 'underground-worm',
    name: 'UndergroundWorm',
    displayName: '🪨 地底のワーム',
    description: '地底深くに住む巨大な虫',
    questNote: '地底深くの洞窟に巨大なワームが住み着いている。硬い岩も飲み込む強靭な顎を持つ危険な生物を討伐し、地下世界の平和を取り戻すことがあなたの任務だ。',
    maxHp: 380,
    attackPower: 12,
    icon: '🪨',
    explorerLevelRequired: 5,
    actions: undergroundWormActions.concat(undergroundWormDevourActions).concat(undergroundWormPostDefeatedActions),
    aiStrategy: (boss: Boss, player: Player, turn: number) => {
        // プレイヤーが敗北状態の場合は敗北後攻撃を使用
        if (player.isDefeated()) {
            const postDefeatedActions = boss.actions.filter(a => a.type === ActionType.PostDefeatedAttack);
            if (postDefeatedActions.length > 0) {
                const weights = postDefeatedActions.map(a => a.weight || 1);
                const totalWeight = weights.reduce((sum, w) => sum + w, 0);
                let random = Math.random() * totalWeight;
                
                for (let i = 0; i < postDefeatedActions.length; i++) {
                    random -= weights[i];
                    if (random <= 0) {
                        return postDefeatedActions[i];
                    }
                }
                return postDefeatedActions[0];
            }
        }
        
        // HP が50%以下になったら積極的に丸呑みを狙う
        if (boss.hp <= boss.maxHp * 0.5) {
            if (!player.isEaten() && Math.random() < 0.6) {
                const eatAction = boss.actions.find(a => a.type === ActionType.EatAttack);
                if (eatAction && eatAction.canUse?.(boss, player, turn) !== false) {
                    return eatAction;
                }
            }
        }
        
        // プレイヤーが石化していない場合は石化攻撃を優先
        if (!player.statusEffects.hasEffect(StatusEffectType.Petrified) && Math.random() < 0.4) {
            const petrifyAction = boss.actions.find(a => 
                a.type === ActionType.StatusAttack && 
                a.statusEffect === StatusEffectType.Petrified
            );
            if (petrifyAction && petrifyAction.canUse?.(boss, player, turn) !== false) {
                return petrifyAction;
            }
        }
        
        // 拘束攻撃の使用判定
        if (!player.isRestrained() && !player.isEaten() && Math.random() < 0.25) {
            const restraintAction = boss.actions.find(a => a.type === ActionType.RestraintAttack);
            if (restraintAction && restraintAction.canUse?.(boss, player, turn) !== false) {
                return restraintAction;
            }
        }
        
        // 通常攻撃をデフォルト
        const defaultAction = boss.actions.find(a => a.type === ActionType.Attack);
        if (!defaultAction) {
            throw new Error('No default action found for underground worm');
        }
        return defaultAction;
    },
    
    // 記念品設定
    victoryTrophy: {
        name: '地底の化石',
        description: '地底のワームの住む洞窟で発見された美しい古代生物の化石。悠久の時を物語る神秘的な輝きを放っている。'
    },
    defeatTrophy: {
        name: '鉱石の結晶',
        description: '地底のワームの体内で形成された美しい鉱石の結晶。地底世界の神秘的な力が込められた宝石のような逸品。'
    }
};