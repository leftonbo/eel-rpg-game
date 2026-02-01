import { Player } from '../../entities/Player';
import { Boss } from '../../entities/Boss';
import { StatusEffect, StatusEffectType } from '../../systems/StatusEffect';
import { PLAYER_ITEMS } from '@/game/data/PlayerItems';
import { BossModalComponent } from '../components/BossModalComponent';
import { t } from 'i18next';

/**
 * バトル画面のUI更新を管理するクラス
 * プレイヤー・ボスのHP/MP表示、ステータス効果表示、アイテム個数表示などを担当
 */
export class BattleUIManager {
    // UI Elements - Player
    private playerHpElement: HTMLElement | null = null;
    private playerMaxHpElement: HTMLElement | null = null;
    private playerHpBar: HTMLElement | null = null;
    private playerHpProgress: HTMLElement | null = null;
    private playerMpElement: HTMLElement | null = null;
    private playerMaxMpElement: HTMLElement | null = null;
    private playerMpBar: HTMLElement | null = null;
    private playerMpProgress: HTMLElement | null = null;
    private playerStatusEffects: HTMLElement | null = null;
    
    // UI Elements - Boss
    private bossIconElement: HTMLElement | null = null;
    private bossNameElement: HTMLElement | null = null;
    private bossHpElement: HTMLElement | null = null;
    private bossMaxHpElement: HTMLElement | null = null;
    private bossHpBar: HTMLElement | null = null;
    private bossHpProgress: HTMLElement | null = null;
    private bossStatusEffects: HTMLElement | null = null;
    
    // UI Elements - Items
    private healPotionCount: HTMLElement | null = null;
    private adrenalineCount: HTMLElement | null = null;
    private energyDrinkCount: HTMLElement | null = null;
    
    // Boss Modal
    private bossModalComponent: BossModalComponent;
    
    constructor() {
        this.initializeUIElements();
        this.bossModalComponent = BossModalComponent.getInstance();
    }
    
    /**
     * UI要素の初期化
     */
    private initializeUIElements(): void {
        // Player UI elements
        this.playerHpElement = document.getElementById('player-hp');
        this.playerMaxHpElement = document.getElementById('player-max-hp');
        this.playerHpBar = document.getElementById('player-hp-bar');
        this.playerHpProgress = document.getElementById('player-hp-progress');
        this.playerMpElement = document.getElementById('player-mp');
        this.playerMaxMpElement = document.getElementById('player-max-mp');
        this.playerMpBar = document.getElementById('player-mp-bar');
        this.playerMpProgress = document.getElementById('player-mp-progress');
        this.playerStatusEffects = document.getElementById('player-status-effects');
        
        // Boss UI elements
        this.bossIconElement = document.getElementById('boss-icon');
        this.bossNameElement = document.getElementById('boss-name');
        this.bossHpElement = document.getElementById('boss-hp');
        this.bossMaxHpElement = document.getElementById('boss-max-hp');
        this.bossHpBar = document.getElementById('boss-hp-bar');
        this.bossHpProgress = document.getElementById('boss-hp-progress');
        this.bossStatusEffects = document.getElementById('boss-status-effects');
        
        // Item count elements
        this.healPotionCount = document.getElementById('heal-potion-count');
        this.adrenalineCount = document.getElementById('adrenaline-count');
        this.energyDrinkCount = document.getElementById('energy-drink-count');
    }
    
    /**
     * 全UI要素を更新
     */
    updateAllUI(player: Player, boss: Boss): void {
        this.updatePlayerUI(player);
        this.updateBossUI(boss);
        this.updateItemCounts(player);
    }
    
