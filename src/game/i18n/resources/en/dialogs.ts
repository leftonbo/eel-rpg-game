const dialogs = {
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
    };

export default dialogs;
