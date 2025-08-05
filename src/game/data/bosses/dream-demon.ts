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
            '{boss}は小さな触手で{player}を軽くペチペチと叩いた！'
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
            '{boss}は甘い眼差しで{player}を見つめる...',
            '{player}の心がとろけそうになる...'
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
            '{boss}は光る粉を撒き散らした！',
            '{player}の体がしびれていく...'
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
            '{boss}は甘い香りの息を{player}に吹きかけた',
            '{player}の体が熱くなってきた...'
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
            '{boss}は催眠術をかけてきた',
            '{player}のまぶたが重くなってきた...'
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
            '{boss}は呪文を唱えた',
            '{player}の力が抜けていく...'
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
            '{boss}はハート型の光線を放った！',
            '{player}は完全にメロメロになってしまった...'
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
            '{boss}は不思議な渦を作り出した',
            '{player}の思考が混乱してきた...'
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
            '{boss}は妖艶な魔法をかけた',
            '{player}の体が火照ってきた...'
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
            '{boss}は急接近し深いべろちゅーをしてきた！',
            '{player}は完全に悩殺されてしまった...'
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
            '{boss}は封印の呪文を唱えた',
            '{player}の魔力が封じられた！'
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
            '{boss}は禁断の呪いをかけた...',
            '{player}は快楽の波に飲み込まれていく...'
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
            '{boss}は淫らな魔法を唱えた',
            '{player}の理性が揺らいでいく...'
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
        messages: ['{boss}は強力な催眠波動を放った！', '{player}の意識が朦朧としてきた...']
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
        messages: ['{boss}は邪悪な光線を{player}に向けた...', '{player}の思考が侵食されていく...']
    },
    {
        id: 'sweet-magic',
        type: ActionType.StatusAttack,
        name: 'あまあま魔法',
        description: '甘い幸福感で抵抗力を奪う',
        statusEffect: StatusEffectType.Sweet,
        statusChance: 0.85,
        weight: 20,
        messages: ['{boss}は甘い魔法をかけた', '{player}は幸せな気分になった...']
    },
    {
        id: 'melting-magic',
        type: ActionType.StatusAttack,
        name: 'とろとろ魔法',
        description: '意識をとろけさせる魔法',
        statusEffect: StatusEffectType.Melting,
        statusChance: 0.85,
        weight: 20,
        messages: ['{boss}はとろける魔法をかけた', '{player}の意識がとろけていく...']
    },
    {
        id: 'euphoria-magic',
        type: ActionType.StatusAttack,
        name: 'うっとり魔法',
        description: '恍惚状態にする魔法',
        statusEffect: StatusEffectType.Euphoria,
        statusChance: 0.80,
        weight: 18,
        messages: ['{boss}は恍惚の魔法をかけた', '{player}はうっとりとした表情になった...']
    },
    {
        id: 'fascination-art',
        type: ActionType.StatusAttack,
        name: '魅惑の術',
        description: '深い魅惑状態にする魔法',
        statusEffect: StatusEffectType.Fascination,
        statusChance: 0.85,
        weight: 20,
        messages: ['{boss}は魅惑の術を唱えた', '{player}は深い魅惑に囚われた...']
    },
    {
        id: 'bliss-spell',
        type: ActionType.StatusAttack,
        name: '至福の呪文',
        description: '至福の陶酔状態にする',
        statusEffect: StatusEffectType.Bliss,
        statusChance: 0.75,
        weight: 15,
        messages: ['{boss}は至福の呪文を唱えた', '{player}は至福の表情を浮かべた...']
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
        messages: ['{boss}は強力な魅了術を発動した', '{player}は完全に魅了されてしまった...']
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
            '{boss}は長い尻尾で{player}を捕らえようとしてきた！'
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
            '{boss}は魔法の手を伸ばして{player}を掴もうとしてきた！'
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
            '{boss}は一瞬姿を消した...',
            '気づくと{boss}が{player}の背後にいた！'
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
            '{boss}は{player}に熱いキスをした...',
            '{player}は完全にとろけてしまった...'
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
            '{boss}は大きな舌で{player}をべろべろとなめまわした',
            '{player}の体が震えている...'
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
            '{boss}は{player}に体を密着させてきた',
            '{player}は誘惑に負けそうになっている...'
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
            '{boss}は{player}の体をリズミカルに揺さぶった',
            '{player}は快楽の波に飲み込まれていく...'
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
        messages: ['{boss}は{player}に激しく体を押し付けてきた', '{player}は息ができないほど密着されている...']
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
        messages: ['{boss}は{player}を激しく揺さぶった', '{player}の理性が揺らいでいく...']
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
        messages: ['{boss}は官能的な動きを見せつけてきた', '{player}は目が離せなくなっている...']
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
        messages: ['{boss}は{player}を激しく愛撫してきた', '{player}の感覚がとろけていく...']
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
        messages: ['{boss}は{player}に全体重をかけて圧迫してきた', '{player}は恍惚の表情を浮かべている...']
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
        messages: ['{boss}は{player}を見つめながら強力な魅了をかけた', '{player}の意思が完全に奪われていく...']
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
        messages: ['{boss}は{player}の神経を痺れさせた', '{player}の体が完全に痺れてしまった...']
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
        messages: ['{boss}は{player}に直接淫毒を注入した', '{player}の体が激しく火照っていく...']
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
        messages: ['{boss}は{player}の意識を朦朧とさせた', '{player}の意識がだんだん遠のいていく...']
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
        messages: ['{boss}は{player}の力を吸い取った', '{player}の体から力が完全に抜けていく...']
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
        messages: ['{boss}は{player}の思考を混乱させた', '{player}は何が何だかわからなくなっている...']
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
        messages: ['{boss}は{player}の魔力を封印した', '{player}の魔法が使えなくなった...']
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
        messages: ['{boss}は{player}の意識をとろけさせた', '{player}の思考が液体のようにとろけていく...']
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
        messages: ['{boss}は{player}を恍惚状態にした', '{player}はうっとりと夢見心地になっている...']
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
        messages: ['{boss}は{player}に甘い幸福感を与えた', '{player}は幸せそうな表情を浮かべている...']
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
        messages: ['{boss}は{player}に強制催眠をかけた', '{player}の意識が完全に支配された...']
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
        messages: ['{boss}は{player}の思考を洗脳した', '{player}の心が完全に支配されてしまった...']
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
            '{boss}はくちびるに強く魔力を蓄えると、{player}に熱く深いキスをした...',
            '{player}は眠りに落ちてしまい、{boss}の夢の世界にとらわれてしまった...',
            '{player}が睡眠状態になった！',
            '{player}が夢操作状態になった！'
        ]
    }
];

