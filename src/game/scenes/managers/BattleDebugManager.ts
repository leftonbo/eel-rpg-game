import { Player } from '../../entities/Player';
import { Boss } from '../../entities/Boss';
import { StatusEffect, StatusEffectType } from '../../systems/StatusEffect';
import { ModalUtils } from '../../utils/ModalUtils';
import type { BootstrapModal } from '../../types/bootstrap';

/**
 * バトル画面のデバッグ機能を管理するクラス
 * デバッグモーダル表示、ステータス効果編集、カスタム変数編集を担当
 */
export class BattleDebugManager {
    // Debug Modal
    private debugModal: BootstrapModal | null = null;
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
    
    constructor() {
        this.initializeDebugElements();
    }
    
    /**
     * デバッグ関連UI要素の初期化
     */
    private initializeDebugElements(): void {
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
    }
    
    /**
     * デバッグモーダルを表示
     */
    showDebugModal(player: Player, boss: Boss): void {
        if (!this.debugModal) return;
        
        // Populate current values
        this.refreshDebugUI(player, boss);
        
        // Show modal
        this.debugModal.show();
    }
    
    /**
     * デバッグUIを現在の値で更新
     */
    refreshDebugUI(player: Player, boss: Boss): void {
        // Update player fields
        if (this.debugPlayerHpInput) this.debugPlayerHpInput.value = player.hp.toString();
        if (this.debugPlayerMaxHpInput) this.debugPlayerMaxHpInput.value = player.maxHp.toString();
        if (this.debugPlayerMpInput) this.debugPlayerMpInput.value = player.mp.toString();
        if (this.debugPlayerMaxMpInput) this.debugPlayerMaxMpInput.value = player.maxMp.toString();
        
        // Update boss fields
        if (this.debugBossHpInput) this.debugBossHpInput.value = boss.hp.toString();
        if (this.debugBossMaxHpInput) this.debugBossMaxHpInput.value = boss.maxHp.toString();
        if (this.debugBossNameElement) this.debugBossNameElement.textContent = `👹 ${boss.displayName}`;
        
        // Update status effects
        this.refreshDebugPlayerStatusEffects(player);
        this.refreshDebugBossStatusEffects(boss);
        
        // Update custom variables
        this.refreshDebugBossCustomVars(boss);
    }
    
    /**
     * デバッグ変更を適用
     */
    applyDebugChanges(player: Player, boss: Boss): void {
        try {
            // Apply player changes
            if (this.debugPlayerHpInput) {
                const hp = parseInt(this.debugPlayerHpInput.value) || 0;
                player.hp = Math.max(0, Math.min(hp, player.maxHp));
            }
            
            if (this.debugPlayerMaxHpInput) {
                const maxHp = parseInt(this.debugPlayerMaxHpInput.value) || 1;
                player.maxHp = Math.max(1, maxHp);
                // Adjust current HP if it exceeds new max
                player.hp = Math.min(player.hp, player.maxHp);
            }
            
            if (this.debugPlayerMpInput) {
                const mp = parseInt(this.debugPlayerMpInput.value) || 0;
                player.mp = Math.max(0, Math.min(mp, player.maxMp));
            }
            
            if (this.debugPlayerMaxMpInput) {
                const maxMp = parseInt(this.debugPlayerMaxMpInput.value) || 0;
                player.maxMp = Math.max(0, maxMp);
                // Adjust current MP if it exceeds new max
                player.mp = Math.min(player.mp, player.maxMp);
            }
            
            // Apply boss changes
            if (this.debugBossHpInput) {
                const hp = parseInt(this.debugBossHpInput.value) || 0;
                boss.hp = Math.max(0, Math.min(hp, boss.maxHp));
            }
            
            if (this.debugBossMaxHpInput) {
                const maxHp = parseInt(this.debugBossMaxHpInput.value) || 1;
                boss.maxHp = Math.max(1, maxHp);
                // Adjust current HP if it exceeds new max
                boss.hp = Math.min(boss.hp, boss.maxHp);
            }
            
            ModalUtils.showToast('変更が適用されました！', 'success');
            
        } catch (error) {
            console.error('Error applying debug changes:', error);
            ModalUtils.showToast('変更の適用中にエラーが発生しました', 'error');
        }
    }
    
