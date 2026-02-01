/**
 * コールバック関数の型定義
 */
export interface EventCallbacks {
    // Basic actions
    onAttack: () => void;
    onDefend: () => void;
    onShowSkillPanel: () => void;
    onShowItemPanel: () => void;
    
    // Skills
    onUseSkill: (skillId: string) => void;
    onHideSkillPanel: () => void;
    
    // Items
    onUseItem: (itemName: string) => void;
    onHideItemPanel: () => void;
    
    // Special actions
    onStruggle: () => void;
    onStayStill: () => void;
    onGiveUp: () => void;
    
    // Battle end
    onFinalizeBattle: () => void;
    
    // Debug
    onShowDebugModal: () => void;
    onApplyDebugChanges: () => void;
    onAddPlayerStatus: () => void;
    onAddBossStatus: () => void;
    onAddCustomVar: () => void;
    
    // Boss Info
    onShowBossInfo: () => void;
}

/**
 * バトル画面のイベントハンドラー管理クラス
 * 各種ボタンのクリックイベントリスナーの登録・管理を担当
 */
export class BattleEventHandler {
    
    private callbacks: EventCallbacks;
    private eventListeners: Map<string, EventListener> = new Map();
    
    constructor(callbacks: EventCallbacks) {
        this.callbacks = callbacks;
    }
    
    /**
     * 全てのイベントリスナーを設定
     */
    setupEventListeners(): void {
        this.setupBasicActionListeners();
        this.setupSkillListeners();
        this.setupItemListeners();
        this.setupSpecialActionListeners();
        this.setupBattleEndListeners();
        this.setupDebugListeners();
        this.setupBossInfoListeners();
    }
    
    /**
     * 基本アクションのイベントリスナーを設定
     */
    private setupBasicActionListeners(): void {
        this.addEventListenerSafely('attack-btn', 'click', this.callbacks.onAttack);
        this.addEventListenerSafely('defend-btn', 'click', this.callbacks.onDefend);
        this.addEventListenerSafely('skill-btn', 'click', this.callbacks.onShowSkillPanel);
        this.addEventListenerSafely('item-btn', 'click', this.callbacks.onShowItemPanel);
    }
    
    /**
     * スキル関連のイベントリスナーを設定
     */
    private setupSkillListeners(): void {
        this.addEventListenerSafely('power-attack-btn', 'click', () => this.callbacks.onUseSkill('power-attack'));
        this.addEventListenerSafely('heal-skill-btn', 'click', () => this.callbacks.onUseSkill('heal'));
        this.addEventListenerSafely('struggle-skill-btn', 'click', () => this.callbacks.onUseSkill('struggle'));
        this.addEventListenerSafely('ultra-smash-btn', 'click', () => this.callbacks.onUseSkill('ultra-smash'));
        this.addEventListenerSafely('skill-back-btn', 'click', this.callbacks.onHideSkillPanel);
    }
    
    /**
     * アイテム関連のイベントリスナーを設定
     */
    private setupItemListeners(): void {
        this.addEventListenerSafely('item-back-btn', 'click', this.callbacks.onHideItemPanel);
    }
    
    /**
     * 特殊アクションのイベントリスナーを設定
     */
    private setupSpecialActionListeners(): void {
        this.addEventListenerSafely('struggle-btn', 'click', this.callbacks.onStruggle);
        this.addEventListenerSafely('struggle-skill-special-btn', 'click', () => this.callbacks.onUseSkill('struggle'));
        this.addEventListenerSafely('stay-still-btn', 'click', this.callbacks.onStayStill);
        this.addEventListenerSafely('give-up-btn', 'click', this.callbacks.onGiveUp);
    }
    
    /**
     * バトル終了関連のイベントリスナーを設定
     */
    private setupBattleEndListeners(): void {
        this.addEventListenerSafely('battle-end-btn', 'click', this.callbacks.onFinalizeBattle);
        this.addEventListenerSafely('back-to-select-btn', 'click', this.callbacks.onFinalizeBattle);
    }
    
    /**
     * デバッグ関連のイベントリスナーを設定
     */
    private setupDebugListeners(): void {
        this.addEventListenerSafely('debug-btn', 'click', this.callbacks.onShowDebugModal);
        this.addEventListenerSafely('debug-apply-changes', 'click', this.callbacks.onApplyDebugChanges);
        this.addEventListenerSafely('debug-add-player-status', 'click', this.callbacks.onAddPlayerStatus);
        this.addEventListenerSafely('debug-add-boss-status', 'click', this.callbacks.onAddBossStatus);
        this.addEventListenerSafely('debug-add-custom-var', 'click', this.callbacks.onAddCustomVar);
    }
    
    /**
     * 動的アイテムボタンのイベントリスナーを追加
     * 拡張アイテム用の動的ボタンに使用
     */
    addDynamicItemListener(itemId: string, callback: () => void): void {
        this.addEventListenerSafely(`${itemId}-btn`, 'click', callback);
    }
    
    /**
     * おまもりボタンのイベントリスナーを追加（動的生成用）
     */
    addOmamoriListener(callback: () => void): void {
        this.addEventListenerSafely('omamori-special-btn', 'click', callback);
    }
    
    /**
     * ボス情報関連のイベントリスナーを設定
     */
    private setupBossInfoListeners(): void {
        this.addEventListenerSafely('boss-info-btn', 'click', this.callbacks.onShowBossInfo);
    }
    
    /**
     * 安全にイベントリスナーを追加
     * 要素が存在しない場合は警告を出力するが処理は継続
     */
    private addEventListenerSafely(elementId: string, eventType: string, callback: EventListener): void {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener(eventType, callback);
            this.eventListeners.set(`${elementId}-${eventType}`, callback);
        } else {
            console.warn(`Element with id '${elementId}' not found for event listener setup`);
        }
    }
    
    /**
     * 特定の要素のイベントリスナーを削除
     */
    removeEventListener(elementId: string, eventType: string): void {
        const element = document.getElementById(elementId);
        const key = `${elementId}-${eventType}`;
        const callback = this.eventListeners.get(key);
        
        if (element && callback) {
            element.removeEventListener(eventType, callback);
            this.eventListeners.delete(key);
        }
    }
    
    /**
     * 全てのイベントリスナーを削除
     * コンポーネント破棄時などに使用
     */
    removeAllEventListeners(): void {
        this.eventListeners.forEach((callback, key) => {
            const [elementId, eventType] = key.split('-');
            const element = document.getElementById(elementId);
            if (element) {
                element.removeEventListener(eventType, callback);
            }
        });
        this.eventListeners.clear();
    }
    
    /**
     * コールバック関数を更新
     * ランタイムでコールバックを変更する場合に使用
     */
    updateCallbacks(newCallbacks: Partial<EventCallbacks>): void {
        this.callbacks = { ...this.callbacks, ...newCallbacks };
        // 既存のリスナーを削除して再設定
        this.removeAllEventListeners();
        this.setupEventListeners();
    }
}