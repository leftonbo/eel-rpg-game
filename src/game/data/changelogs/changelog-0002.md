---
index: 2
title: "更新履歴システムの改善 📋"
version: "1.0.1"
date: "2025-08-03"
type: "minor"
---

# v1.0.1 - 更新履歴システムの改善

更新履歴システムの大幅な改善を実施しました。

## 新機能
- ChangelogLoaderによる更新履歴の動的読み込み
- インデックスベースの更新履歴管理
- 未読更新履歴の自動検出機能

## 改善
- 更新履歴の表示方法を改善
- 新しい更新履歴がある場合の自動モーダル表示
- セーブデータにshownChangelogIndexフィールドを追加

## 技術的変更
- `src/game/data/changelogs/` に更新履歴ファイルを移動
- DocumentLoader パターンを使用した更新履歴読み込み
- FIXMEの解決：shouldShowChangelog() メソッドの実装完了