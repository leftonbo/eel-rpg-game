import { Player } from '@/game/entities/Player';
import { BossData, ActionType, BossAction, Boss } from '../../entities/Boss';
import { StatusEffectType } from '../../systems/StatusEffectTypes';

/**
 * Message set for the stomach experience after being defeated by the Demon Dragon.
 * This set contains three stages: start, middle, and end.
 * Each stage has its own set of messages to create a narrative experience.
 * 
 * The messages are designed to provide a unique experience based on the stomach pattern.
 * The `stomachPattern` variable determines which set of messages to use.
 * 
 * @interface StomachExperienceData
 * @property {string[]} start - Messages for the start of the stomach experience.
 * @property {string[][]} middle - Messages for the middle of the stomach experience, chosen randomly.
 * @property {string[]} end - Messages for the end of the stomach experience.
 */
interface StomachExperienceData {
    start: string[];
    middle: string[][];
    end: string[];
}

const demonDragonActions: BossAction[] = [
    // 通常行動パターン
    {
        id: 'stomp-attack',
        type: ActionType.Attack,
        name: '踏みつけ',
        description: '巨大な足で踏みつける強力な攻撃',
        damageFormula: (user: Boss) => user.attackPower * 1.5,
        hitRate: 0.90,
        weight: 30,
        playerStateCondition: 'normal',
        messages: [
            '{boss}は巨大な足を振り上げ、{player}を踏みつけようとしてきた！'
        ]
    },
    {
        id: 'dark-magic-bullet',
        type: ActionType.Attack,
        name: '闇の魔法弾',
        description: '闇の力を込めた魔法弾を放つ、暗闇にする可能性がある',
        damageFormula: (user: Boss) => user.attackPower * 1.1,
        hitRate: 0.85,
        statusEffect: StatusEffectType.Darkness,
        statusChance: 0.50,
        weight: 25,
        playerStateCondition: 'normal',
        messages: [
            '{boss}の口から闇の魔法弾が放たれた！'
        ]
    },
    {
        id: 'slime-spit',
        type: ActionType.StatusAttack,
        name: '粘液発射',
        description: '粘着性の粘液を吐きかける',
        damageFormula: (user: Boss) => user.attackPower * 1.0,
        statusEffect: StatusEffectType.Slimed,
        statusChance: 0.75,
        hitRate: 0.80,
        weight: 20,
        playerStateCondition: 'normal',
        messages: [
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
            // 1ターン目または20ターン経過後に使用可能
            return (turn === 1 || turn - lastSoulVacuumTurn >= 20) && !player.isEaten() && !player.isRestrained();
        },
        onPreUse: (action: BossAction, boss: Boss, player: Player, turn: number): BossAction | null => {
            boss.setCustomVariable('lastSoulVacuumTurn', turn);
            
            // メッセージ配列は複製したものを使用 (データ書き込み防止)
            const messages = [...action.messages || []];
            action.messages = messages;

            // 無敵状態だと失敗する
            if (player.statusEffects.hasEffect(StatusEffectType.Invincible)) {
                if (messages) {
                    messages.push('{player}は無敵状態のため、吸い込まれなかった！');
                }
                // EatAttack から変更して効果のない行動とする
                action.type = ActionType.Attack;
                return action;
            }
            
            // 防御状態だと失敗する
            if (player.statusEffects.hasEffect(StatusEffectType.Defending)) {
                if (messages) {
                    messages.push('{player}は防御の構えをとっているため、吸い込まれなかった！');
                }
                // EatAttack から変更して効果のない行動とする
                action.type = ActionType.Attack;
                return action;
            }
            
            // 吸い込まれメッセージ追加
            if (messages) {
                messages.push('{player}は抵抗する間もなく{boss}の口の中に吸い込まれてしまった！');
            }
            return action;
        },
        messages: [
            '「生ける魂よ、我が下に来たれ...」',
            '{boss}は口を大きく開き、強烈な力で魂を吸い込む！'
        ]
    },

    // 食べられ状態システム (簡略化: 3段階)
    {
        id: 'esophagus-travel',
        type: ActionType.DevourAttack,
        name: '食道移動',
        description: '食道内を移動しながら最大HPを奪われる',
        damageFormula: (user: Boss) => user.attackPower * 0.8,
        weight: 1,
        playerStateCondition: 'eaten',
        canUse: (boss: Boss, _player: Player, _turn: number) => {
            const eatenTurnCount = boss.getCustomVariable<number>('eatenTurnCount', 0);
            return eatenTurnCount <= 4;
        },
        onPreUse: onPreUseEsophagusTravel,
        messages: [] // 動的に設定される
    },
    {
        id: 'crop-arrival',
        type: ActionType.DevourAttack,
        name: '嗉嚢到着',
        description: '嗉嚢に到着、脱出の最後のチャンス',
        damageFormula: (user: Boss) => user.attackPower * 0.5,
        weight: 1,
        playerStateCondition: 'eaten',
        canUse: (boss: Boss, _player: Player, _turn: number) => {
            const eatenTurnCount = boss.getCustomVariable<number>('eatenTurnCount', 0);
            return eatenTurnCount === 5;
        },
        messages: [
            '{player}は{boss}の嗉嚢に到着してしまった...',
            '温かく心地よい感覚に包まれているが、これが最後のチャンスだ！',
            '次のターンまでに脱出しなければ、魔の胃袋に取り込まれてしまう！'
        ]
    },
    {
        id: 'demon-stomach-absorption',
        type: ActionType.DevourAttack,
        name: '魔の胃袋取り込み',
        description: '不定形の触手が伸び、プレイヤーを魔の胃袋に取り込む',
        damageFormula: (_user: Boss) => 0,
        weight: 1,
        playerStateCondition: 'eaten',
        canUse: (boss: Boss, _player: Player, _turn: number) => {
            const eatenTurnCount = boss.getCustomVariable<number>('eatenTurnCount', 0);
            return eatenTurnCount >= 6;
        },
        onUse: (boss: Boss, player: Player, _turn: number) => {
            // プレイヤーのHP、最大HPを吸収
            const hpReduction = player.hp;
            const maxHpReduction = player.maxHp;
            player.takeDamage(hpReduction);
            player.loseMaxHp(maxHpReduction);
            
            // ボスの最大HPを増加
            boss.gainMaxHp(maxHpReduction);
            boss.heal(hpReduction);
            
            // プレイヤーを敗北状態にする
            player.statusEffects.removeEffect(StatusEffectType.KnockedOut);
            player.statusEffects.removeEffect(StatusEffectType.Doomed);
            player.statusEffects.addEffect(StatusEffectType.Dead);
            player.statusEffects.addEffect(StatusEffectType.DemonStomach);

            // 敗北状態の初期設定
            initializeStomachExperienceVariables(boss);

            return [];
        },
        messages: [
            '嗉嚢の奥から、不定形の黒い触手がゆっくりと現れる...',
            '触手は{player}を包み込み、奥の肉壁へと押し込んでいく！',
            '{player}は抵抗を試みるも、不定形の触手と肉壁が瞬時に生命エネルギーを吸い取り、力を奪っていく！',
            '{player}の抵抗も虚しく、体は不定形の肉壁へと沈み、魔の胃袋に取り込まれてしまった...'
        ]
    },

    // 敗北状態システム - 統合版（パターン別メッセージ）
    {
        id: 'stomach-experience',
        type: ActionType.PostDefeatedAttack,
        name: '魔の胃袋体験',
        description: '魔の胃袋で幸せな体験をする',
        weight: 100,
        playerStateCondition: 'defeated',
        onPreUse: onPreUseStomachExperience,
        messages: [] // 動的に設定される
    }
];

