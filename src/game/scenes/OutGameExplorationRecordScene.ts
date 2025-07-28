import { Game } from '../Game';
import { BaseOutGameScene } from './BaseOutGameScene';
import { AbilityType, AbilitySystem, AbilityData } from '../systems/AbilitySystem';
import { getAllBossData } from '../data';
import { Trophy } from '../systems/MemorialSystem';
import { TrophyDisplayComponent } from './components/TrophyDisplayComponent';

// 拡張されたアビリティデータ型（experienceToNextを含む）
interface ExtendedAbilityData extends AbilityData {
    experienceToNext: number;
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
            this.updateElement('explorer-level', explorerData.level.toString());
            this.updateElement('explorer-exp', explorerData.experience.toString());
            
            // 次レベル要求表示を更新
            if (explorerData.level >= AbilitySystem.MAX_LEVEL) {
                // 最大レベル: 最大レベルに必要な総経験値を表示
                const maxLevelRequirement = player.abilitySystem.getRequiredExperienceForLevel(AbilitySystem.MAX_LEVEL);
                this.updateElement('explorer-next', maxLevelRequirement.toString());
            } else {
                this.updateElement('explorer-next', (explorerData.experience + explorerData.experienceToNext).toString());
            }
            
            // プログレスバー更新
            this.updateProgressBar('explorer', explorerData, player.abilitySystem);
            
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
        
        const allTrophies = player.memorialSystem.getAllTrophies();
        this.updateElement('total-trophies-count', allTrophies.length.toString());
        
        const totalExplorerExp = explorerData?.experience || 0;
        this.updateElement('total-explorer-exp', totalExplorerExp.toString());
        
        // トロフィーコレクションの更新
        this.updateTrophiesCollection(allTrophies);
    }
    
    /**
     * プログレスバーの更新
     */
    private updateProgressBar(prefix: string, data: ExtendedAbilityData, abilitySystem: AbilitySystem): void {
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
    private updateTrophiesCollection(trophies: Trophy[]): void {
        TrophyDisplayComponent.updateTrophiesCollection(
            'trophies-collection',
            'no-trophies-message',
            trophies
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
     * 要素のテキストコンテンツを更新するヘルパーメソッド
     */
    private updateElement(id: string, value: string): void {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
}