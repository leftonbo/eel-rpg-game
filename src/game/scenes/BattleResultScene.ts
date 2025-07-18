import { Game } from '../Game';
import { AbilityType } from '../systems/AbilitySystem';
import { SkillRegistry } from '../data/skills';

export interface BattleResult {
    victory: boolean;
    experienceGained: { [key: string]: number };
    levelUps: { [key: string]: { previousLevel: number; newLevel: number } };
    newUnlocks: {
        weapons: string[];
        armors: string[];
        items: string[];
        skills: string[];
    };
}

export class BattleResultScene {
    private game: Game;
    private battleResult: BattleResult | null = null;
    
    constructor(game: Game) {
        this.game = game;
        this.init();
    }
    
    private init(): void {
        // Initialize any event listeners if needed
        const continueButton = document.getElementById('battle-result-continue-btn');
        if (continueButton) {
            continueButton.addEventListener('click', () => {
                this.continueToBossSelect();
            });
        }
    }
    
    /**
     * Enter the battle result scene with the given result data
     */
    enter(result: BattleResult): void {
        console.log('Entered battle result scene', result);
        this.battleResult = result;
        
        // Save player data after battle
        this.game.getPlayer().saveToStorage();
        
        // Display results
        this.displayResults();
    }
    
    /**
     * Display battle results and level ups
     */
    private displayResults(): void {
        if (!this.battleResult) return;
        
        // Display experience gained
        this.displayExperienceGained();
        
        // Display level ups
        this.displayLevelUps();
        
        // Display new unlocks
        this.displayNewUnlocks();
        
        // Show continue button
        const continueButton = document.getElementById('battle-result-continue-btn');
        if (continueButton) {
            continueButton.style.display = 'block';
        }
    }
    
    /**
     * Display experience gained for each ability
     */
    private displayExperienceGained(): void {
        const expContainer = document.getElementById('experience-gained');
        if (!expContainer || !this.battleResult) return;
        
        expContainer.innerHTML = '<h5>獲得経験値</h5>';
        
        Object.entries(this.battleResult.experienceGained).forEach(([abilityType, exp]) => {
            if (exp > 0) {
                const abilityName = this.getAbilityDisplayName(abilityType as AbilityType);
                const expDiv = document.createElement('div');
                expDiv.className = 'mb-2';
                expDiv.innerHTML = `
                    <div class="d-flex justify-content-between">
                        <span>${abilityName}</span>
                        <span class="text-success">+${exp} EXP</span>
                    </div>
                `;
                expContainer.appendChild(expDiv);
            }
        });
    }
    
    /**
     * Display level ups with animations
     */
    private displayLevelUps(): void {
        const levelUpContainer = document.getElementById('level-ups');
        if (!levelUpContainer || !this.battleResult) return;
        
        levelUpContainer.innerHTML = '';
        
        const hasLevelUps = Object.keys(this.battleResult.levelUps).length > 0;
        if (!hasLevelUps) return;
        
        levelUpContainer.innerHTML = '<h5>レベルアップ！</h5>';
        
        Object.entries(this.battleResult.levelUps).forEach(([abilityType, levelUp]) => {
            const abilityName = this.getAbilityDisplayName(abilityType as AbilityType);
            const levelUpDiv = document.createElement('div');
            levelUpDiv.className = 'mb-3 p-3 border border-warning rounded bg-warning bg-opacity-10';
            levelUpDiv.innerHTML = `
                <div class="text-center">
                    <div class="h6 text-warning">🎉 ${abilityName} レベルアップ！</div>
                    <div class="fs-4">Lv.${levelUp.previousLevel} → Lv.${levelUp.newLevel}</div>
                </div>
            `;
            levelUpContainer.appendChild(levelUpDiv);
        });
    }
    
    /**
     * Display newly unlocked equipment and items
     */
    private displayNewUnlocks(): void {
        const unlocksContainer = document.getElementById('new-unlocks');
        if (!unlocksContainer || !this.battleResult) return;
        
        unlocksContainer.innerHTML = '';
        
        const { weapons, armors, items, skills } = this.battleResult.newUnlocks;
        const hasUnlocks = weapons.length > 0 || armors.length > 0 || items.length > 0 || skills.length > 0;
        
        if (!hasUnlocks) return;
        
        unlocksContainer.innerHTML = '<h5>新しいアンロック！</h5>';
        
        [...weapons, ...armors, ...items, ...skills].forEach(unlockName => {
            const unlockDiv = document.createElement('div');
            unlockDiv.className = 'mb-2 p-2 border border-info rounded bg-info bg-opacity-10';
            unlockDiv.innerHTML = `
                <div class="text-center text-info">
                    🔓 ${unlockName} が利用可能になりました！
                </div>
            `;
            unlocksContainer.appendChild(unlockDiv);
        });
    }
    
