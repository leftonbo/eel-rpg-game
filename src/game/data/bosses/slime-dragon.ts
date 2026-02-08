import { BossData, ActionType, BossAction, Boss } from '../../entities/Boss';
import { Player } from '../../entities/Player';
import { StatusEffectType } from '../../systems/StatusEffectTypes';

// ========================================
// 通常状態のアクション
// ========================================

const slimeDragonActions: BossAction[] = [
    // 通常攻撃
    {
        id: 'slime-shot',
        type: ActionType.StatusAttack,
        name: 'スライムショット',
        description: 'スライムの塊を飛ばして粘液まみれにする',
        damageFormula: (user: Boss) => user.attackPower * 0.8,
        hitRate: 0.95,
        statusEffect: StatusEffectType.SlimeCoated,
        statusChance: 0.85,
        weight: 30,
        playerStateCondition: 'normal',
        messages: [
            '{boss}がスライムの塊を{player}に向けて飛ばした！'
        ]
    },
    {
        id: 'slime-sweep',
        type: ActionType.Attack,
        name: 'スライムスイープ',
        description: 'スライムの身体で薙ぎ払う',
        damageFormula: (user: Boss) => user.attackPower * 1.0,
        hitRate: 0.90,
        weight: 25,
        playerStateCondition: 'normal',
        messages: [
            '{boss}が半透明の巨体を振るった！'
        ]
    },
    {
        id: 'slime-coating',
        type: ActionType.StatusAttack,
        name: 'スライムコーティング',
        description: '全身をスライムでコーティングして動きにくくする',
        damageFormula: (user: Boss) => user.attackPower * 0.5,
        hitRate: 0.95,
        statusEffect: StatusEffectType.SlimeCoated,
        statusChance: 0.90,
        weight: 20,
        playerStateCondition: 'normal',
        messages: [
            '{boss}がぬるりと{player}に近づいて全身を包み込もうとした！'
        ]
    },
    {
        id: 'playful-tackle',
        type: ActionType.Attack,
        name: 'じゃれつき',
        description: '遊ぶように体当たりしてくる',
        damageFormula: (user: Boss) => user.attackPower * 0.7,
        hitRate: 0.95,
        weight: 20,
        playerStateCondition: 'normal',
        messages: [
            '{boss}が嬉しそうにぷるぷる震えながら突進してきた！'
        ]
    },

    // 拘束攻撃
    {
        id: 'slime-envelop',
        type: ActionType.RestraintAttack,
        name: 'スライムのしかかり',
        description: '身体全体でのしかかって取り込む',
        weight: 15,
        hitRate: 0.85,
        playerStateCondition: 'normal',
        messages: [
            '{boss}が巨大な身体を{player}の上にのしかけてきた！',
            'ぬるるるっ…{player}は{boss}のスライムの柔らかい身体に取り込まれていく…'
        ],
        canUse: (_boss: Boss, player: Player, _turn: number) => {
            return !player.isRestrained() && !player.isEaten();
        }
    },

    // 拘束中の攻撃
    {
        id: 'slime-squeeze',
        type: ActionType.Attack,
        name: 'やさしい締めつけ',
        description: 'スライムの身体でじわじわと締めつける',
        damageFormula: (user: Boss) => user.attackPower * 1.2,
        hitRate: 0.95,
        weight: 40,
        playerStateCondition: 'restrained',
        messages: [
            '{boss}のスライムの身体が{player}をじわじわと締めつける…'
        ]
    },
    {
        id: 'slime-absorb-restrained',
        type: ActionType.StatusAttack,
        name: 'スライム浸透',
        description: '拘束中にスライムが身体に浸透して動きを鈍くする',
        damageFormula: (user: Boss) => user.attackPower * 0.8,
        hitRate: 0.95,
        statusEffect: StatusEffectType.Slow,
        statusChance: 0.80,
        weight: 30,
        playerStateCondition: 'restrained',
        messages: [
            '{boss}のスライムが{player}の身体にじわじわと浸透していく…'
        ]
    }
];

// ========================================
// 食べられ状態でのアクション（やさしい体内描写）
// ========================================

