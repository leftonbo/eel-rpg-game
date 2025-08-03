import { BossData, ActionType, BossAction, Boss } from '../../entities/Boss';
import { Player } from '../../entities/Player';
import { StatusEffectType } from '../../systems/StatusEffectTypes';

// 第1フェーズ: 表の顔（偽装フェーズ）- 可愛い演技と手加減
const dualJesterPhase1Actions: BossAction[] = [
    {
        id: 'playful-pat',
        type: ActionType.Attack,
        name: '遊びのぽんぽん',
        description: '可愛く手をぽんぽんと叩く',
        messages: [
            '「一緒に遊ぼうよ〜♪」',
            '{boss}は{player}を可愛く軽くぽんぽんと叩く！',
            'とても軽いタッチで、まるで遊んでいるようだ'
        ],
        damageFormula: (user: Boss) => Math.max(1, user.attackPower * 0.15), // 非常に軽いダメージ
        hitRate: 0.98,
        weight: 20,
        playerStateCondition: 'normal'
    },
    {
        id: 'playful-bind',
        type: ActionType.RestraintAttack,
        name: 'お遊び拘束',
        description: '遊びのつもりで軽く拘束する',
        messages: [
            '「はーい、おいかけっこの時間だよ〜♪」',
            '{boss}は{player}を遊びのつもりで軽く捕まえる！',
            '{player}は拘束されたが、なんとなく脱出しやすそうだ...'
        ],
        statusEffect: StatusEffectType.FalseSecurity,
        statusChance: 0.60,
        weight: 18,
        canUse: (_boss, player, _turn) => {
            return !player.isRestrained() && !player.isEaten() && Math.random() < 0.40;
        }
    },
    {
        id: 'tickle-attack',
        type: ActionType.StatusAttack,
        name: 'くすぐり攻撃',
        description: 'くすぐって笑わせようとする',
        messages: [
            '「くすぐっちゃうぞ〜♪」',
            '{boss}は{player}をくすぐって笑わせようとする！',
            '{player}は笑いそうになった...'
        ],
        damageFormula: (user: Boss) => Math.max(1, user.attackPower * 0.20),
        statusEffect: StatusEffectType.Charm,
        statusChance: 0.50,
        weight: 22,
        playerStateCondition: 'normal'
    },
    {
        id: 'pretend-swallow',
        type: ActionType.Attack,
        name: '捕食ごっこ',
        description: '食べる真似をするが実際は食べない',
        messages: [
            '「食べちゃうぞ〜♪ でも冗談だよ〜」',
            '{boss}は{player}を口に入れるような素振りを見せる！',
            'でも実際は演技のようで、本気ではないようだ...'
        ],
        hitRate: 0.0,
        weight: 15,
        canUse: (_boss, player, _turn) => {
            return player.isRestrained() && Math.random() < 0.25;
        }
    },
    {
        id: 'hand-holding-shock',
        type: ActionType.Attack,
        name: 'お手々つなぎ',
        description: '手を繋ぐ振りで軽い電撃攻撃',
        messages: [
            '「お手々つなごうよ〜♪」',
            '{boss}は{player}の手を取って可愛く手を繋ごうとする！',
            'しかし手から軽い電撃がビリッと流れた！',
            '「あれ？静電気かな〜？ えへへ♪」'
        ],
        damageFormula: (user: Boss) => Math.max(2, user.attackPower * 0.25),
        statusEffect: StatusEffectType.Paralysis,
        statusChance: 0.25,
        hitRate: 0.95,
        weight: 20,
        playerStateCondition: 'normal'
    },
    {
        id: 'spinning-play',
        type: ActionType.StatusAttack,
        name: '回転あそび',
        description: 'くるくる回って相手を混乱させる',
        messages: [
            '「くるくる〜♪ 一緒に回ろうよ〜♪」',
            '{boss}が高速でくるくる回転しながら{player}の周りを飛び回る！',
            '目が回るような動きに{player}は混乱してしまった...',
            '「どっちが前でどっちが後ろかな〜♪」'
        ],
        damageFormula: (user: Boss) => Math.max(1, user.attackPower * 0.20),
        statusEffect: StatusEffectType.Confusion,
        statusChance: 0.60,
        hitRate: 0.90,
        weight: 24,
        playerStateCondition: 'normal'
    },
    {
        id: 'hide-and-seek-attack',
        type: ActionType.Attack,
        name: 'かくれんぼ攻撃',
        description: '瞬間移動して不意打ち攻撃',
        messages: [
            '「かくれんぼしよう〜♪」',
            '{boss}がぱっと姿を消した！',
            '「もーいいかい？」',
            '後ろから現れた{boss}が{player}を軽くぽんと叩く！'
        ],
        damageFormula: (user: Boss) => Math.max(3, user.attackPower * 0.30),
        hitRate: 0.85,
        weight: 20,
        playerStateCondition: 'normal'
    }
];

