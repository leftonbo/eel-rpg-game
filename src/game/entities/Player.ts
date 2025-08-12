import { StatusEffectType } from '../systems/StatusEffect';
import { AbilitySystem, AbilityType, Equipment } from '../systems/AbilitySystem';
import { PlayerSaveManager, PlayerSaveData } from '../systems/PlayerSaveData';
import { updatePlayerItems } from '../data/PlayerItems';
import { Actor } from './Actor';
import { SkillRegistry, SkillData } from '../data/skills';
import { MemorialSystem } from '../systems/MemorialSystem';
import { SkillStrategyFactory } from './SkillStrategy';
import { PlayerEquipmentManager } from './PlayerEquipmentManager';
import { ItemUseResult, PlayerItemManager } from './PlayerItemManager';
import { PlayerBattleActions } from './PlayerBattleActions';
import { PlayerProgressionManager } from './PlayerProgressionManager';
import * as PlayerConstants from './PlayerConstants';
import { getLatestChangelogIndex } from '../data/ChangelogLoader';
import { ChangelogConstants } from '../constants/ChangelogConstants';


export interface SkillResult {
    success: boolean;
    mpConsumed?: number; // Only for skills that consume MP
    message: string;
    damage?: number; // Only for attack skills
}

// 下位互換性のための定数の再エクスポート
export const DEFAULT_PLAYER_NAME = PlayerConstants.DEFAULT_PLAYER_NAME;
export const DEFAULT_PLAYER_ICON = PlayerConstants.DEFAULT_PLAYER_ICON;

export class Player extends Actor {
    public name: string = DEFAULT_PLAYER_NAME;
    public icon: string = DEFAULT_PLAYER_ICON;
    
    // Base stats (before equipment/abilities)
    public baseMaxHp: number = PlayerConstants.BASE_MAX_HP;
    public baseMaxMp: number = PlayerConstants.BASE_MAX_MP;
    public baseAttackPower: number = PlayerConstants.BASE_ATTACK_POWER;
    
    // Agility experience callback
    public agilityExperienceCallback?: (amount: number) => void;
    public isDefending: boolean = false;
    public struggleAttempts: number = 0; // For restrain escape probability
    
    // Ability and equipment system
    public abilitySystem: AbilitySystem = new AbilitySystem();
    public memorialSystem: MemorialSystem = new MemorialSystem();
    public equipmentManager: PlayerEquipmentManager;
    public itemManager: PlayerItemManager = new PlayerItemManager();
    public battleActions: PlayerBattleActions;
    public progressionManager: PlayerProgressionManager;
    
    // Library read flag
    public readDocuments: Set<string> = new Set(); // Store read document IDs
    
    // Changelog index
    public shownChangelogIndex: number = -1; // Index of the latest changelog entry shown

    constructor() {
        super(DEFAULT_PLAYER_NAME);
        this.equipmentManager = new PlayerEquipmentManager(this.abilitySystem);
        this.battleActions = new PlayerBattleActions(this);
        this.progressionManager = new PlayerProgressionManager(this.abilitySystem);

        // Safety stats recalculation
        this.resetBattleState();
    }

    /**
     * 初期化メソッド
     */
    public lateInitialize(): void {
        // Initialize MemorialSystem for trophies
        this.memorialSystem.lateInitialize();
        
        this.loadFromSave();
        this.initializeDefaultUnlocks();
        this.initializeItems();
        this.recalculateStats();
    }
    
    /**
     * リブート時に呼び出される
     */
    public onReboot(): void {
        this.loadFromSave();
        this.initializeDefaultUnlocks();
        this.initializeItems();
        this.recalculateStats();
    }
    
    /**
     * ローカルストレージからプレイヤーデータを読み込む
     */
    private loadFromSave(): void {
        const saveData = PlayerSaveManager.loadPlayerData();
        this.loadSaveDataComponents(saveData);
    }
    
    /**
     * セーブデータから全コンポーネントを読み込む
     * @param saveData セーブデータオブジェクト
     */
    private loadSaveDataComponents(saveData: PlayerSaveData): void {
        if (!saveData) {
            throw new Error('No player save data found');
        }
        
        this.loadAbilities(saveData.abilities);
        this.loadEquipment(saveData.equipment);
        this.loadMemorials(saveData.memorials);
        this.loadPlayerInfo(saveData.playerInfo);
        this.loadReadDocuments(saveData.readDocuments);

        this.shownChangelogIndex = saveData.shownChangelogIndex ?? ChangelogConstants.CHANGELOG_INDEX_INITIAL;
        if (this.shownChangelogIndex === ChangelogConstants.CHANGELOG_INDEX_INITIAL) {
            // set to current latest index
            this.shownChangelogIndex = getLatestChangelogIndex();
        }
    }
    
