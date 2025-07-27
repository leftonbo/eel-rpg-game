import { StatusEffectManager, StatusEffectType } from '../systems/StatusEffect';

/**
 * プレイヤーとボスの共通基底クラス
 * ヘルス/マナ管理、状態異常管理、戦闘システムの基本機能を提供
 */
export abstract class Actor {
    //#region プロパティ定義

    /** キャラクター表示名 */
    public displayName: string;
    /** 現在のヘルス */
    public hp: number = 1;
    /** 最大ヘルス */
    public maxHp: number = 1;
    /** 戦闘開始時の最大ヘルス（UIのバー表示用） */
    public initialMaxHp: number = 1;
    /** 現在のマナ */
    public mp: number = 1;
    /** 最大マナ */
    public maxMp: number = 1;
    /** 戦闘開始時の最大マナ（UIのバー表示用） */
    public initialMaxMp: number = 1;
    /** 攻撃力 */
    public attackPower: number = 1;
    /** 防御力 */
    public defense: number = 0;
    /** 状態異常管理システム */
    public statusEffects: StatusEffectManager = new StatusEffectManager();
    
    //#endregion

    //#region コンストラクタと抽象メソッド

    /**
     * Actorクラスのコンストラクタ
     * 子クラスはinitializeActor()を呼び出してステータスを初期化する必要があります。
     * ここではゼロ除算防止用の仮の値を設定します。
     * @param displayName キャラクター表示名
     */
    constructor(displayName: string) {
        this.displayName = displayName;
    }

    /**
     * アビリティや装備に基づいてステータスを再計算する抽象メソッド
     * Player: アビリティと装備を使用
     * Boss: ボスデータを使用
     */
    abstract recalculateStats(): void;

    //#endregion

    //#region ヘルス管理メソッド

    /**
     * ダメージを受けて戦闘不能状態を処理する
     * @param amount ダメージ量
     * @returns 実際に受けたダメージ量
     */
    takeDamage(amount: number): number {
        if (amount <= 0) return 0;
        
        const modifier = this.statusEffects.getDamageModifier();
        const actualDamage = Math.floor(amount * modifier);
        
        this.hp = Math.max(0, this.hp - actualDamage);
        
        // ヘルスが 0 になった場合、戦闘不能状態を適用
        // 死亡状態が既に適用されている場合は無視
        if (this.hp <= 0
            && !this.statusEffects.hasEffect(StatusEffectType.KnockedOut)
            && !this.statusEffects.hasEffect(StatusEffectType.Doomed)) {
            this.statusEffects.addEffect(StatusEffectType.KnockedOut);
        }
        
        return actualDamage;
    }

    /**
     * ヘルスを回復する
     * @param amount 回復量
     * @returns 実際に回復したヘルス量
     */
    heal(amount: number): number {
        if (amount <= 0) return 0;
        
        // ヘルスが既に最大値以上の場合は回復しない
        if (this.hp >= this.maxHp) return 0;
        
        const oldHp = this.hp;
        this.hp = Math.min(this.maxHp, this.hp + amount);
        
        // ヘルスが 0 から回復した場合、戦闘不能状態を解除
        if (oldHp === 0 && this.hp > 0) {
            this.statusEffects.removeEffect(StatusEffectType.KnockedOut);
        }
        
        return this.hp - oldHp;
    }

    //#endregion

    //#region 最大ヘルス管理メソッド

    /**
     * 最大ヘルスを失う
     * @param amount 減少量
     */
    loseMaxHp(amount: number): void {
        this.maxHp = Math.max(0, this.maxHp - amount);

        // 現在のヘルスが新しい最大ヘルスを超える場合、減少させる
        if (this.hp > this.maxHp) {
            this.hp = this.maxHp;
        }

        // 最大ヘルスが0以下になった場合、死亡状態を適用
        if (this.maxHp <= 0 && !this.statusEffects.hasEffect(StatusEffectType.Doomed)) {
            this.statusEffects.addEffect(StatusEffectType.Doomed);
            // 戦闘不能状態を除去
            this.statusEffects.removeEffect(StatusEffectType.KnockedOut);
        }
    }

    /**
     * 最大ヘルスを増加（ボスの捕食メカニズム用）
     * @param amount 増加量
     * @returns 実際に増加した最大ヘルス量
     */
    gainMaxHp(amount: number): number {
        if (amount <= 0) return 0;

        const oldMaxHp = this.maxHp;
        this.maxHp += amount;
        this.hp += amount; // 現在のヘルスも同じ量だけ増加

        return this.maxHp - oldMaxHp;
    }
    
    //#endregion
    
    //#region マナ管理メソッド
    
    /**
     * マナを回復する
     * @param amount 回復量
     * @returns 実際に回復したマナ量
     */
    recoverMp(amount: number): number {
        if (amount <= 0) return 0;
        
        // マナが既に最大値以上の場合は回復しない
        if (this.mp >= this.maxMp) return 0;
        
        const oldMp = this.mp;
        this.mp = Math.min(this.maxMp, this.mp + amount);
        return this.mp - oldMp;
    }

    /**
     * マナを消費する
     * スキルによる消費を想定
     * @param amount 消費量
     * @returns 消費に成功した場合true、不足した場合false
     */
    consumeMp(amount: number): boolean {
        if (this.mp >= amount) {
            this.mp -= amount;
            return true;
        }
        // マナが不足している場合、マナを 0 にして『疲労』状態を適用
        this.mp = 0;
        this.statusEffects.addEffect(StatusEffectType.Exhausted);
        return false;
    }

