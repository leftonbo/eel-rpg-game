export enum TrophyType {
    Victory = 'victory',
    Defeat = 'defeat',
    SkillExperience = 'skill-experience'
}

export interface Trophy {
    id: string;
    name: string;
    description: string;
    bossId: string;
    type: TrophyType;
    explorerExp: number;
    dateObtained: number; // timestamp
}

export interface BattleMemorial {
    bossId: string;
    hasWon: boolean;
    hasLost: boolean;
}

export class TrophySystem {
    private trophies: Map<string, Trophy> = new Map();
    private battleMemorials: Map<string, BattleMemorial> = new Map();
    
    constructor() {
        this.loadFromSave();
    }
    
    /**
     * 初回勝利記念品を獲得
     */
    public awardVictoryTrophy(bossId: string, bossName: string, requiredLevel: number): Trophy | null {
        const memorial = this.getBattleMemorial(bossId);
        if (memorial.hasWon) {
            return null; // 既に勝利済み
        }
        
        const trophyId = `${bossId}-victory`;
        const explorerExp = (requiredLevel + 1) ** 2 * 100;
        
        const trophy: Trophy = {
            id: trophyId,
            name: `${bossName}のたてがみ`,
            description: `${bossName}に初回勝利した記念品`,
            bossId,
            type: TrophyType.Victory,
            explorerExp,
            dateObtained: Date.now()
        };
        
        this.trophies.set(trophyId, trophy);
        memorial.hasWon = true;
        this.saveToStorage();
        
        return trophy;
    }
    
    /**
     * 初回敗北記念品を獲得
     */
    public awardDefeatTrophy(bossId: string, bossName: string, requiredLevel: number): Trophy | null {
        const memorial = this.getBattleMemorial(bossId);
        if (memorial.hasLost) {
            return null; // 既に敗北済み
        }
        
        const trophyId = `${bossId}-defeat`;
        const explorerExp = (requiredLevel + 1) ** 2 * 100;
        
        const trophy: Trophy = {
            id: trophyId,
            name: `${bossName}の粘液`,
            description: `${bossName}に初回敗北した記念品`,
            bossId,
            type: TrophyType.Defeat,
            explorerExp,
            dateObtained: Date.now()
        };
        
        this.trophies.set(trophyId, trophy);
        memorial.hasLost = true;
        this.saveToStorage();
        
        return trophy;
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
     * 特定ボスの記念品を取得
     */
    public getTrophiesByBoss(bossId: string): Trophy[] {
        return this.getAllTrophies().filter(trophy => trophy.bossId === bossId);
    }
    
    /**
     * localStorage から読み込み
     */
    private loadFromSave(): void {
        try {
            const trophyData = localStorage.getItem('eel-rpg-trophies');
            const memorialData = localStorage.getItem('eel-rpg-battle-memorials');
            
            if (trophyData) {
                const trophies = JSON.parse(trophyData);
                Object.entries(trophies).forEach(([id, trophy]) => {
                    this.trophies.set(id, trophy as Trophy);
                });
            }
            
            if (memorialData) {
                const memorials = JSON.parse(memorialData);
                Object.entries(memorials).forEach(([bossId, memorial]: [string, any]) => {
                    this.battleMemorials.set(bossId, {
                        bossId,
                        hasWon: memorial.hasWon,
                        hasLost: memorial.hasLost
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
            const trophyData: { [key: string]: Trophy } = {};
            this.trophies.forEach((trophy, id) => {
                trophyData[id] = trophy;
            });
            
            const memorialData: { [key: string]: any } = {};
            this.battleMemorials.forEach((memorial, bossId) => {
                memorialData[bossId] = {
                    bossId: memorial.bossId,
                    hasWon: memorial.hasWon,
                    hasLost: memorial.hasLost
                };
            });
            
            localStorage.setItem('eel-rpg-trophies', JSON.stringify(trophyData));
            localStorage.setItem('eel-rpg-battle-memorials', JSON.stringify(memorialData));
        } catch (error) {
            console.error('Failed to save trophy data:', error);
        }
    }
    
    /**
     * データをエクスポート（デバッグ用）
     */
    public exportData(): { trophies: Trophy[], memorials: BattleMemorial[] } {
        return {
            trophies: this.getAllTrophies(),
            memorials: Array.from(this.battleMemorials.values())
        };
    }
    
    /**
     * データをインポート（デバッグ用）
     */
    public importData(data: { trophies: Trophy[], memorials: BattleMemorial[] }): void {
        this.trophies.clear();
        this.battleMemorials.clear();
        
        data.trophies.forEach(trophy => {
            this.trophies.set(trophy.id, trophy);
        });
        
        data.memorials.forEach(memorial => {
            this.battleMemorials.set(memorial.bossId, {
                ...memorial
            });
        });
        
        this.saveToStorage();
    }
}