/**
 * Selects an action for the eaten state based on the current turn count.
 * 
 * This function increments the eaten turn count and selects the appropriate action
 * based on the current state of the boss and player.
 */
const selectEatenAction = (boss: Boss, player: Player, turn: number): BossAction | null => {
    let eatenTurnCount = boss.getCustomVariable<number>('eatenTurnCount', 0);
    eatenTurnCount++;
    boss.setCustomVariable('eatenTurnCount', eatenTurnCount);

    const eatenActions = demonDragonActions.filter(action =>
        action.playerStateCondition === 'eaten' &&
        action.canUse && action.canUse(boss, player, turn)
    );

    return eatenActions.length > 0 ? eatenActions[0] : null;
};

/**
 * Pre-use callback for esophagus travel action
 * 
 * This function modifies the action messages based on the current eaten turn count.
 * It provides a narrative of the player's journey through the demon dragon's esophagus.
 */
function onPreUseEsophagusTravel(action: BossAction, boss: Boss, _player: Player, _turn: number): BossAction | null {
    const eatenTurnCount = boss.getCustomVariable<number>('eatenTurnCount', 0);

    switch (eatenTurnCount) {
        case 1:
            action.messages = [
                '{boss}の食道の入り口で、{player}は温かく湿った環境に包まれる...',
                '食道の壁がゆっくりと蠕動し、{player}を奥へと送り込もうとしている...'
            ];
            break;
        case 2:
            action.messages = [
                '{player}は食道の中間部に運ばれ、さらに強い蠕動に包まれる...',
                '周囲の筋肉が{player}を優しく包み込みながら、胴体部へと押し流していく...'
            ];
            break;
        case 3:
            action.messages = [
                '{player}は長い首から胴体部へと運ばれていく...',
                '蠕動がより強くなり、{player}の体をぎゅうぎゅうと圧迫しながら押し流していく...'
            ];
            break;
        case 4:
            action.messages = [
                '{player}は嗉嚢の手前まで運ばれてきた...',
                '強力な蠕動が{player}を包み込み、もはや逃れることは困難になってきた...'
            ];
            break;
        default:
            console.warn(`Unexpected eatenTurnCount: ${eatenTurnCount}`);
            return null; // それ以上のターンはない
    }
    return action;
}

