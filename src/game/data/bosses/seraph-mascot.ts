import { BossData, ActionType, BossAction, Boss } from '../../entities/Boss';
import { Player } from '../../entities/Player';
import { StatusEffectType } from '../../systems/StatusEffectTypes';

// 段階1: 接触フェーズ（善意の接触、偶発的ダメージ）
const seraphMascotContactActions: BossAction[] = [
    {
        id: 'gentle-pat',
        type: ActionType.Attack,
        name: 'やさしいなでなで',
        description: '巨大な手でやさしく撫でようとする',
        messages: [
            '「だいじょうぶだよ〜♪」',
            '{boss}は{player}を優しく撫でようとする！',
            'しかし、あまりにも大きすぎて...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.6,
        hitRate: 0.95,
        weight: 30,
        playerStateCondition: 'normal'
    },
    {
        id: 'blessing-light',
        type: ActionType.StatusAttack,
        name: '祝福の光',
        description: '神聖な光で対象を祝福する',
        messages: [
            '「みんなで幸せになろうね〜♪」',
            '{boss}は{player}に神聖な光を浴びせる！',
            '{player}が祝福の光に包まれた！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.4,
        statusEffect: StatusEffectType.Blessed,
        statusChance: 0.80,
        weight: 25,
        playerStateCondition: 'normal'
    },
    {
        id: 'overwhelming-presence',
        type: ActionType.StatusAttack,
        name: '圧倒的存在感',
        description: '巨大すぎる存在感で相手を圧倒する',
        messages: [
            '「あれ？怖がらないで〜」',
            '{boss}の巨大な存在感が{player}を圧倒する！',
            '{player}は巨大さに圧倒されてしまった！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 0.3,
        statusEffect: StatusEffectType.Overwhelmed,
        statusChance: 0.70,
        weight: 20,
        playerStateCondition: 'normal'
    },
    {
        id: 'halo-crash',
        type: ActionType.Attack,
        name: '天使のわっか落下',
        description: '頭の上の輪っかが落ちそうになる',
        messages: [
            '「あっ、わっかが〜！」',
            '{boss}の頭上の輪っかが{player}の方へ落ちてくる！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.1,
        hitRate: 0.85,
        weight: 15,
        playerStateCondition: 'normal'
    },
    {
        id: 'wing-embrace',
        type: ActionType.RestraintAttack,
        name: '翼の抱擁',
        description: '大きな翼で優しく抱きしめる',
        messages: [
            '「抱っこしてあげる〜♪」',
            '{boss}は大きな翼で{player}を包み込む！'
        ],
        weight: 25,
        canUse: (_boss, player, _turn) => {
            return !player.isRestrained() && !player.isEaten() && Math.random() < 0.35;
        }
    }
];

// 段階2: 救済フェーズ（拘束中の「お世話」）
const seraphMascotCareActions: BossAction[] = [
    {
        id: 'salvation-lick',
        type: ActionType.StatusAttack,
        name: '救済の舌なめ',
        description: '不幸を取り除くため長い舌で舐め回す',
        messages: [
            '「不幸を取ってあげるね〜♪」',
            '{boss}は長い舌で{player}を丁寧に舐め回す！',
            '{player}は救済の粘液でベトベトになる...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.3,
        statusEffect: StatusEffectType.HolySlimed,
        statusChance: 0.80,
        weight: 35,
        playerStateCondition: 'restrained'
    },
    {
        id: 'salvation-preparation',
        type: ActionType.StatusAttack,
        name: '救済の準備',
        description: '本格的な救済のため特別な状態にする',
        messages: [
            '「体に染み付く救済をしてあげるよ〜♪」',
            '{boss}は小さな{player}の体を口にくわえ、激しい神聖の力を注ぎ込む！',
            '{player}は{boss}の救済の力に圧倒される！'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.0,
        statusEffect: StatusEffectType.SalvationState,
        statusChance: 0.90,
        weight: 30,
        playerStateCondition: 'restrained',
        canUse: (boss: Boss, player: Player, turn: number): boolean => {
            // 救済状態でない場合のみ使用可能
            const isInSalvation = player.statusEffects.hasEffect(StatusEffectType.SalvationState);
            const lastUsed = boss.getCustomVariable<number>('salvationAbilityLastUsed', -1);
            // 20ターン経過後に使用可能
            return !isInSalvation && (lastUsed === -1 || turn - lastUsed >= 20);
        },
        onPreUse: (_action: BossAction, boss: Boss, _player: Player, turn: number) => {
            // クールダウン記録
            boss.setCustomVariable('salvationAbilityLastUsed', turn);
            // スキル内容の変更はしない
            return null;
        }
    },
    {
        id: 'protective-squeeze',
        type: ActionType.Attack,
        name: '保護的な抱きしめ',
        description: '守ろうとして強く抱きしめる',
        messages: [
            '「守ってあげる〜♪」',
            '{boss}は{player}を強く抱きしめる！',
            'しかし力が強すぎて...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.6,
        weight: 25,
        playerStateCondition: 'restrained'
    }
];

// 段階3: 保護フェーズ（体内での「完全な保護」）
const seraphMascotProtectionActions: BossAction[] = [
    {
        id: 'stomach-sanctuary',
        type: ActionType.DevourAttack,
        name: '胃袋の聖域',
        description: '体内の聖域で完全に保護する',
        messages: [
            '「ここなら絶対安全だよ〜♪」',
            '{boss}の体内で{player}が聖なる光に包まれる！',
            '{player}の生命力が聖域で吸収されていく...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.3,
        weight: 30,
        playerStateCondition: 'eaten'
    },
    {
        id: 'divine-digestion',
        type: ActionType.DevourAttack,
        name: '神聖なる消化',
        description: '神聖な力で対象を浄化する',
        messages: [
            '「不純なものを取り除いてあげるね〜♪」',
            '{boss}の体内で神聖な力が{player}を浄化する！',
            '{player}の生命力が聖なる力で削られていく...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.5,
        weight: 25,
        playerStateCondition: 'eaten'
    },
    {
        id: 'blessing-absorption',
        type: ActionType.DevourAttack,
        name: '祝福の吸収',
        description: '祝福と共に生命力を吸収する',
        messages: [
            '「たくさん祝福してあげるね〜♪」',
            '{boss}は{player}を祝福しながら生命力を吸収する！',
            '{player}は至福の中で力を奪われていく...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.0,
        statusEffect: StatusEffectType.Blessed,
        statusChance: 0.60,
        weight: 20,
        playerStateCondition: 'eaten'
    },
    {
        id: 'salvation-cycle',
        type: ActionType.DevourAttack,
        name: '救済のサイクル',
        description: '永続的な救済サイクルを開始する',
        messages: [
            '「ずっと救済してあげるからね〜♪」',
            '{boss}は{player}を永続的な救済サイクルに組み込む！',
            '{player}は救済の輪の中で循環し続ける...'
        ],
        damageFormula: (user: Boss) => user.attackPower * 1.0,
        statusEffect: StatusEffectType.SalvationState,
        statusChance: 0.70,
        weight: 15,
        playerStateCondition: 'eaten',
        canUse: (boss: Boss, _player: Player, turn: number): boolean => {
            // クールダウンチェック（20ターン）
            const lastUsed = boss.getCustomVariable<number>('salvationAbilityLastUsed', -1);
            return lastUsed === -1 || turn - lastUsed >= 20;
        },
        onPreUse: (_action: BossAction, boss: Boss, _player: Player, turn: number) => {
            // クールダウン記録
            boss.setCustomVariable('salvationAbilityLastUsed', turn);
            // スキル内容の変更はしない
            return null;
        }
    }
];

// 段階4: 敗北後のとどめ行動（永続救済への移行）
const seraphMascotFinishingMove: BossAction = {
    id: 'finish-to-eternal-care',
    type: ActionType.FinishingMove,
    name: '永遠の加護',
    description: '体内で力尽きた対象を永遠にお世話する',
    weight: 100,
    playerStateCondition: 'defeated',
    messages: [
        'セラフィムマスコットの聖なる力に晒されすぎた{player}は力尽き、体が縮んでいく...',
        '「疲れちゃったかな～？じゃあ、特別な場所に連れてってあげるね～♪」',
        'セラフィムマスコットの胃壁が、小さくなった{player}の体を更に奥に押し込んでいく！',
        '「もう何も心配いらないよ〜♪ ずっとお姉さんが守ってあげるからね〜♪」',
        '{player}の体はセラフィムマスコットの体内に完全に取り込まれてしまった！',
        'その深すぎる愛情によって、セラフィムマスコットの救済が終わるまで{player}は外の世界を見ることはない...'
    ],
    onUse: (_boss: Boss, player: Player) => {
        // プレイヤーを敗北状態にし、体内での永続的な世話を開始
        player.statusEffects.removeEffect(StatusEffectType.Doomed);
        player.statusEffects.addEffect(StatusEffectType.Dead);
        player.statusEffects.addEffect(StatusEffectType.Shrunk, -1); // 縮小状態にする
        player.statusEffects.addEffect(StatusEffectType.SalvationState, -1); // 永続的な救済状態
        
        // メッセージ追加は無し
        return [];
    }
};

// 段階5: 永続救済フェーズ（敗北後の継続的世話）
const seraphMascotEternalActions: BossAction[] = [
    {
        id: 'eternal-care',
        type: ActionType.PostDefeatedAttack,
        name: '永続的なお世話',
        description: '永遠に世話をし続ける',
        messages: [
            '「ずっとお世話してあげるからね〜♪」',
            '{boss}の体内器官が{player}にマッサージをし、お世話を続けている...',
            '柔らかくも丁寧なお世話が続き、{player}は心地よい感覚に包まれる...'
        ],
        weight: 30,
        playerStateCondition: 'defeated'
    },
    {
        id: 'overprotection',
        type: ActionType.PostDefeatedAttack,
        name: '過保護モード',
        description: '過度に保護しようとする',
        messages: [
            '「危ないものから守ってあげなきゃ〜！」',
            '{boss}は体内の{player}に聖なる力を流し込み、過度に保護しようとする！',
            '小さな{player}は過保護な環境に包まれ、身動きがとれなくなる...'
        ],
        weight: 25,
        playerStateCondition: 'defeated'
    },
    {
        id: 'salvation-obsession',
        type: ActionType.PostDefeatedAttack,
        name: '救済強迫観念',
        description: '救済への強迫観念が発動する',
        messages: [
            '「まだ救済が足りない！もっと、もっと〜！」',
            '{boss}の救済への強迫観念が暴走し、体内器官が{player}の体を締め付ける！',
            '{player}は救済の圧力に苦しむも、柔らかい感触にうっとりしてしまう...'
        ],
        weight: 20,
        playerStateCondition: 'defeated'
    },
    {
        id: 'loving-suffocation',
        type: ActionType.PostDefeatedAttack,
        name: '愛の窒息',
        description: '愛情が深すぎて息ができなくなる',
        messages: [
            '「だいすき〜♪ ずっと一緒にいようね〜♪」',
            '{boss}が自分のお腹を抱きしめると、その深すぎる愛情によって{player}の体がきつく締め付けられる！',
            '善意の愛情が逆に苦しみとなってしまう...'
        ],
        statusEffect: StatusEffectType.Overwhelmed,
        statusChance: 0.80,
        weight: 15,
        playerStateCondition: 'defeated'
    }
];

// 永続救済フェーズ 8 ターンごとに行う聖なる粘液シャワー
const seraphMascotSacredShowerAction: BossAction = {
    id: 'sacred-shower',
    type: ActionType.PostDefeatedAttack,
    name: '聖なるシャワー',
    description: '体内で聖なる粘液のシャワーを浴びせる',
    statusEffect: StatusEffectType.HolySlimed,
    statusChance: 1.0,
    messages: [
        '「体をキレイにしてあげるね～♪」',
        '{boss}の体内器官から聖なる粘液のシャワーが降り注ぐ！',
        '{player}はその聖なる粘液に包まれ、心地よい感覚に浸る...',
        '「もみ洗いもしてあげるよ～♪」',
        '{boss}の体内器官が聖なる粘液を出しながら、優しく{player}を揉み洗いする！',
        '{player}は粘液ごと体をもみくちゃにされ、意識がぼうっとしていく...',
        '「これでいつでもキレイだよ～♪また洗ってあげるからね～♪」',
        '体を洗われた{player}は、心も体も清められた感覚に浸る...'
    ],
    weight: 200,
    playerStateCondition: 'defeated'
};

// AI戦略: 救済レベル管理と段階的エスカレーション
const seraphMascotAIStrategy = (boss: Boss, player: Player, turn: number): BossAction => {
    // 救済レベルの管理（プレイヤーのHP状況で判定）
    const playerHpPercentage = player.getHpPercentage();
    const isPlayerBlessed = player.statusEffects.hasEffect(StatusEffectType.Blessed);
    const isPlayerInSalvation = player.statusEffects.hasEffect(StatusEffectType.SalvationState);
    
    // 救済必要度の計算（HP低下 + 状態異常の有無）
    let salvationNeeds = 0;
    if (playerHpPercentage < 0.7) salvationNeeds += 1;
    if (playerHpPercentage < 0.4) salvationNeeds += 1;
    if (playerHpPercentage < 0.2) salvationNeeds += 2;
    if (player.statusEffects.getAllEffects().length > 2) salvationNeeds += 1;
    
    boss.setCustomVariable('salvationNeeds', salvationNeeds);
    boss.setCustomVariable('currentTurn', turn);
    
    // プレイヤーが敗北状態の場合
    if (player.isDefeated()) {
        // 敗北後のターン数管理
        let postDefeatedTurn = boss.getCustomVariable<number>('postDefeatedTurn', 0);
        postDefeatedTurn++;
        boss.setCustomVariable('postDefeatedTurn', postDefeatedTurn);
        
        // 8ターンごとに聖なるシャワーを浴びせる
        if (postDefeatedTurn % 8 === 0) {
            return seraphMascotSacredShowerAction;
        }
        
        // 永続救済フェーズの行動選択
        const eternalActions = seraphMascotEternalActions;
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
    
    // プレイヤーが危機状態 (最大HPが0)
    if (player.isDoomed()) {
        // とどめ行動を選択
        return seraphMascotFinishingMove;
    }
    
    // プレイヤーが食べられた状態（保護フェーズ）
    if (player.isEaten()) {
        const protectionActions = seraphMascotProtectionActions;
        
        // 体内での救済レベルに応じた行動選択
        if (salvationNeeds >= 3) {
            // 高救済需要時：神聖なる消化を優先
            const divineAction = protectionActions.find(action => action.id === 'divine-digestion');
            if (divineAction && Math.random() < 0.6) {
                return divineAction;
            }
        }
        
        // 重み付きランダム選択
        const availableActions = protectionActions.filter(action => action.canUse ? action.canUse(boss, player, turn) : true);
        
        const totalWeight = availableActions.reduce((sum, action) => sum + action.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const action of availableActions) {
            random -= action.weight;
            if (random <= 0) {
                return action;
            }
        }
        return protectionActions[0];
    }
    
    // プレイヤーが戦闘不能状態
    if (player.isKnockedOut()) {
        if (player.isRestrained()) {
            // 拘束+戦闘不能：80%で「完全保護」へ移行
            if (Math.random() < 0.8) {
                return {
                    id: 'complete-protection',
                    type: ActionType.EatAttack,
                    name: '完全なる保護',
                    description: '体内の聖域で完全に保護する',
                    messages: [
                        '「もう傷つかないように、おなかの聖域で守ってあげる〜♪」',
                        '{boss}は{player}を長い舌で巻き取り、そのまま飲み込んでしまった！',
                        '{player}は聖なる胃袋に包まれる...'
                    ],
                    weight: 1
                };
            }
        } else {
            // 戦闘不能時：救済レベルに応じて行動変更
            if (salvationNeeds >= 2) {
                // 高救済需要：翼の抱擁で拘束
                const restraintAction = seraphMascotContactActions.find(action => action.id === 'wing-embrace');
                if (restraintAction && Math.random() < 0.7) {
                    return restraintAction;
                }
            }
        }
    }
    
    // プレイヤーが拘束状態（救済フェーズ）
    if (player.isRestrained()) {
        const careActions = seraphMascotCareActions;
        
        // 救済状態でない場合は準備を優先
        if (!isPlayerInSalvation && Math.random() < 0.6) {
            const preparationAction = careActions.find(action => action.canUse && action.canUse(boss, player, turn) && action.id === 'salvation-preparation');
            if (preparationAction) {
                return preparationAction;
            }
        }
        
        // 重み付きランダム選択
        const totalWeight = careActions.reduce((sum, action) => sum + action.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const action of careActions) {
            random -= action.weight;
            if (random <= 0) {
                return action;
            }
        }
        return careActions[0];
    }
    
    // 通常状態（接触フェーズ）
    const contactActions = seraphMascotContactActions;
    
    // 救済必要度に応じた行動調整
    if (salvationNeeds >= 3) {
        // 緊急救済：翼の抱擁を優先
        const embraceAction = contactActions.find(action => action.id === 'wing-embrace');
        if (embraceAction && embraceAction.canUse && embraceAction.canUse(boss, player, turn) && Math.random() < 0.5) {
            return embraceAction;
        }
    }
    
    if (salvationNeeds >= 2) {
        // 中程度救済：祝福の光を優先
        if (!isPlayerBlessed && Math.random() < 0.4) {
            const blessingAction = contactActions.find(action => action.id === 'blessing-light');
            if (blessingAction) {
                return blessingAction;
            }
        }
    }
    
    // 通常の重み付きランダム選択
    const availableActions = contactActions.filter(action => {
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
    
    return availableActions[0] || contactActions[0];
};

export const seraphMascotData: BossData = {
    id: 'seraph-mascot',
    name: 'SeraphMascot',
    displayName: 'セラフィムマスコット',
    description: '善意溢れる巨大天使マスコット',
    questNote: '天空の彼方から、巨大な天使のような存在が降り、その圧倒的な大きさで街を荒らしているそうだ。それは「救済」と称して、善意に満ちた瞳で人々を「救済」しているそうだが、被害は甚大である。あなたの任務はその天使のような存在を討伐し、街を救うことだ。',
    maxHp: 1200,
    attackPower: 32,
    actions: seraphMascotContactActions
        .concat(seraphMascotCareActions)
        .concat(seraphMascotProtectionActions)
        .concat(seraphMascotEternalActions),
    suppressAutoFinishingMove: true,
    icon: '☁️',
    explorerLevelRequired: 9,
    
    battleStartMessages: [
        {
            speaker: 'player',
            style: 'default',
            text: 'あなたは天空から降りてきた巨大な天使マスコットと対峙した。'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: 'わあ〜♪ また救済が必要な子を見つけたよ〜！'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: 'セラフィムマスコットがあなたを見下ろしている。その善意に満ちた瞳が、あなたを「救済対象」として認識した！'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: 'だいじょうぶだよ〜♪ お姉さんがぜーんぶ救済してあげるからね〜♪'
        }
    ],
    
    victoryMessages: [
        {
            speaker: 'boss',
            style: 'talk',
            text: 'あれ〜？もう救済おわっちゃったの？',
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: 'きみ、とっても強いね〜♪ でもまた困ったことがあったら呼んでね〜！'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: 'セラフィムマスコットは少し寂しそうに天空へと帰っていった...'
        }
    ],
    
    // 記念品設定
    victoryTrophy: {
        name: '天使の羽根',
        description: 'セラフィムマスコットの純白の羽根。神聖な力と無垢な愛情が込められている。触れると心が温かくなる不思議な逸品。'
    },
    defeatTrophy: {
        name: '救済の雫',
        description: 'セラフィムマスコットの体内で生成された神秘的な体液。救済への純粋な想いが結晶化したもので、永遠の愛と保護を象徴している。'
    },
    
    personality: [
        'みんなを救済してあげる〜♪',
        'だいじょうぶだよ〜、お姉さんがついてるからね〜',
        '困った子はいないかな〜？',
        'ずっと守ってあげるからね〜♪',
        '救済が必要な子発見〜♪',
        'みんなで幸せになろうね〜♪'
    ],
    
    aiStrategy: seraphMascotAIStrategy,
    
    // カスタム変数の初期値
    customVariables: {
        salvationNeeds: 0,           // 救済必要度レベル
        currentTurn: 0,              // 現在ターン数
        postDefeatedTurn: 0,         // 敗北後ターン数
        hasUsedCompleteProtection: false,  // 完全保護使用フラグ
        salvationAbilityLastUsed: -1 // 救済能力(preparation/cycle)共通クールダウン
    }
};

// 状況別台詞システム
seraphMascotData.getDialogue = function(situation: 'battle-start' | 'player-restrained' | 'player-eaten' | 'player-escapes' | 'low-hp' | 'victory') {
    const dialogues: Record<string, string[]> = {
        'battle-start': [
            'わあ〜♪ また困った子を見つけたよ〜！',
            'だいじょうぶだよ〜、お姉さんが救済してあげるからね〜♪',
            '救済が必要な子発見〜♪',
            'みんなで幸せになろうね〜♪'
        ],
        'player-restrained': [
            'うふふ〜、捕まえた♪ これで安全だね〜',
            'もう逃げちゃダメだよ〜、救済してあげるから♪',
            'おとなしくしてね〜、お世話してあげるから♪',
            'ずっと抱っこしててあげる〜♪',
            'もう危ないことしちゃダメよ〜'
        ],
        'player-eaten': [
            'ここなら絶対安全だよ〜♪',
            'お腹の中でゆっくり休んでね〜',
            'ずっと守ってあげるからね〜♪',
            'もう何も心配いらないよ〜',
            'お姉さんのお腹は最高の聖域なの〜♪',
            '完璧に救済してあげるからね〜♪'
        ],
        'player-escapes': [
            'あ〜、逃げちゃった...',
            'まだ救済途中だったのに〜',
            '危ないから戻っておいで〜',
            '今度はちゃんと救済させてよ〜',
            'また会えるといいな〜♪'
        ],
        'low-hp': [
            'お姉さんは負けないよ〜',
            'みんなの救済はまだ終わってないもん！',
            'まだまだ〜！救済パワー全開〜♪',
            '負けたら誰が救済するの〜？',
            '救済は止められないよ〜♪'
        ],
        'victory': [
            'やったぁ〜！完璧に救済できたね♪',
            '救済大成功〜！',
            'みんな幸せになれて良かった〜♪',
            'また困ったことがあったら呼んでね〜♪',
            'ずっと見守ってるからね〜♪'
        ]
    };
    
    const options = dialogues[situation] || dialogues['battle-start'];
    return options[Math.floor(Math.random() * options.length)];
};