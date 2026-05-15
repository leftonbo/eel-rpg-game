const options = {
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
    };

export default options;