const slimeStomachActions: BossAction[] = [
    {
        id: 'gentle-digest',
        type: ActionType.DevourAttack,
        name: 'やさしい吸収',
        description: 'ゆっくりと吸収しつつ優しく揉みほぐす',
        damageFormula: (user: Boss) => user.attackPower * 1.5,
        messages: [
            '{boss}のスライムの身体がゆっくりと{player}を吸収しつつ、優しく揉みほぐす…',
            '{player}は温かいスライムに包まれながら力を吸い取られていく…'
        ],
        weight: 35
    },
    {
        id: 'slime-massage',
        type: ActionType.DevourAttack,
        name: 'スライムマッサージ',
        description: '体内でスライムが優しくマッサージする',
        damageFormula: (user: Boss) => user.attackPower * 1.2,
        messages: [
            '{boss}の体内でスライムが{player}の身体を優しくマッサージしている…',
            'ぷにぷにとしたスライムの感触が{player}の意識を薄れさせていく…'
        ],
        weight: 30
    },
    {
        id: 'slime-lullaby',
        type: ActionType.DevourAttack,
        name: 'スライムの子守唄',
        description: '体内の振動で眠気を誘う',
        damageFormula: (user: Boss) => user.attackPower * 0.8,
        statusEffect: StatusEffectType.Sleepy,
        statusChance: 0.80,
        messages: [
            '{boss}の身体がゆっくりと振動し始めた…',
            'ぷるぷるぷる…心地よいスライムの振動が{player}の眠気を誘う…',
            '{player}はスライムの揺れに包まれてうとうとしてきた…'
        ],
        weight: 20
    }
];

// ========================================
// 敗北後のアクション（卵内ループ）
// ========================================

const slimeEggActions: BossAction[] = [
    {
        id: 'egg-rock',
        type: ActionType.PostDefeatedAttack,
        name: 'ゆりかごの揺れ',
        description: 'スライムの卵に包んだまま優しく揺らす',
        messages: [
            '{boss}は{player}を包んだスライムの卵を優しく揺らしている…',
            'ゆらゆらと揺れるスライムの卵の中で、{player}は温かさに包まれている…',
            '{player}はスライムの揺りかごの中でまどろんでいる…'
        ],
        weight: 35
    },
    {
        id: 'egg-massage',
        type: ActionType.PostDefeatedAttack,
        name: '卵越しマッサージ',
        description: 'スライムの卵を通して優しく揉みほぐす',
        messages: [
            '{boss}はスライムの卵の外側から{player}を優しく揉みほぐしている…',
            'ぷにぷに…スライムの卵を通して伝わる温かなマッサージ…',
            '{player}はスライムに揉みほぐされ、完全に力が抜けている…'
        ],
        weight: 35
    },
    {
        id: 'egg-warmth',
        type: ActionType.PostDefeatedAttack,
        name: 'スライムの温もり',
        description: 'スライムの卵内を温かく包む',
        messages: [
            '{boss}はスライムの卵に体温を送り込んでいる…',
            'スライムの卵がぽかぽかと温かくなり、{player}を心地よく包んでいる…',
            '{player}はスライムの温もりの中で穏やかに眠り続けている…'
        ],
        weight: 30
    }
];

// ========================================
// カスタムとどめ（スライムの卵封印）
// ========================================

const slimeEggSealAction: BossAction = {
    id: 'slime-egg-seal',
    type: ActionType.FinishingMove,
    name: 'スライムの卵封印',
    description: '力尽きたプレイヤーをスライムの卵に包み込む',
    messages: [
        '{player}が力尽きたのを感じ取った{boss}は、心配そうにぷるぷると震えた…',
        '{boss}は{player}を癒そうと、さらに柔らかいスライムで包み始めた…',
        'スライムが{player}の全身を卵のように覆っていく…',
        '{player}はスライムの卵に完全に包み込まれてしまった…',
        '{boss}は大切そうにスライムの卵をお腹に抱え込んだ…'
    ],
    weight: 1,
    onUse: (_boss: Boss, player: Player) => {
        player.statusEffects.removeEffect(StatusEffectType.Doomed);
        player.statusEffects.addEffect(StatusEffectType.Dead);
        player.statusEffects.addEffect(StatusEffectType.SlimeEgg, -1);
        return [];
    }
};

// ========================================
// 8ターン毎の特殊敗北後イベント
// ========================================

const specialEggCareAction: BossAction = {
    id: 'egg-special-care',
    type: ActionType.PostDefeatedAttack,
    name: '特別なお世話',
    description: 'スライムの卵の中のプレイヤーに特別なお世話をする',
    messages: [
        '{boss}は{player}が入ったスライムの卵を自分の体内に取り込んだ！',
        'スライムの卵ごと{boss}の体内に沈んでいく{player}…',
        '{boss}の体内でスライムの卵が温かく脈動し、{player}を優しく揉みほぐす…',
        'ぷるぷるぷる…{player}は二重のスライムに包まれて深い眠りに落ちていく…',
        '{boss}は満足そうにぷるぷると震えている…'
    ],
    weight: 1,
    onUse: (_boss: Boss, player: Player) => {
        player.statusEffects.addEffect(StatusEffectType.Sleepy);
        player.statusEffects.addEffect(StatusEffectType.Weakness);
        return [];
    }
};

