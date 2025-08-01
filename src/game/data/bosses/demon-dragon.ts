import { Player } from '@/game/entities/Player';
import { BossData, ActionType, BossAction, Boss } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffectTypes';

const demonDragonActions: BossAction[] = [
    // 通常行動パターン
    {
        id: 'stomp-attack',
        type: ActionType.Attack,
        name: '踏みつけ',
        description: '巨大な足で踏みつける強力な攻撃',
        damageFormula: (user: Boss) => user.attackPower * 1.0,
        hitRate: 0.90,
        weight: 30,
        playerStateCondition: 'normal',
        messages: [
            '「グォォォォ...」',
            '{boss}は巨大な足を振り上げ、{player}を踏みつけようとしてきた！'
        ]
    },
    {
        id: 'dark-magic-bullet',
        type: ActionType.Attack,
        name: '闇の魔法弾',
        description: '闇の力を込めた魔法弾を放つ',
        damageFormula: (user: Boss) => user.attackPower * 1.2,
        hitRate: 0.85,
        weight: 25,
        playerStateCondition: 'normal',
        messages: [
            '「フシュルルル...」',
            '{boss}の口から闇の魔法弾が放たれた！'
        ]
    },
    {
        id: 'slime-spit',
        type: ActionType.StatusAttack,
        name: '粘液発射',
        description: '粘着性の粘液を吐きかける',
        damageFormula: (user: Boss) => user.attackPower * 0.8,
        statusEffect: StatusEffectType.Slimed,
        statusChance: 0.75,
        hitRate: 0.80,
        weight: 20,
        playerStateCondition: 'normal',
        messages: [
            '「ペッ！」',
            '{boss}は粘つく液体を{player}に向けて吐いた！'
        ]
    },
    {
        id: 'tail-restraint',
        type: ActionType.RestraintAttack,
        name: 'しっぽ拘束',
        description: '長い尻尾で対象を捕らえる',
        weight: 15,
        hitRate: 0.70,
        playerStateCondition: 'normal',
        canUse: (_boss, player, _turn) => {
            return !player.isRestrained() && !player.isEaten() && Math.random() < 0.4;
        },
        messages: [
            '「シュルルル...」',
            '{boss}の長い尻尾が{player}に向かって伸びてくる！'
        ]
    },

    // 拘束中専用行動
    {
        id: 'tail-squeeze',
        type: ActionType.Attack,
        name: 'しっぽ締め付け',
        description: '拘束中の獲物を尻尾で締め付ける',
        damageFormula: (user: Boss) => user.attackPower * 1.1,
        weight: 35,
        playerStateCondition: 'restrained',
        messages: [
            '「グルルル...」',
            '{boss}は{player}を尻尾でぎゅうぎゅうと締め付ける！'
        ]
    },
    {
        id: 'licking-caress',
        type: ActionType.StatusAttack,
        name: '舐め回し',
        description: '拘束中の獲物を大きな舌で舐めまわす',
        damageFormula: (user: Boss) => user.attackPower * 0.6,
        statusEffect: StatusEffectType.Charm,
        statusChance: 0.85,
        weight: 30,
        playerStateCondition: 'restrained',
        messages: [
            '「ペロペロ...」',
            '{boss}は大きな舌で{player}をべろべろと舐めまわした！'
        ]
    },
    {
        id: 'fur-absorption',
        type: ActionType.Attack,
        name: '体毛による吸収',
        description: '紫色の体毛から{player}の生命力を吸収する',
        damageFormula: (user: Boss) => user.attackPower * 0.9,
        healRatio: 0.5,
        weight: 25,
        playerStateCondition: 'restrained',
        messages: [
            '「ゾゾゾ...」',
            '{boss}の体毛が蠢き、{player}の生命力を吸収し始めた！'
        ]
    },
    {
        id: 'hypnotic-gaze',
        type: ActionType.StatusAttack,
        name: '目を合わせて催眠術',
        description: '拘束中の獲物と目を合わせて催眠術をかける',
        statusEffect: StatusEffectType.Hypnosis,
        statusChance: 0.90,
        weight: 20,
        playerStateCondition: 'restrained',
        messages: [
            '「見つめていなさい...」',
            '{boss}の瞳が妖艶に光り、{player}は催眠術にかかってしまった！'
        ]
    },
    {
        id: 'swallow-whole',
        type: ActionType.EatAttack,
        name: '丸呑み',
        description: 'KO状態で拘束中の獲物を丸呑みにする',
        weight: 100,
        playerStateCondition: 'ko',
        canUse: (_boss, player, _turn) => {
            return player.isKnockedOut() && player.isRestrained();
        },
        messages: [
            '「グオオオ...」',
            '{boss}は動けなくなった{player}を大きな口に含んでいく...',
            'ゴクン...',
            '{player}は{boss}の体内に取り込まれてしまった！'
        ]
    },

    // ソウルバキューム特殊技
    {
        id: 'soul-vacuum',
        type: ActionType.EatAttack,
        name: 'ソウルバキューム',
        description: '口を大きく開け、あらゆる生きる魂を直接吸い込む',
        weight: 1,
        playerStateCondition: 'normal',
        canUse: (boss: Boss, player: Player, turn: number) => {
            const lastSoulVacuumTurn = boss.getCustomVariable<number>('lastSoulVacuumTurn', -100);
            // 1ターン目または30ターン経過後に使用可能
            return (turn === 1 || turn - lastSoulVacuumTurn >= 30) && !player.isEaten() && !player.isRestrained();
        },
        onUse: (boss: Boss, _player: Player, turn: number) => {
            boss.setCustomVariable('lastSoulVacuumTurn', turn);
            return [];
        },
        messages: [
            '「魂よ、我が下に来たれ...」',
            '{boss}は口を大きく開き、強力な吸引力を発生させた！',
            '{player}は抵抗する間もなく{boss}の口の中に吸い込まれてしまった！'
        ]
    },

    // 食べられ状態システム (簡略化: 3段階)
    {
        id: 'esophagus-travel',
        type: ActionType.DevourAttack,
        name: '食道移動',
        description: '食道内を移動しながら最大HPを奪われる',
        damageFormula: (user: Boss) => user.attackPower * 0.6,
        weight: 1,
        playerStateCondition: 'eaten',
        canUse: (boss: Boss, _player: Player, _turn: number) => {
            const eatenTurnCount = boss.getCustomVariable<number>('eatenTurnCount', 0);
            return eatenTurnCount <= 2;
        },
        messages: [
            '{boss}の食道内で{player}は温かく湿った環境に包まれている...',
            '食道の壁が蠕動し、{player}を胴体部へと押し流していく...',
            '{player}の最大HPが減少した！'
        ]
    },
    {
        id: 'crop-arrival',
        type: ActionType.DevourAttack,
        name: '嗉嚢到着',
        description: '嗉嚢に到着、脱出の最後のチャンス',
        damageFormula: (user: Boss) => user.attackPower * 0.4,
        weight: 1,
        playerStateCondition: 'eaten',
        canUse: (boss: Boss, _player: Player, _turn: number) => {
            const eatenTurnCount = boss.getCustomVariable<number>('eatenTurnCount', 0);
            return eatenTurnCount === 3;
        },
        messages: [
            '{player}は{boss}の嗉嚢に到着してしまった...',
            '温かく心地よい感覚に包まれているが、これが最後のチャンスだ！',
            '次のターンまでに脱出しなければ、魔の胃袋に取り込まれてしまう！'
        ]
    },
    {
        id: 'demon-stomach-absorption',
        type: ActionType.DevourAttack,
        name: '魔の胃袋取り込み',
        description: '不定形の触手が伸び、プレイヤーを魔の胃袋に取り込む',
        weight: 1,
        playerStateCondition: 'eaten',
        canUse: (boss: Boss, _player: Player, _turn: number) => {
            const eatenTurnCount = boss.getCustomVariable<number>('eatenTurnCount', 0);
            return eatenTurnCount >= 4;
        },
        onUse: (boss: Boss, player: Player, _turn: number) => {
            // プレイヤーを敗北状態にする
            player.maxHp = 0;
            player.statusEffects.addEffect(StatusEffectType.Doomed);
            player.statusEffects.addEffect(StatusEffectType.DemonStomach);
            
            // 敗北状態の初期設定
            boss.setCustomVariable('stomachPattern', Math.floor(Math.random() * 3)); // 0-2のパターン
            
            return [];
        },
        messages: [
            '嗉嚢の奥から、不定形の黒い触手がゆっくりと現れる...',
            '触手は{player}を優しく包み込み、魔の胃袋へと導いていく...',
            '{player}の最大HPが0になってしまった！',
            '{player}は魔の胃袋に取り込まれ、敗北状態になった...'
        ]
    },

    // 敗北状態システム - 統合版（パターン別メッセージ）
    {
        id: 'stomach-experience',
        type: ActionType.PostDefeatedAttack,
        name: '魔の胃袋体験',
        description: '魔の胃袋で幸せな体験をする',
        weight: 100,
        playerStateCondition: 'defeated',
        messages: [] // 動的に設定される
    }
];

