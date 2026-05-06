---
name: adding-game-document
description: Adds or updates in-game library documents for the eel-rpg-game project. Use when the user asks to create story documents, lore, diary entries, strategy notes, character notes, Markdown documents under src/game/data/documents/, or configure document unlock conditions.
---

# ゲーム内文書追加 Skill

ゲーム内ライブラリに表示する Markdown 文書を追加・更新する際の手順をまとめる。

## 作業対象

- 文書本体: `src/game/data/documents/{id}.md`
- 読み込み処理: `src/game/data/DocumentLoader.ts`
- 表示 UI: `src/game/scenes/OutGameLibraryScene.ts` と関連テンプレート

`DocumentLoader.ts` が `src/game/data/documents/*.md` を glob import で読み込むため、通常は登録処理を追加しない。

## Frontmatter 形式

新規文書は以下の形を基本にする。`id` はファイル名 `{id}.md` と一致させる。

```markdown
---
id: document-unique-id
title: ドキュメントタイトル
type: default
requiredExplorerLevel: 1
requiredBossDefeats: ["boss-id"]
requiredBossLosses: ["boss-id"]
---

# ドキュメントタイトル

本文を Markdown で記述する。
```

## Frontmatter 項目

| 項目 | 必須 | 説明 |
|------|------|------|
| `id` | 必須 | 文書の一意識別子。ファイル名と一致させる |
| `title` | 必須 | ゲーム内ライブラリに表示するタイトル |
| `type` | 必須 | `diary` / `strategy` / `reflection` / `default` を基本にする |
| `requiredExplorerLevel` | 任意 | 表示に必要なエクスプローラーレベル |
| `requiredBossDefeats` | 任意 | 表示に必要な撃破済みボス ID 配列 |
| `requiredBossLosses` | 任意 | 表示に必要な敗北済みボス ID 配列 |

条件項目を省略した文書は、常に最初から表示される。複数条件を指定した場合は、すべてを満たしたプレイヤーにのみ表示される。条件間に優先順位はなく、`requiredExplorerLevel`・`requiredBossDefeats`・`requiredBossLosses` はすべて AND 条件として評価される。例: `requiredExplorerLevel: 5` と `requiredBossDefeats: ["boss-a"]` を両方指定した場合、レベル 5 以上かつ boss-a を撃破済みのプレイヤーだけに表示される。

## 実装ワークフロー

以下のチェックリストをコピーして進捗管理する:

```text
- [ ] 1. 文書の目的を確認する（世界観、攻略、日記、キャラクター資料など）
- [ ] 2. `id` と保存先 `src/game/data/documents/{id}.md` を決める（既存ファイルと重複する場合はユーザーに別の ID を求める）
- [ ] 3. 表示条件を決める（Explorer レベル、撃破条件、敗北条件）
- [ ] 4. frontmatter と本文を Markdown で作成する
- [ ] 5. 既存の文体やエルナル設定と矛盾しないか確認する
- [ ] 6. 必要に応じてライブラリ画面で表示を確認する
- [ ] 7. 品質チェックコマンドを実行する
```

## 文書作成の注意

- Markdown の見出しは、ゲーム内表示で読みやすい粒度にする。
- 外部リンクを入れる場合は、既存文書と同じく通常の Markdown リンクを使う。
- ボス固有の設定資料は `docs/bosses/{boss-id}.md` に置き、ゲーム内で読ませたい内容だけを `src/game/data/documents/` に追加する。
- エルナルの基本設定に関わる内容は `src/game/data/documents/character-elnal.md` と整合させる。
- 新しい `type` を増やす場合は、`LibraryDocumentMetadata` の型、表示 UI、既存文書との互換性を確認してから行う。

## 品質チェック

文書だけの変更でも、Markdown frontmatter の読み込みに影響するため最低限以下を実行する:

```bash
npm run typecheck
npm run test
npm run build
```

表示 UI や文書ローダーを変更した場合は `npm run lint` も実行する。
