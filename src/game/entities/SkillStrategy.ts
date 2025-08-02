import { Player } from './Player';
import { SkillData } from '../data/skills';
import { Actor } from './Actor';
import { SkillResult } from './Player';
import { StatusEffectType } from '../systems/StatusEffect';
import { AbilityType } from '../systems/AbilitySystem';
import * as PlayerConstants from './PlayerConstants';

/**
 * スキル実行戦略の基底インターフェース
 */
export interface SkillStrategy {
    execute(player: Player, skillData: SkillData, target?: Actor): SkillResult;
}

/**
 * パワーアタック戦略
 */
export class PowerAttackStrategy implements SkillStrategy {
    execute(player: Player, skillData: SkillData): SkillResult {
        const mpInsufficient = !player.consumeMp(skillData.mpCost);
        let powerMultiplier = skillData.damageMultiplier || PlayerConstants.POWER_ATTACK_DEFAULT_MULTIPLIER;
        
        if (mpInsufficient) {
            powerMultiplier *= PlayerConstants.POWER_ATTACK_NO_MP_MULTIPLIER;
        }
        
        const damage = Math.floor(player.getAttackPower() * powerMultiplier);
        return {
            success: true,
            mpConsumed: mpInsufficient ? player.mp : skillData.mpCost,
            message: mpInsufficient ? 
                `${player.name}は最後の力を振り絞って${skillData.name}を放った！` :
                `${player.name}は${skillData.name}を放った！`,
            damage
        };
    }
}

/**
 * ウルトラスマッシュ戦略
 */
export class UltraSmashStrategy implements SkillStrategy {
    execute(player: Player, skillData: SkillData): SkillResult {
        const mpConsumed = player.mp;
        player.mp = 0; // Consume all MP
        
        const baseDamage = player.getAttackPower();
        const mpDamage = mpConsumed;
        const totalDamage = baseDamage * PlayerConstants.ULTRA_SMASH_BASE_DAMAGE_MULTIPLIER
            + mpDamage * PlayerConstants.ULTRA_SMASH_MP_DAMAGE_MULTIPLIER;

        // Add exhaustion effect
        player.statusEffects.addEffect(StatusEffectType.Exhausted);
        
        return {
            success: true,
            mpConsumed: mpConsumed,
            message: `${player.name}は${skillData.name}を放った！（消費MP: ${mpConsumed}）`,
            damage: totalDamage
        };
    }
}

/**
 * もがく戦略
 */
export class StruggleStrategy implements SkillStrategy {
    execute(player: Player, skillData: SkillData): SkillResult {
        const mpInsufficient = !player.consumeMp(skillData.mpCost);
        let successMultiplier = PlayerConstants.STRUGGLE_ENHANCED_SUCCESS_MULTIPLIER;
        
        if (mpInsufficient) {
            successMultiplier = PlayerConstants.STRUGGLE_ENHANCED_SUCCESS_MULTIPLIER_NO_MP;
        }
        
        // Calculate enhanced struggle success rate
        let baseSuccessRate = PlayerConstants.STRUGGLE_BASE_SUCCESS_RATE + (player.struggleAttempts) * PlayerConstants.STRUGGLE_SUCCESS_INCREASE_PER_ATTEMPT;
        
        // Apply agility bonus
        const agilityBonus = player.abilitySystem.getAgilityEscapeBonus();
        baseSuccessRate *= 1 + agilityBonus;
        
        const modifier = player.statusEffects.getStruggleModifier();
        let finalSuccessRate = baseSuccessRate * modifier * successMultiplier;
        finalSuccessRate = Math.min(finalSuccessRate, PlayerConstants.STRUGGLE_MAX_SUCCESS_RATE);
        
        const success = Math.random() < finalSuccessRate;
        player.struggleAttempts++;
        
        // Check if agility level 5+ for damage dealing
        const agilityLevel = player.abilitySystem.getAbility(AbilityType.Agility)?.level || 0;
        let damageDealt = 0;
        if (agilityLevel >= PlayerConstants.AGILITY_DAMAGE_DEALING_LEVEL) {
            damageDealt = Math.floor(player.getAttackPower() * PlayerConstants.STRUGGLE_DAMAGE_MULTIPLIER);
        }
        
        if (success) {
            player.struggleAttempts = 0;
            player.statusEffects.removeEffect(StatusEffectType.Restrained);
            player.statusEffects.removeEffect(StatusEffectType.Eaten);
            
            // Notify agility experience for successful escape
            if (player.agilityExperienceCallback) {
                player.agilityExperienceCallback(PlayerConstants.AGILITY_EXP_FAILED_ESCAPE);
            }
            
            return {
                success: true,
                mpConsumed: mpInsufficient ? player.mp : skillData.mpCost,
                message: mpInsufficient ? 
                    `${player.name}は最後の力で激しくあばれた！拘束から脱出した！` :
                    `${player.name}は激しくあばれた！拘束から脱出した！`,
                damage: damageDealt
            };
        } else {
            // Increase future struggle success significantly on failure
            player.struggleAttempts += mpInsufficient ? PlayerConstants.STRUGGLE_ATTEMPT_INCREASE_FAIL_NO_MP : PlayerConstants.STRUGGLE_ATTEMPT_INCREASE_FAIL;
            
            // Notify agility experience for failed escape (2x amount)
            if (player.agilityExperienceCallback) {
                player.agilityExperienceCallback(PlayerConstants.AGILITY_EXP_ENHANCED_FAILED_ESCAPE);
            }
            
            return {
                success: false,
                mpConsumed: mpInsufficient ? player.mp : skillData.mpCost,
                message: mpInsufficient ? 
                    `${player.name}は最後の力であばれたが、脱出できなかった...しかし次回の成功率が大幅に上がった！` :
                    `${player.name}があばれたが、脱出できなかった...次回の成功率が上がった！`,
                damage: damageDealt
            };
        }
    }
}

/**
 * 防御戦略
 */
export class DefendStrategy implements SkillStrategy {
    execute(player: Player, skillData: SkillData): SkillResult {
        player.defend();
        
        // Check if endurance level 3+ for MP recovery
        const enduranceLevel = player.abilitySystem.getAbility(AbilityType.Endurance)?.level || 0;
        if (enduranceLevel >= PlayerConstants.ENDURANCE_FULL_MP_RECOVERY_LEVEL) {
            player.mp = player.maxMp;
        }
        
        return {
            success: true,
            message: `${player.name}は${skillData.name}の構えを取った！`
        };
    }
}

/**
 * じっとする戦略
 */
export class StayStillStrategy implements SkillStrategy {
    execute(player: Player, skillData: SkillData): SkillResult {
        player.stayStill();
        
        // Check if endurance level 3+ for MP recovery
        const enduranceLevel = player.abilitySystem.getAbility(AbilityType.Endurance)?.level || 0;
        if (enduranceLevel >= PlayerConstants.ENDURANCE_FULL_MP_RECOVERY_LEVEL) {
            player.mp = player.maxMp;
        }
        
        return {
            success: true,
            message: `${player.name}は${skillData.name}して体力を回復した！`
        };
    }
}

/**
 * スキル実行ストラテジーファクトリー
 */
export class SkillStrategyFactory {
    private static strategies = new Map<string, SkillStrategy>([
        ['power-attack', new PowerAttackStrategy()],
        ['ultra-smash', new UltraSmashStrategy()],
        ['struggle', new StruggleStrategy()],
        ['defend', new DefendStrategy()],
        ['stay-still', new StayStillStrategy()]
    ]);
    
    static getStrategy(skillId: string): SkillStrategy | null {
        return this.strategies.get(skillId) || null;
    }
}