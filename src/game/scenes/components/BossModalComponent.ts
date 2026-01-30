import { getBossData } from '../../data';
import { t } from '../../i18n';
import type { BootstrapModal } from '../../types/bootstrap';

/**
 * ボスモーダルの表示モード
 */
export type BossModalMode = 'select' | 'info';

/**
 * ボスモーダルのオプション
 */
export interface BossModalOptions {
    mode: BossModalMode;
    onConfirm?: (bossId: string) => void;
}

/**
 * ボスモーダルを管理するコンポーネント
 * ボス選択画面とバトル画面で共通利用される
 * シングルトンパターンで実装され、アプリケーション全体で1つのインスタンスのみ存在する
 */
export class BossModalComponent {
    private static instance: BossModalComponent | null = null;
    private bossModal: BootstrapModal | null = null;
    private currentBossId: string = '';
    private currentOptions: BossModalOptions = { mode: 'info' };
    
    private constructor() {
        this.initialize();
    }
    
    /**
     * シングルトンインスタンスを取得
     */
    public static getInstance(): BossModalComponent {
        if (!BossModalComponent.instance) {
            BossModalComponent.instance = new BossModalComponent();
        }
        return BossModalComponent.instance;
    }
    
    /**
     * コンポーネントの初期化
     */
    private initialize(): void {
        this.initializeBossModal();
        this.setupEventListeners();
    }
    
    /**
     * ボスモーダルの初期化
     */
    private initializeBossModal(): void {
        const bossModalElement = document.getElementById('boss-modal');
        if (bossModalElement && window.bootstrap) {
            this.bossModal = new window.bootstrap.Modal(bossModalElement);
        }
    }
    
    /**
     * イベントリスナーの設定
     */
    private setupEventListeners(): void {
        // ボス確定ボタン
        const confirmButton = document.getElementById('confirm-boss-btn');
        if (confirmButton) {
            confirmButton.addEventListener('click', () => {
                this.onConfirmBoss();
            });
        }
    }
    
    /**
     * ボスモーダルを表示
     * @param bossId ボスID
     * @param options 表示オプション
     */
    show(bossId: string, options: BossModalOptions): void {
        this.currentBossId = bossId;
        this.currentOptions = options;
        
        // モーダル内容を更新
        this.updateModal(bossId);
        
        // ボタン表示モードを設定
        this.setButtonMode(options.mode);
        
        // モーダル表示
        if (this.bossModal) {
            this.bossModal.show();
        }
    }
    
    /**
     * ボスモーダルを非表示
     */
    hide(): void {
        if (this.bossModal) {
            this.bossModal.hide();
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
        
        // 一言概要
        const modalDescription = document.getElementById('modal-boss-description');
        if (modalDescription) {
            modalDescription.textContent = bossData.description;
        }

        // モーダル統計情報
        const modalStats = document.getElementById('modal-boss-stats');
        if (modalStats) {
            modalStats.innerHTML = `
                <div class="row">
                    <div class="col-6">
                        <strong>${t('ui.bossSelect.statsHpLabel')}:</strong> ${bossData.maxHp}
                    </div>
                    <div class="col-6">
                        <strong>${t('ui.bossSelect.statsAttackLabel')}:</strong> ${bossData.attackPower}
                    </div>
                </div>
            `;
        }
        
        // クエスト説明文風テキスト
        const modalQuestNote = document.getElementById('modal-boss-quest-note');
        if (modalQuestNote) {
            modalQuestNote.textContent = bossData.questNote;
        }
        
        // ボスの外観
        const modalAppearance = document.getElementById('modal-boss-appearance');
        if (modalAppearance) {
            if (bossData.appearanceNote) {
                modalAppearance.classList.remove('d-none');
                modalAppearance.textContent = ''; // Clear previous content
                const small = document.createElement('small');
                small.className = 'text-muted';
                small.textContent = t('ui.bossSelect.appearancePrefix', { note: bossData.appearanceNote });
                modalAppearance.appendChild(small);
            } else {
                modalAppearance.classList.add('d-none');
            }
        }
        
        // ゲストキャラクター情報
        const modalGuestInfo = document.getElementById('modal-boss-guest-info');
        if (modalGuestInfo) {
            if (bossData.guestCharacterInfo) {
                const characterName = bossData.guestCharacterInfo.characterName || t('ui.bossSelect.guestInfoFallbackName');
                modalGuestInfo.textContent = ''; // Clear previous content
                const small = document.createElement('small');
                small.className = 'text-muted';
                small.textContent = t('ui.bossSelect.guestInfo', {
                    characterName,
                    creator: bossData.guestCharacterInfo.creator
                });
                modalGuestInfo.appendChild(small);
                modalGuestInfo.classList.remove('d-none');
            } else {
                modalGuestInfo.classList.add('d-none');
            }
        }
    }
    
    /**
     * ボタン表示モードを設定
     * @param mode 表示モード
     */
    private setButtonMode(mode: BossModalMode): void {
        const confirmButtons = document.getElementById('modal-boss-buttons-confirm');
        const backButtons = document.getElementById('modal-boss-buttons-back');
        
        if (mode === 'select') {
            // 選択モード: 確認ボタンを表示
            if (confirmButtons) confirmButtons.classList.remove('d-none');
            if (backButtons) backButtons.classList.add('d-none');
        } else {
            // 情報表示モード: 戻るボタンのみ表示
            if (confirmButtons) confirmButtons.classList.add('d-none');
            if (backButtons) backButtons.classList.remove('d-none');
        }
    }
    
    /**
     * ボス確定ボタン押下時の処理
     */
    private onConfirmBoss(): void {
        if (this.currentOptions.onConfirm && this.currentBossId) {
            this.hide();
            this.currentOptions.onConfirm(this.currentBossId);
        }
    }
    
    /**
     * 現在表示中のボスIDを取得
     */
    getCurrentBossId(): string {
        return this.currentBossId;
    }
    
    /**
     * リソースの解放
     */
    dispose(): void {
        // 必要に応じてイベントリスナーの削除などを実装
        this.currentBossId = '';
        this.currentOptions = { mode: 'info' };
    }
}
