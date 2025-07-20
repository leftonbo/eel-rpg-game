import { Game } from '../Game';
import { getAllBossData } from '../data/index';
import { PlayerSaveManager } from '../systems/PlayerSaveData';
import { AbilityType } from '../systems/AbilitySystem';
import { SkillData, UnlockCondition } from '../data/skills';

export class BossSelectScene {
    private game: Game;
    private bossCards: NodeListOf<Element> | null = null;
    private bossModal: any = null; // Bootstrap modal for boss details
    private playerModal: any = null; // Bootstrap modal for player details
    private selectedBossId: string = '';
    
    constructor(game: Game) {
        this.game = game;
        this.init();
    }
    
    private init(): void {
        this.bossCards = document.querySelectorAll('.boss-card');
        
        // Initialize boss cards
        this.bossCards.forEach(card => {
            card.addEventListener('click', (_e) => {
                const bossId = card.getAttribute('data-boss');
                if (bossId) {
                    this.onBossSelect(bossId);
                }
            });
        });
        
        // Initialize boss modal
        const bossModalElement = document.getElementById('boss-modal');
        if (bossModalElement && window.bootstrap) {
            this.bossModal = new window.bootstrap.Modal(bossModalElement);
        }
        
        // Initialize player modal
        const playerModalElement = document.getElementById('player-details-modal');
        if (playerModalElement && window.bootstrap) {
            this.playerModal = new window.bootstrap.Modal(playerModalElement);
        }
        
        // Player details button
        const playerDetailsButton = document.getElementById('player-details-btn');
        if (playerDetailsButton) {
            playerDetailsButton.addEventListener('click', () => {
                this.showPlayerDetails();
            });
        }
        
        // Confirm boss button
        const confirmButton = document.getElementById('confirm-boss-btn');
        if (confirmButton) {
            confirmButton.addEventListener('click', () => {
                this.onConfirmBoss();
            });
        }
        
        // Initialize modal save data buttons
        this.initializeModalSaveDataButtons();
    }
    
    enter(): void {
        console.log('Entered boss select scene');
        
        // Update boss card information
        this.updateBossCards();
        
        // Update player status display
        this.updatePlayerStatus();
        
        // Show/hide debug controls based on debug mode
        this.updateDebugControlsVisibilityInModal();
    }
    
    private updateBossCards(): void {
        const allBossData = getAllBossData();
        
        this.bossCards?.forEach(card => {
            const bossId = card.getAttribute('data-boss');
            const bossData = allBossData.find(boss => boss.id === bossId);
            
            if (bossData) {
                const titleElement = card.querySelector('.card-title');
                const textElement = card.querySelector('.card-text');
                
                if (titleElement) {
                    titleElement.textContent = bossData.displayName;
                }
                
                if (textElement) {
                    textElement.textContent = bossData.description;
                }
            }
        });
    }
    
    private onBossSelect(bossId: string): void {
        this.selectedBossId = bossId;
        
        // Update modal with boss information
        this.updateModal(bossId);
        
        // Show modal
        if (this.bossModal) {
            this.bossModal.show();
        }
    }
    
    private updateModal(bossId: string): void {
        const allBossData = getAllBossData();
        const bossData = allBossData.find(boss => boss.id === bossId);
        
        if (!bossData) return;
        
        // Update modal title
        const modalTitle = document.getElementById('modal-boss-name');
        if (modalTitle) {
            modalTitle.textContent = bossData.displayName;
        }
        
        // Update modal description
        const modalDescription = document.getElementById('modal-boss-description');
        if (modalDescription) {
            modalDescription.textContent = bossData.description;
        }
        
        const modalQuestNote = document.getElementById('modal-boss-quest-note');
        if (modalQuestNote) {
            modalQuestNote.textContent = bossData.questNote;
        }
        
        // Update modal stats
        const modalStats = document.getElementById('modal-boss-stats');
        if (modalStats) {
            modalStats.innerHTML = `
                <div class=\"row\">
                    <div class=\"col-6\">
                        <strong>HP:</strong> ${bossData.maxHp}
                    </div>
                    <div class=\"col-6\">
                        <strong>攻撃力:</strong> ${bossData.attackPower}
                    </div>
                </div>
            `;
        }
        
        // Add guest character attribution if available
        const modalGuestInfo = document.getElementById('modal-boss-guest-info');
        if (modalGuestInfo) {
            if (bossData.guestCharacterInfo) {
                modalGuestInfo.innerHTML = `<small class="text-muted">Guest Character by ${bossData.guestCharacterInfo.creator}</small>`;
                modalGuestInfo.classList.remove('d-none');
            } else {
                modalGuestInfo.classList.add('d-none');
            }
        }
    }
    
