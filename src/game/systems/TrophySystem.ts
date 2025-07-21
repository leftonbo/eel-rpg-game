import { getBossData } from "../data";
import { BossData } from "../entities/Boss";

export enum TrophyType {
    Victory = 'victory',
    Defeat = 'defeat'
}

/**
 * 記念品のインターフェース (UIでの表示用)
 * 取得日時や経験値などの情報を含む
 */
export interface Trophy {
    id: string;
    type: TrophyType; // trophy type for UI display
    name: string;
    description: string;
    dateObtained: number; // timestamp
    explorerExp: number; // experience points for Explorer ability
}

/**
 * バトル記録のインターフェース
 */
export interface BattleMemorial {
    bossId: string;
    hasWon: boolean;
    dateFirstWin?: number; // timestamp of first victory
    hasLost: boolean;
    dateFirstLost?: number; // timestamp of first defeat
}

export class TrophySystem {
    public trophies: Map<string, Trophy> = new Map();
    private battleMemorials: Map<string, BattleMemorial> = new Map();
    
    constructor() {
        this.loadFromSave();
        this.createHaveTrophies();
    }
    
    /**
     * 記念品を生成
     */
    private createHaveTrophies(): void {
        this.battleMemorials.forEach((memorial, bossId) => {
            const bossData = getBossData(bossId);
            if (!bossData) {
                console.warn(`No boss data found for ID: ${bossId}`);
                return;
            }
            
            if (memorial.hasWon && bossData.victoryTrophy) {
                const trophyId = this.getTrophyId(bossData, TrophyType.Victory);
                this.trophies.set(trophyId, this.createVictoryTrophy(trophyId, bossData, memorial));
            }
            if (memorial.hasLost && bossData.defeatTrophy) {
                const trophyId = this.getTrophyId(bossData, TrophyType.Defeat);
                this.trophies.set(trophyId, this.createDefeatTrophy(trophyId, bossData, memorial));
            }
        });
    }
    
    /**
     * 勝利記念品を生成
     */
    private createVictoryTrophy(trophyId: string, bossData: BossData, memorial?: BattleMemorial): Trophy {
        return {
            id: trophyId,
            type: TrophyType.Victory,
            name: bossData.victoryTrophy?.name || 'Unknown Victory Trophy',
            description: bossData.victoryTrophy?.description || 'No description available.',
            dateObtained: memorial?.dateFirstWin || 0,
            explorerExp: this.calculateFirstWinExperience(bossData.explorerLevelRequired || 0)
        };
    }
    
    /**
     * 初回敗北の記念品を生成
     */
    private createDefeatTrophy(trophyId: string, bossData: BossData, memorial: BattleMemorial): Trophy {
        return {
            id: trophyId,
            type: TrophyType.Defeat,
            name: bossData.defeatTrophy?.name || 'Unknown Defeat Trophy',
            description: bossData.defeatTrophy?.description || 'No description available.',
            dateObtained: memorial.dateFirstLost || 0,
            explorerExp: this.calculateFirstLossExperience(bossData.explorerLevelRequired || 0)
        };
    }

    private getTrophyId(bossData: BossData, type: TrophyType): string {
        return `${type}-${bossData.id}`;
    }

    /**
     * 初回勝利を記録
     */
    public awardVictoryTrophy(bossData: BossData): Trophy | null {
        const memorial = this.getBattleMemorial(bossData.id);
        if (memorial.hasWon) {
            return null; // 既に勝利済み
        }
        
        memorial.hasWon = true;
        memorial.dateFirstWin = Date.now();
        this.saveToStorage();
        
        // Create and return the victory trophy
        const trophyId = this.getTrophyId(bossData, TrophyType.Victory);
        const trophy = this.createVictoryTrophy(trophyId, bossData, memorial);
        this.trophies.set(trophyId, trophy);

        return trophy;
    }
    
