import { BossData, ActionType, BossAction, Boss } from '../../entities/Boss';
import { Player } from '../../entities/Player';
import { StatusEffectType } from '../../systems/StatusEffectTypes';

const undergroundWormActions: BossAction[] = [
    {
        id: 'ground-crack',
        type: ActionType.Attack,
        name: '地割れ',
        description: '地面を割いて攻撃',
        messages: [
            '「グルルル...」',
            '{boss}は地面を割って{player}を攻撃した！',
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.2,
        weight: 40,
        hitRate: 0.85,
        playerStateCondition: 'normal'
    },
    {
        id: 'petrifying-breath',
        type: ActionType.StatusAttack,
        name: '石化の息',
        description: '体を石のように固める息を吐いて敵を石化させる',
        messages: [
            '「シュルシュル...」',
            '{boss}は石化の息を吐いた！',
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.8,
        hitRate: 0.75,
        statusEffect: StatusEffectType.Petrified,
        statusChance: 0.6, // 石化の成功率
        weight: 25,
        canUse: (boss, player, turn) => {
            if (player.statusEffects.hasEffect(StatusEffectType.Petrified)) {
                return false;
            }
            
            // 最後に石化攻撃を行ったターンから20ターン以上経過している場合のみ使用可能
            const lastTurnPetrified = boss.getCustomVariable('lastTurnPetrified') || -20;
            if (turn - lastTurnPetrified < 20) {
                return false;
            }
            
            return true;
        },
        onUse: (boss, player, turn) => {
            if (player.statusEffects.hasEffect(StatusEffectType.Petrified)) {
                // 石化攻撃を行ったターンを記録
                boss.setCustomVariable('lastTurnPetrified', turn);
            }

            return [];
        }
    },
    {
        id: 'coiling-restraint',
        type: ActionType.RestraintAttack,
        name: '巻き込み拘束',
        description: '巨大な体で相手を巻き込む',
        messages: [
            '「グオオオ...」',
            '{boss}は巨大な体で{player}を巻き込んだ！',
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.9,
        weight: 15,
        canUse: (_boss, player, _turn) => {
            return !player.isRestrained() && !player.isEaten() && Math.random() < 0.4;
        }
    },
    {
        id: 'whole-swallow',
        type: ActionType.EatAttack,
        name: '丸呑み',
        description: '巨大な口で相手を呑み込む',
        messages: [
            '「ガバッ！」',
            '{boss}は巨大な口を開いて{player}を呑み込んだ！',
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.1,
        weight: 20,
        hitRate: 0.7,
        canUse: (_boss, player, _turn) => {
            return !player.isEaten() && player.getHpPercentage() <= 50 && Math.random() < 0.6;
        }
    }
];

const undergroundWormDevourActions: BossAction[] = [
    {
        id: 'gravel-grinding',
        type: ActionType.DevourAttack,
        name: '体内研磨',
        description: '凸凹した胃壁でプレイヤーを研磨する',
        messages: [
            'ざらざらとした{boss}の胃壁が激しく動き、{player}を研磨する...',
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.4,
        weight: 35
    },
    {
        id: 'digestive-acid-attack',
        type: ActionType.DevourAttack,
        name: '胃液攻撃',
        description: '砂まみれの胃液で攻撃',
        messages: [
            '砂まみれの胃液が{player}を覆い、体力を奪う...',
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.7,
        weight: 40
    },
    {
        id: 'petrifying-digestion',
        type: ActionType.StatusAttack,
        name: '石化の胃液',
        description: '体内で石化の胃液を浴びせる',
        messages: [
            '{boss}の体内で特殊な胃液が{player}を覆う！',
        ],
        statusEffect: StatusEffectType.Petrified,
        weight: 25,
        canUse: (boss, player, turn) => {
            if (player.statusEffects.hasEffect(StatusEffectType.Petrified)) {
                return false;
            }
            
            // 20ターンごとに使用可能
            const lastTurnPetrified = boss.getCustomVariable('lastTurnPetrified') || -20;
            if (lastTurnPetrified + 20 > turn) {
                return false; // 20ターン経過していない
            }
            
            return true;
        },
        onUse: (boss, player, turn) => {
            if (player.statusEffects.hasEffect(StatusEffectType.Petrified)) {
                // 石化攻撃を行ったターンを記録
                boss.setCustomVariable('lastTurnPetrified', turn);
            }

            return [];
        }
    }
];

// とどめ攻撃
const undergroundWormFinishActions: BossAction[] = [
    // とどめ攻撃（プレイヤーがDoomed状態時）
    {
        id: 'finishing-gulp',
        type: ActionType.FinishingMove,
        name: '体内保管器官へ',
        description: '体内で力尽きた獲物を石化させ、さらに奥深くの石化器官に送り込む',
        weight: 100,
        playerStateCondition: 'defeated',
        messages: [
            '{boss}の体内活動に耐えられなかった{player}は、ゆっくりと石化していく...',
            '{boss}の胃袋が収縮し、{player}を体内保管器官へと送り込む！',
            '{player}は石化したまま、{boss}の気が済むまで体内に保存されることになる...',
        ],
        onUse: (_boss: Boss, player: Player) => {
            // 再起不能状態を解除 (TODO: Dead 状態付与時に自動解除したい)
            player.statusEffects.removeEffect(StatusEffectType.Doomed);
            // プレイヤーを敗北状態にする
            player.statusEffects.addEffect(StatusEffectType.Dead);
            // 石化状態にする
            player.statusEffects.addEffect(StatusEffectType.Petrified, -1); // 永続的に石化状態にする

            // メッセージは設定されているのでここでは何もしない
            return [];
        }
    },
];

// 敗北後の継続攻撃（プレイヤーがKO状態で体内にいる時）
const undergroundWormPostDefeatedActions: BossAction[] = [
    {
        id: 'underground-silence',
        type: ActionType.PostDefeatedAttack,
        name: '地底の静寂',
        description: '深い地底の静かな環境でプレイヤーを包み込む',
        messages: [
            '{boss}は地底深くへと潜っていく...',
            '{player}は静寂な地底の暗闇に包まれ、安らかな眠りに落ちていく'
        ],
        weight: 30,
        playerStateCondition: 'defeated'
    },
    {
        id: 'mineral-absorption',
        type: ActionType.PostDefeatedAttack,
        name: '鉱物吸収',
        description: '体内で地底の鉱物を使ってプレイヤーを石化保存する',
        messages: [
            '{boss}の体内に地底の鉱物が流れ込む...',
            '{player}の体がゆっくりと鉱石へと変化していく...'
        ],
        weight: 25,
        playerStateCondition: 'defeated'
    },
    {
        id: 'groundwater-circulation',
        type: ActionType.PostDefeatedAttack,
        name: '地下水循環',
        description: '体内の地下水系でプレイヤーを優しく循環させる',
        messages: [
            '{boss}の体内で清らかな地下水が流れている...',
            '{player}は地下水流に包まれながら安息を得る...'
        ],
        weight: 20,
        playerStateCondition: 'defeated'
    },
    {
        id: 'underground-grinding',
        type: ActionType.PostDefeatedAttack,
        name: '深い体内での研磨',
        description: '保存している石化した獲物をゆっくりと研磨する',
        messages: [
            '{boss}のざらさらな胃壁がゆっくりと動き、{player}を優しく研磨する...',
            '石化した{player}の体が磨かれ、綺麗な体として保存される...'
        ],
        weight: 15,
        playerStateCondition: 'defeated'
    }
];

export const undergroundWormData: BossData = {
    id: 'underground-worm',
    name: 'UndergroundWorm',
    displayName: '地底のワーム',
    description: '地底深くに住む巨大な虫',
    questNote: '地底深くの洞窟に巨大なワームが住み着いている。硬い岩も飲み込む強靭な顎を持つ危険な生物を討伐し、地下世界の平和を取り戻すことがあなたの任務だ。',
    appearanceNote: '巨大ミミズ、岩石のような硬い外殻、鉱物の結晶で覆われた体、長い体',
    maxHp: 800,
    attackPower: 13,
    icon: '🪨',
    explorerLevelRequired: 5,
    battleStartMessages: [
        {
            speaker: 'player',
            style: 'default',
            text: 'あなたは地底深くで巨大なワームと遭遇した。'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「グルルル...」'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: '地底のワームは岩をも砕く強靭な顎を見せつけながら、威嚇するように唸り声を上げている...'
        }
    ],
    victoryMessages: [
        {
            speaker: 'player',
            style: 'default',
            text: '地底のワームを倒した！'
        }
    ],
    actions: undergroundWormActions.concat(undergroundWormDevourActions).concat(undergroundWormPostDefeatedActions),
    customVariables: {
        defeatStartTurn: -1, // 敗北開始ターン
        lastTurnPetrified: -20, // 最後に石化攻撃を行ったターン
    },
    suppressAutoFinishingMove: true, // 自動的なとどめ攻撃を抑制
    aiStrategy: (boss: Boss, player: Player, turn: number) => {
        // プレイヤーが敗北状態の場合は敗北後攻撃を使用
        if (player.isDefeated()) {
            let defeatStartTurn = boss.getCustomVariable('defeatStartTurn', -1);
            if (defeatStartTurn === -1) {
                // 敗北開始ターンを記録
                defeatStartTurn = turn - 1;
                boss.setCustomVariable('defeatStartTurn', defeatStartTurn);
            }
            
            const turnsSinceDefeat = turn - boss.getCustomVariable<number>('defeatStartTurn', turn);
            // 8 ターンごとに特殊演出
            if (turnsSinceDefeat > 0 && turnsSinceDefeat % 8 === 0) {
                return {
                    id: 'reincarnation-predation',
                    type: ActionType.PostDefeatedAttack,
                    name: '再石化',
                    description: '石化解除されそうになった獲物を再び石化させる',
                    messages: [
                        '{player}の石化が緩み、体が少しずつ動くようになる...',
                        '体を動かすと、{boss}がそれに気づいたのか、胃袋がうごめき始める...',
                        '突如、{boss}の胃袋が大量の胃液を放出し、{player}を包み込む！',
                        '{player}はその胃液を浴びせられ、再び石化の状態に戻っていく...',
                        '{player}が再び完全石化すると、{boss}の胃袋は{player}の体を元の位置に戻し、静かに安息を与える...',
                    ],
                    weight: 1
                };
            }
            
            const postDefeatedActions = undergroundWormPostDefeatedActions.filter(a => a.canUse?.(boss, player, turn) !== false);
            
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
        
        // 食べられ＋最大HP0でとどめ攻撃
        if (player.isEaten() && player.isDoomed()) {
            const finishingActions = undergroundWormFinishActions;
            return finishingActions[0];
        }
        
        // 食べられ状態時の行動
        if (player.isEaten()) {
            const devourActions = undergroundWormDevourActions.filter(a => a.canUse?.(boss, player, turn) !== false);
            const weights = devourActions.map(a => a.weight || 1);
            const totalWeight = weights.reduce((sum, w) => sum + w, 0);
            let random = Math.random() * totalWeight;
            
            for (let i = 0; i < devourActions.length; i++) {
                random -= weights[i];
                if (random <= 0) {
                    return devourActions[i];
                }
            }
            return devourActions[0];
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
        
        // 通常行動
        const defaultActions = undergroundWormActions.filter(a => a.canUse?.(boss, player, turn) !== false);
        if (defaultActions.length > 0) {
            const weights = defaultActions.map(a => a.weight || 1);
            const totalWeight = weights.reduce((sum, w) => sum + w, 0);
            let random = Math.random() * totalWeight;
            
            for (let i = 0; i < defaultActions.length; i++) {
                random -= weights[i];
                if (random <= 0) {
                    return defaultActions[i];
                }
            }
            return defaultActions[0];
        }
        
        // デフォルトの攻撃行動
        return undergroundWormActions[0];
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