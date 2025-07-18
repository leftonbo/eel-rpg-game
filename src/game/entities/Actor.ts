import { StatusEffectManager, StatusEffectType } from '../systems/StatusEffect';

export abstract class Actor {
    public displayName: string;
    public hp: number;
    public maxHp: number;
    public mp: number;
    public maxMp: number;
    public attackPower: number;
    public defense: number = 0;
    public statusEffects: StatusEffectManager = new StatusEffectManager();
    
    // Initial stats at battle start (for UI bar display)
    public initialMaxHp: number = 0;
    public initialMaxMp: number = 0;

    constructor(displayName: string, maxHp: number, attackPower: number, maxMp: number = 0) {
        this.displayName = displayName;
        this.maxHp = maxHp;
        this.hp = maxHp;
        this.maxMp = maxMp;
        this.mp = maxMp;
        this.attackPower = attackPower;
    }

    /**
     * Abstract method to recalculate stats based on abilities/equipment
     * Player: Uses abilities and equipment
     * Boss: Uses boss data
     */
    abstract recalculateStats(): void;

    /**
     * Take damage and handle knocked out status
     */
    takeDamage(amount: number): number {
        if (amount <= 0) return 0;
        
        const modifier = this.statusEffects.getDamageModifier();
        const actualDamage = Math.floor(amount * modifier);
        
        this.hp = Math.max(0, this.hp - actualDamage);
        
        // If health reaches 0, apply knocked out status
        if (this.hp <= 0 && !this.statusEffects.hasEffect(StatusEffectType.KnockedOut)) {
            this.statusEffects.addEffect(StatusEffectType.KnockedOut);
        }
        
        return actualDamage;
    }

    /**
     * Heal HP
     */
    heal(amount: number): number {
        if (amount <= 0) return 0;
        
        // Only heal if hp is below max
        if (this.hp >= this.maxHp) return 0;
        
        const oldHp = this.hp;
        this.hp = Math.min(this.maxHp, this.hp + amount);
        
        // If healed from 0, remove knocked out status
        if (oldHp === 0 && this.hp > 0) {
            this.statusEffects.removeEffect(StatusEffectType.KnockedOut);
        }
        
        return this.hp - oldHp;
    }

    /**
     * Recover MP
     */
    recoverMp(amount: number): number {
        if (amount <= 0) return 0;
        
        const oldMp = this.mp;
        this.mp = Math.min(this.maxMp, this.mp + amount);
        return this.mp - oldMp;
    }

    /**
     * Consume MP
     */
    consumeMp(amount: number): boolean {
        if (this.mp >= amount) {
            this.mp -= amount;
            return true;
        }
        // If MP is insufficient, mp becomes 0 and returns false
        this.mp = 0;
        // Apply exhausted status effect
        this.statusEffects.addEffect(StatusEffectType.Exhausted);
        return false;
    }

    /**
     * Lose MP
     */
    loseMp(amount: number): number {
        if (amount <= 0) return 0;
        
        const oldMp = this.mp;
        this.mp = Math.max(0, this.mp - amount);
        return oldMp - this.mp;
    }

    /**
     * Check if actor can act
     */
    canAct(): boolean {
        return this.statusEffects.canAct() && this.hp > 0;
    }

    /**
     * Start turn processing
     */
    startTurn(): void {
        // Recover MP (1/10 of max MP) at start of turn, unless eaten
        if (!this.statusEffects.isEaten() && this.maxMp > 0) {
            const mpRecovery = Math.floor(this.maxMp / 10);
            this.recoverMp(mpRecovery);
        }
    }

    /**
     * Process all status effects at round end
     */
    processRoundEnd(): string[] {
        const messages: string[] = [];
        
        // Apply status effect damages/effects
        const effectMessages = this.statusEffects.applyEffects(this);
        messages.push(...effectMessages);
        
        // Decrease durations and remove expired effects
        const durationMessages = this.statusEffects.decreaseDurations(this);
        messages.push(...durationMessages);
        
        return messages;
    }

