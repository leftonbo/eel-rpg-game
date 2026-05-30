import { useState, useEffect, useCallback, ReactElement } from 'react';
import Button from 'react-bootstrap/Button';
import { useGameContext } from '../../context/GameContext';
import { PlayerSaveManager } from '../../systems/PlayerSaveData';
import { ModalUtils } from '../../utils/ModalUtils';
import { ToastType, ToastUtils } from '../../utils/ToastUtils';
import { getLanguage, setLanguage, t } from '../../i18n';
import { SupportedLanguage } from '../../i18n/types';

interface OptionData {
    playerName: string;
    explorerLevel: number;
    defeatedBossCount: number;
    hasSaveData: boolean;
    language: string;
    isDebugMode: boolean;
}

function buildOptionData(game: ReturnType<typeof useGameContext>['game']): OptionData {
    const player = game.getPlayer();
    return {
        playerName: player.name,
        explorerLevel: player.getExplorerLevel(),
        defeatedBossCount: player.memorialSystem.getVictoriousBossIds().length,
        hasSaveData: PlayerSaveManager.hasSaveData(),
        language: getLanguage(),
        isDebugMode: game.isDebugMode(),
    };
}

export function OptionScreen(): ReactElement {
    const { game } = useGameContext();
    const [data, setData] = useState<OptionData>(() => buildOptionData(game));

    useEffect(() => {
        setData(buildOptionData(game));
    }, [game]);

    const handleExport = useCallback(() => {
        try {
            const jsonData = PlayerSaveManager.exportSaveDataJson();
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `elnal-save-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            ToastUtils.showToast(
                t('toasts.exportSuccess.message'),
                t('toasts.exportSuccess.title'),
                ToastType.Success
            );
        } catch (error) {
            console.error('Save data export failed:', error);
            ToastUtils.showToast(
                t('toasts.exportFailure.message'),
                t('toasts.exportFailure.title'),
                ToastType.Error
            );
        }
    }, []);

    const handleImport = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const jsonData = e.target?.result as string;
                        PlayerSaveManager.importSaveDataJson(jsonData);
                        ToastUtils.showToast(
                            t('toasts.importSuccess.message'),
                            t('toasts.importSuccess.title'),
                            ToastType.Success
                        );
                        setData(buildOptionData(game));
                        game.reboot();
                    } catch (error) {
                        console.error('Save data import failed:', error);
                        ToastUtils.showToast(
                            t('toasts.importFailure.message'),
                            t('toasts.importFailure.title'),
                            ToastType.Error
                        );
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }, [game]);

    const handleDelete = useCallback(async () => {
        const confirmed = await ModalUtils.showConfirm(
            t('dialogs.deleteConfirm.message'),
            t('dialogs.deleteConfirm.title')
        );
        if (confirmed) {
            try {
                PlayerSaveManager.clearSaveData();
                ToastUtils.showToast(
                    t('toasts.deleteSuccess.message'),
                    t('toasts.deleteSuccess.title'),
                    ToastType.Success
                );
                setData(buildOptionData(game));
                game.getPlayer().lateInitialize();
                game.reboot();
            } catch (error) {
                console.error('Save data clear failed:', error);
                ToastUtils.showToast(
                    t('toasts.deleteFailure.message'),
                    t('toasts.deleteFailure.title'),
                    ToastType.Error
                );
            }
        }
    }, [game]);

    const handleLanguageChange = useCallback(async (lang: SupportedLanguage) => {
        await setLanguage(lang);
        setData(buildOptionData(game));
    }, [game]);

    const handleDebugToggle = useCallback(async (enabled: boolean) => {
        localStorage.setItem('debug_mode', enabled.toString());
        ToastUtils.showToast(
            t('options.debug.toast.message', { state: enabled ? t('options.debug.state.enabled') : t('options.debug.state.disabled') }),
            t('options.debug.toast.title'),
            ToastType.Info
        );
        const shouldReload = await ModalUtils.showConfirm(
            t('options.debug.reloadConfirm.message'),
            t('options.debug.reloadConfirm.title')
        );
        if (shouldReload) {
            location.reload();
        }
    }, []);

    return (
        <div className="container flex-grow-1 d-flex flex-column">
            <div className="row mt-4 mb-4 flex-grow-1">
                <div className="col-12">
                    <div className="card bg-dark">
                        <div className="card-header">
                            <h5 className="mb-0">{t('navigation.option')}</h5>
                        </div>
                        <div className="card-body">
                            {/* Player Information */}
                            <div className="row mb-4">
                                <div className="col-12">
                                    <h6>{t('options.playerInfo')}</h6>
                                    <div className="card bg-secondary">
                                        <div className="card-body">
                                            <div className="row">
                                                <div className="col-md-3">
                                                    <strong>{t('options.player.name')}</strong>:{' '}
                                                    {data.playerName}
                                                </div>
                                                <div className="col-md-3">
                                                    <strong>{t('options.player.explorerLevel')}</strong>:{' '}
                                                    {data.explorerLevel}
                                                </div>
                                                <div className="col-md-3">
                                                    <strong>{t('options.player.defeatedBossCount')}</strong>:{' '}
                                                    {data.defeatedBossCount}
                                                </div>
                                                <div className="col-md-3">
                                                    <strong>{t('options.player.saveData')}</strong>:{' '}
                                                    {data.hasSaveData
                                                        ? t('options.saveDataStatus.exists')
                                                        : t('options.saveDataStatus.none')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Data Management */}
                            <div className="row mb-4">
                                <div className="col-12">
                                    <h6>{t('options.dataManagement')}</h6>
                                    <div className="row">
                                        <div className="col-md-4">
                                            <div className="card bg-secondary mb-3">
                                                <div className="card-body text-center">
                                                    <h6 className="card-title">{t('options.data.exportTitle')}</h6>
                                                    <p className="card-text">
                                                        <span>{t('options.data.exportDescription')}</span>
                                                    </p>
                                                    <Button
                                                        variant="outline-info"
                                                        className="w-100"
                                                        onClick={handleExport}
                                                    >
                                                        {t('options.data.exportButton')}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="card bg-secondary mb-3">
                                                <div className="card-body text-center">
                                                    <h6 className="card-title">{t('options.data.importTitle')}</h6>
                                                    <p className="card-text">
                                                        <span>{t('options.data.importDescription')}</span>
                                                    </p>
                                                    <Button
                                                        variant="outline-success"
                                                        className="w-100"
                                                        onClick={handleImport}
                                                    >
                                                        {t('options.data.importButton')}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="card bg-secondary mb-3">
                                                <div className="card-body text-center">
                                                    <h6 className="card-title">{t('options.data.deleteTitle')}</h6>
                                                    <p className="card-text">{t('options.data.deleteDescription')}</p>
                                                    <Button
                                                        variant="outline-danger"
                                                        className="w-100"
                                                        onClick={handleDelete}
                                                    >
                                                        {t('options.data.deleteButton')}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Game Settings */}
                            <div className="row">
                                <div className="col-12">
                                    <h6>{t('options.gameSettings')}</h6>
                                    <div className="card bg-secondary">
                                        <div className="card-body">
                                            <div className="mb-3">
                                                <label className="form-label" htmlFor="language-select">
                                                    {t('options.language.label')}
                                                </label>
                                                <select
                                                    id="language-select"
                                                    className="form-select"
                                                    value={data.language}
                                                    onChange={(e) =>
                                                        handleLanguageChange(e.target.value as SupportedLanguage)
                                                    }
                                                >
                                                    <option value="ja">{t('options.language.ja')}</option>
                                                    <option value="en">{t('options.language.en')}</option>
                                                </select>
                                                <div className="form-text">{t('options.language.help')}</div>
                                            </div>
                                            <div className="form-check form-switch d-none">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="debug-mode-toggle"
                                                    checked={data.isDebugMode}
                                                    onChange={(e) => handleDebugToggle(e.target.checked)}
                                                />
                                                <label className="form-check-label" htmlFor="debug-mode-toggle">
                                                    {t('options.debug.label')}
                                                </label>
                                                <div className="form-text">{t('options.debug.description')}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