    private onConfirmBoss(): void {
        if (this.selectedBossId) {
            // Hide modal
            if (this.bossModal) {
                this.bossModal.hide();
            }
            
            // Start battle with selected boss
            this.game.selectBoss(this.selectedBossId);
        }
    }
    
    /**
     * Update player status display in boss select screen
     */
    private updatePlayerStatus(): void {
        const player = this.game.getPlayer();
        const equipment = player.getEquipmentInfo();
        
        // Update summary display
        const maxHpElement = document.getElementById('player-summary-max-hp');
        const maxMpElement = document.getElementById('player-summary-max-mp');
        const attackElement = document.getElementById('player-summary-attack');
        const weaponElement = document.getElementById('player-summary-weapon');
        const armorElement = document.getElementById('player-summary-armor');
        
        if (maxHpElement) maxHpElement.textContent = player.maxHp.toString();
        if (maxMpElement) maxMpElement.textContent = player.maxMp.toString();
        if (attackElement) attackElement.textContent = player.getAttackPower().toString();
        if (weaponElement) weaponElement.textContent = equipment.weapon?.name || '素手';
        if (armorElement) armorElement.textContent = equipment.armor?.name || 'はだか';
    }
    
    /**
     * Show player details modal
     */
    private showPlayerDetails(): void {
        const player = this.game.getPlayer();
        const abilityLevels = player.getAbilityLevels();
        
        // Update stats tab
        this.updateElement('detail-hp', player.hp.toString());
        this.updateElement('detail-max-hp', player.maxHp.toString());
        this.updateElement('detail-mp', player.mp.toString());
        this.updateElement('detail-max-mp', player.maxMp.toString());
        this.updateElement('detail-attack', player.getAttackPower().toString());
        this.updateElement('detail-weapon-bonus', player.getWeaponAttackBonus().toString());
        this.updateElement('detail-armor-bonus', player.getArmorHpBonus().toString());
        
        // Update ability levels
        Object.entries(abilityLevels).forEach(([abilityType, data]) => {
            const prefix = abilityType.toLowerCase();
            this.updateElement(`${prefix}-level`, data.level.toString());
            this.updateElement(`${prefix}-exp`, data.experience.toString());
            this.updateElement(`${prefix}-next`, (data.experience + data.experienceToNext).toString());
            
            // Update progress bar
            const progressElement = document.getElementById(`${prefix}-progress`);
            if (progressElement && data.experienceToNext > 0) {
                const currentLevelExp = data.experience - (data.level > 0 ? Math.pow(data.level, 3) * 50 : 0);
                const nextLevelExp = Math.pow(data.level + 1, 3) * 50 - (data.level > 0 ? Math.pow(data.level, 3) * 50 : 0);
                const percentage = (currentLevelExp / nextLevelExp) * 100;
                progressElement.style.width = `${percentage}%`;
            }
        });
        
        // Update equipment tab
        this.updateEquipmentSelections();
        
        // Update skills tab
        this.updateSkillsList();
        
        // Update items tab
        this.updateItemsList();
        
        // Update debug controls visibility in modal
        this.updateDebugControlsVisibilityInModal();
        
        // Update skills tab debug controls with current values
        this.updateSkillsTabDebugControlsValues();
        
        // Show modal
        if (this.playerModal) {
            this.playerModal.show();
        }
    }
    
