---
name: GitHub PR Auto Generate
description: "Use when generating GitHub pull request descriptions."
---

# GitHub PR 自動生成ルール

- GitHub PR の説明文を生成するときは、必ず `docs/rules/pull-request.md` の形式と要件に従う。
- 出力は日本語で記述する。
- 見出しは `## 概要`、`## 変更内容`、`## 影響範囲`、`## テスト項目`、`## 関連Issue` を基本とする。
- `## 変更内容` は箇条書きで、変更したファイルや機能を具体的に書く。
- `## 影響範囲` では、既存機能、UI/UX、データ互換性、パフォーマンスへの影響を必要に応じて明記する。
- `## テスト項目` には、確認した動作と `npm run typecheck`、`npm run test`、`npm run build` の実施状況を含める。
- 変更内容から分かる事実だけを書く。未確認の動作は断定しない。
- 破壊的変更、セーブデータ互換性、外部挙動の変化がある場合は、影響範囲で必ず説明する。
- ボス追加、ゲーム内文書、戦闘ロジック、UI 変更など、このプロジェクト固有の変更は `docs/rules/pull-request.md` の該当ガイドラインに合わせて具体化する。
