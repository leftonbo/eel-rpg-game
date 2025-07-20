import { Game } from '../Game';
import { Player } from '../entities/Player';
import { Boss } from '../entities/Boss';
import { StatusEffectType, StatusEffect } from '../systems/StatusEffect';

export class DebugScene {
    private game: Game;
    private player: Player | null = null;
    private boss: Boss | null = null;
    
    // UI Elements
    private playerHpInput: HTMLInputElement | null = null;
    private playerMaxHpInput: HTMLInputElement | null = null;
    private playerMpInput: HTMLInputElement | null = null;
    private playerMaxMpInput: HTMLInputElement | null = null;
    
    private bossHpInput: HTMLInputElement | null = null;
    private bossMaxHpInput: HTMLInputElement | null = null;
    private bossNameElement: HTMLElement | null = null;
    
    private playerStatusEffectsContainer: HTMLElement | null = null;
    private bossStatusEffectsContainer: HTMLElement | null = null;
    private bossCustomVarsContainer: HTMLElement | null = null;
    
    constructor(game: Game) {
        this.game = game;
        this.init();
    }
    
    private init(): void {
        // Get UI elements
        this.playerHpInput = document.getElementById('debug-player-hp') as HTMLInputElement;
        this.playerMaxHpInput = document.getElementById('debug-player-max-hp') as HTMLInputElement;
        this.playerMpInput = document.getElementById('debug-player-mp') as HTMLInputElement;
        this.playerMaxMpInput = document.getElementById('debug-player-max-mp') as HTMLInputElement;
        
        this.bossHpInput = document.getElementById('debug-boss-hp') as HTMLInputElement;
        this.bossMaxHpInput = document.getElementById('debug-boss-max-hp') as HTMLInputElement;
        this.bossNameElement = document.getElementById('debug-boss-name');
        
        this.playerStatusEffectsContainer = document.getElementById('debug-player-status-effects');
        this.bossStatusEffectsContainer = document.getElementById('debug-boss-status-effects');
        this.bossCustomVarsContainer = document.getElementById('debug-boss-custom-vars');
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    private setupEventListeners(): void {
        // Back to battle button
        document.getElementById('debug-back-to-battle-btn')?.addEventListener('click', () => {
            this.returnToBattle();
        });
        
        // Apply changes button
        document.getElementById('debug-apply-changes')?.addEventListener('click', () => {
            this.applyChanges();
        });
        
        // Add status effect buttons
        document.getElementById('debug-add-player-status')?.addEventListener('click', () => {
            this.showAddStatusEffectDialog('player');
        });
        
        document.getElementById('debug-add-boss-status')?.addEventListener('click', () => {
            this.showAddStatusEffectDialog('boss');
        });
        
        // Add custom variable button
        document.getElementById('debug-add-custom-var')?.addEventListener('click', () => {
            this.showAddCustomVarDialog();
        });
    }
    
    enter(): void {
        this.player = this.game.getPlayer();
        this.boss = this.game.getCurrentBoss();
        
        if (!this.player || !this.boss) {
            console.error('Player or boss not found in debug scene');
            return;
        }
        
        this.refreshUI();
    }
    
    private refreshUI(): void {
        if (!this.player || !this.boss) return;
        
        // Update player fields
        if (this.playerHpInput) this.playerHpInput.value = this.player.hp.toString();
        if (this.playerMaxHpInput) this.playerMaxHpInput.value = this.player.maxHp.toString();
        if (this.playerMpInput) this.playerMpInput.value = this.player.mp.toString();
        if (this.playerMaxMpInput) this.playerMaxMpInput.value = this.player.maxMp.toString();
        
        // Update boss fields
        if (this.bossHpInput) this.bossHpInput.value = this.boss.hp.toString();
        if (this.bossMaxHpInput) this.bossMaxHpInput.value = this.boss.maxHp.toString();
        if (this.bossNameElement) this.bossNameElement.textContent = `👹 ${this.boss.displayName}`;
        
        // Update status effects
        this.refreshPlayerStatusEffects();
        this.refreshBossStatusEffects();
        
        // Update custom variables
        this.refreshBossCustomVars();
    }
    
    private refreshPlayerStatusEffects(): void {
        if (!this.player || !this.playerStatusEffectsContainer) return;
        
        this.playerStatusEffectsContainer.innerHTML = '';
        
        const effects = this.player.statusEffects.getAllEffects();
        effects.forEach(effect => {
            this.createStatusEffectElement(effect, 'player', this.playerStatusEffectsContainer!);
        });
    }
    
    private refreshBossStatusEffects(): void {
        if (!this.boss || !this.bossStatusEffectsContainer) return;
        
        this.bossStatusEffectsContainer.innerHTML = '';
        
        const effects = this.boss.statusEffects.getAllEffects();
        effects.forEach(effect => {
            this.createStatusEffectElement(effect, 'boss', this.bossStatusEffectsContainer!);
        });
    }
    
    private createStatusEffectElement(effect: StatusEffect, target: 'player' | 'boss', container: HTMLElement): void {
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
            this.refreshPlayerStatusEffects();
            this.refreshBossStatusEffects();
        });
        
