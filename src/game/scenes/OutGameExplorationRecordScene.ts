import { Game } from '../Game';
import { BaseOutGameScene } from './BaseOutGameScene';
import { AbilityType, AbilitySystem, AbilityData } from '../systems/AbilitySystem';
import { getAllBossData } from '../data';
import { MemorialSystem } from '../systems/MemorialSystem';
import { TrophyDisplayComponent } from './components/TrophyDisplayComponent';
import { Player } from '../entities/Player';
import { ModalUtils } from '../utils/ModalUtils';

// 拡張されたアビリティデータ型（experienceToNextを含む）
interface ExtendedAbilityData extends AbilityData {
    experienceToNext: number;
}

interface GameProgressionData {
    currentScore: number;
    maxScore: number;
    ratio: number;
}

export class OutGameExplorationRecordScene extends BaseOutGameScene {
    
    // CSS class constants
    private static readonly PROGRESS_BAR_WARNING = 'progress-bar bg-warning progress-bar-striped progress-bar-animated';
    private static readonly PROGRESS_BAR_INFO = 'progress-bar bg-info';
    
    constructor(game: Game) {
        super(game, 'out-game-exploration-record-screen');
    }
    
    /**
     * シーンに入った時の処理
     */
    enter(): void {
        console.log('Entered OutGameExplorationRecordScene');
        
        // ナビゲーションバーのアクティブ状態更新
        this.updateNavigationActiveState();
        
        // 探検記録を更新
        this.updateExplorationRecord();
    }
    
    /**
     * 探検記録の更新
     */
    private updateExplorationRecord(): void {
        const player = this.game.getPlayer();
        const abilityLevels = player.getAbilityLevels();
        const explorerData = abilityLevels[AbilityType.Explorer];
        
        if (explorerData) {
            this.updateElement('second-explorer-level', explorerData.level.toString());
            this.updateElement('second-explorer-exp', explorerData.experience.toString());
            
            // 次レベル要求表示を更新
            if (explorerData.level >= AbilitySystem.MAX_LEVEL) {
                // 最大レベル: 最大レベルに必要な総経験値を表示
                const maxLevelRequirement = player.abilitySystem.getRequiredExperienceForLevel(AbilitySystem.MAX_LEVEL);
                this.updateElement('second-explorer-next', maxLevelRequirement.toString());
            } else {
                this.updateElement('second-explorer-next', (explorerData.experience + explorerData.experienceToNext).toString());
            }
            
            // プログレスバー更新
            this.updateAbilityProgressBar('second-explorer', explorerData, player.abilitySystem);

            // アクセス可能な地形を更新
            this.updateAccessibleTerrains(player.getAccessibleTerrains());
        }
        
        // 統計情報
        const allBossData = getAllBossData();
        const unlockedCount = allBossData.filter(boss => 
            boss.explorerLevelRequired || 0 <= player.getExplorerLevel()
        ).length;
        this.updateElement('unlocked-bosses-count', unlockedCount.toString());
        this.updateElement('unlockable-bosses-count', allBossData.length.toString());
        
        const earnedTrophies = player.memorialSystem.getEarnedTrophies();
        this.updateElement('total-trophies-count', earnedTrophies.length.toString());
        
        const totalExplorerExp = explorerData?.experience || 0;
        this.updateElement('total-explorer-exp', totalExplorerExp.toString());
        
        // ゲーム進行度情報
        this.updateGameProgressionData(player);
        
        // トロフィーコレクションの更新
        this.updateTrophiesCollection(player);
    }
    
    /**
     * アビリティプログレスバーの更新
     */
    private updateAbilityProgressBar(prefix: string, data: ExtendedAbilityData, abilitySystem: AbilitySystem): void {
        const progressElement = document.getElementById(`${prefix}-progress`);
        if (!progressElement) return;
        
        if (data.level >= AbilitySystem.MAX_LEVEL) {
            // 最大レベル: 100%プログレス（警告スタイル・ストライプ付き）
            progressElement.style.width = '100%';
            progressElement.className = OutGameExplorationRecordScene.PROGRESS_BAR_WARNING;
        } else if (data.experienceToNext > 0) {
            // 通常レベル進行
            const { percentage } = this.calculateExperienceData(data, abilitySystem);
            
            progressElement.style.width = `${percentage}%`;
            progressElement.className = OutGameExplorationRecordScene.PROGRESS_BAR_INFO;
        }
    }
    