// ヘルパー関数: パターン別メッセージ生成
const getStomachMessages = (pattern: number): string[] => {
    const patterns = [
        [ // パターン0: 粘液付けの胃袋
            '暖かい粘液が{player}の全身を優しく包み込んでいく...',
            '粘液は{player}の肌に心地よく密着し、至福の感覚をもたらす...',
            '{player}は粘液の暖かさに包まれて、とても幸せな気分になっている...'
        ],
        [ // パターン1: 触手詰めの胃袋
            '無数の柔らかい触手が{player}に近づき、優しく愛撫していく...',
            '触手は絹のような手触りで、{player}に極上の快感をもたらす...',
            '{player}は触手の愛撫に完全に魅了され、至福の時を過ごしている...'
        ],
        [ // パターン2: 圧縮胃袋
            '胃袋の壁がゆっくりと収縮し、{player}に心地よい圧迫感を与える...',
            '絶妙な圧力が{player}を包み込み、究極の安心感をもたらす...',
            '{player}は圧力による完璧な抱擁の中で、真の幸福を見つけた...'
        ]
    ];
    return patterns[pattern] || patterns[0];
};

// ヘルパー関数: 食べられ状態行動選択
const selectEatenAction = (boss: Boss, player: Player, turn: number): BossAction | null => {
    let eatenTurnCount = boss.getCustomVariable<number>('eatenTurnCount', 0);
    eatenTurnCount++;
    boss.setCustomVariable('eatenTurnCount', eatenTurnCount);
    
    const eatenActions = demonDragonActions.filter(action => 
        action.playerStateCondition === 'eaten' && 
        action.canUse && action.canUse(boss, player, turn)
    );
    
    return eatenActions.length > 0 ? eatenActions[0] : null;
};

