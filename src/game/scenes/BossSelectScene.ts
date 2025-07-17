import { Game } from '../Game';
import { getAllBossData } from '../data/index';
import { PlayerSaveManager } from '../systems/PlayerSaveData';

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
    }
    
    enter(): void {
        console.log('Entered boss select scene');
        
        // Update boss card information
        this.updateBossCards();
        
        // Update player status display
        this.updatePlayerStatus();
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
    private getSkillDetails(skill: any): string {
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
    private getSkillUnlockCondition(skill: any): string {
        if (skill.unlockConditions && skill.unlockConditions.length > 0) {
            const conditions = skill.unlockConditions.map((condition: any) => {
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
}