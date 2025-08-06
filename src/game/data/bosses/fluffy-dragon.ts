import { BossData, ActionType, BossAction, Boss } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffectTypes';

const fluffyDragonActions: BossAction[] = [
    // 通常攻撃
    {
        id: 'gentle-fluffy-attack',
        type: ActionType.Attack,
        name: 'やさしいふわふわ攻撃',
        description: 'ふわふわの毛で優しく攻撃する',
        damageFormula: (user: Boss) => user.attackPower * 0.7,
        hitRate: 0.95,
        weight: 20,
        playerStateCondition: 'normal',
        messages: [
            'ふわふわ〜♪ やさしくしてあげるね',
            '{boss}はふわふわの毛で{player}を優しく包み込むように攻撃した'
        ]
    },
    {
        id: 'fluff-ball-puff',
        type: ActionType.Attack,
        name: '毛玉ぽふぽふ',
        description: '毛玉を飛ばしてぽふぽふと攻撃する',
        damageFormula: (user: Boss) => user.attackPower * 1.0, 
        hitRate: 0.90,
        weight: 15,
        playerStateCondition: 'normal',
        messages: [
            'ぽふぽふ〜♪ 毛玉攻撃だよ',
            '{boss}はふわふわの毛玉を{player}に向けて飛ばした！'
        ]
    },

    // 状態異常攻撃
    {
        id: 'lavender-breath',
        type: ActionType.StatusAttack,
        name: 'ラベンダーブレス',
        description: 'ラベンダーの香りがする眠りのブレスを吐く',
        damageFormula: (user: Boss) => user.attackPower * 0.5,
        hitRate: 0.95,
        statusEffect: StatusEffectType.Sleepy,
        statusChance: 0.85,
        weight: 30,
        messages: [
            'ふわ〜♪ いい香りのブレスをどうぞ',
            '{boss}はラベンダーの香りがする甘いブレスを吐いた',
            '{player}は心地よい香りに包まれている...'
        ],
        canUse: (_boss, _player, _turn) => {
            // Always available
            return true;
        },
        onUse: (_boss, player, _turn) => {
            const messages: string[] = [];
            const isExhausted = player.statusEffects.hasEffect(StatusEffectType.Exhausted);
            const isKnockedOut = player.statusEffects.hasEffect(StatusEffectType.KnockedOut);
            
            if ((isExhausted || isKnockedOut) && player.statusEffects.hasEffect(StatusEffectType.Sleepy)) {
                // 眠気状態を削除して睡眠状態を付与
                player.statusEffects.removeEffect(StatusEffectType.Sleepy);
                player.statusEffects.addEffect(StatusEffectType.Sleep, 3);
                messages.push('{player}は深い眠りに落ちてしまった...');
            }
            return messages;
        }
    },
    {
        id: 'fluffy-aura',
        type: ActionType.StatusAttack,
        name: 'ふわふわオーラ',
        description: 'ふわふわの毛から出るオーラで心地よくして抵抗力を削ぐ',
        damageFormula: (user: Boss) => user.attackPower * 0.3,
        hitRate: 0.95,
        statusEffect: StatusEffectType.Weakness,
        statusChance: 0.80,
        weight: 25,
        messages: [
            'ふわふわ〜♪ 心地よいオーラだよ',
            '{boss}のふわふわの毛から心地よいオーラが漂ってきた',
            '{player}は心地よさで力が抜けていく...'
        ]
    },

    // 拘束攻撃
    {
        id: 'fluffy-embrace',
        type: ActionType.RestraintAttack,
        name: 'ふわふわ抱擁',
        description: 'ふわふわの毛で包み込むように拘束する',
        weight: 20,
        hitRate: 0.85,
        messages: [
            'ふわふわ〜♪ ぎゅーってしてあげる',
            '{boss}はふわふわの毛で{player}を優しく包み込もうとしてきた！',
            '{player}はふわふわの毛に包まれて身動きが取れなくなった...'
        ],
        canUse: (_boss, player, _turn) => {
            // 眠気状態や睡眠状態の時により使いやすく
            const isSleepy = player.statusEffects.hasEffect(StatusEffectType.Sleepy);
            const isSleeping = player.statusEffects.hasEffect(StatusEffectType.Sleep);
            const isKnockedOut = player.statusEffects.hasEffect(StatusEffectType.KnockedOut);
            
            const baseChance = (isSleepy || isSleeping || isKnockedOut) ? 0.7 : 0.3;
            return !player.isRestrained() && !player.isEaten() && Math.random() < baseChance;
        }
    },

    // 捕食攻撃
    {
        id: 'gentle-swallow',
        type: ActionType.EatAttack,
        name: '優しい丸呑み',
        description: '暴力的でない優しい方法で丸呑みにする',
        weight: 1,
        messages: [
            'ふわふわ〜♪ お腹の中で暖かくしてあげる',
            '{boss}は{player}を優しく口に含んで...',
            'ごくん...',
            '{player}は{boss}のふわふわな胃袋に包まれた...'
        ]
    },

    // 拘束中の攻撃
    {
        id: 'fluffy-massage',
        type: ActionType.Attack,
        name: 'ふわふわマッサージ',
        description: '拘束中の相手をふわふわの毛でマッサージする',
        damageFormula: (user: Boss) => user.attackPower * 0.6,
        weight: 30,
        playerStateCondition: 'restrained',
        messages: [
            'ふわふわ〜♪ 気持ちよくしてあげる',
            '{boss}はふわふわの毛で{player}を優しくマッサージした',
            '{player}は心地よいマッサージに身を委ねている...'
        ]
    },
    {
        id: 'warm-embrace',
        type: ActionType.StatusAttack,
        name: '暖かい抱擁',
        description: '体温で包み込んで眠気を誘う',
        damageFormula: (user: Boss) => user.attackPower * 0.4,
        statusEffect: StatusEffectType.Sleepy,
        statusChance: 0.90,
        weight: 25,
        playerStateCondition: 'restrained',
        messages: [
            'ふわふわ〜♪ 暖かくて眠くなるでしょ？',
            '{boss}は{player}を暖かく包み込んだ',
            '{player}は暖かさで眠気に襲われている...'
        ]
    }
];

