import { BossData, ActionType, BossAction, Boss } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffectTypes';

const dreamDemonActions: BossAction[] = [
    // Basic attack
    {
        id: 'magic-tentacle',
        type: ActionType.Attack,
        name: '魔法の触手',
        description: '小さな触手で軽く攻撃',
        messages: [
            'ちょちょいっと触手攻撃ンメェ〜♪',
            '<USER>は小さな触手で<TARGET>を軽くペチペチと叩いた！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.8,
        hitRate: 0.95,
        weight: 15,
        playerStateCondition: 'normal'
    },
    
    // Debuff attacks - Primary arsenal
    {
        id: 'charming-gaze',
        type: ActionType.StatusAttack,
        name: '魅惑の眼差し',
        description: '甘い視線で相手を魅了する',
        statusEffect: StatusEffectType.Charm,
        statusChance: 0.90,
        weight: 25,
        messages: [
            'あたいの可愛さに見とれちゃいなンメェ〜♪',
            '<USER>は甘い眼差しで<TARGET>を見つめる...',
            '<TARGET>の心がとろけそうになる...'
        ]
    },
    {
        id: 'paralysis-powder',
        type: ActionType.StatusAttack,
        name: '麻痺の粉',
        description: '麻痺を誘発する粉末を撒く',
        statusEffect: StatusEffectType.Paralysis,
        statusChance: 0.85,
        weight: 20,
        messages: [
            'きらきら〜な粉をまいちゃうンメェ〜♪',
            '<USER>は光る粉を撒き散らした！',
            '<TARGET>の体がしびれていく...'
        ]
    },
    {
        id: 'aphrodisiac-breath',
        type: ActionType.StatusAttack,
        name: '淫毒の吐息',
        description: '甘い毒を含んだ息を吹きかける',
        statusEffect: StatusEffectType.AphrodisiacPoison,
        statusChance: 0.90,
        weight: 25,
        messages: [
            'あまあま〜な息をふーってしてあげるンメェ〜♪',
            '<USER>は甘い香りの息を<TARGET>に吹きかけた',
            '<TARGET>の体が熱くなってきた...'
        ]
    },
    {
        id: 'sleep-inducer',
        type: ActionType.StatusAttack,
        name: 'ねむけ誘発',
        description: '眠気を誘う魔法をかける',
        statusEffect: StatusEffectType.Drowsiness,
        statusChance: 0.80,
        weight: 20,
        messages: [
            'ねむねむになっちゃえンメェ〜♪',
            '<USER>は催眠術をかけてきた',
            '<TARGET>のまぶたが重くなってきた...'
        ]
    },
    {
        id: 'weakness-spell',
        type: ActionType.StatusAttack,
        name: '脱力の呪文',
        description: '力を奪う呪文を唱える',
        statusEffect: StatusEffectType.Weakness,
        statusChance: 0.85,
        weight: 20,
        messages: [
            'だら〜んってしちゃえンメェ〜♪',
            '<USER>は呪文を唱えた',
            '<TARGET>の力が抜けていく...'
        ]
    },
    {
        id: 'infatuation-beam',
        type: ActionType.StatusAttack,
        name: 'メロメロビーム',
        description: 'ハート型の光線で相手をメロメロにする',
        statusEffect: StatusEffectType.Infatuation,
        statusChance: 0.80,
        weight: 25,
        messages: [
            'きゃぴ〜ん♪ メロメロビーム発射ンメェ〜！',
            '<USER>はハート型の光線を放った！',
            '<TARGET>は完全にメロメロになってしまった...'
        ]
    },
    {
        id: 'confusion-vortex',
        type: ActionType.StatusAttack,
        name: '混乱の渦',
        description: '思考を混乱させる魔法',
        statusEffect: StatusEffectType.Confusion,
        statusChance: 0.75,
        weight: 20,
        messages: [
            'ぐるぐる〜って混乱させちゃうンメェ〜♪',
            '<USER>は不思議な渦を作り出した',
            '<TARGET>の思考が混乱してきた...'
        ]
    },
    {
        id: 'arousal-enhancer',
        type: ActionType.StatusAttack,
        name: '発情促進',
        description: '発情状態を誘発する魔法',
        statusEffect: StatusEffectType.Arousal,
        statusChance: 0.85,
        weight: 25,
        messages: [
            'ぽっかぽか〜にしてあげるンメェ〜♪',
            '<USER>は妖艶な魔法をかけた',
            '<TARGET>の体が火照ってきた...'
        ]
    },
    {
        id: 'seductive-pose',
        type: ActionType.StatusAttack,
        name: '悩殺ポーズ',
        description: '魅惑的なポーズで相手を悩殺する',
        statusEffect: StatusEffectType.Seduction,
        statusChance: 0.80,
        weight: 20,
        messages: [
            'きゃ〜ん♪ あたいの悩殺ポーズンメェ〜',
            '<USER>は急接近し深いべろちゅーをしてきた！',
            '<TARGET>は完全に悩殺されてしまった...'
        ]
    },
    {
        id: 'magic-seal',
        type: ActionType.StatusAttack,
        name: '魔法封印術',
        description: '魔法の使用を封じる',
        statusEffect: StatusEffectType.MagicSeal,
        statusChance: 0.90,
        weight: 15,
        messages: [
            'まほう使えなくしちゃうンメェ〜♪',
            '<USER>は封印の呪文を唱えた',
            '<TARGET>の魔力が封じられた！'
        ]
    },
    {
        id: 'pleasure-curse',
        type: ActionType.StatusAttack,
        name: '快楽の呪い',
        description: '快楽に溺れさせる強力な呪い',
        statusEffect: StatusEffectType.PleasureFall,
        statusChance: 0.70,
        weight: 15,
        messages: [
            'あまあま〜な快楽に溺れちゃえンメェ〜♪',
            '<USER>は禁断の呪いをかけた...',
            '<TARGET>は快楽の波に飲み込まれていく...'
        ]
    },
    {
        id: 'lewdness-magic',
        type: ActionType.StatusAttack,
        name: '淫乱の魔法',
        description: '理性を奪う淫らな魔法',
        statusEffect: StatusEffectType.Lewdness,
        statusChance: 0.75,
        weight: 15,
        messages: [
            'えっちな魔法で理性を飛ばしちゃうンメェ〜♪',
            '<USER>は淫らな魔法を唱えた',
            '<TARGET>の理性が揺らいでいく...'
        ]
    },
    {
        id: 'hypnotic-wave',
        type: ActionType.StatusAttack,
        name: '催眠波動',
        description: '強力な催眠術で意識を奪う',
        statusEffect: StatusEffectType.Hypnosis,
        statusChance: 0.60,
        weight: 10,
        canUse: (_boss, player, _turn) => {
            // Use when player has multiple debuffs
            return player.statusEffects.getDebuffLevel() >= 5;
        },
        messages: ['<USER>は強力な催眠波動を放った！', '<TARGET>の意識が朦朧としてきた...']
    },
    {
        id: 'brainwash-beam',
        type: ActionType.StatusAttack,
        name: '洗脳光線',
        description: '思考を支配する洗脳光線',
        statusEffect: StatusEffectType.Brainwash,
        statusChance: 0.50,
        weight: 8,
        canUse: (_boss, player, _turn) => {
            // Use when player is severely debuffed
            return player.statusEffects.getDebuffLevel() >= 7;
        },
        messages: ['<USER>は邪悪な光線を<TARGET>に向けた...', '<TARGET>の思考が侵食されていく...']
    },
    {
        id: 'sweet-magic',
        type: ActionType.StatusAttack,
        name: 'あまあま魔法',
        description: '甘い幸福感で抵抗力を奪う',
        statusEffect: StatusEffectType.Sweet,
        statusChance: 0.85,
        weight: 20,
        messages: ['<USER>は甘い魔法をかけた', '<TARGET>は幸せな気分になった...']
    },
    {
        id: 'melting-magic',
        type: ActionType.StatusAttack,
        name: 'とろとろ魔法',
        description: '意識をとろけさせる魔法',
        statusEffect: StatusEffectType.Melting,
        statusChance: 0.85,
        weight: 20,
        messages: ['<USER>はとろける魔法をかけた', '<TARGET>の意識がとろけていく...']
    },
    {
        id: 'euphoria-magic',
        type: ActionType.StatusAttack,
        name: 'うっとり魔法',
        description: '恍惚状態にする魔法',
        statusEffect: StatusEffectType.Euphoria,
        statusChance: 0.80,
        weight: 18,
        messages: ['<USER>は恍惚の魔法をかけた', '<TARGET>はうっとりとした表情になった...']
    },
    {
        id: 'fascination-art',
        type: ActionType.StatusAttack,
        name: '魅惑の術',
        description: '深い魅惑状態にする魔法',
        statusEffect: StatusEffectType.Fascination,
        statusChance: 0.85,
        weight: 20,
        messages: ['<USER>は魅惑の術を唱えた', '<TARGET>は深い魅惑に囚われた...']
    },
    {
        id: 'bliss-spell',
        type: ActionType.StatusAttack,
        name: '至福の呪文',
        description: '至福の陶酔状態にする',
        statusEffect: StatusEffectType.Bliss,
        statusChance: 0.75,
        weight: 15,
        messages: ['<USER>は至福の呪文を唱えた', '<TARGET>は至福の表情を浮かべた...']
    },
    {
        id: 'enchantment-technique',
        type: ActionType.StatusAttack,
        name: '魅了術',
        description: '強力な魅了魔法で完全支配',
        statusEffect: StatusEffectType.Enchantment,
        statusChance: 0.70,
        weight: 12,
        canUse: (_boss, player, _turn) => {
            // Use when player has multiple debuffs
            return player.statusEffects.getDebuffLevel() >= 6;
        },
        messages: ['<USER>は強力な魅了術を発動した', '<TARGET>は完全に魅了されてしまった...']
    },
    
    // Restraint attacks
    {
        id: 'tail-restraint',
        type: ActionType.RestraintAttack,
        name: '尻尾による拘束',
        description: '長い尻尾で対象を捕らえる',
        weight: 20,
        hitRate: 0.85,
        messages: [
            'しっぽでぎゅーってしちゃうンメェ〜♪',
            '<USER>は長い尻尾で<TARGET>を捕らえようとしてきた！'
        ],
        canUse: (_boss, player, _turn) => {
            return !player.isRestrained() && !player.isEaten() && Math.random() < 0.4;
        }
    },
    {
        id: 'magic-hand-restraint',
        type: ActionType.RestraintAttack,
        name: '魔法の手による拘束',
        description: '魔法の手で対象を捕まえる',
        weight: 18,
        hitRate: 0.80,
        messages: [
            'まほうの手でつかまえちゃうンメェ〜♪',
            '<USER>は魔法の手を伸ばして<TARGET>を掴もうとしてきた！'
        ],
        canUse: (_boss, player, _turn) => {
            return !player.isRestrained() && !player.isEaten() && Math.random() < 0.35;
        }
    },
    {
        id: 'teleport-restraint',
        type: ActionType.RestraintAttack,
        name: 'テレポート拘束',
        description: 'テレポートして背後から捕らえる',
        weight: 15,
        hitRate: 0.90,
        messages: [
            'てれぽーとで背後を取るンメェ〜♪',
            '<USER>は一瞬姿を消した...',
            '気づくと<USER>が<TARGET>の背後にいた！'
        ],
        canUse: (_boss, player, _turn) => {
            return !player.isRestrained() && !player.isEaten() && Math.random() < 0.3;
        }
    },
    
    // Restraint-specific actions
    {
        id: 'seductive-kiss',
        type: ActionType.StatusAttack,
        name: '悩殺キス',
        description: '拘束中の相手に魅惑的なキスをする',
        damageFormula: (user: Boss) => user.attackPower * 0.1,
        statusEffect: StatusEffectType.Infatuation,
        statusChance: 0.95,
        weight: 30,
        playerStateCondition: 'restrained',
        messages: [
            'ちゅ〜♪ あまあまキスしてあげるンメェ〜',
            '<USER>は<TARGET>に熱いキスをした...',
            '<TARGET>は完全にとろけてしまった...'
        ]
    },
    {
        id: 'tongue-attack',
        type: ActionType.StatusAttack,
        name: 'べろちゅ攻撃',
        description: '大きな舌で相手をなめまわす',
        damageFormula: (user: Boss) => user.attackPower * 0.2,
        statusEffect: StatusEffectType.Arousal,
        statusChance: 0.90,
        weight: 28,
        playerStateCondition: 'restrained',
        messages: [
            'べろべろ〜♪ あまあまにしてやるンメェ〜',
            '<USER>は大きな舌で<TARGET>をべろべろとなめまわした',
            '<TARGET>の体が震えている...'
        ]
    },
    {
        id: 'body-contact-attack',
        type: ActionType.StatusAttack,
        name: '体密着攻撃',
        description: '体を密着させて誘惑する',
        damageFormula: (user: Boss) => user.attackPower * 0.1,
        statusEffect: StatusEffectType.Seduction,
        statusChance: 0.95,
        weight: 25,
        playerStateCondition: 'restrained',
        messages: [
            'ぺったんぺったん〜♪ 密着攻撃ンメェ〜',
            '<USER>は<TARGET>に体を密着させてきた',
            '<TARGET>は誘惑に負けそうになっている...'
        ]
    },
    {
        id: 'shaking-attack',
        type: ActionType.StatusAttack,
        name: '揺さぶり攻撃',
        description: '体を揺さぶって快楽を与える',
        damageFormula: (user: Boss) => user.attackPower * 0.2,
        statusEffect: StatusEffectType.PleasureFall,
        statusChance: 0.80,
        weight: 20,
        playerStateCondition: 'restrained',
        messages: [
            'ゆさゆさ〜♪ あまあまにしてやるンメェ〜',
            '<USER>は<TARGET>の体をリズミカルに揺さぶった',
            '<TARGET>は快楽の波に飲み込まれていく...'
        ]
    },
    
    // Additional restraint actions for more variety
    {
        id: 'intense-contact',
        type: ActionType.StatusAttack,
        name: '激しい密着',
        description: '体を激しく密着させて圧迫する',
        damageFormula: (user: Boss) => user.attackPower * 0.1,
        statusEffect: StatusEffectType.Bliss,
        statusChance: 0.85,
        weight: 25,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>に激しく体を押し付けてきた', '<TARGET>は息ができないほど密着されている...']
    },
    {
        id: 'intense-shaking',
        type: ActionType.StatusAttack,
        name: '激しい揺さぶり',
        description: '体を激しく揺さぶって感覚を狂わせる',
        damageFormula: (user: Boss) => user.attackPower * 0.2,
        statusEffect: StatusEffectType.Lewdness,
        statusChance: 0.90,
        weight: 23,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>を激しく揺さぶった', '<TARGET>の理性が揺らいでいく...']
    },
    {
        id: 'sensual-movement',
        type: ActionType.StatusAttack,
        name: '官能的な動き',
        description: '官能的な動きで相手を魅了する',
        damageFormula: (user: Boss) => user.attackPower * 0.1,
        statusEffect: StatusEffectType.Fascination,
        statusChance: 0.95,
        weight: 26,
        playerStateCondition: 'restrained',
        messages: ['<USER>は官能的な動きを見せつけてきた', '<TARGET>は目が離せなくなっている...']
    },
    {
        id: 'intense-caress',
        type: ActionType.StatusAttack,
        name: '激しい愛撫',
        description: '激しく愛撫して感覚を麻痺させる',
        damageFormula: (user: Boss) => user.attackPower * 0.2,
        statusEffect: StatusEffectType.Melting,
        statusChance: 0.88,
        weight: 24,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>を激しく愛撫してきた', '<TARGET>の感覚がとろけていく...']
    },
    {
        id: 'pressure-attack',
        type: ActionType.StatusAttack,
        name: '圧迫攻撃',
        description: '体重をかけて圧迫し続ける',
        damageFormula: (user: Boss) => user.attackPower * 0.1,
        statusEffect: StatusEffectType.Euphoria,
        statusChance: 0.85,
        weight: 22,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>に全体重をかけて圧迫してきた', '<TARGET>は恍惚の表情を浮かべている...']
    },
    
    // All debuff restraint versions
    {
        id: 'restraint-charm',
        type: ActionType.StatusAttack,
        name: '拘束魅了',
        description: '拘束中に強力な魅了をかける',
        damageFormula: (user: Boss) => user.attackPower * 0.1,
        statusEffect: StatusEffectType.Charm,
        statusChance: 0.98,
        weight: 20,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>を見つめながら強力な魅了をかけた', '<TARGET>の意思が完全に奪われていく...']
    },
    {
        id: 'restraint-paralysis',
        type: ActionType.StatusAttack,
        name: '拘束麻痺',
        description: '拘束中に麻痺効果を与える',
        damageFormula: (user: Boss) => user.attackPower * 0.1,
        statusEffect: StatusEffectType.Paralysis,
        statusChance: 0.95,
        weight: 18,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>の神経を痺れさせた', '<TARGET>の体が完全に痺れてしまった...']
    },
    {
        id: 'restraint-aphrodisiac',
        type: ActionType.StatusAttack,
        name: '拘束淫毒',
        description: '拘束中に淫毒を注入する',
        damageFormula: (user: Boss) => user.attackPower * 0.2,
        statusEffect: StatusEffectType.AphrodisiacPoison,
        statusChance: 0.98,
        weight: 22,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>に直接淫毒を注入した', '<TARGET>の体が激しく火照っていく...']
    },
    {
        id: 'restraint-sleep-induction',
        type: ActionType.StatusAttack,
        name: '拘束睡眠誘導',
        description: '拘束中に強制的に眠らせる',
        damageFormula: (user: Boss) => user.attackPower * 0.1,
        statusEffect: StatusEffectType.Drowsiness,
        statusChance: 0.95,
        weight: 19,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>の意識を朦朧とさせた', '<TARGET>の意識がだんだん遠のいていく...']
    },
    {
        id: 'restraint-weakness',
        type: ActionType.StatusAttack,
        name: '拘束脱力',
        description: '拘束中に力を完全に奪う',
        damageFormula: (user: Boss) => user.attackPower * 0.1,
        statusEffect: StatusEffectType.Weakness,
        statusChance: 0.98,
        weight: 21,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>の力を吸い取った', '<TARGET>の体から力が完全に抜けていく...']
    },
    {
        id: 'restraint-confusion',
        type: ActionType.StatusAttack,
        name: '拘束混乱',
        description: '拘束中に思考を混乱させる',
        damageFormula: (user: Boss) => user.attackPower * 0.1,
        statusEffect: StatusEffectType.Confusion,
        statusChance: 0.95,
        weight: 18,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>の思考を混乱させた', '<TARGET>は何が何だかわからなくなっている...']
    },
    {
        id: 'restraint-magic-seal',
        type: ActionType.StatusAttack,
        name: '拘束魔法封印',
        description: '拘束中に魔法を完全封印する',
        damageFormula: (user: Boss) => user.attackPower * 0.1,
        statusEffect: StatusEffectType.MagicSeal,
        statusChance: 0.98,
        weight: 17,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>の魔力を封印した', '<TARGET>の魔法が使えなくなった...']
    },
    {
        id: 'restraint-melting',
        type: ActionType.StatusAttack,
        name: '拘束とろとろ',
        description: '拘束中に意識をとろけさせる',
        damageFormula: (user: Boss) => user.attackPower * 0.2,
        statusEffect: StatusEffectType.Melting,
        statusChance: 0.95,
        weight: 22,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>の意識をとろけさせた', '<TARGET>の思考が液体のようにとろけていく...']
    },
    {
        id: 'restraint-euphoria',
        type: ActionType.StatusAttack,
        name: '拘束うっとり',
        description: '拘束中に恍惚状態にする',
        damageFormula: (user: Boss) => user.attackPower * 0.1,
        statusEffect: StatusEffectType.Euphoria,
        statusChance: 0.92,
        weight: 19,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>を恍惚状態にした', '<TARGET>はうっとりと夢見心地になっている...']
    },
    {
        id: 'restraint-sweet',
        type: ActionType.StatusAttack,
        name: '拘束あまあま',
        description: '拘束中に甘い幸福感を与える',
        damageFormula: (user: Boss) => user.attackPower * 0.1,
        statusEffect: StatusEffectType.Sweet,
        statusChance: 0.95,
        weight: 20,
        playerStateCondition: 'restrained',
        messages: ['<USER>は<TARGET>に甘い幸福感を与えた', '<TARGET>は幸せそうな表情を浮かべている...']
    },
    {
        id: 'restraint-hypnosis',
        type: ActionType.StatusAttack,
        name: '拘束催眠',
        description: '拘束中に強制催眠をかける',
        damageFormula: (user: Boss) => user.attackPower * 0.1,
        statusEffect: StatusEffectType.Hypnosis,
        statusChance: 0.90,
        weight: 15,
        playerStateCondition: 'restrained',
        canUse: (_boss, player, _turn) => {
            return player.statusEffects.getDebuffLevel() >= 8;
        },
        messages: ['<USER>は<TARGET>に強制催眠をかけた', '<TARGET>の意識が完全に支配された...']
    },
    {
        id: 'restraint-brainwash',
        type: ActionType.StatusAttack,
        name: '拘束洗脳',
        description: '拘束中に思考を洗脳する',
        damageFormula: (user: Boss) => user.attackPower * 0.2,
        statusEffect: StatusEffectType.Brainwash,
        statusChance: 0.85,
        weight: 12,
        playerStateCondition: 'restrained',
        canUse: (_boss, player, _turn) => {
            return player.statusEffects.getDebuffLevel() >= 10;
        },
        messages: ['<USER>は<TARGET>の思考を洗脳した', '<TARGET>の心が完全に支配されてしまった...']
    },
    
    // Sleep-inducing attacks (restraint-only, after 7 turns restrained)
    {
        id: 'sleep-kiss',
        type: ActionType.StatusAttack,
        name: '眠りのキス',
        description: '拘束中の相手に眠りを誘うキスをする',
        statusEffect: StatusEffectType.Sleep,
        statusChance: 0.95,
        weight: 5,
        playerStateCondition: 'restrained',
        canUse: (_boss, player, _turn) => {
            // Need restraint counter implementation - for now use turn based approximation
            // Player must be restrained for 7+ turns
            return player.isRestrained() && Math.random() < 0.3; // Temporary logic
        },
        messages: [
            'ちゅ〜♪ 特別なキスをしてあげるンメェ〜',
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
    displayName: '😈 夢の淫魔',
    description: '夢を操る小さな淫魔',
    questNote: `最近、冒険者たちが奇妙な夢にうなされて目覚めないという事件が多発している。調査によると、夢の世界に小さな淫魔が現れ、甘い誘惑で冒険者たちを虜にしているという。この夢魔を討伐し、被害者たちを救出せよ。`,
    maxHp: 320,
    attackPower: 10,
    actions: dreamDemonActions,
    icon: '😈',
    explorerLevelRequired: 3,
    battleStartMessages: [
        {
            speaker: 'player',
            style: 'default',
            text: 'あなたは夢の世界に迷い込み、小さな淫魔と対峙した。'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: 'あっ♪ 新しい獲物が来たンメェ〜！'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: '夢魔ちゃんはクスクス笑いながらあなたを見つめている...',
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: 'へへへ、とっても美味しそうな魂の匂いンメェ〜！一緒にあまあまな夢を見ようンメェ〜♪'
        }
    ],
    victoryMessages: [
        {
            speaker: 'boss',
            style: 'talk',
            text: 'うぐっ...まさかあたいが負けるなんて...ンメェ...',
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: 'で、でもこれは運が悪かっただけンメェ！次は絶対勝つンメェ〜！'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: '夢魔ちゃんは負けを認めずに悔しそうに夢の世界へと消えていった...'
        }
    ],
    victoryTrophy: {
        name: '夢魔の角',
        description: '夢の淫魔の小さくて可愛らしい角。夢の世界への扉を開く力を秘めている。'
    },
    defeatTrophy: {
        name: '甘い夢のかけら',
        description: '夢の淫魔の心の奥から滲み出る甘美な夢のエッセンス。至福の夢を呼び起こす。'
    },
    guestCharacterInfo: {
        creator: 'crazybudgie'
    },
    personality: [
        'あっ、可愛い獲物が来たンメェ〜！',
        'その魂、とっても美味しそうンメェ〜',
        '夢の中で一緒に遊ぼうンメェ〜',
        'へへへ〜抵抗しても無駄だンメェ〜',
        'もっともっと弱らせてやるンメェ〜',
        'あまあまな夢を見せてやるンメェ〜',
        '生気をちゅーちゅー吸っちゃうンメェ〜',
        'ずっとずっと一緒にいるンメェ〜'
    ],
    aiStrategy: (boss, player, turn) => {
        // Dream Demon AI Strategy - Focus on debuff stacking and strategic restraint
        
        // If player is eaten, use random stomach attacks
        if (player.isEaten()) {
            const stomachAttacks = [
                {
                    id: 'stomach-wall-pressure',
                    type: ActionType.DevourAttack,
                    name: '胃壁圧迫',
                    damageFormula: (user: Boss) => user.attackPower * 1.8,
                    description: '胃壁で獲物を圧迫して生気を搾り取る',
                    messages: [
                        'おなかの中でぎゅ〜っとしてやるンメェ〜♪',
                        '<USER>の胃壁が<TARGET>を優しく圧迫してきた...',
                        '<TARGET>は胃壁に包まれながら生気を吸い取られている...'
                    ],
                    weight: 1
                },
                {
                    id: 'digestive-fluid-caress',
                    type: ActionType.DevourAttack,
                    name: '消化液愛撫',
                    damageFormula: (user: Boss) => user.attackPower * 2.0,
                    description: '特殊な消化液で獲物を愛撫しながら消化する',
                    messages: [
                        'あまあま〜な消化液でとろとろにしてやるンメェ〜♪',
                        '<USER>の甘い消化液が<TARGET>を包み込んだ...',
                        '<TARGET>は消化液に愛撫されながら生気が溶けていく...'
                    ],
                    weight: 1
                },
                {
                    id: 'stomach-massage',
                    type: ActionType.DevourAttack,
                    name: '胃内マッサージ',
                    damageFormula: (user: Boss) => user.attackPower * 1.6,
                    description: '胃の内側から優しくマッサージして生気を吸収',
                    messages: [
                        'もみもみ〜♪ 気持ちよくしてあげるンメェ〜',
                        '<USER>は胃の中で<TARGET>を優しくマッサージしている...',
                        '<TARGET>は心地よいマッサージを受けながら生気を奪われている...'
                    ],
                    weight: 1
                },
                {
                    id: 'direct-life-absorption',
                    type: ActionType.DevourAttack,
                    name: '生気直接吸収',
                    damageFormula: (user: Boss) => user.attackPower * 2.2,
                    description: '体内で直接生気を吸い取る',
                    messages: [
                        'ちゅーちゅー♪ 生気をいっぱい吸っちゃうンメェ〜',
                        '<USER>は<TARGET>の生気を直接ちゅーちゅーと吸い取り始めた...',
                        '<TARGET>は生気を根こそぎ吸い取られて意識が朦朧としている...'
                    ],
                    weight: 1
                }
            ];
            
            return stomachAttacks[Math.floor(Math.random() * stomachAttacks.length)];
        }
        
        // If player is post-defeated, use special post-defeat actions
        if (player.isDefeated()) {
            const postDefeatedActions = [
                {
                    id: 'dream-eternal-caress',
                    type: ActionType.PostDefeatedAttack,
                    name: '夢中での永遠の愛撫',
                    description: '夢の中で永遠に獲物を愛で続ける',
                    messages: [
                        'ずっとずっと一緒にいるンメェ〜♪',
                        '<USER>は夢の中で<TARGET>を永遠に愛でている...',
                        '<TARGET>は夢の中で<USER>に愛撫され続けている...',
                        '<TARGET>の意識は<USER>の夢の中に囚われている...'
                    ],
                    statusEffect: StatusEffectType.Charm,
                    weight: 1
                },
                {
                    id: 'dream-sweet-restraint',
                    type: ActionType.PostDefeatedAttack,
                    name: '夢中での甘い拘束',
                    description: '夢の中で獲物を甘く拘束し続ける',
                    messages: [
                        'もう逃がさないンメェ〜♪ ずっとあたいのものンメェ〜',
                        '<USER>は夢の中で<TARGET>を甘く拘束している...',
                        '<TARGET>は夢の拘束から逃れることができない...',
                        '<TARGET>の心は<USER>の夢に支配されている...'
                    ],
                    statusEffect: StatusEffectType.Hypnosis,
                    weight: 1
                },
                {
                    id: 'dream-bliss-experience',
                    type: ActionType.PostDefeatedAttack,
                    name: '夢中での至福体験',
                    description: '夢の中で獲物に至福を与え続ける',
                    messages: [
                        'あまあま〜な至福をずっと味わわせてあげるンメェ〜♪',
                        '<USER>は夢の中で<TARGET>に至福を与えている...',
                        '<TARGET>は夢の中で至福に包まれている...',
                        '<TARGET>の魂は<USER>の夢に溶けている...'
                    ],
                    statusEffect: StatusEffectType.Bliss,
                    weight: 1
                },
                {
                    id: 'dream-fascination-art',
                    type: ActionType.PostDefeatedAttack,
                    name: '夢中での魅了術',
                    description: '夢の中で獲物を魅了し続ける',
                    messages: [
                        'あたいの魅力にもうメロメロンメェ〜♪',
                        '<USER>は夢の中で<TARGET>を魅了している...',
                        '<TARGET>は夢の中で<USER>に魅了され続けている...',
                        '<TARGET>の心は<USER>の魅力に完全に支配されている...'
                    ],
                    statusEffect: StatusEffectType.Fascination,
                    weight: 1
                },
                {
                    id: 'dream-sweet-domination',
                    type: ActionType.PostDefeatedAttack,
                    name: '夢中での甘い支配',
                    description: '夢の中で獲物を甘く支配し続ける',
                    messages: [
                        'あたいに完全に支配されちゃったンメェ〜♪',
                        '<USER>は夢の中で<TARGET>を甘く支配している...',
                        '<TARGET>は夢の中で<USER>に支配されている...',
                        '<TARGET>の意志は<USER>の夢に完全に屈服している...'
                    ],
                    statusEffect: StatusEffectType.Brainwash,
                    weight: 1
                }
            ];
            return postDefeatedActions[Math.floor(Math.random() * postDefeatedActions.length)];
        }
        
        // If player is sleeping, use random dream attacks
        if (player.statusEffects.isSleeping()) {
            const dreamAttacks = [
                {
                    id: 'dream-intense-contact',
                    type: ActionType.DevourAttack,
                    name: '夢中激しい密着',
                    damageFormula: (user: Boss) => user.attackPower * 0.6,
                    description: '夢の中で体を激しく密着させて生気を吸い取る',
                    messages: [
                        '夢の中でもぺったんぺったんンメェ〜♪',
                        '<USER>は夢の中で<TARGET>に激しく体を密着させた',
                        '<USER>は<TARGET>の生気を激しくちゅーちゅーと吸い取っている...',
                        '<TARGET>は生気が吸い取られているのを感じながら気持ちよくて抵抗できない！'
                    ],
                    weight: 1
                },
                {
                    id: 'dream-magic-tongue',
                    type: ActionType.DevourAttack,
                    name: '夢中魔力べろちゅー',
                    damageFormula: (user: Boss) => user.attackPower * 0.7,
                    description: '夢の中で魔力を込めたべろちゅーで生気を吸い取る',
                    messages: [
                        'べろべろ〜♪ 魔力いっぱいのべろちゅーンメェ〜',
                        '<USER>は夢の中で魔力を込めて<TARGET>にべろちゅーをした',
                        '<USER>は<TARGET>の生気をべろちゅーで吸い取っている...',
                        '<TARGET>は魔力に侵されながら生気を奪われていく...'
                    ],
                    weight: 1
                },
                {
                    id: 'dream-hug-attack',
                    type: ActionType.DevourAttack,
                    name: '夢中抱き着き攻撃',
                    damageFormula: (user: Boss) => user.attackPower * 0.5,
                    description: '夢の中で抱き着いて激しく動きながら生気を吸い取る',
                    messages: [
                        'ぎゅ〜っと抱き着き攻撃ンメェ〜♪',
                        '<USER>は夢の中で<TARGET>に抱き着いて激しく動いた',
                        '<USER>は密着しながら<TARGET>の生気をちゅーちゅーと吸い取っている...',
                        '<TARGET>は抱き着かれながら生気を奪われて快感に溺れている！'
                    ],
                    weight: 1
                },
                {
                    id: 'dream-tentacle-caress',
                    type: ActionType.DevourAttack,
                    name: '夢中触手愛撫',
                    damageFormula: (user: Boss) => user.attackPower * 0.6,
                    description: '夢の中で触手を使って愛撫しながら生気を吸い取る',
                    messages: [
                        'にゅるにゅる〜♪ 触手いっぱい出しちゃうンメェ〜',
                        '<USER>は夢の中で無数の触手で<TARGET>を愛撫した',
                        '<USER>の触手は<TARGET>の生気をじわじわと吸い取っている...',
                        '<TARGET>は触手に愛撫されながら生気を搾り取られていく...'
                    ],
                    weight: 1
                },
                {
                    id: 'dream-magic-pressure',
                    type: ActionType.DevourAttack,
                    name: '夢中魔法圧迫',
                    damageFormula: (user: Boss) => user.attackPower * 0.7,
                    description: '夢の中で魔法の力で圧迫しながら生気を吸い取る',
                    messages: [
                        'ぎゅぎゅ〜っと魔法で圧迫しちゃうンメェ〜♪',
                        '<USER>は夢の中で魔法の力で<TARGET>を圧迫した',
                        '<USER>は魔法で<TARGET>の生気を強制的に吸い取っている...',
                        '<TARGET>は魔法に圧迫されながら生気を根こそぎ奪われている！'
                    ],
                    weight: 1
                },
                {
                    id: 'dream-intense-shaking',
                    type: ActionType.DevourAttack,
                    name: '夢中激しい揺さぶり',
                    damageFormula: (user: Boss) => user.attackPower * 0.5,
                    description: '夢の中で激しく揺さぶりながら生気を吸い取る',
                    messages: [
                        'ゆさゆさ〜♪ 激しく揺さぶっちゃうンメェ〜',
                        '<USER>は夢の中で<TARGET>を激しく揺さぶった',
                        '<USER>は揺さぶりながら<TARGET>の生気をどんどん吸い取っている...',
                        '<TARGET>は激しく揺さぶられながら生気を吸い取られて意識が朦朧としている...'
                    ],
                    weight: 1
                },
                {
                    id: 'dream-fascinating-dance',
                    type: ActionType.DevourAttack,
                    name: '夢中魅惑の舞',
                    damageFormula: (user: Boss) => user.attackPower * 0.6,
                    description: '夢の中で魅惑的な舞を踊りながら生気を吸い取る',
                    messages: [
                        'くるくる〜♪ 魅惑の舞を踊っちゃうンメェ〜',
                        '<USER>は夢の中で<TARGET>の周りで魅惑的な舞を踊った',
                        '<USER>の舞は<TARGET>の生気を踊りながら吸い取っている...',
                        '<TARGET>は魅惑の舞に見とれながら生気をちゅーちゅー吸われている！'
                    ],
                    weight: 1
                },
                {
                    id: 'dream-magic-injection',
                    type: ActionType.DevourAttack,
                    name: '夢中魔力注入',
                    damageFormula: (user: Boss) => user.attackPower * 0.7,
                    description: '夢の中で魔力を注入しながら生気を吸い取る',
                    messages: [
                        'ずぶずぶ〜♪ 魔力を直接注入しちゃうンメェ〜',
                        '<USER>は夢の中で<TARGET>に直接魔力を注入した',
                        '<USER>の魔力は<TARGET>の生気を内側から吸い取っている...',
                        '<TARGET>は魔力に侵食されながら生気を内側から奪われていく...'
                    ],
                    weight: 1
                },
                {
                    id: 'dream-sweet-temptation',
                    type: ActionType.DevourAttack,
                    name: '夢中甘い誘惑',
                    damageFormula: (user: Boss) => user.attackPower * 0.5,
                    description: '夢の中で甘い誘惑をしながら生気を吸い取る',
                    messages: [
                        'あまあま〜♪ 甘い言葉でおびき寄せちゃうンメェ〜',
                        '<USER>は夢の中で<TARGET>に甘い誘惑をささやいた',
                        '<USER>は甘い言葉で<TARGET>の生気をそっと吸い取っている...',
                        '<TARGET>は甘い誘惑に溺れながら生気を静かに奪われている...'
                    ],
                    weight: 1
                },
                {
                    id: 'dream-complete-domination',
                    type: ActionType.DevourAttack,
                    name: '夢中完全支配',
                    damageFormula: (user: Boss) => user.attackPower * 0.6,
                    description: '夢の中で完全に支配しながら生気を吸い取る',
                    messages: [
                        'もう完全にあたいのものンメェ〜♪ 支配しちゃったンメェ〜',
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
                id: 'slow-swallow-critical',
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
                        id: 'slow-swallow-restrained',
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
                        id: 'slow-swallow-defenseless',
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
            'あっ♪ 新しい獲物が来たンメェ〜',
            'へへへ、とっても美味しそうな魂の匂いンメェ〜',
            'あまあまな夢を見せてやるンメェ〜',
            'その生気、ちゅーちゅー吸っちゃうンメェ〜',
            '一緒に夢の世界で遊ぼうンメェ〜'
        ],
        'player-restrained': [
            'へへへ、動けないンメェ〜？',
            'もがけばもがくほど面白いンメェ〜',
            'あまあまにしてやるンメェ〜',
            'その顔...とっても良い表情ンメェ〜',
            'どんどん弱くなっていくンメェ〜',
            '抵抗しても無駄だンメェ〜'
        ],
        'player-eaten': [
            'あ〜んおいしいンメェ〜',
            'おなかの中であまあまされてるンメェ〜？',
            'ゆっくりと生気を吸い取ってやるンメェ〜',
            'もうずっとここにいるンメェ〜',
            'あまあまな気分になってるンメェ〜',
            'ちゅーちゅー...美味しいンメェ〜'
        ],
        'player-escapes': [
            'あれ...生意気ンメェ〜',
            'でもまたすぐに捕まえてやるンメェ〜',
            '逃げても無駄だンメェ〜',
            '今度はもっと激しくしてやるンメェ〜',
            'へへっ...面白いことしてくれるンメェ〜'
        ],
        'low-hp': [
            'まだまだ...負けないンメェ〜',
            '本気出しちゃうンメェ〜',
            'あまあまな夢で包んでやるンメェ〜',
            'こんなのまだ序の口ンメェ〜',
            '夢の世界では僕が最強ンメェ〜'
        ],
        'victory': [
            'へへへ、とっても美味しかったンメェ〜',
            'またあまあまな夢で会おうンメェ〜',
            '生気をたくさんもらっちゃったンメェ〜',
            'いい夢見るンメェ〜',
            'ずっと夢の中で一緒にいるンメェ〜'
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
        'けぷっ、おいしかったンメェ〜',
        '<TARGET>は<USER>の一部となって永遠に夢の世界に残ることになった...'
    ];
};