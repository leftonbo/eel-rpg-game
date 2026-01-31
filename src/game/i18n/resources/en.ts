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
            description: 'Enable debug features (for developers)'
        }
    },
    dialogs: {
        common: {
            ok: 'OK',
            cancel: 'Cancel',
            select: 'Select',
            alert: {
                title: 'Alert',
                message: 'Alert message'
            },
            confirm: {
                title: 'Confirm',
                message: 'Confirm message'
            }
        },
        deleteConfirm: {
            title: 'Delete Save Data Confirm',
            message: 'Delete all save data? This action cannot be undone.'
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
        }
    },
    bosses: bossTranslations.en
};

export default en;
