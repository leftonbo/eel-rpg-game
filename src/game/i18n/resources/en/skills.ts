const skills = {
        mpCost: 'MP: {{cost}}',
        passiveBadge: 'Passive',
        unlockConditionsLabel: 'Unlock Conditions',
        unlockConditionItem: '{{ability}} Lv. {{level}}',
        categories: {
            combat: 'Offense',
            defense: 'Defense',
            support: 'Support',
            passive: 'Passive',
            other: 'Other'
        },
        details: {
            damageMultiplier: 'Power: {{value}}x',
            criticalRate: 'Critical: {{value}}%',
            hitRate: 'Accuracy: {{value}}%',
            healAmount: 'Heal: {{value}}',
            healPercentage: 'Heal: {{value}}%'
        },
        empty: {
            default: 'No unlocked skills',
            active: 'No unlocked active skills',
            passive: 'No unlocked passive skills'
        },
        info: {
            name: 'Name: {{name}}',
            description: 'Description: {{description}}',
            category: 'Category: {{category}}',
            mpCost: 'MP Cost: {{cost}}'
        }
    };

export default skills;
