import { BossData, ActionType, BossAction } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffect';

const dreamDemonActions: BossAction[] = [
    // Basic attack
    {
        type: ActionType.Attack,
        name: '魔法の触手',
        description: '小さな触手で軽く攻撃',
        damage: 8,
        hitRate: 0.95,
        weight: 15,
        playerStateCondition: 'normal'
    },
    
    // Debuff attacks - Primary arsenal
    {
        type: ActionType.StatusAttack,
        name: '魅惑の眼差し',
        description: '甘い視線で相手を魅了する',
        statusEffect: StatusEffectType.Charm,
        statusChance: 90,
        weight: 25,
        messages: ['<USER>は甘い眼差しで<TARGET>を見つめる...', '<TARGET>の心がとろけそうになる...']
    },
    {
        type: ActionType.StatusAttack,
        name: '麻痺の粉',
        description: '麻痺を誘発する粉末を撒く',
        statusEffect: StatusEffectType.Paralysis,
        statusChance: 85,
        weight: 20,
        messages: ['<USER>は光る粉を撒き散らした！', '<TARGET>の体がしびれていく...']
    },
    {
        type: ActionType.StatusAttack,
        name: '淫毒の吐息',
        description: '甘い毒を含んだ息を吹きかける',
        statusEffect: StatusEffectType.AphrodisiacPoison,
        statusChance: 90,
        weight: 25,
        messages: ['<USER>は甘い香りの息を<TARGET>に吹きかけた', '<TARGET>の体が熱くなってきた...']
    },
    {
        type: ActionType.StatusAttack,
        name: 'ねむけ誘発',
        description: '眠気を誘う魔法をかける',
        statusEffect: StatusEffectType.Drowsiness,
        statusChance: 80,
        weight: 20,
        messages: ['<USER>は催眠術をかけてきた', '<TARGET>のまぶたが重くなってきた...']
    },
    {
        type: ActionType.StatusAttack,
        name: '脱力の呪文',
        description: '力を奪う呪文を唱える',
        statusEffect: StatusEffectType.Weakness,
        statusChance: 85,
        weight: 20,
        messages: ['<USER>は呪文を唱えた', '<TARGET>の力が抜けていく...']
    },
    {
        type: ActionType.StatusAttack,
        name: 'メロメロビーム',
        description: 'ハート型の光線で相手をメロメロにする',
        statusEffect: StatusEffectType.Infatuation,
        statusChance: 80,
        weight: 25,
        messages: ['<USER>はハート型の光線を放った！', '<TARGET>は完全にメロメロになってしまった...']
    },
    {
        type: ActionType.StatusAttack,
        name: '混乱の渦',
        description: '思考を混乱させる魔法',
        statusEffect: StatusEffectType.Confusion,
        statusChance: 75,
        weight: 20,
        messages: ['<USER>は不思議な渦を作り出した', '<TARGET>の思考が混乱してきた...']
    },
    {
        type: ActionType.StatusAttack,
        name: '発情促進',
        description: '発情状態を誘発する魔法',
        statusEffect: StatusEffectType.Arousal,
        statusChance: 85,
        weight: 25,
        messages: ['<USER>は妖艶な魔法をかけた', '<TARGET>の体が火照ってきた...']
    },
    {
        type: ActionType.StatusAttack,
        name: '悩殺ポーズ',
        description: '魅惑的なポーズで相手を悩殺する',
        statusEffect: StatusEffectType.Seduction,
        statusChance: 80,
        weight: 20,
        messages: ['<USER>は急接近し深いべろちゅーをしてきた！', '<TARGET>は完全に悩殺されてしまった...']
    },
    {
        type: ActionType.StatusAttack,
        name: '魔法封印術',
        description: '魔法の使用を封じる',
        statusEffect: StatusEffectType.MagicSeal,
        statusChance: 90,
        weight: 15,
        messages: ['<USER>は封印の呪文を唱えた', '<TARGET>の魔力が封じられた！']
    },
    {
        type: ActionType.StatusAttack,
        name: '快楽の呪い',
        description: '快楽に溺れさせる強力な呪い',
        statusEffect: StatusEffectType.PleasureFall,
        statusChance: 70,
        weight: 15,
        messages: ['<USER>は禁断の呪いをかけた...', '<TARGET>は快楽の波に飲み込まれていく...']
    },
    {
        type: ActionType.StatusAttack,
        name: '淫乱の魔法',
        description: '理性を奪う淫らな魔法',
        statusEffect: StatusEffectType.Lewdness,
        statusChance: 75,
        weight: 15,
        messages: ['<USER>は淫らな魔法を唱えた', '<TARGET>の理性が揺らいでいく...']
    },
    {
        type: ActionType.StatusAttack,
        name: '催眠波動',
        description: '強力な催眠術で意識を奪う',
        statusEffect: StatusEffectType.Hypnosis,
        statusChance: 60,
        weight: 10,
        canUse: (_boss, player, _turn) => {
            // Use when player has multiple debuffs
            return player.statusEffects.getDebuffLevel() >= 5;
        },
        messages: ['<USER>は強力な催眠波動を放った！', '<TARGET>の意識が朦朧としてきた...']
    },
    {
        type: ActionType.StatusAttack,
        name: '洗脳光線',
        description: '思考を支配する洗脳光線',
        statusEffect: StatusEffectType.Brainwash,
        statusChance: 50,
        weight: 8,
        canUse: (_boss, player, _turn) => {
            // Use when player is severely debuffed
            return player.statusEffects.getDebuffLevel() >= 7;
        },
        messages: ['<USER>は邪悪な光線を<TARGET>に向けた...', '<TARGET>の思考が侵食されていく...']
    },
    {
        type: ActionType.StatusAttack,
        name: 'あまあま魔法',
        description: '甘い幸福感で抵抗力を奪う',
        statusEffect: StatusEffectType.Sweet,
        statusChance: 85,
        weight: 20,
        messages: ['<USER>は甘い魔法をかけた', '<TARGET>は幸せな気分になった...']
    },
    {
        type: ActionType.StatusAttack,
        name: 'とろとろ魔法',
        description: '意識をとろけさせる魔法',
        statusEffect: StatusEffectType.Melting,
        statusChance: 85,
        weight: 20,
        messages: ['<USER>はとろける魔法をかけた', '<TARGET>の意識がとろけていく...']
    },
    {
        type: ActionType.StatusAttack,
        name: 'うっとり魔法',
        description: '恍惚状態にする魔法',
        statusEffect: StatusEffectType.Euphoria,
        statusChance: 80,
        weight: 18,
        messages: ['<USER>は恍惚の魔法をかけた', '<TARGET>はうっとりとした表情になった...']
    },
    {
        type: ActionType.StatusAttack,
        name: '魅惑の術',
        description: '深い魅惑状態にする魔法',
        statusEffect: StatusEffectType.Fascination,
        statusChance: 85,
        weight: 20,
        messages: ['<USER>は魅惑の術を唱えた', '<TARGET>は深い魅惑に囚われた...']
    },
    {
        type: ActionType.StatusAttack,
        name: '至福の呪文',
        description: '至福の陶酔状態にする',
        statusEffect: StatusEffectType.Bliss,
        statusChance: 75,
        weight: 15,
        messages: ['<USER>は至福の呪文を唱えた', '<TARGET>は至福の表情を浮かべた...']
    },
    {
        type: ActionType.StatusAttack,
        name: '魅了術',
        description: '強力な魅了魔法で完全支配',
        statusEffect: StatusEffectType.Enchantment,
        statusChance: 70,
        weight: 12,
        canUse: (_boss, player, _turn) => {
            // Use when player has multiple debuffs
            return player.statusEffects.getDebuffLevel() >= 6;
        },
        messages: ['<USER>は強力な魅了術を発動した', '<TARGET>は完全に魅了されてしまった...']
    },
    
    // Restraint attacks
    {
        type: ActionType.RestraintAttack,
        name: '尻尾による拘束',
        description: '長い尻尾で対象を捕らえる',
        weight: 20,
        hitRate: 0.85,
        messages: ['<USER>は長い尻尾で<TARGET>を捕らえようとしてきた！'],
        canUse: (_boss, player, _turn) => {
            return !player.isRestrained() && !player.isEaten() && Math.random() < 0.4;
        }
    },
    {
        type: ActionType.RestraintAttack,
        name: '魔法の手による拘束',
        description: '魔法の手で対象を捕まえる',
        weight: 18,
        hitRate: 0.80,
        messages: ['<USER>は魔法の手を伸ばして<TARGET>を掴もうとしてきた！'],
        canUse: (_boss, player, _turn) => {
            return !player.isRestrained() && !player.isEaten() && Math.random() < 0.35;
        }
    },
    {
        type: ActionType.RestraintAttack,
        name: 'テレポート拘束',
        description: 'テレポートして背後から捕らえる',
        weight: 15,
        hitRate: 0.90,
        messages: ['<USER>は一瞬姿を消した...', '気づくと<USER>が<TARGET>の背後にいた！'],
        canUse: (_boss, player, _turn) => {
            return !player.isRestrained() && !player.isEaten() && Math.random() < 0.3;
        }
    },
    
    // Restraint-specific actions
    {
        type: ActionType.StatusAttack,
        name: '悩殺キス',
        description: '拘束中の相手に魅惑的なキスをする',
        damage: 1,
        statusEffect: StatusEffectType.Infatuation,
        statusChance: 95,
        weight: 30,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>に熱いキスをした...', '<TARGET>は完全にとろけてしまった...']
    },
    {
        type: ActionType.StatusAttack,
        name: 'べろちゅ攻撃',
        description: '大きな舌で相手をなめまわす',
        damage: 2,
        statusEffect: StatusEffectType.Arousal,
        statusChance: 90,
        weight: 28,
        playerStateCondition: 'restrained',
        messages: ['<USER>は大きな舌で<TARGET>をべろべろとなめまわした', '<TARGET>の体が震えている...']
    },
    {
        type: ActionType.StatusAttack,
        name: '体密着攻撃',
        description: '体を密着させて誘惑する',
        damage: 1,
        statusEffect: StatusEffectType.Seduction,
        statusChance: 95,
        weight: 25,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>に体を密着させてきた', '<TARGET>は誘惑に負けそうになっている...']
    },
    {
        type: ActionType.StatusAttack,
        name: '揺さぶり攻撃',
        description: '体を揺さぶって快楽を与える',
        damage: 2,
        statusEffect: StatusEffectType.PleasureFall,
        statusChance: 80,
        weight: 20,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>の体をリズミカルに揺さぶった', '<TARGET>は快楽の波に飲み込まれていく...']
    },
    
    // Additional restraint actions for more variety
    {
        type: ActionType.StatusAttack,
        name: '激しい密着',
        description: '体を激しく密着させて圧迫する',
        damage: 1,
        statusEffect: StatusEffectType.Bliss,
        statusChance: 85,
        weight: 25,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>に激しく体を押し付けてきた', '<TARGET>は息ができないほど密着されている...']
    },
    {
        type: ActionType.StatusAttack,
        name: '激しい揺さぶり',
        description: '体を激しく揺さぶって感覚を狂わせる',
        damage: 2,
        statusEffect: StatusEffectType.Lewdness,
        statusChance: 90,
        weight: 23,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>を激しく揺さぶった', '<TARGET>の理性が揺らいでいく...']
    },
    {
        type: ActionType.StatusAttack,
        name: '官能的な動き',
        description: '官能的な動きで相手を魅了する',
        damage: 1,
        statusEffect: StatusEffectType.Fascination,
        statusChance: 95,
        weight: 26,
        playerStateCondition: 'restrained',
        messages: ['<USER>は官能的な動きを見せつけてきた', '<TARGET>は目が離せなくなっている...']
    },
    {
        type: ActionType.StatusAttack,
        name: '激しい愛撫',
        description: '激しく愛撫して感覚を麻痺させる',
        damage: 2,
        statusEffect: StatusEffectType.Melting,
        statusChance: 88,
        weight: 24,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>を激しく愛撫してきた', '<TARGET>の感覚がとろけていく...']
    },
    {
        type: ActionType.StatusAttack,
        name: '圧迫攻撃',
        description: '体重をかけて圧迫し続ける',
        damage: 1,
        statusEffect: StatusEffectType.Euphoria,
        statusChance: 85,
        weight: 22,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>に全体重をかけて圧迫してきた', '<TARGET>は恍惚の表情を浮かべている...']
    },
    
    // All debuff restraint versions
    {
        type: ActionType.StatusAttack,
        name: '拘束魅了',
        description: '拘束中に強力な魅了をかける',
        damage: 1,
        statusEffect: StatusEffectType.Charm,
        statusChance: 98,
        weight: 20,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>を見つめながら強力な魅了をかけた', '<TARGET>の意思が完全に奪われていく...']
    },
    {
        type: ActionType.StatusAttack,
        name: '拘束麻痺',
        description: '拘束中に麻痺効果を与える',
        damage: 1,
        statusEffect: StatusEffectType.Paralysis,
        statusChance: 95,
        weight: 18,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>の神経を痺れさせた', '<TARGET>の体が完全に痺れてしまった...']
    },
    {
        type: ActionType.StatusAttack,
        name: '拘束淫毒',
        description: '拘束中に淫毒を注入する',
        damage: 2,
        statusEffect: StatusEffectType.AphrodisiacPoison,
        statusChance: 98,
        weight: 22,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>に直接淫毒を注入した', '<TARGET>の体が激しく火照っていく...']
    },
    {
        type: ActionType.StatusAttack,
        name: '拘束睡眠誘導',
        description: '拘束中に強制的に眠らせる',
        damage: 1,
        statusEffect: StatusEffectType.Drowsiness,
        statusChance: 95,
        weight: 19,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>の意識を朦朧とさせた', '<TARGET>の意識がだんだん遠のいていく...']
    },
    {
        type: ActionType.StatusAttack,
        name: '拘束脱力',
        description: '拘束中に力を完全に奪う',
        damage: 1,
        statusEffect: StatusEffectType.Weakness,
        statusChance: 98,
        weight: 21,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>の力を吸い取った', '<TARGET>の体から力が完全に抜けていく...']
    },
    {
        type: ActionType.StatusAttack,
        name: '拘束混乱',
        description: '拘束中に思考を混乱させる',
        damage: 1,
        statusEffect: StatusEffectType.Confusion,
        statusChance: 95,
        weight: 18,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>の思考を混乱させた', '<TARGET>は何が何だかわからなくなっている...']
    },
    {
        type: ActionType.StatusAttack,
        name: '拘束魔法封印',
        description: '拘束中に魔法を完全封印する',
        damage: 1,
        statusEffect: StatusEffectType.MagicSeal,
        statusChance: 98,
        weight: 17,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>の魔力を封印した', '<TARGET>の魔法が使えなくなった...']
    },
    {
        type: ActionType.StatusAttack,
        name: '拘束とろとろ',
        description: '拘束中に意識をとろけさせる',
        damage: 2,
        statusEffect: StatusEffectType.Melting,
        statusChance: 95,
        weight: 22,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>の意識をとろけさせた', '<TARGET>の思考が液体のようにとろけていく...']
    },
    {
        type: ActionType.StatusAttack,
        name: '拘束うっとり',
        description: '拘束中に恍惚状態にする',
        damage: 1,
        statusEffect: StatusEffectType.Euphoria,
        statusChance: 92,
        weight: 19,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>を恍惚状態にした', '<TARGET>はうっとりと夢見心地になっている...']
    },
    {
        type: ActionType.StatusAttack,
        name: '拘束あまあま',
        description: '拘束中に甘い幸福感を与える',
        damage: 1,
        statusEffect: StatusEffectType.Sweet,
        statusChance: 95,
        weight: 20,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>に甘い幸福感を与えた', '<TARGET>は幸せそうな表情を浮かべている...']
    },
    {
        type: ActionType.StatusAttack,
        name: '拘束催眠',
        description: '拘束中に強制催眠をかける',
        damage: 1,
        statusEffect: StatusEffectType.Hypnosis,
        statusChance: 90,
        weight: 15,
        playerStateCondition: 'restrained',
        canUse: (_boss, player, _turn) => {
            return player.statusEffects.getDebuffLevel() >= 8;
        },
        messages: ['<USER>は<TARGET>に強制催眠をかけた', '<TARGET>の意識が完全に支配された...']
    },
    {
        type: ActionType.StatusAttack,
        name: '拘束洗脳',
        description: '拘束中に思考を洗脳する',
        damage: 2,
        statusEffect: StatusEffectType.Brainwash,
        statusChance: 85,
        weight: 12,
        playerStateCondition: 'restrained',
        canUse: (_boss, player, _turn) => {
            return player.statusEffects.getDebuffLevel() >= 10;
        },
        messages: ['<USER>は<TARGET>の思考を洗脳した', '<TARGET>の心が完全に支配されてしまった...']
    },
    
    // Sleep-inducing attacks (restraint-only, after 7 turns restrained)
    {
        type: ActionType.StatusAttack,
        name: '眠りのキス',
        description: '拘束中の相手に眠りを誘うキスをする',
        statusEffect: StatusEffectType.Sleep,
        statusChance: 95,
        weight: 5,
        playerStateCondition: 'restrained',
        canUse: (boss, player, turn) => {
            // Need restraint counter implementation - for now use turn based approximation
            // Player must be restrained for 7+ turns
            return player.isRestrained() && Math.random() < 0.3; // Temporary logic
        },
        messages: [
            '<USER>はくちびるに強く魔力を蓄えると、<TARGET>に熱く深いキスをした...',
            '<TARGET>は眠りに落ちてしまい、<USER>の夢の世界にとらわれてしまった...',
            '<TARGET>が睡眠状態になった！',
            '<TARGET>が夢操作状態になった！'
        ]
    }
];

