# Boss Data Contracts

ボスデータ実装時に参照する型・データ契約をまとめる。実装前に迷ったら、まず `src/game/entities/Boss.ts` と `src/game/systems/StatusEffectTypes.ts` の現行定義を確認する。

## BossData

`src/game/data/bosses/{boss-id}.ts` は `BossData` を export する。

必須フィールド:

- `id`: ボス ID。ファイル名 `{boss-id}.ts` と一致させる。
- `name`: 旧システム互換用の内部名称。表示には `displayName` を使う。現在は使用していない。
- `displayName`: ボス選択画面などで表示する名前。
- `icon`: ボスアイコン。
- `description`: 短い説明。
- `questNote`: ボス選択時のクエスト風テキスト。
- `maxHp`: 最大 HP。
- `attackPower`: 基礎攻撃力。
- `actions`: `BossAction[]`。

主要な任意フィールド:

- `appearanceNote`: 外観説明。
- `personality`: 性格・台詞の方向性。
- `aiStrategy`: 行動選択関数。
- `finishingMove`: 自動とどめ攻撃メッセージ。
- `suppressAutoFinishingMove`: 自動とどめ攻撃を抑制し、AI で `FinishingMove` を返す。
- `battleStartMessages`: 戦闘開始時の段階メッセージ。
- `victoryMessages`: プレイヤー勝利時の段階メッセージ。
- `customVariables`: AI 用のフラグ、ターン数、クールダウンなどの初期値。
- `explorerLevelRequired`: エクスプローラー解禁レベル。未指定時は 0。
- `victoryTrophy`: 勝利時記念品。
- `defeatTrophy`: 敗北時記念品。
- `guestCharacterInfo`: ゲストキャラクター情報。

## ActionType

既存の行動タイプ:

- `ActionType.Attack`: 通常攻撃。
- `ActionType.StatusAttack`: 状態異常攻撃。
- `ActionType.RestraintAttack`: 拘束攻撃。
- `ActionType.CocoonAttack`: 繭攻撃。
- `ActionType.CocoonAction`: 繭状態中の行動。
- `ActionType.EatAttack`: 食べる攻撃。
- `ActionType.DevourAttack`: 食べられた状態での体内攻撃。
- `ActionType.PostDefeatedAttack`: プレイヤー敗北後の行動。
- `ActionType.FinishingMove`: カスタムとどめ攻撃。
- `ActionType.Skip`: 行動スキップ。

## BossAction

必須フィールド:

- `id`: ボス内で一意なアクション ID。ログ、識別、i18n キーに使われる。
- `type`: `ActionType`。
- `name`: 行動名。
- `description`: 行動説明。
- `weight`: AI 選択重み。通常は 1 以上。

主要な任意フィールド:

- `messages`: 戦闘ログ。`{boss}` と `{player}` プレースホルダを使用できる。
- `damageFormula`: `(user: Boss) => number`。例: `(user) => user.attackPower * 1.5`。
- `statusEffect`: 付与する `StatusEffectType`。
- `statusDuration`: 状態異常の持続ターン。永続扱いは既存実装のパターンに合わせる。
- `statusChance`: 状態異常付与率。`0.0` から `1.0`。
- `hitRate`: 命中率。未指定時は既定値。
- `criticalRate`: クリティカル率。未指定時は既定値。
- `canUse`: 使用条件。状態、ターン、カスタム変数で制限する。
- `onPreUse`: 使用前に行動を差し替える。
- `onUse`: カスタム効果を実行し、追加メッセージを返す。
- `playerStateCondition`: AI 選択対象になるプレイヤー状態。
- `healRatio`: 与ダメージからの HP 吸収率。
- `damageVarianceMin` / `damageVarianceMax`: ダメージ揺らぎの範囲。

`playerStateCondition` は次のいずれか:

- `normal`
- `ko`
- `restrained`
- `cocoon`
- `eaten`
- `defeated`

行動が選択されない場合、まず `playerStateCondition`、`canUse`、`weight` を確認する。

## MessageData

`battleStartMessages` と `victoryMessages` は段階的なメッセージ進行に使う。

```typescript
{
    speaker?: 'player' | 'boss' | 'system';
    style?: 'default' | 'talk';
    text: string;
}
```

`getDialogue` は古い形式なので、新規ボスでは `messages`、`battleStartMessages`、`victoryMessages` を優先する。

## TrophyData

記念品は名前と説明だけを持つ。

```typescript
victoryTrophy: {
    name: 'ボスの外皮',
    description: '戦いの証として手に入れた、ボスの外側に由来する素材。'
},
defeatTrophy: {
    name: 'ボスの体液',
    description: '敗北時にボスの内側から持ち帰った、独特な性質を持つ素材。'
}
```

勝利記念品は外側由来、敗北記念品は内側由来にすると既存設計と揃う。
