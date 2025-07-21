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
export interface BossMemorial {
    bossId: string;
    dateFirstWin?: number; // timestamp of first victory
    dateFirstLost?: number; // timestamp of first defeat
}

/**
 * 記録のセーブデータインターフェース
 */
export interface MemorialSaveData {
    bossMemorials: BossMemorial[];
}

export class TrophySystem {
    /**
     * 初期のセーブデータ
     */
    public static readonly INITIAL_SAVE_DATA: MemorialSaveData = {
        bossMemorials: []
    };
    
    public trophies: Map<string, Trophy> = new Map();
    private bossMemorials: Map<string, BossMemorial> = new Map();
    
    /**
     * 記念品を生成
     */
    private createHaveTrophies(): void {
        this.bossMemorials.forEach((memorial, bossId) => {
            const bossData = getBossData(bossId);
            if (!bossData) {
                console.warn(`No boss data found for ID: ${bossId}`);
                return;
            }

            if (memorial.dateFirstWin && bossData.victoryTrophy) {
                const trophyId = this.getTrophyId(bossData, TrophyType.Victory);
                this.trophies.set(trophyId, TrophySystem.createVictoryTrophy(trophyId, bossData, memorial));
            }
            if (memorial.dateFirstLost && bossData.defeatTrophy) {
                const trophyId = this.getTrophyId(bossData, TrophyType.Defeat);
                this.trophies.set(trophyId, TrophySystem.createDefeatTrophy(trophyId, bossData, memorial));
            }
        });
    }
    
    /**
     * 勝利記念品を生成
     */
    private static createVictoryTrophy(trophyId: string, bossData: BossData, memorial?: BossMemorial): Trophy {
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
    private static createDefeatTrophy(trophyId: string, bossData: BossData, memorial: BossMemorial): Trophy {
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
        if (memorial.dateFirstWin) {
            return null; // 既に勝利済み
        }
        
        memorial.dateFirstWin = Date.now();
        
        // Create and return the victory trophy
        const trophyId = this.getTrophyId(bossData, TrophyType.Victory);
        const trophy = TrophySystem.createVictoryTrophy(trophyId, bossData, memorial);
        this.trophies.set(trophyId, trophy);

        return trophy;
    }
    
    /**
     * 初回敗北を記録
     */
    public awardDefeatTrophy(bossData: BossData): Trophy | null {
        const memorial = this.getBattleMemorial(bossData.id);
        if (memorial.dateFirstLost) {
            return null; // 既に敗北済み
        }

        memorial.dateFirstLost = Date.now();
        
        // Create and return the defeat trophy
        const trophyId = this.getTrophyId(bossData, TrophyType.Defeat);
        const trophy = TrophySystem.createDefeatTrophy(trophyId, bossData, memorial);
        this.trophies.set(trophyId, trophy);
        
        return trophy;
    }

    /**
     * 初回勝利経験値を計算（記念品ではなく直接経験値）
     */
    public static calculateFirstWinExperience(requiredLevel: number): number {
        return 200 * (requiredLevel + 1) ** 2;
    }
    
    /**
     * 初回敗北経験値を計算（記念品ではなく直接経験値）
     */
    public static calculateFirstLossExperience(requiredLevel: number): number {
        return 50 * (requiredLevel + 1) ** 2;
    }

    /**
     * スキル体験経験値を計算（記念品ではなく直接経験値）
     */
    public static calculateSkillExperience(skillsReceived: string[], requiredLevel: number): number {
        if (skillsReceived.length === 0) {
            return 0; // スキルがない場合は経験値なし
        }

        return skillsReceived.length * 20 * (requiredLevel + 1);
    }
    
    /**
     * バトル記録を取得
     */
    private getBattleMemorial(bossId: string): BossMemorial {
        if (!this.bossMemorials.has(bossId)) {
            return TrophySystem.createNewMemorial(bossId);
        }
        return this.bossMemorials.get(bossId)!;
    }
    
    /**
     * 新しいバトル記録を作成
     */
    private static createNewMemorial(bossId: string): BossMemorial {
        const memorial: BossMemorial = {
            bossId: bossId
        };
        
        return memorial;
    }
    
    /**
     * 全ての記念品を取得
     */
    public getAllTrophies(): Trophy[] {
        return Array.from(this.trophies.values()).sort((a, b) => b.dateObtained - a.dateObtained);
    }
    
    /**
     * バトル記録を読み込み
     */
    public importData(data: MemorialSaveData): void {
        this.bossMemorials.clear();
        data.bossMemorials.forEach(memorial => {
            this.bossMemorials.set(memorial.bossId, memorial);
        });
        
        // 記念品を生成
        this.createHaveTrophies();
    }
    
    /**
     * セーブ用のデータを出力
     */
    public exportData(): MemorialSaveData {
        return {
            bossMemorials: Array.from(this.bossMemorials.values())
        };
    }
}