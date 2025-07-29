import { marked, Renderer } from 'marked';

/**
 * Bootstrap 5に最適化されたMarkdownレンダラー
 * card-body内での表示に適したHTMLクラスを自動適用
 */
export class BootstrapMarkdownRenderer {
    private static renderer: Renderer;
    
    /**
     * カスタムレンダラーの初期化
     */
    private static initializeRenderer(): void {
        if (this.renderer) return;
        
        this.renderer = new Renderer();
        
        // 見出し1: カードタイトル風
        this.renderer.heading = ({ tokens, depth }) => {
            const text = this.renderer.parser?.parseInline(tokens) || '';
            switch (depth) {
                case 1:
                    return `<h1 class="card-title display-6 mb-3">${text}</h1>\n`;
                case 2:
                    return `<h2 class="card-subtitle mb-3 text-primary border-bottom pb-2">${text}</h2>\n`;
                case 3:
                    return `<h3 class="h5 mb-2 text-secondary">${text}</h3>\n`;
                case 4:
                    return `<h4 class="h6 mb-2">${text}</h4>\n`;
                default:
                    return `<h${depth} class="h6 mb-2">${text}</h${depth}>\n`;
            }
        };
        
        // 段落: card-textクラス適用
        this.renderer.paragraph = ({ tokens }) => {
            const text = this.renderer.parser?.parseInline(tokens) || '';
            return `<p class="card-text mb-3">${text}</p>\n`;
        };
        
        // リスト: Bootstrap風スタイリング
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
        
        // 強調: Bootstrap テキストユーティリティ
        this.renderer.strong = ({ tokens }) => {
            const text = this.renderer.parser?.parseInline(tokens) || '';
            return `<strong class="fw-bold">${text}</strong>`;
        };
        
        this.renderer.em = ({ tokens }) => {
            const text = this.renderer.parser?.parseInline(tokens) || '';
            return `<em class="fst-italic">${text}</em>`;
        };
        
        // 区切り線: Bootstrap風スタイリング
        this.renderer.hr = () => {
            return '<hr class="my-4 border-2">\n';
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
        
        // リンク: Bootstrap風スタイリング
        this.renderer.link = ({ href, title, tokens }) => {
            const text = this.renderer.parser?.parseInline(tokens) || '';
            const titleAttr = title ? ` title="${title}"` : '';
            return `<a href="${href}" class="link-primary text-decoration-none"${titleAttr}>${text}</a>`;
        };
        
        // 画像: Bootstrap風レスポンシブ画像
        this.renderer.image = ({ href, title, text }) => {
            const titleAttr = title ? ` title="${title}"` : '';
            const altAttr = text ? ` alt="${text}"` : '';
            return `<img src="${href}" class="img-fluid mb-3 rounded"${altAttr}${titleAttr}>\n`;
        };
    }
    
    /**
     * MarkdownをBootstrap 5対応HTMLに変換
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
            
            // 特別なスタイリング処理
            html = this.applySpecialStyling(html);
            
            return html;
        } catch (error) {
            console.error('Markdown conversion error:', error);
            return `<p class="card-text text-danger">Markdownの解析中にエラーが発生しました。</p>`;
        }
    }
    
    /**
     * 特別なスタイリング処理を適用
     * @param html 基本変換されたHTML
     * @returns 特別なスタイリングが適用されたHTML
     */
    private static applySpecialStyling(html: string): string {
        // リード文検出（最初の段落を特別扱い）
        html = html.replace(
            /^<p class="card-text mb-3">([^<]+)<\/p>/,
            '<p class="card-text lead mb-4">$1</p>'
        );
        
        // 署名部分の検出と特別スタイリング
        html = html.replace(
            /<p class="card-text mb-3">\*([^*]+)\*<\/p>/g,
            '<p class="card-text text-end fst-italic text-muted mb-2"><small>$1</small></p>'
        );
        
        // 最後の署名部分（**付き）の検出
        html = html.replace(
            /<p class="card-text mb-3"><strong class="fw-bold">- ([^<]+)<\/strong><\/p>/g,
            '<p class="card-text text-end fw-bold text-primary mb-0">- $1</p>'
        );
        
        // 注意書きや重要事項（!で始まる段落）の強調
        html = html.replace(
            /<p class="card-text mb-3">!([^<]+)<\/p>/g,
            '<div class="alert alert-warning mb-3" role="alert"><small>$1</small></div>'
        );
        
        return html;
    }
    
    /**
     * 文書タイプに応じた特別なスタイリングを適用
     * @param markdown 変換するMarkdown文字列
     * @param documentType 文書タイプ（'diary', 'strategy', 'guide'等）
     * @returns タイプ別スタイリングが適用されたHTML文字列
     */
    public static convertWithType(markdown: string, documentType: string = 'default'): string {
        const baseHtml = this.convert(markdown);
        
        switch (documentType) {
            case 'diary':
                return this.applyDiaryStyles(baseHtml);
            case 'strategy':
                return this.applyStrategyStyles(baseHtml);
            case 'reflection':
                return this.applyReflectionStyles(baseHtml);
            default:
                return baseHtml;
        }
    }
    
    /**
     * 日記タイプのスタイリング適用
     */
    private static applyDiaryStyles(html: string): string {
        // 日記らしい親しみやすいスタイリング
        return html.replace(
            /<h2 class="card-subtitle mb-3 text-primary border-bottom pb-2">/g,
            '<h2 class="card-subtitle mb-3 text-info border-bottom border-info pb-2">'
        );
    }
    
    /**
     * 戦略ガイドタイプのスタイリング適用
     */
    private static applyStrategyStyles(html: string): string {
        // 戦術的で実用的なスタイリング
        return html.replace(
            /<ul class="list-unstyled ms-3 mb-3">/g,
            '<ul class="list-group list-group-flush mb-3">'
        ).replace(
            /<li class="mb-1">/g,
            '<li class="list-group-item bg-transparent border-start border-3 border-success ps-3 py-2">'
        );
    }
    
    /**
     * 振り返り・反省タイプのスタイリング適用
     */
    private static applyReflectionStyles(html: string): string {
        // 内省的で落ち着いたスタイリング
        return html.replace(
            /<h2 class="card-subtitle mb-3 text-primary border-bottom pb-2">/g,
            '<h2 class="card-subtitle mb-3 text-secondary border-bottom border-secondary pb-2">'
        );
    }
}