    /**
     * Get display name for ability type
     */
    private getAbilityDisplayName(abilityType: AbilityType): string {
        const names: Record<AbilityType, string> = {
            [AbilityType.Combat]: '⚔️ コンバット',
            [AbilityType.Toughness]: '🛡️ タフネス',
            [AbilityType.CraftWork]: '🔧 クラフトワーク',
            [AbilityType.Endurance]: '💪 エンデュランス',
            [AbilityType.Agility]: '🏃 アジリティ'
        };
        return names[abilityType] || abilityType;
    }
    
    /**
     * Continue to boss selection screen
     */
    private continueToBossSelect(): void {
        this.game.returnToBossSelect();
    }
}

/**
 * Calculate battle result based on player performance
 */
export function calculateBattleResult(
    player: any,
    victory: boolean,
    damageDealt: number,
    damageTaken: number,
    mpSpent: number,
    craftworkExperience: number = 0,
    agilityExperience: number = 0
): BattleResult {
    const experienceGained: { [key: string]: number } = {
        [AbilityType.Combat]: damageDealt * 4,
        [AbilityType.Toughness]: damageTaken * 2,
        [AbilityType.CraftWork]: craftworkExperience,
        [AbilityType.Endurance]: mpSpent * 4,
        [AbilityType.Agility]: agilityExperience
    };
    
    const levelUps: { [key: string]: { previousLevel: number; newLevel: number } } = {};
    const newUnlocks: { weapons: string[]; armors: string[]; items: string[]; skills: string[] } = {
        weapons: [],
        armors: [],
        items: [],
        skills: []
    };
    
    // Apply experience and check for level ups
    Object.entries(experienceGained).forEach(([abilityType, exp]) => {
        if (exp > 0) {
            const result = player.addExperience(abilityType as AbilityType, exp);
            if (result.leveledUp) {
                levelUps[abilityType] = {
                    previousLevel: result.previousLevel,
                    newLevel: result.newLevel
                };
                
                // Check for new unlocks
                const unlocks = checkNewUnlocks(abilityType as AbilityType, result.newLevel);
                newUnlocks.weapons.push(...unlocks.weapons);
                newUnlocks.armors.push(...unlocks.armors);
                newUnlocks.items.push(...unlocks.items);
                newUnlocks.skills.push(...unlocks.skills);
            }
        }
    });
    
    return {
        victory,
        experienceGained,
        levelUps,
        newUnlocks
    };
}

/**
 * Check what new equipment/items are unlocked at a given ability level
 */
function checkNewUnlocks(abilityType: AbilityType, newLevel: number): { weapons: string[]; armors: string[]; items: string[]; skills: string[] } {
    const unlocks: { weapons: string[]; armors: string[]; items: string[]; skills: string[] } = {
        weapons: [],
        armors: [],
        items: [],
        skills: []
    };
    
    if (abilityType === AbilityType.Combat) {
        const weaponUnlocks: { [level: number]: string } = {
            1: 'パチンコ',
            2: '木の弓矢',
            4: 'コンパウンドボウ',
            6: 'サブマシンガン',
            8: 'レーザーライフル',
            10: 'スーパーブラスター'
        };
        if (weaponUnlocks[newLevel]) {
            unlocks.weapons.push(weaponUnlocks[newLevel]);
        }
    }
    
    if (abilityType === AbilityType.Toughness) {
        const armorUnlocks: { [level: number]: string } = {
            1: 'Tシャツ',
            2: '旅装',
            4: '冒険者の服',
            6: '軍用ジャケット',
            8: '近未来スーツ',
            10: '超合金アーマー'
        };
        if (armorUnlocks[newLevel]) {
            unlocks.armors.push(armorUnlocks[newLevel]);
        }
    }
    
    if (abilityType === AbilityType.CraftWork) {
        const itemUnlocks: { [level: number]: string } = {
            1: '元気ドリンク',
            2: '手投げ爆弾',
            4: 'アドレナリン注射',
            7: 'エリクサー',
            10: 'おまもり'
        };
        if (itemUnlocks[newLevel]) {
            unlocks.items.push(itemUnlocks[newLevel]);
        }
    }
    
    // Check for skill unlocks
    const skillUnlocks = checkSkillUnlocks(abilityType, newLevel);
    unlocks.skills.push(...skillUnlocks);
    
    return unlocks;
}

/**
 * Check what new skills are unlocked at a given ability level
 */
function checkSkillUnlocks(abilityType: AbilityType, newLevel: number): string[] {
    const skillUnlocks: string[] = [];
    
    // Get all skills that could be unlocked at this level
    const allSkills = SkillRegistry.getUnlockedSkills(new Map([[abilityType, newLevel]]));
    const previousSkills = SkillRegistry.getUnlockedSkills(new Map([[abilityType, newLevel - 1]]));
    
    // Find skills that are newly unlocked
    allSkills.forEach((skillId: string) => {
        if (!previousSkills.includes(skillId)) {
            const skill = SkillRegistry.getSkill(skillId);
            if (skill) {
                skillUnlocks.push(skill.name);
            }
        }
    });
    
    return skillUnlocks;
}