# Reference Bosses

新ボスのコンセプトに近い既存ボスを選び、構造・AI・状態異常・フレーバーの温度感をなぞる。

## 目的別の参照先

| 求める特徴 | 参考ファイル |
| --- | --- |
| シンプルな初期ボス | `src/game/data/bosses/swamp-dragon.ts` |
| 状態異常特化 | `src/game/data/bosses/dark-ghost.ts` |
| 拘束・繭システム | `src/game/data/bosses/mech-spider.ts` |
| 現代的な AI 戦略、`PostDefeatedAttack`、自動とどめ | `src/game/data/bosses/sea-kraken.ts` |
| `customVariables` による特殊技管理、`onUse` 活用 | `src/game/data/bosses/aqua-serpent.ts` |
| 新しい状態異常システム | `src/game/data/bosses/clean-master.ts` |
| 多様な状態異常、複雑な行動パターン | `src/game/data/bosses/dream-demon.ts` |
| `FinishingMove` アクション、給餌システム | `src/game/data/bosses/bat-vampire.ts` |
| 記念品システム、地下型拘束 | `src/game/data/bosses/underground-worm.ts` |
| 高 HP、`suppressAutoFinishingMove` | `src/game/data/bosses/seraph-mascot.ts` |
| フェーズ切替、二面性 | `src/game/data/bosses/dual-jester.ts` |
| 最高難易度、敗北後 8 ターン毎イベント | `src/game/data/bosses/demon-dragon.ts` |
| `FinishingMove` による永続状態遷移 | `src/game/data/bosses/slime-dragon.ts` |
| `PostDefeatedAttack` と `FinishingMove` の両用 | `src/game/data/bosses/tongue-dragon.ts` |
| 非戦闘的 AI、機械系ギミック | `src/game/data/bosses/thermal-archiver.ts` |
| ふわふわ・睡眠系 | `src/game/data/bosses/fluffy-dragon.ts` |
| 毒・麻酔・運搬系 | `src/game/data/bosses/scorpion-carrier.ts` |
| ぬいぐるみ・リボン・感覚過負荷系 | `src/game/data/bosses/yumewata-mellow.ts` |
| 多脚・粘液・毒のシンプル複合 | `src/game/data/bosses/otherworld-centipede.ts` |

## 参照時の見方

- まず `actions` 配列を見る。どの `playerStateCondition` に行動を置いているか確認する。
- 次に `aiStrategy` を見る。敗北後、体内、戦闘不能、通常の分岐順を確認する。
- 状態異常を使うボスでは、対応する `src/game/systems/status-effects/*-effects.ts` も確認する。
- i18n 対応済みボスでは `src/game/i18n/bosses/{boss-id}.ts` の翻訳キーも確認する。
- 数値は `npm run boss-overview` で最新一覧を見る。参照表だけでバランスを決めない。

## システム参照

- `src/game/entities/Boss.ts`: `BossData`、`BossAction`、行動実行処理。
- `src/game/entities/Player.ts`: プレイヤー状態判定。
- `src/game/systems/StatusEffectTypes.ts`: 状態異常 enum と config 型。
- `src/game/systems/status-effects/`: 状態異常設定。
- `src/game/data/index.ts`: ボスデータの glob import と i18n 適用。
- `src/game/i18n/bosses/`: ボス翻訳。
- `scripts/boss-overview.ts`: ボス一覧比較コマンド。
