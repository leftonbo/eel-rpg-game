import { Player } from './Player';
import { StatusEffectType } from '../systems/StatusEffect';
import { AbilityType } from '../systems/AbilitySystem';
import * as PlayerConstants from './PlayerConstants';

/**
 * プレイヤーのバトル行動管理クラス
 */
export class PlayerBattleActions {
    constructor(private player: Player) {}
    
    /**
     * 防御行動
     */
    defend(): void {
        this.player.isDefending = true;
        this.player.statusEffects.addEffect(StatusEffectType.Defending);
    }
    
    /**
     * もがく行動
     */
    attemptStruggle(): boolean {
        if (!this.player.statusEffects.isRestrained() && 
            !this.player.statusEffects.isEaten() && 
            !this.player.statusEffects.isCocoon()) {
            return false;
        }
        
        this.player.struggleAttempts++;
        
        // Base success rate starts at 20% and increases by 20% each attempt
        let baseSuccessRate = PlayerConstants.STRUGGLE_BASE_SUCCESS_RATE
            + (this.player.struggleAttempts - 1) * PlayerConstants.STRUGGLE_SUCCESS_INCREASE_PER_ATTEMPT;
        
        // Apply agility bonus
        const agilityBonus = this.player.abilitySystem.getAgilityEscapeBonus();
        baseSuccessRate *= 1 + agilityBonus;
        
        // Apply charm modifier
        const modifier = this.player.statusEffects.getStruggleModifier();
        baseSuccessRate *= modifier;
        
        // Cap success rate at 90%
        const finalSuccessRate = Math.min(baseSuccessRate, PlayerConstants.STRUGGLE_MAX_SUCCESS_RATE);
        
        const success = Math.random() < finalSuccessRate;
        
        if (success) {
            // Reset struggle attempts
            this.player.struggleAttempts = 0;
            
            // Remove restrained, eaten, or cocoon status
            this.player.statusEffects.removeEffect(StatusEffectType.Restrained);
            this.player.statusEffects.removeEffect(StatusEffectType.Eaten);
            this.player.statusEffects.removeEffect(StatusEffectType.Cocoon);
            
            // Apply escape recovery passive skill
            this.applyEscapeRecovery();
            
            // Notify agility experience for successful escape
            if (this.player.agilityExperienceCallback) {
                this.player.agilityExperienceCallback(PlayerConstants.AGILITY_EXP_SUCCESS_ESCAPE);
            }
            
            return true;
        }
        
        // Notify agility experience for failed escape (2x amount)
        if (this.player.agilityExperienceCallback) {
            this.player.agilityExperienceCallback(PlayerConstants.AGILITY_EXP_FAILED_ESCAPE);
        }
        
        return false;
    }
    
    /**
     * じっとする行動
     */
    stayStill(): void {
        // Staying still provides a small amount of healing
        const healAmount = Math.floor(this.player.maxHp * PlayerConstants.STAY_STILL_HEAL_RATE);
        this.player.heal(healAmount);
        
        // Also recover a small amount of MP
        const mpRecovery = Math.floor(this.player.maxMp * PlayerConstants.STAY_STILL_MP_RECOVERY_RATE);
        this.player.recoverMp(mpRecovery);
    }
    
    /**
     * ターン開始時の処理
     */
    startTurn(): void {
        // Reset defending status
        this.player.isDefending = false;
        
        // Check exhausted recovery
        const recoveryMessages = this.checkExhaustedRecovery();
        if (recoveryMessages.length > 0) {
            // This could be handled by the game to display messages
        }
    }
    
    /**
     * ターン終了時の処理
     */
    processRoundEnd(): string[] {
        const messages: string[] = [];
        
        // Check for knock out recovery before decreasing durations
        const recoveryMessages = this.recoverFromKnockOut();
        messages.push(...recoveryMessages);
        
        // Apply passive skill effects
        const passiveMessages = this.applyPassiveSkills();
        messages.push(...passiveMessages);
        
        return messages;
    }
    
