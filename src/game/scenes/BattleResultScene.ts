import { Game } from '../Game';
import { AbilityType } from '../systems/AbilitySystem';
import { SkillRegistry } from '../data/skills';
import { Player } from '../entities/Player';
import { getAllBossData, getBossData } from '../data';
import { Trophy, MemorialSystem } from '../systems/MemorialSystem';
import { Boss, BossData } from '../entities/Boss';

export enum BattleResultStatus {
    Interrupted = 'interrupted',
    Victory = 'victory',
    Defeat = 'defeat'
}

export interface BattleResult {
    status: BattleResultStatus;
    experienceGained: { [key: string]: number };
    levelUps: { [key: string]: { previousLevel: number; newLevel: number } };
    newUnlocks: {
        weapons: string[];
        armors: string[];
        items: string[];
        skills: string[];
    };
    trophies: Trophy[];
    newBossUnlocks: string[];
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
        
        // Display trophies
        this.displayTrophies();
        
        // Display new boss unlocks
        this.displayNewBossUnlocks();
        
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
     * Display trophies earned in this battle
     */
    private displayTrophies(): void {
        const trophyContainer = document.getElementById('trophies-earned');
        if (!trophyContainer || !this.battleResult || this.battleResult.trophies.length === 0) {
            return;
        }
        
        trophyContainer.innerHTML = '<h5>🏆 獲得記念品</h5>';
        
        this.battleResult.trophies.forEach(trophy => {
            const trophyDiv = document.createElement('div');
            trophyDiv.className = 'mb-3 p-3 border border-info rounded bg-info bg-opacity-10';
            trophyDiv.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <div class="fw-bold text-info">${trophy.name}</div>
                        <div class="small text-muted">${trophy.description}</div>
                    </div>
                    <div class="text-end">
                        <div class="text-success">+${trophy.explorerExp} EXP</div>
                        <div class="small text-muted">🗺️ エクスプローラー</div>
                    </div>
                </div>
            `;
            trophyContainer.appendChild(trophyDiv);
        });
    }
    
    /**
     * Display newly unlocked bosses
     */
    private displayNewBossUnlocks(): void {
        const bossUnlockContainer = document.getElementById('new-boss-unlocks');
        if (!bossUnlockContainer || !this.battleResult || this.battleResult.newBossUnlocks.length === 0) {
            return;
        }
        
        bossUnlockContainer.innerHTML = '<h5>🔓 新ボス解禁</h5>';
        
        this.battleResult.newBossUnlocks.forEach(bossName => {
            const unlockDiv = document.createElement('div');
            unlockDiv.className = 'mb-3 p-3 border border-warning rounded bg-warning bg-opacity-10';
            unlockDiv.innerHTML = `
                <div class="text-center">
                    <div class="h6 text-warning">🌟 ${bossName} が解禁されました！</div>
                </div>
            `;
            bossUnlockContainer.appendChild(unlockDiv);
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
            [AbilityType.Agility]: '🏃 アジリティ',
            [AbilityType.Explorer]: '🗺️ エクスプローラー'
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
    player: Player,
    boss: Boss,
    status: BattleResultStatus,
    damageDealt: number,
    damageTaken: number,
    mpSpent: number,
    craftworkExperience: number = 0,
    agilityExperience: number = 0,
    skillsReceived: string[] = []
): BattleResult {
    // Calculate explorer experience from trophies and skill experience
    const bossId = boss.id;
    const bossData = getBossData(bossId);
    const requiredLevel = bossData?.explorerLevelRequired || 0;
    const trophies: Trophy[] = [];
    let explorerExperience = 0;

    if (bossData) {
        // Award victory/defeat trophies (only if battle was not interrupted)
        if (status === BattleResultStatus.Victory) {
            const victoryTrophy = player.memorialSystem.awardVictoryTrophy(bossData);
            if (victoryTrophy) {
                trophies.push(victoryTrophy);
                explorerExperience += victoryTrophy.explorerExp;
            }
        } else if (status === BattleResultStatus.Defeat) {
            const defeatTrophy = player.memorialSystem.awardDefeatTrophy(bossData);
            if (defeatTrophy) {
                trophies.push(defeatTrophy);
                explorerExperience += defeatTrophy.explorerExp;
            }
        }
    }

    // Calculate skill experience
    const skillExperience = MemorialSystem.calculateSkillExperience(skillsReceived, requiredLevel);
    explorerExperience += skillExperience;
    
    const experienceGained: { [key: string]: number } = {
        [AbilityType.Combat]: damageDealt * 4,
        [AbilityType.Toughness]: damageTaken * 2,
        [AbilityType.CraftWork]: craftworkExperience,
        [AbilityType.Endurance]: mpSpent * 4,
        [AbilityType.Agility]: agilityExperience,
        [AbilityType.Explorer]: explorerExperience
    };
    
    const levelUps: { [key: string]: { previousLevel: number; newLevel: number } } = {};
    const newUnlocks: { weapons: string[]; armors: string[]; items: string[]; skills: string[] } = {
        weapons: [],
        armors: [],
        items: [],
        skills: []
    };
    const newBossUnlocks: string[] = [];
    
    // Store previous explorer level to check for boss unlocks
    const previousExplorerLevel = player.getExplorerLevel();
    
    // Apply experience and check for level ups
    for (const [abilityType, exp] of Object.entries(experienceGained)) {
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
                
                // Check for new boss unlocks if explorer level increased
                if (abilityType === AbilityType.Explorer) {
                    const newExplorerLevel = result.newLevel;
                    const bossUnlocks = checkNewBossUnlocks(previousExplorerLevel, newExplorerLevel);
                    newBossUnlocks.push(...bossUnlocks);
                }
            }
        }
    }
    
    return {
        status,
        experienceGained,
        levelUps,
        newUnlocks,
        trophies,
        newBossUnlocks
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
            3: 'アドレナリン注射',
            5: 'エリクサー',
            7: 'おまもり'
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

/**
 * Check what new bosses are unlocked when explorer level increases
 */
function checkNewBossUnlocks(previousLevel: number, newLevel: number): string[] {
    const newlyUnlockedBosses: string[] = [];
    const allBossData = getAllBossData();

    allBossData.forEach((boss: BossData) => {
        const requiredLevel = boss.explorerLevelRequired || 0;
        // Check if this boss was locked before but is unlocked now
        if (requiredLevel > previousLevel && requiredLevel <= newLevel) {
            newlyUnlockedBosses.push(boss.displayName);
        }
    });
    
    return newlyUnlockedBosses;
}