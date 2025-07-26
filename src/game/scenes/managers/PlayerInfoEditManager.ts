import { Game } from '../../Game';
import { getIconsByCategory } from '../../data/PlayerIcons';
import { DEFAULT_PLAYER_NAME, DEFAULT_PLAYER_ICON } from '../../entities/Player';
import { ModalUtils } from '../../utils/ModalUtils';
import type { BootstrapModal } from '../../types/bootstrap';

export class PlayerInfoEditManager {
    private game: Game;
    private playerInfoEditModal: BootstrapModal | null = null;
    private selectedIcon: string = '🐍'; // Temporary storage for icon selection

    constructor(game: Game) {
        this.game = game;
        this.initializePlayerInfoEditModal();
        this.setupCustomEventListeners();
    }

    /**
     * Initialize player info edit modal and event listeners
     */
    private initializePlayerInfoEditModal(): void {
        // Initialize player info edit modal
        const playerInfoEditModalElement = document.getElementById('player-info-edit-modal');
        if (playerInfoEditModalElement && window.bootstrap) {
            this.playerInfoEditModal = new window.bootstrap.Modal(playerInfoEditModalElement);
        }
        
        // Save player info button
        const savePlayerInfoButton = document.getElementById('save-player-info-btn');
        if (savePlayerInfoButton) {
            savePlayerInfoButton.addEventListener('click', () => {
                this.savePlayerInfo();
            });
        }

        // Reset player info button
        const resetPlayerInfoButton = document.getElementById('reset-player-info-btn');
        if (resetPlayerInfoButton) {
            resetPlayerInfoButton.addEventListener('click', () => {
                this.resetPlayerInfo();
            });
        }

        // Icon category tabs
        document.querySelectorAll('[data-icon-category]').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const category = (e.target as HTMLElement).getAttribute('data-icon-category');
                if (category) {
                    this.showIconCategory(category);
                }
            });
        });
    }

    /**
     * Setup custom event listeners
     */
    private setupCustomEventListeners(): void {
        document.addEventListener('showPlayerInfoEdit', () => {
            this.showPlayerInfoEditModal();
        });
    }

    /**
     * Show player info edit modal
     */
    private showPlayerInfoEditModal(): void {
        const player = this.game.getPlayer();
        
        // Update current player info display
        this.updateElement('current-player-name', player.name);
        this.updateElement('current-player-icon', player.icon);
        
        // Set current values in form
        const nameInput = document.getElementById('player-name-input') as HTMLInputElement;
        if (nameInput) {
            nameInput.value = player.name;
        }
        
        // Initialize icon selection
        this.selectedIcon = player.icon;
        this.updateElement('selected-player-icon', this.selectedIcon);
        
        // Show icons for default category
        this.showIconCategory('動物');
        
        // Show modal
        if (this.playerInfoEditModal) {
            this.playerInfoEditModal.show();
        }
    }
    
    /**
     * Show icons for specified category
     */
    private showIconCategory(category: string): void {
        const iconsGrid = document.getElementById('icon-selection-grid');
        if (!iconsGrid) return;
        
        // Update tab active state
        this.updateTabActiveState(category);
        
        // Clear and populate icons
        iconsGrid.innerHTML = '';
        const categoryIcons = getIconsByCategory(category);
        
        categoryIcons.forEach(icon => {
            const iconButton = this.createIconButton(icon, iconsGrid);
            iconsGrid.appendChild(iconButton);
        });
    }

    /**
     * Update tab active state
     */
    private updateTabActiveState(activeCategory: string): void {
        document.querySelectorAll('#icon-category-tabs .nav-link').forEach(tab => {
            const tabCategory = tab.getAttribute('data-category');
            if (tabCategory === activeCategory) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }

    /**
     * Create icon button element
     */
    private createIconButton(icon: any, iconsGrid: HTMLElement): HTMLButtonElement {
        const iconButton = document.createElement('button');
        iconButton.type = 'button';
        iconButton.className = `btn btn-outline-secondary m-1 ${this.selectedIcon === icon.emoji ? 'active' : ''}`;
        iconButton.style.fontSize = '1.5rem';
        iconButton.title = icon.name;
        iconButton.textContent = icon.emoji;
        
        iconButton.addEventListener('click', () => {
            this.selectedIcon = icon.emoji;
            this.updateElement('selected-player-icon', this.selectedIcon);
            
            // Update active state
            iconsGrid.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
            iconButton.classList.add('active');
        });
        
        return iconButton;
    }

    /**
     * Save player info changes
     */
    private savePlayerInfo(): void {
        const nameInput = document.getElementById('player-name-input') as HTMLInputElement;
        if (!nameInput) return;
        
        const newName = nameInput.value.trim();
        
        // Validation
        if (!this.validatePlayerName(newName)) {
            return;
        }
        
        // Update player info
        const player = this.game.getPlayer();
        const oldName = player.name;
        const oldIcon = player.icon;
        
        player.updatePlayerInfo(newName, this.selectedIcon);
        
        // Close modal
        if (this.playerInfoEditModal) {
            this.playerInfoEditModal.hide();
        }
        
        // Dispatch events to update UI
        this.dispatchUpdateEvents();
        
        // Show success toast
        this.showSuccessMessage(oldName, oldIcon, newName, this.selectedIcon);
    }

    /**
     * Validate player name
     */
    private validatePlayerName(name: string): boolean {
        if (!name) {
            ModalUtils.showToast('名前を入力してください', 'error');
            return false;
        }
        
        if (name.length > 32) {
            ModalUtils.showToast('名前は32文字以内で入力してください', 'error');
            return false;
        }
        
        return true;
    }

    /**
     * Dispatch update events
     */
    private dispatchUpdateEvents(): void {
        // Update player summary
        const updateSummaryEvent = new CustomEvent('updatePlayerSummary');
        document.dispatchEvent(updateSummaryEvent);
        
        // Update player modal if it's open
        const updateModalEvent = new CustomEvent('updatePlayerModal');
        document.dispatchEvent(updateModalEvent);
    }

    /**
     * Show success message
     */
    private showSuccessMessage(oldName: string, oldIcon: string, newName: string, newIcon: string): void {
        const changedItems = [];
        if (oldName !== newName) changedItems.push('名前');
        if (oldIcon !== newIcon) changedItems.push('アイコン');
        
        const changeMessage = changedItems.length > 0 
            ? `${changedItems.join('と')}を変更しました` 
            : '変更はありませんでした';
        
        ModalUtils.showToast(changeMessage, 'success');
    }

    /**
     * Reset player info to default values
     */
    private resetPlayerInfo(): void {
        // Reset form fields to default values
        const nameInput = document.getElementById('player-name-input') as HTMLInputElement;
        if (nameInput) {
            nameInput.value = DEFAULT_PLAYER_NAME;
        }

        // Reset selected icon
        this.selectedIcon = DEFAULT_PLAYER_ICON;
        this.updateElement('selected-player-icon', this.selectedIcon);

        // Update current values display
        this.updateElement('current-player-name', DEFAULT_PLAYER_NAME);
        this.updateElement('current-player-icon', DEFAULT_PLAYER_ICON);

        // Refresh icon grid to update active state
        const activeCategory = document.querySelector('#icon-category-tabs .nav-link.active')?.getAttribute('data-category');
        if (activeCategory) {
            this.showIconCategory(activeCategory);
        }

        ModalUtils.showToast('プレイヤー情報を初期状態にリセットしました', 'info');
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