    /**
     * 初回敗北を記録
     */
    public awardDefeatTrophy(bossData: BossData): Trophy | null {
        const memorial = this.getBattleMemorial(bossData.id);
        if (memorial.hasLost) {
            return null; // 既に敗北済み
        }

        memorial.hasLost = true;
        memorial.dateFirstLost = Date.now();
        this.saveToStorage();
        
        // Create and return the defeat trophy
        const trophyId = this.getTrophyId(bossData, TrophyType.Defeat);
        const trophy = this.createDefeatTrophy(trophyId, bossData, memorial);
        this.trophies.set(trophyId, trophy);
        
        return trophy;
    }

    /**
     * 初回勝利経験値を計算（記念品ではなく直接経験値）
     */
    public calculateFirstWinExperience(requiredLevel: number): number {
        return 200 * (requiredLevel + 1) ** 2;
    }
    
    /**
     * 初回敗北経験値を計算（記念品ではなく直接経験値）
     */
    public calculateFirstLossExperience(requiredLevel: number): number {
        return 50 * (requiredLevel + 1) ** 2;
    }

    /**
     * スキル体験経験値を計算（記念品ではなく直接経験値）
     */
    public calculateSkillExperience(skillsReceived: string[], requiredLevel: number): number {
        if (skillsReceived.length === 0) {
            return 0; // スキルがない場合は経験値なし
        }

        return skillsReceived.length * 20 * (requiredLevel + 1);
    }
    
    /**
     * バトル記録を取得
     */
    private getBattleMemorial(bossId: string): BattleMemorial {
        if (!this.battleMemorials.has(bossId)) {
            this.battleMemorials.set(bossId, {
                bossId,
                hasWon: false,
                hasLost: false
            });
        }
        return this.battleMemorials.get(bossId)!;
    }
    
    /**
     * 全ての記念品を取得
     */
    public getAllTrophies(): Trophy[] {
        return Array.from(this.trophies.values()).sort((a, b) => b.dateObtained - a.dateObtained);
    }
    
    /**
     * localStorage から読み込み
     */
    private loadFromSave(): void {
        try {
            const memorialData = localStorage.getItem('eel-rpg-battle-memorials');
            
            if (memorialData) {
                const memorials = JSON.parse(memorialData);
                Object.entries(memorials).forEach(([bossId, memorial]: [string, any]) => {
                    this.battleMemorials.set(bossId, {
                        bossId,
                        hasWon: memorial.hasWon,
                        hasLost: memorial.hasLost,
                        dateFirstWin: memorial.dateFirstWin,
                        dateFirstLost: memorial.dateFirstLost
                    });
                });
            }
        } catch (error) {
            console.error('Failed to load trophy data:', error);
        }
    }
    
    /**
     * localStorage に保存
     */
    private saveToStorage(): void {
        try {
            const memorialData: { [key: string]: any } = {};
            this.battleMemorials.forEach((memorial, bossId) => {
                memorialData[bossId] = {
                    bossId: memorial.bossId,
                    hasWon: memorial.hasWon,
                    hasLost: memorial.hasLost,
                    dateFirstWin: memorial.dateFirstWin,
                    dateFirstLost: memorial.dateFirstLost
                };
            });
            
            localStorage.setItem('eel-rpg-battle-memorials', JSON.stringify(memorialData));
        } catch (error) {
            console.error('Failed to save trophy data:', error);
        }
    }
    
    /**
     * データをエクスポート（デバッグ用）
     */
    public exportData(): { memorials: BattleMemorial[] } {
        return {
            memorials: Array.from(this.battleMemorials.values())
        };
    }
    
    /**
     * データをインポート（デバッグ用）
     */
    public importData(data: { memorials: BattleMemorial[] }): void {
        this.battleMemorials.clear();
        
        data.memorials.forEach(memorial => {
            this.battleMemorials.set(memorial.bossId, {
                ...memorial
            });
        });
        
        this.saveToStorage();
    }
}