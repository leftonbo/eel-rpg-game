import { StatusEffectManager, StatusEffectType } from '../systems/StatusEffect';

/**
 * プレイヤーとボスの共通基底クラス
 * HP/MP管理、状態異常管理、戦闘システムの基本機能を提供
 */
export abstract class Actor {
    //#region プロパティ定義

    /** キャラクター表示名 */
    public displayName: string;
    /** 現在のHP */
    public hp: number;
    /** 最大HP */
    public maxHp: number;
    /** 現在のMP */
    public mp: number;
    /** 最大MP */
    public maxMp: number;
    /** 攻撃力 */
    public attackPower: number;
    /** 防御力 */
    public defense: number = 0;
    /** 状態異常管理システム */
    public statusEffects: StatusEffectManager = new StatusEffectManager();
    
    /** 戦闘開始時の最大HP（UIのバー表示用） */
    public initialMaxHp: number = 0;
    /** 戦闘開始時の最大MP（UIのバー表示用） */
    public initialMaxMp: number = 0;

    //#endregion

    //#region コンストラクタと抽象メソッド

    /**
     * Actorクラスのコンストラクタ
     * @param displayName キャラクター表示名
     * @param maxHp 最大HP
     * @param attackPower 攻撃力
     * @param maxMp 最大MP（デフォルト: 0）
     */
    constructor(displayName: string, maxHp: number, attackPower: number, maxMp: number = 0) {
        this.displayName = displayName;
        this.maxHp = maxHp;
        this.hp = maxHp;
        this.maxMp = maxMp;
        this.mp = maxMp;
        this.attackPower = attackPower;
    }

    /**
     * アビリティや装備に基づいてステータスを再計算する抽象メソッド
     * Player: アビリティと装備を使用
     * Boss: ボスデータを使用
     */
    abstract recalculateStats(): void;

    //#endregion

    //#region HP/MP管理メソッド

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
        
        // HPが0になった場合、戦闘不能状態を適用
        // 死亡状態が既に適用されている場合は無視
        if (this.hp <= 0
            && !this.statusEffects.hasEffect(StatusEffectType.KnockedOut)
            && !this.statusEffects.hasEffect(StatusEffectType.Doomed)) {
            this.statusEffects.addEffect(StatusEffectType.KnockedOut);
        }
        
        return actualDamage;
    }

    /**
     * HPを回復する
     * @param amount 回復量
     * @returns 実際に回復したHP量
     */
    heal(amount: number): number {
        if (amount <= 0) return 0;
        
        // HPが最大値以上の場合は回復しない
        if (this.hp >= this.maxHp) return 0;
        
        const oldHp = this.hp;
        this.hp = Math.min(this.maxHp, this.hp + amount);
        
        // HPが0から回復した場合、戦闘不能状態を解除
        if (oldHp === 0 && this.hp > 0) {
            this.statusEffects.removeEffect(StatusEffectType.KnockedOut);
        }
        
        return this.hp - oldHp;
    }

    /**
     * MPを回復する
     * @param amount 回復量
     * @returns 実際に回復したMP量
     */
    recoverMp(amount: number): number {
        if (amount <= 0) return 0;
        
        const oldMp = this.mp;
        this.mp = Math.min(this.maxMp, this.mp + amount);
        return this.mp - oldMp;
    }

    /**
     * MPを消費する
     * @param amount 消費量
     * @returns 消費に成功した場合true、不足した場合false
     */
    consumeMp(amount: number): boolean {
        if (this.mp >= amount) {
            this.mp -= amount;
            return true;
        }
        // MPが不足している場合、MPを0にして疲労状態を適用
        this.mp = 0;
        this.statusEffects.addEffect(StatusEffectType.Exhausted);
        return false;
    }

    /**
     * MPを失う（強制的に減少）
     * @param amount 減少量
     * @returns 実際に失ったMP量
     */
    loseMp(amount: number): number {
        if (amount <= 0) return 0;
        
        const oldMp = this.mp;
        this.mp = Math.max(0, this.mp - amount);
        return oldMp - this.mp;
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
        // 食べられ状態でない場合、ターン開始時にMP回復（最大MPの1/10）
        if (!this.statusEffects.isEaten() && this.maxMp > 0) {
            const mpRecovery = Math.floor(this.maxMp / 10);
            this.recoverMp(mpRecovery);
        }
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
     * HP割合を取得（パーセンテージ）
     * @returns HP割合（0-100）
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
     * HPバーの表示幅割合を取得
     * @returns HPバーの幅（0-100%）
     */
    getHpBarPercentage(): number {
        return this.getHpPercentage();
    }

    /**
     * MPバーの表示幅割合を取得
     * @returns MPバーの幅（0-100%）
     */
    getMpBarPercentage(): number {
        return this.getMpPercentage();
    }

    /**
     * HPプログレスコンテナの幅割合を取得（コンテナリサイズ用）
     * @returns コンテナ幅の割合（0-100%）
     */
    getHpContainerPercentage(): number {
        if (this.initialMaxHp <= 0) return 100;
        
        // 現在の最大HPが初期値より高い場合、コンテナは100%のまま
        if (this.maxHp > this.initialMaxHp) {
            return 100;
        }
        
        // 現在の最大HPが低い場合、比例してコンテナを縮小
        return (this.maxHp / this.initialMaxHp) * 100;
    }

    /**
     * MPプログレスコンテナの幅割合を取得（コンテナリサイズ用）
     * @returns コンテナ幅の割合（0-100%）
     */
    getMpContainerPercentage(): number {
        if (this.initialMaxMp <= 0) return 100;
        
        // 現在の最大MPが初期値より高い場合、コンテナは100%のまま
        if (this.maxMp > this.initialMaxMp) {
            return 100;
        }
        
        // 現在の最大MPが低い場合、比例してコンテナを縮小
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
        
        // HP/MPを最大値にリセット
        this.hp = this.maxHp;
        this.mp = this.maxMp;
    }

    /**
     * 戦闘開始時の初期ステータスを保存（UIのバー計算用）
     */
    saveInitialStats(): void {
        this.initialMaxHp = this.maxHp;
        this.initialMaxMp = this.maxMp;
    }

    /**
     * 最大HPを失う
     * @param amount 減少量
     */
    loseMaxHp(amount: number): void {
        this.maxHp = Math.max(0, this.maxHp - amount);
        
        // 現在のHPが新しい最大HPを超える場合、減少させる
        if (this.hp > this.maxHp) {
            this.hp = this.maxHp;
        }
        
        // 最大HPが0以下になった場合、死亡状態を適用
        if (this.maxHp <= 0 && !this.statusEffects.hasEffect(StatusEffectType.Doomed)) {
            this.statusEffects.addEffect(StatusEffectType.Doomed);
            // 戦闘不能状態を除去
            this.statusEffects.removeEffect(StatusEffectType.KnockedOut);
        }
    }

    /**
     * 最大HPを増加（ボスの捕食メカニズム用）
     * @param amount 増加量
     * @returns 実際に増加した最大HP量
     */
    gainMaxHp(amount: number): number {
        if (amount <= 0) return 0;
        
        const oldMaxHp = this.maxHp;
        this.maxHp += amount;
        this.hp += amount; // 現在のHPも同じ量だけ増加
        
        return this.maxHp - oldMaxHp;
    }

    /**
     * HP/MPを最大値まで完全回復
     */
    fullRestore(): void {
        this.hp = this.maxHp;
        this.mp = this.maxMp;
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