// 第2フェーズ: 裏の顔（本気フェーズ）- HP50%以下で豹変
const dualJesterPhase2Actions: BossAction[] = [
    {
        id: 'madness-gaze',
        type: ActionType.StatusAttack,
        name: '狂気の瞳光',
        description: '不気味な瞳で威嚇攻撃',
        messages: [
            '「...フフフ、怖がってるね」',
            '{boss}の瞳が異様な光を放ち、{player}を見据える！',
            '{player}は恐怖で体が震えてしまった...',
            '「その表情...とても美しいよ」'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.2,
        statusEffect: StatusEffectType.Fear,
        statusChance: 0.65,
        hitRate: 0.90,
        weight: 25,
        playerStateCondition: 'normal'
    },
    {
        id: 'nightmare-whisper',
        type: ActionType.StatusAttack,
        name: '悪夢の囁き',
        description: '心理攻撃で恐怖を植え付ける',
        messages: [
            '「聞こえるかい？君の心の奥の悲鳴が...」',
            '{boss}が{player}の耳元で何か囁いている...',
            '{player}は得体の知れない恐怖に包まれた！',
            '「これはまだ始まりに過ぎない...」'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.8,
        statusEffect: StatusEffectType.Bipolar,
        statusChance: 0.55,
        hitRate: 0.95,
        weight: 27,
        playerStateCondition: 'normal'
    },
    {
        id: 'dual-personality-rush',
        type: ActionType.Attack,
        name: '二重人格突進',
        description: '表裏が入れ替わりながらの体当たり',
        messages: [
            '「一緒に遊ぼう♪」',
            '「死ね」',
            '「楽しいね〜♪」',
            '「苦しめ」',
            '{boss}が表情を高速で切り替えながら突進してくる！',
            '{player}は人格の急変に混乱しながら攻撃を受けた！',
            '「どっちが本当？...両方とも本当さ」'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.5,
        statusEffect: StatusEffectType.Confusion,
        statusChance: 0.50,
        hitRate: 0.85,
        weight: 23,
        playerStateCondition: 'normal'
    },
    {
        id: 'toy-box-explosion',
        type: ActionType.Attack,
        name: '玩具箱爆発',
        description: '周囲の玩具を操って攻撃',
        messages: [
            '「僕の大切な玩具たちよ...遊んでおやり」',
            '{boss}が手を振ると周囲の壊れた玩具が一斉に浮き上がる！',
            '玩具たちが{player}に向かって飛んできた！',
            '「みんな君と遊びたがってるよ...永遠にね」'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.4,
        hitRate: 0.80,
        weight: 22,
        playerStateCondition: 'normal'
    },
    {
        id: 'true-restraint',
        type: ActionType.RestraintAttack,
        name: '真の拘束',
        description: '本気の拘束技を繰り出す',
        messages: [
            '「...さっきは手加減していただけだ」',
            '{boss}の顔が反転し、色調が暗く変化する！',
            '{player}が強力な拘束に捕らわれた！'
        ],
        statusEffect: StatusEffectType.Manic,
        statusChance: 0.70,
        weight: 30,
        canUse: (_boss, player, _turn) => {
            return !player.isRestrained() && !player.isEaten();
        }
    },
    {
        id: 'manic-squeeze',
        type: ActionType.Attack,
        name: '狂気締め付け',
        description: '狂気の笑いと共に強く締め付ける',
        messages: [
            '「もっと...もっと一緒にいよう...♪」',
            '{boss}は{player}を狂気的な力で締め付ける！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.8,
        statusEffect: StatusEffectType.Bipolar,
        statusChance: 0.60,
        weight: 30,
        playerStateCondition: 'restrained'
    },
    {
        id: 'dual-personality-lick',
        type: ActionType.StatusAttack,
        name: '二重人格なめまわし',
        description: '表裏の人格が交互に現れる攻撃',
        messages: [
            '「大丈夫、痛くないよ〜」',
            '「痛がってる顔、とても美しいね」',
            '{boss}人格が変化しながら、リボンのような長い舌が{player}を舐め回す！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.5,
        statusEffect: StatusEffectType.Confusion,
        statusChance: 0.80,
        weight: 25,
        playerStateCondition: 'restrained'
    },
    {
        id: 'true-devour',
        type: ActionType.EatAttack,
        name: '真の捕食',
        description: '今度は本当に食べてしまう',
        messages: [
            '「今度は本当に食べてあげる...永遠に一緒にいられるよ」',
            '{boss}のリボンのような長い舌が{player}を巻き上げ、そのまま飲み込んでいく！',
            'まるでエアドームのような胃袋が{boss}を包み込む...'
        ],
        weight: 25,
        canUse: (_boss, player, _turn) => {
            return player.isRestrained() && player.getHpPercentage() < 30;
        }
    }
];

// 第3フェーズ: 体内環境（狂気の遊び場）
const dualJesterDevourActions: BossAction[] = [
    {
        id: 'madness-embrace',
        type: ActionType.DevourAttack,
        name: '狂気の抱擁',
        description: '体内の「遊び場」を圧迫して、生命力をしぼり取る',
        messages: [
            '「ママのお腹の中みたいにぎゅ～ってしてあげる♪」',
            '「我が抱擁に包まれて、安心して眠るがいい...」',
            '体内の空間が急激に縮まり、胃壁が{player}を圧迫する！',
        ],
        damageFormula: (user: Boss) => user.attackPower * 2.0,
        weight: 35,
        playerStateCondition: 'eaten'
    },
    {
        id: 'dual-digestion',
        type: ActionType.DevourAttack,
        name: '二重胃液',
        description: '表裏の人格がそれぞれの胃液を出し、獲物をねばねばにする',
        messages: [
            '「水遊びしようよ〜♪お腹の中であったか〜い♪」',
            '「そのまま我がプールで溺れてしまうがよい...」',
            'ピンクと紫の胃液が{player}を包みこみ、生命力を溶かしていく！',
        ],
        statusEffect: StatusEffectType.Slimed,
        statusChance: 1.0,
        damageFormula: (user: Boss) => user.attackPower * 1.8,
        weight: 30,
        playerStateCondition: 'eaten'
    },
    {
        id: 'nightmare-embrace',
        type: ActionType.DevourAttack,
        name: '悪夢の抱擁',
        description: '甘い夢と恐ろしい悪夢を同時に見せる',
        messages: [
            '「楽しい夢を見せてあげる♪ママのお腹の中みたいに安心でしょ〜？」',
            '「...それとも永遠の悪夢がお好み？フフフ...」',
            '{boss}の胃袋が{player}をやさしくゆさぶり、甘美な安らぎと恐ろしい悪夢を同時に体験させる！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.8,
        statusEffect: StatusEffectType.FalseSecurity,
        statusChance: 0.60,
        weight: 25,
        playerStateCondition: 'eaten'
    }
];

// 第4フェーズ: 敗北後、体内おもちゃ箱で裏の人格が永遠の遊び相手になる
const dualJesterEternalActions: BossAction[] = [
    {
        // 最初のターンだけ
        id: 'eternal-playmate',
        type: ActionType.PostDefeatedAttack,
        name: '永遠の遊び相手',
        description: '裏の人格がおもちゃ箱に出現し、永遠に遊び続ける相手になる',
        messages: [
            '「君一人では淋しいだろう？私が遊び相手になろう」',
            'おもちゃ箱の中に裏の人格の分身が、ぬいぐるみになった{player}よりはるかに大きい姿で現れる！',
            '「さあ、何をして遊ぼうか？」',
            'ぬいぐるみにされてしまった{player}は、動くことも答えることもできない...'
        ],
        weight: 35,
        playerStateCondition: 'defeated',
        canUse: (boss: Boss, player: Player, _turn: number) => {
            return player.isDefeated() && boss.getCustomVariable<number>('postDefeatedTurn', 0) <= 1;
        },
    },
    {
        id: 'forced-embrace',
        type: ActionType.PostDefeatedAttack,
        name: '強制抱擁',
        description: '巨大な体でぬいぐるみを強くきつく抱きしめる',
        messages: [
            '裏の人格の巨大な両腕が{player}をぎゅっと抱きしめる！',
            '「やっと手に入れた大切な玩具だ...絶対に離さない」',
            '巨大な体格で容赦なく抱きしめられ、{player}は身動きが全く取れない！',
            '「この感触...やはり本物の玩具は格別だな」',
            '強すぎる抱擁で{player}の体はスポンジのように押しつぶされる...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.5,
        statusEffect: StatusEffectType.Paralysis,
        statusChance: 0.80,
        weight: 30,
        playerStateCondition: 'defeated'
    },
    {
        id: 'ribbon-tongue-assault',
        type: ActionType.PostDefeatedAttack,
        name: 'リボン舌攻撃',
        description: 'リボンのような長い舌で激しく舐め回す',
        messages: [
            '巨大な体の口からリボンのような長い舌がにゅるりと現れる！',
            '「味見をさせてもらおうか...」',
            '濡れた舌が{player}の全身を執拗に舐め回す！',
            '「君の味は...実に素晴らしい。もっと、もっと味わわせてもらう」',
            'ぬいぐるみにされた体でも、妙な感覚が残り続ける...',
            '「嫌がる表情すら見せられないとは...完璧な玩具だ」'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.3,
        statusEffect: StatusEffectType.Slimed,
        statusChance: 0.90,
        weight: 28,
        playerStateCondition: 'defeated'
    },
    {
        id: 'merciless-tickling',
        type: ActionType.PostDefeatedAttack,
        name: '無慈悲くすぐり',
        description: '巨大な指でぬいぐるみをくすぐりまわす',
        messages: [
            '裏の人格の巨大な指が{player}に向かって迫る！',
            '「くすぐりは痛みよりも効果的だ...抵抗すらできないからな」',
            '大きな指が{player}の体を執拗にくすぐり続ける！',
            'ぬいぐるみにされても、くすぐられる感覚だけは鮮明に残る...',
            '「笑い声も出せない...実に素晴らしい反応だ」',
            '容赦なく続くくすぐりに、{player}の意識は混乱する...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.2,
        statusEffect: StatusEffectType.Confusion,
        statusChance: 0.85,
        weight: 26,
        playerStateCondition: 'defeated'
    },
    {
        id: 'toy-swing-around',
        type: ActionType.PostDefeatedAttack,
        name: '玩具振り回し',
        description: '巨大な手でぬいぐるみを激しく振り回す',
        messages: [
            '裏の人格が{player}を巨大な手で掴み上げる！',
            '「玩具は乱暴に扱っても壊れないものでなくては...」',
            '{player}が激しく空中で振り回される！',
            '「どれほどの衝撃に耐えられるか試してみよう」',
            '激しい振り回しで{player}の視界がぐるぐると回る...',
            '「この程度では壊れないか...流石は丈夫な玩具だ」'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.4,
        statusEffect: StatusEffectType.Confusion,
        statusChance: 0.75,
        weight: 24,
        playerStateCondition: 'defeated'
    },
    {
        id: 'dominating-play',
        type: ActionType.PostDefeatedAttack,
        name: '支配的遊戯',
        description: '巨大な体格を活かして絶対的な支配を誇示する',
        messages: [
            '裏の人格が{player}の真上に巨大な体を覆いかぶせる！',
            '「私の大きさが分かるか？君はこんなにも小さな存在なのだ」',
            '圧倒的な体格差で{player}を完全に覆い隠す！',
            '「抵抗など不可能...君は私の手の平の上の玩具に過ぎない」',
            '巨大な影に包まれ、{player}は自分の無力さを思い知らされる...',
            '「この支配関係は永遠に変わることはない」'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.6,
        statusEffect: StatusEffectType.Fear,
        statusChance: 0.90,
        weight: 32,
        playerStateCondition: 'defeated'
    },
    {
        id: 'persistent-caressing',
        type: ActionType.PostDefeatedAttack,
        name: '執拗愛撫',
        description: '巨大な手で執拗で一方的な愛撫を行う',
        messages: [
            '裏の人格の巨大な手が{player}に触れ始める...',
            '「この感触...何度味わっても飽きることがない」',
            '大きな手が{player}の体を執拗に、丁寧に撫で回す！',
            '「君のこの部分は特に...興味深いな」',
            'ぬいぐるみにされた体でも、奇妙な感覚が伝わり続ける...',
            '「私だけが君を完全に理解している...私だけが君を愛している」',
            '一方的で執拗な愛撫が永遠に続く...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.1,
        statusEffect: StatusEffectType.Charm,
        statusChance: 0.95,
        weight: 29,
        playerStateCondition: 'defeated'
    }
];

// AI戦略: 二面性とフェーズ管理
const dualJesterAIStrategy = (boss: Boss, player: Player, turn: number): BossAction => {
    const bossHpPercentage = boss.getHpPercentage();
    
    // フェーズ判定: HP50%以下で第2フェーズ（裏の顔）に切り替え
    const isPhase2 = bossHpPercentage <= 50;
    
    // カスタム変数でフェーズ切り替えを管理
    const hasTransformed = boss.getCustomVariable<boolean>('hasTransformed', false);
    if (isPhase2 && !hasTransformed) {
        boss.setCustomVariable('hasTransformed', true);
        // 専用の変身メッセージを追加
        return {
            id: 'phase-transform',
            type: ActionType.Attack,
            name: '本性覚醒',
            description: '双面の道化師の真の姿が露わになる',
            messages: [
                '「...あれ？まだ遊びたいの？」',
                '可愛らしい道化師の仮面が剥がれ落ち、真の恐怖が姿を現す！',
                '「なら...本気で遊ぼうか」',
                '狂気に染まった目が{player}を見据え、表情が一変する！',
            ],
            weight: 1,
            playerStateCondition: 'normal'
        };
    }
    
    boss.setCustomVariable('currentPhase', isPhase2 ? 2 : 1);
    boss.setCustomVariable('currentTurn', turn);
    
    // プレイヤーが敗北状態の場合
    if (player.isDefeated()) {
        const defeatStartTurn = boss.getCustomVariable<number>('defeatStartTurn', -1);
        
        // If this is the first turn player is defeated, record it
        if (defeatStartTurn === -1) {
            boss.setCustomVariable('defeatStartTurn', turn);
        }

        // Every 8 turns since defeat started, show special personality revelation event
        const turnsSinceDefeat = turn - boss.getCustomVariable<number>('defeatStartTurn', turn);
        if (turnsSinceDefeat > 0 && turnsSinceDefeat % 8 === 0) {
            return {
                id: 'personality-revelation-show',
                type: ActionType.PostDefeatedAttack,
                name: '本性暴露ショー',
                description: '一時的に優しい面を見せた後、本性で激しく攻撃する',
                messages: [
                    '表の人格：「ごめんね〜、ちょっと痛かったでしょ？」',
                    '裏の人格：「...フフフ、まだこの程度で済むと思っているのか？」',
                    '表の人格：「大丈夫、もう痛くしないからね〜♪」',
                    '{boss}が急に優しい表情になり、{player}をそっと撫でる...',
                    '表の人格：「ほら、気持ちいいでしょ？」',
                    '突然、{boss}の顔が反転し、恐ろしい裏の人格が現れる！',
                    '裏の人格：「嘘だ。これからが本当の地獄だ」',
                    '巨大な手が{player}を激しく掴み、残酷な笑みを浮かべる！',
                    '裏の人格：「表の甘い言葉に騙されたな...私の本性を見せてやろう」',
                    '{player}は激しい恐怖と混乱の状態に陥ってしまった！'
                ],
                onUse: (_boss, player, _turn) => {
                    // 本性暴露による効果を付与
                    player.statusEffects.addEffect(StatusEffectType.Fear);
                    player.statusEffects.addEffect(StatusEffectType.Confusion);
                    player.statusEffects.addEffect(StatusEffectType.Bipolar);
                    player.statusEffects.addEffect(StatusEffectType.Manic);
                    
                    return [];
                },
                weight: 1
            };
        }
        
        let postDefeatedTurn = boss.getCustomVariable<number>('postDefeatedTurn', 0);
        postDefeatedTurn++;
        boss.setCustomVariable('postDefeatedTurn', postDefeatedTurn);
        
        const eternalActions = dualJesterEternalActions;
        
        // 最初のターンのみ特別な行動を選択
        if (postDefeatedTurn === 1) {
            const firstAction = eternalActions.find(action => action.id === 'eternal-playmate');
            if (firstAction) {
                return firstAction;
            }
        }
        
        const totalWeight = eternalActions.reduce((sum, action) => sum + action.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const action of eternalActions) {
            random -= action.weight;
            if (random <= 0) {
                return action;
            }
        }
        return eternalActions[0];
    }
    
    // プレイヤーが食べられた状態
    if (player.isEaten()) {
        const devourActions = dualJesterDevourActions;
        const totalWeight = devourActions.reduce((sum, action) => sum + action.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const action of devourActions) {
            random -= action.weight;
            if (random <= 0) {
                return action;
            }
        }
        return devourActions[0];
    }
    
    // プレイヤーが戦闘不能状態
    if (player.isKnockedOut()) {
        if (player.isRestrained() && isPhase2) {
            // 第2フェーズで拘束+戦闘不能時は90%で捕食
            if (Math.random() < 0.90) {
                // use 'true-devour'
                const eatAction = dualJesterPhase2Actions.find(action => action.id === 'true-devour');
                if (eatAction) {
                    return eatAction;
                }
            }
        }
    }
    
    // フェーズに応じた行動選択
    let availableActions: BossAction[];
    
    if (isPhase2) {
        // 第2フェーズ: 裏の顔（本気モード）
        if (player.isRestrained()) {
            availableActions = dualJesterPhase2Actions.filter(action => 
                action.playerStateCondition === 'restrained' || !action.playerStateCondition
            );
        } else {
            availableActions = dualJesterPhase2Actions.filter(action => 
                action.playerStateCondition === 'normal' || !action.playerStateCondition
            );
        }
    } else {
        // 第1フェーズ: 表の顔（演技モード）
        if (player.isRestrained()) {
            // 第1フェーズでは拘束状態でも軽い攻撃のみ
            availableActions = dualJesterPhase1Actions.filter(action => 
                action.type !== ActionType.RestraintAttack
            );
        } else {
            availableActions = dualJesterPhase1Actions;
        }
    }
    
    // canUse条件でフィルタリング
    availableActions = availableActions.filter(action => {
        if (action.canUse) {
            return action.canUse(boss, player, turn);
        }
        return true;
    });
    
    if (availableActions.length === 0) {
        return isPhase2 ? dualJesterPhase2Actions[0] : dualJesterPhase1Actions[0];
    }
    
    // 重み付きランダム選択
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

export const dualJesterData: BossData = {
    id: 'dual-jester',
    name: 'DualJester',
    displayName: '双面の道化師',  // TODO: 個体名は『ニコレム』 (資料に表示する予定)
    description: '二面性を持つ球体マスコット道化師',
    questNote: 'とある廃遊園地に「ニコレム」という、かつてマスコットキャラクターとして活躍していた道化師が現れた。その道化師が現れて以来、付近の旅人が行方不明になっては、その者とそっくりのぬいぐるみが発見されるようになった。以来、その奇妙な道化師は討伐対象として指定されている。あなたの任務はその道化師を討伐し、この現象に終止符を打つことだ。道化師の姿は球体状で、縦に分かれたパステルピンクとライトブルーの体色をもつ。金色の小さな鈴がついた帽子と赤色のマント、そして笑顔を表す仮面を身に着けている。非常に特徴的な姿なので、その道化師はすぐに見つかるだろう。だがその仮面の裏には何が隠されているかはわからない。討伐の際は十分に注意すること。',
    maxHp: 970,
    attackPower: 20,
    actions: dualJesterPhase1Actions
        .concat(dualJesterPhase2Actions)
        .concat(dualJesterDevourActions)
        .concat(dualJesterEternalActions),
    icon: '🎭',
    explorerLevelRequired: 9,
    
    battleStartMessages: [
        {
            speaker: 'player',
            style: 'default',
            text: 'あなたは廃遊園地の奥で小さな道化師と遭遇した。'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: 'わーい！新しいお友達だ〜♪ 一緒に遊ぼうよ〜！'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: '双面の道化師がくるくる回りながらあなたに近づいてくる。その無邪気な笑顔の裏に、何か別の感情が見え隠れしている...'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: 'ねぇねぇ、どんな遊びがしたい？ 僕はどんな遊びでも知ってるよ〜♪'
        }
    ],
    
    victoryMessages: [
        {
            speaker: 'boss',
            style: 'talk',
            text: 'あ〜あ、疲れちゃった...でも楽しかったよ♪',
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: 'また遊ぼうね！今度はもっと、もっと楽しい遊びをしようね〜♪'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: '双面の道化師は満足そうに微笑んで、くるくる回りながら廃遊園地の奥へと消えていった...'
        }
    ],
    
    // 記念品設定
    victoryTrophy: {
        name: '二面鏡',
        description: '双面の道化師が持っていた特殊な鏡。写した者の裏の姿が見える不思議な力を秘めている。表と裏、どちらが真実なのかは見る者次第。'
    },
    defeatTrophy: {
        name: '鏡写しのぬいぐるみ',
        description: '自分の姿にそっくりだが、左右が逆の小さなぬいぐるみ。双面の道化師が玩具としてずっと遊んでいたためか、今もまだ温かみを感じる。持っているとどこか懐かしい気持ちになる。'
    },
    
    personality: [
        '一緒に遊ぼうよ〜♪',
        'どっちが本当の僕かな〜？',
        'もっと楽しい遊びをしようね♪',
        '君はとても良い玩具だね...',
        '永遠に一緒にいようね',
        'フフフ...面白い'
    ],
    
    aiStrategy: dualJesterAIStrategy,
    
    // カスタム変数の初期値
    customVariables: {
        hasTransformed: false,       // 第2フェーズへの変身フラグ
        currentPhase: 1,             // 現在のフェーズ (1: 表の顔, 2: 裏の顔)
        currentTurn: 0,              // 現在ターン数
        postDefeatedTurn: 0,         // 敗北後ターン数
        dualPersonalityMode: false   // 二重人格モード
    }
};

// フィニッシュムーブの実装
dualJesterData.finishingMove = function(): string[] {
    return [
        '胃液に包まれ、生命力を奪われた{player}はぬいぐるみの姿に変えられてしまった！',
        '「だいすき〜♪ ずっと一緒にいようね〜♪」',
        '「...ついに完璧な玩具を手に入れた」',
        '{player}は体内の奥に運ばれ、まるでおもちゃ箱のような空間に閉じ込められる...',
        '「そこが{boss}の新しいお家だよ～♪」',
        '「私が遊び相手になってあげよう...飽きるまでずっと一緒だ」',
        '体内のおもちゃ箱に閉じ込められた{boss}は、双面の道化師の玩具として遊ばれ続けることになった...'
    ];
};

// 状況別台詞システム
dualJesterData.getDialogue = function(situation: 'battle-start' | 'player-restrained' | 'player-eaten' | 'player-escapes' | 'low-hp' | 'victory') {
    const dialogues: Record<string, string[]> = {
        'battle-start': [
            'わーい！新しいお友達だ〜♪',
            '一緒に遊ぼうよ〜♪',
            'どんな遊びがしたい？',
            'ねぇねぇ、遊ぼうよ〜♪'
        ],
        'player-restrained': [
            'やったぁ〜！捕まえた♪',
            'もう逃げちゃダメだよ〜♪',
            'これでゆっくり遊べるね〜',
            '...フフフ、動けないね（声が低く）'
        ],
        'player-eaten': [
            '表：「お腹の中であったか〜い♪」',
            '裏：「もう二度と外には出さない...」',
            '表：「ずっと一緒だね〜♪」',
            '裏：「完璧な玩具の完成だ...」'
        ],
        'player-escapes': [
            'あ〜、逃げちゃった...',
            '今度はもっと上手に捕まえなきゃ♪',
            'でも逃げられっこないよ〜♪',
            '...覚えておくぞ（声が低く）'
        ],
        'low-hp': [
            'あれ？なんか痛い...（表の顔）',
            '...面白くなってきたな（裏の顔）',
            'でもまだまだ遊べるもん♪',
            '本気を出す時が来たようだな...'
        ],
        'victory': [
            '表：「やったぁ〜！勝った勝った♪」',
            '裏：「当然の結果だ...」',
            '表：「また遊ぼうね〜♪」',
            '裏：「次は逃がさないぞ...」'
        ]
    };
    
    const options = dialogues[situation] || dialogues['battle-start'];
    return options[Math.floor(Math.random() * options.length)];
};