export const dreamDemonData: BossData = {
    id: 'dream-demon',
    name: 'DreamDemon',
    displayName: '夢の淫魔',
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
        creator: 'crazybudgie',
        characterName: '夢魔ちゃん'
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
                        '{boss}の胃壁が{player}を優しく圧迫してきた...',
                        '{player}は胃壁に包まれながら生気を吸い取られている...'
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
                        '{boss}の甘い消化液が{player}を包み込んだ...',
                        '{player}は消化液に愛撫されながら生気が溶けていく...'
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
                        '{boss}は胃の中で{player}を優しくマッサージしている...',
                        '{player}は心地よいマッサージを受けながら生気を奪われている...'
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
                        '{boss}は{player}の生気を直接ちゅーちゅーと吸い取り始めた...',
                        '{player}は生気を根こそぎ吸い取られて意識が朦朧としている...'
                    ],
                    weight: 1
                }
            ];
            
            return stomachAttacks[Math.floor(Math.random() * stomachAttacks.length)];
        }
        
        // If player is post-defeated, use special post-defeat actions
        if (player.isDefeated()) {
            const defeatStartTurn = boss.getCustomVariable<number>('defeatStartTurn', -1);
            
            // If this is the first turn player is defeated, record it
            if (defeatStartTurn === -1) {
                boss.setCustomVariable('defeatStartTurn', turn);
            }

            // Every 8 turns since defeat started, show special debuff full-course event
            const turnsSinceDefeat = turn - boss.getCustomVariable<number>('defeatStartTurn', turn);
            if (turnsSinceDefeat > 0 && turnsSinceDefeat % 8 === 0) {
                return {
                    id: 'debuff-full-course',
                    type: ActionType.PostDefeatedAttack,
                    name: '状態異常フルコース',
                    description: '体内で様々な魔法をかけまくり、全ての状態異常を付与する',
                    messages: [
                        '「へへへ〜♪ 特別なフルコースの時間ンメェ〜！」',
                        '{boss}は体内で{player}にたくさんの魔法をかけ始める！',
                        '魅了魔法！ 麻痺の粉！ 淫毒の吐息！ 脱力の呪文！ 混乱の渦！',
                        '「もっともっと〜♪」',
                        '快楽の呪い！ 淫乱の魔法！ あまあま魔法！ とろとろ魔法！ うっとり魔法！',
                        '「まだまだあるンメェ〜♪」',
                        '魅惑の術！ 至福の呪文！ 強制催眠！ 洗脳光線！',
                        '{player}は様々な魔法にかかり、もはや自分が何をされているのかもわからなくなってしまった...'
                    ],
                    onUse: (_boss, player, _turn) => {
                        // ほぼ全ての状態異常を付与
                        const statusEffects = [
                            StatusEffectType.Charm,
                            StatusEffectType.Paralysis, 
                            StatusEffectType.AphrodisiacPoison,
                            StatusEffectType.Weakness,
                            StatusEffectType.Confusion,
                            StatusEffectType.PleasureFall,
                            StatusEffectType.Lewdness,
                            StatusEffectType.Sweet,
                            StatusEffectType.Melting,
                            StatusEffectType.Euphoria,
                            StatusEffectType.Fascination,
                            StatusEffectType.Bliss,
                            StatusEffectType.Hypnosis,
                            StatusEffectType.Brainwash,
                            StatusEffectType.Infatuation,
                            StatusEffectType.Arousal,
                            StatusEffectType.Seduction
                        ];
                        
                        // ランダムに多数の状態異常を付与
                        statusEffects.forEach(effect => {
                            if (Math.random() < 0.8) { // 80%の確率で各状態異常を付与
                                player.statusEffects.addEffect(effect);
                            }
                        });
                        
                        return [];
                    },
                    weight: 1
                };
            }
            
            const postDefeatedActions = [
                {
                    id: 'dream-eternal-caress',
                    type: ActionType.PostDefeatedAttack,
                    name: '夢中での永遠の愛撫',
                    description: '夢の中で永遠に獲物を愛で続ける',
                    messages: [
                        'ずっとずっと一緒にいるンメェ〜♪',
                        '{boss}は夢の中で{player}を永遠に愛でている...',
                        '{player}は夢の中で{boss}に愛撫され続けている...',
                        '{player}の意識は{boss}の夢の中に囚われている...'
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
                        '{boss}は夢の中で{player}を甘く拘束している...',
                        '{player}は夢の拘束から逃れることができない...',
                        '{player}の心は{boss}の夢に支配されている...'
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
                        '{boss}は夢の中で{player}に至福を与えている...',
                        '{player}は夢の中で至福に包まれている...',
                        '{player}の魂は{boss}の夢に溶けている...'
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
                        '{boss}は夢の中で{player}を魅了している...',
                        '{player}は夢の中で{boss}に魅了され続けている...',
                        '{player}の心は{boss}の魅力に完全に支配されている...'
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
                        '{boss}は夢の中で{player}を甘く支配している...',
                        '{player}は夢の中で{boss}に支配されている...',
                        '{player}の意志は{boss}の夢に完全に屈服している...'
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
                        '{boss}は夢の中で{player}に激しく体を密着させた',
                        '{boss}は{player}の生気を激しくちゅーちゅーと吸い取っている...',
                        '{player}は生気が吸い取られているのを感じながら気持ちよくて抵抗できない！'
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
                        '{boss}は夢の中で魔力を込めて{player}にべろちゅーをした',
                        '{boss}は{player}の生気をべろちゅーで吸い取っている...',
                        '{player}は魔力に侵されながら生気を奪われていく...'
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
                        '{boss}は夢の中で{player}に抱き着いて激しく動いた',
                        '{boss}は密着しながら{player}の生気をちゅーちゅーと吸い取っている...',
                        '{player}は抱き着かれながら生気を奪われて快感に溺れている！'
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
                        '{boss}は夢の中で無数の触手で{player}を愛撫した',
                        '{boss}の触手は{player}の生気をじわじわと吸い取っている...',
                        '{player}は触手に愛撫されながら生気を搾り取られていく...'
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
                        '{boss}は夢の中で魔法の力で{player}を圧迫した',
                        '{boss}は魔法で{player}の生気を強制的に吸い取っている...',
                        '{player}は魔法に圧迫されながら生気を根こそぎ奪われている！'
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
                        '{boss}は夢の中で{player}を激しく揺さぶった',
                        '{boss}は揺さぶりながら{player}の生気をどんどん吸い取っている...',
                        '{player}は激しく揺さぶられながら生気を吸い取られて意識が朦朧としている...'
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
                        '{boss}は夢の中で{player}の周りで魅惑的な舞を踊った',
                        '{boss}の舞は{player}の生気を踊りながら吸い取っている...',
                        '{player}は魅惑の舞に見とれながら生気をちゅーちゅー吸われている！'
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
                        '{boss}は夢の中で{player}に直接魔力を注入した',
                        '{boss}の魔力は{player}の生気を内側から吸い取っている...',
                        '{player}は魔力に侵食されながら生気を内側から奪われていく...'
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
                        '{boss}は夢の中で{player}に甘い誘惑をささやいた',
                        '{boss}は甘い言葉で{player}の生気をそっと吸い取っている...',
                        '{player}は甘い誘惑に溺れながら生気を静かに奪われている...'
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
                        '{boss}は夢の中で{player}を完全に支配した',
                        '{boss}は支配した{player}の生気を容赦なく吸い取っている...',
                        '{player}は完全に支配されながら生気を全て奪われていく！'
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
                    '{boss}はクスクスと笑い始めた...',
                    '{player}は生気を吸い取られすぎて動けなくなってしまった...',
                    '{boss}はゆっくりと{player}に近づいてくる...',
                    '{boss}は動けなくなった{player}をゆっくりと口に含んでいく......',
                    'ごっくん......',
                    '{player}は{boss}のお腹の中に取り込まれてしまった...'
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
                            '{boss}はクスクスと笑い始めた...',
                            '{boss}はゆっくりと{player}に近づいてくる...',
                            '{boss}は{player}をゆっくりと口に含んでいく......',
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
                            '{boss}はクスクスと笑い始めた...',
                            '{boss}は{player}をゆっくりと口に含んでいく......',
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
        '{boss}は力尽きた{player}を完全に消化してしまった...',
        '{boss}はお腹をさすりながら満足げな表情を浮かべる',
        'けぷっ、おいしかったンメェ〜',
        '{player}は{boss}の一部となって永遠に夢の世界に残ることになった...'
    ];
};