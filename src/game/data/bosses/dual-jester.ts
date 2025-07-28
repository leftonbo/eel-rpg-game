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
            '<USER>は<TARGET>を可愛く軽くぽんぽんと叩く！',
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
            '<USER>は<TARGET>を遊びのつもりで軽く捕まえる！',
            '<TARGET>は拘束されたが、なんとなく脱出しやすそうだ...'
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
            '<USER>は<TARGET>をくすぐって笑わせようとする！',
            '<TARGET>は笑いそうになった...'
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
            '<USER>は<TARGET>を口に入れるような素振りを見せる！',
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
            '<USER>は<TARGET>の手を取って可愛く手を繋ごうとする！',
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
            '<USER>が高速でくるくる回転しながら<TARGET>の周りを飛び回る！',
            '目が回るような動きに<TARGET>は混乱してしまった...',
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
            '<USER>がぱっと姿を消した！',
            '「もーいいかい？」',
            '後ろから現れた<USER>が<TARGET>を軽くぽんと叩く！'
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
            '「...フフフ、怖がってるね」（瞳が狂気に光る）',
            '<USER>の瞳が異様な光を放ち、<TARGET>を見据える！',
            '<TARGET>は恐怖で体が震えてしまった...',
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
            '<USER>が<TARGET>の耳元で何か囁いている...',
            '<TARGET>は得体の知れない恐怖に包まれた！',
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
            '<USER>が表情を高速で切り替えながら突進してくる！',
            '<TARGET>は人格の急変に混乱しながら攻撃を受けた！',
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
            '<USER>が手を振ると周囲の壊れた玩具が一斉に浮き上がる！',
            '玩具たちが<TARGET>に向かって飛んできた！',
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
            '「...さっきは手加減していただけだ」（声が低く変化）',
            '<USER>の顔が反転し、色調が暗く変化する！',
            '<TARGET>が強力な拘束に捕らわれた！'
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
            '「もっと...もっと一緒にいよう...♪」（狂気の笑い）',
            '<USER>は<TARGET>を狂気的な力で締め付ける！',
            '<TARGET>は強力な圧迫感に苦しんだ！'
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
            '<USER>の人格が急激に変化しながら<TARGET>を舐め回す！',
            '<TARGET>は混乱と恐怖に包まれた！'
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
            '<USER>の狂気の笑みが<TARGET>を恐怖に陥れる！',
            '<TARGET>は真の恐怖の中で飲み込まれていく！'
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
        id: 'madness-playground',
        type: ActionType.DevourAttack,
        name: '狂気の遊び場',
        description: '体内の歪んだ空間でプレイヤーを翻弄する',
        messages: [
            '体内は歪んだ遊び場と化している...壁は脈打つ肉でできており、不気味なおもちゃが宙に浮いている',
            '「ここは僕の特別な遊び場だよ〜♪」（表の人格）',
            '「君はもう永遠にここから出られない...」（裏の人格が低く囁く）',
            '歪んだメリーゴーラウンドが<TARGET>の周りを回転し、錆びた鉄の音が響く！',
            '<TARGET>は狂気の遊び場で二重人格の支配下に置かれ続ける！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.8,
        statusEffect: StatusEffectType.Bipolar,
        statusChance: 0.70,
        weight: 35,
        playerStateCondition: 'eaten'
    },
    {
        id: 'dual-digestion',
        type: ActionType.DevourAttack,
        name: '二重消化',
        description: '表裏の人格が同時に消化を進める',
        messages: [
            '体内の肉壁がゆっくりと蠕動し、<TARGET>を包み込んでいく...',
            '「一緒に遊ぼうよ〜♪　お腹の中であったか〜い♪」（表の無邪気な声）',
            '「貴様の全てを我が物にしてやる...肉も、骨も、魂も...」（裏の冷酷な声）',
            'ピンクと紫の消化液が<TARGET>を包み、二つの異なる人格が同時に消化を進める！',
            '<TARGET>の生命力が表裏の人格によって二重に削り取られていく...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 2.0,
        weight: 30,
        playerStateCondition: 'eaten'
    },
    {
        id: 'nightmare-embrace',
        type: ActionType.DevourAttack,
        name: '悪夢の抱擁',
        description: '甘い夢と恐ろしい悪夢を同時に見せる',
        messages: [
            '体内の空間が突然変化し、まるで子供部屋のような温かい光に包まれる...',
            '「楽しい夢を見せてあげる♪　ママのお腹の中みたいに安心でしょ〜？」（優しい表の声）',
            '突然光が消え、壁に無数の目玉が浮かび上がる！',
            '「...それとも永遠の悪夢がお好み？フフフ...」（背筋が凍る裏の声）',
            '<TARGET>は体内で甘美な安らぎと恐ろしい悪夢を同時に体験させられる！',
            '現実と幻想、安心と恐怖の境界が完全に崩壊した！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.8,
        statusEffect: StatusEffectType.FalseSecurity,
        statusChance: 0.60,
        weight: 25,
        playerStateCondition: 'eaten'
    },
    {
        id: 'toy-room-assault',
        type: ActionType.DevourAttack,
        name: 'おもちゃ部屋襲撃',
        description: '体内の歪んだおもちゃ部屋から攻撃を仕掛ける',
        messages: [
            '体内の空間が突然おもちゃ部屋に変化し、床には無数の割れた人形の破片が散らばっている...',
            '「僕のお友達も一緒に遊びたがってるよ〜♪」（表の人格が無邪気に笑う）',
            '壊れたテディベアやロボットが一斉に動き出し、錆びた手で<TARGET>を掴もうとする！',
            '「遊んでくれなかった子たちの恨みを知ってるかい？」（裏の人格が不気味に微笑む）',
            '<TARGET>は無数のおもちゃの怨念に囲まれ、小さな手に引き裂かれていく！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.6,
        statusEffect: StatusEffectType.Fear,
        statusChance: 0.55,
        weight: 28,
        playerStateCondition: 'eaten'
    },
    {
        id: 'internal-carousel',
        type: ActionType.DevourAttack,
        name: '体内メリーゴーラウンド',
        description: '体内に現れたメリーゴーラウンドが回転攻撃を仕掛ける',
        messages: [
            '体内に巨大なメリーゴーラウンドが現れ、不協和音のオルゴールメロディが響き始める...',
            '「回って〜回って〜楽しいね〜♪」（表の人格が手を叩いて喜ぶ）',
            '木馬に乗った骸骨や腐った天使の人形が<TARGET>の周りをぐるぐると回り続ける！',
            '「目が回るまで回ろう...そして永遠に回り続けるんだ」（裏の人格が低く囁く）',
            'メリーゴーラウンドの回転速度が異常に速くなり、<TARGET>は激しい遠心力で肉壁に叩きつけられる！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.9,
        statusEffect: StatusEffectType.Confusion,
        statusChance: 0.75,
        weight: 32,
        playerStateCondition: 'eaten'
    },
    {
        id: 'broken-puppet-dance',
        type: ActionType.DevourAttack,
        name: '壊れた人形の踊り',
        description: '糸で操られた壊れた人形たちが不気味な踊りを踊る',
        messages: [
            '体内の天井から無数の糸が垂れ下がり、壊れた人形たちが宙に浮かび上がる...',
            '「人形劇の時間だよ〜♪ みんなで踊ろうね〜♪」（表の人格が糸を操る）',
            '首の取れた人形、腕のない人形、顔の半分が溶けた人形...それらが<TARGET>の周りで踊り狂う！',
            '「美しい踊りだろう？君もすぐに人形の仲間入りだ...」（裏の人格が糸を強く引く）',
            '人形たちの壊れた手足が<TARGET>に絡みつき、同じ踊りを強要しようとする！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.7,
        statusEffect: StatusEffectType.Paralysis,
        statusChance: 0.60,
        weight: 30,
        playerStateCondition: 'eaten'
    },
    {
        id: 'flesh-playground-torment',
        type: ActionType.DevourAttack,
        name: '肉の遊び場拷問',
        description: '体内の肉で出来た遊具で拷問的な遊びを強要する',
        messages: [
            '体内の肉壁が蠢き、ブランコやシーソー、滑り台が肉塊から生成される...',
            '「遊園地みたいでしょ〜♪ でも全部僕の体の一部なんだよ〜♪」（表の人格が嬉しそうに説明）',
            '肉で出来たブランコが<TARGET>を掴み、激しく振り回し始める！',
            '「遊びは楽しいが...時には痛みも必要だ」（裏の人格の声と共に遊具が牙を剥く）',
            '<TARGET>は肉の遊具に押し潰され、引き裂かれ、二重人格の快楽的な拷問に晒され続ける！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 2.1,
        statusEffect: StatusEffectType.Manic,
        statusChance: 0.65,
        weight: 35,
        playerStateCondition: 'eaten'
    }
];

// 第4フェーズ: 敗北後の永続支配
const dualJesterEternalActions: BossAction[] = [
    {
        id: 'eternal-playmate',
        type: ActionType.PostDefeatedAttack,
        name: '永遠の遊び相手',
        description: '永遠に遊び続ける相手として保管する',
        messages: [
            '戦闘は終わった...しかし、真の恐怖はここから始まる。',
            '「やったぁ〜！勝った勝った〜♪　これで君は僕だけのお友達だよ〜♪」（表の人格が純真に喜ぶ）',
            '「永遠に、永遠に...二度と離さない。二度と逃げさせない。」（裏の人格が冷酷に宣言）',
            '<TARGET>の意識が徐々に遠のく中、二つの人格が交互に現れ、永遠の支配を宣言する！',
            '「みんなのお友達になったね〜♪」「私のコレクションに加わったな...」',
            '目覚めることは二度とない...それが絶対的な愛の証明だと二重の声が囁く...'
        ],
        weight: 35,
        playerStateCondition: 'defeated'
    },
    {
        id: 'perfect-toy',
        type: ActionType.PostDefeatedAttack,
        name: '完璧な玩具',
        description: '理想的な玩具として永続的に保管する',
        messages: [
            '<TARGET>の抵抗する力が完全に失われ、人形のように動かなくなった...',
            '「やった〜！新しいお人形さんの完成だよ〜♪」（表の人格が手を叩いて喜ぶ）',
            '「完璧だ...完璧な玩具の完成だ。これで私のコレクションがまた一つ増えた。」（裷の人格が満足げに微笑む）',
            '「もう痛くはないからね〜！変わりにずっとずっと楽しい夢を見られるよ〜♪」',
            '「現実はもう必要ない。夢の中で永遠に私と遊んでいればいい...」',
            '<TARGET>の魂が徐々に道化師の精神世界に吸収され、絶対に逃げられない玩具として永続保管される...'
        ],
        statusEffect: StatusEffectType.Bipolar,
        statusChance: 0.80,
        weight: 30,
        playerStateCondition: 'defeated'
    },
    {
        id: 'endless-game',
        type: ActionType.PostDefeatedAttack,
        name: '終わらない遊び',
        description: '永続的な遊びのサイクルを開始する',
        messages: [
            '時間の概念が失われ、<TARGET>は終わりのないループに閉じ込められる...',
            '「遊びは終わらないよ...ずっと、ずっと、永遠に♪」（表の人格が無邪気に笑う）',
            '「かくれんぼ、おもちゃあそび、人形遊び...ローテーションで永遠に繰り返すのだ。」（裷の人格が冷酷に計画を説明）',
            '<TARGET>の意識は表の人格と裷の人格の間で永遠に揺れ動かされる！',
            '「今日はおもちゃあそび〜♪明日はかくれんぼ〜♪」',
            '「明後日は拷問遊びだな...その次は解体遊びか？」',
            '終わりのない恐怖のサイクルが始まり、<TARGET>は永遠に異なる二つの人格に遊ばれ続けることになった...'
        ],
        weight: 25,
        playerStateCondition: 'defeated'
    },
    {
        id: 'memory-rewrite',
        type: ActionType.PostDefeatedAttack,
        name: '記憶書換術',
        description: '記憶を書き換えて永続的な支配を確立する',
        messages: [
            '時間が逆行するような感覚が<TARGET>を包み、過去の記憶が歪み始める...',
            '「痛い記憶は消してあげる〜♪ 楽しい記憶だけ残してあげるね〜♪」（表の人格が優しく微笑む）',
            '「苦痛も、恐怖も、抵抗も...全て私が都合よく書き換えてやろう」（裏の人格が冷笑する）',
            '<TARGET>の脳内で記憶が次々と塗り替えられ、道化師と「楽しく遊んだ」偽りの思い出が植え付けられる！',
            '「ほら、こんなに楽しかったでしょ〜♪ ずっと一緒にいたかったんでしょ〜♪」',
            '「抵抗など最初からなかった...君は自ら私の元に来たのだ」',
            '<TARGET>の真の記憶は闇に葬られ、道化師への絶対的な愛だけが残された...'
        ],
        statusEffect: StatusEffectType.FalseSecurity,
        statusChance: 0.90,
        weight: 32,
        playerStateCondition: 'defeated'
    },
    {
        id: 'dual-soul-binding',
        type: ActionType.PostDefeatedAttack,
        name: '双魂束縛',
        description: '魂を二重に束縛する暗黒の儀式',
        messages: [
            '空間に不気味な魔法陣が浮かび上がり、<TARGET>の魂が二つに引き裂かれようとしている...',
            '「僕の魂と君の魂を繋げちゃおう〜♪ そうすれば永遠に一緒だよ〜♪」（表の人格が無邪気に提案）',
            '「一つは私の表の人格に、もう一つは裏の人格に...完全に支配してやる」（裏の人格が邪悪に宣言）',
            '<TARGET>の魂が無理やり二等分され、それぞれが道化師の異なる人格に鎖で繋がれる！',
            '「これで君は僕の一部だね〜♪ 僕も君の一部になったよ〜♪」',
            '「逃げ場はない...君の魂は私の魂の奴隷となった」',
            '双魂の鎖が<TARGET>の存在を完全に束縛し、独立した意思を永遠に奪い去った！'
        ],
        statusEffect: StatusEffectType.Bipolar,
        statusChance: 0.95,
        weight: 35,
        playerStateCondition: 'defeated'
    },
    {
        id: 'infinite-dollhouse',
        type: ActionType.PostDefeatedAttack,
        name: '無限人形館',
        description: '無限に続くドールハウスに閉じ込める',
        messages: [
            '周囲の景色が急速に変化し、巨大なドールハウスの内部に変貌していく...',
            '「わ〜い！新しいドールハウスの完成だよ〜♪ 君専用の特別なお家だよ〜♪」（表の人格が嬉しそうに手を叩く）',
            '「部屋から部屋へ...階段を上っても下りても...永遠に続く迷宮だ」（裏の人格が冷酷に説明）',
            '<TARGET>は人形サイズに縮小され、無数の部屋が連なる無限のドールハウスに放り込まれる！',
            '「どの部屋にも僕がいるよ〜♪ 表の僕と裏の僕が〜♪」',
            '「出口は存在しない...君はここで永遠に私の人形として生き続けるのだ」',
            '無限に続く階段、無限に続く廊下、そして無限に続く恐怖...これが<TARGET>の新しい現実となった。'
        ],
        statusEffect: StatusEffectType.Confusion,
        statusChance: 0.85,
        weight: 28,
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
                '「...あれ？まだ遊びたいの？」（声が低く変化）',
                'デュアルの顔が反転し、その瞳が狂気に染まった！',
                '可愛らしい道化師の仮面が剥がれ落ち、真の恐怖が姿を現す！',
                '「なら...本気で遊ぼうか」（完全に別人格）'
            ],
            damageFormula: (user: Boss) => user.attackPower * 1.2,
            weight: 1,
            playerStateCondition: 'normal'
        };
    }
    
    boss.setCustomVariable('currentPhase', isPhase2 ? 2 : 1);
    boss.setCustomVariable('currentTurn', turn);
    
    // プレイヤーが敗北状態の場合
    if (player.isDefeated()) {
        let postDefeatedTurn = boss.getCustomVariable<number>('postDefeatedTurn', 0);
        postDefeatedTurn++;
        boss.setCustomVariable('postDefeatedTurn', postDefeatedTurn);
        
        const eternalActions = dualJesterEternalActions;
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
                return {
                    id: 'final-swallow',
                    type: ActionType.EatAttack,
                    name: '最終捕食',
                    description: '完全に支配下に置くために飲み込む',
                    messages: [
                        '「これで君は永遠に僕のものだ...」',
                        '<USER>は<TARGET>を完全に支配するために飲み込む！',
                        '<TARGET>は狂気の遊び場へと運ばれていく！'
                    ],
                    weight: 1
                };
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
    displayName: '🎭 双面の道化師デュアル',
    description: '二面性を持つ不気味で可愛い道化師',
    questNote: '廃遊園地の奥から、可愛らしい道化師が現れた。子供のような無邪気な笑顔で「一緒に遊ぼうよ〜♪」と誘いかけてくるが、その瞳の奥に何か別の意図が見え隠れしている。時折見せる表情の変化が、この存在の真の危険性を物語っている...',
    maxHp: 280,
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
            text: '双面の道化師デュアルがくるくる回りながらあなたに近づいてくる。その無邪気な笑顔の裏に、何か別の感情が見え隠れしている...'
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
            text: '双面の道化師デュアルは満足そうに微笑んで、くるくる回りながら廃遊園地の奥へと消えていった...'
        }
    ],
    
    // 記念品設定
    victoryTrophy: {
        name: '二面鏡',
        description: '双面の道化師が持っていた特殊な鏡。写した者の裏の姿が見える不思議な力を秘めている。表と裏、どちらが真実なのかは見る者次第。'
    },
    defeatTrophy: {
        name: '道化師の鈴',
        description: '双面の道化師の帽子についていた金色の鈴。可愛い音色に隠された狂気により、聞いた者は現実と幻想の境界を見失う。'
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
        '双面の道化師デュアルは<TARGET>を完全に支配した！',
        '「だいすき〜♪ ずっと一緒にいようね〜♪」',
        '「...ついに完璧な玩具を手に入れた」',
        '<TARGET>は道化師の精神世界に取り込まれ、表裏の人格が延々と入れ替わる空間で永遠に遊ばれ続けることになった！',
        '可愛い笑い声と不気味な笑い声が交互に響く中、<TARGET>は現実と幻想の境界を完全に見失ってしまった...'
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