// 食べられ状態での攻撃（ふわふわ胃袋）
const fluffyStomachActions: BossAction[] = [
    {
        id: 'fluffy-stomach-massage',
        type: ActionType.DevourAttack,
        name: 'ふわふわ胃袋マッサージ',
        damageFormula: (user: Boss) => user.attackPower * 1.5,
        description: 'ふわふわな胃袋の毛による優しい圧迫攻撃',
        messages: [
            'ふわふわ〜♪ お腹の中でも気持ちよくしてあげる',
            '{boss}のふわふわな胃袋が{player}を優しくマッサージしている...',
            '{player}は胃袋の毛に包まれながら生気を吸い取られている...'
        ],
        weight: 1
    },
    {
        id: 'sleep-air-injection',
        type: ActionType.DevourAttack,
        name: '眠りの空気注入',
        damageFormula: (user: Boss) => user.attackPower * 1.8,
        description: '眠りを誘う特殊な空気を送り込む',
        messages: [
            'ふわふわ〜♪ もっと眠くなる空気をどうぞ',
            '{boss}は胃袋の中に眠りを誘う甘い空気を送り込んだ...',
            '{player}は甘い空気に包まれながら最大HPを奪われていく...'
        ],
        weight: 1
    },
    {
        id: 'warm-wrapping',
        type: ActionType.DevourAttack,
        name: '温かい包み込み',
        damageFormula: (user: Boss) => user.attackPower * 1.6,
        description: '体温による心地よい包み込み攻撃',
        messages: [
            'ふわふわ〜♪ ずっと暖かくしてあげる',
            '{boss}の胃袋が{player}を温かく包み込んでいる...',
            '{player}は心地よい温かさの中で力を失っていく...'
        ],
        weight: 1
    }
];

