import { Player } from '@/game/entities/Player';
import { BossData, ActionType, BossAction, Boss } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffectTypes';

const skyPhoenixActions: BossAction[] = [
    // 第一形態（青炎の不死鳥）: HP500 → 0
    {
        id: 'azure-wing-strike',
        type: ActionType.Attack,
        name: '青翼撃',
        description: '青い炎を纏った翼で優雅に攻撃',
        damageFormula: (user: Boss) => user.attackPower * 0.9,
        hitRate: 0.90,
        weight: 25,
        playerStateCondition: 'normal',
        canUse: (boss: Boss) => boss.getCustomVariable<number>('currentForm', 1) === 1
    },
    {
        id: 'azure-flame-breath',
        type: ActionType.StatusAttack,
        name: '青炎のブレス',
        description: '青い炎を吐き出して火だるま状態にする',
        damageFormula: (user: Boss) => user.attackPower * 1.1,
        statusEffect: StatusEffectType.Fire,
        statusChance: 0.60,
        hitRate: 0.85,
        weight: 20,
        playerStateCondition: 'normal',
        canUse: (boss: Boss) => boss.getCustomVariable<number>('currentForm', 1) === 1,
        messages: ['<USER>は青い炎のブレスを吐いた！']
    },
    {
        id: 'sky-gale',
        type: ActionType.Attack,
        name: '天空の突風',
        description: '翼で強烈な風を起こして攻撃',
        damageFormula: (user: Boss) => user.attackPower * 0.8,
        hitRate: 0.95,
        weight: 20,
        playerStateCondition: 'normal',
        canUse: (boss: Boss) => boss.getCustomVariable<number>('currentForm', 1) === 1,
        messages: ['<USER>が翼を羽ばたかせ、強烈な突風が吹き荒れる！']
    },

    // 第二形態（紅蓮の不死鳥）: HP400 → 0
    {
        id: 'crimson-talon-rush',
        type: ActionType.Attack,
        name: '紅蓮の爪襲',
        description: '赤い炎を纏った爪で連続攻撃',
        damageFormula: (user: Boss) => user.attackPower * 1.2,
        hitRate: 0.85,
        weight: 25,
        playerStateCondition: 'normal',
        canUse: (boss: Boss) => boss.getCustomVariable<number>('currentForm', 1) === 2
    },
    {
        id: 'crimson-flame-tornado',
        type: ActionType.StatusAttack,
        name: '紅蓮の炎竜巻',
        description: '炎の竜巻を起こして天空の呪いをかける',
        damageFormula: (user: Boss) => user.attackPower * 1.0,
        statusEffect: StatusEffectType.SkyCurse,
        statusChance: 0.70,
        hitRate: 0.80,
        weight: 30,
        playerStateCondition: 'normal',
        canUse: (boss: Boss) => boss.getCustomVariable<number>('currentForm', 1) === 2,
        messages: ['<USER>は紅蓮の炎で竜巻を起こした！', '天空の呪いがプレイヤーを包み込む...']
    },
    {
        id: 'infernal-dive',
        type: ActionType.Attack,
        name: '業火の急降下',
        description: '上空から炎を纏って急降下攻撃',
        damageFormula: (user: Boss) => user.attackPower * 1.4,
        hitRate: 0.75,
        weight: 20,
        playerStateCondition: 'normal',
        canUse: (boss: Boss) => boss.getCustomVariable<number>('currentForm', 1) === 2,
        messages: ['<USER>は上空高くまで舞い上がると、業火を纏って急降下してきた！']
    },

    // 最終形態（白銀の不死鳥）: HP350 → 0
    {
        id: 'silver-light-ray',
        type: ActionType.Attack,
        name: '白銀の光線',
        description: '神聖な光の力で攻撃',
        damageFormula: (user: Boss) => user.attackPower * 1.1,
        hitRate: 0.90,
        weight: 25,
        playerStateCondition: 'normal',
        canUse: (boss: Boss) => boss.getCustomVariable<number>('currentForm', 1) === 3
    },
    {
        id: 'eternal-embrace',
        type: ActionType.RestraintAttack,
        name: '永遠の抱擁',
        description: '神聖な翼で対象を包み込み拘束する',
        weight: 30,
        playerStateCondition: 'normal',
        canUse: (boss: Boss) => boss.getCustomVariable<number>('currentForm', 1) === 3,
        messages: ['<USER>は白銀の翼を広げ、<TARGET>を優しく包み込んだ...']
    },
    {
        id: 'heavenly-ascension',
        type: ActionType.StatusAttack,
        name: '天界への昇華',
        description: '拘束中の獲物に天空の呪いをかけて昇華させる',
        statusEffect: StatusEffectType.SkyCurse,
        statusDuration: 5,
        statusChance: 0.90,
        weight: 40,
        playerStateCondition: 'restrained',
        canUse: (boss: Boss) => boss.getCustomVariable<number>('currentForm', 1) === 3,
        messages: [
            '<USER>の翼が神々しく光り始める...',
            '「永遠の安らぎを与えよう...」',
            '<TARGET>は天界の力によって昇華されていく...'
        ]
    },

    // 転生儀式（形態変化時の特殊行動）
    {
        id: 'rebirth-ceremony',
        type: ActionType.Attack,
        name: '転生の儀式',
        description: '不死鳥が転生して新しい形態に変化する',
        weight: 100,
        playerStateCondition: 'normal',
        canUse: (boss: Boss) => {
            const rebirthState = boss.getCustomVariable<string>('rebirthState', 'none');
            return rebirthState === 'ready';
        },
        messages: [
            '<USER>の体が光に包まれ始める...',
            '「死すらも超越し、新たな力で蘇らん...」',
            '転生の儀式が始まった！プレイヤーも神聖な光に包まれる...',
            'プレイヤーのHPが完全回復した！',
            '<USER>がより強力な姿で蘇った！'
        ],
        onUse: (boss: Boss, player: Player) => {
            const currentForm = boss.getCustomVariable<number>('currentForm', 1);
            const newForm = currentForm + 1;
            
            // 形態変化処理
            boss.setCustomVariable('currentForm', newForm);
            boss.setCustomVariable('rebirthState', 'none');
            boss.setCustomVariable('rebirthCooldown', 3);
            
            // プレイヤーHP全回復（不死鳥の加護）
            player.hp = player.maxHp;
            
            // 新形態に応じてボスのステータス変更
            if (newForm === 2) {
                // 第二形態：紅蓮の不死鳥
                boss.hp = boss.maxHp = 400;
                boss.attackPower = 30;
                boss.displayName = '紅蓮の不死鳥';
            } else if (newForm === 3) {
                // 最終形態：白銀の不死鳥
                boss.hp = boss.maxHp = 350;
                boss.attackPower = 35;
                boss.displayName = '白銀の不死鳥';
            }
            
            return [];
        }
    },

    // 最終勝利演出（プレイヤーDoomed状態時）
    {
        id: 'heavenly-companion',
        type: ActionType.FinishingMove,
        name: '天界の同伴者',
        description: '天空の宮殿でパートナーとして永遠に過ごす',
        weight: 100,
        playerStateCondition: 'defeated',
        canUse: (boss: Boss) => boss.getCustomVariable<number>('currentForm', 1) === 3,
        messages: [
            '<TARGET>は天空の呪いによって昇華され、もはや地上には戻れない...',
            '<USER>は<TARGET>を優しく翼で包み込むと、雲の上へと舞い上がっていく...',
            '「君は私の永遠のパートナーだ...天空の宮殿で共に過ごそう」',
            '<TARGET>は天空の宮殿で不死鳥の伴侶として、永遠の時を過ごすことになった...'
        ],
        onUse: (_boss: Boss, player: Player) => {
            player.statusEffects.removeEffect(StatusEffectType.Doomed);
            player.statusEffects.addEffect(StatusEffectType.Dead);
            return [];
        }
    },

    // 敗北後の継続行動（天空の宮殿での生活）
    {
        id: 'sky-palace-life',
        type: ActionType.PostDefeatedAttack,
        name: '天空の宮殿での生活',
        description: '雲の宮殿で不死鳥と共に過ごす日常',
        weight: 25,
        playerStateCondition: 'defeated',
        messages: [
            '雲でできた美しい宮殿で、<USER>と<TARGET>は共に過ごしている',
            '<TARGET>は天空の住人として、永遠の平和を享受している...'
        ]
    },
    {
        id: 'cloud-garden-walk',
        type: ActionType.PostDefeatedAttack,
        name: '雲の庭園散歩',
        description: '天空の庭園を不死鳥と一緒に散歩する',
        weight: 20,
        playerStateCondition: 'defeated',
        messages: [
            '<USER>と<TARGET>は雲でできた美しい庭園を歩いている',
            '虹色の花々が咲き乱れ、<TARGET>は穏やかな時間を過ごす...'
        ]
    },
    {
        id: 'starlight-dinner',
        type: ActionType.PostDefeatedAttack,
        name: '星明りの晩餐',
        description: '星空の下で不死鳥と共に食事を楽しむ',
        weight: 15,
        playerStateCondition: 'defeated',
        messages: [
            '星空の下、<USER>と<TARGET>は美しいテーブルで食事を共にする',
            '<TARGET>は天界の料理を味わいながら、幸せな時間を過ごしている...'
        ]
    }
];

