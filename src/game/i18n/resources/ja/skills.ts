const skills = {
        mpCost: 'MP: {{cost}}',
        passiveBadge: 'パッシブ',
        unlockConditionsLabel: '解放条件',
        unlockConditionItem: '{{ability}}レベル {{level}}',
        categories: {
            combat: '攻撃',
            defense: '防御',
            support: '支援',
            passive: 'パッシブ',
            other: 'その他'
        },
        details: {
            damageMultiplier: '威力: {{value}}倍',
            criticalRate: 'クリティカル率: {{value}}%',
            hitRate: '命中率: {{value}}%',
            healAmount: '回復量: {{value}}',
            healPercentage: '回復率: {{value}}%'
        },
        empty: {
            default: '解放されたスキルがありません',
            active: '解放されたアクティブスキルがありません',
            passive: '解放されたパッシブスキルがありません'
        },
        info: {
            name: '名前: {{name}}',
            description: '説明: {{description}}',
            category: 'カテゴリ: {{category}}',
            mpCost: 'MP消費: {{cost}}'
        }
    };

export default skills;
