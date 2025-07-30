import { Game } from '../../Game';
import { PlayerSaveManager } from '../../systems/PlayerSaveData';
import { AbilityData, AbilityType } from '../../systems/AbilitySystem';
import { ModalUtils } from '../../utils/ModalUtils';
import { AbilityNameResolver } from '../utils/AbilityNameResolver';
import { Player } from '@/game/entities/Player';

export class SaveDataManager {
    private game: Game;

    constructor(game: Game) {
        this.game = game;
        this.initializeSaveDataButtons();
        this.initializeDebugControls();
    }

    /**
     * Initialize modal save data management buttons
     */
    private initializeSaveDataButtons(): void {
        // Export save data button (modal)
        const exportButtonModal = document.getElementById('export-save-btn-modal');
        if (exportButtonModal) {
            exportButtonModal.addEventListener('click', () => {
                this.exportSaveData();
            });
        }
        
        // Import save data button (modal)
        const importButtonModal = document.getElementById('import-save-btn-modal');
        const importFileInputModal = document.getElementById('import-file-input-modal') as HTMLInputElement;
        if (importButtonModal && importFileInputModal) {
            importButtonModal.addEventListener('click', () => {
                importFileInputModal.click();
            });
            
            importFileInputModal.addEventListener('change', (event) => {
                const file = (event.target as HTMLInputElement).files?.[0];
                if (file) {
                    this.importSaveData(file);
                }
            });
        }
        
        // Delete save data button (modal)
        const deleteButtonModal = document.getElementById('delete-save-btn-modal');
        if (deleteButtonModal) {
            deleteButtonModal.addEventListener('click', () => {
                this.deleteSaveData();
            });
        }
    }

    /**
     * Initialize debug controls
     */
    private initializeDebugControls(): void {
        // Skills tab debug controls event listeners
        const debugCombatBtn = document.getElementById('debug-combat-btn');
        if (debugCombatBtn) {
            debugCombatBtn.addEventListener('click', () => {
                this.updateAbilityLevelFromSkillsTab('combat');
            });
        }

        const debugToughnessBtn = document.getElementById('debug-toughness-btn');
        if (debugToughnessBtn) {
            debugToughnessBtn.addEventListener('click', () => {
                this.updateAbilityLevelFromSkillsTab('toughness');
            });
        }

        const debugCraftworkBtn = document.getElementById('debug-craftwork-btn');
        if (debugCraftworkBtn) {
            debugCraftworkBtn.addEventListener('click', () => {
                this.updateAbilityLevelFromSkillsTab('craftwork');
            });
        }

        const debugEnduranceBtn = document.getElementById('debug-endurance-btn');
        if (debugEnduranceBtn) {
            debugEnduranceBtn.addEventListener('click', () => {
                this.updateAbilityLevelFromSkillsTab('endurance');
            });
        }

        const debugAgilityBtn = document.getElementById('debug-agility-btn');
        if (debugAgilityBtn) {
            debugAgilityBtn.addEventListener('click', () => {
                this.updateAbilityLevelFromSkillsTab('agility');
            });
        }

        const debugAllBtn = document.getElementById('debug-all-btn');
        if (debugAllBtn) {
            debugAllBtn.addEventListener('click', () => {
                this.updateAllAbilityLevelsFromSkillsTab();
            });
        }
    }
    
    /**
     * Export save data to file
     */
    private exportSaveData(): void {
        try {
            const saveData = PlayerSaveManager.exportSaveDataJson();
            const blob = new Blob([saveData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `eel_rpg_save_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            ModalUtils.showToast('セーブデータをエクスポートしました', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            ModalUtils.showToast('エクスポートに失敗しました', 'error');
        }
    }
    
    /**
     * Import save data from file
     */
    private importSaveData(file: File): void {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const success = PlayerSaveManager.importSaveDataJson(content);
                
                if (success) {
                    ModalUtils.showToast('セーブデータをインポートしました', 'success');
                    // Reload the player to reflect imported data
                    this.game.reboot();
                } else {
                    ModalUtils.showToast('無効なセーブデータです', 'error');
                }
            } catch (error) {
                console.error('Import failed:', error);
                ModalUtils.showToast('インポートに失敗しました', 'error');
            }
        };
        reader.readAsText(file);
    }
    
    /**
     * Delete save data
     */
    private async deleteSaveData(): Promise<void> {
        const confirmed = await ModalUtils.showConfirm('全てのセーブデータを削除しますか？この操作は取り消せません。');
        if (confirmed) {
            PlayerSaveManager.clearSaveData();
            ModalUtils.showToast('セーブデータを削除しました', 'success');
            // Reload the player to reflect cleared data
            this.game.reboot();
        }
    }

    /**
     * Update ability level from skills tab
     */
    private updateAbilityLevelFromSkillsTab(abilityType: string): void {
        const inputElement = document.getElementById(`debug-${abilityType}-level`) as HTMLInputElement;
        if (!inputElement) return;
        
        const level = parseInt(inputElement.value);
        if (!this.validateAbilityLevel(level)) {
            return;
        }
        
        const player = this.game.getPlayer();
        const ability = player.abilitySystem.getAbility(abilityType as AbilityType);
        if (ability) {
            this.setAbilityLevel(ability, level);
            this.updatePlayerAndUI(player);
            
            const abilityName = AbilityNameResolver.getAbilityName(abilityType);
            ModalUtils.showToast(`${abilityName}をレベル ${level} に設定しました`, 'success');
        }
    }

    /**
     * Update all ability levels from skills tab
     */
    private updateAllAbilityLevelsFromSkillsTab(): void {
        const inputElement = document.getElementById('debug-all-level') as HTMLInputElement;
        if (!inputElement) return;
        
        const level = parseInt(inputElement.value);
        if (!this.validateAbilityLevel(level)) {
            return;
        }
        
        const player = this.game.getPlayer();
        Object.values(AbilityType).forEach(abilityType => {
            const ability = player.abilitySystem.getAbility(abilityType);
            if (ability) {
                this.setAbilityLevel(ability, level);
            }
        });
        
        this.updatePlayerAndUI(player);
        ModalUtils.showToast(`全てのアビリティをレベル ${level} に設定しました`, 'success');
    }

    /**
     * Validate ability level input
     */
    private validateAbilityLevel(level: number): boolean {
        if (isNaN(level) || level < 0 || level > 10) {
            ModalUtils.showToast('レベルは 0 から 10 の間で入力してください', 'error');
            return false;
        }
        return true;
    }

    /**
     * Set ability level and experience
     */
    private setAbilityLevel(ability: AbilityData, level: number): void {
        ability.level = level;
        ability.experience = level > 0 ? Math.pow(level, 3) * 50 : 0;
    }

    /**
     * Update player stats and UI
     */
    private updatePlayerAndUI(player: Player): void {
        player.recalculateStats();
        player.saveToStorage();
        
        // Dispatch events to update UI
        const updateSummaryEvent = new CustomEvent('updatePlayerSummary');
        document.dispatchEvent(updateSummaryEvent);
        
        const updateModalEvent = new CustomEvent('refreshPlayerModal');
        document.dispatchEvent(updateModalEvent);
    }

}