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

/**
 * 経験記録のシステム
 * 記念品の生成やバトル記録の管理を行う
 */
export class MemorialSystem {
    /**
     * 初期のセーブデータ
     */
    public static readonly INITIAL_SAVE_DATA: MemorialSaveData = {
        bossMemorials: []
    };
    
    private trophies: Map<string, Trophy> = new Map();
    private bossMemorials: Map<string, BossMemorial> = new Map();
    
    /**
     * コンストラクタ
     * 初期データを設定
     */
    constructor() {
        this.initializeData();
    }
    
    /**
     * 記念品を生成（非同期対応）
     */
    private async createHaveTrophies(): Promise<void> {
        for (const [bossId, memorial] of this.bossMemorials.entries()) {
            try {
                const bossData = await getBossData(bossId);
                if (!bossData) {
                    console.warn(`No boss data found for ID: ${bossId}`);
                    continue;
                }

                if (memorial.dateFirstWin && bossData.victoryTrophy) {
                    const trophy = MemorialSystem.createVictoryTrophy(bossData, memorial);
                    this.trophies.set(trophy.id, trophy);
                }
                if (memorial.dateFirstLost && bossData.defeatTrophy) {
                    const trophy = MemorialSystem.createDefeatTrophy(bossData, memorial);
                    this.trophies.set(trophy.id, trophy);
                }
            } catch (error) {
                console.error(`Failed to load boss data for ID: ${bossId}`, error);
            }
        }
    }
    
    /**
     * 勝利記念品を生成
     * @param bossData - 対象のボスデータ
     * @param memorial - 対象のバトル記録
     */
    private static createVictoryTrophy(bossData: BossData, memorial: BossMemorial): Trophy {
        const trophyId = MemorialSystem.getTrophyId(bossData, TrophyType.Victory);
        return {
            id: trophyId,
            type: TrophyType.Victory,
            name: bossData.victoryTrophy?.name || 'Unknown Victory Trophy',
            description: bossData.victoryTrophy?.description || 'No description available.',
            dateObtained: memorial.dateFirstWin || 0,
            explorerExp: MemorialSystem.calculateFirstWinExperience(bossData.explorerLevelRequired || 0)
        };
    }
    
    /**
     * 初回敗北の記念品を生成
     * @param bossData - 対象のボスデータ
     * @param memorial - 対象のバトル記録
     */
    private static createDefeatTrophy(bossData: BossData, memorial: BossMemorial): Trophy {
        const trophyId = MemorialSystem.getTrophyId(bossData, TrophyType.Defeat);
        return {
            id: trophyId,
            type: TrophyType.Defeat,
            name: bossData.defeatTrophy?.name || 'Unknown Defeat Trophy',
            description: bossData.defeatTrophy?.description || 'No description available.',
            dateObtained: memorial.dateFirstLost || 0,
            explorerExp: MemorialSystem.calculateFirstLossExperience(bossData.explorerLevelRequired || 0)
        };
    }

    /**
     * 記念品IDを生成
     * 形式: {type}-{bossId}
     * 例: victory-boss123
     * @param bossData - 対象のボスデータ
     * @param type - 記念品のタイプ (勝利/敗北)
     */
    private static getTrophyId(bossData: BossData, type: TrophyType): string {
        return `${type}-${bossData.id}`;
    }

    /**
     * 初回勝利を記録
     * @param bossData - 対象のボスデータ
     * @returns 記念品オブジェクトまたはnull（既に勝利済みの場合）
     */
    public awardVictoryTrophy(bossData: BossData): Trophy | null {
        const memorial = this.getBattleMemorial(bossData.id);
        if (memorial.dateFirstWin) {
            return null; // 既に勝利済み
        }
        
        memorial.dateFirstWin = Date.now();
        
        // Create and return the victory trophy
        const trophy = MemorialSystem.createVictoryTrophy(bossData, memorial);
        this.trophies.set(trophy.id, trophy);

        return trophy;
    }
    
    /**
     * 初回敗北を記録
     * @param bossData - 対象のボスデータ
     * @returns 記念品オブジェクトまたはnull（既に敗北済みの場合）
     */
    public awardDefeatTrophy(bossData: BossData): Trophy | null {
        const memorial = this.getBattleMemorial(bossData.id);
        if (memorial.dateFirstLost) {
            return null; // 既に敗北済み
        }

        memorial.dateFirstLost = Date.now();
        
        // Create and return the defeat trophy
        const trophy = MemorialSystem.createDefeatTrophy(bossData, memorial);
        this.trophies.set(trophy.id, trophy);

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
     * @param bossId - ボスID
     * @returns 対象のバトル記録、存在しない場合は空の記録
     */
    private getBattleMemorial(bossId: string): BossMemorial {
        if (!this.bossMemorials.has(bossId)) {
            const memorial = MemorialSystem.createNewMemorial(bossId);
            this.bossMemorials.set(bossId, memorial);
            return memorial;
        }
        
        return this.bossMemorials.get(bossId)!;
    }
    
    /**
     * 新しいバトル記録を生成
     * @param bossId - ボスID
     * @returns 新しいバトル記録オブジェクト
     */
    private static createNewMemorial(bossId: string): BossMemorial {
        const memorial: BossMemorial = {
            bossId: bossId
        };
        
        return memorial;
    }
    
    /**
     * 全ての記念品を取得
     * @return 記念品の配列（取得日時順にソート）
     */
    public getAllTrophies(): Trophy[] {
        return Array.from(this.trophies.values()).sort((a, b) => b.dateObtained - a.dateObtained);
    }
    
    /**
     * 全てのバトル記録を取得
     * @return バトル記録の配列
     */
    public initializeData(): void {
        this.trophies.clear();
        this.bossMemorials.clear();
    }
    
    /**
     * 新しいMemorialSystemを生成
     * デフォルトの初期データを使用
     * @returns 新しいMemorialSaveDataオブジェクト
     */
    public static createNewData(): MemorialSaveData {
        return { ...MemorialSystem.INITIAL_SAVE_DATA };
    }
    
    /**
     * バトル記録を読み込み（非同期対応）
     * @param data - MemorialSaveDataオブジェクト
     */
    public async importData(data: MemorialSaveData): Promise<void> {
        this.bossMemorials.clear();
        data.bossMemorials.forEach(memorial => {
            this.bossMemorials.set(memorial.bossId, memorial);
        });
        
        // 記念品を生成（非同期）
        await this.createHaveTrophies();
    }
    
    /**
     * セーブ用のデータを出力
     * @return MemorialSaveDataオブジェクト
     */
    public exportData(): MemorialSaveData {
        return {
            bossMemorials: Array.from(this.bossMemorials.values())
        };
    }
}