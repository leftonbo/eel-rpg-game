import { Game } from '../Game';
import { getAllBossData, getBossData } from '../data';
import { PlayerSaveManager } from '../systems/PlayerSaveData';
import { AbilityType } from '../systems/AbilitySystem';
import { SkillData, UnlockCondition } from '../data/skills';
import { ModalUtils } from '../utils/ModalUtils';
import { Trophy, MemorialSaveData } from '../systems/MemorialSystem';
import { getIconsByCategory } from '../data/PlayerIcons';
import { DEFAULT_PLAYER_NAME, DEFAULT_PLAYER_ICON } from '../entities/Player';
import type { BootstrapModal } from '../types/bootstrap';

export class BossSelectScene {
    private game: Game;
    private bossCards: NodeListOf<Element> | null = null;
    private bossModal: BootstrapModal | null = null; // Bootstrap modal for boss details
    private playerModal: BootstrapModal | null = null; // Bootstrap modal for player details
    private playerInfoEditModal: BootstrapModal | null = null; // Bootstrap modal for player info editing
    private selectedBossId: string = '';
    private selectedIcon: string = '🐍'; // Temporary storage for icon selection
    
    constructor(game: Game) {
        this.game = game;
        this.init();
    }
    
    private init(): void {
        // Generate boss cards dynamically
        this.generateBossCards();
        
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

        // Initialize player info edit modal
        const playerInfoEditModalElement = document.getElementById('player-info-edit-modal');
        if (playerInfoEditModalElement && window.bootstrap) {
            this.playerInfoEditModal = new window.bootstrap.Modal(playerInfoEditModalElement);
        }
        
        // Player details button
        const playerDetailsButton = document.getElementById('player-details-btn');
        if (playerDetailsButton) {
            playerDetailsButton.addEventListener('click', () => {
                this.showPlayerDetails();
            });
        }

        // Player info edit button
        const editPlayerInfoButton = document.getElementById('edit-player-info-btn');
        if (editPlayerInfoButton) {
            editPlayerInfoButton.addEventListener('click', () => {
                this.showPlayerInfoEditModal();
            });
        }

        // Save player info button
        const savePlayerInfoButton = document.getElementById('save-player-info-btn');
        if (savePlayerInfoButton) {
            savePlayerInfoButton.addEventListener('click', () => {
                this.savePlayerInfo();
            });
        }

        // Reset player info button
        const resetPlayerInfoButton = document.getElementById('reset-player-info-btn');
        if (resetPlayerInfoButton) {
            resetPlayerInfoButton.addEventListener('click', () => {
                this.resetPlayerInfo();
            });
        }

        // Icon category tabs
        document.querySelectorAll('[data-icon-category]').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const category = (e.target as HTMLElement).getAttribute('data-icon-category');
                if (category) {
                    this.showIconCategory(category);
                }
            });
        });
        
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
        
        // Reset boss selection button state
        this.resetConfirmButtonState();
        
        // Update boss card information
        this.updateBossCards();
        
        // Update player status display
        this.updatePlayerStatus();
        
        // Show/hide debug controls based on debug mode
        this.updateDebugControlsVisibilityInModal();
    }
    
    private resetConfirmButtonState(): void {
        const confirmButton = document.getElementById('confirm-boss-btn') as HTMLButtonElement;
        if (confirmButton) {
            confirmButton.disabled = false;
            confirmButton.textContent = '戦闘開始';
        }
    }

    private updateBossCards(): void {
        // Regenerate boss cards to ensure proper sorting and data
        this.generateBossCards();
        
        // Re-query boss cards after regeneration
        this.bossCards = document.querySelectorAll('.boss-card');
        
        // Set up event listeners for the newly generated cards
        this.bossCards.forEach(card => {
            card.addEventListener('click', (_e) => {
                const bossId = card.getAttribute('data-boss');
                if (bossId) {
                    this.onBossSelect(bossId);
                }
            });
        });
        
        // Update status and visibility for each card
        const player = this.game.getPlayer();
        const memorialSystem = player.memorialSystem;
        const memorialData = memorialSystem.exportData();
        const playerExplorerLevel = player.getExplorerLevel();
        
        this.bossCards.forEach(card => {
            const bossId = card.getAttribute('data-boss');
            if (bossId) {
                const bossData = getAllBossData().find(boss => boss.id === bossId);
                
                if (bossData) {
                    const textElement = card.querySelector('.card-text');
                    const requiredLevel = bossData.explorerLevelRequired || 0;
                    const isUnlocked = playerExplorerLevel >= requiredLevel;
                    
                    // Update description based on unlock status
                    if (textElement) {
                        if (isUnlocked) {
                            textElement.textContent = bossData.description;
                        } else {
                            textElement.textContent = `🔒 エクスプローラーLv.${requiredLevel}で解禁`;
                        }
                    }
                    
                    // Update boss status badges
                    this.updateBossStatusBadge(bossId, memorialData);
                    
                    // Show/hide card based on unlock status
                    if (isUnlocked) {
                        card.classList.remove('d-none');
                        card.classList.remove('boss-card-locked');
                        (card as HTMLElement).style.pointerEvents = 'auto';
                        (card as HTMLElement).style.opacity = '1';
                    } else {
                        card.classList.add('d-none');
                    }
                }
            }
        });
    }
    
    /**
     * Update boss status badges based on battle history.
     * 
     * This method updates the visibility and content of the victory and defeat badges
     * for a given boss based on the player's battle history stored in the memorial data.
     * 
     * - If the player has achieved a victory (`dateFirstWin` is present), the victory badge
     *   is displayed with a trophy icon (🏆) and a tooltip indicating "勝利済み" (victory achieved).
     * - If the player has experienced a defeat (`dateFirstLost` is present), the defeat badge
     *   is displayed with a skull icon (💀) and a tooltip indicating "敗北済み" (defeat experienced).
     * - If both victory and defeat are present, both badges are displayed side by side.
     * - By default, both badges are hidden if no battle history is available for the boss.
     */
    private updateBossStatusBadge(bossId: string, memorialData: MemorialSaveData): void {
        const victoryBadge = document.getElementById(`boss-status-victory-${bossId}`);
        const defeatBadge = document.getElementById(`boss-status-defeat-${bossId}`);
        
        if (!victoryBadge || !defeatBadge) return;
        
        // Find boss memorial record
        const memorial = memorialData.bossMemorials.find(m => m.bossId === bossId);
        
        // Default: hide both badges
        victoryBadge.style.display = 'none';
        defeatBadge.style.display = 'none';
        
        if (memorial) {
            const hasVictory = memorial.dateFirstWin;
            const hasDefeat = memorial.dateFirstLost;
            
            if (hasVictory) {
                // Show victory badge
                victoryBadge.style.display = 'flex';
                victoryBadge.textContent = '🏆';
                victoryBadge.title = '勝利済み';
            }
            
            if (hasDefeat) {
                // Show defeat badge
                defeatBadge.style.display = 'flex';
                defeatBadge.textContent = '💀';
                defeatBadge.title = '敗北済み';
            }
        }
    }
    
    /**
     * Generate boss cards dynamically from boss data
     */
    private generateBossCards(): void {
        const container = document.getElementById('boss-cards-container');
        if (!container) return;
        
        // Get all boss data and sort by explorerLevelRequired first, then by id
        const allBossData = getAllBossData();
        const sortedBossData = allBossData.sort((a, b) => {
            const aLevel = a.explorerLevelRequired || 0;
            const bLevel = b.explorerLevelRequired || 0;
            
            // First sort by explorer level required
            if (aLevel !== bLevel) {
                return aLevel - bLevel;
            }
            
            // Then sort by id alphabetically
            return a.id.localeCompare(b.id);
        });
        
        // Clear existing content
        container.innerHTML = '';
        
        // Generate cards for each boss
        sortedBossData.forEach(bossData => {
            const cardHTML = `
                <div class="col-md-4 mb-4">
                    <div class="card bg-secondary h-100 boss-card" data-boss="${bossData.id}">
                        <div class="boss-status-container">
                            <div class="boss-status-badge victory" id="boss-status-victory-${bossData.id}"></div>
                            <div class="boss-status-badge defeat" id="boss-status-defeat-${bossData.id}"></div>
                        </div>
                        <div class="card-body text-center">
                            <h3 class="card-title">${bossData.displayName}</h3>
                            <p class="card-text">${bossData.description}</p>
                            <button class="btn btn-primary w-100">選択</button>
                        </div>
                    </div>
                </div>
            `;
            
            container.innerHTML += cardHTML;
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
        const bossData = getBossData(bossId);
        
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
            
            try {
                // Start battle with selected boss
                this.game.selectBoss(this.selectedBossId);
            } catch (error) {
                console.error('Failed to load boss:', error);
                
                // Show user-friendly error message using existing toast utility
                const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
                ModalUtils.showToast(
                    `ボスデータの読み込みに失敗しました: ${errorMessage}`,
                    'error'
                );
                
                // Re-show modal so user can try again
                if (this.bossModal) {
                    this.bossModal.show();
                }
            }
        }
    }
    
    /**
     * Update player status display in boss select screen
     */
    private updatePlayerStatus(): void {
        const player = this.game.getPlayer();
        const equipment = player.getEquipmentInfo();
        
        // Update player header (name and icon)
        this.updateElement('player-header-name', player.name);
        this.updateElement('player-header-icon', player.icon);
        
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

        // Update player modal header
        this.updateElement('player-modal-name', player.name);
        this.updateElement('player-modal-icon', player.icon);
        
        // Update stats tab
        this.updateElement('detail-max-hp', player.maxHp.toString());
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
            
            // Special handling for explorer ability in stats tab
            if (abilityType === 'explorer') {
                this.updateElement('explorer-level-stats', data.level.toString());
                this.updateElement('explorer-exp-stats', data.experience.toString());
                this.updateElement('explorer-next-stats', (data.experience + data.experienceToNext).toString());
                
                const statsProgressElement = document.getElementById('explorer-progress-stats');
                if (statsProgressElement && data.experienceToNext > 0) {
                    const currentLevelExp = data.experience - (data.level > 0 ? Math.pow(data.level, 3) * 50 : 0);
                    const nextLevelExp = Math.pow(data.level + 1, 3) * 50 - (data.level > 0 ? Math.pow(data.level, 3) * 50 : 0);
                    const percentage = (currentLevelExp / nextLevelExp) * 100;
                    statsProgressElement.style.width = `${percentage}%`;
                }
            }
        });
        
        // Update equipment tab
        this.updateEquipmentSelections();
        
        // Update skills tab
        this.updateSkillsList();
        
        // Update items tab
        this.updateItemsList();
        
        // Update explorer tab
        this.updateExplorerTab();
        
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
                return `${abilityName}レベル ${condition.requiredLevel}`;
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
                const success = PlayerSaveManager.importSaveData(content);
                
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
            ModalUtils.showToast('レベルは 0 から 10 の間で入力してください', 'error');
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
            ModalUtils.showToast(`${this.getAbilityName(abilityType)}をレベル ${level} に設定しました`, 'success');
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
            ModalUtils.showToast('レベルは 0 から 10 の間で入力してください', 'error');
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
        ModalUtils.showToast(`全てのアビリティをレベル ${level} に設定しました`, 'success');
    }

    /**
     * Update explorer tab with current stats and trophies
     */
    private updateExplorerTab(): void {
        const player = this.game.getPlayer();
        const abilityLevels = player.getAbilityLevels();
        const explorerData = abilityLevels[AbilityType.Explorer];
        
        if (explorerData) {
            this.updateElement('explorer-level', explorerData.level.toString());
            this.updateElement('explorer-exp', explorerData.experience.toString());
            this.updateElement('explorer-next', (explorerData.experience + explorerData.experienceToNext).toString());
            
            // Update progress bar
            const progressElement = document.getElementById('explorer-progress');
            if (progressElement && explorerData.experienceToNext > 0) {
                const currentLevelExp = explorerData.experience - (explorerData.level > 0 ? Math.pow(explorerData.level, 3) * 50 : 0);
                const nextLevelExp = Math.pow(explorerData.level + 1, 3) * 50 - (explorerData.level > 0 ? Math.pow(explorerData.level, 3) * 50 : 0);
                const percentage = (currentLevelExp / nextLevelExp) * 100;
                progressElement.style.width = `${percentage}%`;
            }
            
            // Update accessible terrain
            this.updateAccessibleTerrains(player.getAccessibleTerrains());
        }
        
        // Update statistics
        const allBossData = getAllBossData();
        const unlockedCount = allBossData.filter(boss => 
            boss.explorerLevelRequired || 0 <= player.getExplorerLevel()
        ).length;
        this.updateElement('unlocked-bosses-count', unlockedCount.toString());
        
        const allTrophies = player.memorialSystem.getAllTrophies();
        this.updateElement('total-trophies-count', allTrophies.length.toString());
        
        const totalExplorerExp = explorerData?.experience || 0;
        this.updateElement('total-explorer-exp', totalExplorerExp.toString());
        
        // Update trophies collection
        this.updateTrophiesCollection(allTrophies);
    }
    
    /**
     * Update trophies collection display
     */
    private updateTrophiesCollection(trophies: Trophy[]): void {
        const trophiesContainer = document.getElementById('trophies-collection');
        const noTrophiesMessage = document.getElementById('no-trophies-message');
        
        if (!trophiesContainer || !noTrophiesMessage) return;
        
        if (trophies.length === 0) {
            trophiesContainer.innerHTML = '';
            noTrophiesMessage.style.display = 'block';
            return;
        }
        
        noTrophiesMessage.style.display = 'none';
        trophiesContainer.innerHTML = '';
        
        trophies.forEach(trophy => {
            const trophyCard = document.createElement('div');
            trophyCard.className = 'col-md-6 mb-3';
            
            const typeIcon = trophy.type === 'victory' ? '🏆' : '💀';
            const typeClass = trophy.type === 'victory' ? 'success' : 'info';
            const dateStr = new Date(trophy.dateObtained).toLocaleDateString('ja-JP');
            
            trophyCard.innerHTML = `
                <div class="card bg-secondary">
                    <div class="card-body">
                        <h6 class="card-title d-flex justify-content-between align-items-center">
                            ${typeIcon} ${trophy.name}
                            <span class="badge bg-${typeClass}">+${trophy.explorerExp} EXP</span>
                        </h6>
                        <p class="card-text small">${trophy.description}</p>
                        <small class="text-muted">獲得日: ${dateStr}</small>
                    </div>
                </div>
            `;
            
            trophiesContainer.appendChild(trophyCard);
        });
    }
    
    /**
     * Update accessible terrains with multiple badges
     */
    private updateAccessibleTerrains(terrains: string[]): void {
        const container = document.getElementById('accessible-terrains-container');
        if (!container) return;
        
        // Clear existing content
        container.innerHTML = '';
        
        // Terrain color mapping
        const terrainColors: { [key: string]: string } = {
            '近隣の地方': 'secondary',
            '砂漠': 'warning',
            '海': 'info',
            'ジャングル': 'success',
            '洞窟': 'dark',
            '遺跡': 'danger',
            '廃墟': 'danger',
            '寒冷地': 'light text-dark',
            '火山': 'danger',
            '天空': 'primary',
            '魔界': 'dark'
        };
        
        // Create badge for each terrain
        terrains.forEach(terrain => {
            const badge = document.createElement('span');
            const colorClass = terrainColors[terrain] || 'secondary';
            badge.className = `badge bg-${colorClass} fs-6`;
            badge.textContent = terrain;
            container.appendChild(badge);
        });
    }

    /**
     * Show player info edit modal
     */
    private showPlayerInfoEditModal(): void {
        const player = this.game.getPlayer();
        
        // Update current player info display
        this.updateElement('current-player-name', player.name);
        this.updateElement('current-player-icon', player.icon);
        
        // Set current values in form
        const nameInput = document.getElementById('player-name-input') as HTMLInputElement;
        if (nameInput) {
            nameInput.value = player.name;
        }
        
        // Initialize icon selection
        this.selectedIcon = player.icon;
        this.updateElement('selected-player-icon', this.selectedIcon);
        
        // Show icons for default category
        this.showIconCategory('動物');
        
        // Show modal
        if (this.playerInfoEditModal) {
            this.playerInfoEditModal.show();
        }
    }

    /**
     * Show icons for specified category
     */
    private showIconCategory(category: string): void {
        const iconsGrid = document.getElementById('icon-selection-grid');
        if (!iconsGrid) return;
        
        // Update tab active state
        document.querySelectorAll('#icon-category-tabs .nav-link').forEach(tab => {
            const tabCategory = tab.getAttribute('data-category');
            if (tabCategory === category) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Clear and populate icons
        iconsGrid.innerHTML = '';
        const categoryIcons = getIconsByCategory(category);
        
        categoryIcons.forEach(icon => {
            const iconButton = document.createElement('button');
            iconButton.type = 'button';
            iconButton.className = `btn btn-outline-secondary m-1 ${this.selectedIcon === icon.emoji ? 'active' : ''}`;
            iconButton.style.fontSize = '1.5rem';
            iconButton.title = icon.name;
            iconButton.textContent = icon.emoji;
            
            iconButton.addEventListener('click', () => {
                this.selectedIcon = icon.emoji;
                this.updateElement('selected-player-icon', this.selectedIcon);
                
                // Update active state
                iconsGrid.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
                iconButton.classList.add('active');
            });
            
            iconsGrid.appendChild(iconButton);
        });
    }

    /**
     * Save player info changes
     */
    private savePlayerInfo(): void {
        const nameInput = document.getElementById('player-name-input') as HTMLInputElement;
        if (!nameInput) return;
        
        const newName = nameInput.value.trim();
        
        // Validation
        if (!newName) {
            ModalUtils.showToast('名前を入力してください', 'error');
            return;
        }
        
        if (newName.length > 32) {
            ModalUtils.showToast('名前は32文字以内で入力してください', 'error');
            return;
        }
        
        // Update player info
        const player = this.game.getPlayer();
        const oldName = player.name;
        const oldIcon = player.icon;
        
        player.updatePlayerInfo(newName, this.selectedIcon);
        
        // Close modal
        if (this.playerInfoEditModal) {
            this.playerInfoEditModal.hide();
        }
        
        // Update player status display
        this.updatePlayerStatus();
        
        // If player details modal is open, update it
        if (this.playerModal) {
            try {
                // Check if modal is shown (may not be available on all Bootstrap versions)
                this.showPlayerDetails();
            } catch (e) {
                // Ignore if modal methods are not available
            }
        }
        
        // Show success toast
        const changedItems = [];
        if (oldName !== newName) changedItems.push('名前');
        if (oldIcon !== this.selectedIcon) changedItems.push('アイコン');
        
        const changeMessage = changedItems.length > 0 
            ? `${changedItems.join('と')}を変更しました` 
            : '変更はありませんでした';
        
        ModalUtils.showToast(changeMessage, 'success');
    }

    /**
     * Reset player info to default values
     */
    private resetPlayerInfo(): void {
        // Reset form fields to default values
        const nameInput = document.getElementById('player-name-input') as HTMLInputElement;
        if (nameInput) {
            nameInput.value = DEFAULT_PLAYER_NAME;
        }

        // Reset selected icon
        this.selectedIcon = DEFAULT_PLAYER_ICON;
        this.updateElement('selected-player-icon', this.selectedIcon);

        // Update current values display
        this.updateElement('current-player-name', DEFAULT_PLAYER_NAME);
        this.updateElement('current-player-icon', DEFAULT_PLAYER_ICON);

        // Refresh icon grid to update active state
        const activeCategory = document.querySelector('#icon-category-tabs .nav-link.active')?.getAttribute('data-category');
        if (activeCategory) {
            this.showIconCategory(activeCategory);
        }

        ModalUtils.showToast('プレイヤー情報を初期状態にリセットしました', 'info');
    }
}