// AI戦略: 形態変化による段階的強化
const skyPhoenixAIStrategy = (boss: Boss, player: Player, turn: number): BossAction => {
    const currentForm = boss.getCustomVariable<number>('currentForm', 1);
    const rebirthState = boss.getCustomVariable<string>('rebirthState', 'none');
    const rebirthCooldown = boss.getCustomVariable<number>('rebirthCooldown', 0);
    const playerDefeated = player.isDefeated();
    const playerDoomed = player.statusEffects.hasEffect(StatusEffectType.Doomed);
    const playerRestrained = player.statusEffects.hasEffect(StatusEffectType.Restrained);

    // 敗北後の処理
    if (playerDefeated) {
        const postDefeatedActions = skyPhoenixActions.filter(action => 
            action.playerStateCondition === 'defeated'
        );
        
        if (postDefeatedActions.length > 0) {
            const totalWeight = postDefeatedActions.reduce((sum, action) => sum + action.weight, 0);
            let randomValue = Math.random() * totalWeight;
            
            for (const action of postDefeatedActions) {
                randomValue -= action.weight;
                if (randomValue <= 0) {
                    return action;
                }
            }
        }
        return skyPhoenixActions.find(action => action.id === 'sky-palace-life') || skyPhoenixActions[0];
    }

    // 最終形態でDoomed状態なら特殊勝利
    if (playerDoomed && currentForm === 3) {
        const finishingAction = skyPhoenixActions.find(action =>
            action.id === 'heavenly-companion'
        );
        if (finishingAction) return finishingAction;
    }

    // 転生クールダウン処理
    if (rebirthCooldown > 0) {
        boss.setCustomVariable('rebirthCooldown', rebirthCooldown - 1);
    }

    // HP0になったら転生準備
    if (boss.hp <= 0 && currentForm < 3 && rebirthState === 'none') {
        boss.setCustomVariable('rebirthState', 'ready');
    }

    // 転生儀式の実行
    if (rebirthState === 'ready') {
        const rebirthAction = skyPhoenixActions.find(action =>
            action.id === 'rebirth-ceremony'
        );
        if (rebirthAction) return rebirthAction;
    }

    // 最終形態での拘束戦術
    if (currentForm === 3) {
        // 拘束中なら天界への昇華を優先
        if (playerRestrained) {
            const ascensionAction = skyPhoenixActions.find(action =>
                action.id === 'heavenly-ascension'
            );
            if (ascensionAction) return ascensionAction;
        }
        
        // 拘束されていなければ永遠の抱擁を狙う
        const embraceAction = skyPhoenixActions.find(action =>
            action.id === 'eternal-embrace'
        );
        if (embraceAction && Math.random() < 0.4) return embraceAction;
    }

    // 各形態に応じた通常攻撃選択
    const formActions = skyPhoenixActions.filter(action => 
        action.playerStateCondition === 'normal' && 
        (!action.canUse || action.canUse(boss, player, turn))
    );

    if (formActions.length > 0) {
        const totalWeight = formActions.reduce((sum, action) => sum + action.weight, 0);
        let randomValue = Math.random() * totalWeight;
        
        for (const action of formActions) {
            randomValue -= action.weight;
            if (randomValue <= 0) {
                return action;
            }
        }
    }

    // フォールバック
    return skyPhoenixActions[0];
};

