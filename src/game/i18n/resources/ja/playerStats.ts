const playerStats = {
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
    };

export default playerStats;
