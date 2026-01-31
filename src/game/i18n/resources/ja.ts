import { bossTranslations } from '../bosses';

const ja = {
    errors: {
        unknown: {
            title: '不明なエラー',
            message: '不明なエラーが発生しました'
        },
        bossLoadFailed: {
            title: 'ボス読み込み失敗',
            message: 'ボスデータの読み込みに失敗しました: {{error}}'
        }
    },
    common: {
        unknown: '不明',
        hp: 'ヘルス',
        mp: 'マナ',
        attack: '攻撃力',
        escapePower: '拘束脱出力',
        weapon: '武器',
        armor: '防具',
        gloves: '手袋',
        belt: 'ベルト',
        levelShort: 'Lv.',
        expLabel: '経験値',
        expShort: 'EXP',
        back: '戻る',
        close: '閉じる',
        apply: '適用',
        edit: '編集',
        add: '追加',
        change: '変更',
        hpShort: 'HP',
        mpShort: 'MP',
        maxHp: '最大HP',
        maxMp: '最大MP',
        player: 'プレイヤー',
        boss: 'ボス',
        statusEffects: 'ステータス効果',
        customVariables: 'カスタム変数',
    },
    navigation: {
        bossSelect: '⚔️ ボス選択',
        playerDetail: '👤 プレイヤー詳細',
        explorationRecord: '📊 探検記録',
        library: '📚 資料庫',
        option: '⚙️ オプション',
        changelog: '📋 更新履歴'
    },
    bossSelect: {
        title: '討伐対象を選択....',
        selectButton: '選択',
        unlockRequirement: '🔒️ エクスプローラーLv.{{level}}で解禁',
        status: {
            victory: '勝利済み',
            defeat: '敗北済み'
        }
    },
    bossModal: {
        questTitle: '討伐クエスト内容',
        appearanceLabel: '特徴',
        guest: {
            fallbackName: 'ゲストキャラクター',
            createdBy: '{{name}} 作者: {{creator}}'
        },
        buttons: {
            cancel: 'キャンセル',
            confirm: '戦闘開始！',
            back: '戻る'
        }
    },
    options: {
        playerInfo: 'プレイヤー情報',
        dataManagement: 'データ管理',
        gameSettings: 'ゲーム設定',
        player: {
            name: '名前',
            explorerLevel: 'エクスプローラーLv',
            defeatedBossCount: '撃破済みボス数',
            saveData: 'セーブデータ'
        },
        saveDataStatus: {
            exists: '存在',
            none: 'なし'
        },
        data: {
            exportTitle: '📤 データエクスポート',
            exportDescription: 'セーブデータをファイルとして保存します',
            exportButton: 'エクスポート',
            importTitle: '📥 データインポート',
            importDescription: 'セーブデータをファイルから読み込みます',
            importButton: 'インポート',
            deleteTitle: '🗑️ データ削除',
            deleteDescription: '全てのセーブデータを削除します',
            deleteButton: '削除'
        },
        language: {
            label: '表示言語',
            help: 'ゲーム内テキストの表示言語を切り替えます。',
            ja: '日本語',
            en: 'English'
        },
        debug: {
            label: 'デバッグモード',
            description: 'デバッグ機能を有効にします（開発者向け）',
            toast: {
                title: 'デバッグモード',
                message: 'デバッグモードを{{state}}にしました'
            },
            state: {
                enabled: '有効',
                disabled: '無効'
            },
            reloadConfirm: {
                title: '設定反映',
                message: '設定を反映するためにページをリロードしますか？'
            }
        }
    },
    dialogs: {
        common: {
            ok: 'OK',
            cancel: 'キャンセル',
            select: '選択',
            selectTitle: '選択',
            alert: {
                title: '通知',
                message: '通知メッセージ'
            },
            confirm: {
                title: '確認',
                message: '確認メッセージ'
            },
            prompt: {
                title: '入力',
                placeholder: '入力してください'
            }
        },
        deleteConfirm: {
            title: 'セーブデータ削除確認',
            message: '全てのセーブデータを削除しますか？この操作は取り消せません。'
        },
        customVar: {
            title: 'カスタム変数を追加',
            keyLabel: '変数名',
            keyPlaceholder: '変数名を入力してください',
            valueLabel: '値',
            valuePlaceholder: '値を入力してください',
            helper: '数値やtrue/falseは自動的に変換されます',
            errors: {
                missingKey: '変数名を入力してください',
                missingValue: '値を入力してください'
            }
        },
        statusEffect: {
            title: '{{target}}のステータス効果を追加',
            titleDefault: 'ステータス効果を追加',
            typeLabel: 'ステータス効果',
            durationLabel: '持続ターン数',
            errors: {
                invalidDuration: '有効なターン数を入力してください（1以上）',
                maxDuration: 'ターン数は99以下で入力してください'
            }
        }
    },
    toasts: {
        importSuccess: {
            title: 'インポート完了',
            message: 'セーブデータのインポートが完了しました'
        },
        importFailure: {
            title: 'インポート失敗',
            message: 'セーブデータのインポートに失敗しました'
        },
        exportSuccess: {
            title: 'エクスポート完了',
            message: 'セーブデータをエクスポートしました'
        },
        exportFailure: {
            title: 'エクスポート失敗',
            message: 'セーブデータのエクスポートに失敗しました'
        },
        deleteSuccess: {
            title: '削除完了',
            message: 'セーブデータを削除しました'
        },
        deleteFailure: {
            title: '削除失敗',
            message: 'セーブデータの削除に失敗しました'
        },
        types: {
            success: '成功',
            error: 'エラー',
            warning: '警告',
            info: '情報'
        }
    },
    titleScreen: {
        warningTitle: '⚠️ 注意事項',
        warningItemPredation: '捕食や丸呑み表現が含まれます',
        startButton: '🎮 ゲームスタート'
    },
    battle: {
        actionTitle: '行動選択',
        logTitle: 'バトルログ',
        logStart: 'バトル開始！',
        backToBossSelect: '← ボス選択に戻る',
        endBattle: '🎯 バトル終了',
        bossInfoTitle: 'ボス情報を表示',
        statusEffectRemaining: '{{description}} (残り{{duration}}ターン)',
        statusEffectDuration: '{{name}} ({{duration}}ターン)',
        roundLabel: 'ラウンド {{round}}',
        messages: {
            startFallback: '{{boss}}が現れた！',
            victoryFallback: '{{boss}}を倒した！'
        }
    },
    battleActions: {
        attack: '⚔️ 攻撃',
        defend: '🛡️ 防御',
        skill: '⚡️ スキル',
        item: '👜 アイテム'
    },
    skillPanel: {
        powerAttack: '💥 パワーアタック',
        powerAttackCost: '(20MP)',
        powerAttackHint: '2.5倍の攻撃力で確実に攻撃（20MP）',
        heal: '✨ ヒール',
        healCost: '(30MP)',
        healHint: 'HPを100回復（30MP）',
        struggle: '🔥 あばれる',
        struggleCost: '(30MP)',
        struggleHint: '脱出確率2倍（30MP）',
        ultraSmash: '💀 ウルトラスマッシュ',
        ultraSmashCost: '(MP全消費)',
        ultraSmashHint: '全力攻撃',
        back: '戻る'
    },
    specialActions: {
        struggle: '💪 もがく',
        struggleHint: '拘束から脱出を試みる（成功率は試行回数で上昇）',
        struggleSkill: '🔥 あばれる',
        struggleSkillCost: '(30MP)',
        struggleSkillHint: '脱出確率2倍（30MP）',
        stayStill: '😌 じっとする',
        stayStillHint: '体力を回復する（最大HPの5%）',
        giveUp: '💀 なすがまま',
        giveUpHint: '何もしない',
        omamori: '🛡️ おまもり',
        omamoriHint: '特殊状態を解除し、HPを満回復する'
    },
    battleResult: {
        title: 'バトル結果',
        continue: 'ボス選択に戻る',
        experienceTitle: '獲得経験値',
        levelUpTitle: 'レベルアップ！',
        newUnlocksTitle: '新しいアンロック！',
        newUnlockMessage: '🔓️ {{name}} が利用可能になりました！',
        trophiesTitle: '🏆 獲得記念品',
        explorerLabel: '🗺️ エクスプローラー',
        newBossUnlocksTitle: '🔓️ 新ボス解禁',
        newBossUnlockMessage: '🌟 {{boss}} が解禁されました！',
        levelUpBanner: '🎉 {{ability}} レベルアップ！',
        levelUpRange: 'Lv.{{previous}} → Lv.{{next}}',
        experienceGain: '+{{exp}} EXP'
    },
    playerDetail: {
        titleSuffix: ' - 詳細ステータス',
        editButton: '✏️ 編集',
        tabs: {
            stats: 'ステータス',
            equipment: '装備',
            skills: 'スキル',
            items: 'アイテム'
        }
    },
    playerStats: {
        baseStats: '基本ステータス',
        equipmentEffects: '装備効果',
        abilities: 'アビリティ',
        debugAbilityTitle: '🔧 デバッグ機能 - アビリティレベル変更',
        bulkTitle: '📊 一括設定',
        bulkChange: '全て変更',
        toasts: {
            invalidLevel: {
                title: '無効な値',
                message: 'レベルは0から{{maxLevel}}の間で設定してください'
            },
            bulkChangeSuccess: {
                title: 'デバッグ機能',
                message: '全てのアビリティを レベル {{level}} に変更しました'
            },
            bulkChangeFailure: {
                title: 'エラー',
                message: '一括レベル変更に失敗しました'
            },
            unknownAbility: {
                title: 'エラー',
                message: '不明なアビリティ: {{ability}}'
            },
            changeSuccess: {
                title: 'デバッグ機能',
                message: '{{ability}} を レベル {{level}} に変更しました'
            },
            changeFailure: {
                title: 'エラー',
                message: '{{ability}} のレベル変更に失敗しました'
            }
        }
    },
    playerEquipment: {
        equipBest: '最強装備',
        unequipAll: 'すべて外す',
        toasts: {
            equipBestSuccess: {
                title: '最強装備',
                message: '最強装備に変更しました'
            },
            equipBestFailure: {
                title: '最強装備',
                message: '装備変更に失敗しました'
            },
            unequipAllSuccess: {
                title: '装備外し',
                message: 'すべての装備を外しました'
            },
            unequipAllFailure: {
                title: '装備外し',
                message: '装備変更に失敗しました'
            }
        }
    },
    playerSkills: {
        activeTitle: 'アクティブスキル',
        passiveTitle: 'パッシブスキル'
    },
    playerItems: {
        title: '所持アイテム'
    },
    explorer: {
        progressTitle: '🎯 ゲーム進行度',
        explorerTitle: '🗺️ エクスプローラー',
        statsTitle: '📊 探検統計',
        unlockedBosses: 'アンロック済みボス',
        trophiesCollected: '獲得記念品',
        totalExplorerExp: '探検経験値総計',
        terrainTitle: '🗺️ 探検可能な地形',
        currentTerrainsTitle: '🌍 現在アクセス可能な地形',
        terrainHint: 'エクスプローラーレベルを上げることで、より遠くの未知の地形に足を踏み入れることができます。',
        trophyCollectionTitle: '🏆 記念品コレクション',
        noTrophiesLine1: 'まだ記念品を獲得していません。',
        noTrophiesLine2: 'ボスとの戦闘で勝利や敗北を経験して記念品を集めましょう！',
        toasts: {
            progressUpdateFailure: {
                title: 'エラー',
                message: '進行度表示の更新に失敗しました'
            }
        }
    },
    equipment: {
        weapons: {
            'bare-hands': {
                name: '素手',
                description: '生身の拳で戦う'
            },
            slingshot: {
                name: 'パチンコ',
                description: '小石を飛ばす簡易武器'
            },
            'wooden-bow': {
                name: '木の弓矢',
                description: '木製の弓と矢'
            },
            shuriken: {
                name: '手裏剣',
                description: '忍者ごっこ用の投げ武器'
            },
            'compound-bow': {
                name: 'コンパウンドボウ',
                description: '現代的な複合弓'
            },
            'repeater-bow': {
                name: 'リピーターボウ',
                description: '機械式連射弓'
            },
            'submachine-gun': {
                name: 'サブマシンガン',
                description: '連射可能な自動火器'
            },
            'assault-rifle': {
                name: 'アサルトライフル',
                description: '高性能自動銃'
            },
            'laser-rifle': {
                name: 'レーザーライフル',
                description: '未来的なエネルギー兵器'
            },
            'plasma-cannon': {
                name: 'プラズマキャノン',
                description: 'プラズマ弾を発射するエネルギー砲'
            },
            'super-blaster': {
                name: 'スーパーブラスター',
                description: '究極の破壊兵器'
            }
        },
        armors: {
            naked: {
                name: 'はだか',
                description: '何も装備していない'
            },
            't-shirt': {
                name: 'Tシャツ',
                description: '普通のTシャツ'
            },
            'travel-gear': {
                name: '旅装',
                description: '旅行用の服装'
            },
            'work-clothes': {
                name: '作業服',
                description: '作業用の服装'
            },
            'adventurer-clothes': {
                name: '冒険者の服',
                description: '冒険に適した丈夫な服'
            },
            'protective-jacket': {
                name: '汎用防護ジャケット',
                description: '戦闘向けの防護服'
            },
            'military-jacket': {
                name: '軍用ジャケット',
                description: '軍事用の防護服'
            },
            'reinforced-suit': {
                name: '強化スーツ',
                description: '強化防護具'
            },
            'future-suit': {
                name: '近未来スーツ',
                description: '高性能な防護スーツ'
            },
            'powered-armor': {
                name: 'パワーアーマー',
                description: '動力付き防護装備'
            },
            'super-armor': {
                name: '超合金アーマー',
                description: '最強の防護装備'
            }
        },
        gloves: {
            'bare-hands-gloves': {
                name: '素手',
                description: '何も装備していない'
            },
            'cloth-gloves': {
                name: '布の手袋',
                description: '薄い布でできた手袋'
            },
            'work-gloves': {
                name: '作業用手袋',
                description: '作業用の丈夫な手袋'
            },
            'grip-gloves': {
                name: 'グリップ手袋',
                description: 'グリップ力を高める手袋'
            },
            'climbing-gloves': {
                name: 'クライミング手袋',
                description: '岩登り用の専用手袋'
            },
            'tactical-gloves': {
                name: 'タクティカル手袋',
                description: '戦術用の高性能手袋'
            },
            'spider-gloves': {
                name: 'スパイダー手袋',
                description: 'クモの糸のような粘着力'
            },
            'gecko-gloves': {
                name: 'ゲッコー手袋',
                description: 'ヤモリの足のような吸着力'
            },
            'reinforced-gloves': {
                name: '強化手袋',
                description: '掴んだものは外さないハイテク手袋'
            },
            'nano-gloves': {
                name: 'ナノテク手袋',
                description: 'ナノテクノロジー製のハイテク手袋'
            },
            'ultimate-grip': {
                name: 'アルティメットグリップ',
                description: '究極のグリップ力を持つ最強の手袋'
            }
        },
        belts: {
            'no-belt': {
                name: 'ベルトなし',
                description: '何も装備していない'
            },
            'simple-belt': {
                name: '普通のベルト',
                description: '日常用のシンプルなベルト'
            },
            'sport-belt': {
                name: 'スポーツベルト',
                description: '運動時のサポートベルト'
            },
            'training-belt': {
                name: 'トレーニングベルト',
                description: '筋力トレーニング用ベルト'
            },
            'weight-belt': {
                name: 'ウェイトベルト',
                description: '重量挙げ用の強化ベルト'
            },
            'martial-belt': {
                name: '武道ベルト',
                description: '武術修行用のベルト'
            },
            'stamina-belt': {
                name: 'スタミナベルト',
                description: '持久力を高める特殊ベルト'
            },
            'energy-belt': {
                name: 'エネルギーベルト',
                description: 'エネルギー循環を促進するベルト'
            },
            'vitality-belt': {
                name: 'バイタリティベルト',
                description: '生命力を増強するベルト'
            },
            'power-belt': {
                name: 'パワーベルト',
                description: '内なる力を引き出すベルト'
            },
            'infinity-belt': {
                name: 'インフィニティベルト',
                description: '無限のマナを与える最強のベルト'
            }
        }
    },
    items: {
        'heal-potion': {
            name: '回復薬',
            description: 'ヘルスを80%回復し、状態異常を解除する'
        },
        'energy-drink': {
            name: '元気ドリンク',
            description: '3ターンの間、マナが常に満タンになる'
        },
        'adrenaline': {
            name: 'アドレナリン注射',
            description: '3ターンの間、無敵になる'
        },
        'elixir': {
            name: 'エリクサー',
            description: 'ヘルスを100%回復し、状態異常を解除する。3ターンの間、マナが常に満タンになる'
        },
        'omamori': {
            name: 'おまもり',
            description: '行動不能・拘束・食べられ状態にのみ使える。ヘルスを100%回復し、行動不能・拘束・食べられ状態を解除、状態異常も解除する'
        }
    },
    library: {
        title: '📚 資料庫',
        availableDocuments: '利用可能な資料',
        documentContent: '資料内容',
        selectPrompt: '左から資料を選択してください',
        unread: '未読',
        lockedTitle: '？？？？？',
        unlockRequirement: {
            lockedPrefix: '🔒️',
            explorerLevel: 'エクスプローラー Lv. {{level}}',
            bossDefeats: '{{bosses}}',
            bossLosses: '{{bosses}}',
            separator: ', '
        },
        requirements: {
            defeat: '{{boss}}敗北',
            victory: '{{boss}}撃破',
            defeatLabel: '敗北',
            victoryLabel: '撃破',
            unknownBoss: '{{bossId}}{{type}}(データ不明)'
        }
    },
    explorationRecord: {
        title: '📊 探検記録'
    },
    changelog: {
        title: '📋 更新履歴',
        loadingSpinner: 'Loading...',
        loadingTitle: '更新履歴を読み込み中...',
        loadingMessage: 'しばらくお待ちください'
    },
    footer: {
        feedback: '感想を送る',
        bossRequest: '新ボスリクエスト',
        github: 'GitHub'
    },
    playerInfoEdit: {
        title: 'プレイヤー情報編集',
        nameLabel: '名前（32文字まで）',
        namePlaceholder: 'プレイヤー名を入力',
        currentName: '現在の名前',
        iconLabel: 'アイコン選択',
        currentIcon: '現在のアイコン',
        selectedIcon: '選択中のアイコン',
        iconCategories: {
            animal: '動物',
            fantasy: 'ファンタジー',
            nature: '自然',
            weapon: '武器',
            element: 'エレメント'
        },
        reset: '🔄 リセット',
        save: '保存',
        validation: {
            title: '名前変更エラー',
            missingName: '名前を入力してください',
            maxLength: '名前は32文字以内で入力してください'
        },
        changedItems: {
            name: '名前',
            icon: 'アイコン'
        },
        changeJoiner: 'と',
        changeMessage: '{{items}}を変更しました',
        noChanges: '変更はありませんでした',
        updateTitle: 'プレイヤー情報更新',
        resetToast: {
            title: 'プレイヤー情報リセット',
            message: 'プレイヤー情報を初期状態にリセットしました'
        }
    },
    debug: {
        title: '🔧 デバッグコンソール',
        button: '🔧 デバッグ',
        playerTitle: '🐍 プレイヤー',
        addStatusEffect: 'ステータス効果を追加',
        addCustomVar: '変数を追加',
        applyChanges: '✅ 変更を適用',
        toasts: {
            applySuccess: {
                title: 'デバッグ変更',
                message: '変更が適用されました！'
            },
            applyFailure: {
                title: 'デバッグ変更',
                message: '変更の適用中にエラーが発生しました'
            }
        }
    },
    skills: {
        mpCost: 'MP: {{cost}}',
        passiveBadge: 'パッシブ',
        unlockConditionsLabel: '解放条件',
        unlockConditionItem: '{{ability}}レベル {{level}}',
        categories: {
            combat: '攻撃',
            defense: '防御',
            support: '支援',
            passive: 'パッシブ',
            other: 'その他'
        },
        details: {
            damageMultiplier: '威力: {{value}}倍',
            criticalRate: 'クリティカル率: {{value}}%',
            hitRate: '命中率: {{value}}%',
            healAmount: '回復量: {{value}}',
            healPercentage: '回復率: {{value}}%'
        },
        empty: {
            default: '解放されたスキルがありません',
            active: '解放されたアクティブスキルがありません',
            passive: '解放されたパッシブスキルがありません'
        },
        info: {
            name: '名前: {{name}}',
            description: '説明: {{description}}',
            category: 'カテゴリ: {{category}}',
            mpCost: 'MP消費: {{cost}}'
        }
    },
    abilities: {
        names: {
            combat: 'コンバット',
            toughness: 'タフネス',
            craftwork: 'クラフトワーク',
            endurance: 'エンデュランス',
            agility: 'アジリティ',
            explorer: 'エクスプローラー'
        },
        labels: {
            combat: '⚔️ コンバット',
            toughness: '🛡️ タフネス',
            craftwork: '🔧 クラフトワーク',
            endurance: '💪 エンデュランス',
            agility: '🏃 アジリティ',
            explorer: '🗺️ エクスプローラー'
        },
        descriptions: {
            combat: '新しい武器と攻撃スキルをアンロックします。ボスにダメージを与えると経験値が貯まります。',
            toughness: '新しい防具と防衛スキルをアンロックします。ヘルスが減ると経験値が貯まります。',
            craftwork: 'アイテムの所持数が増加し、新しいアイテムをアンロックします。アイテムを使用するたびに経験値が貯まります。',
            endurance: '最大マナが増加します。マナを消費するたびに経験値が貯まります。',
            agility: '拘束状態から脱出しやすくなります。拘束から脱出を試みるたびに経験値が貯まります。',
            explorer: '探検できる範囲が広がり、新しいボスをアンロックします。記念品を獲得したり、ボスからスキルを受けたりするたびに経験値が貯まります。'
        }
    },
    bosses: bossTranslations.ja
};

export default ja;
