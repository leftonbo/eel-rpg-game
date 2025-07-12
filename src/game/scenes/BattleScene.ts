import { Game } from '../Game';
import { Player, PLAYER_NAME, SkillType } from '../entities/Player';
import { Boss, ActionType } from '../entities/Boss';
import { calculateAttackResult } from '../utils/CombatUtils';
import { calculateBattleResult } from './BattleResultScene';

export class BattleScene {
    private game: Game;
    private player: Player | null = null;
    private boss: Boss | null = null;
    private turnCount: number = 0;
    private playerTurn: boolean = true;
    private battleEnded: boolean = false;
    private battleLog: HTMLElement | null = null;
    
    // Battle statistics for experience calculation
    private battleStats = {
        damageDealt: 0,
        damageTaken: 0,
        itemsUsed: 0,
        mpSpent: 0,
        wasKnockedOut: false
    };
    
    // UI Elements
    private playerHpElement: HTMLElement | null = null;
    private playerMaxHpElement: HTMLElement | null = null;
    private playerHpBar: HTMLElement | null = null;
    private playerMpElement: HTMLElement | null = null;
    private playerMaxMpElement: HTMLElement | null = null;
    private playerMpBar: HTMLElement | null = null;
    private playerStatusEffects: HTMLElement | null = null;
    
    private bossNameElement: HTMLElement | null = null;
    private bossHpElement: HTMLElement | null = null;
    private bossMaxHpElement: HTMLElement | null = null;
    private bossHpBar: HTMLElement | null = null;
    private bossStatusEffects: HTMLElement | null = null;
    
    private actionButtons: HTMLElement | null = null;
    private specialActions: HTMLElement | null = null;
    private battleEndActions: HTMLElement | null = null;
    private itemPanel: HTMLElement | null = null;
    private skillPanel: HTMLElement | null = null;
    
    private healPotionCount: HTMLElement | null = null;
    private adrenalineCount: HTMLElement | null = null;
    private energyDrinkCount: HTMLElement | null = null;
    
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
        this.playerMpElement = document.getElementById('player-mp');
        this.playerMaxMpElement = document.getElementById('player-max-mp');
        this.playerMpBar = document.getElementById('player-mp-bar');
        this.playerStatusEffects = document.getElementById('player-status-effects');
        
        this.bossNameElement = document.getElementById('boss-name');
        this.bossHpElement = document.getElementById('boss-hp');
        this.bossMaxHpElement = document.getElementById('boss-max-hp');
        this.bossHpBar = document.getElementById('boss-hp-bar');
        this.bossStatusEffects = document.getElementById('boss-status-effects');
        
        this.actionButtons = document.getElementById('action-buttons');
        this.specialActions = document.getElementById('special-actions');
        this.battleEndActions = document.getElementById('battle-end-actions');
        this.itemPanel = document.getElementById('item-panel');
        this.skillPanel = document.getElementById('skill-panel');
        
