const dialogs = {
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
    };

export default dialogs;
