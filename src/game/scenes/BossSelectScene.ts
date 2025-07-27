import { Game } from '../Game';
import { getBossData } from '../data';
import { ModalUtils } from '../utils/ModalUtils';
import type { BootstrapModal } from '../types/bootstrap';
import { BossCardManager } from './managers/BossCardManager';
import { PlayerModalManager } from './managers/PlayerModalManager';
import { PlayerInfoEditManager } from './managers/PlayerInfoEditManager';
import { SaveDataManager } from './managers/SaveDataManager';
import { DOMUpdater } from './utils/DOMUpdater';

export class BossSelectScene {
    private game: Game;
    private bossModal: BootstrapModal | null = null;
    private selectedBossId: string = '';
    
    // Manager instances
    private bossCardManager: BossCardManager;
    private playerModalManager: PlayerModalManager;
    private playerInfoEditManager: PlayerInfoEditManager; // Used in custom events
    private saveDataManager: SaveDataManager; // Used in modal buttons
    
    constructor(game: Game) {
        this.game = game;
        
        // Initialize managers
        this.bossCardManager = new BossCardManager(game);
        this.playerModalManager = new PlayerModalManager(game);
        this.playerInfoEditManager = new PlayerInfoEditManager(game);
        this.saveDataManager = new SaveDataManager(game);
        
        // Suppress unused variable warnings - managers are initialized and handle their own events
        void this.playerInfoEditManager;
        void this.saveDataManager;
        
        this.init();
    }
    
    /**
     * Initialize the scene
     * Sets up event listeners and initializes modals
     */
    private init(): void {
        // Player details button
        const playerDetailsButton = document.getElementById('player-details-btn');
        if (playerDetailsButton) {
            playerDetailsButton.addEventListener('click', () => {
                this.playerModalManager.showPlayerDetails();
            });
        }

        // Initialize boss modal
        this.initializeBossModal();
        
        // Setup custom event listeners
        this.setupCustomEventListeners();
        
        // Setup boss card manager callback
        this.bossCardManager.setOnBossSelectCallback((bossId: string) => {
            this.onBossSelect(bossId);
        });
    }
    
    /**
     * Late initialization to ensure all data is loaded before generating boss cards
     */
    public lateInitialize(): void {
        // Generate boss cards
        this.bossCardManager.generateBossCards();
    }

    /**
     * Called when the scene is entered
     * Updates boss cards and player status display
     */
    enter(): void {
        console.log('Entered boss select scene');
        
        // Update boss card information
        this.bossCardManager.updateBossCards();
        
        // Update player status display
        this.updatePlayerSummary();
    }
    
    //#region Custom Event Listeners
    
    /**
     * Setup custom event listeners for inter-manager communication
     */
    private setupCustomEventListeners(): void {
        // Listen for player summary update requests
        document.addEventListener('updatePlayerSummary', () => {
            this.updatePlayerSummary();
        });
        
        // Listen for player modal update requests
        document.addEventListener('updatePlayerModal', () => {
            this.playerModalManager.showPlayerDetails();
        });
        
        // Listen for player modal refresh requests
        document.addEventListener('refreshPlayerModal', () => {
            this.playerModalManager.showPlayerDetails();
        });
    }
    
    //#endregion
    
    //#region Modal - Boss Selection
    
    private initializeBossModal() {
        const bossModalElement = document.getElementById('boss-modal');
        if (bossModalElement && window.bootstrap) {
            this.bossModal = new window.bootstrap.Modal(bossModalElement);
        }
        
        // Confirm boss button
        const confirmButton = document.getElementById('confirm-boss-btn');
        if (confirmButton) {
            confirmButton.addEventListener('click', () => {
                this.onConfirmBoss();
            });
        }
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
                const characterName = bossData.guestCharacterInfo.characterName || 'Guest Character';
                modalGuestInfo.innerHTML = `<small class="text-muted">${characterName} created by ${bossData.guestCharacterInfo.creator}</small>`;
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
    
    //#endregion
    
    //#region Panel - Player Summary
    
    /**
     * Update player status display in boss select screen
     */
    private updatePlayerSummary(): void {
        const player = this.game.getPlayer();
        const equipment = player.getEquipmentInfo();
        
        // Update player header (name and icon)
        DOMUpdater.updateElement('player-header-name', player.name);
        DOMUpdater.updateElement('player-header-icon', player.icon);
        
        // Update summary display using DOMUpdater
        DOMUpdater.updateElements({
            'player-summary-max-hp': player.maxHp.toString(),
            'player-summary-max-mp': player.maxMp.toString(),
            'player-summary-attack': player.getAttackPower().toString(),
            'player-summary-weapon': equipment.weapon?.name || '素手',
            'player-summary-armor': equipment.armor?.name || 'はだか'
        });
    }
    
    //#endregion Panel - Player Summary
}