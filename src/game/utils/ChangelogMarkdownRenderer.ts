import { marked, Renderer } from 'marked';

/**
 * Changelog専用のMarkdownレンダラー
 * バージョン履歴表示に最適化されたHTMLクラスを自動適用
 */
export class ChangelogMarkdownRenderer {
    private static renderer: Renderer;
    
    /**
     * カスタムレンダラーの初期化
     */
    private static initializeRenderer(): void {
        if (this.renderer) return;
        
        this.renderer = new Renderer();
        
        // 見出し1: バージョンタイトル（大きく目立つように）
        this.renderer.heading = ({ tokens, depth }) => {
            const text = this.renderer.parser?.parseInline(tokens) || '';
            switch (depth) {
                case 1:
                    return `<h1 class="h3 display-4 mb-4">${text}</h1>\n`;
                case 2:
                    return `<h2 class="h4 mb-3 mt-4">${text}</h2>\n`;
                case 3:
                    return `<h3 class="h5 mb-2">${text}</h3>\n`;
                default:
                    return `<h${depth} class="h6 mb-2">${text}</h${depth}>\n`;
            }
        };
        
        // 段落: 通常のテキスト
        this.renderer.paragraph = ({ tokens }) => {
            const text = this.renderer.parser?.parseInline(tokens) || '';
            return `<p class="mb-3">${text}</p>\n`;
        };
        
        // リスト
        this.renderer.list = (token) => {
            const body = token.items.map(item => this.renderer.listitem!(item)).join('');
            const tag = token.ordered ? 'ol' : 'ul';
            const classes = token.ordered ? 'ms-3 mb-3' : 'list-unstyled ms-3 mb-3';
            return `<${tag} class="${classes}">\n${body}</${tag}>\n`;
        };
        
        this.renderer.listitem = (item) => {
            const text = this.renderer.parser?.parse(item.tokens) || '';
            return `<li class="mb-1">${text}</li>\n`;
        };
        
        this.renderer.strong = ({ tokens }) => {
            const text = this.renderer.parser?.parseInline(tokens) || '';
            return `<strong class="fw-bold">${text}</strong>`;
        };
        
        this.renderer.em = ({ tokens }) => {
            const text = this.renderer.parser?.parseInline(tokens) || '';
            return `<em class="fst-italic">${text}</em>`;
        };
        
        // 区切り線: バージョン間の区切り
        this.renderer.hr = () => {
            return '<hr class="my-5 border-3 border-dark">\n';
        };
        
        // 引用: Bootstrap風blockquote
        this.renderer.blockquote = ({ tokens }) => {
            const quote = this.renderer.parser?.parse(tokens) || '';
            return `<blockquote class="blockquote border-start border-3 border-primary ps-3 mb-3 text-muted">\n${quote}</blockquote>\n`;
        };
        
        // コード: Bootstrap風スタイリング
        this.renderer.code = ({ text }) => {
            return `<pre class="bg-light p-3 rounded border mb-3"><code class="text-dark">${text}</code></pre>\n`;
        };
        
        this.renderer.codespan = ({ text }) => {
            return `<code class="bg-light px-1 rounded">${text}</code>`;
        };
        
        // リンク: 外部参照リンク
        this.renderer.link = ({ href, title, tokens }) => {
            const text = this.renderer.parser?.parseInline(tokens) || '';
            const titleAttr = title ? ` title="${title}"` : '';
            return `<a href="${href}" target="_blank" class="link-primary text-decoration-none"${titleAttr}>
                        ${text} <i class="bi bi-box-arrow-up-right ms-1"></i>
                    </a>`;
        };
        
        // 画像: スクリーンショットや図表
        this.renderer.image = ({ href, title, text }) => {
            const titleAttr = title ? ` title="${title}"` : '';
            const altAttr = text ? ` alt="${text}"` : '';
            return `<div class="text-center mb-4">
                        <img src="${href}" class="img-fluid rounded border shadow-sm"${altAttr}${titleAttr}>
                        ${text ? `<div class="text-muted mt-2"><small>${text}</small></div>` : ''}
                    </div>\n`;
        };
    }
    
    /**
     * ChangelogをBootstrap 5対応HTMLに変換
     * @param markdown 変換するMarkdown文字列
     * @returns Bootstrap 5クラスが適用されたHTML文字列
     */
    public static convert(markdown: string): string {
        this.initializeRenderer();
        
        // markedの設定
        marked.setOptions({
            renderer: this.renderer,
            breaks: true,    // 改行をbrタグに変換
            gfm: true,       // GitHub Flavored Markdown
            pedantic: false, // 厳密な解析を無効
        });
        
        try {
            let html = marked.parse(markdown) as string;
            
            // Changelog特有のスタイリング処理
            html = this.applyChangelogStyling(html);
            
            return html;
        } catch (error) {
            console.error('Changelog markdown conversion error:', error);
            return `<div class="alert alert-danger" role="alert">
                        <h4 class="alert-heading">Markdownの解析エラー</h4>
                        <p class="mb-0">変更履歴の解析中にエラーが発生しました。</p>
                    </div>`;
        }
    }
    
    /**
     * Changelog特有のスタイリング処理を適用
     * @param html 基本変換されたHTML
     * @returns Changelog特有のスタイリングが適用されたHTML
     */
    private static applyChangelogStyling(html: string): string {
        // リリース日付の検出と強調（YYYY-MM-DD形式）
        html = html.replace(
            /(\d{4}-\d{2}-\d{2})/g,
            '<span class="badge bg-dark fs-6 ms-2">$1</span>'
        );
        
        // バージョン番号の検出と強調（v1.2.3形式）
        html = html.replace(
            /(v?\d+\.\d+\.\d+)/gi,
            '<span class="badge bg-primary fs-5">$1</span>'
        );
        
        // 破壊的変更の警告表示
        html = html.replace(
            /BREAKING[\s:]/gi,
            '<span class="badge bg-danger me-2">⚠️ BREAKING</span>'
        );
        
        // セキュリティ関連の変更の強調
        html = html.replace(
            /SECURITY[\s:]/gi,
            '<span class="badge bg-warning text-dark me-2">🔒 SECURITY</span>'
        );
        
        return html;
    }
}