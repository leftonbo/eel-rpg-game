const playerInfoEdit = {
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
    };

export default playerInfoEdit;
