import { Game } from '../Game';
import { Player } from '../entities/Player';
import { Boss, ActionType } from '../entities/Boss';
import { StatusEffectType } from '../systems/StatusEffectTypes';
import { calculateAttackResult } from '../utils/CombatUtils';
import { BattleResultStatus, calculateBattleResult } from './BattleResultScene';
import { BattleUIManager } from './managers/BattleUIManager';
import { BattleActionManager } from './managers/BattleActionManager';
import { BattleDebugManager } from './managers/BattleDebugManager';
import { BattleMessageComponent } from './components/BattleMessageComponent';
import { BattleEventHandler, EventCallbacks } from './utils/BattleEventHandler';
import { PLAYER_ITEMS } from '../data/PlayerItems';
import { StatusEffectManager } from '../systems/StatusEffect';
import { ItemUseResult } from '../entities/PlayerItemManager';

/**
 * 戦闘画面を定義するクラス
 * 戦闘フロー制御に専念し、UI更新・イベント処理・デバッグ機能は各マネージャーに委譲
 */
export class BattleScene {
    /**
     * The main game instance that this scene belongs to.
     */
    private game: Game;
    
    /**
     * The player character in the battle.
     */
    private player: Player | null = null;
    
    /**
     * The current boss being fought in the battle.
     */
    private boss: Boss | null = null;
    
    /**
     * Tracks the current round number in the battle sequence.
     */
    private roundCount: number = 0;
    
    /**
     * Indicates whether it is currently the player's turn.
     */
    private playerTurn: boolean = true;
    
    /**
     * Indicates whether the battle has ended.
     */
    private battleEnded: boolean = false;
    
    // Battle statistics for experience calculation
    private battleStats = {
        damageDealt: 0,
        damageTaken: 0,
        mpSpent: 0,
        craftworkExperience: 0,
        agilityExperience: 0
    };
    
    // Manager and component instances
    private uiManager!: BattleUIManager;
    private actionManager!: BattleActionManager;
    private debugManager?: BattleDebugManager;
    private messageComponent!: BattleMessageComponent;
    private eventHandler!: BattleEventHandler;
    
    constructor(game: Game) {
        this.game = game;
        this.initializeManagersAndComponents();
        this.setupEventHandlers();
    }
    
    /**
     * マネージャーとコンポーネントの初期化
     */
    private initializeManagersAndComponents(): void {
        this.uiManager = new BattleUIManager();
        this.actionManager = new BattleActionManager();
        this.messageComponent = new BattleMessageComponent();
        
        // Debug manager is only initialized in debug mode
        if (this.game.isDebugMode()) {
            this.debugManager = new BattleDebugManager();
        }
        
        // Initialize event handler with callbacks
        const callbacks: EventCallbacks = {
            // Basic actions
            onAttack: () => this.playerAttack(),
            onDefend: () => this.playerDefend(),
            onShowSkillPanel: () => this.actionManager.showSkillPanel(),
            onShowItemPanel: () => this.actionManager.showItemPanel(),
            
            // Skills
            onUseSkill: (skillId: string) => this.useSkill(skillId),
            onHideSkillPanel: () => this.actionManager.hideSkillPanel(),
            
            // Items
            onUseItem: (itemName: string) => this.useItem(itemName),
            onHideItemPanel: () => this.actionManager.hideItemPanel(),
            
            // Special actions
            onStruggle: () => this.playerStruggle(),
            onStayStill: () => this.playerStayStill(),
            onGiveUp: () => this.playerGiveUp(),
            
            // Battle end
            onFinalizeBattle: () => this.finalizeBattle(),
            
            // Debug
            onShowDebugModal: () => this.showDebugModal(),
            onApplyDebugChanges: () => this.applyDebugChanges(),
            onAddPlayerStatus: () => this.showAddStatusEffectDialog('player'),
            onAddBossStatus: () => this.showAddStatusEffectDialog('boss'),
            onAddCustomVar: () => this.showAddCustomVarDialog(),
            
            // Boss Info
            onShowBossInfo: () => this.showBossInfoModal()
        };
        
        this.eventHandler = new BattleEventHandler(callbacks);
    }
    
    /**
     * イベントハンドラーの設定
     */
    private setupEventHandlers(): void {
        this.eventHandler.setupEventListeners();
    }
    