    /**
     * プレイヤーUI更新
     */
    updatePlayerUI(player: Player): void {
        // Update player name and icon
        const battlePlayerNameElement = document.getElementById('battle-player-name');
        const battlePlayerIconElement = document.getElementById('battle-player-icon');
        if (battlePlayerNameElement) battlePlayerNameElement.textContent = player.name;
        if (battlePlayerIconElement) battlePlayerIconElement.textContent = player.icon;
        
        // HP
        if (this.playerHpElement) this.playerHpElement.textContent = player.hp.toString();
        if (this.playerMaxHpElement) this.playerMaxHpElement.textContent = player.maxHp.toString();
        
        // HP Progress Container
        if (this.playerHpProgress) {
            const containerPercentage = player.getHpContainerPercentage();
            this.playerHpProgress.style.width = `${containerPercentage}%`;
        }
        
        // HP Bar
        if (this.playerHpBar) {
            const barPercentage = player.getHpPercentage();
            const colorPercentage = player.getHpPercentage();
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
        if (this.playerMpElement) this.playerMpElement.textContent = player.mp.toString();
        if (this.playerMaxMpElement) this.playerMaxMpElement.textContent = player.maxMp.toString();
        
        // MP Progress Container
        if (this.playerMpProgress) {
            const mpContainerPercentage = player.getMpContainerPercentage();
            this.playerMpProgress.style.width = `${mpContainerPercentage}%`;
        }
        
        // MP Bar
        if (this.playerMpBar) {
            const mpBarPercentage = player.getMpPercentage();
            this.playerMpBar.style.width = `${mpBarPercentage}%`;
        }
        
        // Status Effects
        this.updateStatusEffectsUI(player.statusEffects.getAllEffects(), this.playerStatusEffects);
    }
    
    /**
     * ボスUI更新
     */
    updateBossUI(boss: Boss): void {
        // Update boss icon
        if (this.bossIconElement) {
            this.bossIconElement.textContent = boss.icon;
        }
        
        // Set boss name
        if (this.bossNameElement) {
            this.bossNameElement.textContent = boss.displayName;
        }
        
        // HP
        if (this.bossHpElement) this.bossHpElement.textContent = boss.hp.toString();
        if (this.bossMaxHpElement) this.bossMaxHpElement.textContent = boss.maxHp.toString();
        
        // HP Progress Container
        if (this.bossHpProgress) {
            const containerPercentage = boss.getHpContainerPercentage();
            this.bossHpProgress.style.width = `${containerPercentage}%`;
        }
        
        // HP Bar
        if (this.bossHpBar) {
            const barPercentage = boss.getHpPercentage();
            this.bossHpBar.style.width = `${barPercentage}%`;
        }
        
        // Status Effects
        this.updateStatusEffectsUI(boss.statusEffects.getAllEffects(), this.bossStatusEffects);
    }
    
    /**
     * ステータス効果UI更新
     */
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
    
    /**
     * アイテム個数表示更新
     */
    updateItemCounts(player: Player): void {
        const itemPanel = document.getElementById('item-panel');
        if (!itemPanel) return;
        
        const itemGrid = itemPanel.querySelector('.d-grid');
        if (!itemGrid) return;
        
        // Remove dynamically created buttons (not static ones)
        const dynamicButtons = itemGrid.querySelectorAll('[data-dynamic-item]');
        dynamicButtons.forEach(btn => btn.remove());
        
        // Add buttons for player items that are unlocked and not already shown
        PLAYER_ITEMS.forEach(itemData => {
            const itemCount = player.getItemCount(itemData.id);
            if (itemCount > 0) {
                const button = document.createElement('button');
                button.id = `${itemData.id}-btn`;
                button.className = 'btn btn-outline-success';
                button.setAttribute('data-dynamic-item', 'true');
                button.innerHTML = `${itemData.icon} ${t(`items.${itemData.id}.name`)} (${itemCount})`;
                button.title = t(`items.${itemData.id}.description`);
                
                // Insert before the back button
                const backBtn = document.getElementById('item-back-btn');
                if (backBtn) {
                    itemGrid.insertBefore(button, backBtn);
                }
            }
        });
    }
    
    /**
     * おまもりボタンを特殊アクションパネルに更新
     */
    updateOmamoriInSpecialActions(player: Player): void {
        const omamoriContainer = document.getElementById('omamori-special-container');
        if (!omamoriContainer) return;
        
        // Check if omamori can be used
        const hasOmamori = player.getItemCount('omamori') > 0;
        const canUseOmamori = hasOmamori && (
            player.isKnockedOut() || 
            player.isRestrained() || 
            player.isEaten() || 
            player.isCocoon() || 
            player.statusEffects.hasEffect(StatusEffectType.Sleep)
        );
        
        // Clear container
        omamoriContainer.innerHTML = '';
        
        // Add omamori button if can use
        if (canUseOmamori && !player.isDefeated()) {
            const omamoriBtn = document.createElement('button');
            omamoriBtn.id = 'omamori-special-btn';
            omamoriBtn.className = 'btn btn-outline-light';
            omamoriBtn.innerHTML = `🧿 ${t('items.omamori.name')} (${player.getItemCount('omamori')})`;
            omamoriBtn.title = t('items.omamori.description');
            omamoriContainer.appendChild(omamoriBtn);
        }
    }
    
    /**
     * バトル画面からボス情報モーダルを表示
     */
    showBossInfoModal(boss: Boss): void {
        // 情報表示モードでボスモーダルを表示
        this.bossModalComponent.show(boss.id, {
            mode: 'info'
        });
    }
}