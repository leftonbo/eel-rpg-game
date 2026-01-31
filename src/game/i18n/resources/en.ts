import { bossTranslations } from '../bosses';

const en = {
    errors: {
        unknown: {
            title: 'Unknown Error',
            message: 'An unknown error occurred.'
        },
        bossLoadFailed: {
            title: 'Boss Data Load Failed',
            message: 'Failed to load boss data: {{error}}'
        }
    },
    common: {
        unknown: 'Unknown',
        hp: 'Health',
        mp: 'Mana',
        attack: 'Attack',
        weapon: 'Weapon',
        armor: 'Armor',
        gloves: 'Gloves',
        belt: 'Belt',
        levelShort: 'Lv.',
        expLabel: 'Experience',
        expShort: 'EXP',
        back: 'Back',
        close: 'Close',
        apply: 'Apply',
        edit: 'Edit',
        add: 'Add',
        change: 'Change',
        hpShort: 'HP',
        mpShort: 'MP',
        maxHp: 'Max HP',
        maxMp: 'Max MP',
        player: 'Player',
        boss: 'Boss',
        statusEffects: 'Status Effects',
        customVariables: 'Custom Variables',
    },
    navigation: {
        bossSelect: '⚔️ Boss Select',
        playerDetail: '👤 Player Details',
        explorationRecord: '📊 Exploration Log',
        library: '📚 Library',
        option: '⚙️ Options',
        changelog: '📋 Changelog'
    },
    bossSelect: {
        title: 'Select a target to hunt....',
        selectButton: 'Select',
        unlockRequirement: '🔒️ Unlock at Explorer Lv.{{level}}',
        status: {
            victory: 'Victory Achieved',
            defeat: 'Defeat Recorded'
        }
    },
    bossModal: {
        questTitle: 'Quest Objective',
        appearanceLabel: 'Traits',
        guest: {
            fallbackName: 'Guest Character',
            createdBy: '{{name}} created by {{creator}}'
        },
        buttons: {
            cancel: 'Cancel',
            confirm: 'Start Battle!',
            back: 'Back'
        }
    },
    options: {
        playerInfo: 'Player Info',
        dataManagement: 'Data Management',
        gameSettings: 'Game Settings',
        player: {
            name: 'Name',
            explorerLevel: 'Explorer Lv',
            defeatedBossCount: 'Bosses Defeated',
            saveData: 'Save Data'
        },
        saveDataStatus: {
            exists: 'Available',
            none: 'None'
        },
        data: {
            exportTitle: '📤 Export Data',
            exportDescription: 'Save your data as a file',
            exportButton: 'Export',
            importTitle: '📥 Import Data',
            importDescription: 'Load save data from a file',
            importButton: 'Import',
            deleteTitle: '🗑️ Delete Data',
            deleteDescription: 'Delete all save data',
            deleteButton: 'Delete'
        },
        language: {
            label: 'Language',
            help: 'Switch the display language for in-game text.',
            ja: '日本語',
            en: 'English'
        },
        debug: {
            label: 'Debug Mode',
            description: 'Enable debug features (for developers)',
            toast: {
                title: 'Debug Mode',
                message: 'Debug mode set to {{state}}'
            },
            state: {
                enabled: 'enabled',
                disabled: 'disabled'
            },
            reloadConfirm: {
                title: 'Apply Settings',
                message: 'Reload the page to apply settings?'
            }
        }
    },
    dialogs: {
        common: {
            ok: 'OK',
            cancel: 'Cancel',
            select: 'Select',
            selectTitle: 'Select',
            alert: {
                title: 'Alert',
                message: 'Alert message'
            },
            confirm: {
                title: 'Confirm',
                message: 'Confirm message'
            },
            prompt: {
                title: 'Input',
                placeholder: 'Enter a value'
            }
        },
        deleteConfirm: {
            title: 'Delete Save Data Confirm',
            message: 'Delete all save data? This action cannot be undone.'
        },
        customVar: {
            title: 'Add Custom Variable',
            keyLabel: 'Key',
            keyPlaceholder: 'Enter a key',
            valueLabel: 'Value',
            valuePlaceholder: 'Enter a value',
            helper: 'Numbers and true/false are auto-converted',
            errors: {
                missingKey: 'Please enter a key',
                missingValue: 'Please enter a value'
            }
        },
        statusEffect: {
            title: 'Add status effect to {{target}}',
            titleDefault: 'Add status effect',
            typeLabel: 'Status effect',
            durationLabel: 'Duration (turns)',
            errors: {
                invalidDuration: 'Enter a valid duration (1 or more)',
                maxDuration: 'Duration must be 99 or less'
            }
        }
    },
    toasts: {
        importSuccess: {
            title: 'Import Complete',
            message: 'Save data imported successfully.'
        },
        importFailure: {
            title: 'Import Failed',
            message: 'Failed to import save data.'
        },
        exportSuccess: {
            title: 'Export Complete',
            message: 'Save data exported successfully.'
        },
        exportFailure: {
            title: 'Export Failed',
            message: 'Failed to export save data.'
        },
        deleteSuccess: {
            title: 'Delete Complete',
            message: 'Save data deleted successfully.'
        },
        deleteFailure: {
            title: 'Delete Failed',
            message: 'Failed to delete save data.'
        },
        types: {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Info'
        }
    },
    titleScreen: {
        warningTitle: '⚠️ Notice',
        warningItemPredation: 'Contains predation and swallow scenes',
        startButton: '🎮 Start Game'
    },
    battle: {
        actionTitle: 'Choose Action',
        logTitle: 'Battle Log',
        logStart: 'Battle Start!',
        backToBossSelect: '← Back to Boss Select',
        endBattle: '🎯 End Battle',
        bossInfoTitle: 'Show boss info',
        statusEffectRemaining: '{{description}} ({{duration}} turns left)',
        statusEffectDuration: '{{name}} ({{duration}} turns)',
        roundLabel: 'Round {{round}}',
        messages: {
            startFallback: '{{boss}} appeared!',
            victoryFallback: 'Defeated {{boss}}!'
        }
    },
    battleActions: {
        attack: '⚔️ Attack',
        defend: '🛡️ Defend',
        skill: '⚡️ Skills',
        item: '💊 Items'
    },
    skillPanel: {
        title: 'Skills',
        powerAttack: '💥 Power Attack',
        powerAttackCost: '(20MP)',
        powerAttackHint: 'Guaranteed hit with 2.5x attack (20MP)',
        heal: '✨ Heal',
        healCost: '(30MP)',
        healHint: 'Restore 100 HP (30MP)',
        struggle: '🔥 Hard Struggle',
        struggleCost: '(30MP)',
        struggleHint: 'Struggles with doubled escape chance (30MP)',
        ultraSmash: '💀 Ultra Smash',
        ultraSmashCost: '(Use all MP)',
        ultraSmashHint: 'All-out attack',
        back: 'Back'
    },
    itemPanel: {
        title: 'Items',
        healPotion: '💊 Healing Potion',
        healPotionHint: 'Heal 80% HP and remove debuffs',
        adrenaline: '💉 Adrenaline Shot',
        adrenalineHint: 'Become invincible for 3 turns',
        energyDrink: '⚡️ Energy Drink',
        energyDrinkHint: 'MP stays full for 3 turns',
        back: 'Back'
    },
    specialActions: {
        struggle: '💪 Struggle',
        struggleHint: 'Attempt to escape (success rate increases with attempts)',
        struggleSkill: '🔥 Hard Struggle',
        struggleSkillCost: '(30MP)',
        struggleSkillHint: 'Struggles with doubled escape chance (30MP)',
        stayStill: '😌 Stay Still',
        stayStillHint: 'Recover 5% max HP',
        giveUp: '💀 Give In',
        giveUpHint: 'Do nothing',
        omamori: '🛡️ Charm',
        omamoriHint: 'Remove special states and fully heal HP'
    },
    battleResult: {
        title: 'Battle Results',
        continue: 'Back to Boss Select',
        experienceTitle: 'Experience Gained',
        levelUpTitle: 'Level Up!',
        newUnlocksTitle: 'New Unlocks!',
        newUnlockMessage: '🔓️ {{name}} is now available!',
        trophiesTitle: '🏆 Trophies Earned',
        explorerLabel: '🗺️ Explorer',
        newBossUnlocksTitle: '🔓️ New Boss Unlocked',
        newBossUnlockMessage: '🌟 {{boss}} unlocked!',
        levelUpBanner: '🎉 {{ability}} Level Up!',
        levelUpRange: 'Lv.{{previous}} → Lv.{{next}}',
        experienceGain: '+{{exp}} EXP'
    },
    playerDetail: {
        titleSuffix: ' - Details',
        editButton: '✏️ Edit',
        tabs: {
            stats: 'Stats',
            equipment: 'Equipment',
            skills: 'Skills',
            items: 'Items'
        }
    },
    playerStats: {
        baseStats: 'Base Stats',
        equipmentEffects: 'Equipment Effects',
        abilities: 'Abilities',
        escapePower: 'Escape Power',
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
    },
    playerEquipment: {
        equipBest: 'Best Gear',
        unequipAll: 'Unequip All',
        toasts: {
            equipBestSuccess: {
                title: 'Best Gear',
                message: 'Equipped best gear'
            },
            equipBestFailure: {
                title: 'Best Gear',
                message: 'Failed to change equipment'
            },
            unequipAllSuccess: {
                title: 'Unequip',
                message: 'Unequipped all gear'
            },
            unequipAllFailure: {
                title: 'Unequip',
                message: 'Failed to change equipment'
            }
        }
    },
    playerSkills: {
        activeTitle: 'Active Skills',
        passiveTitle: 'Passive Skills'
    },
    playerItems: {
        title: 'Items'
    },
    explorer: {
        progressTitle: '🎯 Game Progress',
        explorerTitle: '🗺️ Explorer',
        statsTitle: '📊 Exploration Stats',
        unlockedBosses: 'Unlocked Bosses',
        trophiesCollected: 'Trophies Collected',
        totalExplorerExp: 'Total Explorer EXP',
        terrainTitle: '🗺️ Accessible Terrains',
        currentTerrainsTitle: '🌍 Currently Accessible Terrains',
        terrainHint: 'Increase Explorer level to access more distant, unknown terrains.',
        trophyCollectionTitle: '🏆 Trophy Collection',
        noTrophiesLine1: 'No trophies collected yet.',
        noTrophiesLine2: 'Win or lose your fights to collect trophies!',
        toasts: {
            progressUpdateFailure: {
                title: 'Error',
                message: 'Failed to update progress display'
            }
        }
    },
    library: {
        title: '📚 Library',
        availableDocuments: 'Available Documents',
        documentContent: 'Document Content',
        selectPrompt: 'Select a document from the left',
        unread: 'Unread',
        lockedTitle: '?????',
        unlockRequirement: {
            lockedPrefix: '🔒️',
            explorerLevel: 'Explorer Lv. {{level}}',
            bossDefeats: '{{bosses}}',
            bossLosses: '{{bosses}}',
            separator: ', '
        },
        requirements: {
            defeat: '{{boss}} defeat',
            victory: '{{boss}} victory',
            defeatLabel: 'defeat',
            victoryLabel: 'victory',
            unknownBoss: '{{bossId}} {{type}} (unknown)'
        }
    },
    explorationRecord: {
        title: '📊 Exploration Log'
    },
    changelog: {
        title: '📋 Changelog',
        loadingSpinner: 'Loading...',
        loadingTitle: 'Loading changelog...',
        loadingMessage: 'Please wait a moment'
    },
    footer: {
        feedback: 'Send Feedback',
        bossRequest: 'Request a Boss',
        github: 'GitHub'
    },
    playerInfoEdit: {
        title: 'Edit Player Info',
        nameLabel: 'Name (max 32 chars)',
        namePlaceholder: 'Enter player name',
        currentName: 'Current name',
        iconLabel: 'Select Icon',
        currentIcon: 'Current icon',
        selectedIcon: 'Selected icon',
        iconCategories: {
            animal: 'Animals',
            fantasy: 'Fantasy',
            nature: 'Nature',
            weapon: 'Weapons',
            element: 'Elements'
        },
        reset: '🔄 Reset',
        save: 'Save'
    },
    debug: {
        title: '🔧 Debug Console',
        button: '🔧 Debug',
        playerTitle: '🐍 Player',
        addStatusEffect: 'Add status effect',
        addCustomVar: 'Add variable',
        applyChanges: '✅ Apply changes'
    },
    skills: {
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
    },
    abilities: {
        names: {
            combat: 'Combat',
            toughness: 'Toughness',
            craftwork: 'Craftwork',
            endurance: 'Endurance',
            agility: 'Agility',
            explorer: 'Explorer'
        },
        labels: {
            combat: '⚔️ Combat',
            toughness: '🛡️ Toughness',
            craftwork: '🔧 Craftwork',
            endurance: '💪 Endurance',
            agility: '🏃 Agility',
            explorer: '🗺️ Explorer'
        },
        descriptions: {
            combat: 'Unlocks new weapons and attack skills. Gain EXP by dealing damage to bosses.',
            toughness: 'Unlocks new armor and defense skills. Gain EXP when losing health.',
            craftwork: 'Increases item capacity and unlocks new items. Gain EXP when using items.',
            endurance: 'Increases max mana. Gain EXP when spending mana.',
            agility: 'Improves escape chance while restrained. Gain EXP when attempting to escape.',
            explorer: 'Expands exploration range and unlocks new bosses. Gain EXP by earning trophies and skills.'
        }
    },
    bosses: bossTranslations.en
};

export default en;