/**
 * Selects the action to perform while the player is defeated and performs the stomach experience.
 * 
 * This function checks which action is available for the defeated player.
 */
const selectDefeatedAction = (_boss: Boss): BossAction => {
    const stomachAction = demonDragonActions.find(action => action.id === 'stomach-experience');

    if (stomachAction) {
        return stomachAction;
    }

    return demonDragonActions[0];
};

/**
 * Pre-use callback for stomach experience action
 * 
 * This function dynamically sets the messages for the stomach experience action
 * based on the current stomach pattern of the boss.
 */
function onPreUseStomachExperience(action: BossAction, boss: Boss, player: Player, _turn: number): BossAction | null {
    let stomachPattern = boss.getCustomVariable<number>('stomachPattern', 0);
    let regurgitationProgress = boss.getCustomVariable<number>('regurgitationProgress', 0);
    
    // パターン 0 になっている場合、次のパターンに進む
    if (stomachPattern === 0 && regurgitationProgress === 0) {
        const patternIndex = boss.getCustomVariable<number>('indexStomachPattern', 0);
        const patternList = boss.getCustomVariable<number[]>('arrayStomachPatterns', []);
        
        // リストの最後まで行った場合、吐き戻し演出を開始するフラグを立てる
        if (patternIndex >= patternList.length) {
            regurgitationProgress = 1; // 吐き戻し進行度を1に設定
            boss.setCustomVariable('regurgitationProgress', 1);
        } else {
            // 次のパターンに進む
            stomachPattern = patternList[patternIndex];
            boss.setCustomVariable('stomachPattern', patternList[patternIndex]);
            boss.setCustomVariable('indexStomachPattern', patternIndex + 1);
        }
    }
    
    // 吐き戻し演出パターン再生
    if (regurgitationProgress > 0) {
        const messages = messagesRegurgitation[regurgitationProgress - 1];
        action.messages = messages;
        
        if (regurgitationProgress === 1) {
            // 最初: DemonStomach 状態を解除
            player.statusEffects.removeEffect(StatusEffectType.DemonStomach);
            boss.setCustomVariable('regurgitationProgress', regurgitationProgress + 1);
        } else if (regurgitationProgress < messagesRegurgitation.length) {
            // 中間: 吐き戻し進行度を更新
            boss.setCustomVariable('regurgitationProgress', regurgitationProgress + 1);
        } else {
            // 最後: DemonStomach 状態を再度追加
            player.statusEffects.addEffect(StatusEffectType.DemonStomach);
            // 初期状態に戻すためにリセット
            initializeStomachExperienceVariables(boss);
        }
        
        return action; // 吐き戻し演出のメッセージを設定して終了
    }
    
    // 通常の胃袋体験メッセージを設定
    const data = stomachExperienceData[stomachPattern - 1];
    
    // 胃袋内ターン数
    let turnsInStomach = boss.getCustomVariable<number>('turnsInStomach', 0);
    turnsInStomach++;
    
    // メッセージを設定
    if (turnsInStomach === 1) {
        // start メッセージを設定
        action.messages = data.start;
        // middle メッセージををシャッフルして再生するために index をシャッフルして保存
        const middleLength = data.middle.length;
        let middleIndexList = Array.from({ length: middleLength }, (_, i) => i);
        middleIndexList = shuffleArray(middleIndexList);
        boss.setCustomVariable('stomachMiddleList', middleIndexList);
    } else {
        // middle メッセージを設定
        const index = turnsInStomach - 2; // 1ターン目はstart、2+ターン目はmiddle
        const middleList = boss.getCustomVariable<number[]>('stomachMiddleList', []);
        if (index < middleList.length) {
            // 中間メッセージを取得
            const middleMessages = data.middle[middleList[index]];
            action.messages = middleMessages;
        } else {
            // 中間メッセージ再生後、 end メッセージを設定
            action.messages = data.end;
            // 次の胃袋へ
            boss.setCustomVariable('stomachPattern', 0); // 胃袋パターンをリセット
            turnsInStomach = 0; // 胃袋内ターン数をリセット
        }
    }
    
    boss.setCustomVariable('turnsInStomach', turnsInStomach);

    return action;
};