    /**
     * マナを失う (強制的に減少)
     * マナに対するダメージ処理を想定 (スキルによる消費は consumeMp を使用)
     * @param amount 減少量
     * @returns 実際に失ったマナ量
     */
    loseMp(amount: number): number {
        if (amount <= 0) return 0;
        
        const oldMp = this.mp;
        this.mp = Math.max(0, this.mp - amount);
        return oldMp - this.mp;
    }

    //#endregion

    //#region その他ステータス管理メソッド

    /**
     * ヘルスとマナを最大値まで完全回復
     */
    fullRestore(): void {
        this.hp = this.maxHp;
        this.mp = this.maxMp;
    }

    //#endregion

    //#region 戦闘制御メソッド

    /**
     * アクションを行えるかどうかをチェック
     * @returns 行動可能な場合true
     */
    canAct(): boolean {
        return this.statusEffects.canAct() && this.hp > 0;
    }

    /**
     * ターン開始時の処理
     */
    startTurn(): void {
        // 子クラスに実装を委ねる
    }

    /**
     * ラウンド終了時に全状態異常を処理
     * @returns 状態異常の効果や終了に関するメッセージ配列
     */
    processRoundEnd(): string[] {
        const messages: string[] = [];
        
        // 状態異常のダメージ・効果を適用
        const effectMessages = this.statusEffects.applyEffects(this);
        messages.push(...effectMessages);
        
        // 持続時間を減少させ、期限切れの効果を除去
        const durationMessages = this.statusEffects.decreaseDurations(this);
        messages.push(...durationMessages);
        
        return messages;
    }

    //#endregion

    //#region UI表示用メソッド

    /**
     * ヘルス割合を取得（パーセンテージ）
     * @returns ヘルス割合（0-100）
     */
    getHpPercentage(): number {
        return this.maxHp > 0 ? (this.hp / this.maxHp) * 100 : 0;
    }

    /**
     * MP割合を取得（パーセンテージ）
     * @returns MP割合（0-100）
     */
    getMpPercentage(): number {
        return this.maxMp > 0 ? (this.mp / this.maxMp) * 100 : 0;
    }


    /**
     * ヘルスプログレスコンテナの幅割合を取得（コンテナリサイズ用）
     * @returns コンテナ幅の割合（0-100%）
     */
    getHpContainerPercentage(): number {
        if (this.initialMaxHp <= 0) return 100;
        
        // 現在の最大ヘルスが初期値より高い場合、コンテナは100%のまま
        if (this.maxHp > this.initialMaxHp) {
            return 100;
        }
        
        // 現在の最大ヘルスが低い場合、比例してコンテナを縮小
        return (this.maxHp / this.initialMaxHp) * 100;
    }

    /**
     * マナプログレスコンテナの幅割合を取得（コンテナリサイズ用）
     * @returns コンテナ幅の割合（0-100%）
     */
    getMpContainerPercentage(): number {
        if (this.initialMaxMp <= 0) return 100;
        
        // 現在の最大マナが初期値より高い場合、コンテナは100%のまま
        if (this.maxMp > this.initialMaxMp) {
            return 100;
        }
        
        // 現在の最大マナが低い場合、比例してコンテナを縮小
        return (this.maxMp / this.initialMaxMp) * 100;
    }

    //#endregion

    //#region 戦闘状態管理メソッド

    /**
     * アクターが敗北しているかチェック
     * @returns 敗北状態の場合true
     */
    isDefeated(): boolean {
        return this.statusEffects.isKnockedOut();
    }

    /**
     * 戦闘固有の状態をリセット（進行状況は保持）
     */
    resetBattleState(): void {
        // 全ての状態異常をクリア
        this.statusEffects.clearAllEffects();
        
        // 現在のアビリティと装備に基づいてステータスを再計算
        this.recalculateStats();

        // 戦闘開始時の最大ステータスを保存
        this.saveInitialStats();
        
        // ヘルスとマナを最大値まで回復
        this.fullRestore();
    }

    /**
     * 戦闘開始時のステータスを保存（UIのバー計算用）
     */
    private saveInitialStats(): void {
        this.initialMaxHp = this.maxHp;
        this.initialMaxMp = this.maxMp;
    }

    //#endregion
    
    //#region 状態異常チェックメソッド

    /**
     * 何らかの拘束状態にあるかチェック
     * 食べられ、繭状態、通常の拘束状態を含む
     * @returns 拘束状態の場合true
     */
    isAnyRestrained(): boolean {
        return this.isRestrained() || this.isEaten() || this.isCocoon();
    }

    /**
     * （通常の）拘束状態にあるかチェック
     * @returns 拘束状態の場合true
     */
    isRestrained(): boolean {
        return this.statusEffects.isRestrained();
    }

    /**
     * 食べられ状態にあるかチェック
     * @returns 食べられ状態の場合true
     */
    isEaten(): boolean {
        return this.statusEffects.isEaten();
    }

    /**
     * 繭状態にあるかチェック
     * @returns 繭状態の場合true
     */
    isCocoon(): boolean {
        return this.statusEffects.isCocoon();
    }

    /**
     * 戦闘不能状態にあるかチェック
     * @returns 戦闘不能状態の場合true
     */
    isKnockedOut(): boolean {
        return this.statusEffects.isKnockedOut();
    }

    /**
     * 死亡状態にあるかチェック
     * @returns 死亡状態の場合true
     */
    isDoomed(): boolean {
        return this.statusEffects.isDoomed();
    }

    /**
     * 気絶状態にあるかチェック
     * @returns 気絶状態の場合true
     */
    isStunned(): boolean {
        return this.statusEffects.hasEffect(StatusEffectType.Stunned);
    }

    /**
     * 睡眠状態にあるかチェック
     * @returns 睡眠状態の場合true
     */
    isSleeping(): boolean {
        return this.statusEffects.isSleeping();
    }

    //#endregion
}