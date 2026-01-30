import { getBossData } from '@/game/data';
import { Trophy } from '../../systems/MemorialSystem';
import { Player } from '@/game/entities/Player';
import { getLanguage, t } from '@/game/i18n';

/**
 * トロフィー表示の共通コンポーネント
 * 勝利・敗北トロフィーの表示ロジックを統一化
 */
export class TrophyDisplayComponent {
    /**
     * トロフィーカード要素を作成する
     * @param trophy トロフィーデータ
     * @returns 作成されたトロフィーカード要素
     */
    static createTrophyCard(trophy: Trophy, playerExplorerLevel: number): HTMLElement | null {
        const dateObtained = trophy.dateObtained;
        
        const trophyCard = document.createElement('div');
        trophyCard.className = 'col-md-6 mb-3';
        
        const typeIcon = this.getTrophyTypeIcon(trophy.type);
        
        if (!dateObtained) {
            const bossData = getBossData(trophy.bossId);
            if (!bossData) {
                console.warn(`Boss data not found for ID: ${trophy.bossId}`);
                return null;
            }
            
            // 対応ボスが未解禁の場合は何も表示しない
            if (bossData.explorerLevelRequired && playerExplorerLevel < bossData.explorerLevelRequired) {
                return null;
            }
            
            // 未解禁のトロフィーは「？？？？？」と表示
            trophyCard.innerHTML = `
                <div class="card bg-secondary disabled">
                    <div class="card-body">
                        <h6 class="card-title d-flex justify-content-between align-items-center text-muted">
                            ${typeIcon} ${t('ui.trophy.unknownTitle')}
                        </h6>
                        <p class="card-text small text-muted">${t('ui.trophy.unknownDescription')}</p>
                        <small class="text-muted">${t('ui.trophy.unlockFrom', { bossName: bossData.displayName })}</small>
                    </div>
                </div>
            `;
            return trophyCard;
        }
        
        const typeClass = this.getTrophyTypeBadgeClass(trophy.type);
        const dateStr = this.formatDate(dateObtained);
        
        trophyCard.innerHTML = `
            <div class="card bg-secondary">
                <div class="card-body">
                    <h6 class="card-title d-flex justify-content-between align-items-center">
                        ${typeIcon} ${trophy.name}
                        <span class="badge bg-${typeClass}">+${trophy.explorerExp} EXP</span>
                    </h6>
                    <p class="card-text small">${trophy.description}</p>
                    <small class="text-muted">${t('ui.trophy.obtainedDate', { date: dateStr })}</small>
                </div>
            </div>
        `;
        
        return trophyCard;
    }

    /**
     * トロフィーコレクション全体を更新する
     * @param containerId コンテナ要素のID
     * @param noTrophiesMessageId 空状態メッセージ要素のID
     * @param player プレイヤーデータ
     */
    static updateTrophiesCollection(
        containerId: string, 
        noTrophiesMessageId: string, 
        player: Player
    ): void {
        const trophiesContainer = document.getElementById(containerId);
        const noTrophiesMessage = document.getElementById(noTrophiesMessageId);
        
        if (!trophiesContainer || !noTrophiesMessage) {
            console.warn(`Trophy container '${containerId}' or message '${noTrophiesMessageId}' not found`);
            return;
        }
        
        if (player.memorialSystem.getEarnedTrophies().length === 0) {
            this.showEmptyState(trophiesContainer, noTrophiesMessage);
            return;
        }
        
        this.showTrophiesState(trophiesContainer, noTrophiesMessage, player);
    }

    /**
     * 空状態を表示する
     * @param container トロフィーコンテナ要素
     * @param messageElement メッセージ要素
     */
    private static showEmptyState(container: HTMLElement, messageElement: HTMLElement): void {
        container.innerHTML = '';
        messageElement.style.display = 'block';
    }

    /**
     * トロフィー一覧を表示する
     * @param container トロフィーコンテナ要素
     * @param messageElement メッセージ要素
     * @param player プレイヤーデータ
     */
    private static showTrophiesState(
        container: HTMLElement, 
        messageElement: HTMLElement, 
        player: Player
    ): void {
        messageElement.style.display = 'none';
        container.innerHTML = '';
        
        // DocumentFragmentを使用してパフォーマンスを向上
        const fragment = document.createDocumentFragment();
        
        const trophies = player.memorialSystem.getAllTrophiesSorted();
        
        trophies.forEach(trophy => {
            const trophyCard = this.createTrophyCard(trophy, player.getExplorerLevel());
            if (!trophyCard) return; // 無効なトロフィーはスキップ
            fragment.appendChild(trophyCard);
        });
        
        container.appendChild(fragment);
    }

    /**
     * トロフィータイプに応じたアイコンを取得する
     * @param type トロフィータイプ
     * @returns アイコン文字列
     */
    private static getTrophyTypeIcon(type: string): string {
        switch (type) {
            case 'victory': return '🏆';
            case 'defeat': return '💀';
            case 'achievement': return '🎖️';
            case 'milestone': return '⭐';
            default: return '🏅';
        }
    }

    /**
     * トロフィータイプに応じたバッジクラスを取得する
     * @param type トロフィータイプ
     * @returns Bootstrapバッジクラス
     */
    private static getTrophyTypeBadgeClass(type: string): string {
        switch (type) {
            case 'victory': return 'success';
            case 'defeat': return 'info';
            case 'achievement': return 'warning';
            case 'milestone': return 'primary';
            default: return 'secondary';
        }
    }