    enter(): void {
        this.player = this.game.getPlayer();
        this.boss = this.game.getCurrentBoss();
        
        if (!this.player || !this.boss) {
            console.error('Player or boss not found');
            return;
        }
        
        // Set agility experience callback
        this.player.agilityExperienceCallback = (amount: number) => {
            this.addAgilityExperience(amount);
        };
        
        // Set "Round 0" to make pre-battle state
        this.roundCount = 0;
        this.playerTurn = false;
        this.battleEnded = false;
        
        // Reset battle statistics
        this.battleStats = {
            damageDealt: 0,
            damageTaken: 0,
            mpSpent: 0,
            craftworkExperience: 0,
            agilityExperience: 0
        };
        
        // Reset battle-specific state for safety
        this.player.resetBattleState();
        this.boss.resetBattleState();
        
        // Reset boss skill tracking for Explorer experience calculation
        this.boss.resetUsedSkillNames();

        // Clear battle log
        this.messageComponent.clearBattleLog();
        
        // Show battle start message
        this.messageComponent.showBattleStartMessages(this.boss);
        
        // Now it's time to start the battle
        this.roundCount = 1;
        this.playerTurn = true;
        this.messageComponent.addRoundDivider(1);
        this.updateUI();
    }
    
    /**
     * UI全体の更新
     */
    private updateUI(): void {
        if (!this.player || !this.boss) return;
        
        // Update UI through managers
        this.uiManager.updateAllUI(this.player, this.boss);
        this.actionManager.updateActionAvailability(this.player, this.boss, this.playerTurn, this.battleEnded);
        this.actionManager.updateBasicActionButtons(this.player);
        this.actionManager.updateSkillButtonVisibility(this.player, this.playerTurn);
        this.actionManager.updateDebugButtonVisibility(this.game.isDebugMode());
        
        // Update omamori button in special actions panel
        this.uiManager.updateOmamoriInSpecialActions(this.player);
        
        // Setup dynamic item event listeners
        this.setupDynamicItemEventListeners();
        this.setupOmamoriEventListener();
    }
    
    /**
     * 動的アイテムのイベントリスナーを設定
     */
    private setupDynamicItemEventListeners(): void {
        if (!this.player) return;
        
        PLAYER_ITEMS.forEach(itemData => {
            // Skip items that already have static buttons
            if (['heal-potion', 'adrenaline', 'energy-drink'].includes(itemData.id)) {
                return;
            }
            
            const itemCount = this.player!.getItemCount(itemData.id);
            if (itemCount > 0) {
                this.eventHandler.addDynamicItemListener(itemData.id, () => this.useItem(itemData.id));
            }
        });
    }
    
    /**
     * おまもりのイベントリスナーを設定
     */
    private setupOmamoriEventListener(): void {
        this.eventHandler.addOmamoriListener(() => this.useItem('omamori'));
    }
    
    /**
     * プレイヤー攻撃
     */
    private playerAttack(): void {
        if (!this.player || !this.boss || !this.playerTurn) return;
        
        const baseDamage = this.player.getAttackPower();
        const accuracyModifier = this.player.statusEffects.getAccuracyModifier();
        const attackResult = calculateAttackResult(
            baseDamage,
            false,
            1.0,
            0.05,
            undefined,
            undefined,
            accuracyModifier
        );
        
        this.messageComponent.addBattleLogMessage(`${this.player.name}の攻撃！`, 'system', 'player');
        
        if (attackResult.isMiss) {
            this.messageComponent.addBattleLogMessage(`しかし攻撃は外れた！`, 'system', 'player');
        } else {
            const actualDamage = this.boss.takeDamage(attackResult.damage);
            this.battleStats.damageDealt += actualDamage;
            
            if (attackResult.isCritical) {
                this.messageComponent.addBattleLogMessage(`会心の一撃！ ${this.boss.displayName}に${actualDamage}のダメージ！`, 'damage', 'player');
            } else {
                this.messageComponent.addBattleLogMessage(`${this.boss.displayName}に${actualDamage}のダメージ！`, 'damage', 'player');
            }
        }
        
        this.updateUI();
        this.endPlayerTurn();
    }
    
    /**
     * プレイヤー防御
     */
    private playerDefend(): void {
        this.useSkill('defend');
    }
    