        controls.appendChild(durationInput);
        controls.appendChild(removeBtn);
        controls.className = 'd-flex align-items-center';
        
        div.appendChild(info);
        div.appendChild(controls);
        container.appendChild(div);
    }
    
    private refreshBossCustomVars(): void {
        if (!this.boss || !this.bossCustomVarsContainer) return;
        
        this.bossCustomVarsContainer.innerHTML = '';
        
        const customVars = this.boss.getAllCustomVariables();
        Object.entries(customVars).forEach(([key, value]) => {
            this.createCustomVarElement(key, value, this.bossCustomVarsContainer!);
        });
    }
    
    private createCustomVarElement(key: string, value: any, container: HTMLElement): void {
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
            this.refreshBossCustomVars();
        });
        
        controls.appendChild(valueInput);
        controls.appendChild(removeBtn);
        
        div.appendChild(keySpan);
        div.appendChild(controls);
        container.appendChild(div);
    }
    
    private showAddStatusEffectDialog(target: 'player' | 'boss'): void {
        // Get all available status effect types
        const statusTypes = Object.values(StatusEffectType);
        
        // Create a simple prompt for now (could be enhanced with a proper modal)
        const selectedType = prompt(
            `ステータス効果を選択してください:\n${statusTypes.map((type, index) => `${index + 1}. ${type}`).join('\n')}`,
            '1'
        );
        
        if (!selectedType) return;
        
        const typeIndex = parseInt(selectedType) - 1;
        if (typeIndex < 0 || typeIndex >= statusTypes.length) {
            alert('無効な選択です');
            return;
        }
        
        const duration = prompt('持続ターン数を入力してください:', '3');
        if (!duration) return;
        
        const durationNum = parseInt(duration);
        if (isNaN(durationNum) || durationNum < 1) {
            alert('無効なターン数です');
            return;
        }
        
        const effectType = statusTypes[typeIndex];
        
        if (target === 'player' && this.player) {
            this.player.statusEffects.addEffect(effectType, durationNum);
            this.refreshPlayerStatusEffects();
        } else if (target === 'boss' && this.boss) {
            this.boss.statusEffects.addEffect(effectType, durationNum);
            this.refreshBossStatusEffects();
        }
    }
    
    private showAddCustomVarDialog(): void {
        const key = prompt('変数名を入力してください:');
        if (!key) return;
        
        const value = prompt('値を入力してください:');
        if (value === null) return;
        
        // Try to parse as number or boolean
        let parsedValue: any = value;
        if (!isNaN(Number(value))) {
            parsedValue = Number(value);
        } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
            parsedValue = value.toLowerCase() === 'true';
        }
        
        this.boss?.setCustomVariable(key, parsedValue);
        this.refreshBossCustomVars();
    }
    
    private applyChanges(): void {
        if (!this.player || !this.boss) return;
        
        try {
            // Apply player changes
            if (this.playerHpInput) {
                const hp = parseInt(this.playerHpInput.value) || 0;
                this.player.hp = Math.max(0, Math.min(hp, this.player.maxHp));
            }
            
            if (this.playerMaxHpInput) {
                const maxHp = parseInt(this.playerMaxHpInput.value) || 1;
                this.player.maxHp = Math.max(1, maxHp);
                // Adjust current HP if it exceeds new max
                this.player.hp = Math.min(this.player.hp, this.player.maxHp);
            }
            
            if (this.playerMpInput) {
                const mp = parseInt(this.playerMpInput.value) || 0;
                this.player.mp = Math.max(0, Math.min(mp, this.player.maxMp));
            }
            
            if (this.playerMaxMpInput) {
                const maxMp = parseInt(this.playerMaxMpInput.value) || 0;
                this.player.maxMp = Math.max(0, maxMp);
                // Adjust current MP if it exceeds new max
                this.player.mp = Math.min(this.player.mp, this.player.maxMp);
            }
            
            // Apply boss changes
            if (this.bossHpInput) {
                const hp = parseInt(this.bossHpInput.value) || 0;
                this.boss.hp = Math.max(0, Math.min(hp, this.boss.maxHp));
            }
            
            if (this.bossMaxHpInput) {
                const maxHp = parseInt(this.bossMaxHpInput.value) || 1;
                this.boss.maxHp = Math.max(1, maxHp);
                // Adjust current HP if it exceeds new max
                this.boss.hp = Math.min(this.boss.hp, this.boss.maxHp);
            }
            
            alert('変更が適用されました！');
            this.refreshUI();
            
        } catch (error) {
            console.error('Error applying debug changes:', error);
            alert('変更の適用中にエラーが発生しました');
        }
    }
    
    private returnToBattle(): void {
        this.game.returnToBattle();
    }
}