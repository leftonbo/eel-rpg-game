import { Game } from '../Game';
import { BaseOutGameScene } from './BaseOutGameScene';
import { PlayerSaveManager } from '../systems/PlayerSaveData';
import { ModalUtils } from '../utils/ModalUtils';
import { ToastType, ToastUtils } from '../utils/ToastUtils';
import { getLanguage, setLanguage, t } from '../i18n';

export class OutGameOptionScene extends BaseOutGameScene {
    constructor(game: Game) {
        super(game, 'out-game-option-screen');
        
        this.setupEventListeners();
    }
    
    /**
     * シーンに入った時の処理
     */
    enter(): void {
        console.log('Entered OutGameOptionScene');
        
        // ナビゲーションバーのアクティブ状態更新
        this.updateNavigationActiveState();
        
        // オプション画面を更新
        this.updateOptionScreen();
    }
    
    /**
     * イベントリスナーの設定
     */
    private setupEventListeners(): void {
        // セーブデータインポート
        const importButton = document.getElementById('import-save-data-btn');
        if (importButton) {
            importButton.addEventListener('click', () => {
                this.handleImportSaveData();
            });
        }
        
        // セーブデータエクスポート
        const exportButton = document.getElementById('export-save-data-btn');
        if (exportButton) {
            exportButton.addEventListener('click', () => {
                this.handleExportSaveData();
            });
        }
        
        // セーブデータクリア
        const clearButton = document.getElementById('delete-save-data-btn');
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                this.handleDeleteSaveData();
            });
        }
        
        // デバッグモード切り替え
        const debugToggle = document.getElementById('debug-mode-toggle');
        if (debugToggle) {
            debugToggle.addEventListener('change', (event) => {
                const target = event.target as HTMLInputElement;
                this.handleDebugModeToggle(target.checked);
            });
        }

        const languageSelect = document.getElementById('language-select') as HTMLSelectElement | null;
        if (languageSelect) {
            languageSelect.addEventListener('change', () => {
                void this.handleLanguageChange(languageSelect);
            });
        }
    }
    
    /**
     * オプション画面の更新
     */
    private updateOptionScreen(): void {
        // デバッグモードの状態を反映
        const debugToggle = document.getElementById('debug-mode-toggle') as HTMLInputElement;
        if (debugToggle) {
            debugToggle.checked = this.game.isDebugMode();
        }

        const languageSelect = document.getElementById('language-select') as HTMLSelectElement | null;
        if (languageSelect) {
            languageSelect.value = getLanguage();
        }
        
        // セーブデータの存在チェック
        const hasSaveData = PlayerSaveManager.hasSaveData();
        this.updateElement('save-data-status', hasSaveData ? t('ui.option.saveDataExists') : t('ui.option.saveDataMissing'));
        
        // プレイヤー情報表示
        const player = this.game.getPlayer();
        this.updateElement('player-name-display', player.name);
        this.updateElement('player-explorer-level-display', player.getExplorerLevel().toString());
        
        // 撃破済みボス数
        const defeatedBossCount = player.memorialSystem.getVictoriousBossIds().length;
        this.updateElement('defeated-boss-count-display', defeatedBossCount.toString());
    }
    
    /**
     * セーブデータインポート処理
     */
    private handleImportSaveData(): void {
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
                        
                        // インポート実行
                        PlayerSaveManager.importSaveDataJson(jsonData);
                        
                        // 成功メッセージ
                        ToastUtils.showToast(
                            t('system.toasts.importSuccessMessage'),
                            t('system.toasts.importSuccessTitle'),
                            ToastType.Success
                        );

                        // 画面更新
                        this.updateOptionScreen();
                        
                        // ゲームを再起動して反映
                        this.game.reboot();
                    } catch (error) {
                        console.error('Save data import failed:', error);
                        ToastUtils.showToast(
                            t('system.toasts.importErrorMessage'),
                            t('system.toasts.importErrorTitle'),
                            ToastType.Error
                        );
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }
    
    /**
     * セーブデータエクスポート処理
     */
    private handleExportSaveData(): void {
        try {
            const jsonData = PlayerSaveManager.exportSaveDataJson();
            
            // ファイルダウンロード
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `elnal-save-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            ToastUtils.showToast(
                t('system.toasts.exportSuccessMessage'),
                t('system.toasts.exportSuccessTitle'),
                ToastType.Success
            );
            
        } catch (error) {
            console.error('Save data export failed:', error);
            ToastUtils.showToast(
                t('system.toasts.exportErrorMessage'),
                t('system.toasts.exportErrorTitle'),
                ToastType.Error
            );
        }
    }
    
    /**
     * セーブデータ削除処理
     */
    private async handleDeleteSaveData(): Promise<void> {
        const confirmed = await ModalUtils.showConfirm(t('ui.option.dataDeleteConfirm'));
        if (confirmed) {
            try {
                PlayerSaveManager.clearSaveData();
                ToastUtils.showToast(
                    t('system.toasts.deleteSuccessMessage'),
                    t('system.toasts.deleteSuccessTitle'),
                    ToastType.Success
                );
                
                // 画面更新
                this.updateOptionScreen();
                
                // プレイヤーの再初期化
                this.game.getPlayer().lateInitialize();
                
                // ゲームを再起動して反映
                this.game.reboot();
            } catch (error) {
                console.error('Save data clear failed:', error);
                ToastUtils.showToast(
                    t('system.toasts.deleteErrorMessage'),
                    t('system.toasts.deleteErrorTitle'),
                    ToastType.Error
                );
            }
        }
    }
    
    /**
     * デバッグモード切り替え処理
     */
    private handleDebugModeToggle(enabled: boolean): void {
        localStorage.setItem('debug_mode', enabled.toString());
        ToastUtils.showToast(
            enabled ? t('system.debug.enabledMessage') : t('system.debug.disabledMessage'),
            t('system.debug.title'),
            ToastType.Info
        );
        
        void this.promptReload();
    }

    private async handleLanguageChange(selectElement: HTMLSelectElement): Promise<void> {
        const previousLanguage = getLanguage();
        const nextLanguage = selectElement.value === 'en' ? 'en' : 'ja';

        if (nextLanguage === previousLanguage) {
            return;
        }

        setLanguage(nextLanguage);

        const confirmed = await ModalUtils.showConfirm(
            t('ui.option.reloadPrompt'),
            t('ui.option.reloadTitle')
        );

        if (confirmed) {
            location.reload();
        } else {
            setLanguage(previousLanguage);
            selectElement.value = previousLanguage;
        }
    }

    private async promptReload(): Promise<void> {
        const confirmed = await ModalUtils.showConfirm(t('system.modals.reloadConfirm'));
        if (confirmed) {
            location.reload();
        }
    }
    
    /**
     * 要素のテキストコンテンツを更新するヘルパーメソッド
     */
    private updateElement(id: string, value: string): void {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
}