    /**
     * セーブデータからアビリティを読み込む
     * @param abilitiesData アビリティデータ
     */
    private loadAbilities(abilitiesData: any): void {
        this.abilitySystem.loadFromSaveData(abilitiesData);
    }
    
    /**
     * セーブデータから装備を読み込む
     * @param equipmentData 装備データ
     */
    private loadEquipment(equipmentData: any): void {
        this.equipmentManager.loadEquipment(equipmentData.weapon, equipmentData.armor, equipmentData.gloves, equipmentData.belt);
    }
    
    /**
     * セーブデータから記念品を読み込む
     * @param memorialsData 記念品データ
     */
    private loadMemorials(memorialsData: any): void {
        this.memorialSystem.importData(memorialsData || {});
    }
    
    /**
     * セーブデータからプレイヤー情報を読み込む
     * @param playerInfoData プレイヤー情報データ
     */
    private loadPlayerInfo(playerInfoData: any): void {
        if (playerInfoData) {
            this.name = playerInfoData.name;
            this.icon = playerInfoData.icon;
            this.displayName = playerInfoData.name;
        }
    }
    
    /**
     * セーブデータから既読文書を読み込む
     * @param readDocuments 既読文書IDの配列
     */
    private loadReadDocuments(readDocuments: string[]): void {
        if (Array.isArray(readDocuments)) {
            this.readDocuments = new Set(readDocuments);
        } else {
            this.readDocuments = new Set(); // Initialize as empty if not valid
        }
    }
    
    /**
     * プレイヤーデータをローカルストレージに保存
     */
    public saveToStorage(): void {
        const saveData: PlayerSaveData = {
            abilities: this.abilitySystem.exportForSave(),
            equipment: this.equipmentManager.exportEquipment(),
            memorials: this.memorialSystem.exportData(),
            playerInfo: {
                name: this.name,
                icon: this.icon
            },
            readDocuments: Array.from(this.readDocuments),
            shownChangelogIndex: this.shownChangelogIndex,
            version: PlayerSaveManager.CURRENT_VERSION
        };
        
        PlayerSaveManager.savePlayerData(saveData);
    }
    
    /**
     * アビリティと装備に基づいて全ステータスを再計算
     */
    public recalculateStats(): void {
        // Calculate HP with armor bonus
        const armorBonus = this.equipmentManager.getArmorHpBonus();
        this.maxHp = this.baseMaxHp + armorBonus;
        
        // Calculate MP with belt bonus
        const beltBonus = this.equipmentManager.getBeltMpBonus();
        this.maxMp = this.baseMaxMp + beltBonus;
        
        // Update items based on new ability levels
        updatePlayerItems(this);
    }
    
    /**
     * 基本スキルとアイテムのデフォルトアンロックを初期化
     */
    private initializeDefaultUnlocks(): void {
        // Default unlocks are now handled by ability-based calculation
        // No manual unlocking needed - skills/items derived from ability levels
    }
    
    private initializeItems(): void {
        // Initialize items based on ability levels
        updatePlayerItems(this);
    }
    
    
    /**
     * アビリティレベルから計算された現在のステータスでアンロックされた全スキルを取得
     * @returns アンロック済みスキルの配列
     */
    public getUnlockedSkills(): SkillData[] {
        const abilityLevels = this.getAbilityLevelsMap();
        const unlockedSkillIds = SkillRegistry.getUnlockedSkills(abilityLevels);
        
        return this.buildSkillsFromIds(unlockedSkillIds, abilityLevels);
    }
    
    /**
     * スキル計算用のアビリティレベルマップを取得
     * @returns アビリティタイプとレベルのマップ
     */
    private getAbilityLevelsMap(): Map<AbilityType, number> {
        const abilityLevels = new Map<AbilityType, number>();
        Object.values(AbilityType).forEach(type => {
            const ability = this.abilitySystem.getAbility(type);
            abilityLevels.set(type, ability?.level || 0);
        });
        return abilityLevels;
    }
    
