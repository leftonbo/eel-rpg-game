import { Game } from '../Game';
import { BaseOutGameScene } from './BaseOutGameScene';
import { AbilitySystem, AbilityData } from '../systems/AbilitySystem';
import { EquipmentSelectorComponent } from './components/EquipmentSelectorComponent';
import { SkillDisplayComponent } from './components/SkillDisplayComponent';
import { Player } from '@/game/entities/Player';
import { PlayerInfoEditManager } from './managers/PlayerInfoEditManager';

// 拡張されたアビリティデータ型（experienceToNextを含む）
interface ExtendedAbilityData extends AbilityData {
    experienceToNext: number;
}

export class OutGamePlayerDetailScene extends BaseOutGameScene {
    
    // CSS class constants
    private static readonly PROGRESS_BAR_WARNING = 'progress-bar bg-warning progress-bar-striped progress-bar-animated';
    private static readonly PROGRESS_BAR_INFO = 'progress-bar bg-info';
    
    private playerInfoEditManager: PlayerInfoEditManager; // Used in custom events
    
    constructor(game: Game) {
        super(game, 'out-game-player-detail-screen');
        this.playerInfoEditManager = new PlayerInfoEditManager(game);
        
        this.initPlayerDetail();
        
        // Suppress unused variable warnings - managers are initialized and handle their own events
        void this.playerInfoEditManager;
    }
    
    /**
     * 初期化処理
     */
    private initPlayerDetail(): void {
        // タブ切り替えイベントは Bootstrap が自動的に処理
        // プレイヤー情報編集ボタン
        const editPlayerInfoButton = document.getElementById('edit-player-info-btn');
        if (editPlayerInfoButton) {
            editPlayerInfoButton.addEventListener('click', () => {
                const event = new CustomEvent('showPlayerInfoEdit');
                document.dispatchEvent(event);
            });
        }
    }
    
    /**
     * シーンに入った時の処理
     */
    enter(): void {
        console.log('Entered OutGamePlayerDetailScene');
        
        // ナビゲーションバーのアクティブ状態更新
        this.updateNavigationActiveState();
        
        // プレイヤー詳細情報を更新
        this.updatePlayerDetails();
    }
    
    /**
     * プレイヤー詳細情報を更新
     */
    private updatePlayerDetails(): void {
        const player = this.game.getPlayer();
        const abilityLevels = player.getAbilityLevels();

        // プレイヤーモーダルヘッダー
        this.updateElement('player-detail-name', player.name);
        this.updateElement('player-detail-icon', player.icon);
        
        // ステータスタブ
        this.updatePlayerStatsTab(player, abilityLevels);
        
        // 装備タブ
        this.updateEquipmentSelections();
        
        // スキルタブ
        this.updateSkillsList();
        
        // アイテムタブ
        this.updateItemsList();
    }
    
    /**
     * プレイヤー統計タブの更新
     */
    private updatePlayerStatsTab(player: Player, abilityLevels: { [key: string]: ExtendedAbilityData }): void {
        this.updateElement('detail-max-hp', player.maxHp.toString());
        this.updateElement('detail-max-mp', player.maxMp.toString());
        this.updateElement('detail-attack', player.getAttackPower().toString());
        this.updateElement('detail-weapon-bonus', player.equipmentManager.getWeaponAttackBonus().toString());
        this.updateElement('detail-armor-bonus', player.equipmentManager.getArmorHpBonus().toString());
        
        // アビリティレベル
        Object.entries(abilityLevels).forEach(([abilityType, data]: [string, ExtendedAbilityData]) => {
            const prefix = abilityType.toLowerCase();
            this.updateElement(`${prefix}-level`, data.level.toString());
            this.updateElement(`${prefix}-exp`, data.experience.toString());
            
            // 次のレベル要求表示を更新
            if (data.level >= AbilitySystem.MAX_LEVEL) {
                // 最大レベル: 最大レベルに必要な総経験値を表示
                const maxLevelRequirement = this.getMaxLevelRequirement(player);
                this.updateElement(`${prefix}-next`, maxLevelRequirement.toString());
            } else {
                this.updateElement(`${prefix}-next`, (data.experience + data.experienceToNext).toString());
            }
            
            // プログレスバー更新
            this.updateProgressBar(prefix, data, player.abilitySystem);
            
            // エクスプローラーアビリティ特別処理
            if (abilityType === 'explorer') {
                this.updateExplorerStatsSection(data, player.abilitySystem);
            }
        });
    }
    
