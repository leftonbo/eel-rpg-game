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

    // 食べられ状態システム (1-6ターン)
    {
        id: 'peristalsis-1',
        type: ActionType.DevourAttack,
        name: '蠕動運動 (食道入り口)',
        description: '食道の入り口で蠕動により最大HPを奪う',
        damageFormula: (user: Boss) => user.attackPower * 0.5,
        weight: 1,
        playerStateCondition: 'eaten',
        canUse: (boss: Boss, _player: Player, _turn: number) => {
            const eatenTurnCount = boss.getCustomVariable<number>('eatenTurnCount', 0);
            return eatenTurnCount === 1;
        },
        messages: [
            '{boss}の食道の入り口で、{player}は温かく湿った環境に包まれる...',
            '食道の壁がゆっくりと蠕動し、{player}を奥へと送り込もうとしている...',
            '{player}の最大HPが少し減少した！'
        ]
    },
    {
        id: 'peristalsis-2',
        type: ActionType.DevourAttack,
        name: '蠕動運動 (食道中間部)',
        description: '食道の中間部での蠕動により最大HPを奪う',
        damageFormula: (user: Boss) => user.attackPower * 0.6,
        weight: 1,
        playerStateCondition: 'eaten',
        canUse: (boss: Boss, _player: Player, _turn: number) => {
            const eatenTurnCount = boss.getCustomVariable<number>('eatenTurnCount', 0);
            return eatenTurnCount === 2;
        },
        messages: [
            '{player}は食道の中間部に運ばれ、さらに強い蠕動に包まれる...',
            '周囲の筋肉が{player}を優しく包み込みながら、胴体部へと押し流していく...',
            '{player}の最大HPがさらに減少した！'
        ]
    },
    {
        id: 'peristalsis-3',
        type: ActionType.DevourAttack,
        name: '蠕動運動 (胴体部への移動)',
        description: '胴体部への移動中の蠕動により最大HPを奪う',
        damageFormula: (user: Boss) => user.attackPower * 0.7,
        weight: 1,
        playerStateCondition: 'eaten',
        canUse: (boss: Boss, _player: Player, _turn: number) => {
            const eatenTurnCount = boss.getCustomVariable<number>('eatenTurnCount', 0);
            return eatenTurnCount === 3;
        },
        messages: [
            '{player}は長い首から胴体部へと運ばれていく...',
            '蠕動がより強くなり、{player}の体をぎゅうぎゅうと圧迫しながら押し流していく...',
            '{player}の最大HPがかなり減少した！'
        ]
    },
    {
        id: 'peristalsis-4',
        type: ActionType.DevourAttack,
        name: '蠕動運動 (嗉嚢手前)',
        description: '嗉嚢手前での最終蠕動により最大HPを奪う',
        damageFormula: (user: Boss) => user.attackPower * 0.8,
        weight: 1,
        playerStateCondition: 'eaten',
        canUse: (boss: Boss, _player: Player, _turn: number) => {
            const eatenTurnCount = boss.getCustomVariable<number>('eatenTurnCount', 0);
            return eatenTurnCount === 4;
        },
        messages: [
            '{player}は嗉嚢の手前まで運ばれてきた...',
            '最後の強力な蠕動が{player}を包み込み、もはや逃れることは困難になってきた...',
            '{player}の最大HPが大幅に減少した！'
        ]
    },
    {
        id: 'reach-crop',
        type: ActionType.DevourAttack,
        name: '嗉嚢到着',
        description: '嗉嚢に到着し、次のターンに脱出できないと危険な状況に',
        damageFormula: (user: Boss) => user.attackPower * 0.3,
        weight: 1,
        playerStateCondition: 'eaten',
        canUse: (boss: Boss, _player: Player, _turn: number) => {
            const eatenTurnCount = boss.getCustomVariable<number>('eatenTurnCount', 0);
            return eatenTurnCount === 5;
        },
        messages: [
            '{player}はついに{boss}の嗉嚢に到着してしまった...',
            '嗉嚢の中は温かく、不思議と心地よい感覚に包まれている...',
            'しかし、ここから先に進んでしまうと、もう二度と戻れなくなってしまうだろう...',
            '次のターンまでに脱出しなければ、非常に危険な状況になる！'
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
            return eatenTurnCount === 6;
        },
        onUse: (boss: Boss, player: Player, _turn: number) => {
            // プレイヤーを敗北状態にする
            player.maxHp = 0;
            player.statusEffects.addEffect(StatusEffectType.Doomed);
            player.statusEffects.addEffect(StatusEffectType.DemonStomach);
            
            // 敗北状態の初期設定
            boss.setCustomVariable('postDefeatedTurn', 0);
            boss.setCustomVariable('currentStomachPattern', Math.floor(Math.random() * 3)); // 0-2のパターン
            boss.setCustomVariable('stomachPatternTimer', 0);
            
            return [];
        },
        messages: [
            '嗉嚢の奥から、不定形の黒い触手がゆっくりと現れる...',
            '触手は{player}を優しく包み込み、魔の胃袋へと導いていく...',
            '{player}の最大HPが0になってしまった！',
            '{player}は魔の胃袋に取り込まれ、敗北状態になった...'
        ]
    },

    // 敗北状態システム - パターンA: 粘液付けの胃袋 (4行動)
    {
        id: 'slime-wrap',
        type: ActionType.PostDefeatedAttack,
        name: '粘液包み込み',
        description: '暖かい粘液が全身を優しく包み込む',
        weight: 25,
        playerStateCondition: 'defeated',
        canUse: (boss: Boss, _player: Player, _turn: number) => {
            return boss.getCustomVariable<number>('currentStomachPattern', 0) === 0;
        },
        messages: [
            '暖かい粘液が{player}の全身を優しく包み込んでいく...',
            '粘液は{player}の肌に心地よく密着し、安らかな感覚をもたらす...',
            '{player}は粘液の暖かさに包まれて、とても幸せな気分になっている...'
        ]
    },
    {
        id: 'slime-massage',
        type: ActionType.PostDefeatedAttack,
        name: '粘液マッサージ',
        description: '波状の粘液による心地よいマッサージ',
        weight: 25,
        playerStateCondition: 'defeated',
        canUse: (boss: Boss, _player: Player, _turn: number) => {
            return boss.getCustomVariable<number>('currentStomachPattern', 0) === 0;
        },
        messages: [
            '粘液が波のようにうねり、{player}を心地よくマッサージしてくれる...',
            'リズミカルな粘液の動きが、{player}の疲れを癒していく...',
            '{player}は粘液マッサージの気持ちよさに、うっとりとしている...'
        ]
    },
    {
        id: 'slime-penetration',
        type: ActionType.PostDefeatedAttack,
        name: '粘液浸透',
        description: '肌への浸透による幸福感',
        weight: 25,
        playerStateCondition: 'defeated',
        canUse: (boss: Boss, _player: Player, _turn: number) => {
            return boss.getCustomVariable<number>('currentStomachPattern', 0) === 0;
        },
        messages: [
            '粘液が{player}の肌に浸透し、幸せな感覚が体の奥まで染み渡る...',
            '体の芯から温かくなり、これまでに感じたことのない至福に包まれる...',
            '{player}は粘液が運ぶ幸福感に完全に身を委ねている...'
        ]
    },
    {
        id: 'slime-unity',
        type: ActionType.PostDefeatedAttack,
        name: '粘液一体化',
        description: '粘液と一体化した至福状態',
        weight: 25,
        playerStateCondition: 'defeated',
        canUse: (boss: Boss, _player: Player, _turn: number) => {
            return boss.getCustomVariable<number>('currentStomachPattern', 0) === 0;
        },
        messages: [
            'もはや{player}は粘液と一体になったような至福の感覚に包まれている...',
            '自分と粘液の境界が曖昧になり、永遠にこの状態でいたいと感じる...',
            '{player}は粘液と共に存在する完璧な調和の中にいる...'
        ]
    },

    // 敗北状態システム - パターンB: 触手詰めの胃袋 (4行動)
    {
        id: 'tentacle-appearance',
        type: ActionType.PostDefeatedAttack,
        name: '触手登場',
        description: '柔らかい触手の登場',
        weight: 25,
        playerStateCondition: 'defeated',
        canUse: (boss: Boss, _player: Player, _turn: number) => {
            return boss.getCustomVariable<number>('currentStomachPattern', 0) === 1;
        },
        messages: [
            '無数の柔らかい触手がゆっくりと{player}に近づいてくる...',
            '触手は絹のような手触りで、{player}を優しく撫でていく...',
            '{player}は触手の柔らかさに心を奪われている...'
        ]
    },
    {
        id: 'tentacle-caress',
        type: ActionType.PostDefeatedAttack,
        name: '触手愛撫',
        description: '全身への優しい愛撫',
        weight: 25,
        playerStateCondition: 'defeated',
        canUse: (boss: Boss, _player: Player, _turn: number) => {
            return boss.getCustomVariable<number>('currentStomachPattern', 0) === 1;
        },
        messages: [
            '触手たちが{player}の全身を優しく撫で回し、抵抗する気力を奪っていく...',
            '繊細な触手の動きが{player}に極上の快感をもたらす...',
            '{player}は触手の愛撫に完全に魅了されてしまった...'
        ]
    },
    {
        id: 'tentacle-embrace',
        type: ActionType.PostDefeatedAttack,
        name: '触手包み込み',
        description: '触手による完全包囲体験',
        weight: 25,
        playerStateCondition: 'defeated',
        canUse: (boss: Boss, _player: Player, _turn: number) => {
            return boss.getCustomVariable<number>('currentStomachPattern', 0) === 1;
        },
        messages: [
            '触手に完全に包まれ、{player}のあらゆる部分が愛撫され続ける...',
            '触手の温かい抱擁の中で、{player}は安心感と快感に包まれる...',
            '{player}は触手たちの愛に包まれて、至福の時を過ごしている...'
        ]
    },
    {
        id: 'tentacle-domination',
        type: ActionType.PostDefeatedAttack,
        name: '触手支配',
        description: '触手による完全支配状態',
        weight: 25,
        playerStateCondition: 'defeated',
        canUse: (boss: Boss, _player: Player, _turn: number) => {
            return boss.getCustomVariable<number>('currentStomachPattern', 0) === 1;
        },
        messages: [
            '触手の愛撫に完全に支配され、{player}には幸福感だけが残っている...',
            'もはや触手なしでは生きていけないと感じるほど、深い絆を感じる...',
            '{player}は触手たちの優しい支配下で、永遠の幸せを手に入れた...'
        ]
    },

    // 敗北状態システム - パターンC: 圧縮胃袋 (4行動)
    {
        id: 'pressure-start',
        type: ActionType.PostDefeatedAttack,
        name: '圧力開始',
        description: '心地よい圧迫感の開始',
        weight: 25,
        playerStateCondition: 'defeated',
        canUse: (boss: Boss, _player: Player, _turn: number) => {
            return boss.getCustomVariable<number>('currentStomachPattern', 0) === 2;
        },
        messages: [
            '胃袋の壁がゆっくりと収縮し、{player}に心地よい圧迫感を与えてくる...',
            '適度な圧力が{player}を包み込み、安心できる感覚をもたらす...',
            '{player}は優しい圧迫感に包まれて、リラックスしている...'
        ]
    },
    {
        id: 'pressure-enhance',
        type: ActionType.PostDefeatedAttack,
        name: '圧力強化',
        description: '優しい押しつぶし感覚',
        weight: 25,
        playerStateCondition: 'defeated',
        canUse: (boss: Boss, _player: Player, _turn: number) => {
            return boss.getCustomVariable<number>('currentStomachPattern', 0) === 2;
        },
        messages: [
            '圧力が強くなり、{player}の全身が優しく押しつぶされる幸せな感覚...',
            '胃袋の壁が{player}を愛おしそうに抱きしめるように圧迫する...',
            '{player}は圧迫されることの心地よさに目覚めている...'
        ]
    },
    {
        id: 'pressure-adjust',
        type: ActionType.PostDefeatedAttack,
        name: '圧力調整',
        description: '安心感をもたらす絶妙圧力',
        weight: 25,
        playerStateCondition: 'defeated',
        canUse: (boss: Boss, _player: Player, _turn: number) => {
            return boss.getCustomVariable<number>('currentStomachPattern', 0) === 2;
        },
        messages: [
            '絶妙な圧力で包み込まれ、{player}はまるで安全な場所にいるような安心感を得る...',
            '胃袋の圧力が{player}を完璧に支え、不安や恐怖が消えていく...',
            '{player}は圧力に守られているような、究極の安心感に包まれている...'
        ]
    },
    {
        id: 'pressure-perfection',
        type: ActionType.PostDefeatedAttack,
        name: '圧力完成',
        description: '永続願望を生む完璧圧力',
        weight: 25,
        playerStateCondition: 'defeated',
        canUse: (boss: Boss, _player: Player, _turn: number) => {
            return boss.getCustomVariable<number>('currentStomachPattern', 0) === 2;
        },
        messages: [
            '完璧な圧力に包まれ、{player}はこの状態が永遠に続けばいいと思ってしまう...',
            'もはや外の世界には戻りたくないと感じるほど、完璧な環境に包まれている...',
            '{player}は圧力による完璧な抱擁の中で、真の幸福を見つけた...'
        ]
    }
];

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
    
    // 複雑なAI戦略 (customVariables活用)
    aiStrategy: (boss: Boss, player: Player, turn: number): BossAction => {
        // プレイヤーが敗北状態の場合
        if (player.isDefeated()) {
            // 敗北後のターン数管理
            let postDefeatedTurn = boss.getCustomVariable<number>('postDefeatedTurn', 0);
            postDefeatedTurn++;
            boss.setCustomVariable('postDefeatedTurn', postDefeatedTurn);
            
            // パターン切り替えタイマー管理
            let stomachPatternTimer = boss.getCustomVariable<number>('stomachPatternTimer', 0);
            stomachPatternTimer++;
            boss.setCustomVariable('stomachPatternTimer', stomachPatternTimer);
            
            // 10ターンごとにパターン切り替え
            if (stomachPatternTimer >= 10) {
                const newPattern = Math.floor(Math.random() * 3);
                boss.setCustomVariable('currentStomachPattern', newPattern);
                boss.setCustomVariable('stomachPatternTimer', 0);
                
                // パターン切り替えメッセージ用の特別な行動
                return {
                    id: 'pattern-transition',
                    type: ActionType.PostDefeatedAttack,
                    name: 'パターン切り替え',
                    description: '胃袋の環境が変化する',
                    weight: 1,
                    playerStateCondition: 'defeated',
                    messages: [
                        '魔の胃袋の環境がゆっくりと変化し始める...',
                        '{player}を包む感覚が新たなものへと変わっていく...',
                        '異なる種類の幸福感が{player}を待っている...'
                    ]
                };
            }
            
            // 現在のパターンに基づいて行動を選択
            const postDefeatedActions = demonDragonActions.filter(action => 
                action.playerStateCondition === 'defeated' && 
                action.canUse && action.canUse(boss, player, turn)
            );
            
            if (postDefeatedActions.length > 0) {
                const totalWeight = postDefeatedActions.reduce((sum, action) => sum + action.weight, 0);
                let random = Math.random() * totalWeight;
                
                for (const action of postDefeatedActions) {
                    random -= action.weight;
                    if (random <= 0) {
                        return action;
                    }
                }
            }
            
            // フォールバック
            return postDefeatedActions[0] || demonDragonActions[0];
        }
        
        // プレイヤーが食べられ状態の場合
        if (player.isEaten()) {
            // 食べられターン数管理
            let eatenTurnCount = boss.getCustomVariable<number>('eatenTurnCount', 0);
            eatenTurnCount++;
            boss.setCustomVariable('eatenTurnCount', eatenTurnCount);
            
            // 食べられ状態の段階別行動
            const eatenActions = demonDragonActions.filter(action => 
                action.playerStateCondition === 'eaten' && 
                action.canUse && action.canUse(boss, player, turn)
            );
            
            if (eatenActions.length > 0) {
                return eatenActions[0]; // 条件に合う最初の行動を選択
            }
        }
        
        // ソウルバキューム特殊技の管理
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
                // 食べられターン数を初期化
                boss.setCustomVariable('eatenTurnCount', 0);
                return swallowAction;
            }
        }
        
        // プレイヤーが拘束中の場合
        if (player.isRestrained()) {
            const restraintActions = demonDragonActions.filter(action => 
                action.playerStateCondition === 'restrained'
            );
            
            if (restraintActions.length > 0) {
                // 重み付きランダム選択
                const totalWeight = restraintActions.reduce((sum, action) => sum + action.weight, 0);
                let random = Math.random() * totalWeight;
                
                for (const action of restraintActions) {
                    random -= action.weight;
                    if (random <= 0) {
                        return action;
                    }
                }
            }
        }
        
        // 通常状態の行動選択
        const normalActions = demonDragonActions.filter(action => 
            action.playerStateCondition === 'normal' && 
            (!action.canUse || action.canUse(boss, player, turn))
        );
        
        if (normalActions.length > 0) {
            // HP割合による戦術調整
            const bossHpPercent = boss.hp / boss.maxHp;
            
            // HP50%以下で拘束攻撃の重みを上げる
            let modifiedActions = [...normalActions];
            if (bossHpPercent <= 0.5) {
                const restraintAction = normalActions.find(action => 
                    action.id === 'tail-restraint'
                );
                if (restraintAction) {
                    // 拘束攻撃を複数回追加して重みを上げる
                    modifiedActions.push(restraintAction, restraintAction);
                }
            }
            
            // 重み付きランダム選択
            const totalWeight = modifiedActions.reduce((sum, action) => sum + action.weight, 0);
            let random = Math.random() * totalWeight;
            
            for (const action of modifiedActions) {
                random -= action.weight;
                if (random <= 0) {
                    return action;
                }
            }
        }
        
        // フォールバック
        return demonDragonActions[0];
    }
};