    /**
     * スキルIDからスキルデータ配列を構築
     * @param skillIds スキルIDの配列
     * @param abilityLevels アビリティレベルマップ
     * @returns スキルデータの配列
     */
    private buildSkillsFromIds(skillIds: string[], abilityLevels: Map<AbilityType, number>): SkillData[] {
        const skills: SkillData[] = [];
        
        skillIds.forEach(skillId => {
            const skill = SkillRegistry.getUpgradedSkill(skillId, abilityLevels);
            if (skill) {
                skills.push(skill);
            }
        });
        
        return skills;
    }
    
    /**
     * アンロック済みパッシブスキルを取得
     * @returns パッシブスキルの配列
     */
    public getUnlockedPassiveSkills(): SkillData[] {
        const abilityLevels = this.getAbilityLevelsMap();
        return SkillRegistry.getUnlockedPassiveSkills(abilityLevels);
    }
    
    /**
     * アビリティレベルから計算して特定のスキルがアンロックされているかチェック
     * @param skillId スキルID
     * @returns アンロック済みの場合true
     */
    public hasSkill(skillId: string): boolean {
        const abilityLevels = this.getAbilityLevelsMap();
        const unlockedSkillIds = SkillRegistry.getUnlockedSkills(abilityLevels);
        return unlockedSkillIds.includes(skillId);
    }
    
    getAttackPower(): number {
        // Calculate base attack power with weapon
        const weaponBonus = this.equipmentManager.getWeaponAttackBonus();
        const baseWithWeapon = this.baseAttackPower + weaponBonus;
        
        // Apply status effect modifiers
        const statusModifier = this.statusEffects.getAttackModifier();
        return Math.round(baseWithWeapon * statusModifier);
    }
    
    /**
     * 武器を装備（アンロック済みの場合）
     * @param weaponId 武器ID
     * @returns 装備成功の場合true
     */
    public equipWeapon(weaponId: string): boolean {
        const success = this.equipmentManager.equipWeapon(weaponId);
        if (success) {
            this.recalculateStats();
            this.saveToStorage();
        }
        return success;
    }
    
    /**
     * 防具を装備（アンロック済みの場合）
     * @param armorId 防具ID
     * @returns 装備成功の場合true
     */
    public equipArmor(armorId: string): boolean {
        const success = this.equipmentManager.equipArmor(armorId);
        if (success) {
            this.recalculateStats();
            this.saveToStorage();
        }
        return success;
    }
    
    /**
     * 手袋を装備（アンロック済みの場合）
     * @param glovesId 手袋ID
     * @returns 装備成功の場合true
     */
    public equipGloves(glovesId: string): boolean {
        const success = this.equipmentManager.equipGloves(glovesId);
        if (success) {
            this.recalculateStats();
            this.saveToStorage();
        }
        return success;
    }
    
    /**
     * ベルトを装備（アンロック済みの場合）
     * @param beltId ベルトID
     * @returns 装備成功の場合true
     */
    public equipBelt(beltId: string): boolean {
        const success = this.equipmentManager.equipBelt(beltId);
        if (success) {
            this.recalculateStats();
            this.saveToStorage();
        }
        return success;
    }
    
    /**
     * 戦闘レベルに基づいて利用可能な武器を取得
     * @returns 利用可能な武器の配列
     */
    public getAvailableWeapons(): Equipment[] {
        return this.equipmentManager.getAvailableWeapons();
    }
    
    /**
     * 精神力レベルに基づいて利用可能な防具を取得
     * @returns 利用可能な防具の配列
     */
    public getAvailableArmors(): Equipment[] {
        return this.equipmentManager.getAvailableArmors();
    }
    
    /**
     * アジリティレベルに基づいて利用可能な手袋を取得
     * @returns 利用可能な手袋の配列
     */
    public getAvailableGloves(): Equipment[] {
        return this.equipmentManager.getAvailableGloves();
    }
    
    /**
     * エンデュランスレベルに基づいて利用可能なベルトを取得
     * @returns 利用可能なベルトの配列
     */
    public getAvailableBelts(): Equipment[] {
        return this.equipmentManager.getAvailableBelts();
    }
    