// 奥の胃袋での攻撃（敗北後）
const deepStomachActions: BossAction[] = [
    {
        id: 'slimy-dream-manipulation',
        type: ActionType.PostDefeatedAttack,
        name: '粘液による夢操作',
        description: '粘液に包まれながら丸呑みされる夢を見続ける',
        messages: [
            'ふわふわ〜♪ いい夢を見せてあげる',
            '{boss}の奥の胃袋で{player}は粘液に包まれている...',
            '{player}は丸呑みされる夢を何度も見続けている...',
            '{player}の意識は{boss}の夢の世界に囚われている...'
        ],
        statusEffect: StatusEffectType.Sleep,
        weight: 1
    },
    {
        id: 'deep-sleep-maintenance',
        type: ActionType.PostDefeatedAttack,
        name: '深い眠りの維持',
        description: '目覚めを阻止する強制睡眠',
        messages: [
            'ふわふわ〜♪ ずっと眠っていてね',
            '{boss}は{player}を深い眠りに閉じ込めている...',
            '{player}は目覚めることができない...',
            '{player}の魂は{boss}の中で永遠に眠り続ける...'
        ],
        statusEffect: StatusEffectType.Hypnosis,
        weight: 1
    },
    {
        id: 'slimy-caress',
        type: ActionType.PostDefeatedAttack,
        name: '胃液愛撫',
        description: 'ねっとりした粘液による包み込み',
        messages: [
            'ふわふわ〜♪ ねっとり包んであげる',
            '{boss}の粘液が{player}をねっとりと包み込んでいる...',
            '{player}は粘液に愛撫されながら意識を失っていく...',
            '{player}の心は{boss}の胃袋に完全に支配されている...'
        ],
        statusEffect: StatusEffectType.Melting,
        weight: 1
    },
    {
        id: 'eternal-peace',
        type: ActionType.PostDefeatedAttack,
        name: '永遠の安らぎ',
        description: '完全な支配状態での至福演出',
        messages: [
            'ふわふわ〜♪ もう何も心配いらないよ',
            '{boss}は{player}を永遠の安らぎで包んでいる...',
            '{player}は完全に安らかな表情を浮かべている...',
            '{player}は{boss}の一部として永遠に過ごすことになった...'
        ],
        statusEffect: StatusEffectType.Bliss,
        weight: 1
    }
];

