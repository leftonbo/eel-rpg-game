import { Game } from '../Game';
import { BaseOutGameScene } from './BaseOutGameScene';
import { PlayerSaveManager } from '../systems/PlayerSaveData';

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
        const clearButton = document.getElementById('clear-save-data-btn');
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                this.handleClearSaveData();
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
        
        // セーブデータの存在チェック
        const hasSaveData = PlayerSaveManager.hasSaveData();
        this.updateElement('save-data-status', hasSaveData ? '存在' : 'なし');
        
        // プレイヤー情報表示
        const player = this.game.getPlayer();
        this.updateElement('player-name-display', player.name);
        this.updateElement('player-explorer-level-display', player.getExplorerLevel().toString());
        
        // 撃破済みボス数
        const defeatedBossCount = player.memorialSystem.getAllTrophies()
            .filter(trophy => trophy.type === 'victory').length;
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
                        const saveData = JSON.parse(jsonData);
                        
                        // インポート実行
                        PlayerSaveManager.importSaveData(saveData);
                        
                        // 成功メッセージ
                        this.showMessage('セーブデータのインポートが完了しました', 'success');
                        
                        // 画面更新
                        this.updateOptionScreen();
                        
                    } catch (error) {
                        console.error('Save data import failed:', error);
                        this.showMessage('セーブデータのインポートに失敗しました', 'error');
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
            const saveData = PlayerSaveManager.exportSaveData();
            const jsonData = JSON.stringify(saveData, null, 2);
            
            // ファイルダウンロード
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `elnal-save-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            this.showMessage('セーブデータをエクスポートしました', 'success');
            
        } catch (error) {
            console.error('Save data export failed:', error);
            this.showMessage('セーブデータのエクスポートに失敗しました', 'error');
        }
    }
    
    /**
     * セーブデータクリア処理
     */
    private handleClearSaveData(): void {
        if (confirm('本当にセーブデータを削除しますか？この操作は取り返しがつきません。')) {
            try {
                PlayerSaveManager.clearSaveData();
                this.showMessage('セーブデータを削除しました', 'success');
                
                // 画面更新
                this.updateOptionScreen();
                
                // プレイヤーの再初期化
                this.game.getPlayer().lateInitialize();
                
            } catch (error) {
                console.error('Save data clear failed:', error);
                this.showMessage('セーブデータの削除に失敗しました', 'error');
            }
        }
    }
    
    /**
     * デバッグモード切り替え処理
     */
    private handleDebugModeToggle(enabled: boolean): void {
        localStorage.setItem('debug_mode', enabled.toString());
        this.showMessage(`デバッグモードを${enabled ? '有効' : '無効'}にしました`, 'info');
        
        // 設定反映のためページリロードを提示
        if (confirm('設定を反映するためにページをリロードしますか？')) {
            location.reload();
        }
    }
    
    /**
     * メッセージ表示
     */
    private showMessage(message: string, type: 'success' | 'error' | 'info'): void {
        // Bootstrap toast または alert で表示（実装簡略化）
        const alertClass = type === 'success' ? 'alert-success' : 
                          type === 'error' ? 'alert-danger' : 'alert-info';
        
        const messageContainer = document.getElementById('option-message-container');
        if (messageContainer) {
            messageContainer.innerHTML = `
                <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `;
            
            // 3秒後に自動で消す
            setTimeout(() => {
                const alert = messageContainer.querySelector('.alert');
                if (alert) {
                    alert.remove();
                }
            }, 3000);
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