    /**
     * アビリティに経験値を追加
     * @param abilityType アビリティタイプ
     * @param amount 経験値量
     * @returns レベルアップ情報
     */
    public addExperience(abilityType: AbilityType, amount: number): { leveledUp: boolean; newLevel: number; previousLevel: number } {
        const result = this.progressionManager.addExperience(abilityType, amount);
        
        if (result.leveledUp) {
            this.recalculateStats(); // This will update items automatically
            this.saveToStorage(); // Auto-save on level up
        }
        
        return result;
    }
    
    
    heal(amount: number): number {
        if (amount <= 0) return 0;
        
        // Only heal if hp is below max
        if (this.hp >= this.maxHp) return 0;
        
        // Apply craftwork healing bonus
        const craftworkMultiplier = PlayerConstants.CRAFTWORK_HEALING_MULTIPLIER_BASE + this.abilitySystem.getCraftworkHealingBonus();
        const enhancedAmount = Math.round(amount * craftworkMultiplier);
        
        const oldHp = this.hp;
        this.hp = Math.min(this.maxHp, this.hp + enhancedAmount);
        
        // If healed from 0, remove knocked out status
        if (oldHp === 0 && this.hp > 0) {
            this.statusEffects.removeEffect(StatusEffectType.KnockedOut);
        }
        
        return this.hp - oldHp;
    }
    
    
    defend(): void {
        this.battleActions.defend();
    }
    
    useItem(itemName: string): ItemUseResult {
        return this.itemManager.useItem(itemName, this);
    }
    
    attemptStruggle(): boolean {
        return this.battleActions.attemptStruggle();
    }
    
    stayStill(): void {
        this.battleActions.stayStill();
    }
    
    
    
    
    
    startTurn(): void {
        // Call battle actions start turn
        this.battleActions.startTurn();
        
        // 食べられ状態でない場合、ターン開始時にマナ回復
        if (!this.statusEffects.isEaten() && this.maxMp > 0) {
            const mpRecovery = this.getMpRegenerateAmount();
            this.recoverMp(mpRecovery);
        }
    }

    /**
     * ターン開始時のマナ回復量を取得
     * 子クラスでオーバーライド可能
     * @returns マナ回復量（状態異常効果を含む）
     */
    getMpRegenerateAmount(): number {
        const baseRecovery = Math.floor(this.maxMp / 10);
        const modifier = this.statusEffects.getMpRegenerateModifier();
        return Math.floor(baseRecovery * modifier);
    }
    
    // Process all status effects at round end
    processRoundEnd(): string[] {
        const messages: string[] = [];
        
        // Call battle actions round end processing
        const battleMessages = this.battleActions.processRoundEnd();
        messages.push(...battleMessages);
        
        // Call parent processRoundEnd for status effect processing
        const parentMessages = super.processRoundEnd();
        messages.push(...parentMessages);
        
        return messages;
    }

    /**
     * Check if player is defeated
     */
    isDefeated(): boolean {
        // consider player defeated if marked as "dead"
        return this.statusEffects.isDead();
    }
    
    getAvailableSkills(): SkillData[] {
        const unlockedSkills = this.getUnlockedSkills();
        return unlockedSkills.filter(skill => this.canUseSkill(skill));
    }
    
    
    /**
     * スキルが使用可能かチェック
     * @param skillData スキルデータ
     * @returns 使用可能の場合true
     */
    private canUseSkill(skillData: SkillData): boolean {
        // Basic checks
        if (!this.statusEffects.canAct()) return false;
        
        // Special state checks
        if (this.isDefeated() || this.statusEffects.isDoomed() || this.statusEffects.isSleeping()) {
            return false;
        }
        
        // Skill-specific checks
        switch (skillData.id) {
            case 'power-attack':
            case 'ultra-smash':
                return this.statusEffects.canUseSkills();
            case 'struggle':
                return this.statusEffects.canUseSkills() && (this.statusEffects.isRestrained() || this.statusEffects.isEaten());
            case 'defend':
                return true;
            case 'stay-still':
                return this.statusEffects.isRestrained() || this.statusEffects.isEaten();
            default:
                return this.statusEffects.canUseSkills();
        }
    }
    
    /**
     * 新システムからスキルを使用
     * @param skillData スキルデータ
     * @param target ターゲット（オプション）
     * @returns スキル実行結果
     */
    private useSkillData(skillData: SkillData, target?: Actor): SkillResult {
        const strategy = SkillStrategyFactory.getStrategy(skillData.id);
        if (!strategy) {
            return { success: false, message: 'Unknown skill' };
        }
        
        return strategy.execute(this, skillData, target);
    }
    
    
    useSkill(skillId: string, target?: Actor): SkillResult {
        const skills = this.getAvailableSkills();
        const skill = skills.find(s => s.id === skillId);
        
        if (!skill) {
            return { success: false, message: 'そのスキルは使用できません' };
        }
        
        return this.useSkillData(skill, target);
    }
    
    
    getItemCount(itemName: string): number {
        return this.itemManager.getItemCount(itemName);
    }
    