        this.healPotionCount = document.getElementById('heal-potion-count');
        this.adrenalineCount = document.getElementById('adrenaline-count');
        this.energyDrinkCount = document.getElementById('energy-drink-count');
        
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
            this.handleBattleExit();
        });
    }
    
    enter(): void {
        this.player = this.game.getPlayer();
        this.boss = this.game.getCurrentBoss();
        
        if (!this.player || !this.boss) {
            console.error('Player or boss not found');
            return;
        }
        
        this.turnCount = 0;
        this.playerTurn = true;
        this.battleEnded = false;
        
        // Reset battle statistics
        this.battleStats = {
            damageDealt: 0,
            damageTaken: 0,
            itemsUsed: 0,
            mpSpent: 0,
            wasKnockedOut: false
        };
        
        // Fully restore player HP and MP at battle start
        this.player.fullRestore();
        
        this.initializeBattle();
        this.updateUI();
        
        // Show boss dialogue
        const startDialogue = this.boss.getDialogue('battle-start');
        this.addBattleLogMessage(startDialogue, 'system');
    }
    
    private initializeBattle(): void {
        if (!this.boss) return;
        
        // Clear battle log
        if (this.battleLog) {
            this.battleLog.innerHTML = '<p class="text-muted">バトル開始！</p>';
        }
        
        // Set boss name
        if (this.bossNameElement) {
            this.bossNameElement.textContent = this.boss.displayName;
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
    }
    
    private updatePlayerUI(): void {
        if (!this.player) return;
        
        // HP
        if (this.playerHpElement) this.playerHpElement.textContent = this.player.hp.toString();
        if (this.playerMaxHpElement) this.playerMaxHpElement.textContent = this.player.maxHp.toString();
        
        // HP Bar
        if (this.playerHpBar) {
            const percentage = this.player.getHpPercentage();
            this.playerHpBar.style.width = `${percentage}%`;
            
            // Change color based on HP
            this.playerHpBar.className = 'progress-bar';
            if (percentage > 75) {
                this.playerHpBar.classList.add('bg-success');
            } else if (percentage > 25) {
                this.playerHpBar.classList.add('bg-warning');
            } else {
                this.playerHpBar.classList.add('bg-danger');
            }
        }
        
        // MP
        if (this.playerMpElement) this.playerMpElement.textContent = this.player.mp.toString();
        if (this.playerMaxMpElement) this.playerMaxMpElement.textContent = this.player.maxMp.toString();
        
        // MP Bar
        if (this.playerMpBar) {
            const mpPercentage = this.player.getMpPercentage();
            this.playerMpBar.style.width = `${mpPercentage}%`;
        }
        
        // Status Effects
        this.updateStatusEffectsUI(this.player.statusEffects.getAllEffects(), this.playerStatusEffects);
    }
    
    private updateBossUI(): void {
        if (!this.boss) return;
        
        // HP
        if (this.bossHpElement) this.bossHpElement.textContent = this.boss.hp.toString();
        if (this.bossMaxHpElement) this.bossMaxHpElement.textContent = this.boss.maxHp.toString();
        
        // HP Bar
        if (this.bossHpBar) {
            const percentage = this.boss.getHpPercentage();
            this.bossHpBar.style.width = `${percentage}%`;
        }
        
        // Status Effects
        this.updateStatusEffectsUI(this.boss.statusEffects.getAllEffects(), this.bossStatusEffects);
    }
    
    private updateStatusEffectsUI(effects: any[], container: HTMLElement | null): void {
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
        
        const canAct = this.player.canAct() && this.playerTurn && !this.battleEnded;
        const isRestrained = this.player.isRestrained() || this.player.isEaten();
        const isKnockedOut = this.player.isKnockedOut();
        
        // Show/hide action panels
        if (this.actionButtons && this.specialActions && this.battleEndActions) {
            if (this.battleEnded) {
                // Battle is over, show only battle end actions
                this.actionButtons.classList.add('d-none');
                this.specialActions.classList.add('d-none');
                this.battleEndActions.classList.remove('d-none');
            } else if (isRestrained || isKnockedOut) {
                this.actionButtons.classList.add('d-none');
                this.specialActions.classList.remove('d-none');
                this.battleEndActions.classList.add('d-none');
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
                btn.classList.toggle('disabled', !canAct || isRestrained);
            }
        });
        
        // Special action buttons
        const specialBtns = ['struggle-btn', 'stay-still-btn', 'give-up-btn'];
        specialBtns.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                if (isKnockedOut) {
                    // For knocked out state, only show give-up button
                    if (btnId === 'struggle-btn' || btnId === 'stay-still-btn') {
                        btn.classList.add('d-none');
                    } else {
                        btn.classList.remove('d-none');
                        btn.classList.toggle('disabled', !this.playerTurn);
                    }
                } else if (isRestrained) {
                    // For restrained state, show struggle and stay-still buttons, hide give-up
                    if (btnId === 'give-up-btn') {
                        btn.classList.remove('d-none');
                    } else {
                        btn.classList.remove('d-none');
                    }
                    btn.classList.toggle('disabled', !this.playerTurn);
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
        if (this.healPotionCount) {
            this.healPotionCount.textContent = healPotionCount.toString();
        }
        const healPotionBtn = document.getElementById('heal-potion-btn');
        if (healPotionBtn) {
            healPotionBtn.style.display = healPotionCount > 0 ? 'block' : 'none';
        }
        
        // Update adrenaline
        const adrenalineCount = this.player.getItemCount('adrenaline');
        if (this.adrenalineCount) {
            this.adrenalineCount.textContent = adrenalineCount.toString();
        }
        const adrenalineBtn = document.getElementById('adrenaline-btn');
        if (adrenalineBtn) {
            adrenalineBtn.style.display = adrenalineCount > 0 ? 'block' : 'none';
        }
        
        // Update energy drink
        const energyDrinkCount = this.player.getItemCount('energy-drink');
        if (this.energyDrinkCount) {
            this.energyDrinkCount.textContent = energyDrinkCount.toString();
        }
        const energyDrinkBtn = document.getElementById('energy-drink-btn');
        if (energyDrinkBtn) {
            energyDrinkBtn.style.display = energyDrinkCount > 0 ? 'block' : 'none';
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
            
            // Get existing static buttons to preserve them
            const staticButtons = ['heal-potion-btn', 'adrenaline-btn', 'energy-drink-btn', 'item-back-btn'];
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
            const canUseSkill = !this.player.statusEffects.isExhausted() && 
                               !this.player.statusEffects.isKnockedOut();
            if (canUseSkill) {
                struggleSkillSpecialBtn.classList.remove('d-none');
                struggleSkillSpecialBtn.classList.toggle('disabled', !this.playerTurn);
            } else {
                struggleSkillSpecialBtn.classList.add('d-none');
            }
        }
    }
    
    private playerAttack(): void {
        if (!this.player || !this.boss || !this.playerTurn) return;
        
        const baseDamage = this.player.getAttackPower();
        const attackResult = calculateAttackResult(baseDamage, false); // Player attacks are never guaranteed hits
        
        if (attackResult.isMiss) {
            this.addBattleLogMessage(`${PLAYER_NAME}の攻撃！ ${attackResult.message} 攻撃は外れた！`, 'system');
        } else {
            const actualDamage = this.boss.takeDamage(attackResult.damage);
            // Track damage dealt for experience
            this.battleStats.damageDealt += actualDamage;
            
            if (attackResult.isCritical) {
                this.addBattleLogMessage(`${PLAYER_NAME}の攻撃！ ${attackResult.message} ${this.boss.displayName}に${actualDamage}のダメージ！`, 'damage');
            } else {
                this.addBattleLogMessage(`${PLAYER_NAME}の攻撃！ ${this.boss.displayName}に${actualDamage}のダメージ！`, 'damage');
            }
        }
        
        this.updateUI();
        this.endPlayerTurn();
    }
    
    private playerDefend(): void {
        if (!this.player || !this.playerTurn) return;
        
        this.player.defend();
        this.addBattleLogMessage(`${PLAYER_NAME}は身を守った！`, 'system');
        
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
        
        const result = this.player.useSkill(skillType, this.boss);
        
        if (result.success) {
            this.addBattleLogMessage(result.message, 'system');
            
            // Track MP spent for experience
            const mpCost = (result as any).mpCost;
            if (mpCost) {
                this.battleStats.mpSpent += mpCost;
            }
            
            // Apply damage if applicable
            if (result.damage && result.damage > 0) {
                const actualDamage = this.boss.takeDamage(result.damage);
                // Track damage dealt for experience
                this.battleStats.damageDealt += actualDamage;
                this.addBattleLogMessage(`${this.boss.displayName}に${actualDamage}のダメージ！`, 'damage');
            }
            
            this.hideSkillPanel();
            this.updateUI();
            this.endPlayerTurn();
        } else {
            this.addBattleLogMessage(result.message, 'system');
            this.updateUI();
        }
    }
    
    private useItem(itemName: string): void {
        if (!this.player || !this.playerTurn) return;
        
        const success = this.player.useItem(itemName);
        
        if (success) {
            // Track items used for experience
            this.battleStats.itemsUsed++;
            
            // Get display name from player's item data or fallback to predefined names
            let itemDisplayName = itemName;
            const playerItem = this.player.items.get(itemName);
            if (playerItem) {
                itemDisplayName = playerItem.name;
            } else {
                const itemDisplayNames: { [key: string]: string } = {
                    'heal-potion': '回復薬',
                    'adrenaline': 'アドレナリン注射',
                    'energy-drink': '元気ドリンク'
                };
                itemDisplayName = itemDisplayNames[itemName] || itemName;
            }
            
            this.addBattleLogMessage(`${PLAYER_NAME}は${itemDisplayName}を使った！`, 'heal');
            
            this.hideItemPanel();
            // Items don't end turn
            this.updateUI();
        } else {
            this.addBattleLogMessage(`${itemDisplayName || itemName}を使用できない！`, 'system');
        }
    }
    
    private playerStruggle(): void {
        if (!this.player || !this.boss || !this.playerTurn) return;
        
        const success = this.player.attemptStruggle();
        
        if (success) {
            this.addBattleLogMessage(`${PLAYER_NAME}は拘束を振り切った！`, 'system');
            this.boss.onRestraintBroken();
            this.addBattleLogMessage(`${this.boss.displayName}は反動で動けなくなった！`, 'system');
            
            const escapeDialogue = this.boss.getDialogue('player-escapes');
            this.addBattleLogMessage(escapeDialogue, 'system');
        } else {
            this.addBattleLogMessage(`${PLAYER_NAME}はもがいたが、拘束を抜けられなかった...`, 'system');
        }
        
        this.updateUI();
        this.endPlayerTurn();
    }
    
    private playerStayStill(): void {
        if (!this.player || !this.playerTurn) return;
        
        this.player.stayStill();
        this.addBattleLogMessage(`${PLAYER_NAME}はじっとして体力を回復した`, 'heal');
        
        this.updateUI();
        this.endPlayerTurn();
    }
    
    private playerGiveUp(): void {
        if (!this.player || !this.playerTurn) return;
        
        this.addBattleLogMessage(`${PLAYER_NAME}はなすがままにした...`, 'system');
        
        this.updateUI();
        this.endPlayerTurn();
    }
    
    private endPlayerTurn(): void {
        this.playerTurn = false;
        this.checkBattleEnd();
        
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
                this.addBattleLogMessage(`${this.boss.displayName}は反動で動けない...`, 'system');
            }
            this.endBossTurn();
            return;
        }
        
        // Boss AI selects action
        const action = this.boss.selectAction(this.player, this.turnCount);
        
        if (action) {
            const playerHpBefore = this.player.hp;
            const message = this.boss.executeAction(action, this.player);
            
            // Track damage taken for experience
            if (this.player.hp < playerHpBefore) {
                this.battleStats.damageTaken += (playerHpBefore - this.player.hp);
            }
            
            this.addBattleLogMessage(message, action.type === ActionType.Attack ? 'damage' : 'status-effect');
            
            // Check if player was knocked down to 0 HP
            if (this.player.hp === 0 && playerHpBefore > 0) {
                this.addBattleLogMessage(`${PLAYER_NAME}はダウンしてしまった！`, 'system');
            }
            
            // Add boss dialogue based on situation
            if (action.type === ActionType.RestraintAttack && this.player.isRestrained()) {
                const restrainDialogue = this.boss.getDialogue('player-restrained');
                this.addBattleLogMessage(restrainDialogue, 'system');
            } else if (action.type === ActionType.DevourAttack && this.player.isEaten()) {
                const eatenDialogue = this.boss.getDialogue('player-eaten');
                this.addBattleLogMessage(eatenDialogue, 'system');
            }
        }
        
        this.endBossTurn();
    }
    
    private endBossTurn(): void {
        this.turnCount++;
        this.playerTurn = true;
        
        // Check if player is knocked out for battle stats
        if (this.player && this.player.isKnockedOut()) {
            this.battleStats.wasKnockedOut = true;
        }
        
        // Process round end effects for both player and boss
        this.processRoundEnd();
        
        // Start player turn
        if (this.player) {
            this.player.startTurn();
            
            // Check for exhausted recovery messages
            const recoveryMessages = this.player.checkExhaustedRecovery();
            recoveryMessages.forEach(message => {
                this.addBattleLogMessage(message, 'system');
            });
        }
        
        this.updateUI();
        this.checkBattleEnd();
    }
    
    private processRoundEnd(): void {
        const messages: string[] = [];
        
        // Process player status effects
        if (this.player) {
            const playerMessages = this.player.processRoundEnd();
            messages.push(...playerMessages);
        }
        
        // Process boss status effects
        if (this.boss) {
            const bossMessages = this.boss.processRoundEnd();
            messages.push(...bossMessages);
        }
        
        // Display all messages
        messages.forEach(message => {
            this.addBattleLogMessage(message, 'status-effect');
        });
    }
    
    private checkBattleEnd(): boolean {
        if (!this.player || !this.boss) return false;
        
        // Check if boss is defeated
        if (this.boss.isDead()) {
            this.addBattleLogMessage(`${this.boss.displayName}を倒した！`, 'system');
            this.addBattleLogMessage('勝利！', 'system');
            this.addBattleLogMessage('「バトル終了」ボタンを押して結果を確認してください。', 'system');
            
            // Set battle ended state
            this.battleEnded = true;
            this.updateUI();
            
            return true;
        }
        
        // Check if player is completely defeated (max HP <= 0)
        if (this.player.isDead()) {
            this.addBattleLogMessage(`${PLAYER_NAME}は完全に消化されてしまった...`, 'system');
            this.addBattleLogMessage('ゲームオーバー', 'system');
            
            const victoryDialogue = this.boss.getDialogue('victory');
            this.addBattleLogMessage(victoryDialogue, 'system');
            this.addBattleLogMessage('「バトル終了」ボタンを押して結果を確認してください。', 'system');
            
            // Set battle ended state
            this.battleEnded = true;
            this.updateUI();
            
            return true;
        }
        
        return false;
    }
    
    private addBattleLogMessage(message: string, type: string = ''): void {
        if (!this.battleLog) return;
        
        const messageElement = document.createElement('p');
        messageElement.textContent = message;
        
        if (type) {
            messageElement.classList.add(type);
        }
        
        this.battleLog.appendChild(messageElement);
        this.battleLog.scrollTop = this.battleLog.scrollHeight;
    }
    
    /**
     * Handle battle exit (from back to boss select button)
     */
    private handleBattleExit(): void {
        if (!this.player) {
            this.game.returnToBossSelect();
            return;
        }
        
        // Check if there's any battle activity worth showing results for
        const hasActivity = this.battleStats.damageDealt > 0 || 
                           this.battleStats.damageTaken > 0 || 
                           this.battleStats.itemsUsed > 0 || 
                           this.battleStats.mpSpent > 0 || 
                           this.battleStats.wasKnockedOut;
        
        if (hasActivity) {
            // Show battle result screen
            const battleResult = calculateBattleResult(
                this.player,
                false, // not a victory (interrupted)
                this.battleStats.damageDealt,
                this.battleStats.damageTaken,
                this.battleStats.itemsUsed,
                this.battleStats.mpSpent,
                this.battleStats.wasKnockedOut
            );
            this.game.showBattleResult(battleResult);
        } else {
            // No activity, go directly to boss select
            this.game.returnToBossSelect();
        }
    }
    
    /**
     * Finalize battle and show results screen
     */
    private finalizeBattle(): void {
        if (!this.player || !this.boss) return;
        
        // Determine if it was a victory
        const victory = this.boss.isDead();
        
        // Calculate battle result and show result screen
        const battleResult = calculateBattleResult(
            this.player,
            victory,
            this.battleStats.damageDealt,
            this.battleStats.damageTaken,
            this.battleStats.itemsUsed,
            this.battleStats.mpSpent,
            this.battleStats.wasKnockedOut
        );
        this.game.showBattleResult(battleResult);
    }
}