    /**
     * スキル使用
     */
    private useSkill(skillId: string): void {
        if (!this.player || !this.boss || !this.playerTurn) return;
        
        const result = this.player.useSkill(skillId, this.boss);
        
        if (result.success) {
            this.messageComponent.addBattleLogMessage(result.message, 'system', 'player');
            
            // Track MP spent for experience
            const mpConsumed = result.mpConsumed;
            if (mpConsumed) {
                this.battleStats.mpSpent += mpConsumed;
            }
            
            // Check if this was a successful struggle skill that broke restraint
            if (skillId === 'struggle' && result.success) {
                this.boss.onRestraintBroken();
                this.messageComponent.addBattleLogMessage(`${this.boss.displayName}は反動で動けなくなった！`, 'system', 'boss');
            }
            
            // Apply damage if applicable with custom variance
            if (result.damage && result.damage > 0) {
                const skills = this.player.getAvailableSkills();
                const skill = skills.find(s => s.id === skillId);
                
                let finalDamage = result.damage;
                const accuracyModifier = this.player.statusEffects.getAccuracyModifier();
                if (skill && skill.damageVarianceMin !== undefined && skill.damageVarianceMax !== undefined) {
                    const attackResult = calculateAttackResult(
                        result.damage, 
                        false,
                        skill.hitRate,
                        skill.criticalRate,
                        skill.damageVarianceMin,
                        skill.damageVarianceMax,
                        accuracyModifier
                    );
                    finalDamage = attackResult.damage;
                    
                    if (attackResult.isCritical) {
                        this.messageComponent.addBattleLogMessage(`${result.message} ${attackResult.message}`, 'system', 'player');
                    }
                } else {
                    const attackResult = calculateAttackResult(result.damage, false, undefined, undefined, undefined, undefined, accuracyModifier);
                    finalDamage = attackResult.damage;
                    
                    if (attackResult.isCritical) {
                        this.messageComponent.addBattleLogMessage(`${result.message} ${attackResult.message}`, 'system', 'player');
                    }
                }
                
                const actualDamage = this.boss.takeDamage(finalDamage);
                this.battleStats.damageDealt += actualDamage;
                this.messageComponent.addBattleLogMessage(`${this.boss.displayName}に${actualDamage}のダメージ！`, 'damage', 'player');
            }
        } else {
            this.messageComponent.addBattleLogMessage(result.message, 'system', 'player');
        }

        this.actionManager.hideSkillPanel();
        this.updateUI();
        this.endPlayerTurn();
    }
    
    /**
     * アイテム使用
     */
    private useItem(itemName: string): void {
        if (!this.player || !this.playerTurn) return;
        
        const result = this.player.useItem(itemName);
        
        if (result.success) {
            const itemDisplayNames: { [key: string]: string } = {
                'heal-potion': '回復薬',
                'adrenaline': 'アドレナリン注射',
                'energy-drink': '元気ドリンク',
                'elixir': 'エリクサー',
                'omamori': 'おまもり'
            };
            const itemDisplayName = itemDisplayNames[itemName] || itemName;
            
            // Get experience gain from the item data instead of hardcoded value
            const item = this.player.itemManager.getItem(itemName);
            const experienceGain = item?.experienceGain || 10; // fallback to 10 if not found
            this.battleStats.craftworkExperience += experienceGain;
            this.messageComponent.addBattleLogMessage(`${this.player.name}は${itemDisplayName}を使った！`, 'heal', 'player');
            
            // Display detailed effects
            this.displayItemEffects(result);
            
            this.actionManager.hideItemPanel();
            this.updateUI();
        } else {
            const itemDisplayNames: { [key: string]: string } = {
                'heal-potion': '回復薬',
                'adrenaline': 'アドレナリン注射',
                'energy-drink': '元気ドリンク',
                'elixir': 'エリクサー',
                'omamori': 'おまもり'
            };
            const itemDisplayName = itemDisplayNames[itemName] || itemName;
            this.messageComponent.addBattleLogMessage(`${itemDisplayName}を使用できない！`, 'system', 'player');
        }
    }

