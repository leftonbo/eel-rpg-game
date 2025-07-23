import { Game } from '../Game';
import { Player, SkillType } from '../entities/Player';
import { Boss, ActionType, formatMessage } from '../entities/Boss';
import { StatusEffect, StatusEffectType } from '../systems/StatusEffect';
import { calculateAttackResult } from '../utils/CombatUtils';
import { BattleResultStatus, calculateBattleResult } from './BattleResultScene';
import { ModalUtils } from '../utils/ModalUtils';

/**
 * メッセージ進行データ
 * 話者、表示スタイル、テキストを定義
 */
export interface MessageData {
    /**
     * 話者
     * プレイヤー、ボス、システムメッセージのいずれか
     * 省略時は 'system' として扱う
     */
    speaker?: 'player' | 'boss' | 'system';
    /**
     * ダイアログスタイル (player, boss 時)
     * 'default' は通常のダイアログ (デフォルト)
     * 'talk' は会話風のスタイル
     */
    style?: 'default' | 'talk';
    /**
     * メッセージテキスト
     * */
    text: string;
}

export class BattleScene {
    /**
     * The main game instance that this scene belongs to.
     * This is used to access the player, bosses, and other game state.
     */
    private game: Game;
    
    /**
     * The player character in the battle.
     * This is the entity controlled by the player, which can perform actions.
     * Initialized when the battle starts and set to null when the battle ends.
     */
    private player: Player | null = null;
    
    /**
     * The current boss being fought in the battle.
     * This is the enemy entity that the player must defeat.
     * Initialized when the battle starts and set to null when the battle ends.
     */
    private boss: Boss | null = null;
    
    /**
     * Tracks the current round number in the battle sequence.
     * Initialized to 0 at the start of a battle and incremented each round.
     * "Round" means a complete cycle of player and boss actions.
     * Round 0 is used for pre-battle state setup.
     * Round 1 is the first actual round of combat, then it continues incrementing.
     */
    private roundCount: number = 0;
    
    /**
     * Indicates whether it is currently the player's turn.
     * Set to true when the player can take an action, false when the boss is acting.
     */
    private playerTurn: boolean = true;
    
    /**
     * Indicates whether the battle has ended.
     * Set to true when the player or boss is defeated, or when the player chooses to end the battle.
     */
    private battleEnded: boolean = false;
    
    /**
     * The battle log element where messages are displayed.
     * This is used to show combat actions, results, and system messages.
     */
    private battleLog: HTMLElement | null = null;
    
    // Battle statistics for experience calculation
    private battleStats = {
        damageDealt: 0,
        damageTaken: 0,
        mpSpent: 0,
        craftworkExperience: 0,
        agilityExperience: 0
    };
    
    // UI Elements
    private playerHpElement: HTMLElement | null = null;
    private playerMaxHpElement: HTMLElement | null = null;
    private playerHpBar: HTMLElement | null = null;
    private playerHpProgress: HTMLElement | null = null;
    private playerMpElement: HTMLElement | null = null;
    private playerMaxMpElement: HTMLElement | null = null;
    private playerMpBar: HTMLElement | null = null;
    private playerMpProgress: HTMLElement | null = null;
    private playerStatusEffects: HTMLElement | null = null;
    
    private bossNameElement: HTMLElement | null = null;
    private bossHpElement: HTMLElement | null = null;
    private bossMaxHpElement: HTMLElement | null = null;
    private bossHpBar: HTMLElement | null = null;
    private bossHpProgress: HTMLElement | null = null;
    private bossStatusEffects: HTMLElement | null = null;
    
    private actionButtons: HTMLElement | null = null;
    private specialActions: HTMLElement | null = null;
    private battleEndActions: HTMLElement | null = null;
    private itemPanel: HTMLElement | null = null;
    private skillPanel: HTMLElement | null = null;
    
    private healPotionCount: HTMLElement | null = null;
    private adrenalineCount: HTMLElement | null = null;
    private energyDrinkCount: HTMLElement | null = null;
    
    // Debug Modal
    private debugModal: any = null; // Bootstrap modal for debug
    private debugPlayerHpInput: HTMLInputElement | null = null;
    private debugPlayerMaxHpInput: HTMLInputElement | null = null;
    private debugPlayerMpInput: HTMLInputElement | null = null;
    private debugPlayerMaxMpInput: HTMLInputElement | null = null;
    private debugBossHpInput: HTMLInputElement | null = null;
    private debugBossMaxHpInput: HTMLInputElement | null = null;
    private debugBossNameElement: HTMLElement | null = null;
    private debugPlayerStatusEffectsContainer: HTMLElement | null = null;
    private debugBossStatusEffectsContainer: HTMLElement | null = null;
    private debugBossCustomVarsContainer: HTMLElement | null = null;
    
    constructor(game: Game) {
        this.game = game;
        this.init();
    }
    
