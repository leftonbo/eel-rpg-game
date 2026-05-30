# i18n resources 配置ルール

`ja.ts` / `en.ts` は集約専用ファイルです。

- 各トップレベルカテゴリは `src/game/i18n/resources/<lang>/<category>.ts` に1ファイルで配置する
- キー名とファイル名は一致させる（例: `battle` -> `battle.ts`）
- カテゴリを追加する場合は、`ja/<category>.ts` と `en/<category>.ts` を同時に追加し、`ja.ts` / `en.ts` の import と集約オブジェクトへ登録する
- `bosses` は `bossTranslations.<lang>` を `ja.ts` / `en.ts` で注入し、各カテゴリファイルには切り出さない
