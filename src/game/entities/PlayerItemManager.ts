import { Player } from './Player';

/**
 * プレイヤーアイテムインターフェース
 */
export interface PlayerItem {
    name: string;
    count: number;
    description: string;
    use: (player: Player) => boolean;
    experienceGain: number; // Experience gain for using the item
}

/**
 * プレイヤーのアイテム管理クラス
 */
export class PlayerItemManager {
    private items: Map<string, PlayerItem> = new Map();
    
    /**
     * アイテムを設定
     */
    setItems(items: Map<string, PlayerItem>): void {
        this.items = items;
    }
    
    /**
     * アイテムを取得
     */
    getItems(): Map<string, PlayerItem> {
        return this.items;
    }
    
    /**
     * 特定のアイテムを取得
     */
    getItem(itemName: string): PlayerItem | undefined {
        return this.items.get(itemName);
    }
    
    /**
     * アイテムの数量を取得
     */
    getItemCount(itemName: string): number {
        const item = this.items.get(itemName);
        return item ? item.count : 0;
    }
    
    /**
     * アイテムを使用
     */
    useItem(itemName: string, player: Player): boolean {
        const item = this.items.get(itemName);
        if (!item || item.count <= 0) return false;
        
        return item.use(player);
    }
    
    /**
     * アイテムを追加
     */
    addItem(itemName: string, item: PlayerItem): void {
        this.items.set(itemName, item);
    }
    
    /**
     * アイテムを削除
     */
    removeItem(itemName: string): void {
        this.items.delete(itemName);
    }
    
    /**
     * アイテムの数量を設定
     */
    setItemCount(itemName: string, count: number): void {
        const item = this.items.get(itemName);
        if (item) {
            item.count = Math.max(0, count);
        }
    }
    
    /**
     * アイテムの数量を増加
     */
    incrementItemCount(itemName: string, amount: number = 1): void {
        const item = this.items.get(itemName);
        if (item) {
            item.count += amount;
        }
    }
    
    /**
     * アイテムの数量を減少
     */
    decrementItemCount(itemName: string, amount: number = 1): void {
        const item = this.items.get(itemName);
        if (item) {
            item.count = Math.max(0, item.count - amount);
        }
    }
    
    /**
     * すべてのアイテムをクリア
     */
    clearItems(): void {
        this.items.clear();
    }
    
    /**
     * アイテム一覧を配列で取得
     */
    getItemsArray(): PlayerItem[] {
        return Array.from(this.items.values());
    }
    
    /**
     * 使用可能なアイテム一覧を取得
     */
    getUsableItems(): PlayerItem[] {
        return Array.from(this.items.values()).filter(item => item.count > 0);
    }
}