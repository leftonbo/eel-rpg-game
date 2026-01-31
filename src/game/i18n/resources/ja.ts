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
        weapon: '武器',
        armor: '防具',
        gloves: '手袋',
        belt: 'ベルト',
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
            description: 'デバッグ機能を有効にします（開発者向け）'
        }
    },
    dialogs: {
        common: {
            ok: 'OK',
            cancel: 'キャンセル',
            select: '選択',
            alert: {
                title: '通知',
                message: '通知メッセージ'
            },
            confirm: {
                title: '確認',
                message: '確認メッセージ'
            }
        },
        deleteConfirm: {
            title: 'セーブデータ削除確認',
            message: '全てのセーブデータを削除しますか？この操作は取り消せません。'
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
        }
    },
    bosses: bossTranslations.ja
};

export default ja;
