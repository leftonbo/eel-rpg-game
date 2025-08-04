/**
 * Bootstrap Toast Utilities
 * Provides toast notification functionality using Bootstrap 5
 */

/**
 * トーストユーティリティクラス
 * Bootstrap 5を使用してトースト通知を管理するためのユーティリティクラス
 * 
 * @class ToastUtils
 * @description Bootstrap 5のToast APIを使用してスムーズなアニメーションのトースト通知を提供
 * 
 * @example
 * ```typescript
 * // 基本的な情報メッセージ
 * ToastUtils.showToast('処理を開始しました');
 * 
 * // 従来の使用方法（message + type）
 * ToastUtils.showToast('保存しました！', 'success');
 * ToastUtils.showToast('エラーが発生しました', 'error');
 * 
 * // 新しい使用方法（message + title + type）
 * ToastUtils.showToast('データを更新しました', 'データベース', 'success');
 * ToastUtils.showToast('接続に失敗しました', 'ネットワーク', 'error');
 * ```
 */
export class ToastUtils {
    /**
     * タイミング定数
     * トーストの動作に関するタイミングを定義
     */
    private static readonly TIMING = {
        /** トースト自動消去時間（ミリ秒） */
        TOAST_AUTO_HIDE: 4000,
    } as const;

    /**
     * トーストのタイプか判定するtype guard関数
     * 
     * @private
     * @static
     * @param {any} value - 判定する値
     * @returns {boolean} トーストタイプの場合true
     */
    private static isToastType(value: any): value is 'success' | 'error' | 'info' | 'warning' {
        const toastTypes = new Set(['success', 'error', 'info', 'warning']);
        return typeof value === 'string' && toastTypes.has(value);
    }

    /**
     * トースト通知を表示する（従来の使用方法：message + type）
     * 
     * @static
     * @param {string} message - 表示するメッセージ
     * @param {'success' | 'error' | 'info' | 'warning'} type - トーストのタイプ
     * @returns {void}
     */
    static showToast(message: string, type: 'success' | 'error' | 'info' | 'warning'): void;

    /**
     * トースト通知を表示する（新しい使用方法：message + title + type）
     * 
     * @static
     * @param {string} message - 表示するメッセージ
     * @param {string} title - トーストのカスタムタイトル
     * @param {'success' | 'error' | 'info' | 'warning'} type - トーストのタイプ
     * @returns {void}
     */
    static showToast(message: string, title: string, type: 'success' | 'error' | 'info' | 'warning'): void;

    /**
     * トースト通知を表示する（デフォルト：message のみ）
     * 
     * @static
     * @param {string} message - 表示するメッセージ
     * @returns {void}
     */
    static showToast(message: string): void;

    /**
     * トースト通知を表示する（Bootstrap 5公式API使用）
     * 
     * @static
     * @param {string} message - 表示するメッセージ
     * @param {string | 'success' | 'error' | 'info' | 'warning'} [arg2] - タイトルまたはタイプ
     * @param {'success' | 'error' | 'info' | 'warning'} [arg3] - タイプ（arg2がタイトルの場合）
     * @returns {void}
     * 
     * @description Bootstrap 5の公式Toast APIを使用してスムーズなアニメーションを実現
     *              複数のオーバーロードにより明確な型定義を提供
     * 
     * @example
     * ```typescript
     * // 基本的な情報メッセージ
     * ToastUtils.showToast('処理を開始しました');
     * 
     * // 従来の使用方法（message + type）
     * ToastUtils.showToast('保存しました！', 'success');
     * ToastUtils.showToast('エラーが発生しました', 'error');
     * 
     * // 新しい使用方法（message + title + type）
     * ToastUtils.showToast('データを更新しました', 'データベース', 'success');
     * ToastUtils.showToast('接続に失敗しました', 'ネットワーク', 'error');
     * ```
     */
    static showToast(message: string, arg2?: string | 'success' | 'error' | 'info' | 'warning', arg3?: 'success' | 'error' | 'info' | 'warning'): void {
        // 引数の解析：明確で保守しやすいロジック
        let actualTitle: string | undefined;
        let actualType: 'success' | 'error' | 'info' | 'warning';

        if (arg3) {
            // 新しい使用方法: showToast(message, title, type)
            actualTitle = arg2 as string;
            actualType = arg3;
        } else if (this.isToastType(arg2)) {
            // 従来の使用方法: showToast(message, type)
            actualTitle = undefined;
            actualType = arg2;
        } else {
            // デフォルト: showToast(message) または showToast(message, title)
            actualTitle = arg2 as string | undefined;
            actualType = 'info';
        }

        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toastId = `toast-${Date.now()}`;
        const bgClass = this.getToastBgClass(actualType);
        const iconClass = this.getToastIcon(actualType);
        const displayTitle = actualTitle || this.getToastTitle(actualType);

        // Bootstrap 5公式のToast構造（右下からのスライドイン用）
        const toastHtml = `
            <div id="${toastId}" 
                 class="toast hide" 
                 role="alert" 
                 aria-live="assertive" 
                 aria-atomic="true"
                 data-bs-delay="${ToastUtils.TIMING.TOAST_AUTO_HIDE}"
                 data-bs-animation="true"
                 data-bs-autohide="true">
                <div class="toast-header ${bgClass} text-white">
                    <span class="me-2">${iconClass}</span>
                    <strong class="me-auto">${displayTitle}</strong>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="閉じる"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        `;

        toastContainer.insertAdjacentHTML('beforeend', toastHtml);

        const toastElement = document.getElementById(toastId);
        if (toastElement) {
            // Bootstrap Toast インスタンスを作成
            const toast = new window.bootstrap.Toast(toastElement, {
                animation: true,
                autohide: true,
                delay: ToastUtils.TIMING.TOAST_AUTO_HIDE
            });

            // hidden.bs.toastイベントでDOM要素を削除
            toastElement.addEventListener('hidden.bs.toast', () => {
                toastElement.remove();
            });

            // Toast を表示
            toast.show();
        }
    }

    /**
     * トーストのタイプに応じたBootstrap背景クラスを取得する
     * 
     * @private
     * @static
     * @param {string} type - トーストのタイプ
     * @returns {string} Bootstrapの背景クラス名
     */
    private static getToastBgClass(type: string): string {
        switch (type) {
            case 'success': return 'bg-success';
            case 'error': return 'bg-danger';
            case 'warning': return 'bg-warning';
            case 'info':
            default: return 'bg-info';
        }
    }

    /**
     * トーストのタイプに応じたアイコンを取得する
     * 
     * @private
     * @static
     * @param {string} type - トーストのタイプ
     * @returns {string} アイコン文字（絵文字）
     */
    private static getToastIcon(type: string): string {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'info':
            default: return 'ℹ️';
        }
    }

    /**
     * トーストのタイプに応じたタイトルを取得する
     * 
     * @private
     * @static
     * @param {string} type - トーストのタイプ
     * @returns {string} 日本語のタイトル
     */
    private static getToastTitle(type: string): string {
        switch (type) {
            case 'success': return '成功';
            case 'error': return 'エラー';
            case 'warning': return '警告';
            case 'info':
            default: return '情報';
        }
    }
}