    /**
     * アイテム効果の詳細メッセージを表示
     */
    private displayItemEffects(result: ItemUseResult): void {
        if (!this.player) return;

        // HP回復メッセージ
        if (result.healedHp && result.healedHp > 0) {
            this.messageComponent.addBattleLogMessage(`HPが${result.healedHp}回復した！`, 'heal', 'player');
        }

        // MP回復メッセージ
        if (result.recoveredMp && result.recoveredMp > 0) {
            this.messageComponent.addBattleLogMessage(`MPが${result.recoveredMp}回復した！`, 'heal', 'player');
        }

        // 状態異常解除メッセージ
        if (result.removedStatusEffects && result.removedStatusEffects.length > 0) {
            result.removedStatusEffects.forEach(statusType => {
                const message = StatusEffectManager.generateRemoveMessage(this.player!, statusType);
                if (message) {
                    this.messageComponent.addBattleLogMessage(message, 'status-effect', 'player');
                }
            });
        }

        // 状態異常付与メッセージ
        if (result.addedStatusEffects && result.addedStatusEffects.length > 0) {
            result.addedStatusEffects.forEach(statusType => {
                const message = StatusEffectManager.generateApplyMessage(this.player!, statusType);
                if (message) {
                    this.messageComponent.addBattleLogMessage(message, 'status-effect', 'player');
                }
            });
        }
    }
    
    /**
     * プレイヤーもがく
     */
    private playerStruggle(): void {
        if (!this.player || !this.boss || !this.playerTurn) return;
        
        const success = this.player.attemptStruggle();
        
        if (success) {
            this.messageComponent.addBattleLogMessage(`${this.player.name}は拘束を振り切った！`, 'system', 'player');
            this.boss.onRestraintBroken();
            this.messageComponent.addBattleLogMessage(`${this.boss.displayName}は反動で動けなくなった！`, 'system', 'boss');
        } else {
            this.messageComponent.addBattleLogMessage(`${this.player.name}はもがいたが、拘束を抜けられなかった...`, 'system', 'player');
        }
        
        this.updateUI();
        this.endPlayerTurn();
    }
    
    /**
     * プレイヤーじっとする
     */
    private playerStayStill(): void {
        this.useSkill('stay-still');
    }
    
    /**
     * プレイヤー諦める
     */
    private playerGiveUp(): void {
        if (!this.player || !this.playerTurn) return;
        
        if (this.player.isDefeated()) {
            this.messageComponent.addBattleLogMessage('......', 'system', 'player');
        } else {
            this.messageComponent.addBattleLogMessage(`${this.player.name}は何もできない....`, 'system', 'player');
        }
        
        this.updateUI();
        this.endPlayerTurn();
    }
    
    /**
     * プレイヤーターン終了
     */
    private endPlayerTurn(): void {
        this.playerTurn = false;
        
        this.updateUI();
        if (!this.checkBattleEnd()) {
            setTimeout(() => {
                this.bossTurn();
            }, 1000);
        }
    }
    
    /**
     * ボスターン
     */
    private bossTurn(): void {
        if (!this.boss || !this.player) return;
        
        this.boss.startTurn();
        
        if (!this.boss.canAct()) {
            if (this.boss.isStunned()) {
                this.messageComponent.addBattleLogMessage(`${this.boss.displayName}は反動で動けない...`, 'system', 'boss');
            }
            this.endBossTurn();
            return;
        }
        
        if (this.player.statusEffects.isDoomed() && !this.player.isDefeated()
            && !this.boss.suppressAutoFinishingMove) {
            this.performFinishingMove();
            return;
        }
        
        const action = this.boss.selectAction(this.player, this.roundCount);
        
        if (action) {
            const playerHpBefore = this.player.hp;
            const messages = this.boss.executeAction(action, this.player, this.roundCount);
            
            if (this.player.hp < playerHpBefore) {
                this.battleStats.damageTaken += (playerHpBefore - this.player.hp);
            }
            
            messages.forEach(message => {
                this.messageComponent.addBattleLogMessage(message, action.type === ActionType.Attack ? 'damage' : 'status-effect', 'boss', this.boss ?? undefined);
            });
            
            if (this.player.hp === 0 && playerHpBefore > 0) {
                this.messageComponent.addBattleLogMessage(`${this.player.name}はダウンしてしまった！`, 'system');
            }
        }
        
        this.endBossTurn();
    }
    
    /**
     * ボスターン終了
     */
    private endBossTurn(): void {
        this.processRoundEnd();
        
        this.playerTurn = true;
        if (this.player) {
            this.player.startTurn();
        }
        
        this.updateUI();
        this.checkBattleEnd();
    }
    
