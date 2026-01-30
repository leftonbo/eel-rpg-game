import { Game } from '../Game';
import { BaseOutGameScene } from './BaseOutGameScene';
import { ToastType, ToastUtils } from '../utils/ToastUtils';
import { BossCardManager } from './managers/BossCardManager';
import { DOMUpdater } from './utils/DOMUpdater';
import { BossModalComponent } from './components/BossModalComponent';
import { t } from '../i18n';

export class OutGameBossSelectScene extends BaseOutGameScene {
    private bossModalComponent: BossModalComponent;
    private bossCardManager: BossCardManager;
    
    constructor(game: Game) {
        super(game, 'out-game-boss-select-screen');
        this.bossCardManager = new BossCardManager(game);
        this.bossModalComponent = BossModalComponent.getInstance();
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

    refreshLocalization(): void {
        this.bossCardManager.refreshBossCards();
        this.updatePlayerSummary();
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
        // ボスモーダルを表示（選択モード）
        this.bossModalComponent.show(bossId, {
            mode: 'select',
            onConfirm: (selectedBossId: string) => this.onConfirmBoss(selectedBossId)
        });
    }
    
    
    /**
     * ボス確定ボタン押下時の処理
     */
    private onConfirmBoss(selectedBossId: string): void {
        try {
            // 選択されたボスとの戦闘開始
            this.game.selectBoss(selectedBossId);
        } catch (error) {
            console.error('Failed to load boss:', error);
            
            // エラーメッセージ表示
            const errorMessage = error instanceof Error ? error.message : t('bossSelect.errors.unknown');
            ToastUtils.showToast(
                t('bossSelect.errors.loadFailed', { error: errorMessage }),
                ToastType.Error
            );
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
            'player-summary-weapon': equipment.weapon?.name || t('bossSelect.playerSummary.unarmed'),
            'player-summary-armor': equipment.armor?.name || t('bossSelect.playerSummary.noArmor'),
            'player-summary-gloves': equipment.gloves?.name || t('bossSelect.playerSummary.noGloves'),
            'player-summary-belt': equipment.belt?.name || t('bossSelect.playerSummary.noBelt'),
        });
    }
}
