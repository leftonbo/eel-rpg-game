# 地底のワーム実装計画

## ボス概要

**🪨 地底のワーム** (Underground Worm)
- **対象レベル**: レベル5（洞窟・地下世界）
- **HP**: 380
- **特徴**: 巨大な地虫、土と岩を食べる習性
- **新要素**: 新状態異常「石化」の実装

## 実装ステップ

### 1. 新状態異常「石化」の実装

#### StatusEffectType への追加
- `StatusEffectType.Petrified` を enum に追加

#### StatusEffectManager への設定追加
```typescript
configs.set(StatusEffectType.Petrified, {
    name: '石化',
    description: '石のように固まって動けない（2ターン行動不能）',
    cssClass: 'status-petrified',
    duration: 2,
    onApply: (target) => { /* 石化演出 */ },
    onTick: (target) => { /* 行動不能効果 */ },
    onRemove: (target) => { /* 石化解除演出 */ }
});
```

#### CSS スタイル追加
```css
.status-petrified {
    background-color: #8B7355;
    color: #fff;
}
```

### 2. ボスデータファイルの作成

#### src/game/data/bosses/underground-worm.ts
```typescript
import { BossData } from '../types/BossData';
import { ActionType } from '../../types/ActionType';
import { StatusEffectType } from '../../systems/StatusEffectManager';

export const undergroundWormData: BossData = {
    id: 'underground-worm',
    name: '地底のワーム',
    emoji: '🪨',
    hp: 380,
    attackPower: 12,
    description: '地底深くに住む巨大な虫。硬い岩も飲み込む強靭な顎を持つ。',
    flavorText: '地中から響く不気味な振動...',
    
    actions: [
        {
            type: ActionType.Attack,
            name: '地割れ',
            flavorText: '地面を割いて攻撃！',
            damage: 15
        },
        {
            type: ActionType.StatusAttack,
            name: '石化の息',
            flavorText: '石を溶かす息を吐いて敵を石化させる',
            statusEffect: StatusEffectType.Petrified
        },
        {
            type: ActionType.EatAttack,
            name: '丸呑み',
            flavorText: '巨大な口でプレイヤーを呑み込む！',
            damage: 10
        }
    ],
    
    devourActions: [
        {
            type: ActionType.DevourAttack,
            name: '砂利研磨',
            flavorText: '体内の砂利でプレイヤーを研磨する',
            damage: 18
        },
        {
            type: ActionType.DevourAttack,
            name: '消化液攻撃',
            flavorText: '強酸性の消化液で溶解攻撃',
            damage: 22
        },
        {
            type: ActionType.DevourStatusAttack,
            name: '石化消化',
            flavorText: '体内で石化させて消化を遅らせる',
            statusEffect: StatusEffectType.Petrified,
            damage: 12
        }
    ],
    
    aiStrategy: (boss, player) => {
        // HP が50%以下になったら積極的に丸呑みを狙う
        if (boss.hp <= boss.maxHp * 0.5) {
            if (!player.isBeingEaten && Math.random() < 0.6) {
                return boss.actions.find(a => a.type === ActionType.EatAttack);
            }
        }
        
        // プレイヤーが石化していない場合は石化攻撃を優先
        if (!player.statusEffects.has(StatusEffectType.Petrified) && Math.random() < 0.4) {
            return boss.actions.find(a => a.name === '石化の息');
        }
        
        // 通常攻撃
        return boss.actions.find(a => a.type === ActionType.Attack);
    }
};
```

### 3. データエクスポートの更新

#### src/game/data/index.ts への追加
```typescript
export { undergroundWormData } from './bosses/underground-worm';
```

#### bosses 配列への追加
```typescript
export const bosses: BossData[] = [
    // ... 既存のボス
    undergroundWormData,
];
```

### 4. UI の更新

#### src/index.html のボス選択画面に追加
レベル5の位置（クリーンマスターの前）にボスカードを追加:
```html
<!-- 地底のワーム (Level 5) -->
<div class="col-md-4 mb-3 boss-card" data-level="5">
    <div class="card h-100">
        <div class="card-body d-flex flex-column">
            <div class="d-flex align-items-center mb-3">
                <span class="boss-emoji me-2">🪨</span>
                <div>
                    <h5 class="card-title mb-1">地底のワーム</h5>
                    <small class="text-muted">Level 5 - 洞窟・地下世界</small>
                </div>
            </div>
            <p class="card-text">地底深くに住む巨大な虫。硬い岩も飲み込む強靭な顎を持つ。</p>
            <button class="btn btn-primary mt-auto" onclick="selectBoss('underground-worm')">戦闘開始</button>
        </div>
    </div>
</div>
```

### 5. テストとバランス調整

#### 戦闘テスト項目
- [ ] 石化状態異常が正常に動作するか
- [ ] 丸呑み攻撃の演出が適切に表示されるか
- [ ] AIが適切な行動選択をするか
- [ ] HP380は適切な難易度か（レベル5相当）
- [ ] 石化の持続時間（2ターン）は適切か

#### バランス調整観点
- 既存ボスとの難易度バランス（レベル4の蜜柑ドラゴン320HP、レベル6のクリーンマスター280HPとの関係）
- 石化状態異常の影響力（2ターン行動不能は強力すぎないか）
- 丸呑み攻撃の発動頻度とダメージバランス

### 6. 型チェックとビルドテスト

実装完了後に実行:
```bash
npm run typecheck
npm run build
npm run dev  # 動作確認
```

## 実装順序

1. **StatusEffectType への Petrified 追加** - 新状態異常の基盤
2. **StatusEffectManager の設定追加** - 石化効果の動作定義
3. **CSS スタイル追加** - UI表示対応
4. **ボスデータファイル作成** - メインのボス実装
5. **データエクスポート更新** - システムへの組み込み
6. **HTML UI 更新** - ボス選択画面への追加
7. **テストと調整** - 動作確認とバランス調整

## 想定される課題と対策

### 技術的課題
- **石化状態の行動制御**: プレイヤーが石化中に行動できないようにする実装
- **既存コードとの整合性**: StatusEffectManager の既存実装との適合

### ゲームバランス課題
- **石化の強さ**: 2ターン行動不能は強力すぎる可能性
- **HP設定**: 380HPが適切な難易度かの検証必要

### UI/UX課題
- **状態異常の視覚表現**: 石化状態が分かりやすく表示されるか
- **ボス選択画面の配置**: レベル順の適切な配置

---

*作成日: 2025年7月22日*
*対象: 地底のワーム実装*