import { Game } from '../Game';
import { BaseOutGameScene } from './BaseOutGameScene';

/**
 * 資料庫システムの文書インターフェース
 */
interface LibraryDocument {
    id: string;
    title: string;
    content: string;
    requiredExplorerLevel: number;
    requiredBossDefeats?: string[];
    requiredBossLosses?: string[];
    unlocked: boolean;
}

export class OutGameLibraryScene extends BaseOutGameScene {
    private documents: LibraryDocument[] = [];
    
    constructor(game: Game) {
        super(game, 'out-game-library-screen');
        this.initializeDocuments();
        this.setupEventListeners();
    }
    
    /**
     * シーンに入った時の処理
     */
    enter(): void {
        console.log('Entered OutGameLibraryScene');
        
        // ナビゲーションバーのアクティブ状態更新
        this.updateNavigationActiveState();
        
        // 資料庫を更新
        this.updateLibrary();
    }
    
    /**
     * 文書データの初期化（簡易実装）
     */
    private initializeDocuments(): void {
        // 今回は1つのサンプル資料のみ実装
        this.documents = [
            {
                id: 'welcome-document',
                title: '🐍 エルナルの冒険日記 - 第1章',
                content: `# エルナルの冒険日記 - 第1章

## はじめに

私の名前はエルナル。見た目はうなぎだけど、心は勇敢な冒険者よ！

この日記は、私がこの不思議な世界で出会った様々なボスたちとの戦いの記録。
それぞれのボスには個性があって、戦い方も全然違うの。

## 沼のドラゴンとの出会い

最初に出会ったのは沼のドラゴン。
見た目は恐ろしいけれど、実は古い沼の守り神だったの。
高い攻撃力で圧倒してくるけれど、耐久力を鍛えればなんとかなるわ。

攻撃パターンは：
- 通常攻撃（ダメージ大）
- 火だるま状態にしてくる炎攻撃
- たまに強力な必殺技

火だるまになったら回復薬を使うのが基本ね。

## 闇のおばけの謎

次に出会ったのは闇のおばけ。
この子は状態異常の専門家で、毒や魅了を使ってくるの。
HPは低めだけど、状態異常でじわじわと削ってくる戦術。

特に魅了は厄介で、行動が制限されるから要注意！
アドレナリン注射で無敵状態になれば安全に戦えるわ。

## これからの冒険

まだまだ世界には未知のボスがたくさんいるみたい。
砂漠や海、ジャングルや遺跡...
エクスプローラーレベルを上げて、新しい場所を探検していくのが楽しみ！

戦いを通じて成長していく感覚が気持ちいいの。
アビリティも少しずつ向上しているし、新しい装備も手に入れたわ。

---

*この日記は私の冒険の記録。まだまだ続くから、お楽しみに！*

**- エルナル**`,
                requiredExplorerLevel: 1,
                requiredBossDefeats: [],
                unlocked: false
            }
        ];
    }
    
    /**
     * イベントリスナーの設定
     */
    private setupEventListeners(): void {
        // 文書選択イベント（動的に追加される要素用）
        document.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            // クリックされた要素から最も近い .library-document-btn を探す
            const button = target.closest('.library-document-btn') as HTMLElement;
            if (button) {
                const documentId = button.dataset.documentId;
                if (documentId) {
                    this.showDocument(documentId);
                }
            }
        });
    }
    
    /**
     * 資料庫の更新
     */
    private updateLibrary(): void {
        this.updateDocumentAvailability();
        this.renderDocumentList();
        this.clearDocumentContent();
    }
    
    /**
     * 文書の利用可能性を更新
     */
    private updateDocumentAvailability(): void {
        const player = this.game.getPlayer();
        const explorerLevel = player.getExplorerLevel();
        const defeatedBosses = player.memorialSystem.getAllTrophies()
            .filter(trophy => trophy.type === 'victory')
            .map(trophy => trophy.id.replace('victory-', ''));
        
        this.documents.forEach(doc => {
            // エクスプローラーレベル要求チェック
            const levelOk = explorerLevel >= doc.requiredExplorerLevel;
            
            // 必要ボス撃破チェック
            let bossDefeatsOk = true;
            if (doc.requiredBossDefeats && doc.requiredBossDefeats.length > 0) {
                bossDefeatsOk = doc.requiredBossDefeats.every(bossId => 
                    defeatedBosses.includes(bossId)
                );
            }
            
            doc.unlocked = levelOk && bossDefeatsOk;
        });
    }
    
    /**
     * 文書リストの描画
     */
    private renderDocumentList(): void {
        const container = document.getElementById('library-document-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.documents.forEach(doc => {
            const button = document.createElement('button');
            button.className = `btn btn-outline-secondary mb-2 w-100 text-start library-document-btn`;
            button.dataset.documentId = doc.id;
            
            if (doc.unlocked) {
                button.classList.remove('btn-outline-secondary');
                button.classList.add('btn-outline-info');
                button.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <span>${doc.title}</span>
                        <span class="badge bg-success">解禁済み</span>
                    </div>
                `;
            } else {
                button.disabled = true;
                button.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="text-muted">${doc.title}</span>
                        <span class="badge bg-secondary">未解禁</span>
                    </div>
                    <small class="text-muted d-block mt-1">
                        必要条件: エクスプローラーLv.${doc.requiredExplorerLevel}
                        ${doc.requiredBossDefeats ? `, ${doc.requiredBossDefeats.join(', ')}撃破` : ''}
                    </small>
                `;
            }
            
            container.appendChild(button);
        });
    }
    
    /**
     * 文書内容の表示
     */
    private showDocument(documentId: string): void {
        const doc = this.documents.find(d => d.id === documentId);
        if (!doc || !doc.unlocked) {
            return;
        }
        
        const contentContainer = document.getElementById('library-document-content');
        if (!contentContainer) {
            return;
        }
        
        // Markdownの簡易変換（実際のMarkdownパーサーは今後実装）
        const htmlContent = this.convertMarkdownToHtml(doc.content);
        
        contentContainer.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">${doc.title}</h5>
                </div>
                <div class="card-body">
                    ${htmlContent}
                </div>
            </div>
        `;
    }
    
    /**
     * 文書内容のクリア
     */
    private clearDocumentContent(): void {
        const contentContainer = document.getElementById('library-document-content');
        if (contentContainer) {
            contentContainer.innerHTML = `
                <div class="text-center text-muted">
                    <p class="mb-0">左から資料を選択してください</p>
                </div>
            `;
        }
    }
    
    /**
     * 簡易Markdown→HTML変換（基本的なもののみ）
     */
    private convertMarkdownToHtml(markdown: string): string {
        return markdown
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/^\* (.+)$/gm, '<li>$1</li>')
            .replace(/^- (.+)$/gm, '<li>$1</li>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/^---$/gm, '<hr>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(.+)$/gm, '<p>$1</p>')
            .replace(/<li>/g, '<ul><li>')
            .replace(/<\/li>(?![\s\S]*<li>)/g, '</li></ul>')
            .replace(/<\/ul>\s*<ul>/g, '');
    }
}