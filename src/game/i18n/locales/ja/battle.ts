export const battle = {
    actions: {
        attack: '⚔️ 攻撃',
        defend: '🛡️ 防御',
        skill: '⚡ スキル',
        item: '💊 アイテム'
    },
    info: {
        hpLabel: 'ヘルス',
        mpLabel: 'マナ',
        bossInfoTitle: 'ボス情報を表示'
    },
    buttons: {
        backToSelect: '← ボス選択に戻る',
        back: '戻る',
        endBattle: '🎯 バトル終了'
    },
    log: {
        battleStart: 'バトル開始！',
        roundLabel: 'ラウンド {{round}}'
    },
    items: {
        healPotion: '💊 回復薬',
        healPotionTitle: 'ヘルスを80%回復し、状態異常を解除する',
        adrenaline: '💉 アドレナリン注射',
        adrenalineTitle: '3ターンの間、無敵になる',
        energyDrink: '⚡ 元気ドリンク',
        energyDrinkTitle: '3ターンの間、MPが常に満タンになる',
        back: '戻る'
    },
    skills: {
        powerAttack: '💥 パワーアタック',
        powerAttackTitle: '2.5倍の攻撃力で確実に攻撃（20MP）',
        healSkill: '✨ ヒール',
        healSkillTitle: 'HPを100回復（30MP）',
        struggleSkill: '🔥 あばれる (30MP)',
        struggleSkillTitle: '拘束状態専用：脱出確率2倍（30MP）',
        ultraSmash: '💀 ウルトラスマッシュ',
        ultraSmashTitle: '全力攻撃',
        back: '戻る'
    },
    specialActions: {
        struggle: '💪 もがく',
        struggleTitle: '拘束から脱出を試みる（成功率は試行回数で上昇）',
        struggleSkill: '🔥 あばれる (30MP)',
        struggleSkillTitle: '拘束状態専用：脱出確率2倍（30MP）',
        stayStill: '😌 じっとする',
        stayStillTitle: '体力を回復する（最大HPの5%）',
        giveUp: '💀 なすがまま',
        giveUpTitle: '何もしない'
    },
    result: {
        experienceTitle: '獲得経験値',
        levelUpTitle: 'レベルアップ！',
        levelUpLine: '🎉 {{ability}} レベルアップ！',
        newUnlocksTitle: '新しいアンロック！',
        newUnlockItem: '🔓 {{name}} が利用可能になりました！',
        trophiesTitle: '🏆 獲得記念品',
        trophyExplorerLabel: '🗺️ エクスプローラー',
        newBossUnlocksTitle: '🔓 新ボス解禁',
        newBossUnlockLine: '🌟 {{name}} が解禁されました！'
    },
    messages: {
        bossAppeared: '{{bossName}}が現れた！',
        bossDefeated: '{{bossName}}を倒した！',
        actionUnknown: '{{bossName}}の行動が理解できない...',
        actionDefault: '{{bossName}}の{{actionName}}！',
        attackMiss: 'しかし、攻撃は外れた！',
        criticalHit: '痛恨の一撃！ {{playerName}}に{{damage}}のダメージ！',
        normalHit: '{{playerName}}に{{damage}}のダメージ！',
        playerDodged: '{{playerName}}は攻撃を華麗に回避した！',
        playerRestrained: '{{playerName}}は拘束された！',
        playerCocooned: '{{playerName}}が繭状態になった！',
        playerEaten: '{{playerName}}が食べられてしまった！',
        playerMaxHpReduced: '{{playerName}}の最大HPが{{amount}}減少した！',
        bossHealed: '{{bossName}}は{{amount}}HP回復した！',
        bossMaxHpIncreased: '{{bossName}}の最大HPが{{amount}}増加した！',
        playerMaxHpAbsorbed: '{{playerName}}の最大HPが{{amount}}奪われた！',
        playerMpDrained: '{{playerName}}のMPが{{amount}}奪われた！',
        bossCannotAct: '{{bossName}}は行動できない...',
        statusNotApplied: '{{playerName}}は{{statusName}}状態にならなかった。',
        bossStatusMessagePrefix: '{{bossName}}の{{message}}',
        defaultDialogueBattleStart: '戦闘開始だ！',
        defaultDialogueVictory: '勝利した...',
        defaultDialogueDefeat: '敗北した...',
        stunnedSkipName: '行動不能',
        stunnedSkipDescription: '反動で動けない...'
    }
};