export const skyPhoenixData: BossData = {
    id: 'sky-phoenix',
    name: 'SkyPhoenix',
    icon: '🔥',
    displayName: '青炎の不死鳥',
    description: '天空の雲海に住む神秘的な不死鳥。転生の力で3つの形態に変化する',
    questNote: '天空地方の雲海で、美しい鳴き声が響いた。その声に導かれて雲の上へ向かうと、真っ白な体毛と虹色の羽根を持つ不死鳥が姿を現した。「永遠の命を求める者よ...汝の魂を我が糧とさせよ」',
    personality: [
        '美しき魂よ...汝を永遠の安らぎへと導こう',
        '転生の炎で新たな力を得る時だ...',
        '天空の宮殿で共に過ごそう、我が伴侶よ'
    ],
    maxHp: 500,
    attackPower: 25,
    actions: skyPhoenixActions,
    aiStrategy: skyPhoenixAIStrategy,
    suppressAutoFinishingMove: true, // カスタムとどめ攻撃を使用
    victoryTrophy: {
        name: '天空の羽根',
        description: '天空の不死鳥の虹色に輝く美しい羽根。七つの色が永遠に変化し続ける神秘的な宝物。'
    },
    defeatTrophy: {
        name: '永遠の雲',
        description: '天空の宮殿を包む雲の欠片。触れると穏やかな安らぎに満たされる。'
    },
    
    // エクスプローラーレベル9で解禁
    explorerLevelRequired: 9
};