// ヘルパー関数: 敗北状態行動選択
const selectDefeatedAction = (boss: Boss): BossAction => {
    const stomachPattern = boss.getCustomVariable<number>('stomachPattern', 0);
    const stomachAction = demonDragonActions.find(action => action.id === 'stomach-experience');
    
    if (stomachAction) {
        // パターンに応じたメッセージを動的に設定
        stomachAction.messages = getStomachMessages(stomachPattern);
        return stomachAction;
    }
    
    return demonDragonActions[0];
};

export const demonDragonData: BossData = {
    id: 'demon-dragon',
    name: 'DemonDragon',
    displayName: '魔界の竜',
    description: '魔界地方に生息する真紫の巨大なドラゴン',
    questNote: `魔界地方に、目に入る生き物をなんでも丸呑みにしてしまう巨大なドラゴンが現れた。真紫の体毛と蛇腹をもつ、四つ足で首の長いその竜は、丸呑みした生き物を長い首を通って胴体の嗉嚢まで送り、「魔の胃袋」と呼ばれる不定形の胃袋に取り込んでしまうという。魔の胃袋に取り込まれた生き物は、その生き物が感じる最も幸せな「体内保管プロセス」で閉じ込められ続けると言われている...`,
    maxHp: 2600,
    attackPower: 22,
    actions: demonDragonActions,
    icon: '🐉',
    explorerLevelRequired: 10,
    victoryTrophy: {
        name: '魔界竜の漆黒鱗',
        description: '魔界の竜の美しく禍々しい漆黒の鱗。魔界の力が宿っている。'
    },
    defeatTrophy: {
        name: '魔界の甘美液',
        description: '魔界の竜の体内から採取した甘美な体液。至福の記憶が込められている。'
    },
    personality: [
        'フシュルルル...新しい魂の香りがする...',
        'その魂、美味しそうだな...',
        '魔の胃袋で永遠に幸せにしてやろう...',
        'もがけばもがくほど美味しくなるぞ...'
    ],
    
    // 簡略化されたAI戦略
    aiStrategy: (boss: Boss, player: Player, turn: number): BossAction => {
        // プレイヤーが敗北状態の場合
        if (player.isDefeated()) {
            return selectDefeatedAction(boss);
        }
        
        // プレイヤーが食べられ状態の場合
        if (player.isEaten()) {
            const eatenAction = selectEatenAction(boss, player, turn);
            if (eatenAction) return eatenAction;
        }
        
        // ソウルバキューム特殊技の優先判定
        const soulVacuumAction = demonDragonActions.find(action => 
            action.id === 'soul-vacuum'
        );
        if (soulVacuumAction && soulVacuumAction.canUse && soulVacuumAction.canUse(boss, player, turn)) {
            return soulVacuumAction;
        }
        
        // プレイヤーがKO状態で拘束中の場合、丸呑みを優先
        if (player.isKnockedOut() && player.isRestrained()) {
            const swallowAction = demonDragonActions.find(action => 
                action.id === 'swallow-whole'
            );
            if (swallowAction) {
                boss.setCustomVariable('eatenTurnCount', 0);
                return swallowAction;
            }
        }
        
        // プレイヤーが拘束中の場合
        if (player.isRestrained()) {
            const restraintActions = demonDragonActions.filter(action => 
                action.playerStateCondition === 'restrained'
            );
            return selectWeightedAction(restraintActions);
        }
        
        // 通常状態の行動選択
        const normalActions = demonDragonActions.filter(action => 
            action.playerStateCondition === 'normal' && 
            (!action.canUse || action.canUse(boss, player, turn))
        );
        
        // HP50%以下で拘束攻撃の重みを上げる
        if (boss.hp / boss.maxHp <= 0.5) {
            const restraintAction = normalActions.find(action => action.id === 'tail-restraint');
            if (restraintAction) {
                return Math.random() < 0.4 ? restraintAction : selectWeightedAction(normalActions);
            }
        }
        
        return selectWeightedAction(normalActions);
    }
};

// ヘルパー関数: 重み付きランダム選択
function selectWeightedAction(actions: BossAction[]): BossAction {
    if (actions.length === 0) return demonDragonActions[0];
    
    const totalWeight = actions.reduce((sum, action) => sum + action.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const action of actions) {
        random -= action.weight;
        if (random <= 0) return action;
    }
    
    return actions[0];
}