const playerStats = {
        baseStats: 'Base Stats',
        equipmentEffects: 'Equipment Effects',
        abilities: 'Abilities',
        debugAbilityTitle: '🔧 Debug - Ability Levels',
        bulkTitle: '📊 Bulk Set',
        bulkChange: 'Apply All',
        toasts: {
            invalidLevel: {
                title: 'Invalid Value',
                message: 'Set level between 0 and {{maxLevel}}'
            },
            bulkChangeSuccess: {
                title: 'Debug',
                message: 'Set all abilities to level {{level}}'
            },
            bulkChangeFailure: {
                title: 'Error',
                message: 'Failed to bulk update levels'
            },
            unknownAbility: {
                title: 'Error',
                message: 'Unknown ability: {{ability}}'
            },
            changeSuccess: {
                title: 'Debug',
                message: 'Set {{ability}} to level {{level}}'
            },
            changeFailure: {
                title: 'Error',
                message: 'Failed to change {{ability}} level'
            }
        }
    };

export default playerStats;
