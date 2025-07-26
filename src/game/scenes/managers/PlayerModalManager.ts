import { Game } from '../../Game';
import { AbilityType, AbilitySystem } from '../../systems/AbilitySystem';
import { getAllBossData } from '../../data';
import { Trophy } from '../../systems/MemorialSystem';
import type { BootstrapModal } from '../../types/bootstrap';
import { TrophyDisplayComponent } from '../components/TrophyDisplayComponent';
import { EquipmentSelectorComponent } from '../components/EquipmentSelectorComponent';
import { SkillDisplayComponent } from '../components/SkillDisplayComponent';

export class PlayerModalManager {
    private game: Game;
    private playerModal: BootstrapModal | null = null;

    constructor(game: Game) {
        this.game = game;
        this.initializePlayerModal();
    }

    /**
     * Initialize player modal
     */
    private initializePlayerModal(): void {
        const playerModalElement = document.getElementById('player-details-modal');
        if (playerModalElement && window.bootstrap) {
            this.playerModal = new window.bootstrap.Modal(playerModalElement);
        }

        // Player info edit button
        const editPlayerInfoButton = document.getElementById('edit-player-info-btn');
        if (editPlayerInfoButton) {
            editPlayerInfoButton.addEventListener('click', () => {
                // This will be handled by PlayerInfoEditManager
                const event = new CustomEvent('showPlayerInfoEdit');
                document.dispatchEvent(event);
            });
        }
    }

