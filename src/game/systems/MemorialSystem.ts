import { getBossData, getAllBossData, getRegisteredBossIds } from "../data";
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
    bossId: string; // boss ID for reference
    unlockLevel: number; // level at which the trophy is unlocked
    type: TrophyType; // trophy type for UI display
    name: string;
    description: string;
    dateObtained: number | null; // timestamp (optional) when the trophy was obtained
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
        this.trophies.clear();
        this.bossMemorials.clear();
    }
    
    /**
     * ボスデータのロード後の初期化処理
     */
    public lateInitialize(): void {
        this.createAllTrophies();
    }
    
    /**
     * 記念品を生成
     */
    private createAllTrophies(): void {
        for (const bossId of getRegisteredBossIds()) {
            try {
                const bossData = getBossData(bossId);
                if (!bossData) {
                    console.warn(`No boss data found for ID: ${bossId}`);
                    continue;
                }

                if (bossData.victoryTrophy) {
                    const trophy = MemorialSystem.createVictoryTrophy(bossData);
                    this.trophies.set(trophy.id, trophy);
                }
                
                if (bossData.defeatTrophy) {
                    const trophy = MemorialSystem.createDefeatTrophy(bossData);
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
    private static createVictoryTrophy(bossData: BossData): Trophy {
        const trophyId = MemorialSystem.getTrophyId(bossData, TrophyType.Victory);
        return {
            id: trophyId,
            bossId: bossData.id,
            unlockLevel: bossData.explorerLevelRequired || 0,
            type: TrophyType.Victory,
            name: bossData.victoryTrophy?.name || 'Unknown Victory Trophy',
            description: bossData.victoryTrophy?.description || 'No description available.',
            dateObtained: null,
            explorerExp: MemorialSystem.calculateFirstWinExperience(bossData.explorerLevelRequired || 0)
        };
    }
    
    /**
     * 初回敗北の記念品を生成
     * @param bossData - 対象のボスデータ
     * @param memorial - 対象のバトル記録
     */
    private static createDefeatTrophy(bossData: BossData): Trophy {
        const trophyId = MemorialSystem.getTrophyId(bossData, TrophyType.Defeat);
        return {
            id: trophyId,
            bossId: bossData.id,
            unlockLevel: bossData.explorerLevelRequired || 0,
            type: TrophyType.Defeat,
            name: bossData.defeatTrophy?.name || 'Unknown Defeat Trophy',
            description: bossData.defeatTrophy?.description || 'No description available.',
            dateObtained: null,
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
        
        // Update the trophy with the current date
        const trophy = this.getTrophy(bossData.id, TrophyType.Victory);
        if (trophy) {
            trophy.dateObtained = memorial.dateFirstWin;
        }

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
        
        // Update the trophy with the current date
        const trophy = this.getTrophy(bossData.id, TrophyType.Defeat);
        if (trophy) {
            trophy.dateObtained = memorial.dateFirstLost;
        }

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
     * 全ての記念品をソートして取得
     * @return 記念品の配列（ボス解禁レベル→ボスID順→勝利or敗北）
     */
    public getAllTrophiesSorted(): Trophy[] {
        return Array.from(this.trophies.values()).sort((a, b) => {
            if (a.unlockLevel !== b.unlockLevel) {
                return a.unlockLevel - b.unlockLevel; // ソート: ボス解禁レベル順
            }
            if (a.bossId !== b.bossId) {
                return a.bossId.localeCompare(b.bossId); // ソート: ボスID順
            }
            return a.type === TrophyType.Victory ? -1 : 1; // 勝利が先、敗北が後
        });
    }

    /**
     * 獲得済みの記念品を取得
     * @return 記念品の配列（ボス解禁レベル→ボスID順→勝利or敗北）
     */
    public getEarnedTrophies(): Trophy[] {
        return Array.from(this.trophies.values()).filter(trophy => trophy.dateObtained !== null);
    }
    
    /**
     * 指定されたボスIDとタイプの記念品を取得
     * @param bossId - ボスのID
     * @param type - 記念品のタイプ（勝利/敗北）
     * @returns 対象の記念品、存在しない場合はnull
     */
    public getTrophy(bossId: string, type: TrophyType): Trophy | null {
        const trophyId = MemorialSystem.getTrophyId(getBossData(bossId), type);
        return this.trophies.get(trophyId) || null;
    }
    
    /**
     * 敗北したボスのIDリストを取得
     * @return 敗北したボスのIDの配列
     */
    public getDefeatedBossIds(): string[] {
        return Array.from(this.bossMemorials.values())
            .filter(memorial => memorial.dateFirstLost)
            .map(memorial => memorial.bossId);
    }
    
    /**
     * 勝利したボスのIDリストを取得
     * @return 勝利したボスのIDの配列
     */
    public getVictoriousBossIds(): string[] {
        return Array.from(this.bossMemorials.values())
            .filter(memorial => memorial.dateFirstWin)
            .map(memorial => memorial.bossId);
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
     * バトル記録を読み込み
     * @param data - MemorialSaveDataオブジェクト
     */
    public importData(data: MemorialSaveData): void {
        this.bossMemorials.clear();
        data.bossMemorials.forEach(memorial => {
            this.bossMemorials.set(memorial.bossId, memorial);
        });
        
        // 記念品を生成
        this.updateTrophiesFromMemorials();
    }
    
    /**
     * 記念品のデータを記念品から更新
     * - 各記念品の取得日時をバトル記録から更新
     * - 勝利/敗北の記念品を適切に設定
     */
    private updateTrophiesFromMemorials(): void {
        // 各記念品の dateObtained を更新
        for (const trophy of this.trophies.values()) {
            const memorial = this.bossMemorials.get(trophy.bossId);
            if (memorial) {
                switch (trophy.type) {
                    case TrophyType.Victory:
                        trophy.dateObtained = memorial.dateFirstWin || null;
                        break;
                    case TrophyType.Defeat:
                        trophy.dateObtained = memorial.dateFirstLost || null;
                        break;
                    default:
                        trophy.dateObtained = null; // 不明なタイプはnull
                }
            }
        }
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
    
    /**
     * 進行度スコアを計算
     * - 倒したボスの種類 × 10点
     * - 負けたボスの種類 × 10点
     * @return 現在の進行度スコア
     */
    public calculateProgressScore(): number {
        let score = 0;
        
        // 勝利したボスの種類数 × 10点
        const victoriousBossIds = this.getVictoriousBossIds();
        score += victoriousBossIds.length * 10;
        
        // 敗北したボスの種類数 × 10点
        const defeatedBossIds = this.getDefeatedBossIds();
        score += defeatedBossIds.length * 10;
        
        return score;
    }
    
    /**
     * 最大可能スコアを取得
     * @return 最大可能進行度スコア
     */
    public static getMaximumScore(): number {
        const allBosses = getAllBossData();
        const maxBossVictoryScore = allBosses.length * 10; // 全ボス勝利
        const maxBossDefeatScore = allBosses.length * 10;  // 全ボス敗北
        
        return maxBossVictoryScore + maxBossDefeatScore;
    }
}