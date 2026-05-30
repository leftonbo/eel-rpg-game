import { Boss } from '../../entities/Boss';
import { t } from '../../i18n';

/**
 * メッセージ進行データ
 * 話者、表示スタイル、テキストを定義
 */
export interface MessageData {
    /**
     * 話者
     * プレイヤー、ボス、システムメッセージのいずれか
     * 省略時は 'system' として扱う
     */
    speaker?: 'player' | 'boss' | 'system';
    /**
     * ダイアログスタイル (player, boss 時)
     * 'default' は通常のダイアログ (デフォルト)
     * 'talk' は会話風のスタイル
     */
    style?: 'default' | 'talk';
    /**
     * メッセージテキスト
     * */
    text: string;
}

/**
 * バトルメッセージ・ログ表示を管理するコンポーネント
 * バトルログへのメッセージ追加、ラウンド区切り表示、戦闘開始・勝利メッセージ表示を担当
 */
export class BattleMessageComponent {
    /**
     * The battle log element where messages are displayed.
     * This is used to show combat actions, results, and system messages.
     */
    private battleLog: HTMLElement | null = null;
    
    constructor() {
        this.initializeBattleLog();
    }
    
    /**
     * バトルログ要素の初期化
     */
    private initializeBattleLog(): void {
        this.battleLog = document.getElementById('battle-log');
    }

    private getBattleLog(): HTMLElement | null {
        if (!this.battleLog || !document.body.contains(this.battleLog)) {
            this.initializeBattleLog();
        }

        return this.battleLog;
    }
    
    /**
     * バトルログをクリア
     */
    clearBattleLog(): void {
        const battleLog = this.getBattleLog();
        if (battleLog) {
            battleLog.innerHTML = '';
        }
    }
    
    /**
     * Add a message to the battle log
     * @param message The message to add
     * @param type The type of message (e.g., 'damage', 'status-effect', 'heal', etc.)
     * @param actor The actor type ('player', 'boss', 'system')
     * @param boss Optional boss reference for boss icon
     */
    addBattleLogMessage(
        message: string, 
        type: string = '', 
        actor: 'player' | 'boss' | 'system' = 'system',
        boss?: Boss
    ): void {
        const battleLog = this.getBattleLog();
        if (!battleLog) return;
        
        // Create message container
        const messageContainer = document.createElement('div');
        messageContainer.className = `battle-message ${actor}`;
        
        // Create message content
        if (actor === 'system') {
            // System messages are centered without icons
            const bubble = document.createElement('div');
            bubble.className = `message-bubble system ${type}`;
            bubble.textContent = message;
            messageContainer.appendChild(bubble);
        } else {
            // Player and boss messages have icons and bubbles
            const icon = document.createElement('div');
            icon.className = `message-icon ${actor}`;
            
            // Set icon based on actor
            if (actor === 'player') {
                icon.textContent = '🐍'; // Player's eel icon
            } else if (actor === 'boss') {
                // Get boss icon from current boss data
                icon.textContent = boss?.icon ?? '👹';
            }
            
            const bubble = document.createElement('div');
            bubble.className = `message-bubble ${actor} ${type}`;
            bubble.textContent = message;
            
            if (actor === 'player') {
                messageContainer.appendChild(icon);
                messageContainer.appendChild(bubble);
            } else {
                messageContainer.appendChild(bubble);
                messageContainer.appendChild(icon);
            }
        }
        
        battleLog.appendChild(messageContainer);
        battleLog.scrollTop = battleLog.scrollHeight;
    }
    
    /**
     * ラウンド区切りを追加
     */
    addRoundDivider(roundNumber: number): void {
        const battleLog = this.getBattleLog();
        if (!battleLog) return;
        
        const divider = document.createElement('div');
        divider.className = 'battle-round-divider';
        
        const label = document.createElement('span');
        label.className = 'battle-round-label';
        label.textContent = t('battle.roundLabel', { round: roundNumber });
        
        divider.appendChild(label);
        battleLog.appendChild(divider);
        battleLog.scrollTop = battleLog.scrollHeight;
    }
    
    /**
     * 戦闘開始時のメッセージ進行を表示
     */
    showBattleStartMessages(boss: Boss): void {
        if (!boss.battleStartMessages) {
            // フォールバック
            this.addBattleLogMessage(t('battle.messages.startFallback', { boss: boss.displayName }), 'system');
            return;
        }

        // TODO: MessageData をそのまま渡せるようにする、{player}{boss} などの置換を行う
        boss.battleStartMessages.forEach(message => {
            this.addBattleLogMessage(
                message.text, 'battle-start', message.speaker || 'system', boss
            );
        });
    }

    /**
     * 勝利時のメッセージ進行を表示
     */
    showVictoryMessages(boss: Boss): void {
        if (!boss.victoryMessages) {
            // フォールバック
            this.addBattleLogMessage(t('battle.messages.victoryFallback', { boss: boss.displayName }), 'system');
            return;
        }

        // TODO: MessageData をそのまま渡せるようにする、{player}{boss} などの置換を行う
        boss.victoryMessages.forEach(message => {
            this.addBattleLogMessage(
                message.text, 'victory', message.speaker || 'system', boss
            );
        });
    }
    
    /**
     * 複数のメッセージを順次表示
     */
    addMultipleMessages(messages: string[], type: string = '', actor: 'player' | 'boss' | 'system' = 'system', boss?: Boss): void {
        messages.forEach(message => {
            this.addBattleLogMessage(message, type, actor, boss);
        });
    }
    
    /**
     * フォーマット済みメッセージを追加（Boss.formatMessage用）
     */
    addFormattedMessage(message: string, bossName: string, playerName: string, type: string = '', actor: 'player' | 'boss' | 'system' = 'system', boss?: Boss): void {
        // TODO: より高度な置換処理を実装する場合はここで行う
        const formattedMessage = message
            .replace(/{boss}/g, bossName)
            .replace(/{player}/g, playerName);
        
        this.addBattleLogMessage(formattedMessage, type, actor, boss);
    }
}