export const dreamDemonData: BossData = {
    id: 'dream-demon',
    name: 'DreamDemon',
    displayName: '😈 夢魔ちゃん',
    description: '夢を操る小さな淫魔、様々なデバフで相手を弱らせる',
    questNote: `最近、冒険者たちが奇妙な夢にうなされて目覚めないという事件が多発している。調査によると、夢の世界に小さな淫魔が現れ、甘い誘惑で冒険者たちを虜にしているという。この夢魔を討伐し、被害者たちを救出せよ。`,
    maxHp: 350,
    attackPower: 10,
    actions: dreamDemonActions,
    personality: [
        'あら〜可愛い獲物が来たのね♪',
        'その魂、とっても美味しそう♡',
        '夢の中で一緒に遊ぼ？',
        'うふふ〜抵抗しても無駄よ♪',
        'もっともっと気持ちよくしてあげる♡',
        'あまあまな夢を見せてあげる〜',
        '生気をちゅーちゅー吸わせて♪',
        'ずっとずっと一緒にいましょ♡'
    ],
    aiStrategy: (boss, player, turn) => {
        // Dream Demon AI Strategy - Focus on debuff stacking and strategic restraint
        
        // If player is eaten, use random stomach attacks
        if (player.isEaten()) {
            const stomachAttacks = [
                {
                    type: ActionType.DevourAttack,
                    name: '胃壁圧迫',
                    damage: 18,
                    description: '胃壁で獲物を圧迫して生気を搾り取る',
                    messages: [
                        '<USER>の胃壁が<TARGET>を優しく圧迫してきた...',
                        '<TARGET>は胃壁に包まれながら生気を吸い取られている...'
                    ],
                    weight: 1
                },
                {
                    type: ActionType.DevourAttack,
                    name: '消化液愛撫',
                    damage: 20,
                    description: '特殊な消化液で獲物を愛撫しながら消化する',
                    messages: [
                        '<USER>の甘い消化液が<TARGET>を包み込んだ...',
                        '<TARGET>は消化液に愛撫されながら生気が溶けていく...'
                    ],
                    weight: 1
                },
                {
                    type: ActionType.DevourAttack,
                    name: '胃内マッサージ',
                    damage: 16,
                    description: '胃の内側から優しくマッサージして生気を吸収',
                    messages: [
                        '<USER>は胃の中で<TARGET>を優しくマッサージしている...',
                        '<TARGET>は心地よいマッサージを受けながら生気を奪われている...'
                    ],
                    weight: 1
                },
                {
                    type: ActionType.DevourAttack,
                    name: '生気直接吸収',
                    damage: 22,
                    description: '体内で直接生気を吸い取る',
                    messages: [
                        '<USER>は<TARGET>の生気を直接ちゅーちゅーと吸い取り始めた...',
                        '<TARGET>は生気を根こそぎ吸い取られて意識が朦朧としている...'
                    ],
                    weight: 1
                }
            ];
            
            return stomachAttacks[Math.floor(Math.random() * stomachAttacks.length)];
        }
        
        // If player is sleeping, use random dream attacks
        if (player.statusEffects.isSleeping()) {
            const dreamAttacks = [
                {
                    type: ActionType.DevourAttack,
                    name: '夢中激しい密着',
                    damage: 6,
                    description: '夢の中で体を激しく密着させて生気を吸い取る',
                    messages: [
                        '<USER>は夢の中で<TARGET>に激しく体を密着させた',
                        '<USER>は<TARGET>の生気を激しくちゅーちゅーと吸い取っている...',
                        '<TARGET>は生気が吸い取られているのを感じながら気持ちよくて抵抗できない！'
                    ],
                    weight: 1
                },
                {
                    type: ActionType.DevourAttack,
                    name: '夢中魔力べろちゅー',
                    damage: 7,
                    description: '夢の中で魔力を込めたべろちゅーで生気を吸い取る',
                    messages: [
                        '<USER>は夢の中で魔力を込めて<TARGET>にべろちゅーをした',
                        '<USER>は<TARGET>の生気をべろちゅーで吸い取っている...',
                        '<TARGET>は魔力に侵されながら生気を奪われていく...'
                    ],
                    weight: 1
                },
                {
                    type: ActionType.DevourAttack,
                    name: '夢中抱き着き攻撃',
                    damage: 5,
                    description: '夢の中で抱き着いて激しく動きながら生気を吸い取る',
                    messages: [
                        '<USER>は夢の中で<TARGET>に抱き着いて激しく動いた',
                        '<USER>は密着しながら<TARGET>の生気をちゅーちゅーと吸い取っている...',
                        '<TARGET>は抱き着かれながら生気を奪われて快感に溺れている！'
                    ],
                    weight: 1
                },
                {
                    type: ActionType.DevourAttack,
                    name: '夢中触手愛撫',
                    damage: 6,
                    description: '夢の中で触手を使って愛撫しながら生気を吸い取る',
                    messages: [
                        '<USER>は夢の中で無数の触手で<TARGET>を愛撫した',
                        '<USER>の触手は<TARGET>の生気をじわじわと吸い取っている...',
                        '<TARGET>は触手に愛撫されながら生気を搾り取られていく...'
                    ],
                    weight: 1
                },
                {
                    type: ActionType.DevourAttack,
                    name: '夢中魔法圧迫',
                    damage: 7,
                    description: '夢の中で魔法の力で圧迫しながら生気を吸い取る',
                    messages: [
                        '<USER>は夢の中で魔法の力で<TARGET>を圧迫した',
                        '<USER>は魔法で<TARGET>の生気を強制的に吸い取っている...',
                        '<TARGET>は魔法に圧迫されながら生気を根こそぎ奪われている！'
                    ],
                    weight: 1
                },
                {
                    type: ActionType.DevourAttack,
                    name: '夢中激しい揺さぶり',
                    damage: 5,
                    description: '夢の中で激しく揺さぶりながら生気を吸い取る',
                    messages: [
                        '<USER>は夢の中で<TARGET>を激しく揺さぶった',
                        '<USER>は揺さぶりながら<TARGET>の生気をどんどん吸い取っている...',
                        '<TARGET>は激しく揺さぶられながら生気を吸い取られて意識が朦朧としている...'
                    ],
                    weight: 1
                },
                {
                    type: ActionType.DevourAttack,
                    name: '夢中魅惑の舞',
                    damage: 6,
                    description: '夢の中で魅惑的な舞を踊りながら生気を吸い取る',
                    messages: [
                        '<USER>は夢の中で<TARGET>の周りで魅惑的な舞を踊った',
                        '<USER>の舞は<TARGET>の生気を踊りながら吸い取っている...',
                        '<TARGET>は魅惑の舞に見とれながら生気をちゅーちゅー吸われている！'
                    ],
                    weight: 1
                },
                {
                    type: ActionType.DevourAttack,
                    name: '夢中魔力注入',
                    damage: 7,
                    description: '夢の中で魔力を注入しながら生気を吸い取る',
                    messages: [
                        '<USER>は夢の中で<TARGET>に直接魔力を注入した',
                        '<USER>の魔力は<TARGET>の生気を内側から吸い取っている...',
                        '<TARGET>は魔力に侵食されながら生気を内側から奪われていく...'
                    ],
                    weight: 1
                },
                {
                    type: ActionType.DevourAttack,
                    name: '夢中甘い誘惑',
                    damage: 5,
                    description: '夢の中で甘い誘惑をしながら生気を吸い取る',
                    messages: [
                        '<USER>は夢の中で<TARGET>に甘い誘惑をささやいた',
                        '<USER>は甘い言葉で<TARGET>の生気をそっと吸い取っている...',
                        '<TARGET>は甘い誘惑に溺れながら生気を静かに奪われている...'
                    ],
                    weight: 1
                },
                {
                    type: ActionType.DevourAttack,
                    name: '夢中完全支配',
                    damage: 6,
                    description: '夢の中で完全に支配しながら生気を吸い取る',
                    messages: [
                        '<USER>は夢の中で<TARGET>を完全に支配した',
                        '<USER>は支配した<TARGET>の生気を容赦なく吸い取っている...',
                        '<TARGET>は完全に支配されながら生気を全て奪われていく！'
                    ],
                    weight: 1
                }
            ];
            
            return dreamAttacks[Math.floor(Math.random() * dreamAttacks.length)];
        }
        
        // Calculate debuff level
        const debuffLevel = player.statusEffects.getDebuffLevel();
        
        // If player has 10+ debuffs, try to put them to sleep
        if (debuffLevel >= 10) {
            const sleepActions = dreamDemonActions.filter(action => 
                action.statusEffect === StatusEffectType.Sleep
            );
            if (sleepActions.length > 0 && Math.random() < 0.8) {
                return sleepActions[Math.floor(Math.random() * sleepActions.length)];
            }
        }
        
        // Strategic actions based on player state
        if (player.maxHp <= 0) {
            // Max HP is 0 or below: always eat with special messages
            return {
                type: ActionType.EatAttack,
                name: 'ゆっくり丸呑み',
                description: '弱り切った獲物をゆっくりと丸呑みにする',
                messages: [
                    '<USER>はクスクスと笑い始めた...',
                    '<TARGET>は生気を吸い取られすぎて動けなくなってしまった...',
                    '<USER>はゆっくりと<TARGET>に近づいてくる...',
                    '<USER>は動けなくなった<TARGET>をゆっくりと口に含んでいく......',
                    'ごっくん......',
                    '<TARGET>は<USER>のお腹の中に取り込まれてしまった...'
                ],
                weight: 1
            };
        }
        
        if (player.isKnockedOut()) {
            if (player.isRestrained()) {
                // Restrained + Knocked Out: 70% chance to eat
                if (Math.random() < 0.7) {
                    return {
                        type: ActionType.EatAttack,
                        name: 'ゆっくり丸呑み',
                        description: '拘束した獲物をゆっくりと丸呑みにする',
                        messages: [
                            '<USER>はクスクスと笑い始めた...',
                            '<USER>はゆっくりと<TARGET>に近づいてくる...',
                            '<USER>は<TARGET>をゆっくりと口に含んでいく......',
                            'ごっくん......'
                        ],
                        weight: 1
                    };
                }
            } else {
                // Normal + Knocked Out: 60% chance to restrain, 15% to eat directly
                const random = Math.random();
                if (random < 0.6) {
                    const restraintActions = dreamDemonActions.filter(action => 
                        action.type === ActionType.RestraintAttack
                    );
                    return restraintActions[Math.floor(Math.random() * restraintActions.length)];
                } else if (random < 0.75) {
                    return {
                        type: ActionType.EatAttack,
                        name: 'ゆっくり丸呑み',
                        description: '無防備な獲物をゆっくりと丸呑みにする',
                        messages: [
                            '<USER>はクスクスと笑い始めた...',
                            '<USER>は<TARGET>をゆっくりと口に含んでいく......',
                            'ごっくん......'
                        ],
                        weight: 1
                    };
                }
            }
        }
        
        // If player is restrained, use restraint-specific attacks
        if (player.isRestrained()) {
            const restraintAttacks = dreamDemonActions.filter(action => 
                action.playerStateCondition === 'restrained'
            );
            if (restraintAttacks.length > 0 && Math.random() < 0.9) {
                const totalWeight = restraintAttacks.reduce((sum, action) => sum + action.weight, 0);
                let random = Math.random() * totalWeight;
                
                for (const action of restraintAttacks) {
                    random -= action.weight;
                    if (random <= 0) {
                        return action;
                    }
                }
            }
        }
        
        // Restraint timing - starts after 8 turns, then every 7-9 turns with some randomness
        if (turn > 8) {
            const restraintInterval = 7 + Math.floor(Math.random() * 3); // 7-9 turns
            if ((turn - 8) % restraintInterval === 0 && !player.isRestrained() && !player.isEaten()) {
                const restraintActions = dreamDemonActions.filter(action => 
                    action.type === ActionType.RestraintAttack
                );
                if (restraintActions.length > 0 && Math.random() < 0.8) {
                    return restraintActions[Math.floor(Math.random() * restraintActions.length)];
                }
            }
        }
        
        // Debuff priority system
        const statusPriorities = [
            // Primary debuffs to establish early
            { type: StatusEffectType.Charm, weight: 3.0, priority: 1 },
            { type: StatusEffectType.Infatuation, weight: 2.5, priority: 1 },
            { type: StatusEffectType.AphrodisiacPoison, weight: 2.8, priority: 1 },
            
            // Secondary debuffs for stacking
            { type: StatusEffectType.Weakness, weight: 2.2, priority: 2 },
            { type: StatusEffectType.Arousal, weight: 2.4, priority: 2 },
            { type: StatusEffectType.Seduction, weight: 2.0, priority: 2 },
            
            // Tertiary debuffs for variety
            { type: StatusEffectType.Paralysis, weight: 1.8, priority: 3 },
            { type: StatusEffectType.Confusion, weight: 1.6, priority: 3 },
            { type: StatusEffectType.Drowsiness, weight: 1.9, priority: 3 },
            { type: StatusEffectType.Sweet, weight: 1.7, priority: 3 },
            { type: StatusEffectType.MagicSeal, weight: 1.5, priority: 3 },
            { type: StatusEffectType.Melting, weight: 1.8, priority: 3 },
            { type: StatusEffectType.Euphoria, weight: 1.6, priority: 3 },
            
            // Advanced debuffs for later stages
            { type: StatusEffectType.PleasureFall, weight: 1.2, priority: 4 },
            { type: StatusEffectType.Lewdness, weight: 1.0, priority: 4 },
            { type: StatusEffectType.Fascination, weight: 1.1, priority: 4 },
            { type: StatusEffectType.Bliss, weight: 0.9, priority: 4 },
            { type: StatusEffectType.Enchantment, weight: 0.7, priority: 5 },
            { type: StatusEffectType.Hypnosis, weight: 0.8, priority: 5 },
            { type: StatusEffectType.Brainwash, weight: 0.6, priority: 5 }
        ];
        
        // Find debuffs not currently applied
        const missingDebuffs = statusPriorities.filter(status => 
            !player.statusEffects.hasEffect(status.type)
        );
        
        // Prioritize by current turn and debuff priority
        const turnFactor = Math.min(turn / 5, 3); // Gradually increase priority over time
        const applicableDebuffs = missingDebuffs.filter(status => 
            status.priority <= (1 + turnFactor)
        );
        
        if (applicableDebuffs.length > 0) {
            // Weight selection by priority and turn
            const weightedDebuffs = applicableDebuffs.map(status => ({
                ...status,
                adjustedWeight: status.weight * (4 - status.priority + turnFactor)
            }));
            
            const totalWeight = weightedDebuffs.reduce((sum, status) => sum + status.adjustedWeight, 0);
            let random = Math.random() * totalWeight;
            
            for (const status of weightedDebuffs) {
                random -= status.adjustedWeight;
                if (random <= 0) {
                    const statusAction = dreamDemonActions.find(action => 
                        action.statusEffect === status.type && action.type === ActionType.StatusAttack &&
                        (!action.playerStateCondition || action.playerStateCondition === 'normal')
                    );
                    if (statusAction) {
                        return statusAction;
                    }
                }
            }
        }
        
        // If no specific debuffs needed, use weighted random selection
        const availableActions = dreamDemonActions.filter(action => {
            // Exclude restraint-specific and special actions
            if (action.playerStateCondition === 'restrained') return false;
            if (action.statusEffect === StatusEffectType.Sleep) return false;
            if (action.statusEffect === StatusEffectType.Hypnosis && debuffLevel < 5) return false;
            if (action.statusEffect === StatusEffectType.Brainwash && debuffLevel < 7) return false;
            
            if (action.canUse) {
                return action.canUse(boss, player, turn);
            }
            return true;
        });
        
        if (availableActions.length === 0) {
            // Fallback to basic attack
            return dreamDemonActions.find(action => action.type === ActionType.Attack) || dreamDemonActions[0];
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
    }
};

// Override dialogue for talkative personality
dreamDemonData.getDialogue = function(situation: 'battle-start' | 'player-restrained' | 'player-eaten' | 'player-escapes' | 'low-hp' | 'victory') {
    const dialogues: Record<string, string[]> = {
        'battle-start': [
            'あら〜♪ 新しい獲物が来たのね〜',
            'うふふ♡ とっても美味しそうな魂の匂い〜',
            'あまあまな夢を見せてあげる♪',
            'その生気、ちゅーちゅー吸わせて♡',
            '一緒に夢の世界で遊びましょ〜♪'
        ],
        'player-restrained': [
            'うふふ♡ 動けないのね〜？',
            'もがけばもがくほど可愛いわ♪',
            'あまあまにしてあげる〜♡',
            'その顔...とっても良い表情よ♪',
            'どんどん弱くなっていくのね〜♡',
            '抵抗しても無駄よ〜？'
        ],
        'player-eaten': [
            'あ〜んおいしい♡',
            'おなかの中であまあまされてる？',
            'ゆっくりと生気を吸い取ってあげる〜',
            'もうずっとここにいましょ♪',
            'あまあまな気分になってるでしょ♡',
            'ちゅーちゅー...美味しい〜♪'
        ],
        'player-escapes': [
            'あら...生意気ね〜',
            'でもまたすぐに捕まえてあげる♪',
            '逃げても無駄よ〜？',
            '今度はもっと優しくしてあげる♡',
            'ふふっ...面白いことしてくれるじゃない'
        ],
        'low-hp': [
            'まだまだ...負けないわよ〜',
            '本気出しちゃうから〜♪',
            'あまあまな夢で包んであげる♡',
            'こんなのまだ序の口よ〜',
            '夢の世界では私が最強なの♪'
        ],
        'victory': [
            'うふふ♡ とっても美味しかった〜',
            'またあまあまな夢で会いましょ♪',
            '生気をたくさんもらっちゃった♡',
            'いい夢見なさいよ〜♪',
            'ずっと夢の中で一緒にいましょ♡'
        ]
    };
    
    const options = dialogues[situation] || dialogues['battle-start'];
    return options[Math.floor(Math.random() * options.length)];
};

// Add finishing move for final victory
dreamDemonData.finishingMove = function() {
    return [
        '<USER>は力尽きた<TARGET>を完全に消化してしまった...',
        '<USER>はお腹をさすりながら満足げな表情を浮かべる',
        'けぷっ、おいしかったぁ♡',
        '<TARGET>は<USER>の一部となって永遠に夢の世界に残ることになった...'
    ];
};