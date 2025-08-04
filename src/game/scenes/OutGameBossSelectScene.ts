import { Game } from '../Game';
import { BaseOutGameScene } from './BaseOutGameScene';
import { getBossData } from '../data';
import { ToastType, ToastUtils } from '../utils/ToastUtils';
import type { BootstrapModal } from '../types/bootstrap';
import { BossCardManager } from './managers/BossCardManager';
import { DOMUpdater } from './utils/DOMUpdater';

export class OutGameBossSelectScene extends BaseOutGameScene {
    private bossModal: BootstrapModal | null = null;
    private selectedBossId: string = '';
    private bossCardManager: BossCardManager;
    
    constructor(game: Game) {
        super(game, 'out-game-boss-select-screen');
        this.bossCardManager = new BossCardManager(game);
        this.initializeBossModal();
        this.setupBossCardManager();
    }
    
    /**
     * シーン初期化後の遅延処理
     */
    public lateInitialize(): void {
        this.bossCardManager.generateBossCards();
    }
    
    /**
     * シーンに入った時の処理
     */
    enter(): void {
        console.log('Entered OutGameBossSelectScene');
        
        // ナビゲーションバーのアクティブ状態更新
        this.updateNavigationActiveState();
        
        // ボスカード情報更新
        this.bossCardManager.updateBossCards();
        
        // プレイヤー情報表示更新
        this.updatePlayerSummary();
    }
    
    /**
     * ボスモーダルの初期化
     */
    private initializeBossModal(): void {
        const bossModalElement = document.getElementById('boss-modal');
        if (bossModalElement && window.bootstrap) {
            this.bossModal = new window.bootstrap.Modal(bossModalElement);
        }
        
        // ボス確定ボタン
        const confirmButton = document.getElementById('confirm-boss-btn');
        if (confirmButton) {
            confirmButton.addEventListener('click', () => {
                this.onConfirmBoss();
            });
        }
    }
    
    /**
     * ボスカードマネージャーのセットアップ
     */
    private setupBossCardManager(): void {
        this.bossCardManager.setOnBossSelectCallback((bossId: string) => {
            this.onBossSelect(bossId);
        });
    }
    
    /**
     * ボス選択時の処理
     */
    private onBossSelect(bossId: string): void {
        this.selectedBossId = bossId;
        
        // モーダルにボス情報を表示
        this.updateModal(bossId);
        
        // モーダル表示
        if (this.bossModal) {
            this.bossModal.show();
        }
    }
    
    /**
     * ボスモーダルの内容更新
     */
    private updateModal(bossId: string): void {
        const bossData = getBossData(bossId);
        
        // モーダルタイトル
        const modalTitleIcon = document.getElementById('modal-boss-icon');
        if (modalTitleIcon) {
            modalTitleIcon.textContent = bossData.icon;
        }
        
        const modalTitle = document.getElementById('modal-boss-name');
        if (modalTitle) {
            modalTitle.textContent = bossData.displayName;
        }
        
        // モーダル説明
        const modalDescription = document.getElementById('modal-boss-description');
        if (modalDescription) {
            modalDescription.textContent = bossData.description;
        }
        
        const modalQuestNote = document.getElementById('modal-boss-quest-note');
        if (modalQuestNote) {
            modalQuestNote.textContent = bossData.questNote;
        }
        
        // モーダル統計情報
        const modalStats = document.getElementById('modal-boss-stats');
        if (modalStats) {
            modalStats.innerHTML = `
                <div class="row">
                    <div class="col-6">
                        <strong>HP:</strong> ${bossData.maxHp}
                    </div>
                    <div class="col-6">
                        <strong>攻撃力:</strong> ${bossData.attackPower}
                    </div>
                </div>
            `;
        }
        
        // ゲストキャラクター情報
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
    
    /**
     * ボス確定ボタン押下時の処理
     */
    private onConfirmBoss(): void {
        if (this.selectedBossId) {
            // モーダルを隠す
            if (this.bossModal) {
                this.bossModal.hide();
            }
            
            try {
                // 選択されたボスとの戦闘開始
                this.game.selectBoss(this.selectedBossId);
            } catch (error) {
                console.error('Failed to load boss:', error);
                
                // エラーメッセージ表示
                const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
                ToastUtils.showToast(
                    `ボスデータの読み込みに失敗しました: ${errorMessage}`,
                    ToastType.Error
                );
                
                // モーダルを再表示
                if (this.bossModal) {
                    this.bossModal.show();
                }
            }
        }
    }
    
    /**
     * プレイヤー情報表示の更新
     */
    private updatePlayerSummary(): void {
        const player = this.game.getPlayer();
        const equipment = player.getEquipmentInfo();
        
        // プレイヤーヘッダー（名前とアイコン）
        DOMUpdater.updateElement('player-header-name', player.name);
        DOMUpdater.updateElement('player-header-icon', player.icon);
        
        // サマリー表示の更新
        DOMUpdater.updateElements({
            'player-summary-max-hp': player.maxHp.toString(),
            'player-summary-max-mp': player.maxMp.toString(),
            'player-summary-attack': player.getAttackPower().toString(),
            'player-summary-weapon': equipment.weapon?.name || '素手',
            'player-summary-armor': equipment.armor?.name || 'はだか'
        });
    }
}