    /**
     * 日付を日本語形式でフォーマットする
     * @param date 日付文字列、Dateオブジェクト、またはタイムスタンプ
     * @returns フォーマットされた日付文字列
     */
    private static formatDate(date: string | Date | number | null): string {
        try {
            if (!date) {
                return t('ui.trophy.unknownDate');
            }
            
            let dateObj: Date;
            
            // 日付の型に応じてDateオブジェクトを生成
            if (typeof date === 'string') {
                dateObj = new Date(date);
            } else if (typeof date === 'number') {
                dateObj = new Date(date);
            } else {
                dateObj = date;
            }
            
            if (isNaN(dateObj.getTime())) {
                console.warn('Invalid date provided:', date);
                return t('ui.trophy.unknownDate');
            }
            
            const locale = getLanguage() === 'en' ? 'en-US' : 'ja-JP';
            return dateObj.toLocaleDateString(locale);
        } catch (error) {
            console.warn('Failed to format date:', date, error);
            return t('ui.trophy.unknownDate');
        }
    }

    /**
     * トロフィー統計情報を生成する
     * @param trophies トロフィーデータの配列
     * @returns 統計情報オブジェクト
     */
    static getTrophyStatistics(trophies: Trophy[]): {
        total: number;
        byType: { [key: string]: number };
        totalExplorerExp: number;
        latestTrophy?: Trophy;
    } {
        if (trophies.length === 0) {
            return {
                total: 0,
                byType: {},
                totalExplorerExp: 0
            };
        }

        const byType: { [key: string]: number } = {};
        let totalExplorerExp = 0;
        let latestTrophy = trophies[0];
        let latestTrophyDate = new Date(latestTrophy.dateObtained || 0);

        trophies.forEach(trophy => {
            // 所持判定
            if (!trophy.dateObtained) {
                return;
            }
            
            // タイプ別カウント
            byType[trophy.type] = (byType[trophy.type] || 0) + 1;
            
            // 総経験値計算
            totalExplorerExp += trophy.explorerExp;
            
            // 最新トロフィー判定
            const trophyDate = new Date(trophy.dateObtained);
            if (trophyDate > latestTrophyDate) {
                latestTrophy = trophy;
                latestTrophyDate = trophyDate;
            }
        });

        return {
            total: trophies.length,
            byType,
            totalExplorerExp,
            latestTrophy
        };
    }

    /**
     * トロフィーをタイプでフィルタリングする
     * @param trophies トロフィーデータの配列
     * @param type フィルタリングするタイプ
     * @returns フィルタリングされたトロフィー配列
     */
    static filterTrophiesByType(trophies: Trophy[], type: string): Trophy[] {
        return trophies.filter(trophy => trophy.type === type);
    }

    /**
     * トロフィーを日付でソートする
     * @param trophies トロフィーデータの配列
     * @param ascending 昇順の場合はtrue、降順の場合はfalse（デフォルト）
     * @returns ソートされたトロフィー配列
     */
    static sortTrophiesByDate(trophies: Trophy[], ascending: boolean = false): Trophy[] {
        return [...trophies].sort((a, b) => {
            const dateA = new Date(a.dateObtained || 0).getTime();
            const dateB = new Date(b.dateObtained || 0).getTime();
            return ascending ? dateA - dateB : dateB - dateA;
        });
    }

    /**
     * トロフィー情報をテキスト形式で取得する（デバッグ用）
     * @param trophy トロフィーデータ
     * @returns トロフィー情報のテキスト
     */
    static getTrophyInfoText(trophy: Trophy): string {
        const parts = [
            `名前: ${trophy.name}`,
            `説明: ${trophy.description}`,
            `タイプ: ${trophy.type}`,
            `エクスプローラー経験値: +${trophy.explorerExp}`,
            `獲得日: ${this.formatDate(trophy.dateObtained)}`
        ];

        return parts.join('\n');
    }

    /**
     * トロフィーコレクション全体のHTML文字列を生成する
     * @param trophies トロフィーデータの配列
     * @param emptyMessage 空状態のメッセージ
     * @returns HTML文字列
     */
    static generateTrophiesHTML(trophies: Trophy[], emptyMessage: string = 'トロフィーがありません'): string {
        if (trophies.length === 0) {
            return `<div class="text-muted text-center p-4">${emptyMessage}</div>`;
        }

        const trophyCards = trophies.map(trophy => {
            const typeIcon = this.getTrophyTypeIcon(trophy.type);
            const typeClass = this.getTrophyTypeBadgeClass(trophy.type);
            const dateStr = this.formatDate(trophy.dateObtained);
            
            return `
                <div class="col-md-6 mb-3">
                    <div class="card bg-secondary">
                        <div class="card-body">
                            <h6 class="card-title d-flex justify-content-between align-items-center">
                                ${typeIcon} ${trophy.name}
                                <span class="badge bg-${typeClass}">+${trophy.explorerExp} EXP</span>
                            </h6>
                            <p class="card-text small">${trophy.description}</p>
                            <small class="text-muted">獲得日: ${dateStr}</small>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        return `<div class="row">${trophyCards}</div>`;
    }
}