const stomachExperienceData: StomachExperienceData[] = [
    // パターン1: 粘液付けの胃袋
    {
        start: [
            '{player}は魔の胃袋の蠕動に運ばれ、粘液に満たされた空間に到着した...',
            '温かい粘液が全身を包み込み、心地よい感覚が広がる...'
        ],
        middle: [
            [
                '暖かい粘液が{player}の全身を優しく包み込んでいく...',
                '粘液は{player}の肌に心地よく密着し、安らかな感覚をもたらす...',
                '{player}は粘液の暖かさに包まれて、とても幸せな気分になっている...'
            ], [
                '粘液が波のようにうねり、{player}を心地よくマッサージしてくれる...',
                'リズミカルな粘液の動きが、{player}の疲れを癒していく...',
                '{player}は粘液マッサージの気持ちよさに、うっとりとしている...'
            ], [
                '粘液が{player}の肌に浸透し、幸せな感覚が体の奥まで染み渡る...',
                '体の芯から温かくなり、これまでに感じたことのない至福に包まれる...',
                '{player}は粘液が運ぶ幸福感に完全に身を委ねている...'
            ], [
                'もはや{player}は粘液と一体になったような至福の感覚に包まれている...',
                '自分と粘液の境界が曖昧になり、永遠にこの状態でいたいと感じる...',
                '{player}は粘液と共に存在する完璧な調和の中にいる...'
            ]
        ],
        end: [
            '突如、粘液の底で渦が発生し、{player}はその中心に引き込まれていく...',
            `渦に飲み込まれた{player}は再び胃壁に取り込まれ、激しい蠕動で新たな胃袋へと送り込まれる...`,
        ]
    },
    // パターン2: 触手詰めの胃袋
    {
        start: [
            '{player}は魔の胃袋の蠕動に運ばれ、無数の触手がうごめく空間に到着した...',
            'その瞬間、無数の触手が{player}の体を優しく包み込み、心地よい感覚が広がる...'
        ],
        middle: [
            [
                '無数の柔らかい触手がゆっくりと{player}に近づいてくる...',
                '触手は絹のような手触りで、{player}を優しく撫でていく...',
                '{player}は触手の柔らかさに心を奪われている...'
            ], [
                '触手たちが{player}の全身を優しく撫で回し、抵抗する気力を奪っていく...',
                '繊細な触手の動きが{player}に極上の快感をもたらす...',
                '{player}は触手の愛撫に完全に魅了されてしまった...'
            ], [
                '触手に完全に包まれ、{player}のあらゆる部分が愛撫され続ける...',
                '触手の温かい抱擁の中で、{player}は安心感と快感に包まれる...',
                '{player}は触手たちの愛に包まれて、至福の時を過ごしている...'
            ], [
                '触手の愛撫に完全に支配され、{player}には幸福感だけが残っている...',
                'もはや触手なしでは生きていけないと感じるほど、深い絆を感じる...',
                '{player}は触手たちの優しい支配下で、永遠の幸せを手に入れた...'
            ]
        ],
        end: [
            '触手たちが{player}を包み込み、ゆっくりと胃壁へと押し込んでいく...',
            `{player}は再び胃壁の中に取り込まれ、激しい蠕動で新たな胃袋へと送り込まれる...`,
        ]
    },
    // パターン3: 圧縮胃袋
    {
        start: [
            '{player}は魔の胃袋の蠕動に運ばれ、狭い空間に到着した...',
            'その瞬間、胃壁がゆっくりと収縮し、{player}をきつく締め付ける...'
        ],
        middle: [
            [
                '胃袋の壁がゆっくりと収縮し、{player}に心地よい圧迫感を与えてくる...',
                '適度な圧力が{player}を包み込み、安心できる感覚をもたらす...',
                '{player}は優しい圧迫感に包まれて、リラックスしている...'
            ], [
                '圧力が強くなり、{player}の全身が優しく押しつぶされる幸せな感覚...',
                '胃袋の壁が{player}を愛おしそうに抱きしめるように圧迫する...',
                '{player}は圧迫されることの心地よさに目覚めている...'
            ], [
                '絶妙な圧力で包み込まれ、{player}はまるで安全な場所にいるような安心感を得る...',
                '胃袋の圧力が{player}を完璧に支え、不安や恐怖が消えていく...',
                '{player}は圧力に守られているような、究極の安心感に包まれている...'
            ], [
                '完璧な圧力に包まれ、{player}はこの状態が永遠に続けばいいと思ってしまう...',
                'もはや外の世界には戻りたくないと感じるほど、完璧な環境に包まれている...',
                '{player}は圧力による完璧な抱擁の中で、真の幸福を見つけた...'
            ]
        ],
        end: [
            '胃壁がさらに強く圧縮し、{player}は胃袋の奥へと押し込まれていく...',
            `圧縮された{player}は再び胃壁の中に取り込まれ、激しい蠕動で新たな胃袋へと送り込まれる...`,
        ]
    }
];