    /**
     * アビリティのプログレスバー更新
     */
    private updateProgressBar(prefix: string, data: ExtendedAbilityData, abilitySystem: AbilitySystem): void {
        const progressElement = document.getElementById(`${prefix}-progress`);
        if (!progressElement) return;
        
        if (data.level >= AbilitySystem.MAX_LEVEL) {
            // 最大レベル: 100%プログレス（警告スタイル・ストライプ付き）
            progressElement.style.width = '100%';
            progressElement.className = OutGamePlayerDetailScene.PROGRESS_BAR_WARNING;
        } else if (data.experienceToNext > 0) {
            // 通常レベル進行（AbilitySystemメソッド使用）
            const { percentage } = this.calculateExperienceData(data, abilitySystem);
            
            progressElement.style.width = `${percentage}%`;
            progressElement.className = OutGamePlayerDetailScene.PROGRESS_BAR_INFO;
        }
    }
    
    /**
     * エクスプローラー統計セクション更新
     */
    private updateExplorerStatsSection(data: ExtendedAbilityData, abilitySystem: AbilitySystem): void {
        this.updateElement('explorer-level-stats', data.level.toString());
        this.updateElement('explorer-exp-stats', data.experience.toString());
        
        // 統計セクションの次レベル要求表示を更新
        if (data.level >= AbilitySystem.MAX_LEVEL) {
            // 最大レベル: 最大レベルに必要な総経験値を表示
            const maxLevelRequirement = this.getMaxLevelRequirement(this.game.getPlayer());
            this.updateElement('explorer-next-stats', maxLevelRequirement.toString());
        } else {
            this.updateElement('explorer-next-stats', (data.experience + data.experienceToNext).toString());
        }
        
        const statsProgressElement = document.getElementById('explorer-progress-stats');
        if (statsProgressElement) {
            if (data.level >= AbilitySystem.MAX_LEVEL) {
                // 最大レベル: 100%プログレス（警告スタイル・ストライプ付き）
                statsProgressElement.style.width = '100%';
                statsProgressElement.className = OutGamePlayerDetailScene.PROGRESS_BAR_WARNING;
            } else if (data.experienceToNext > 0) {
                // 通常レベル進行（AbilitySystemメソッド使用）
                const { percentage } = this.calculateExperienceData(data, abilitySystem);
                
                statsProgressElement.style.width = `${percentage}%`;
                statsProgressElement.className = OutGamePlayerDetailScene.PROGRESS_BAR_INFO;
            }
        }
    }
    
    /**
     * 装備選択UIの更新
     */
    private updateEquipmentSelections(): void {
        const player = this.game.getPlayer();
        const availableWeapons = player.getAvailableWeapons();
        const availableArmors = player.getAvailableArmors();
        
        // 武器選択にEquipmentSelectorComponentを使用
        EquipmentSelectorComponent.updateWeaponSelection(
            'weapon-selection',
            availableWeapons,
            player.getEquipmentInfo().weapon?.id || null,
            (weaponId: string) => {
                player.equipWeapon(weaponId);
                // プレイヤー詳細を再更新
                this.updatePlayerDetails();
            }
        );
        
        // 防具選択にEquipmentSelectorComponentを使用
        EquipmentSelectorComponent.updateArmorSelection(
            'armor-selection',
            availableArmors,
            player.getEquipmentInfo().armor?.id || null,
            (armorId: string) => {
                player.equipArmor(armorId);
                // プレイヤー詳細を再更新
                this.updatePlayerDetails();
            }
        );
    }
    
    /**
     * アイテムリストUIの更新
     */
    private updateItemsList(): void {
        const player = this.game.getPlayer();
        const itemList = document.getElementById('item-list');
        
        if (itemList) {
            itemList.innerHTML = '';
            
            player.itemManager.getUsableItems().forEach((item) => {
                if (item.count > 0) {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'mb-2 p-2 border rounded';
                    itemDiv.innerHTML = `
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <strong>${item.name}</strong> x${item.count}
                                <br><small class="text-muted">${item.description}</small>
                            </div>
                        </div>
                    `;
                    itemList.appendChild(itemDiv);
                }
            });
        }
    }
    
    /**
     * スキルタブの更新
     */
    private updateSkillsList(): void {
        const player = this.game.getPlayer();
        const unlockedSkills = player.getUnlockedSkills();
        const unlockedPassiveSkills = player.getUnlockedPassiveSkills();
        
        // アクティブスキルにSkillDisplayComponentを使用
        SkillDisplayComponent.updateActiveSkillsList('active-skills-list', unlockedSkills);
        
        // パッシブスキルにSkillDisplayComponentを使用
        SkillDisplayComponent.updatePassiveSkillsList('passive-skills-list', unlockedPassiveSkills);
    }
    
    /**
     * 最大レベル経験値要求を取得
     */
    private getMaxLevelRequirement(player: Player): number {
        return player.abilitySystem.getRequiredExperienceForLevel(AbilitySystem.MAX_LEVEL);
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