// ========================================
// ボスデータ定義
// ========================================

export const slimeDragonData: BossData = {
    id: 'slime-dragon',
    name: 'SlimeDragon',
    displayName: 'スライムドラゴン',
    icon: '💧',
    description: '湖に現れた巨大なスライムのドラゴン。好奇心旺盛で一緒に遊びたいだけだが…',
    appearanceNote: '半透明の青緑色のスライムで構成された巨大なドラゴン。体内が透けて見え、液状の身体がゆらゆらと揺れている。',
    questNote: '湖に探索に出た冒険者たちがスライムまみれになって帰ってくるという報告が相次いでいる。どうやら湖に巨大なスライム状の生物が出現しているらしい。原因を調査し、対処してほしい。',
    maxHp: 550,
    attackPower: 14,
    actions: slimeDragonActions,
    suppressAutoFinishingMove: true,
    explorerLevelRequired: 2,

    victoryTrophy: {
        name: 'スライムドラゴンの結晶核',
        description: 'スライムドラゴンの体内で生成された透明な結晶。光を受けると虹色に輝く不思議な宝石。'
    },
    defeatTrophy: {
        name: 'スライムドラゴンの体内粘液',
        description: 'スライムドラゴンの体内で浸された特殊な粘液。驚くほど温かく、癒しの力が宿っている。'
    },

    personality: [
        'ぷるるる…',
        'きゅるるる♪',
        '…ぷにぷに',
        'ぷるんっ♪',
        'きゅうー…',
        'ぬるるる…♪'
    ],

    customVariables: {
        postDefeatedTurn: 0,
        coatingUsed: false
    },

    battleStartMessages: [
        {
            speaker: 'player',
            style: 'default',
            text: '湖のほとりに巨大な影が揺れている…'
        },
        {
            speaker: 'system',
            style: 'default',
            text: '半透明の身体がゆらゆらと輝きながら、こちらに興味を示している。'
        },
        {
            speaker: 'system',
            style: 'default',
            text: 'スライムドラゴンが嬉しそうにこちらに近づいてきた！'
        }
    ],

    victoryMessages: [
        {
            speaker: 'system',
            style: 'default',
            text: 'スライムドラゴンはしゅんとした様子で身体を小さくした…'
        },
        {
            speaker: 'system',
            style: 'default',
            text: 'どうやら迷惑をかけていたことに気づいたようだ。'
        },
        {
            speaker: 'system',
            style: 'default',
            text: 'スライムドラゴンは申し訳なさそうにぷるぷると震えている…もう迷惑はかけないと伝えているようだ。'
        }
    ],

    // ========================================
    // AI戦略
    // ========================================
    aiStrategy: (boss: Boss, player: Player, turn: number): BossAction => {

        // ------ 敗北後：卵内ループ ------
        if (player.isDefeated()) {
            let postDefeatedTurn = boss.getCustomVariable<number>('postDefeatedTurn') ?? 0;
            postDefeatedTurn += 1;
            boss.setCustomVariable('postDefeatedTurn', postDefeatedTurn);

            // 8ターン毎に特別なお世話イベント
            if (postDefeatedTurn % 8 === 0) {
                return specialEggCareAction;
            }

            // 通常の卵内アクションをランダム選択
            const totalWeight = slimeEggActions.reduce((sum, a) => sum + a.weight, 0);
            let rand = Math.random() * totalWeight;
            for (const action of slimeEggActions) {
                rand -= action.weight;
                if (rand <= 0) return action;
            }
            return slimeEggActions[0];
        }

        // ------ 食べられ状態 ------
        if (player.isEaten()) {
            // Doomed状態ならカスタムとどめ
            if (player.isDoomed()) {
                return slimeEggSealAction;
            }

            // 体内アクションをランダム選択
            const totalWeight = slimeStomachActions.reduce((sum, a) => sum + a.weight, 0);
            let rand = Math.random() * totalWeight;
            for (const action of slimeStomachActions) {
                rand -= action.weight;
                if (rand <= 0) return action;
            }
            return slimeStomachActions[0];
        }

        // ------ KO状態 ------
        if (player.isKnockedOut()) {
            if (player.isRestrained()) {
                // 拘束+KO → 90%で丸呑み（疲れを癒そうとして取り込む）
                if (Math.random() < 0.9) {
                    return {
                        id: 'gentle-engulf',
                        type: ActionType.EatAttack,
                        name: 'やさしい取り込み',
                        description: '疲れた相手を癒そうとスライムの中に取り込む',
                        messages: [
                            '{boss}は{player}が疲れているのを見て心配そうにぷるぷると震えた…',
                            '{boss}はゆっくりと柔らかい体内に{player}を取り込んでいく…',
                            'ぬるるるっ…{player}は{boss}の温かいスライムの体内に包まれた…'
                        ],
                        weight: 1
                    };
                }
            } else {
                // 未拘束+KO → 65%拘束、25%丸呑み、10%様子見
                const rand = Math.random();
                if (rand < 0.65) {
                    const restraintAction = slimeDragonActions.find(a => a.type === ActionType.RestraintAttack);
                    if (restraintAction) return restraintAction;
                } else if (rand < 0.90) {
                    return {
                        id: 'gentle-engulf',
                        type: ActionType.EatAttack,
                        name: 'やさしい取り込み',
                        description: '疲れた相手を癒そうとスライムの中に取り込む',
                        messages: [
                            '{boss}は{player}が疲れているのを見て心配そうにぷるぷると震えた…',
                            '{boss}はゆっくりと柔らかい体内に{player}を取り込んでいく…',
                            'ぬるるるっ…{player}は{boss}の温かいスライムの体内に包まれた…'
                        ],
                        weight: 1
                    };
                }
                // 10%: 様子見（通常攻撃にフォールスルー）
            }
        }

        // ------ 拘束中 ------
        if (player.isRestrained()) {
            const restrainedActions = slimeDragonActions.filter(
                a => a.playerStateCondition === 'restrained'
            );
            if (restrainedActions.length > 0 && Math.random() < 0.85) {
                const totalWeight = restrainedActions.reduce((sum, a) => sum + a.weight, 0);
                let rand = Math.random() * totalWeight;
                for (const action of restrainedActions) {
                    rand -= action.weight;
                    if (rand <= 0) return action;
                }
                return restrainedActions[0];
            }
        }

        // ------ 通常状態の戦略 ------

        // SlimeCoated未付与 & ターン3以上 → 50%でコーティング
        const hasSlimeCoated = player.statusEffects.hasEffect(StatusEffectType.SlimeCoated);
        if (!hasSlimeCoated && turn >= 3 && Math.random() < 0.50) {
            const coatingAction = slimeDragonActions.find(a => a.id === 'slime-coating');
            if (coatingAction) return coatingAction;
        }

        // Slimed未付与 → 40%でスライムショット
        const hasSlimed = player.statusEffects.hasEffect(StatusEffectType.Slimed);
        if (!hasSlimed && !hasSlimeCoated && Math.random() < 0.40) {
            const slimeShot = slimeDragonActions.find(a => a.id === 'slime-shot');
            if (slimeShot) return slimeShot;
        }

        // 状態異常付与済みで拘束チャンスを狙う
        if ((hasSlimed || hasSlimeCoated) && !player.isRestrained() && Math.random() < 0.40) {
            const restraintAction = slimeDragonActions.find(a => a.type === ActionType.RestraintAttack);
            if (restraintAction) return restraintAction;
        }

        // 重み付きランダム選択（通常アクション）
        const availableActions = slimeDragonActions.filter(a => {
            if (a.playerStateCondition === 'restrained') return false;
            if (a.type === ActionType.RestraintAttack) return false;
            if (a.type === ActionType.EatAttack) return false;
            if (a.canUse) return a.canUse(boss, player, turn);
            return true;
        });

        const totalWeight = availableActions.reduce((sum, a) => sum + a.weight, 0);
        let rand = Math.random() * totalWeight;
        for (const action of availableActions) {
            rand -= action.weight;
            if (rand <= 0) return action;
        }

        return availableActions[0] || slimeDragonActions[0];
    },

    getDialogue: function(situation: 'battle-start' | 'player-restrained' | 'player-eaten' | 'player-escapes' | 'low-hp' | 'victory') {
        const dialogues: Record<string, string[]> = {
            'battle-start': [
                'ぷるるる♪',
                'きゅるるる！',
                'ぬるんっ♪'
            ],
            'player-restrained': [
                'ぷるぷる…♪',
                'きゅるるる…',
                'ぬるぬる…♪',
                'ぷにゅ〜♪'
            ],
            'player-eaten': [
                'ぷるぷるぷる…♪',
                'きゅるるるる…♪',
                'ぬるるる…ぷにぷに…♪',
                'きゅう…♪'
            ],
            'player-escapes': [
                'きゅー…？',
                'ぷるっ…！？',
                'きゅるる…'
            ],
            'low-hp': [
                'きゅうぅ…',
                'ぷるるる…',
                'ぬるっ…'
            ],
            'victory': [
                'ぷるるるる…♪',
                'きゅるるるるる…♪',
                'ぬるるるるる…♪'
            ]
        };

        const options = dialogues[situation] || dialogues['battle-start'];
        return options[Math.floor(Math.random() * options.length)];
    }
};
