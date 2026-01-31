/**
 * Bootstrap Toast Utilities
 * Provides toast notification functionality using Bootstrap 5
 */

/**
 * トーストのタイプを定義する型エイリアス
 */
import { t } from '../i18n';

export enum ToastType {
    Success = 'success',
    Error = 'error',
    Info = 'info',
    Warning = 'warning',
}

/**
 * トーストユーティリティクラス
 * Bootstrap 5を使用してトースト通知を管理するためのユーティリティクラス
 * 
 * @class ToastUtils
 * @description Bootstrap 5のToast APIを使用してスムーズなアニメーションのトースト通知を提供
 * 
 * @example
 * ```typescript
 * // 従来の使用方法（message + type）
 * ToastUtils.showToast('保存しました！', ToastType.Success);
 * ToastUtils.showToast('エラーが発生しました', ToastType.Error);
 * 
 * // 新しい使用方法（message + title + type）
 * ToastUtils.showToast('データを更新しました', 'データベース', ToastType.Success);
 * ToastUtils.showToast('接続に失敗しました', 'ネットワーク', ToastType.Error);
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
     * トースト通知を表示する（従来の使用方法：message + type）
     * 
     * @static
     * @param {string} message - 表示するメッセージ
     * @param {ToastType} type - トーストのタイプ
     * @returns {void}
     */
    static showToast(message: string, type: ToastType): void;

    /**
     * トースト通知を表示する（新しい使用方法：message + title + type）
     * 
     * @static
     * @param {string} message - 表示するメッセージ
     * @param {string} title - トーストのカスタムタイトル
     * @param {ToastType} type - トーストのタイプ
     * @returns {void}
     */
    static showToast(message: string, title: string, type: ToastType): void;

    /**
     * トースト通知を表示する（Bootstrap 5公式API使用）
     * 
     * @static
     * @param {string} message - 表示するメッセージ
     * @param {ToastType} [arg2] - タイトルまたはタイプ
     * @param {ToastType} [arg3] - タイプ（arg2がタイトルの場合）
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
    static showToast(message: string, arg2: string | ToastType, arg3?: ToastType): void {
        // 引数の解析：専用メソッドで明確化
        const { title: actualTitle, type: actualType } = this.parseArgs(arg2, arg3);

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
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="close"></button>
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
     * 引数を解析してタイトルとタイプを決定する
     * 
     * @private
     * @static
     * @param {string | ToastType} [arg2] - タイトルまたはタイプ
     * @param {ToastType} [arg3] - タイプ（arg2がタイトルの場合）
     * @returns {{ title?: string; type: ToastType }} 解析結果
     */
    private static parseArgs(arg2: string | ToastType, arg3?: ToastType): { title?: string; type: ToastType } {
        if (typeof arg2 === 'string') {
            // arg2がタイトルの場合
            return {
                title: arg2,
                type: arg3 || ToastType.Info // タイプが指定されていない場合はデフォルトの情報タイプを使用
            };
        } else {
            // arg2がタイプの場合
            return {
                title: undefined, // タイトルはなし
                type: arg2 // タイプをそのまま使用
            };
        }
    }

    /**
     * トーストのタイプに応じたBootstrap背景クラスを取得する
     * 
     * @private
     * @static
     * @param {ToastType} type - トーストのタイプ
     * @returns {string} Bootstrapの背景クラス名
     */
    private static getToastBgClass(type: ToastType): string {
        switch (type) {
            case ToastType.Success: return 'bg-success';
            case ToastType.Error: return 'bg-danger';
            case ToastType.Warning: return 'bg-warning';
            case ToastType.Info:
            default: return 'bg-info';
        }
    }

    /**
     * トーストのタイプに応じたアイコンを取得する
     * 
     * @private
     * @static
     * @param {ToastType} type - トーストのタイプ
     * @returns {string} アイコン文字（絵文字）
     */
    private static getToastIcon(type: ToastType): string {
        switch (type) {
            case ToastType.Success: return '✅';
            case ToastType.Error: return '❌';
            case ToastType.Warning: return '⚠️';
            case ToastType.Info:
            default: return 'ℹ️';
        }
    }

    /**
     * トーストのタイプに応じたタイトルを取得する
     * 
     * @private
     * @static
     * @param {ToastType} type - トーストのタイプ
     * @returns {string} 日本語のタイトル
     */
    private static getToastTitle(type: ToastType): string {
        switch (type) {
            case ToastType.Success: return t('toasts.types.success');
            case ToastType.Error: return t('toasts.types.error');
            case ToastType.Warning: return t('toasts.types.warning');
            case ToastType.Info:
            default: return t('toasts.types.info');
        }
    }
}