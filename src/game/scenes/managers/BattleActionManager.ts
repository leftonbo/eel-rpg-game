import { Player } from '../../entities/Player';
import { Boss } from '../../entities/Boss';

/**
 * バトル画面のアクション制御を管理するクラス
 * アクションボタンの有効化/無効化、パネル表示切り替え、スキル・アイテムの使用可能性判定を担当
 */
export class BattleActionManager {
    // UI Elements - Panels
    private actionButtons: HTMLElement | null = null;
    private specialActions: HTMLElement | null = null;
    private battleEndActions: HTMLElement | null = null;
    private itemPanel: HTMLElement | null = null;
    private skillPanel: HTMLElement | null = null;
    
    constructor() {
        this.initializeActionElements();
    }
    
    /**
     * アクション関連UI要素の初期化
     */
    private initializeActionElements(): void {
        this.actionButtons = document.getElementById('action-buttons');
        this.specialActions = document.getElementById('special-actions');
        this.battleEndActions = document.getElementById('battle-end-actions');
        this.itemPanel = document.getElementById('item-panel');
        this.skillPanel = document.getElementById('skill-panel');
    }
    
    /**
     * アクションの可用性を更新
     */
    updateActionAvailability(player: Player, _boss: Boss, playerTurn: boolean, battleEnded: boolean): void {
        const canAct = player.canAct();
        const canActActually = canAct && playerTurn && !battleEnded;
        const isAnyRestrained = player.isAnyRestrained();
        const isKnockedOut = player.isKnockedOut();
        const isDoomed = player.isDoomed();
        const isDefeated = player.isDefeated();
        
        // Show/hide action panels
        if (this.actionButtons && this.specialActions && this.battleEndActions) {
            if (battleEnded) {
                // Battle is over, show only battle end actions
                this.actionButtons.classList.add('d-none');
                this.specialActions.classList.add('d-none');
                this.battleEndActions.classList.remove('d-none');
            } else if (isAnyRestrained || isKnockedOut || isDoomed || isDefeated || !canAct) {
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
                        btn.classList.toggle('disabled', !playerTurn);
                    }
                } else if (isAnyRestrained) {
                    // For restrained state, show struggle and stay-still buttons (if unlocked)
                    if (btnId === 'stay-still-btn') {
                        // Only show stay-still button if the skill is unlocked
                        const hasStayStillSkill = player.hasSkill('stay-still');
                        if (hasStayStillSkill) {
                            btn.classList.remove('d-none');
                            btn.classList.toggle('disabled', !playerTurn);
                        } else {
                            btn.classList.add('d-none');
                        }
                    } else {
                        // Show other buttons normally
                        btn.classList.remove('d-none');
                        btn.classList.toggle('disabled', !playerTurn);
                    }
                } else {
                    // Normal state, hide all special buttons
                    btn.classList.add('d-none');
                }
            }
        });
    }
    
    /**
     * 基本アクションボタンの表示可能性を更新
     */
    updateBasicActionButtons(player: Player): void {
        // Check if basic actions are unlocked
        const hasBasicAttack = true; // Basic attack is always available
        const hasDefend = player.hasSkill('defend'); // Defend skill must be unlocked
        const hasItemAccess = player.itemManager.hasAnyItems(); // Has any items available
        const hasSkillAccess = player.getUnlockedSkills().length > 0; // Has any skills unlocked
        
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
    
    /**
     * スキルボタンの表示可能性を更新
     */
    updateSkillButtonVisibility(player: Player, playerTurn: boolean): void {
        // Hide struggle skill button in skill panel (since it's now in special actions)
        const struggleSkillBtn = document.getElementById('struggle-skill-btn');
        if (struggleSkillBtn) {
            struggleSkillBtn.classList.add('d-none');
        }
        
        // Show/hide struggle skill button in special actions based on state
        const struggleSkillSpecialBtn = document.getElementById('struggle-skill-special-btn');
        if (struggleSkillSpecialBtn) {
            const isStruggleUnlocked = player.hasSkill('struggle');
            const canUseSkill = player.statusEffects.canAct() &&
                               !player.statusEffects.isExhausted() && 
                               !player.statusEffects.isKnockedOut() &&
                               !player.statusEffects.isDoomed() &&
                               !player.statusEffects.isDead();
            
            // Hide if skill is not unlocked or cannot be used
            if (!isStruggleUnlocked || !canUseSkill) {
                struggleSkillSpecialBtn.style.display = 'none';
            } else {
                struggleSkillSpecialBtn.style.display = 'block';
                struggleSkillSpecialBtn.classList.toggle('disabled', !playerTurn);
            }
        }
        
        // Update availability of individual skill buttons
        this.updateIndividualSkillButtons(player, playerTurn);
    }
    
    /**
     * 個別スキルボタンの状態を更新
     */
    private updateIndividualSkillButtons(player: Player, playerTurn: boolean): void {
        // Get unlocked skills from the player
        const unlockedSkills = player.getUnlockedSkills();
        const unlockedSkillIds = new Set(unlockedSkills.map(skill => skill.id));
        
        // Check each skill button
        const skillButtons = [
            { id: 'power-attack-btn', skillId: 'power-attack' },
            { id: 'heal-skill-btn', skillId: 'heal' },
            { id: 'struggle-skill-btn', skillId: 'struggle' },
            { id: 'ultra-smash-btn', skillId: 'ultra-smash' }
        ];
        
        skillButtons.forEach(({ id, skillId }) => {
            const button = document.getElementById(id) as HTMLButtonElement;
            if (button) {
                const isUnlocked = unlockedSkillIds.has(skillId);
                const canUseSkill = this.canUseSkillById(player, skillId, playerTurn);
                
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
    
    /**
     * 特定のスキルが使用可能かチェック
     */
    private canUseSkillById(player: Player, skillId: string, playerTurn: boolean): boolean {
        // Check basic conditions
        if (!playerTurn) {
            return false;
        }
        
        // Check if skill is available
        const availableSkills = player.getAvailableSkills();
        const skill = availableSkills.find(s => s.id === skillId);
        
        return skill !== undefined;
    }
    
    /**
     * スキルパネルを表示
     */
    showSkillPanel(): void {
        if (this.actionButtons && this.skillPanel) {
            this.actionButtons.classList.add('d-none');
            this.skillPanel.classList.remove('d-none');
        }
    }
    
    /**
     * スキルパネルを非表示
     */
    hideSkillPanel(): void {
        if (this.actionButtons && this.skillPanel) {
            this.skillPanel.classList.add('d-none');
            this.actionButtons.classList.remove('d-none');
        }
    }
    
    /**
     * アイテムパネルを表示
     */
    showItemPanel(): void {
        if (this.actionButtons && this.itemPanel) {
            this.actionButtons.classList.add('d-none');
            this.itemPanel.classList.remove('d-none');
        }
    }
    
    /**
     * アイテムパネルを非表示
     */
    hideItemPanel(): void {
        if (this.actionButtons && this.itemPanel) {
            this.itemPanel.classList.add('d-none');
            this.actionButtons.classList.remove('d-none');
        }
    }
    
    /**
     * デバッグボタンの表示可能性を更新
     */
    updateDebugButtonVisibility(isDebugMode: boolean): void {
        const debugBtn = document.getElementById('debug-btn');
        if (debugBtn) {
            if (isDebugMode) {
                debugBtn.classList.remove('d-none');
            } else {
                debugBtn.classList.add('d-none');
            }
        }
    }
}