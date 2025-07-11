import { Game } from '../Game';
import { getAllBossData } from '../data/index';

export class BossSelectScene {
    private game: Game;
    private bossCards: NodeListOf<Element> | null = null;
    private modal: any = null; // Bootstrap modal
    private selectedBossId: string = '';
    
    constructor(game: Game) {
        this.game = game;
        this.init();
    }
    
    private init(): void {
        this.bossCards = document.querySelectorAll('.boss-card');
        
        // Initialize boss cards
        this.bossCards.forEach(card => {
            card.addEventListener('click', (_e) => {
                const bossId = card.getAttribute('data-boss');
                if (bossId) {
                    this.onBossSelect(bossId);
                }
            });
        });
        
        // Initialize modal
        const modalElement = document.getElementById('boss-modal');
        if (modalElement && window.bootstrap) {
            this.modal = new window.bootstrap.Modal(modalElement);
        }
        
        // Confirm boss button
        const confirmButton = document.getElementById('confirm-boss-btn');
        if (confirmButton) {
            confirmButton.addEventListener('click', () => {
                this.onConfirmBoss();
            });
        }
    }
    
    enter(): void {
        console.log('Entered boss select scene');
        
        // Update boss card information
        this.updateBossCards();
    }
    
    private updateBossCards(): void {
        const allBossData = getAllBossData();
        
        this.bossCards?.forEach(card => {
            const bossId = card.getAttribute('data-boss');
            const bossData = allBossData.find(boss => boss.id === bossId);
            
            if (bossData) {
                const titleElement = card.querySelector('.card-title');
                const textElement = card.querySelector('.card-text');
                
                if (titleElement) {
                    titleElement.textContent = bossData.displayName;
                }
                
                if (textElement) {
                    textElement.textContent = bossData.description;
                }
            }
        });
    }
    
    private onBossSelect(bossId: string): void {
        this.selectedBossId = bossId;
        
        // Update modal with boss information
        this.updateModal(bossId);
        
        // Show modal
        if (this.modal) {
            this.modal.show();
        }
    }
    
    private updateModal(bossId: string): void {
        const allBossData = getAllBossData();
        const bossData = allBossData.find(boss => boss.id === bossId);
        
        if (!bossData) return;
        
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
                <div class=\"mt-2\">
                    <strong>特殊能力:</strong><br>
                    <ul class=\"list-unstyled\">
                        ${bossData.actions.map(action => `<li>• ${action.name}: ${action.description}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
    }
    
    private onConfirmBoss(): void {
        if (this.selectedBossId) {
            // Hide modal
            if (this.modal) {
                this.modal.hide();
            }
            
            // Start battle with selected boss
            this.game.selectBoss(this.selectedBossId);
        }
    }
}