    /**
     * 疲労状態からの回復チェック
     */
    private checkExhaustedRecovery(): string[] {
        const messages: string[] = [];
        
        if (this.player.statusEffects.isExhausted()) {
            // Check if MP is full or 4 turns have passed
            const exhaustedEffect = this.player.statusEffects.getEffect(StatusEffectType.Exhausted);
            if (this.player.mp >= this.player.maxMp || (exhaustedEffect && exhaustedEffect.duration <= 1)) {
                this.player.statusEffects.removeEffect(StatusEffectType.Exhausted);
                messages.push(`${this.player.name}の疲れが回復した！`);
            }
        }
        
        return messages;
    }
    
    /**
     * 戦闘不能からの回復
     */
    private recoverFromKnockOut(): string[] {
        const messages: string[] = [];
        
        if (this.player.statusEffects.hasEffect(StatusEffectType.KnockedOut)) {
            // Check if knock out duration is over
            const knockOutEffect = this.player.statusEffects.getEffect(StatusEffectType.KnockedOut);
            if (knockOutEffect && knockOutEffect.duration <= 1) {
                this.player.statusEffects.removeEffect(StatusEffectType.KnockedOut);
                
                // Recover 50% health
                const healAmount = Math.floor(this.player.maxHp * PlayerConstants.KNOCKEDOUT_RECOVERY_RATE);
                this.player.heal(healAmount);
                
                messages.push(`${this.player.name}が意識を取り戻した！`);
                messages.push(`ヘルスが${healAmount}回復した！`);
            }
        }
        
        return messages;
    }
    
    /**
     * パッシブスキル効果の適用
     */
    private applyPassiveSkills(): string[] {
        const messages: string[] = [];
        const passiveSkills = this.player.getUnlockedPassiveSkills();
        
        passiveSkills.forEach(skill => {
            switch (skill.passiveEffect) {
                case 'regeneration':
                    const healAmount = Math.max(
                        1,
                        Math.round(
                            this.player.maxHp
                            * this.player.statusEffects.getHpRegenerateModifier()
                            / PlayerConstants.REGENERATION_HEAL_DIVISOR
                        )
                    );
                    if (!this.player.isKnockedOut() && !this.player.isAnyRestrained() && this.player.hp < this.player.maxHp) {
                        this.player.heal(healAmount);
                    }
                    break;
                // Other passive effects will be handled in specific situations
            }
        });
        
        return messages;
    }
    
    /**
     * 脱出回復パッシブスキルの適用
     */
    private applyEscapeRecovery(): string[] {
        const messages: string[] = [];
        const passiveSkills = this.player.getUnlockedPassiveSkills();
        
        const hasEscapeRecovery = passiveSkills.some(skill => skill.passiveEffect === 'escape-recovery');
        if (hasEscapeRecovery) {
            const lostMaxHp = this.player.initialMaxHp - this.player.maxHp;
            const recoveryAmount = Math.floor(lostMaxHp * PlayerConstants.ESCAPE_RECOVERY_RATE);
            if (recoveryAmount > 0) {
                const actualHeal = this.player.gainMaxHp(recoveryAmount);
                if (actualHeal > 0) {
                    messages.push(`${this.player.name}は拘束からの脱出で${actualHeal}の最大HPを回復した！`);
                }
            }
        }
        
        return messages;
    }
    
    /**
     * 防御時のダメージカット判定
     */
    shouldCutDefendDamage(): boolean {
        const toughnessLevel = this.player.abilitySystem.getAbility(AbilityType.Toughness)?.level || 0;
        return toughnessLevel >= PlayerConstants.TOUGHNESS_DEFEND_CUT_LEVEL;
    }
    
    /**
     * バトル状態のリセット
     */
    resetBattleState(): void {
        // Reset battle-specific flags
        this.player.struggleAttempts = 0;
        this.player.isDefending = false;
        
        // Note: Keep progression data (abilities, equipment, items) intact
        // Also preserve maxHp changes from abilities/equipment
    }
}