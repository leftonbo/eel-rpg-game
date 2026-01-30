import { bossTranslations } from '../bosses';

const en = {
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
        playerSummary: {
            hp: 'Health',
            mp: 'Mana',
            attack: 'Attack',
            weapon: 'Weapon',
            armor: 'Armor',
            gloves: 'Gloves',
            belt: 'Belt',
            unarmed: 'Unarmed',
            noArmor: 'None',
            noGloves: 'None',
            noBelt: 'None'
        },
        selectButton: 'Select',
        unlockRequirement: '🔒 Unlock at Explorer Lv.{{level}}',
        status: {
            victory: 'Victory Achieved',
            defeat: 'Defeat Recorded'
        },
        errors: {
            loadFailed: 'Failed to load boss data: {{error}}',
            unknown: 'An unknown error occurred.'
        }
    },
    bossModal: {
        questTitle: 'Quest Objective',
        stats: {
            hp: 'HP',
            attack: 'Attack'
        },
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
        title: '⚙️ Options',
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
            description: 'Enable debug features (for developers)'
        },
        dialogs: {
            deleteConfirm: 'Delete all save data? This action cannot be undone.'
        }
    },
    toasts: {
        importSuccessTitle: 'Import Complete',
        importSuccessMessage: 'Save data imported successfully.',
        importFailureTitle: 'Import Failed',
        importFailureMessage: 'Failed to import save data.',
        exportSuccessTitle: 'Export Complete',
        exportSuccessMessage: 'Save data exported successfully.',
        exportFailureTitle: 'Export Failed',
        exportFailureMessage: 'Failed to export save data.',
        deleteSuccessTitle: 'Delete Complete',
        deleteSuccessMessage: 'Save data deleted successfully.',
        deleteFailureTitle: 'Delete Failed',
        deleteFailureMessage: 'Failed to delete save data.'
    },
    bosses: bossTranslations.en
};

export default en;