    private init(): void {
        // Get UI elements
        this.battleLog = document.getElementById('battle-log');
        
        this.playerHpElement = document.getElementById('player-hp');
        this.playerMaxHpElement = document.getElementById('player-max-hp');
        this.playerHpBar = document.getElementById('player-hp-bar');
        this.playerHpProgress = document.getElementById('player-hp-progress');
        this.playerMpElement = document.getElementById('player-mp');
        this.playerMaxMpElement = document.getElementById('player-max-mp');
        this.playerMpBar = document.getElementById('player-mp-bar');
        this.playerMpProgress = document.getElementById('player-mp-progress');
        this.playerStatusEffects = document.getElementById('player-status-effects');
        
        this.bossNameElement = document.getElementById('boss-name');
        this.bossHpElement = document.getElementById('boss-hp');
        this.bossMaxHpElement = document.getElementById('boss-max-hp');
        this.bossHpBar = document.getElementById('boss-hp-bar');
        this.bossHpProgress = document.getElementById('boss-hp-progress');
        this.bossStatusEffects = document.getElementById('boss-status-effects');
        
        this.actionButtons = document.getElementById('action-buttons');
        this.specialActions = document.getElementById('special-actions');
        this.battleEndActions = document.getElementById('battle-end-actions');
        this.itemPanel = document.getElementById('item-panel');
        this.skillPanel = document.getElementById('skill-panel');
        
        this.healPotionCount = document.getElementById('heal-potion-count');
        this.adrenalineCount = document.getElementById('adrenaline-count');
        this.energyDrinkCount = document.getElementById('energy-drink-count');
        
        // Debug modal elements
        this.debugPlayerHpInput = document.getElementById('debug-player-hp') as HTMLInputElement;
        this.debugPlayerMaxHpInput = document.getElementById('debug-player-max-hp') as HTMLInputElement;
        this.debugPlayerMpInput = document.getElementById('debug-player-mp') as HTMLInputElement;
        this.debugPlayerMaxMpInput = document.getElementById('debug-player-max-mp') as HTMLInputElement;
        this.debugBossHpInput = document.getElementById('debug-boss-hp') as HTMLInputElement;
        this.debugBossMaxHpInput = document.getElementById('debug-boss-max-hp') as HTMLInputElement;
        this.debugBossNameElement = document.getElementById('debug-boss-name');
        this.debugPlayerStatusEffectsContainer = document.getElementById('debug-player-status-effects');
        this.debugBossStatusEffectsContainer = document.getElementById('debug-boss-status-effects');
        this.debugBossCustomVarsContainer = document.getElementById('debug-boss-custom-vars');
        
        // Initialize debug modal
        const debugModalElement = document.getElementById('debug-modal');
        if (debugModalElement && window.bootstrap) {
            this.debugModal = new window.bootstrap.Modal(debugModalElement);
        }
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    private setupEventListeners(): void {
        // Action buttons
        document.getElementById('attack-btn')?.addEventListener('click', () => this.playerAttack());
        document.getElementById('defend-btn')?.addEventListener('click', () => this.playerDefend());
        document.getElementById('skill-btn')?.addEventListener('click', () => this.showSkillPanel());
        document.getElementById('item-btn')?.addEventListener('click', () => this.showItemPanel());
        
        // Skill buttons
        document.getElementById('power-attack-btn')?.addEventListener('click', () => this.useSkill(SkillType.PowerAttack));
        document.getElementById('heal-skill-btn')?.addEventListener('click', () => this.useSkill(SkillType.Heal));
        document.getElementById('struggle-skill-btn')?.addEventListener('click', () => this.useSkill(SkillType.Struggle));
        document.getElementById('ultra-smash-btn')?.addEventListener('click', () => this.useSkill(SkillType.UltraSmash));
        document.getElementById('skill-back-btn')?.addEventListener('click', () => this.hideSkillPanel());
        
        // Item buttons
        document.getElementById('heal-potion-btn')?.addEventListener('click', () => this.useItem('heal-potion'));
        document.getElementById('adrenaline-btn')?.addEventListener('click', () => this.useItem('adrenaline'));
        document.getElementById('energy-drink-btn')?.addEventListener('click', () => this.useItem('energy-drink'));
        document.getElementById('item-back-btn')?.addEventListener('click', () => this.hideItemPanel());
        
        // Special action buttons
        document.getElementById('struggle-btn')?.addEventListener('click', () => this.playerStruggle());
        document.getElementById('struggle-skill-special-btn')?.addEventListener('click', () => this.useSkill(SkillType.Struggle));
        document.getElementById('stay-still-btn')?.addEventListener('click', () => this.playerStayStill());
        document.getElementById('give-up-btn')?.addEventListener('click', () => this.playerGiveUp());
        
        // Battle end button
        document.getElementById('battle-end-btn')?.addEventListener('click', () => {
            this.finalizeBattle();
        });
        
        // Back to boss select
        document.getElementById('back-to-select-btn')?.addEventListener('click', () => {
            this.finalizeBattle();
        });
        
        // Debug button
        document.getElementById('debug-btn')?.addEventListener('click', () => {
            this.showDebugModal();
        });
        
        // Debug modal buttons
        document.getElementById('debug-apply-changes')?.addEventListener('click', () => {
            this.applyDebugChanges();
        });
        
        document.getElementById('debug-add-player-status')?.addEventListener('click', () => {
            this.showAddStatusEffectDialog('player');
        });
        
        document.getElementById('debug-add-boss-status')?.addEventListener('click', () => {
            this.showAddStatusEffectDialog('boss');
        });
        
        document.getElementById('debug-add-custom-var')?.addEventListener('click', () => {
            this.showAddCustomVarDialog();
        });
    }
    
    enter(): void {
        this.player = this.game.getPlayer();
        this.boss = this.game.getCurrentBoss();
        
        if (!this.player || !this.boss) {
            console.error('Player or boss not found');
            return;
        }
        
        // Set agility experience callback
        this.player.agilityExperienceCallback = (amount: number) => {
            this.addAgilityExperience(amount);
        };
        
        // Set "Round 0" to make pre-battle state
        this.roundCount = 0;
        this.playerTurn = false;
        this.battleEnded = false;
        
        // Reset battle statistics
        this.battleStats = {
            damageDealt: 0,
            damageTaken: 0,
            mpSpent: 0,
            craftworkExperience: 0,
            agilityExperience: 0
        };
        
        // Reset battle-specific state for safety
        this.player.resetBattleState();
        
        // Reset boss skill tracking for Explorer experience calculation
        this.boss.resetUsedSkillNames();
        
        // Fully restore player HP and MP at battle start
        this.player.fullRestore();
        
        this.initializeBattle();
        
        // Show battle start message
        this.showBattleStartMessages();
        
        // Now it's time to start the battle
        this.roundCount = 1;
        this.playerTurn = true;
        this.addRoundDivider(1);
        this.updateUI();
    }
    
    private initializeBattle(): void {
        if (!this.boss) return;
        
        // Clear battle log and add initial round
        if (this.battleLog) {
            this.battleLog.innerHTML = '';
        }
        
        // Set boss name
        if (this.bossNameElement) {
            this.bossNameElement.textContent = this.boss.displayName;
        }
        
        // Save initial stats for HP/MP bar calculation
        if (this.player) {
            this.player.saveInitialStats();
        }
        if (this.boss) {
            this.boss.saveInitialStats();
        }
    }
    
    private updateUI(): void {
        if (!this.player || !this.boss) return;
        
        // Update player UI
        this.updatePlayerUI();
        
        // Update boss UI
        this.updateBossUI();
        
        // Update action availability
        this.updateActionAvailability();
        
        // Update skill button visibility
        this.updateSkillButtonVisibility();
        
        // Update item counts
        this.updateItemCounts();
        
        // Update basic action buttons
        this.updateBasicActionButtons();
        
        // Update debug button visibility
        this.updateDebugButtonVisibility();
    }
    
    private updatePlayerUI(): void {
        if (!this.player) return;
        
        // HP
        if (this.playerHpElement) this.playerHpElement.textContent = this.player.hp.toString();
        if (this.playerMaxHpElement) this.playerMaxHpElement.textContent = this.player.maxHp.toString();
        
        // HP Progress Container
        if (this.playerHpProgress) {
            const containerPercentage = this.player.getHpContainerPercentage();
            this.playerHpProgress.style.width = `${containerPercentage}%`;
        }
        
        // HP Bar
        if (this.playerHpBar) {
            const barPercentage = this.player.getHpBarPercentage();
            const colorPercentage = this.player.getHpPercentage();
            this.playerHpBar.style.width = `${barPercentage}%`;
            
            // Change color based on HP relative to current max
            this.playerHpBar.className = 'progress-bar';
            if (colorPercentage > 75) {
                this.playerHpBar.classList.add('bg-success');
            } else if (colorPercentage > 25) {
                this.playerHpBar.classList.add('bg-warning');
            } else {
                this.playerHpBar.classList.add('bg-danger');
            }
        }
        
        // MP
        if (this.playerMpElement) this.playerMpElement.textContent = this.player.mp.toString();
        if (this.playerMaxMpElement) this.playerMaxMpElement.textContent = this.player.maxMp.toString();
        
        // MP Progress Container
        if (this.playerMpProgress) {
            const mpContainerPercentage = this.player.getMpContainerPercentage();
            this.playerMpProgress.style.width = `${mpContainerPercentage}%`;
        }
        
        // MP Bar
        if (this.playerMpBar) {
            const mpBarPercentage = this.player.getMpBarPercentage();
            this.playerMpBar.style.width = `${mpBarPercentage}%`;
        }
        
        // Status Effects
        this.updateStatusEffectsUI(this.player.statusEffects.getAllEffects(), this.playerStatusEffects);
    }
    
    private updateBossUI(): void {
        if (!this.boss) return;
        
        // HP
        if (this.bossHpElement) this.bossHpElement.textContent = this.boss.hp.toString();
        if (this.bossMaxHpElement) this.bossMaxHpElement.textContent = this.boss.maxHp.toString();
        
        // HP Progress Container
        if (this.bossHpProgress) {
            const containerPercentage = this.boss.getHpContainerPercentage();
            this.bossHpProgress.style.width = `${containerPercentage}%`;
        }
        
        // HP Bar
        if (this.bossHpBar) {
            const barPercentage = this.boss.getHpBarPercentage();
            this.bossHpBar.style.width = `${barPercentage}%`;
        }
        
        // Status Effects
        this.updateStatusEffectsUI(this.boss.statusEffects.getAllEffects(), this.bossStatusEffects);
    }
    
    private updateStatusEffectsUI(effects: StatusEffect[], container: HTMLElement | null): void {
        if (!container) return;
        
        container.innerHTML = '';
        
        effects.forEach(effect => {
            const badge = document.createElement('span');
            badge.className = `status-effect-badge status-${effect.type}`;
            badge.textContent = effect.name;
            badge.title = `${effect.description} (残り${effect.duration}ターン)`;
            container.appendChild(badge);
        });
    }
    
    private updateActionAvailability(): void {
        if (!this.player || !this.boss) return;

        const canAct = this.player.canAct();
        const canActActually = canAct && this.playerTurn && !this.battleEnded;
        const isAnyRestrained = this.player.isAnyRestrained();
        const isKnockedOut = this.player.isKnockedOut();
        const isDoomed = this.player.isDoomed();
        const isDefeated = this.player.isDefeated();
        
        // Show/hide action panels
        if (this.actionButtons && this.specialActions && this.battleEndActions) {
            if (this.battleEnded) {
                // Battle is over, show only battle end actions
                this.actionButtons.classList.add('d-none');
                this.specialActions.classList.add('d-none');
                this.battleEndActions.classList.remove('d-none');
            } else if (isAnyRestrained || isKnockedOut || isDoomed || isDefeated || !canAct) {
                this.actionButtons.classList.add('d-none');
                this.specialActions.classList.remove('d-none');
                this.battleEndActions.classList.add('d-none');
                
                // Update omamori button in special actions panel
                this.updateOmamoriInSpecialActions();
            } else {
                this.actionButtons.classList.remove('d-none');
                this.specialActions.classList.add('d-none');
                this.battleEndActions.classList.add('d-none');
            }
        }
        
        // Enable/disable action buttons
        const actionBtns = ['attack-btn', 'defend-btn', 'skill-btn', 'item-btn'];
        actionBtns.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.classList.toggle('disabled', !canActActually || isAnyRestrained);
            }
        });
        
        // Special action buttons
        const specialBtns = ['struggle-btn', 'stay-still-btn', 'give-up-btn'];
        specialBtns.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                if (isDefeated || isDoomed || isKnockedOut || !canAct) {
                    // For knocked out, doomed, and defeated states, only show give-up button
                    if (btnId === 'struggle-btn' || btnId === 'stay-still-btn') {
                        btn.classList.add('d-none');
                    } else {
                        btn.classList.remove('d-none');
                        btn.classList.toggle('disabled', !this.playerTurn);
                    }
                } else if (isAnyRestrained) {
                    // For restrained state, show struggle and stay-still buttons (if unlocked)
                    if (btnId === 'stay-still-btn') {
                        // Only show stay-still button if the skill is unlocked
                        const hasStayStillSkill = this.player?.hasSkill('stay-still') ?? false;
                        if (hasStayStillSkill) {
                            btn.classList.remove('d-none');
                            btn.classList.toggle('disabled', !this.playerTurn);
                        } else {
                            btn.classList.add('d-none');
                        }
                    } else {
                        // Show other buttons normally
                        btn.classList.remove('d-none');
                        btn.classList.toggle('disabled', !this.playerTurn);
                    }
                } else {
                    // Normal state, hide all special buttons
                    btn.classList.add('d-none');
                }
            }
        });
    }
    
    private updateItemCounts(): void {
        if (!this.player) return;
        
        // Update heal potion
        const healPotionCount = this.player.getItemCount('heal-potion');
        const healPotionUnlocked = this.player.items.has('heal-potion');
        if (this.healPotionCount) {
            this.healPotionCount.textContent = healPotionCount.toString();
        }
        const healPotionBtn = document.getElementById('heal-potion-btn');
        if (healPotionBtn) {
            healPotionBtn.style.display = healPotionUnlocked && healPotionCount > 0 ? 'block' : 'none';
        }
        
        // Update adrenaline
        const adrenalineCount = this.player.getItemCount('adrenaline');
        const adrenalineUnlocked = this.player.items.has('adrenaline');
        if (this.adrenalineCount) {
            this.adrenalineCount.textContent = adrenalineCount.toString();
        }
        const adrenalineBtn = document.getElementById('adrenaline-btn');
        if (adrenalineBtn) {
            adrenalineBtn.style.display = adrenalineUnlocked && adrenalineCount > 0 ? 'block' : 'none';
        }
        
        // Update energy drink
        const energyDrinkCount = this.player.getItemCount('energy-drink');
        const energyDrinkUnlocked = this.player.items.has('energy-drink');
        if (this.energyDrinkCount) {
            this.energyDrinkCount.textContent = energyDrinkCount.toString();
        }
        const energyDrinkBtn = document.getElementById('energy-drink-btn');
        if (energyDrinkBtn) {
            energyDrinkBtn.style.display = energyDrinkUnlocked && energyDrinkCount > 0 ? 'block' : 'none';
        }
        
        // Update other extended items dynamically
        this.updateExtendedItemButtons();
    }
    
    private updateExtendedItemButtons(): void {
        if (!this.player) return;
        
        // Import EXTENDED_ITEMS for dynamic button creation
        import('../data/ExtendedItems').then(({ EXTENDED_ITEMS }) => {
            const itemPanel = document.getElementById('item-panel');
            if (!itemPanel) return;
            
            // Get existing static buttons to preserve them (for future reference)
            // const staticButtons = ['heal-potion-btn', 'adrenaline-btn', 'energy-drink-btn', 'item-back-btn'];
            const itemGrid = itemPanel.querySelector('.d-grid');
            if (!itemGrid) return;
            
            // Remove dynamically created buttons (not static ones)
            const dynamicButtons = itemGrid.querySelectorAll('[data-dynamic-item]');
            dynamicButtons.forEach(btn => btn.remove());
            
            // Add buttons for extended items that are unlocked and not already shown
            EXTENDED_ITEMS.forEach(itemData => {
                // Skip items that already have static buttons
                if (['heal-potion', 'adrenaline', 'energy-drink'].includes(itemData.id)) {
                    return;
                }
                
                const itemCount = this.player!.getItemCount(itemData.id);
                if (itemCount > 0) {
                    const button = document.createElement('button');
                    button.id = `${itemData.id}-btn`;
                    button.className = 'btn btn-outline-success';
                    button.setAttribute('data-dynamic-item', 'true');
                    button.innerHTML = `💊 ${itemData.name} (${itemCount})`;
                    button.title = itemData.description;
                    
                    // Add event listener
                    button.addEventListener('click', () => this.useItem(itemData.id));
                    
                    // Insert before the back button
                    const backBtn = document.getElementById('item-back-btn');
                    if (backBtn) {
                        itemGrid.insertBefore(button, backBtn);
                    }
                }
            });
        });
    }
    
    /**
     * Update visibility of basic action buttons based on unlock status
     */
    private updateBasicActionButtons(): void {
        if (!this.player) return;
        
        // Check if basic actions are unlocked
        const hasBasicAttack = true; // Basic attack is always available
        const hasDefend = this.player.hasSkill('defend'); // Defend skill must be unlocked
        const hasItemAccess = this.player.items.size > 0; // Has any items available
        const hasSkillAccess = this.player.getUnlockedSkills().length > 0; // Has any skills unlocked
        
        // Update attack button (always visible)
        const attackBtn = document.getElementById('attack-btn');
        if (attackBtn) {
            attackBtn.style.display = hasBasicAttack ? 'block' : 'none';
        }
        
        // Update defend button (might be skill-locked)
        const defendBtn = document.getElementById('defend-btn');
        if (defendBtn) {
            defendBtn.style.display = hasDefend ? 'block' : 'none';
        }
        
        // Update item button (hide if no items are unlocked)
        const itemBtn = document.getElementById('item-btn');
        if (itemBtn) {
            itemBtn.style.display = hasItemAccess ? 'block' : 'none';
        }
        
        // Update skill button (hide if no skills are unlocked)
        const skillBtn = document.getElementById('skill-btn');
        if (skillBtn) {
            skillBtn.style.display = hasSkillAccess ? 'block' : 'none';
        }
    }
    
    private updateSkillButtonVisibility(): void {
        if (!this.player) return;
        
        // Hide struggle skill button in skill panel (since it's now in special actions)
        const struggleSkillBtn = document.getElementById('struggle-skill-btn');
        if (struggleSkillBtn) {
            struggleSkillBtn.classList.add('d-none');
        }
        
        // Show/hide struggle skill button in special actions based on state
        const struggleSkillSpecialBtn = document.getElementById('struggle-skill-special-btn');
        if (struggleSkillSpecialBtn) {
            const isStruggleUnlocked = this.player.hasSkill('struggle');
            const canUseSkill = this.player.statusEffects.canAct() &&
                               !this.player.statusEffects.isExhausted() && 
                               !this.player.statusEffects.isKnockedOut() &&
                               !this.player.statusEffects.isDoomed() &&
                               !this.player.statusEffects.isDead();
            
            // Hide if skill is not unlocked or cannot be used
            if (!isStruggleUnlocked || !canUseSkill) {
                struggleSkillSpecialBtn.style.display = 'none';
            } else {
                struggleSkillSpecialBtn.style.display = 'block';
                struggleSkillSpecialBtn.classList.toggle('disabled', !this.playerTurn);
            }
        }
        
        // Update availability of individual skill buttons
        this.updateIndividualSkillButtons();
    }
    
    /**
     * Check if a specific skill can be used by the player
     * 
     * @param skillType The type of skill to check
     * @return True if the skill can be used, false otherwise
     */
    private canUseSkill(skillType: SkillType): boolean {
        if (!this.player) return false;
        
        // Check basic conditions
        if (!this.playerTurn) {
            return false;
        }
        
        // Check if skill is available
        const availableSkills = this.player.getAvailableSkills();
        const skill = availableSkills.find(s => s.type === skillType);
        
        return skill ? skill.canUse(this.player) : false;
    }
    
    /**
     * Update individual skill buttons based on player state
     * 
     * This method checks if the player can use each skill and updates the button state accordingly.
     * It also handles visual updates to indicate whether the skill is available or not.
     * 
     * This is called after any action that might change skill availability, such as using items or skills, or at the start of each turn.
     */
    private updateIndividualSkillButtons(): void {
        if (!this.player) return;
        
        // Get unlocked skills from the player
        const unlockedSkills = this.player.getUnlockedSkills();
        const unlockedSkillIds = new Set(unlockedSkills.map(skill => skill.id));
        
        // Check each skill button
        const skillButtons = [
            { id: 'power-attack-btn', skillId: 'power-attack', skillType: SkillType.PowerAttack },
            { id: 'heal-skill-btn', skillId: 'heal', skillType: SkillType.Heal },
            { id: 'struggle-skill-btn', skillId: 'struggle', skillType: SkillType.Struggle },
            { id: 'ultra-smash-btn', skillId: 'ultra-smash', skillType: SkillType.UltraSmash }
        ];
        
        skillButtons.forEach(({ id, skillId, skillType }) => {
            const button = document.getElementById(id) as HTMLButtonElement;
            if (button) {
                const isUnlocked = unlockedSkillIds.has(skillId);
                const canUseSkill = this.canUseSkill(skillType);
                
                // Hide button if skill is not unlocked
                if (!isUnlocked) {
                    button.style.display = 'none';
                } else {
                    button.style.display = 'block';
                    
                    // Update visual state
                    if (!canUseSkill) {
                        button.classList.add('disabled');
                    } else {
                        button.classList.remove('disabled');
                    }
                    
                    // Update native disabled attribute for accessibility
                    button.disabled = !canUseSkill;
                }
            }
        });
    }
    
    private playerAttack(): void {
        if (!this.player || !this.boss || !this.playerTurn) return;
        
        const baseDamage = this.player.getAttackPower();
        const attackResult = calculateAttackResult(
            baseDamage,
            false,
            1.0,
            0.05
        ); // Player attacks are never guaranteed hits
        
        this.addBattleLogMessage(`${this.player.name}の攻撃！`, 'system', 'player');
        
        if (attackResult.isMiss) {
            this.addBattleLogMessage(`しかし攻撃は外れた！`, 'system', 'player');
        } else {
            const actualDamage = this.boss.takeDamage(attackResult.damage);
            // Track damage dealt for experience
            this.battleStats.damageDealt += actualDamage;
            
            if (attackResult.isCritical) {
                this.addBattleLogMessage(`会心の一撃！ ${this.boss.displayName}に${actualDamage}のダメージ！`, 'damage', 'player');
            } else {
                this.addBattleLogMessage(`${this.boss.displayName}に${actualDamage}のダメージ！`, 'damage', 'player');
            }
        }
        
        this.updateUI();
        this.endPlayerTurn();
    }
    
    private playerDefend(): void {
        if (!this.player || !this.playerTurn) return;
        
        this.player.defend();
        this.addBattleLogMessage(`${this.player.name}は身を守った！`, 'system', 'player');
        
        this.updateUI();
        this.endPlayerTurn();
    }
    
    private showSkillPanel(): void {
        if (this.actionButtons && this.skillPanel) {
            this.actionButtons.classList.add('d-none');
            this.skillPanel.classList.remove('d-none');
        }
    }
    
    private hideSkillPanel(): void {
        if (this.actionButtons && this.skillPanel) {
            this.skillPanel.classList.add('d-none');
            this.actionButtons.classList.remove('d-none');
        }
    }
    
    private showItemPanel(): void {
        if (this.actionButtons && this.itemPanel) {
            this.actionButtons.classList.add('d-none');
            this.itemPanel.classList.remove('d-none');
        }
    }
    
    private hideItemPanel(): void {
        if (this.actionButtons && this.itemPanel) {
            this.itemPanel.classList.add('d-none');
            this.actionButtons.classList.remove('d-none');
        }
    }
    
    private useSkill(skillType: SkillType): void {
        if (!this.player || !this.boss || !this.playerTurn) return;
        
        // Use centralized skill availability check
        if (!this.canUseSkill(skillType)) {
            this.addBattleLogMessage('そのスキルは使用できません', 'system', 'player');
            return;
        }
        
        const result = this.player.useSkill(skillType, this.boss);
        
        if (result.success) {
            this.addBattleLogMessage(result.message, 'system', 'player');
            
            // Track MP spent for experience
            const mpConsumed = result.mpConsumed;
            if (mpConsumed) {
                this.battleStats.mpSpent += mpConsumed;
            }
            
            // Check if this was a successful struggle skill that broke restraint
            if (skillType === SkillType.Struggle && result.success) {
                this.boss.onRestraintBroken();
                this.addBattleLogMessage(`${this.boss.displayName}は反動で動けなくなった！`, 'system', 'boss');
            }
            
            // Apply damage if applicable with custom variance
            if (result.damage && result.damage > 0) {
                const skills = this.player.getAvailableSkills();
                const skill = skills.find(s => s.type === skillType);
                
                let finalDamage = result.damage;
                if (skill && skill.damageVarianceMin !== undefined && skill.damageVarianceMax !== undefined) {
                    // Apply parameters for skills
                    const attackResult = calculateAttackResult(
                        result.damage, 
                        false, // Skills are never guaranteed hits
                        skill.hitRate, // Use skill's custom hit rate if available
                        skill.criticalRate, // Use skill's custom critical rate if
                        skill.damageVarianceMin,
                        skill.damageVarianceMax
                    );
                    finalDamage = attackResult.damage;
                    
                    if (attackResult.isCritical) {
                        this.addBattleLogMessage(`${result.message} ${attackResult.message}`, 'system', 'player');
                    }
                } else {
                    // Use default variance for skills without custom settings
                    const attackResult = calculateAttackResult(result.damage, false);
                    finalDamage = attackResult.damage;
                    
                    if (attackResult.isCritical) {
                        this.addBattleLogMessage(`${result.message} ${attackResult.message}`, 'system', 'player');
                    }
                }
                
                const actualDamage = this.boss.takeDamage(finalDamage);
                // Track damage dealt for experience
                this.battleStats.damageDealt += actualDamage;
                this.addBattleLogMessage(`${this.boss.displayName}に${actualDamage}のダメージ！`, 'damage', 'player');
            }
        } else {
            // If skill failed, show message
            this.addBattleLogMessage(result.message, 'system', 'player');
        }

        this.hideSkillPanel();
        this.updateUI();
        this.endPlayerTurn();
    }
    
    private useItem(itemName: string): void {
        if (!this.player || !this.playerTurn) return;
        
        const success = this.player.useItem(itemName);
        
        if (success) {
            // Get display name from player's item data or fallback to predefined names
            let itemDisplayName = itemName;
            const playerItem = this.player.items.get(itemName);
            if (playerItem) {
                itemDisplayName = playerItem.name;
                // Track items used for experience
                this.battleStats.craftworkExperience += playerItem.experienceGain;
            } else {
                const itemDisplayNames: { [key: string]: string } = {
                    'heal-potion': '回復薬',
                    'adrenaline': 'アドレナリン注射',
                    'energy-drink': '元気ドリンク'
                };
                itemDisplayName = itemDisplayNames[itemName] || itemName;
            }
            
            this.addBattleLogMessage(`${this.player.name}は${itemDisplayName}を使った！`, 'heal', 'player');
            
            this.hideItemPanel();
            // Items don't end turn
            this.updateUI();
        } else {
            // Get display name for error message
            let itemDisplayName = itemName;
            const playerItem = this.player.items.get(itemName);
            if (playerItem) {
                itemDisplayName = playerItem.name;
            }
            this.addBattleLogMessage(`${itemDisplayName}を使用できない！`, 'system', 'player');
        }
    }
    
    private playerStruggle(): void {
        if (!this.player || !this.boss || !this.playerTurn) return;
        
        const success = this.player.attemptStruggle();
        
        if (success) {
            this.addBattleLogMessage(`${this.player.name}は拘束を振り切った！`, 'system', 'player');
            this.boss.onRestraintBroken();
            this.addBattleLogMessage(`${this.boss.displayName}は反動で動けなくなった！`, 'system', 'boss');
        } else {
            this.addBattleLogMessage(`${this.player.name}はもがいたが、拘束を抜けられなかった...`, 'system', 'player');
        }
        
        this.updateUI();
        this.endPlayerTurn();
    }
    
    private playerStayStill(): void {
        if (!this.player || !this.playerTurn) return;
        
        this.player.stayStill();
        this.addBattleLogMessage(`${this.player.name}はじっとして体力を回復した`, 'heal', 'player');
        
        this.updateUI();
        this.endPlayerTurn();
    }
    
    private playerGiveUp(): void {
        if (!this.player || !this.playerTurn) return;
        
        // Handle post-defeat state differently
        if (this.player.isDefeated()) {
            this.addBattleLogMessage('......', 'system', 'player');
        } else {
            this.addBattleLogMessage(`${this.player.name}は何もできない....`, 'system', 'player');
        }
        
        this.updateUI();
        this.endPlayerTurn();
    }
    
    private endPlayerTurn(): void {
        this.playerTurn = false;
        
        if (!this.checkBattleEnd()) {
            // Start boss turn after a delay
            setTimeout(() => {
                this.bossTurn();
            }, 1000);
        }
    }
    
    private bossTurn(): void {
        if (!this.boss || !this.player) return;
        
        this.boss.startTurn();
        
        // Check if boss can act
        if (!this.boss.canAct()) {
            if (this.boss.isStunned()) {
                this.addBattleLogMessage(`${this.boss.displayName}は反動で動けない...`, 'system', 'boss');
            }
            this.endBossTurn();
            return;
        }
        
        // If player is doomed but not defeated, boss performs finishing move
        // unless the boss uses custom logic to skip it
        if (this.player.statusEffects.isDoomed() && !this.player.isDefeated()
            && !this.boss.suppressAutoFinishingMove) {
            this.performFinishingMove();
            return;
        }
        
        // Boss AI selects action
        const action = this.boss.selectAction(this.player, this.roundCount);
        
        if (action) {
            const playerHpBefore = this.player.hp;
            const messages = this.boss.executeAction(action, this.player, this.roundCount);
            
            // Track damage taken for experience
            if (this.player.hp < playerHpBefore) {
                this.battleStats.damageTaken += (playerHpBefore - this.player.hp);
            }
            
            // Add action messages to battle log
            messages.forEach(message => {
                this.addBattleLogMessage(message, action.type === ActionType.Attack ? 'damage' : 'status-effect', 'boss');
            });
            
            // Check if player was knocked down to 0 HP
            if (this.player.hp === 0 && playerHpBefore > 0) {
                this.addBattleLogMessage(`${this.player.name}はダウンしてしまった！`, 'system');
            }
        }
        
        this.endBossTurn();
    }
    
    private endBossTurn(): void {
        // Process round end effects for both player and boss
        this.processRoundEnd();
        
        // Start player turn
        this.playerTurn = true;
        if (this.player) {
            this.player.startTurn();
            
            // Check for exhausted recovery messages
            const recoveryMessages = this.player.checkExhaustedRecovery();
            recoveryMessages.forEach(message => {
                this.addBattleLogMessage(message, 'system', 'player');
            });
        }
        
        this.updateUI();
        this.checkBattleEnd();
    }
    
    private processRoundEnd(): void {
        // Process player status effects
        if (this.player) {
            const playerMessages = this.player.processRoundEnd();
            playerMessages.forEach(message => {
                this.addBattleLogMessage(message, 'status-effect', 'player');
            });
        }
        
        // Process boss status effects
        if (this.boss) {
            const bossMessages = this.boss.processRoundEnd();
            bossMessages.forEach(message => {
                this.addBattleLogMessage(message, 'status-effect', 'boss');
            });
        }
        
        // Add count of rounds
        this.roundCount++;
        
        // Add turn count divider to log
        this.addRoundDivider(this.roundCount);
    }
    
    private checkBattleEnd(): boolean {
        if (!this.player || !this.boss) return false;
        
        // Check if boss is defeated
        if (this.boss.isDefeated()) {
            // Show victory message
            this.showVictoryMessages();

            // 勝利メッセージ後、バトル終了ボタン案内を表示
            this.addBattleLogMessage('「バトル終了」ボタンを押して結果を確認してください。', 'system');
            
            // Set battle ended state
            this.battleEnded = true;
            this.updateUI();
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Add a message to the battle log
     * @param message The message to add
     * @param type The type of message (e.g., 'damage', 'status-effect', 'heal', etc.)
     * @param actor The actor type ('player', 'boss', 'system')
     */
    private addBattleLogMessage(message: string, type: string = '', actor: 'player' | 'boss' | 'system' = 'system'): void {
        if (!this.battleLog) return;
        
        // Create message container
        const messageContainer = document.createElement('div');
        messageContainer.className = `battle-message ${actor}`;
        
        // Create message content
        if (actor === 'system') {
            // System messages are centered without icons
            const bubble = document.createElement('div');
            bubble.className = `message-bubble system ${type}`;
            bubble.textContent = message;
            messageContainer.appendChild(bubble);
        } else {
            // Player and boss messages have icons and bubbles
            const icon = document.createElement('div');
            icon.className = `message-icon ${actor}`;
            
            // Set icon based on actor
            if (actor === 'player') {
                icon.textContent = '🐍'; // Player's eel icon
            } else if (actor === 'boss') {
                // Get boss icon from current boss data
                icon.textContent = this.boss?.icon ?? '👹';
            }
            
            const bubble = document.createElement('div');
            bubble.className = `message-bubble ${actor} ${type}`;
            bubble.textContent = message;
            
            if (actor === 'player') {
                messageContainer.appendChild(icon);
                messageContainer.appendChild(bubble);
            } else {
                messageContainer.appendChild(bubble);
                messageContainer.appendChild(icon);
            }
        }
        
        this.battleLog.appendChild(messageContainer);
        this.battleLog.scrollTop = this.battleLog.scrollHeight;
    }
    
    private addRoundDivider(roundNumber: number): void {
        if (!this.battleLog) return;
        
        const divider = document.createElement('div');
        divider.className = 'battle-round-divider';
        
        const label = document.createElement('span');
        label.className = 'battle-round-label';
        label.textContent = `ラウンド ${roundNumber}`;
        
        divider.appendChild(label);
        this.battleLog.appendChild(divider);
        this.battleLog.scrollTop = this.battleLog.scrollHeight;
    }
    
    /**
     * Finalize battle and show results screen
     */
    private finalizeBattle(): void {
        if (!this.player || !this.boss) {
            // If player or boss is not set, return to boss select (this should not be happened!)
            console.error('BattleScene: finalizeBattle called without player or boss set');
            this.game.returnToBossSelect();
            return;
        }
        
        const hasActivity = this.battleStats.damageDealt > 0 ||
            this.battleStats.damageTaken > 0 ||
            this.battleStats.mpSpent > 0 ||
            this.battleStats.agilityExperience > 0 ||
            this.battleStats.craftworkExperience > 0;

        if (!hasActivity) {
            // No activity, go directly to boss select
            this.game.returnToBossSelect();
            return;
        }

        // Determine if it was a victory
        let status: BattleResultStatus;
        if (this.boss.isDefeated()) {
            status = BattleResultStatus.Victory;
        } else if (this.player.isDefeated()) {
            status = BattleResultStatus.Defeat;
        } else {
            status = BattleResultStatus.Interrupted;
        }
        
        // Show battle result screen
        const battleResult = calculateBattleResult(
            this.player,
            this.boss,
            status,
            this.battleStats.damageDealt,
            this.battleStats.damageTaken,
            this.battleStats.mpSpent,
            this.battleStats.craftworkExperience,
            this.battleStats.agilityExperience,
            this.boss.getUsedSkillNames()  // Get skills boss used during battle
        );
        this.game.showBattleResult(battleResult);
    }
    
    /**
     * Add agility experience to battle stats
     */
    public addAgilityExperience(amount: number): void {
        this.battleStats.agilityExperience += amount;
    }
    
    /**
     * Execute boss finishing move on doomed player
     */
    private performFinishingMove(): void {
        if (!this.boss || !this.player) return;
        
        // Use boss-specific finishing move if available
        if (this.boss.finishingMove) {
            const messages = this.boss.finishingMove();
            messages.forEach(message => {
                this.addBattleLogMessage(
                    formatMessage(
                        message,
                        this.boss?.displayName ?? '',
                        this.player?.name ?? ''
                    ),
                    'system',
                    'boss'
                );
            });
        } else {
            // Default finishing move
            this.addBattleLogMessage(`${this.boss.displayName}のトドメ攻撃！`, 'damage', 'boss');
            this.addBattleLogMessage(`${this.player.name}にとって致命的な一撃だった...`, 'system');
        }
        
        // Mark player as dead
        this.player.statusEffects.removeEffect(StatusEffectType.Doomed);
        this.player.statusEffects.addEffect(StatusEffectType.Dead);
        
        this.endBossTurn();
    }
    
    /**
     * Update debug button visibility based on debug mode
     */
    private updateDebugButtonVisibility(): void {
        const debugBtn = document.getElementById('debug-btn');
        if (debugBtn) {
            if (this.game.isDebugMode()) {
                debugBtn.classList.remove('d-none');
            } else {
                debugBtn.classList.add('d-none');
            }
        }
    }
    
    /**
     * Update omamori button in special actions panel
     */
    private updateOmamoriInSpecialActions(): void {
        if (!this.player) return;
        
        const omamoriContainer = document.getElementById('omamori-special-container');
        if (!omamoriContainer) return;
        
        // Check if omamori can be used
        const hasOmamori = this.player.getItemCount('omamori') > 0;
        const canUseOmamori = hasOmamori && (
            this.player.isKnockedOut() || 
            this.player.isRestrained() || 
            this.player.isEaten() || 
            this.player.isCocoon() || 
            this.player.statusEffects.hasEffect(StatusEffectType.Sleep)
        );
        
        // Clear container
        omamoriContainer.innerHTML = '';
        
        // Add omamori button if can use
        if (canUseOmamori && !this.player.isDefeated()) {
            const omamoriBtn = document.createElement('button');
            omamoriBtn.id = 'omamori-special-btn';
            omamoriBtn.className = 'btn btn-outline-light';
            omamoriBtn.innerHTML = '🛡️ おまもり (1)';
            omamoriBtn.title = '特殊状態を解除し、HPを満回復する';
            omamoriBtn.addEventListener('click', () => this.useItem('omamori'));
            omamoriContainer.appendChild(omamoriBtn);
        }
    }

    /**
     * Show debug modal
     */
    private showDebugModal(): void {
        if (!this.debugModal || !this.player || !this.boss) return;
        
        // Populate current values
        this.refreshDebugUI();
        
        // Show modal
        this.debugModal.show();
    }
    
    /**
     * Refresh debug UI with current values
     */
    private refreshDebugUI(): void {
        if (!this.player || !this.boss) return;
        
        // Update player fields
        if (this.debugPlayerHpInput) this.debugPlayerHpInput.value = this.player.hp.toString();
        if (this.debugPlayerMaxHpInput) this.debugPlayerMaxHpInput.value = this.player.maxHp.toString();
        if (this.debugPlayerMpInput) this.debugPlayerMpInput.value = this.player.mp.toString();
        if (this.debugPlayerMaxMpInput) this.debugPlayerMaxMpInput.value = this.player.maxMp.toString();
        
        // Update boss fields
        if (this.debugBossHpInput) this.debugBossHpInput.value = this.boss.hp.toString();
        if (this.debugBossMaxHpInput) this.debugBossMaxHpInput.value = this.boss.maxHp.toString();
        if (this.debugBossNameElement) this.debugBossNameElement.textContent = `👹 ${this.boss.displayName}`;
        
        // Update status effects
        this.refreshDebugPlayerStatusEffects();
        this.refreshDebugBossStatusEffects();
        
        // Update custom variables
        this.refreshDebugBossCustomVars();
    }
    
    /**
     * Refresh debug player status effects
     */
    private refreshDebugPlayerStatusEffects(): void {
        if (!this.player || !this.debugPlayerStatusEffectsContainer) return;
        
        this.debugPlayerStatusEffectsContainer.innerHTML = '';
        
        const effects = this.player.statusEffects.getAllEffects();
        effects.forEach(effect => {
            this.createDebugStatusEffectElement(effect, 'player', this.debugPlayerStatusEffectsContainer!);
        });
    }
    
    /**
     * Refresh debug boss status effects
     */
    private refreshDebugBossStatusEffects(): void {
        if (!this.boss || !this.debugBossStatusEffectsContainer) return;
        
        this.debugBossStatusEffectsContainer.innerHTML = '';
        
        const effects = this.boss.statusEffects.getAllEffects();
        effects.forEach(effect => {
            this.createDebugStatusEffectElement(effect, 'boss', this.debugBossStatusEffectsContainer!);
        });
    }
    
    /**
     * Create debug status effect element
     */
    private createDebugStatusEffectElement(effect: StatusEffect, target: 'player' | 'boss', container: HTMLElement): void {
        const div = document.createElement('div');
        div.className = 'debug-status-effect d-flex align-items-center justify-content-between bg-secondary p-2 mb-1 rounded';
        
        const info = document.createElement('span');
        info.textContent = `${effect.name} (${effect.duration}ターン)`;
        info.className = 'me-2';
        
        const controls = document.createElement('div');
        
        // Duration input
        const durationInput = document.createElement('input');
        durationInput.type = 'number';
        durationInput.value = effect.duration.toString();
        durationInput.className = 'form-control form-control-sm me-2';
        durationInput.style.width = '60px';
        durationInput.min = '1';
        durationInput.addEventListener('change', () => {
            effect.duration = parseInt(durationInput.value) || 1;
        });
        
        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = '×';
        removeBtn.className = 'btn btn-sm btn-outline-danger';
        removeBtn.addEventListener('click', () => {
            if (target === 'player' && this.player) {
                this.player.statusEffects.removeEffect(effect.type);
            } else if (target === 'boss' && this.boss) {
                this.boss.statusEffects.removeEffect(effect.type);
            }
            this.refreshDebugPlayerStatusEffects();
            this.refreshDebugBossStatusEffects();
        });
        
        controls.appendChild(durationInput);
        controls.appendChild(removeBtn);
        controls.className = 'd-flex align-items-center';
        
        div.appendChild(info);
        div.appendChild(controls);
        container.appendChild(div);
    }
    
    /**
     * Refresh debug boss custom vars
     */
    private refreshDebugBossCustomVars(): void {
        if (!this.boss || !this.debugBossCustomVarsContainer) return;
        
        this.debugBossCustomVarsContainer.innerHTML = '';
        
        const customVars = this.boss.getAllCustomVariables();
        Object.entries(customVars).forEach(([key, value]) => {
            this.createDebugCustomVarElement(key, value, this.debugBossCustomVarsContainer!);
        });
    }
    
    /**
     * Create debug custom var element
     */
    private createDebugCustomVarElement(key: string, value: any, container: HTMLElement): void {
        const div = document.createElement('div');
        div.className = 'debug-custom-var d-flex align-items-center justify-content-between bg-secondary p-2 mb-1 rounded';
        
        const keySpan = document.createElement('span');
        keySpan.textContent = key;
        keySpan.className = 'me-2 fw-bold';
        
        const controls = document.createElement('div');
        controls.className = 'd-flex align-items-center';
        
        // Value input
        const valueInput = document.createElement('input');
        valueInput.type = typeof value === 'number' ? 'number' : 'text';
        valueInput.value = value.toString();
        valueInput.className = 'form-control form-control-sm me-2';
        valueInput.style.width = '100px';
        valueInput.addEventListener('change', () => {
            let newValue: any = valueInput.value;
            if (typeof value === 'number') {
                newValue = parseFloat(newValue) || 0;
            } else if (typeof value === 'boolean') {
                newValue = newValue.toLowerCase() === 'true';
            }
            this.boss?.setCustomVariable(key, newValue);
        });
        
        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = '×';
        removeBtn.className = 'btn btn-sm btn-outline-danger';
        removeBtn.addEventListener('click', () => {
            this.boss?.removeCustomVariable(key);
            this.refreshDebugBossCustomVars();
        });
        
        controls.appendChild(valueInput);
        controls.appendChild(removeBtn);
        
        div.appendChild(keySpan);
        div.appendChild(controls);
        container.appendChild(div);
    }
    
    /**
     * Show add status effect dialog
     */
    private async showAddStatusEffectDialog(target: 'player' | 'boss'): Promise<void> {
        // Get all available status effect types
        const statusTypes = Object.values(StatusEffectType);
        
        const result = await ModalUtils.showStatusEffectModal(target, statusTypes);
        if (!result) return;
        
        const { type: effectType, duration: durationNum } = result;
        const statusEffectType = effectType as StatusEffectType;
        
        if (target === 'player' && this.player) {
            this.player.statusEffects.addEffect(statusEffectType);
            // Manually set duration after adding
            const effect = this.player.statusEffects.getEffect(statusEffectType);
            if (effect) {
                effect.duration = durationNum;
            }
            this.refreshDebugPlayerStatusEffects();
        } else if (target === 'boss' && this.boss) {
            this.boss.statusEffects.addEffect(statusEffectType);
            // Manually set duration after adding
            const effect = this.boss.statusEffects.getEffect(statusEffectType);
            if (effect) {
                effect.duration = durationNum;
            }
            this.refreshDebugBossStatusEffects();
        }
    }
    
    /**
     * Show add custom var dialog
     */
    private async showAddCustomVarDialog(): Promise<void> {
        const result = await ModalUtils.showCustomVarModal();
        if (!result) return;
        
        const { key, value: parsedValue } = result;
        
        this.boss?.setCustomVariable(key, parsedValue);
        this.refreshDebugBossCustomVars();
    }
    
    /**
     * Apply debug changes
     */
    private applyDebugChanges(): void {
        if (!this.player || !this.boss) return;
        
        try {
            // Apply player changes
            if (this.debugPlayerHpInput) {
                const hp = parseInt(this.debugPlayerHpInput.value) || 0;
                this.player.hp = Math.max(0, Math.min(hp, this.player.maxHp));
            }
            
            if (this.debugPlayerMaxHpInput) {
                const maxHp = parseInt(this.debugPlayerMaxHpInput.value) || 1;
                this.player.maxHp = Math.max(1, maxHp);
                // Adjust current HP if it exceeds new max
                this.player.hp = Math.min(this.player.hp, this.player.maxHp);
            }
            
            if (this.debugPlayerMpInput) {
                const mp = parseInt(this.debugPlayerMpInput.value) || 0;
                this.player.mp = Math.max(0, Math.min(mp, this.player.maxMp));
            }
            
            if (this.debugPlayerMaxMpInput) {
                const maxMp = parseInt(this.debugPlayerMaxMpInput.value) || 0;
                this.player.maxMp = Math.max(0, maxMp);
                // Adjust current MP if it exceeds new max
                this.player.mp = Math.min(this.player.mp, this.player.maxMp);
            }
            
            // Apply boss changes
            if (this.debugBossHpInput) {
                const hp = parseInt(this.debugBossHpInput.value) || 0;
                this.boss.hp = Math.max(0, Math.min(hp, this.boss.maxHp));
            }
            
            if (this.debugBossMaxHpInput) {
                const maxHp = parseInt(this.debugBossMaxHpInput.value) || 1;
                this.boss.maxHp = Math.max(1, maxHp);
                // Adjust current HP if it exceeds new max
                this.boss.hp = Math.min(this.boss.hp, this.boss.maxHp);
            }
            
            // Update battle UI to reflect changes
            this.updateUI();
            
            ModalUtils.showToast('変更が適用されました！', 'success');
            
        } catch (error) {
            console.error('Error applying debug changes:', error);
            ModalUtils.showToast('変更の適用中にエラーが発生しました', 'error');
        }
    }

    /**
     * 戦闘開始時のメッセージ進行を表示
     */
    private showBattleStartMessages(): void {
        if (!this.boss) {
            return;
        }
        
        if (!this.boss.battleStartMessages) {
            // フォールバック
            this.addBattleLogMessage(`${this.boss.displayName}が現れた！`, 'system');
            return;
        }

        // TODO: MessageData をそのまま渡せるようにする、{player}{boss} などの置換を行う
        this.boss.battleStartMessages.forEach(message => {
            this.addBattleLogMessage(
                message.text, 'battle-start', message.speaker || 'system'
            );
        });
    }

    /**
     * 勝利時のメッセージ進行を表示
     */
    private showVictoryMessages(): void {
        if (!this.boss) {
            return;
        }

        if (!this.boss.victoryMessages) {
            // フォールバック
            this.addBattleLogMessage(`${this.boss.displayName}を倒した！`, 'system');
            return;
        }

        // TODO: MessageData をそのまま渡せるようにする、{player}{boss} などの置換を行う
        this.boss.victoryMessages.forEach(message => {
            this.addBattleLogMessage(
                message.text, 'victory', message.speaker || 'system'
            );
        });
    }
}