    /**
     * プレイヤーのステータス効果デバッグ表示を更新
     */
    private refreshDebugPlayerStatusEffects(player: Player): void {
        if (!this.debugPlayerStatusEffectsContainer) return;
        
        this.debugPlayerStatusEffectsContainer.innerHTML = '';
        
        const effects = player.statusEffects.getAllEffects();
        effects.forEach(effect => {
            this.createDebugStatusEffectElement(effect, 'player', this.debugPlayerStatusEffectsContainer!, player);
        });
    }
    
    /**
     * ボスのステータス効果デバッグ表示を更新
     */
    private refreshDebugBossStatusEffects(boss: Boss): void {
        if (!this.debugBossStatusEffectsContainer) return;
        
        this.debugBossStatusEffectsContainer.innerHTML = '';
        
        const effects = boss.statusEffects.getAllEffects();
        effects.forEach(effect => {
            this.createDebugStatusEffectElement(effect, 'boss', this.debugBossStatusEffectsContainer!, undefined, boss);
        });
    }
    
    /**
     * デバッグ用ステータス効果要素を作成
     */
    private createDebugStatusEffectElement(
        effect: StatusEffect, 
        target: 'player' | 'boss', 
        container: HTMLElement,
        player?: Player,
        boss?: Boss
    ): void {
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
            if (target === 'player' && player) {
                player.statusEffects.removeEffect(effect.type);
                this.refreshDebugPlayerStatusEffects(player);
            } else if (target === 'boss' && boss) {
                boss.statusEffects.removeEffect(effect.type);
                this.refreshDebugBossStatusEffects(boss);
            }
        });
        
        controls.appendChild(durationInput);
        controls.appendChild(removeBtn);
        controls.className = 'd-flex align-items-center';
        
        div.appendChild(info);
        div.appendChild(controls);
        container.appendChild(div);
    }
    
    /**
     * ボスのカスタム変数デバッグ表示を更新
     */
    private refreshDebugBossCustomVars(boss: Boss): void {
        if (!this.debugBossCustomVarsContainer) return;
        
        this.debugBossCustomVarsContainer.innerHTML = '';
        
        const customVars = boss.getAllCustomVariables();
        Object.entries(customVars).forEach(([key, value]) => {
            this.createDebugCustomVarElement(key, value, this.debugBossCustomVarsContainer!, boss);
        });
    }
    
    /**
     * デバッグ用カスタム変数要素を作成
     */
    private createDebugCustomVarElement(key: string, value: any, container: HTMLElement, boss: Boss): void {
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
            boss.setCustomVariable(key, newValue);
        });
        
        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = '×';
        removeBtn.className = 'btn btn-sm btn-outline-danger';
        removeBtn.addEventListener('click', () => {
            boss.removeCustomVariable(key);
            this.refreshDebugBossCustomVars(boss);
        });
        
        controls.appendChild(valueInput);
        controls.appendChild(removeBtn);
        
        div.appendChild(keySpan);
        div.appendChild(controls);
        container.appendChild(div);
    }
    
    /**
     * ステータス効果追加ダイアログを表示
     */
    async showAddStatusEffectDialog(target: 'player' | 'boss', player?: Player, boss?: Boss): Promise<void> {
        // Get all available status effect types
        const statusTypes = Object.values(StatusEffectType);
        
        const result = await ModalUtils.showStatusEffectModal(target, statusTypes);
        if (!result) return;
        
        const { type: effectType, duration: durationNum } = result;
        const statusEffectType = effectType as StatusEffectType;
        
        if (target === 'player' && player) {
            player.statusEffects.addEffect(statusEffectType);
            // Manually set duration after adding
            const effect = player.statusEffects.getEffect(statusEffectType);
            if (effect) {
                effect.duration = durationNum;
            }
            this.refreshDebugPlayerStatusEffects(player);
        } else if (target === 'boss' && boss) {
            boss.statusEffects.addEffect(statusEffectType);
            // Manually set duration after adding
            const effect = boss.statusEffects.getEffect(statusEffectType);
            if (effect) {
                effect.duration = durationNum;
            }
            this.refreshDebugBossStatusEffects(boss);
        }
    }
    
    /**
     * カスタム変数追加ダイアログを表示
     */
    async showAddCustomVarDialog(boss: Boss): Promise<void> {
        const result = await ModalUtils.showCustomVarModal();
        if (!result) return;
        
        const { key, value: parsedValue } = result;
        
        boss.setCustomVariable(key, parsedValue);
        this.refreshDebugBossCustomVars(boss);
    }
}