    /**
     * Update equipment selection UI
     */
    private updateEquipmentSelections(): void {
        const player = this.game.getPlayer();
        const availableWeapons = player.getAvailableWeapons();
        const availableArmors = player.getAvailableArmors();
        
        // Weapon selection
        const weaponSelection = document.getElementById('weapon-selection');
        if (weaponSelection) {
            weaponSelection.innerHTML = '';
            availableWeapons.forEach(weapon => {
                const isEquipped = player.equippedWeapon === weapon.id;
                const button = document.createElement('div');
                button.className = `form-check`;
                button.innerHTML = `
                    <input class="form-check-input" type="radio" name="weapon" id="weapon-${weapon.id}" 
                           value="${weapon.id}" ${isEquipped ? 'checked' : ''}>
                    <label class="form-check-label" for="weapon-${weapon.id}">
                        <strong>${weapon.name}</strong> (+${weapon.attackPowerBonus} 攻撃力)<br>
                        <small class="text-muted">${weapon.description}</small>
                    </label>
                `;
                weaponSelection.appendChild(button);
                
                const input = button.querySelector('input') as HTMLInputElement;
                input.addEventListener('change', () => {
                    if (input.checked) {
                        player.equipWeapon(weapon.id);
                        this.updatePlayerStatus();
                        PlayerSaveManager.saveEquipment(player.equippedWeapon, player.equippedArmor);
                    }
                });
            });
        }
        
        // Armor selection
        const armorSelection = document.getElementById('armor-selection');
        if (armorSelection) {
            armorSelection.innerHTML = '';
            availableArmors.forEach(armor => {
                const isEquipped = player.equippedArmor === armor.id;
                const button = document.createElement('div');
                button.className = `form-check`;
                button.innerHTML = `
                    <input class="form-check-input" type="radio" name="armor" id="armor-${armor.id}" 
                           value="${armor.id}" ${isEquipped ? 'checked' : ''}>
                    <label class="form-check-label" for="armor-${armor.id}">
                        <strong>${armor.name}</strong> (+${armor.hpBonus} HP)<br>
                        <small class="text-muted">${armor.description}</small>
                    </label>
                `;
                armorSelection.appendChild(button);
                
                const input = button.querySelector('input') as HTMLInputElement;
                input.addEventListener('change', () => {
                    if (input.checked) {
                        player.equipArmor(armor.id);
                        this.updatePlayerStatus();
                    }
                });
            });
        }
    }
    
    /**
     * Update items list UI
     */
    private updateItemsList(): void {
        const player = this.game.getPlayer();
        const itemList = document.getElementById('item-list');
        
        if (itemList) {
            itemList.innerHTML = '';
            
            Array.from(player.items.entries()).forEach(([_itemId, item]) => {
                if (item.count > 0) {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'mb-2 p-2 border rounded';
                    itemDiv.innerHTML = `
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <strong>${item.name}</strong> x${item.count}
                                <br><small class="text-muted">${item.description}</small>
                            </div>
                        </div>
                    `;
                    itemList.appendChild(itemDiv);
                }
            });
        }
    }
    
    /**
     * Helper method to update element text content
     */
    /**
     * Update skills tab
     */
    private updateSkillsList(): void {
        const player = this.game.getPlayer();
        const unlockedSkills = player.getUnlockedSkills();
        const unlockedPassiveSkills = player.getUnlockedPassiveSkills();
        
        // Update active skills
        const activeSkillsList = document.getElementById('active-skills-list');
        if (activeSkillsList) {
            activeSkillsList.innerHTML = '';
            
            const activeSkills = unlockedSkills.filter(skill => !skill.isPassive);
            
            if (activeSkills.length === 0) {
                activeSkillsList.innerHTML = '<div class="text-muted">解放されたスキルがありません</div>';
            } else {
                activeSkills.forEach(skill => {
                    const skillElement = document.createElement('div');
                    skillElement.className = 'skill-item mb-3 p-3 border rounded';
                    
                    const categoryColor = this.getSkillCategoryColor(skill.category);
                    const mpCostText = skill.mpCost > 0 ? `MP: ${skill.mpCost}` : 'MP: 0';
                    
                    skillElement.innerHTML = `
                        <div class="skill-header d-flex justify-content-between align-items-start mb-2">
                            <div class="skill-info flex-grow-1 me-3">
                                <h6 class="skill-name mb-1">${skill.name}</h6>
                                <p class="skill-description mb-0">${skill.description}</p>
                            </div>
                            <div class="skill-meta text-end flex-shrink-0">
                                <span class="badge bg-${categoryColor} mb-1">${this.getSkillCategoryName(skill.category)}</span>
                                <div class="skill-cost">${mpCostText}</div>
                            </div>
                        </div>
                        ${this.getSkillDetails(skill)}
                    `;
                    
                    activeSkillsList.appendChild(skillElement);
                });
            }
        }
        
        // Update passive skills
        const passiveSkillsList = document.getElementById('passive-skills-list');
        if (passiveSkillsList) {
            passiveSkillsList.innerHTML = '';
            
            if (unlockedPassiveSkills.length === 0) {
                passiveSkillsList.innerHTML = '<div class="text-muted">解放されたパッシブスキルがありません</div>';
            } else {
                unlockedPassiveSkills.forEach(skill => {
                    const skillElement = document.createElement('div');
                    skillElement.className = 'skill-item mb-3 p-3 border rounded';
                    
                    skillElement.innerHTML = `
                        <div class="skill-header d-flex justify-content-between align-items-start mb-2">
                            <div class="skill-info flex-grow-1 me-3">
                                <h6 class="skill-name mb-1">${skill.name}</h6>
                                <p class="skill-description mb-0">${skill.description}</p>
                            </div>
                            <div class="skill-meta text-end flex-shrink-0">
                                <span class="badge bg-info">パッシブ</span>
                            </div>
                        </div>
                        ${this.getSkillUnlockCondition(skill)}
                    `;
                    
                    passiveSkillsList.appendChild(skillElement);
                });
            }
        }
    }
    
