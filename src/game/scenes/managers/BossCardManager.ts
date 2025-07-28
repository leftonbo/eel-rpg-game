import { Game } from '../../Game';
import { getAllBossData } from '../../data';
import { MemorialSaveData } from '../../systems/MemorialSystem';

export class BossCardManager {
    private game: Game;
    private onBossSelectCallback?: (bossId: string) => void;

    constructor(game: Game) {
        this.game = game;
    }

    /**
     * Set callback for boss selection
     */
    setOnBossSelectCallback(callback: (bossId: string) => void): void {
        this.onBossSelectCallback = callback;
    }

    /**
     * Generate boss cards dynamically from boss data
     * Must be called after boss data is loaded
     */
    generateBossCards(): void {
        const container = document.getElementById('boss-cards-container');
        if (!container) {
            console.error('[BossCardManager] boss-cards-container not found');
            return;
        }
        
        // Get all boss data and sort by explorerLevelRequired first, then by id
        const allBossData = getAllBossData();
        if (!allBossData || allBossData.length === 0) {
            console.error('[BossCardManager] No boss data found');
            return;
        }
        
        const sortedBossData = allBossData.sort((a, b) => {
            const aLevel = a.explorerLevelRequired || 0;
            const bLevel = b.explorerLevelRequired || 0;
            
            // First sort by explorer level required
            if (aLevel !== bLevel) {
                return aLevel - bLevel;
            }
            
            // Then sort by id alphabetically
            return a.id.localeCompare(b.id);
        });
        
        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        
        // Generate cards for each boss
        sortedBossData.forEach(bossData => {
            const colDiv = document.createElement('div');
            colDiv.className = 'col-md-4 mb-4';
            
            const cardHTML = `
                <div class="card bg-secondary h-100 boss-card" data-boss="${bossData.id}">
                    <div class="boss-status-container">
                        <div class="boss-status-badge victory" id="boss-status-victory-${bossData.id}"></div>
                        <div class="boss-status-badge defeat" id="boss-status-defeat-${bossData.id}"></div>
                    </div>
                    <div class="card-body text-center">
                        <h3 class="card-title">${bossData.displayName}</h3>
                        <p class="card-text">${bossData.description}</p>
                        <button class="btn btn-success w-100">選択</button>
                    </div>
                </div>
            `;
            
            colDiv.innerHTML = cardHTML;
            fragment.appendChild(colDiv);
        });
        
        // Single DOM operation
        container.appendChild(fragment);
        
        // Set up event delegation for boss card clicks
        this.setupBossCardEventDelegation(container);
    }

    /**
     * Set up event delegation for boss card clicks
     */
    private setupBossCardEventDelegation(container: HTMLElement): void {
        container.addEventListener('click', (e) => {
            const card = (e.target as HTMLElement).closest('.boss-card');
            if (card) {
                const bossId = card.getAttribute('data-boss');
                if (bossId && this.onBossSelectCallback) {
                    this.onBossSelectCallback(bossId);
                }
            }
        });
    }

    /**
     * Update boss cards with current player status
     */
    updateBossCards(): void {
        // Get boss cards (only query once)
        const bossCards = document.querySelectorAll('.boss-card');

        // Update status and visibility for each card
        const player = this.game.getPlayer();
        const memorialSystem = player.memorialSystem;
        const memorialData = memorialSystem.exportData();
        const playerExplorerLevel = player.getExplorerLevel();
        const allBossData = getAllBossData();

        bossCards.forEach(card => {
            const bossId = card.getAttribute('data-boss');
            if (bossId) {
                const bossData = allBossData.find(boss => boss.id === bossId);
                
                if (bossData) {
                    this.updateBossCardContent(card as HTMLElement, bossData, playerExplorerLevel);
                    this.updateBossStatusBadge(bossId, memorialData);
                    this.updateBossCardVisibility(card as HTMLElement, bossData, playerExplorerLevel);
                }
            }
        });
    }

    /**
     * Update boss card content based on unlock status
     */
    private updateBossCardContent(card: HTMLElement, bossData: any, playerExplorerLevel: number): void {
        const textElement = card.querySelector('.card-text');
        const requiredLevel = bossData.explorerLevelRequired || 0;
        const isUnlocked = playerExplorerLevel >= requiredLevel;
        
        if (textElement) {
            if (isUnlocked) {
                textElement.textContent = bossData.description;
            } else {
                textElement.textContent = `🔒 エクスプローラーLv.${requiredLevel}で解禁`;
            }
        }
    }

    /**
     * Update boss card visibility based on unlock status
     */
    private updateBossCardVisibility(card: HTMLElement, bossData: any, playerExplorerLevel: number): void {
        const requiredLevel = bossData.explorerLevelRequired || 0;
        const isUnlocked = playerExplorerLevel >= requiredLevel;
        
        if (isUnlocked) {
            card.classList.remove('d-none');
            card.classList.remove('boss-card-locked');
            card.style.pointerEvents = 'auto';
            card.style.opacity = '1';
        } else {
            card.classList.add('d-none');
        }
    }
    
    /**
     * Update boss status badges based on battle history.
     * 
     * This method updates the visibility and content of the victory and defeat badges
     * for a given boss based on the player's battle history stored in the memorial data.
     * 
     * - If the player has achieved a victory (`dateFirstWin` is present), the victory badge
     *   is displayed with a trophy icon (🏆) and a tooltip indicating "勝利済み" (victory achieved).
     * - If the player has experienced a defeat (`dateFirstLost` is present), the defeat badge
     *   is displayed with a skull icon (💀) and a tooltip indicating "敗北済み" (defeat experienced).
     * - If both victory and defeat are present, both badges are displayed side by side.
     * - By default, both badges are hidden if no battle history is available for the boss.
     */
    private updateBossStatusBadge(bossId: string, memorialData: MemorialSaveData): void {
        const victoryBadge = document.getElementById(`boss-status-victory-${bossId}`);
        const defeatBadge = document.getElementById(`boss-status-defeat-${bossId}`);
        
        if (!victoryBadge || !defeatBadge) return;
        
        // Find boss memorial record
        const memorial = memorialData.bossMemorials.find(m => m.bossId === bossId);
        
        // Default: hide both badges
        victoryBadge.style.display = 'none';
        defeatBadge.style.display = 'none';
        
        if (memorial) {
            const hasVictory = memorial.dateFirstWin;
            const hasDefeat = memorial.dateFirstLost;
            
            if (hasVictory) {
                // Show victory badge
                victoryBadge.style.display = 'flex';
                victoryBadge.textContent = '🏆';
                victoryBadge.title = '勝利済み';
            }
            
            if (hasDefeat) {
                // Show defeat badge
                defeatBadge.style.display = 'flex';
                defeatBadge.textContent = '💀';
                defeatBadge.title = '敗北済み';
            }
        }
    }
}