    /**
     * Show player details modal
     */
    showPlayerDetails(): void {
        const player = this.game.getPlayer();
        const abilityLevels = player.getAbilityLevels();

        // Update player modal header
        this.updateElement('player-modal-name', player.name);
        this.updateElement('player-modal-icon', player.icon);
        
        // Update stats tab
        this.updatePlayerStatsTab(player, abilityLevels);
        
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
     * Update player stats tab
     */
    private updatePlayerStatsTab(player: any, abilityLevels: any): void {
        this.updateElement('detail-max-hp', player.maxHp.toString());
        this.updateElement('detail-max-mp', player.maxMp.toString());
        this.updateElement('detail-attack', player.getAttackPower().toString());
        this.updateElement('detail-weapon-bonus', player.equipmentManager.getWeaponAttackBonus().toString());
        this.updateElement('detail-armor-bonus', player.equipmentManager.getArmorHpBonus().toString());
        
        // Update ability levels
        Object.entries(abilityLevels).forEach(([abilityType, data]: [string, any]) => {
            const prefix = abilityType.toLowerCase();
            this.updateElement(`${prefix}-level`, data.level.toString());
            this.updateElement(`${prefix}-exp`, data.experience.toString());
            
            // Update next level requirement display
            if (data.level >= AbilitySystem.MAX_LEVEL) {
                // Max level: show total experience required for max level
                const maxLevelRequirement = player.abilitySystem.getRequiredExperienceForLevel(AbilitySystem.MAX_LEVEL);
                this.updateElement(`${prefix}-next`, maxLevelRequirement.toString());
            } else {
                this.updateElement(`${prefix}-next`, (data.experience + data.experienceToNext).toString());
            }
            
            // Update progress bar
            this.updateProgressBar(prefix, data, player.abilitySystem);
            
            // Special handling for explorer ability in stats tab
            if (abilityType === 'explorer') {
                this.updateExplorerStatsSection(data, player.abilitySystem);
            }
        });
    }

    /**
     * Update progress bar for ability
     */
    private updateProgressBar(prefix: string, data: any, abilitySystem: AbilitySystem): void {
        const progressElement = document.getElementById(`${prefix}-progress`);
        if (!progressElement) return;
        
        if (data.level >= AbilitySystem.MAX_LEVEL) {
            // Max level: 100% progress with warning style and stripes
            progressElement.style.width = '100%';
            progressElement.className = 'progress-bar bg-warning progress-bar-striped progress-bar-animated';
        } else if (data.experienceToNext > 0) {
            // Normal level progression using AbilitySystem methods
            const currentLevelRequirement = abilitySystem.getRequiredExperienceForLevel(data.level);
            const nextLevelRequirement = abilitySystem.getRequiredExperienceForLevel(data.level + 1);
            const currentLevelExp = data.experience - currentLevelRequirement;
            const levelRangeExp = nextLevelRequirement - currentLevelRequirement;
            const percentage = (currentLevelExp / levelRangeExp) * 100;
            
            progressElement.style.width = `${percentage}%`;
            progressElement.className = 'progress-bar bg-info';
        }
    }

    /**
     * Update explorer stats section
     */
    private updateExplorerStatsSection(data: any, abilitySystem: AbilitySystem): void {
        this.updateElement('explorer-level-stats', data.level.toString());
        this.updateElement('explorer-exp-stats', data.experience.toString());
        
        // Update next level requirement display for stats section
        if (data.level >= AbilitySystem.MAX_LEVEL) {
            // Max level: show total experience required for max level
            const maxLevelRequirement = abilitySystem.getRequiredExperienceForLevel(AbilitySystem.MAX_LEVEL);
            this.updateElement('explorer-next-stats', maxLevelRequirement.toString());
        } else {
            this.updateElement('explorer-next-stats', (data.experience + data.experienceToNext).toString());
        }
        
        const statsProgressElement = document.getElementById('explorer-progress-stats');
        if (statsProgressElement) {
            if (data.level >= AbilitySystem.MAX_LEVEL) {
                // Max level: 100% progress with warning style and stripes
                statsProgressElement.style.width = '100%';
                statsProgressElement.className = 'progress-bar bg-warning progress-bar-striped progress-bar-animated';
            } else if (data.experienceToNext > 0) {
                // Normal level progression using AbilitySystem methods
                const currentLevelRequirement = abilitySystem.getRequiredExperienceForLevel(data.level);
                const nextLevelRequirement = abilitySystem.getRequiredExperienceForLevel(data.level + 1);
                const currentLevelExp = data.experience - currentLevelRequirement;
                const levelRangeExp = nextLevelRequirement - currentLevelRequirement;
                const percentage = (currentLevelExp / levelRangeExp) * 100;
                
                statsProgressElement.style.width = `${percentage}%`;
                statsProgressElement.className = 'progress-bar bg-info';
            }
        }
    }

    /**
     * Update equipment selection UI
     */
    private updateEquipmentSelections(): void {
        const player = this.game.getPlayer();
        const availableWeapons = player.getAvailableWeapons();
        const availableArmors = player.getAvailableArmors();
        
        // Use EquipmentSelectorComponent for weapon selection
        EquipmentSelectorComponent.updateWeaponSelection(
            'weapon-selection',
            availableWeapons,
            player.getEquipmentInfo().weapon?.id || null,
            (weaponId: string) => {
                player.equipWeapon(weaponId);
                const event = new CustomEvent('updatePlayerSummary');
                document.dispatchEvent(event);
            }
        );
        
        // Use EquipmentSelectorComponent for armor selection
        EquipmentSelectorComponent.updateArmorSelection(
            'armor-selection',
            availableArmors,
            player.getEquipmentInfo().armor?.id || null,
            (armorId: string) => {
                player.equipArmor(armorId);
                const event = new CustomEvent('updatePlayerSummary');
                document.dispatchEvent(event);
            }
        );
    }

    
    /**
     * Update items list UI
     */
    private updateItemsList(): void {
        const player = this.game.getPlayer();
        const itemList = document.getElementById('item-list');
        
        if (itemList) {
            itemList.innerHTML = '';
            
            player.itemManager.getUsableItems().forEach((item) => {
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
     * Update skills tab
     */
    private updateSkillsList(): void {
        const player = this.game.getPlayer();
        const unlockedSkills = player.getUnlockedSkills();
        const unlockedPassiveSkills = player.getUnlockedPassiveSkills();
        
        // Use SkillDisplayComponent for active skills
        SkillDisplayComponent.updateActiveSkillsList('active-skills-list', unlockedSkills);
        
        // Use SkillDisplayComponent for passive skills
        SkillDisplayComponent.updatePassiveSkillsList('passive-skills-list', unlockedPassiveSkills);
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
            
            // Update next level requirement display for explorer tab
            if (explorerData.level >= AbilitySystem.MAX_LEVEL) {
                // Max level: show total experience required for max level
                const maxLevelRequirement = player.abilitySystem.getRequiredExperienceForLevel(AbilitySystem.MAX_LEVEL);
                this.updateElement('explorer-next', maxLevelRequirement.toString());
            } else {
                this.updateElement('explorer-next', (explorerData.experience + explorerData.experienceToNext).toString());
            }
            
            // Update progress bar
            this.updateProgressBar('explorer', explorerData, player.abilitySystem);
            
            // Update accessible terrain
            this.updateAccessibleTerrains(player.getAccessibleTerrains());
        }
        
        // Update statistics
        const allBossData = getAllBossData();
        const unlockedCount = allBossData.filter(boss => 
            boss.explorerLevelRequired || 0 <= player.getExplorerLevel()
        ).length;
        this.updateElement('unlocked-bosses-count', unlockedCount.toString());
        this.updateElement('unlockable-bosses-count', allBossData.length.toString());
        
        const allTrophies = player.memorialSystem.getAllTrophies();
        this.updateElement('total-trophies-count', allTrophies.length.toString());
        
        const totalExplorerExp = explorerData?.experience || 0;
        this.updateElement('total-explorer-exp', totalExplorerExp.toString());
        
        // Update trophies collection
        this.updateTrophiesCollection(allTrophies);
    }
    
    /**
     * Update trophies collection display using TrophyDisplayComponent
     */
    private updateTrophiesCollection(trophies: Trophy[]): void {
        TrophyDisplayComponent.updateTrophiesCollection(
            'trophies-collection',
            'no-trophies-message',
            trophies
        );
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
        Object.entries(abilityLevels).forEach(([abilityType, data]: [string, any]) => {
            const inputElement = document.getElementById(`debug-${abilityType.toLowerCase()}-level`) as HTMLInputElement;
            if (inputElement) {
                inputElement.value = data.level.toString();
            }
        });
    }

    /**
     * Helper method to update element text content
     */
    private updateElement(id: string, value: string): void {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
}