    /**
     * Get skill category color for badge
     */
    private getSkillCategoryColor(category: string): string {
        switch (category) {
            case 'combat': return 'danger';
            case 'defense': return 'primary';
            case 'support': return 'success';
            case 'passive': return 'info';
            default: return 'secondary';
        }
    }
    
    /**
     * Get skill category name in Japanese
     */
    private getSkillCategoryName(category: string): string {
        switch (category) {
            case 'combat': return '攻撃';
            case 'defense': return '防御';
            case 'support': return '支援';
            case 'passive': return 'パッシブ';
            default: return 'その他';
        }
    }
    
    /**
     * Get skill details HTML
     */
    private getSkillDetails(skill: SkillData): string {
        const details = [];
        
        if (skill.damageMultiplier && skill.damageMultiplier > 1) {
            details.push(`威力: ${skill.damageMultiplier}倍`);
        }
        
        if (skill.criticalRate && skill.criticalRate > 0.05) {
            details.push(`クリティカル率: ${Math.round(skill.criticalRate * 100)}%`);
        }
        
        if (skill.hitRate && skill.hitRate < 1) {
            details.push(`命中率: ${Math.round(skill.hitRate * 100)}%`);
        }
        
        if (skill.healAmount) {
            details.push(`回復量: ${skill.healAmount}`);
        }
        
        if (skill.healPercentage) {
            details.push(`回復率: ${Math.round(skill.healPercentage * 100)}%`);
        }
        
        const unlockCondition = this.getSkillUnlockCondition(skill);
        
        if (details.length > 0 || unlockCondition) {
            return `
                <div class="skill-details">
                    ${details.length > 0 ? `<div class="skill-stats mb-1">${details.join(' / ')}</div>` : ''}
                    ${unlockCondition}
                </div>
            `;
        }
        
        return '';
    }
    
    /**
     * Get skill unlock condition HTML
     */
    private getSkillUnlockCondition(skill: SkillData): string {
        if (skill.unlockConditions && skill.unlockConditions.length > 0) {
            const conditions = skill.unlockConditions.map((condition: UnlockCondition) => {
                const abilityName = this.getAbilityName(condition.abilityType);
                return `${abilityName}レベル${condition.requiredLevel}`;
            });
            return `<div class="skill-unlock-condition">解放条件: ${conditions.join(', ')}</div>`;
        }
        return '';
    }
    
    /**
     * Get ability name in Japanese
     */
    private getAbilityName(abilityType: string): string {
        switch (abilityType) {
            case 'combat': return 'コンバット';
            case 'toughness': return 'タフネス';
            case 'craftwork': return 'クラフトワーク';
            case 'endurance': return 'エンデュランス';
            case 'agility': return 'アジリティ';
            default: return abilityType;
        }
    }
    