    getStatusEffectsList(): string[] {
        return this.statusEffects.getAllEffects().map(effect => effect.name);
    }
    
    /**
     * 与えたダメージに基づいて戦闘経験値を追加
     * @param damageDealt 与えたダメージ量
     */
    public addCombatExperience(damageDealt: number): void {
        this.progressionManager.addCombatExperience(damageDealt);
    }
    
    /**
     * 現在の装備の表示情報を取得
     * @returns 武器、防具、手袋、ベルトの情報
     */
    public getEquipmentInfo(): { weapon: Equipment | null; armor: Equipment | null; gloves: Equipment | null; belt: Equipment | null } {
        return this.equipmentManager.getEquipmentInfo();
    }
    
    /**
     * 現在の探索者レベルを取得
     * @returns 探索者レベル
     */
    public getExplorerLevel(): number {
        return this.progressionManager.getExplorerLevel();
    }
    
    /**
     * 探索者レベルに基づいてアクセス可能な地形を取得
     * @returns アクセス可能な地形の配列
     */
    public getAccessibleTerrains(): string[] {
        return this.progressionManager.getAccessibleTerrains();
    }
    
    /**
     * 表示用のアビリティレベルを取得
     * @returns アビリティレベル情報のオブジェクト
     */
    public getAbilityLevels(): { [key: string]: { level: number; experience: number; experienceToNext: number } } {
        return this.progressionManager.getAbilityLevels();
    }

    
    /**
     * 防御ダメージが100%カットされるかチェック
     * @returns 100%カットの場合true
     */
    public shouldCutDefendDamage(): boolean {
        return this.battleActions.shouldCutDefendDamage();
    }
    
    /**
     * プレイヤー名とアイコンを更新
     * @param name プレイヤー名
     * @param icon アイコン
     */
    public updatePlayerInfo(name: string, icon: string): void {
        this.name = name;
        this.icon = icon;
        this.displayName = name; // Update Actor's displayName as well
        this.saveToStorage(); // Auto-save changes
    }

    /**
     * 進行状態を保持しながらバトル固有の状態をリセット
     */
    public resetBattleState(): void {
        // Call battle actions reset
        this.battleActions.resetBattleState();
        
        // Call parent resetBattleState for common processing
        super.resetBattleState();
    }
    
    /**
     * 文書を既読としてマーク
     * @param documentId 文書ID
     */
    public markDocumentAsRead(documentId: string): void {
        if (!this.readDocuments.has(documentId)) {
            this.readDocuments.add(documentId);
            this.saveToStorage(); // Auto-save on marking document as read
        }
    }
    
    /**
     * 既読済み文書IDの Set を取得
     * @returns 既読文書IDの Set
     */
    public getReadDocuments(): Set<string> {
        return this.readDocuments;
    }
    
    /**
     * 最新の更新履歴インデックスを取得
     * @returns 最新の更新履歴インデックス
     */
    public getLatestChangelogIndex(): number {
        return this.shownChangelogIndex;
    }
    
    /**
     * 更新履歴を表示した際にインデックスを更新
     * @param index 更新履歴インデックス
     */
    public updateShownChangelogIndex(index: number): void {
        this.shownChangelogIndex = index;
    }
    
    /**
     * 最強装備を一括装備（パフォーマンス最適化）
     * @returns 装備成功の場合true
     */
    public equipBestEquipments(): boolean {
        const bestEquipments = this.equipmentManager.getBestEquipments();
        const success = this.equipmentManager.equipMultipleInternal(bestEquipments);
        
        if (success) {
            this.recalculateStats();
            this.saveToStorage();
        }
        
        return success;
    }
    
    /**
     * 全装備を外す（最低レベル装備に変更、パフォーマンス最適化）
     * @returns 装備成功の場合true
     */
    public unequipAllEquipments(): boolean {
        const lowestEquipments = this.equipmentManager.getLowestEquipments();
        const success = this.equipmentManager.equipMultipleInternal(lowestEquipments);
        
        if (success) {
            this.recalculateStats();
            this.saveToStorage();
        }
        
        return success;
    }
}