    /**
     * ラウンド終了処理
     */
    private processRoundEnd(): void {
        if (this.player) {
            const playerMessages = this.player.processRoundEnd();
            playerMessages.forEach(message => {
                this.messageComponent.addBattleLogMessage(message, 'status-effect', 'player');
            });
        }
        
        if (this.boss) {
            const bossMessages = this.boss.processRoundEnd();
            bossMessages.forEach(message => {
                this.messageComponent.addBattleLogMessage(message, 'status-effect', 'boss');
            });
        }
        
        this.roundCount++;
        this.messageComponent.addRoundDivider(this.roundCount);
    }
    
    /**
     * バトル終了チェック
     */
    private checkBattleEnd(): boolean {
        if (!this.player || !this.boss) return false;
        
        if (this.boss.isDefeated()) {
            this.messageComponent.showVictoryMessages(this.boss);
            this.messageComponent.addBattleLogMessage('「バトル終了」ボタンを押して結果を確認してください。', 'system');
            
            this.battleEnded = true;
            this.updateUI();
            
            return true;
        }
        
        return false;
    }
    
    /**
     * バトル終了処理
     */
    private finalizeBattle(): void {
        if (!this.player || !this.boss) {
            console.error('BattleScene: finalizeBattle called without player or boss set');
            this.game.returnToBossSelect();
            return;
        }
        
        const hasActivity = this.battleStats.damageDealt > 0 ||
            this.battleStats.damageTaken > 0 ||
            this.battleStats.mpSpent > 0 ||
            this.battleStats.agilityExperience > 0 ||
            this.battleStats.craftworkExperience > 0;

        if (!hasActivity) {
            this.game.returnToBossSelect();
            return;
        }

        let status: BattleResultStatus;
        if (this.boss.isDefeated()) {
            status = BattleResultStatus.Victory;
        } else if (this.player.isDefeated()) {
            status = BattleResultStatus.Defeat;
        } else {
            status = BattleResultStatus.Interrupted;
        }
        
        const battleResult = calculateBattleResult(
            this.player,
            this.boss,
            status,
            this.battleStats.damageDealt,
            this.battleStats.damageTaken,
            this.battleStats.mpSpent,
            this.battleStats.craftworkExperience,
            this.battleStats.agilityExperience,
            this.boss.getUsedSkillNames()
        );
        this.game.showBattleResult(battleResult);
    }
    
    /**
     * アジリティ経験値追加
     */
    public addAgilityExperience(amount: number): void {
        this.battleStats.agilityExperience += amount;
    }
    
    /**
     * ボスのフィニッシュ技実行
     */
    private performFinishingMove(): void {
        if (!this.boss || !this.player) return;
        
        if (this.boss.finishingMove) {
            const messages = this.boss.finishingMove();
            messages.forEach(message => {
                this.messageComponent.addFormattedMessage(
                    message,
                    this.boss?.displayName ?? '',
                    this.player?.name ?? '',
                    'system',
                    'boss',
                    this.boss ?? undefined
                );
            });
        } else {
            this.messageComponent.addBattleLogMessage(`${this.boss.displayName}のトドメ攻撃！`, 'damage', 'boss');
            this.messageComponent.addBattleLogMessage(`${this.player.name}にとって致命的な一撃だった...`, 'system');
        }
        
        this.player.statusEffects.removeEffect(StatusEffectType.Doomed);
        this.player.statusEffects.addEffect(StatusEffectType.Dead);
        
        this.endBossTurn();
    }
    
    // Debug methods - delegate to debug manager
    private showDebugModal(): void {
        if (this.debugManager && this.player && this.boss) {
            this.debugManager.showDebugModal(this.player, this.boss);
        }
    }
    
    private applyDebugChanges(): void {
        if (this.debugManager && this.player && this.boss) {
            this.debugManager.applyDebugChanges(this.player, this.boss);
            this.updateUI();
        }
    }
    
    private async showAddStatusEffectDialog(target: 'player' | 'boss'): Promise<void> {
        if (this.debugManager) {
            await this.debugManager.showAddStatusEffectDialog(target, this.player ?? undefined, this.boss ?? undefined);
        }
    }
    
    private async showAddCustomVarDialog(): Promise<void> {
        if (this.debugManager && this.boss) {
            await this.debugManager.showAddCustomVarDialog(this.boss);
        }
    }
    
    /**
     * ボス情報モーダルを表示
     */
    private showBossInfoModal(): void {
        if (this.uiManager && this.boss) {
            this.uiManager.showBossInfoModal(this.boss);
        }
    }
}