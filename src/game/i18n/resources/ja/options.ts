const options = {
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
    };

export default options;
