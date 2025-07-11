import { Game } from '../Game';
import { Player, PLAYER_NAME, SkillType } from '../entities/Player';
import { Boss, ActionType } from '../entities/Boss';
import { calculateAttackResult } from '../utils/CombatUtils';

export class BattleScene {
    private game: Game;
    private player: Player | null = null;
    private boss: Boss | null = null;
    private turnCount: number = 0;
    private playerTurn: boolean = true;
    private battleLog: HTMLElement | null = null;
    
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
        
        // Back to boss select
        document.getElementById('back-to-select-btn')?.addEventListener('click', () => {
            this.game.returnToBossSelect();
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
        
        const canAct = this.player.canAct() && this.playerTurn;
        const isRestrained = this.player.isRestrained() || this.player.isEaten();
        const isKnockedOut = this.player.isKnockedOut();
        
        // Show/hide action panels
        if (this.actionButtons && this.specialActions) {
            if (isRestrained || isKnockedOut) {
                this.actionButtons.classList.add('d-none');
                this.specialActions.classList.remove('d-none');
            } else {
                this.actionButtons.classList.remove('d-none');
                this.specialActions.classList.add('d-none');
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
        
        if (this.healPotionCount) {
            this.healPotionCount.textContent = this.player.getItemCount('heal-potion').toString();
        }
        
        if (this.adrenalineCount) {
            this.adrenalineCount.textContent = this.player.getItemCount('adrenaline').toString();
        }
        
        if (this.energyDrinkCount) {
            this.energyDrinkCount.textContent = this.player.getItemCount('energy-drink').toString();
        }
    }
    
    private updateSkillButtonVisibility(): void {
        if (!this.player) return;
        
        // Hide struggle skill button in skill panel (since it's now in special actions)
        const struggleSkillBtn = document.getElementById('struggle-skill-btn');
        if (struggleSkillBtn) {
            struggleSkillBtn.classList.add('d-none');
        }
        
        // Show/hide struggle skill button in special actions based on MP and exhaustion
        const struggleSkillSpecialBtn = document.getElementById('struggle-skill-special-btn');
        if (struggleSkillSpecialBtn) {
            const canUseSkill = !this.player.statusEffects.isExhausted();
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
            if (attackResult.isCritical) {
                this.addBattleLogMessage(`${PLAYER_NAME}の攻撃！ ${attackResult.message} ${this.boss.displayName}に${actualDamage}のダメージ！`, 'damage');
            } else {
                this.addBattleLogMessage(`${PLAYER_NAME}の攻撃！ ${this.boss.displayName}に${actualDamage}のダメージ！`, 'damage');
            }
        }
        
        this.endPlayerTurn();
    }
    
    private playerDefend(): void {
        if (!this.player || !this.playerTurn) return;
        
        this.player.defend();
        this.addBattleLogMessage(`${PLAYER_NAME}は身を守った！`, 'system');
        
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
            
            // Apply damage if applicable
            if (result.damage && result.damage > 0) {
                const actualDamage = this.boss.takeDamage(result.damage);
                this.addBattleLogMessage(`${this.boss.displayName}に${actualDamage}のダメージ！`, 'damage');
            }
            
            this.hideSkillPanel();
            this.endPlayerTurn();
        } else {
            this.addBattleLogMessage(result.message, 'system');
        }
    }
    
    private useItem(itemName: string): void {
        if (!this.player || !this.playerTurn) return;
        
        const success = this.player.useItem(itemName);
        
        if (success) {
            const itemDisplayNames: { [key: string]: string } = {
                'heal-potion': '回復薬',
                'adrenaline': 'アドレナリン注射',
                'energy-drink': '元気ドリンク'
            };
            const itemDisplayName = itemDisplayNames[itemName] || itemName;
            this.addBattleLogMessage(`${PLAYER_NAME}は${itemDisplayName}を使った！`, 'heal');
            
            this.hideItemPanel();
            // Items don't end turn
            this.updateUI();
        } else {
            this.addBattleLogMessage(`${itemName}を使用できない！`, 'system');
        }
    }
    
    private playerStruggle(): void {
        if (!this.player || !this.boss || !this.playerTurn) return;
        
        const success = this.player.attemptStruggle();
        
        if (success) {
            this.addBattleLogMessage('エルナルは拘束を振り切った！', 'system');
            this.boss.onRestraintBroken();
            this.addBattleLogMessage(`${this.boss.displayName}は反動で動けなくなった！`, 'system');
            
            const escapeDialogue = this.boss.getDialogue('player-escapes');
            this.addBattleLogMessage(escapeDialogue, 'system');
        } else {
            this.addBattleLogMessage('エルナルはもがいたが、拘束を抜けられなかった...', 'system');
        }
        
        this.endPlayerTurn();
    }
    
    private playerStayStill(): void {
        if (!this.player || !this.playerTurn) return;
        
        this.player.stayStill();
        this.addBattleLogMessage('エルナルはじっとして体力を回復した', 'heal');
        
        this.endPlayerTurn();
    }
    
    private playerGiveUp(): void {
        if (!this.player || !this.playerTurn) return;
        
        this.addBattleLogMessage('エルナルはなすがままにした...', 'system');
        
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
            const message = this.boss.executeAction(action, this.player);
            this.addBattleLogMessage(message, action.type === ActionType.Attack ? 'damage' : 'status-effect');
            
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
            
            // Return to boss select after delay
            setTimeout(() => {
                this.game.returnToBossSelect();
            }, 3000);
            
            return true;
        }
        
        // Check if player is completely defeated (max HP <= 0)
        if (this.player.isDead()) {
            this.addBattleLogMessage('エルナルは完全に消化されてしまった...', 'system');
            this.addBattleLogMessage('ゲームオーバー', 'system');
            
            const victoryDialogue = this.boss.getDialogue('victory');
            this.addBattleLogMessage(victoryDialogue, 'system');
            
            // Return to boss select after delay
            setTimeout(() => {
                this.game.returnToBossSelect();
            }, 3000);
            
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
}