/**
 * 吐き戻し演出メッセージ
 **/
const messagesRegurgitation: string[][] = [
    [
        '突如、蠕動によって{player}の体が押し上げられる...',
        '{player}の体が食道を登り、{boss}の口の中へと戻されていく！',
        '{boss}は口を大きく開け、{player}に外の光景を見せる！',
        '久しく見なかった陽の光に{player}は目を細める...',
        '{player}は外に出たいと思うものの、エネルギーを絞られ尽くした体は動かない...'
    ], [
        '{boss}の口が再び閉じられ、{player}は再び暗闇の中へと戻される...',
        '少しの柔らかい咀嚼の後、{boss}は首を大きく上げ、{player}を再び飲み込む！',
        '{player}の思いも虚しく、体が再び食道を落ちていく...'
    ], [
        '{player}の体が嗉嚢へと戻り、すぐに不定形の魔の胃袋が{player}の体を飲み込んでいく！',
        '魔の胃袋は{player}を優しく包み込みながら、新たな胃袋へ{player}を送り込んでいく...',
        '再び魔の胃袋の中で、{player}は幸せな体験を始める...'
    ]
]

/**
 * Initializes the stomach experience variables for the Demon Dragon boss.
 * 
 * This function sets up the initial state for the stomach experience,
 */
const initializeStomachExperienceVariables = (boss: Boss): void => {
    boss.setCustomVariable('indexStomachPattern', 0);
    boss.setCustomVariable('stomachPattern', 0);
    boss.setCustomVariable('turnsInStomach', 0);
    boss.setCustomVariable('stomachMiddleList', []); // 中間メッセージリストは初期化
    boss.setCustomVariable('regurgitationProgress', 0);
    
    // 1, 2, 3のパターンをランダムに並び替えて配列に格納
    const stomachPatterns = [1, 2, 3];
    boss.setCustomVariable('arrayStomachPatterns', shuffleArray(stomachPatterns));
}

/**
 * Shuffles an array of numbers in place using the Fisher-Yates algorithm.
 */