export const fluffyDragonData: BossData = {
    id: 'fluffy-dragon',
    name: 'FluffyDragon',
    displayName: 'ふわふわドラゴン',
    description: '寒冷地に住む真っ白でふわふわな毛に覆われたドラゴン',
    questNote: `寒冷地の奥地で、旅人たちが突然姿を消す事件が続発している。生存者の証言によると、白くてふわふわな毛に覆われた巨大なドラゴンが現れ、甘いラベンダーの香りと共に人々を眠らせて連れ去っているという。このふわふわドラゴンを討伐し、行方不明者たちを救出せよ。`,
    maxHp: 600,
    attackPower: 14,
    actions: fluffyDragonActions,
    icon: '🛏️',
    explorerLevelRequired: 7,
    battleStartMessages: [
        {
            speaker: 'player',
            style: 'default',
            text: 'あなたは寒冷地でふわふわな毛に覆われた白いドラゴンと遭遇した。'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: 'ふわぁ...また新しいお客さまが来たの？'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: 'ふわふわドラゴンは暖かそうな白い毛玉のような体で、甘いラベンダーの香りを漂わせている...'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: 'とっても疲れてるみたいね...私のふわふわお腹でゆっくり休んでいきなさい'
        }
    ],
    victoryMessages: [
        {
            speaker: 'boss',
            style: 'talk',
            text: 'ふわぁ...こんなに強い人がいるなんて...'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: 'でも、とっても立派に戦ったのね...お疲れさま'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: 'ふわふわドラゴンは優しく微笑むと、ふわふわと浮かび上がって雲のように空へと消えていった...'
        }
    ],
    victoryTrophy: {
        name: 'ふわふわの毛玉',
        description: 'ふわふわドラゴンの暖かく柔らかい体毛で作られた毛玉。触れるだけで心が安らぐ不思議な力を持っている。'
    },
    defeatTrophy: {
        name: '眠りの香り',
        description: 'ふわふわドラゴンの眠りのブレスから抽出したラベンダーの香りがする魔法のエッセンス。深い眠りを誘う力を秘めている。'
    },
    personality: [
        'ふわふわ〜♪ 一緒に眠りましょう',
        'とても心地よいでしょう？',
        'そのまま眠ってしまいなさい...',
        'ふわふわのお腹で暖かくしてあげる',
        'もう何も心配いらないよ',
        '永遠に一緒にいましょうね'
    ],
    aiStrategy: (boss, player, turn) => {
        // Fluffy Dragon AI Strategy - 段階的な眠り誘発戦略
        
        // 敗北後の奥の胃袋攻撃
        if (player.isDefeated()) {
            const defeatStartTurn = boss.getCustomVariable<number>('defeatStartTurn', -1);
            
            // If this is the first turn player is defeated, record it
            if (defeatStartTurn === -1) {
                boss.setCustomVariable('defeatStartTurn', turn);
            }

            // Every 8 turns since defeat started, show special fluffy massage event
            const turnsSinceDefeat = turn - boss.getCustomVariable<number>('defeatStartTurn', turn);
            if (turnsSinceDefeat > 0 && turnsSinceDefeat % 8 === 0) {
                return {
                    id: 'premium-fluffy-massage',
                    type: ActionType.PostDefeatedAttack,
                    name: '極上ふわふわマッサージ',
                    description: '体内の極上ふわふわでプレイヤーをマッサージする',
                    messages: [
                        '「ふわふわ〜♪ 特別なマッサージの時間ですよ」',
                        '{boss}の体内で最高級のふわふわが{player}を包み始める！',
                        '普通のふわふわとは比べ物にならない極上の毛が{player}を愛撫する...',
                        '「ふわふわ〜♪ これが私の特別なふわふわマッサージです」',
                        '雲よりも柔らかく、綿よりも優しいふわふわが{player}の全身を包み込む！',
                        '「どうですか？ とっても気持ちいいでしょう？」',
                        '{player}は極上のふわふわに完全に支配され、睡眠と脱力の状態に陥ってしまった！',
                        '全身の力が抜けて、{player}は深い眠りに落ちていく...'
                    ],
                    onUse: (_boss, player, _turn) => {
                        // ふわふわマッサージによる効果を付与
                        player.statusEffects.addEffect(StatusEffectType.Sleep);
                        player.statusEffects.addEffect(StatusEffectType.Weakness);
                        player.statusEffects.addEffect(StatusEffectType.Sleepy);
                        player.statusEffects.addEffect(StatusEffectType.Bliss);
                        
                        return [];
                    },
                    weight: 1
                };
            }
            
            return deepStomachActions[Math.floor(Math.random() * deepStomachActions.length)];
        }
        
        // 食べられ状態でのふわふわ胃袋攻撃
        if (player.isEaten()) {
            return fluffyStomachActions[Math.floor(Math.random() * fluffyStomachActions.length)];
        }
        
        // 再起不能状態（最大HP=0）の時の特殊とどめ攻撃
        if (player.maxHp <= 0) {
            return {
                id: 'deep-stomach-transfer',
                type: ActionType.EatAttack,
                name: '奥の胃袋への移送',
                description: 'ふわふわ胃袋から本物の胃袋へ移動させる',
                messages: [
                    'ふわふわ〜♪ より奥で休んでもらいましょう',
                    '{player}は完全に眠りに落ち、{boss}のより奥の胃袋に送られていく...',
                    'そこはねっとりした粘液に満ちた本物の胃袋だった...',
                    '{boss}が起きている限り、{player}は目覚めることができない...'
                ],
                weight: 1
            };
        }
        
        // 戦略的行動判定
        if (player.isKnockedOut()) {
            if (player.isRestrained()) {
                // 拘束+行動不能: 80%で捕食
                if (Math.random() < 0.8) {
                    return fluffyDragonActions.find(action => action.type === ActionType.EatAttack) || fluffyDragonActions[0];
                }
            } else {
                // 行動不能時: 60%で拘束、25%で直接捕食
                const random = Math.random();
                if (random < 0.6) {
                    return fluffyDragonActions.find(action => action.type === ActionType.RestraintAttack) || fluffyDragonActions[0];
                } else if (random < 0.85) {
                    return fluffyDragonActions.find(action => action.type === ActionType.EatAttack) || fluffyDragonActions[0];
                }
            }
        }
        
        // 拘束中は拘束専用攻撃
        if (player.isRestrained()) {
            const restraintAttacks = fluffyDragonActions.filter(action => 
                action.playerStateCondition === 'restrained'
            );
            if (restraintAttacks.length > 0 && Math.random() < 0.85) {
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
        
        // 眠気状態付与を最優先
        const hasSleepy = player.statusEffects.hasEffect(StatusEffectType.Sleepy);
        const isSleeping = player.statusEffects.hasEffect(StatusEffectType.Sleep);
        
        if (!hasSleepy && !isSleeping && Math.random() < 0.7) {
            const lavenderBreath = fluffyDragonActions.find(action => action.id === 'lavender-breath');
            if (lavenderBreath) {
                return lavenderBreath;
            }
        }
        
        // 眠気状態の敵への拘束攻撃
        if ((hasSleepy || isSleeping) && !player.isRestrained() && !player.isEaten()) {
            const restraintAction = fluffyDragonActions.find(action => action.type === ActionType.RestraintAttack);
            if (restraintAction && Math.random() < 0.6) {
                return restraintAction;
            }
        }
        
        // 通常時の重み付き選択
        const availableActions = fluffyDragonActions.filter(action => {
            if (action.playerStateCondition === 'restrained') return false;
            if (action.type === ActionType.EatAttack) return false;
            
            if (action.canUse) {
                return action.canUse(boss, player, turn);
            }
            return true;
        });
        
        const totalWeight = availableActions.reduce((sum, action) => sum + action.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const action of availableActions) {
            random -= action.weight;
            if (random <= 0) {
                return action;
            }
        }
        
        return availableActions[0] || fluffyDragonActions[0];
    },
    
    // カスタムフィニッシュムーブ
    finishingMove: function() {
        return [
            '{boss}は力尽きた{player}を奥の胃袋で完全に消化してしまった...',
            '{boss}はお腹をさすりながら満足げな表情を浮かべる',
            'ふわふわ〜♪ とても美味しかったです',
            '{player}は{boss}の一部となって永遠にふわふわの夢の中で過ごすことになった...'
        ];
    },
    
    // 状況別台詞
    getDialogue: function(situation: 'battle-start' | 'player-restrained' | 'player-eaten' | 'player-escapes' | 'low-hp' | 'victory') {
        const dialogues: Record<string, string[]> = {
            'battle-start': [
                'ふわふわ〜♪ ようこそ寒冷地へ',
                'とても疲れているように見えますね',
                '一緒に眠って休みませんか？',
                'ラベンダーの香りでリラックスしましょう'
            ],
            'player-restrained': [
                'ふわふわ〜♪ 気持ちいいでしょう？',
                'そのままふわふわに包まれていてね',
                'もう何も心配いりませんよ',
                '温かくて眠くなってきますね',
                'ずっとこうしていましょう'
            ],
            'player-eaten': [
                'ふわふわ〜♪ お腹の中は暖かいでしょう？',
                'ゆっくり休んでいてくださいね',
                'もう寒くありませんよ',
                'このまま永遠に一緒にいましょう',
                'ふわふわの夢を見させてあげます'
            ],
            'player-escapes': [
                'あら...まだ眠くないのですか？',
                'でももうすぐ眠くなりますよ',
                '逃げても寒いだけですよ',
                'ふわふわのところに戻っておいで'
            ],
            'low-hp': [
                'ふわふわ〜♪ まだまだ元気です',
                'もっとふわふわにしてあげますね',
                '一緒に眠りの世界へ行きましょう',
                'ラベンダーの香りはまだまだありますよ'
            ],
            'victory': [
                'ふわふわ〜♪ いい夢を見てくださいね',
                '永遠に暖かくしてあげます',
                'とても美味しかったです',
                'ずっと一緒にいましょうね'
            ]
        };
        
        const options = dialogues[situation] || dialogues['battle-start'];
        return options[Math.floor(Math.random() * options.length)];
    }
};