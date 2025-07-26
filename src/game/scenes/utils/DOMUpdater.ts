/**
 * DOM操作の共通ユーティリティクラス
 * DOM要素の更新処理を統一化し、null チェックを含む安全な操作を提供
 */
export class DOMUpdater {
    /**
     * 指定されたIDの要素のテキストコンテンツを更新する
     * 要素が存在しない場合は何もしない
     */
    static updateElement(id: string, value: string): void {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        } else {
            console.warn(`Element with id '${id}' not found`);
        }
    }

    /**
     * 指定されたIDの要素のHTMLコンテンツを更新する
     * 要素が存在しない場合は何もしない
     */
    static updateElementHTML(id: string, html: string): void {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = html;
        } else {
            console.warn(`Element with id '${id}' not found`);
        }
    }

    /**
     * 指定されたIDの要素の値を更新する（input要素など）
     * 要素が存在しない場合は何もしない
     */
    static updateElementValue(id: string, value: string): void {
        const element = document.getElementById(id) as HTMLInputElement;
        if (element) {
            element.value = value;
        } else {
            console.warn(`Element with id '${id}' not found`);
        }
    }

    /**
     * 指定されたIDの要素にクラスを追加する
     * 要素が存在しない場合は何もしない
     */
    static addClass(id: string, className: string): void {
        const element = document.getElementById(id);
        if (element) {
            element.classList.add(className);
        } else {
            console.warn(`Element with id '${id}' not found`);
        }
    }

    /**
     * 指定されたIDの要素からクラスを削除する
     * 要素が存在しない場合は何もしない
     */
    static removeClass(id: string, className: string): void {
        const element = document.getElementById(id);
        if (element) {
            element.classList.remove(className);
        } else {
            console.warn(`Element with id '${id}' not found`);
        }
    }

    /**
     * 指定されたIDの要素のクラスをトグルする
     * 要素が存在しない場合は何もしない
     */
    static toggleClass(id: string, className: string, force?: boolean): void {
        const element = document.getElementById(id);
        if (element) {
            element.classList.toggle(className, force);
        } else {
            console.warn(`Element with id '${id}' not found`);
        }
    }

    /**
     * 指定されたIDの要素の表示/非表示を切り替える
     * 要素が存在しない場合は何もしない
     */
    static setVisibility(id: string, visible: boolean): void {
        const element = document.getElementById(id);
        if (element) {
            if (visible) {
                element.classList.remove('d-none');
                element.style.display = '';
            } else {
                element.classList.add('d-none');
                element.style.display = 'none';
            }
        } else {
            console.warn(`Element with id '${id}' not found`);
        }
    }

    /**
     * 指定されたIDの要素のスタイルプロパティを設定する
     * 要素が存在しない場合は何もしない
     */
    static setStyle(id: string, property: string, value: string): void {
        const element = document.getElementById(id) as HTMLElement;
        if (element) {
            element.style.setProperty(property, value);
        } else {
            console.warn(`Element with id '${id}' not found`);
        }
    }

    /**
     * 指定されたIDの要素の属性を設定する
     * 要素が存在しない場合は何もしない
     */
    static setAttribute(id: string, attribute: string, value: string): void {
        const element = document.getElementById(id);
        if (element) {
            element.setAttribute(attribute, value);
        } else {
            console.warn(`Element with id '${id}' not found`);
        }
    }

    /**
     * 指定されたIDの要素の属性を削除する
     * 要素が存在しない場合は何もしない
     */
    static removeAttribute(id: string, attribute: string): void {
        const element = document.getElementById(id);
        if (element) {
            element.removeAttribute(attribute);
        } else {
            console.warn(`Element with id '${id}' not found`);
        }
    }

    /**
     * 複数の要素のテキストコンテンツを一括更新する
     * 存在しない要素は警告を出力してスキップ
     */
    static updateElements(updates: { [id: string]: string }): void {
        Object.entries(updates).forEach(([id, value]) => {
            this.updateElement(id, value);
        });
    }

    /**
     * 要素が存在するかチェックする
     */
    static exists(id: string): boolean {
        return document.getElementById(id) !== null;
    }

    /**
     * 要素を安全に取得する（型チェック付き）
     */
    static getElement<T extends HTMLElement>(id: string): T | null {
        const element = document.getElementById(id);
        return (element instanceof HTMLElement ? (element as T) : null);
    }

    /**
     * 要素を安全に取得し、コールバックを実行する
     * 要素が存在しない場合はコールバックを実行しない
     */
    static withElement<T extends HTMLElement>(id: string, callback: (element: T) => void): void {
        const element = this.getElement<T>(id);
        if (element) {
            callback(element);
        } else {
            console.warn(`Element with id '${id}' not found`);
        }
    }

    /**
     * 複数の要素を安全に取得し、コールバックを実行する
     */
    static withElements<T extends HTMLElement>(ids: string[], callback: (elements: T[]) => void): void {
        const elements = ids.map(id => this.getElement<T>(id)).filter(el => el !== null) as T[];
        if (elements.length === ids.length) {
            callback(elements);
        } else {
            const missingIds = ids.filter(id => !this.exists(id));
            console.warn(`Some elements not found: ${missingIds.join(', ')}`);
        }
    }
}