const shuffleArray = (array: number[]): number[] => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export const demonDragonData: BossData = {
    id: 'demon-dragon',
    name: 'DemonDragon',
    displayName: '魔界の竜',
    description: '魔界地方に生息する真紫の巨大なドラゴン',
    questNote: `目に入る生き物をなんでも丸呑みにしてしまう巨大なドラゴンをご存知だろうか。奴は彼方の魔に蝕まれた地方に住み、真紫の体毛と蛇腹をもつ、四つ足で首の長い竜だ。奴は目に写った生物を丸呑みにし、魔の胃袋と呼ばれる不定形の胃袋に取り込んでしまうという。奴の胃袋に取り込まれた生き物は、その生き物が感じる最も幸せな体内保管プロセスで閉じ込められ続けると言われている。もしお前が腕に自身のある冒険者なら、奴を討伐し、その胃袋の秘密を暴いてみてはどうだろうか。奴を討伐するためには、強力な武器と防具、そして十分な準備が必要だ。奴の胃袋に取り込まれないよう、注意深く戦うことを忘れないでほしい。`,
    appearanceNote: 'ドラゴン、黒紫の体毛、紫の蛇腹、四つ足、首長、巨大な翼',
    maxHp: 2600,
    attackPower: 22,
    actions: demonDragonActions,
    icon: '🐉',
    explorerLevelRequired: 10,
    battleStartMessages: [
        {
            speaker: 'player',
            style: 'default',
            text: 'あなたは魔に蝕まれた地で巨大な魔界の竜と遭遇した。'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: '魔界の竜は真紫の体毛を輝かせながら、威圧的な存在感を放っている...'
        }
    ],
    victoryMessages: [
        {
            speaker: 'player',
            style: 'default',
            text: '魔界の竜を倒すことに成功した！'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: '魔界の竜は低く唸り声を上げ、その身を震わせる...'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: 'やがて竜は敬意を込めるように頭を下げ、真紫の体毛を輝かせながら魔界の彼方へと消えていった...'
        }
    ],
    victoryTrophy: {
        name: '魔界竜の毛皮',
        description: '魔界の竜の美しく禍々しい漆黒の毛皮。顔を埋めたくなるほど柔らかい。'
    },
    defeatTrophy: {
        name: '魔界の甘美液',
        description: '魔界の竜の体内から採取した甘美な体液。至福の記憶が込められている。'
    },
    customVariables: {
        'lastSoulVacuumTurn': -100, // ソウルバキュームの最後の使用ターン
        'eatenTurnCount': 0, // 食べられ状態のターン数
        'arrayStomachPatterns': [], // 食べられ状態のパターンを格納する配列
        'indexStomachPattern': 0, // 現在の胃袋体験のインデックス
        'stomachPattern': 0, // 現在の胃袋体験のパターン (0-3)
        'turnsInStomach': 0, // 胃袋にいるターン数
        'stomachMiddleList': [], // 中間メッセージリスト
        'regurgitationProgress': 0 // 吐き戻し演出進行度
    },

    // 簡略化されたAI戦略
    aiStrategy: (boss: Boss, player: Player, turn: number): BossAction => {
        // プレイヤーが敗北状態の場合
        if (player.isDefeated()) {
            return selectDefeatedAction(boss);
        }

        // プレイヤーが食べられ状態の場合
        if (player.isEaten()) {
            const eatenAction = selectEatenAction(boss, player, turn);
            if (eatenAction) return eatenAction;
        }

        // ソウルバキューム特殊技の優先判定
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
                boss.setCustomVariable('eatenTurnCount', 0);
                return swallowAction;
            }
        }

        // プレイヤーが拘束中の場合
        if (player.isRestrained()) {
            const restraintActions = demonDragonActions.filter(action =>
                action.playerStateCondition === 'restrained'
            );
            return selectWeightedAction(restraintActions);
        }
        
        // 拘束ではない状態でKO状態のプレイヤーがいる場合、拘束攻撃を優先
        if (player.isKnockedOut()) {
            const restraintAction = demonDragonActions.find(action =>
                action.id === 'tail-restraint' &&
                action.canUse && action.canUse(boss, player, turn)
            );
            if (restraintAction) {
                return restraintAction;
            }
        }

        // 通常状態の行動選択
        const normalActions = demonDragonActions.filter(action =>
            action.playerStateCondition === 'normal' &&
            (!action.canUse || action.canUse(boss, player, turn))
        );

        // HP50%以下で拘束攻撃の重みを上げる
        if (boss.hp / boss.maxHp <= 0.5) {
            const restraintAction = normalActions.find(action => action.id === 'tail-restraint');
            if (restraintAction) {
                return Math.random() < 0.4 ? restraintAction : selectWeightedAction(normalActions);
            }
        }

        return selectWeightedAction(normalActions);
    }
};

// ヘルパー関数: 重み付きランダム選択
function selectWeightedAction(actions: BossAction[]): BossAction {
    if (actions.length === 0) return demonDragonActions[0];

    const totalWeight = actions.reduce((sum, action) => sum + action.weight, 0);
    let random = Math.random() * totalWeight;

    for (const action of actions) {
        random -= action.weight;
        if (random <= 0) return action;
    }

    return actions[0];
}