    /**
     * Get HP percentage
     */
    getHpPercentage(): number {
        return this.maxHp > 0 ? (this.hp / this.maxHp) * 100 : 0;
    }

    /**
     * Get MP percentage
     */
    getMpPercentage(): number {
        return this.maxMp > 0 ? (this.mp / this.maxMp) * 100 : 0;
    }

    /**
     * Get HP bar percentage based on max HP (for bar width display)
     */
    getHpBarPercentage(): number {
        return this.getHpPercentage();
    }

    /**
     * Get MP bar percentage based on max MP (for bar width display)
     */
    getMpBarPercentage(): number {
        return this.getMpPercentage();
    }

    /**
     * Get HP progress container width percentage (for container resize)
     */
    getHpContainerPercentage(): number {
        if (this.initialMaxHp <= 0) return 100;
        
        // If current max HP is higher than initial, keep container at 100%
        if (this.maxHp > this.initialMaxHp) {
            return 100;
        }
        
        // If current max HP is lower, shrink container proportionally
        return (this.maxHp / this.initialMaxHp) * 100;
    }

    /**
     * Get MP progress container width percentage (for container resize)
     */
    getMpContainerPercentage(): number {
        if (this.initialMaxMp <= 0) return 100;
        
        // If current max MP is higher than initial, keep container at 100%
        if (this.maxMp > this.initialMaxMp) {
            return 100;
        }
        
        // If current max MP is lower, shrink container proportionally
        return (this.maxMp / this.initialMaxMp) * 100;
    }

    /**
     * Check if actor is defeated
     */
    isDefeated(): boolean {
        return this.statusEffects.isKnockedOut();
    }

    /**
     * Reset battle-specific state while preserving progression
     */
    resetBattleState(): void {
        // Clear all status effects
        this.statusEffects.clearAllEffects();
        
        // Recalculate stats based on current abilities and equipment
        this.recalculateStats();
        
        // Reset HP and MP to maximum
        this.hp = this.maxHp;
        this.mp = this.maxMp;
    }

    /**
     * Save initial stats at battle start for UI bar calculation
     */
    saveInitialStats(): void {
        this.initialMaxHp = this.maxHp;
        this.initialMaxMp = this.maxMp;
    }

    /**
     * Lose max HP
     */
    loseMaxHp(amount: number): void {
        this.maxHp = Math.max(0, this.maxHp - amount);
        
        // If current health exceeds new max health, reduce it
        if (this.hp > this.maxHp) {
            this.hp = this.maxHp;
        }
        
        // If max HP reaches 0 or below, apply doomed status
        if (this.maxHp <= 0 && !this.statusEffects.hasEffect(StatusEffectType.Doomed)) {
            this.statusEffects.addEffect(StatusEffectType.Doomed);
        }
    }

    /**
     * Gain max HP (for boss devour mechanics)
     */
    gainMaxHp(amount: number): number {
        if (amount <= 0) return 0;
        
        const oldMaxHp = this.maxHp;
        this.maxHp += amount;
        this.hp += amount; // Increase current HP by the same amount
        
        return this.maxHp - oldMaxHp;
    }

    /**
     * Fully restore HP and MP to maximum values
     */
    fullRestore(): void {
        this.hp = this.maxHp;
        this.mp = this.maxMp;
    }

    /**
     * Status effect helper methods
     */
    isRestrained(): boolean {
        return this.statusEffects.isRestrained();
    }

    isEaten(): boolean {
        return this.statusEffects.isEaten();
    }

    isCocoon(): boolean {
        return this.statusEffects.isCocoon();
    }

    isKnockedOut(): boolean {
        return this.statusEffects.isKnockedOut();
    }

    isDoomed(): boolean {
        return this.statusEffects.isDoomed();
    }

    isStunned(): boolean {
        return this.statusEffects.hasEffect(StatusEffectType.Stunned);
    }

    isSleeping(): boolean {
        return this.statusEffects.isSleeping();
    }
}