    /**
     * TrophyDisplayComponentを使用したトロフィーコレクション表示の更新
     */
    private updateTrophiesCollection(player: Player): void {
        TrophyDisplayComponent.updateTrophiesCollection(
            'trophies-collection',
            'no-trophies-message',
            player
        );
    }
    
    /**
     * 複数のバッジでアクセス可能な地形を更新
     */
    private updateAccessibleTerrains(terrains: string[]): void {
        const container = document.getElementById('accessible-terrains-container');
        if (!container) return;
        
        // 既存のコンテンツをクリア
        container.innerHTML = '';
        
        // 地形カラーマッピング
        const terrainColors: { [key: string]: string } = {
            '近隣の地方': 'secondary',
            '砂漠': 'warning',
            '海': 'info',
            'ジャングル': 'success',
            '洞窟': 'dark',
            '遺跡': 'danger',
            '廃墟': 'danger',
            '寒冷地': 'light text-dark',
            '火山': 'danger',
            '天空': 'primary',
            '魔界': 'dark'
        };
        
        // 各地形のバッジを作成
        terrains.forEach(terrain => {
            const badge = document.createElement('span');
            const colorClass = terrainColors[terrain] || 'secondary';
            badge.className = `badge bg-${colorClass} fs-6 me-2`;
            badge.textContent = terrain;
            container.appendChild(badge);
        });
    }
    
    /**
     * プログレスバー用の経験値データ計算
     */
    private calculateExperienceData(data: ExtendedAbilityData, abilitySystem: AbilitySystem): { currentLevelExp: number; levelRangeExp: number; percentage: number } {
        const currentLevelRequirement = abilitySystem.getRequiredExperienceForLevel(data.level);
        const nextLevelRequirement = abilitySystem.getRequiredExperienceForLevel(data.level + 1);
        const currentLevelExp = data.experience - currentLevelRequirement;
        const levelRangeExp = nextLevelRequirement - currentLevelRequirement;
        const percentage = (currentLevelExp / levelRangeExp) * 100;
        
        return { currentLevelExp, levelRangeExp, percentage };
    }
    
    /**
     * ゲーム進行度データの更新
     */
    private updateGameProgressionData(player: Player): void {
        try {
            // Playerデータの整合性チェック
            if (!player?.memorialSystem || !player?.abilitySystem) {
                console.warn('Player data is incomplete for progress display');
                return;
            }
            
            const memorialSystem = player.memorialSystem;
            const abilitySystem = player.abilitySystem;
            
            // 進行度詳細を一度に計算
            const progressDetails = this.calculateProgressDetails(abilitySystem, memorialSystem);

            // UI更新
            this.updateElement('progress-percentage', `${(progressDetails.ratio * 100).toFixed(1)}%`);

            // プログレスバー更新
            this.updateGameProgressionScoreBar(progressDetails.ratio);
        } catch (error) {
            console.error('Failed to update progress data:', error);
            ModalUtils.showToast('進行度表示の更新に失敗しました', 'エラー', 'error');
        }
    }
    
    /**
     * ゲーム進行度を計算
     * 計算ロジック:
     * - アビリティの進行度スコア
     * - 記念品の進行度スコア
     * - 合計スコアと最大スコアの比率
     */
    private calculateProgressDetails(abilitySystem: AbilitySystem, memorialSystem: MemorialSystem): GameProgressionData {
        const currentScoreAbilities = abilitySystem.calculateProgressScore();
        const maxScoreAbilities = AbilitySystem.getMaximumScore();

        const currentScoreMemorial = memorialSystem.calculateProgressScore();
        const maxScoreMemorial = MemorialSystem.getMaximumScore();
        
        const totalScore = currentScoreAbilities + currentScoreMemorial;
        const totalMaxScore = maxScoreAbilities + maxScoreMemorial;
        
        return {
            currentScore: totalScore,
            maxScore: totalMaxScore,
            ratio: totalScore / totalMaxScore
        };
    }
    
    /**
     * プログレスバーの更新
     */
    private updateGameProgressionScoreBar(ratio: number): void {
        const progressBarElement = document.getElementById('progress-game-score');
        if (progressBarElement) {
            progressBarElement.style.width = `${ratio * 100}%`;
            progressBarElement.setAttribute('aria-valuenow', (ratio * 100).toString());
        } else {
            console.warn('Progress bar element not found');
        }
    }
    
    /**
     * 要素のテキストコンテンツを更新するヘルパーメソッド
     */
    private updateElement(id: string, value: string): void {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
}