import { AbilitySystem, AbilityType } from '../systems/AbilitySystem';

/**
 * プレイヤーの進行管理クラス（経験値、レベルアップ、探索者レベル等）
 */
export class PlayerProgressionManager {
    constructor(private abilitySystem: AbilitySystem) {}
    
    /**
     * アビリティに経験値を追加
     */
    addExperience(abilityType: AbilityType, amount: number): { leveledUp: boolean; newLevel: number; previousLevel: number } {
        return this.abilitySystem.addExperience(abilityType, amount);
    }
    
    /**
     * 戦闘経験値を追加
     */
    addCombatExperience(damageDealt: number): void {
        this.addExperience(AbilityType.Combat, damageDealt);
    }
    
    /**
     * 現在の探索者レベルを取得
     */
    getExplorerLevel(): number {
        return this.abilitySystem.getExplorerLevel();
    }
    
    /**
     * 探索者レベルに基づくアクセス可能地形を取得
     */
    getAccessibleTerrains(): string[] {
        const level = this.getExplorerLevel();
        
        const terrainMap: { [key: number]: string | string[] } = {
            0: '近隣の地方',
            1: '砂漠',
            2: '海',
            4: 'ジャングル',
            5: '洞窟',
            6: ['遺跡', '廃墟'],
            7: '寒冷地',
            8: '火山',
            9: '天空',
            10: '魔界'
        };
        
        const accessibleTerrains: string[] = [];
        
        for (let i = 0; i <= level; i++) {
            // レベル3はゲストキャラ関係のため表示しない
            if (i === 3) continue;
            
            const terrain = terrainMap[i];
            if (terrain) {
                if (Array.isArray(terrain)) {
                    accessibleTerrains.push(...terrain);
                } else {
                    accessibleTerrains.push(terrain);
                }
            }
        }
        
        return accessibleTerrains.length > 0 ? accessibleTerrains : ['未知の領域'];
    }
    
    /**
     * アビリティレベル情報を取得
     */
    getAbilityLevels(): { [key: string]: { level: number; experience: number; experienceToNext: number } } {
        const result: { [key: string]: { level: number; experience: number; experienceToNext: number } } = {};
        
        Object.values(AbilityType).forEach(type => {
            const ability = this.abilitySystem.getAbility(type);
            if (ability) {
                result[type] = {
                    level: ability.level,
                    experience: ability.experience,
                    experienceToNext: this.abilitySystem.getExperienceToNextLevel(type)
                };
            }
        });
        
        return result;
    }
    
    /**
     * 特定のアビリティの情報を取得
     */
    getAbilityInfo(abilityType: AbilityType): { level: number; experience: number; experienceToNext: number } | null {
        const ability = this.abilitySystem.getAbility(abilityType);
        if (!ability) return null;
        
        return {
            level: ability.level,
            experience: ability.experience,
            experienceToNext: this.abilitySystem.getExperienceToNextLevel(abilityType)
        };
    }
    
    /**
     * アビリティレベルの合計を取得
     */
    getTotalAbilityLevel(): number {
        let total = 0;
        Object.values(AbilityType).forEach(type => {
            const ability = this.abilitySystem.getAbility(type);
            if (ability) {
                total += ability.level;
            }
        });
        return total;
    }
    
    /**
     * 習得済み経験値の合計を取得
     */
    getTotalExperience(): number {
        let total = 0;
        Object.values(AbilityType).forEach(type => {
            const ability = this.abilitySystem.getAbility(type);
            if (ability) {
                total += ability.experience;
            }
        });
        return total;
    }
    
    /**
     * 次のレベルまでに必要な経験値の合計を取得
     */
    getTotalExperienceToNext(): number {
        let total = 0;
        Object.values(AbilityType).forEach(type => {
            total += this.abilitySystem.getExperienceToNextLevel(type);
        });
        return total;
    }
    
    /**
     * プレイヤーの総合的な強さ指標を取得
     */
    getPowerRating(): number {
        // 各アビリティレベルに重み付けして計算
        const weights = {
            [AbilityType.Combat]: 2.0,
            [AbilityType.Toughness]: 1.5,
            [AbilityType.Endurance]: 1.2,
            [AbilityType.Agility]: 1.3,
            [AbilityType.CraftWork]: 1.0,
            [AbilityType.Explorer]: 0.8
        };
        
        let rating = 0;
        Object.values(AbilityType).forEach(type => {
            const ability = this.abilitySystem.getAbility(type);
            if (ability) {
                rating += ability.level * (weights[type] || 1.0);
            }
        });
        
        return Math.round(rating);
    }
}