    private updateElement(id: string, value: string): void {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
    
    
    
    /**
     * Export save data to file
     */
    private exportSaveData(): void {
        try {
            const saveData = PlayerSaveManager.exportSaveData();
            const blob = new Blob([saveData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `eel_rpg_save_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showMessage('セーブデータをエクスポートしました', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            this.showMessage('エクスポートに失敗しました', 'error');
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
                const success = PlayerSaveManager.importSaveData(content);
                
                if (success) {
                    this.showMessage('セーブデータをインポートしました', 'success');
                    // Reload the player to reflect imported data
                    this.game.startGame();
                } else {
                    this.showMessage('無効なセーブデータです', 'error');
                }
            } catch (error) {
                console.error('Import failed:', error);
                this.showMessage('インポートに失敗しました', 'error');
            }
        };
        reader.readAsText(file);
    }
    
    /**
     * Delete save data
     */
    private deleteSaveData(): void {
        if (confirm('全てのセーブデータを削除しますか？この操作は取り消せません。')) {
            PlayerSaveManager.clearSaveData();
            this.showMessage('セーブデータを削除しました', 'success');
            // Reload the player to reflect cleared data
            this.game.startGame();
        }
    }
    
    
    /**
     * Initialize modal save data management buttons
     */
    private initializeModalSaveDataButtons(): void {
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
     * Update debug controls visibility in modal
     */
    private updateDebugControlsVisibilityInModal(): void {
        const debugControlsSkills = document.getElementById('debug-controls-skills');
        const isDebugMode = this.game.isDebugMode();
        
        if (debugControlsSkills) {
            debugControlsSkills.classList.toggle('d-none', !isDebugMode);
        }
    }
    
    /**
     * Show message to user
     */
    private showMessage(message: string, type: 'success' | 'error'): void {
        // Create and show a bootstrap alert
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`;
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.zIndex = '9999';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 3000);
    }

    /**
     * Update skills tab debug controls with current values
     */
    private updateSkillsTabDebugControlsValues(): void {
        const player = this.game.getPlayer();
        const abilityLevels = player.getAbilityLevels();
        
        // Update individual ability input fields
        Object.entries(abilityLevels).forEach(([abilityType, data]) => {
            const inputElement = document.getElementById(`debug-${abilityType.toLowerCase()}-level`) as HTMLInputElement;
            if (inputElement) {
                inputElement.value = data.level.toString();
            }
        });
    }

    /**
     * Update ability level from skills tab
     */
    private updateAbilityLevelFromSkillsTab(abilityType: string): void {
        const inputElement = document.getElementById(`debug-${abilityType}-level`) as HTMLInputElement;
        if (!inputElement) return;
        
        const level = parseInt(inputElement.value);
        if (isNaN(level) || level < 0 || level > 10) {
            this.showMessage('レベルは0から10の間で入力してください', 'error');
            return;
        }
        
        const player = this.game.getPlayer();
        const ability = player.abilitySystem.getAbility(abilityType as AbilityType);
        if (ability) {
            ability.level = level;
            ability.experience = level > 0 ? Math.pow(level, 3) * 50 : 0;
            
            player.recalculateStats();
            player.saveToStorage();
            this.updatePlayerStatus();
            this.showPlayerDetails(); // Refresh modal content
            this.showMessage(`${this.getAbilityName(abilityType)}をレベル${level}に設定しました`, 'success');
        }
    }

    /**
     * Update all ability levels from skills tab
     */
    private updateAllAbilityLevelsFromSkillsTab(): void {
        const inputElement = document.getElementById('debug-all-level') as HTMLInputElement;
        if (!inputElement) return;
        
        const level = parseInt(inputElement.value);
        if (isNaN(level) || level < 0 || level > 10) {
            this.showMessage('レベルは0から10の間で入力してください', 'error');
            return;
        }
        
        const player = this.game.getPlayer();
        Object.values(AbilityType).forEach(abilityType => {
            const ability = player.abilitySystem.getAbility(abilityType);
            if (ability) {
                ability.level = level;
                ability.experience = level > 0 ? Math.pow(level, 3) * 50 : 0;
            }
        });
        
        player.recalculateStats();
        player.saveToStorage();
        this.updatePlayerStatus();
        this.showPlayerDetails(); // Refresh modal content
        this.showMessage(`全てのアビリティをレベル${level}に設定しました`, 'success');
    }
}