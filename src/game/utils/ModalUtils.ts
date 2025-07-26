/**
 * Bootstrap Modal Utilities
 * Replaces browser's alert(), confirm(), prompt() with Bootstrap modals
 */

/**
 * モーダルユーティリティクラス
 * ブラウザ標準のalert、confirm、promptをBootstrapモーダルで置き換える機能を提供
 * 
 * @class ModalUtils
 * @description Bootstrap 5を使用してモーダルダイアログとトースト通知を管理するためのユーティリティクラス
 * 
 * @example
 * ```typescript
 * // トースト通知の表示
 * ModalUtils.showToast('保存しました！', 'success');
 * 
 * // アラートの表示
 * await ModalUtils.showAlert('エラーが発生しました', 'error');
 * 
 * // 確認ダイアログ
 * const result = await ModalUtils.showConfirm('削除しますか？');
 * if (result) {
 *     // 削除処理
 * }
 * 
 * // 入力ダイアログ
 * const name = await ModalUtils.showPrompt('名前を入力してください');
 * if (name) {
 *     console.log('入力された名前:', name);
 * }
 * ```
 */
export class ModalUtils {
    /**
     * タイミング定数
     * モーダルやトーストの動作に関するタイミングを定義
     */
    private static readonly TIMING = {
        /** トースト自動消去時間（ミリ秒） */
        TOAST_AUTO_HIDE: 4000,
        /** モーダル表示後のフォーカス遅延時間（ミリ秒） */
        MODAL_FOCUS_DELAY: 300,
        /** エラー表示時のシェイク効果時間（ミリ秒） */
        ERROR_SHAKE_DURATION: 600,
    } as const;

    /**
     * トースト通知を表示する（Bootstrap 5公式API使用）
     * 
     * @static
     * @param {string} message - 表示するメッセージ
     * @param {'success' | 'error' | 'info' | 'warning'} [type='info'] - トーストのタイプ
     * @returns {void}
     * 
     * @description Bootstrap 5の公式Toast APIを使用してスムーズなアニメーションを実現
     * 
     * @example
     * ```typescript
     * // 成功メッセージ
     * ModalUtils.showToast('保存しました！', 'success');
     * 
     * // エラーメッセージ
     * ModalUtils.showToast('エラーが発生しました', 'error');
     * 
     * // 情報メッセージ（デフォルト）
     * ModalUtils.showToast('処理を開始しました');
     * ```
     */
    static showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toastId = `toast-${Date.now()}`;
        const bgClass = this.getToastBgClass(type);
        const iconClass = this.getToastIcon(type);

        // Bootstrap 5公式のToast構造（右下からのスライドイン用）
        const toastHtml = `
            <div id="${toastId}" 
                 class="toast hide" 
                 role="alert" 
                 aria-live="assertive" 
                 aria-atomic="true"
                 data-bs-delay="${ModalUtils.TIMING.TOAST_AUTO_HIDE}"
                 data-bs-animation="true"
                 data-bs-autohide="true">
                <div class="toast-header ${bgClass} text-white">
                    <span class="me-2">${iconClass}</span>
                    <strong class="me-auto">${this.getToastTitle(type)}</strong>
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
                delay: ModalUtils.TIMING.TOAST_AUTO_HIDE
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
     * アラートモーダルを表示する（alert()の代替）
     * 
     * @static
     * @async
     * @param {string} message - 表示するメッセージ
     * @param {string} [title='通知'] - モーダルのタイトル
     * @returns {Promise<void>} ユーザーがOKボタンを押すかモーダルを閉じた時に解決されるPromise
     * 
     * @example
     * ```typescript
     * // 基本的な使用方法
     * await ModalUtils.showAlert('処理が完了しました');
     * 
     * // カスタムタイトルを指定
     * await ModalUtils.showAlert('エラーが発生しました', 'エラー');
     * 
     * // 非同期処理での使用
     * try {
     *     await someAsyncOperation();
     *     await ModalUtils.showAlert('成功しました！');
     * } catch (error) {
     *     await ModalUtils.showAlert('処理に失敗しました', 'エラー');
     * }
     * ```
     */
    static async showAlert(message: string, title: string = '通知'): Promise<void> {
        return new Promise((resolve) => {
            const modal = document.getElementById('alert-modal') as HTMLElement;
            const titleElement = document.getElementById('alert-modal-label') as HTMLElement;
            const bodyElement = document.getElementById('alert-modal-body') as HTMLElement;

            titleElement.textContent = title;
            bodyElement.textContent = message;

            const bootstrapModal = new window.bootstrap.Modal(modal);
            
            const handleHidden = () => {
                modal.removeEventListener('hidden.bs.modal', handleHidden);
                resolve();
            };

            modal.addEventListener('hidden.bs.modal', handleHidden);
            bootstrapModal.show();
        });
    }

    /**
     * 確認モーダルを表示する（confirm()の代替）
     * 
     * @static
     * @async
     * @param {string} message - 確認メッセージ
     * @param {string} [title='確認'] - モーダルのタイトル
     * @returns {Promise<boolean>} OKが押された場合true、キャンセルまたはモーダルが閉じられた場合false
     * 
     * @example
     * ```typescript
     * // 基本的な確認ダイアログ
     * const confirmed = await ModalUtils.showConfirm('本当に削除しますか？');
     * if (confirmed) {
     *     deleteItem();
     * }
     * 
     * // カスタムタイトルを指定
     * const result = await ModalUtils.showConfirm('変更を保存しますか？', '保存確認');
     * if (result) {
     *     saveChanges();
     * }
     * ```
     */
    static async showConfirm(message: string, title: string = '確認'): Promise<boolean> {
        return new Promise((resolve) => {
            const modal = document.getElementById('confirm-modal') as HTMLElement;
            const titleElement = document.getElementById('confirm-modal-label') as HTMLElement;
            const bodyElement = document.getElementById('confirm-modal-body') as HTMLElement;
            const okBtn = document.getElementById('confirm-ok-btn') as HTMLButtonElement;
            const cancelBtn = document.getElementById('confirm-cancel-btn') as HTMLButtonElement;

            titleElement.textContent = title;
            bodyElement.textContent = message;

            const bootstrapModal = new window.bootstrap.Modal(modal);
            
            const handleResult = (result: boolean) => {
                return () => {
                    okBtn.removeEventListener('click', handleOk);
                    cancelBtn.removeEventListener('click', handleCancel);
                    modal.removeEventListener('hidden.bs.modal', handleHidden);
                    bootstrapModal.hide();
                    resolve(result);
                };
            };

            const handleOk = handleResult(true);
            const handleCancel = handleResult(false);
            
            const handleHidden = () => {
                okBtn.removeEventListener('click', handleOk);
                cancelBtn.removeEventListener('click', handleCancel);
                modal.removeEventListener('hidden.bs.modal', handleHidden);
                resolve(false);
            };

            okBtn.addEventListener('click', handleOk);
            cancelBtn.addEventListener('click', handleCancel);
            modal.addEventListener('hidden.bs.modal', handleHidden);
            
            bootstrapModal.show();
        });
    }

    /**
     * 入力モーダルを表示する（prompt()の代替）
     * 
     * @static
     * @async
     * @param {string} message - 入力を促すメッセージ
     * @param {string} [defaultValue=''] - 入力フィールドのデフォルト値
     * @param {string} [title='入力'] - モーダルのタイトル
     * @param {string} [inputType='text'] - 入力フィールドのタイプ（text, password, numberなど）
     * @returns {Promise<string | null>} 入力された値（文字列）、キャンセルされた場合はnull
     * 
     * @example
     * ```typescript
     * // 基本的な文字列入力
     * const name = await ModalUtils.showPrompt('お名前を入力してください');
     * if (name) {
     *     console.log('入力された名前:', name);
     * }
     * 
     * // デフォルト値を指定
     * const email = await ModalUtils.showPrompt('メールアドレス', 'user@example.com');
     * 
     * // パスワード入力
     * const password = await ModalUtils.showPrompt('パスワード', '', 'パスワード入力', 'password');
     * 
     * // 数値入力
     * const age = await ModalUtils.showPrompt('年齢', '20', '年齢入力', 'number');
     * ```
     */
    static async showPrompt(message: string, defaultValue: string = '', title: string = '入力', inputType: string = 'text'): Promise<string | null> {
        return new Promise((resolve) => {
            const modal = document.getElementById('prompt-modal') as HTMLElement;
            const titleElement = document.getElementById('prompt-modal-label') as HTMLElement;
            const bodyElement = document.getElementById('prompt-modal-body') as HTMLElement;
            const inputElement = document.getElementById('prompt-modal-input') as HTMLInputElement;
            const okBtn = document.getElementById('prompt-ok-btn') as HTMLButtonElement;
            const cancelBtn = document.getElementById('prompt-cancel-btn') as HTMLButtonElement;

            titleElement.textContent = title;
            bodyElement.textContent = message;
            inputElement.type = inputType;
            inputElement.value = defaultValue;

            const bootstrapModal = new window.bootstrap.Modal(modal);
            
            const handleResult = (getResult: () => string | null) => {
                return () => {
                    const result = getResult();
                    okBtn.removeEventListener('click', handleOk);
                    cancelBtn.removeEventListener('click', handleCancel);
                    inputElement.removeEventListener('keydown', handleEnter);
                    modal.removeEventListener('hidden.bs.modal', handleHidden);
                    bootstrapModal.hide();
                    resolve(result);
                };
            };

            const handleOk = handleResult(() => inputElement.value);
            const handleCancel = handleResult(() => null);
            
            const handleEnter = (e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                    handleOk();
                }
            };
            
            const handleHidden = () => {
                okBtn.removeEventListener('click', handleOk);
                cancelBtn.removeEventListener('click', handleCancel);
                inputElement.removeEventListener('keydown', handleEnter);
                modal.removeEventListener('hidden.bs.modal', handleHidden);
                resolve(null);
            };

            okBtn.addEventListener('click', handleOk);
            cancelBtn.addEventListener('click', handleCancel);
            inputElement.addEventListener('keydown', handleEnter);
            modal.addEventListener('hidden.bs.modal', handleHidden);
            
            bootstrapModal.show();
            
            // Focus input after modal is shown
            setTimeout(() => {
                inputElement.focus();
                inputElement.select();
            }, ModalUtils.TIMING.MODAL_FOCUS_DELAY);
        });
    }

    /**
     * 選択モーダルを表示する（事前定義された選択肢からの選択）
     * 
     * @static
     * @async
     * @param {string} message - 選択を促すメッセージ
     * @param {{ value: string; text: string }[]} options - 選択肢の配列（valueは値、textは表示テキスト）
     * @param {string} [title='選択'] - モーダルのタイトル
     * @returns {Promise<string | null>} 選択された値、キャンセルされた場合はnull
     * 
     * @example
     * ```typescript
     * // 基本的な選択ダイアログ
     * const difficulty = await ModalUtils.showSelect(
     *     '難易度を選択してください',
     *     [
     *         { value: 'easy', text: '簡単' },
     *         { value: 'normal', text: '普通' },
     *         { value: 'hard', text: '難しい' }
     *     ],
     *     '難易度選択'
     * );
     * 
     * if (difficulty) {
     *     console.log('選択された難易度:', difficulty);
     * }
     * 
     * // 言語選択の例
     * const language = await ModalUtils.showSelect(
     *     '言語を選択してください',
     *     [
     *         { value: 'ja', text: '日本語' },
     *         { value: 'en', text: 'English' },
     *         { value: 'zh', text: '中文' }
     *     ]
     * );
     * ```
     */
    static async showSelect(message: string, options: { value: string; text: string }[], title: string = '選択'): Promise<string | null> {
        return new Promise((resolve) => {
            const modal = document.getElementById('select-modal') as HTMLElement;
            const titleElement = document.getElementById('select-modal-label') as HTMLElement;
            const bodyElement = document.getElementById('select-modal-body') as HTMLElement;
            const selectElement = document.getElementById('select-modal-select') as HTMLSelectElement;
            const okBtn = document.getElementById('select-ok-btn') as HTMLButtonElement;
            const cancelBtn = document.getElementById('select-cancel-btn') as HTMLButtonElement;

            titleElement.textContent = title;
            bodyElement.textContent = message;
            
            // Clear and populate options
            selectElement.innerHTML = '';
            options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.value;
                optionElement.textContent = option.text;
                selectElement.appendChild(optionElement);
            });

            const bootstrapModal = new window.bootstrap.Modal(modal);
            
            const handleResult = (getResult: () => string | null) => {
                return () => {
                    const result = getResult();
                    okBtn.removeEventListener('click', handleOk);
                    cancelBtn.removeEventListener('click', handleCancel);
                    modal.removeEventListener('hidden.bs.modal', handleHidden);
                    bootstrapModal.hide();
                    resolve(result);
                };
            };

            const handleOk = handleResult(() => selectElement.value);
            const handleCancel = handleResult(() => null);
            
            const handleHidden = () => {
                okBtn.removeEventListener('click', handleOk);
                cancelBtn.removeEventListener('click', handleCancel);
                modal.removeEventListener('hidden.bs.modal', handleHidden);
                resolve(null);
            };

            okBtn.addEventListener('click', handleOk);
            cancelBtn.addEventListener('click', handleCancel);
            modal.addEventListener('hidden.bs.modal', handleHidden);
            
            bootstrapModal.show();
        });
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

    /**
     * カスタム変数追加モーダルを表示する（デバッグ用）
     * 
     * @static
     * @async
     * @returns {Promise<{key: string, value: string | number | boolean} | null>} 入力されたキーと値のオブジェクト、キャンセルされた場合はnull
     * 
     * @description デバッグモーダルでボスのカスタム変数を追加するためのモーダルです。
     *              値は数値、ブール値、文字列の自動判定が行われます。
     * 
     * @example
     * ```typescript
     * // カスタム変数の追加
     * const result = await ModalUtils.showCustomVarModal();
     * if (result) {
     *     console.log('キー:', result.key);
     *     console.log('値:', result.value, 'タイプ:', typeof result.value);
     *     
     *     // 例: { key: 'attackCount', value: 5 } → 数値型
     *     // 例: { key: 'isActive', value: true } → ブール型
     *     // 例: { key: 'description', value: 'test' } → 文字列型
     * }
     * ```
     */
    static async showCustomVarModal(): Promise<{key: string, value: string | number | boolean} | null> {
        return new Promise((resolve) => {
            const modal = document.getElementById('custom-var-modal') as HTMLElement;
            const keyInput = document.getElementById('custom-var-key') as HTMLInputElement;
            const valueInput = document.getElementById('custom-var-value') as HTMLInputElement;
            const errorDiv = document.getElementById('custom-var-error') as HTMLElement;
            const addBtn = document.getElementById('custom-var-add-btn') as HTMLButtonElement;
            
            // Clear previous values and errors
            keyInput.value = '';
            valueInput.value = '';
            keyInput.classList.remove('is-invalid');
            valueInput.classList.remove('is-invalid');
            errorDiv.classList.add('d-none');

            const bootstrapModal = new window.bootstrap.Modal(modal);
            
            const showError = (message: string) => {
                errorDiv.textContent = message;
                errorDiv.classList.remove('d-none');
                
                // Shake effect
                modal.querySelector('.modal-dialog')?.classList.add('modal-shake');
                setTimeout(() => {
                    modal.querySelector('.modal-dialog')?.classList.remove('modal-shake');
                }, ModalUtils.TIMING.ERROR_SHAKE_DURATION);
            };

            const validateAndSubmit = () => {
                const key = keyInput.value.trim();
                const value = valueInput.value.trim();
                
                // Reset error states
                keyInput.classList.remove('is-invalid');
                valueInput.classList.remove('is-invalid');
                errorDiv.classList.add('d-none');

                if (!key) {
                    showError('変数名を入力してください');
                    keyInput.classList.add('is-invalid');
                    keyInput.focus();
                    return;
                }

                if (!value) {
                    showError('値を入力してください');
                    valueInput.classList.add('is-invalid');
                    valueInput.focus();
                    return;
                }

                // Parse value
                let parsedValue: string | number | boolean = value;
                if (!Number.isNaN(Number(value))) {
                    parsedValue = Number(value);
                } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
                    parsedValue = value.toLowerCase() === 'true';
                }

                // Success - close modal and return result
                cleanup();
                bootstrapModal.hide();
                resolve({ key, value: parsedValue });
            };

            const cleanup = () => {
                addBtn.removeEventListener('click', validateAndSubmit);
                keyInput.removeEventListener('keydown', handleEnter);
                valueInput.removeEventListener('keydown', handleEnter);
                modal.removeEventListener('hidden.bs.modal', handleHidden);
            };

            const handleEnter = (e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                    validateAndSubmit();
                }
            };

            const handleHidden = () => {
                cleanup();
                resolve(null);
            };

            addBtn.addEventListener('click', validateAndSubmit);
            keyInput.addEventListener('keydown', handleEnter);
            valueInput.addEventListener('keydown', handleEnter);
            modal.addEventListener('hidden.bs.modal', handleHidden);
            
            bootstrapModal.show();
            
            // Focus first input after modal is shown
            setTimeout(() => {
                keyInput.focus();
            }, ModalUtils.TIMING.MODAL_FOCUS_DELAY);
        });
    }

    /**
     * ステータス効果追加モーダルを表示する（デバッグ用）
     * 
     * @static
     * @async
     * @param {'player' | 'boss'} target - ステータス効果を適用するターゲット（プレイヤーまたはボス）
     * @param {string[]} statusTypes - 選択可能なステータス効果タイプの配列
     * @returns {Promise<{type: string, duration: number} | null>} 選択されたステータス効果タイプと持続ターン数、キャンセルされた場合はnull
     * 
     * @description デバッグモーダルでプレイヤーまたはボスにステータス効果を追加するためのモーダルです。
     *              ターン数は1〜99の範囲で入力できます。
     * 
     * @example
     * ```typescript
     * // プレイヤーにステータス効果を追加
     * const statusTypes = ['fire', 'poison', 'charm', 'slow'];
     * const result = await ModalUtils.showStatusEffectModal('player', statusTypes);
     * if (result) {
     *     console.log('選択されたステータス効果:', result.type);
     *     console.log('持続ターン数:', result.duration);
     *     
     *     // 例: { type: 'fire', duration: 5 }
     *     player.statusEffectManager.addEffect(result.type, result.duration);
     * }
     * 
     * // ボスにステータス効果を追加
     * const bossResult = await ModalUtils.showStatusEffectModal('boss', statusTypes);
     * ```
     */
    static async showStatusEffectModal(target: 'player' | 'boss', statusTypes: string[]): Promise<{type: string, duration: number} | null> {
        return new Promise((resolve) => {
            const modal = document.getElementById('status-effect-modal') as HTMLElement;
            const titleElement = document.getElementById('status-effect-modal-title') as HTMLElement;
            const typeSelect = document.getElementById('status-effect-type') as HTMLSelectElement;
            const durationInput = document.getElementById('status-effect-duration') as HTMLInputElement;
            const errorDiv = document.getElementById('status-effect-error') as HTMLElement;
            const addBtn = document.getElementById('status-effect-add-btn') as HTMLButtonElement;
            
            // Set title
            titleElement.textContent = `${target === 'player' ? 'プレイヤー' : 'ボス'}のステータス効果を追加`;
            
            // Populate status types
            typeSelect.innerHTML = '';
            statusTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                typeSelect.appendChild(option);
            });
            
            // Reset values and errors
            durationInput.value = '3';
            durationInput.classList.remove('is-invalid');
            errorDiv.classList.add('d-none');

            const bootstrapModal = new window.bootstrap.Modal(modal);
            
            const showError = (message: string) => {
                errorDiv.textContent = message;
                errorDiv.classList.remove('d-none');
                
                // Shake effect
                modal.querySelector('.modal-dialog')?.classList.add('modal-shake');
                setTimeout(() => {
                    modal.querySelector('.modal-dialog')?.classList.remove('modal-shake');
                }, ModalUtils.TIMING.ERROR_SHAKE_DURATION);
            };

            const validateAndSubmit = () => {
                const type = typeSelect.value;
                const duration = parseInt(durationInput.value);
                
                // Reset error states
                durationInput.classList.remove('is-invalid');
                errorDiv.classList.add('d-none');

                if (isNaN(duration) || duration < 1) {
                    showError('有効なターン数を入力してください（1以上）');
                    durationInput.classList.add('is-invalid');
                    durationInput.focus();
                    return;
                }

                if (duration > 99) {
                    showError('ターン数は99以下で入力してください');
                    durationInput.classList.add('is-invalid');
                    durationInput.focus();
                    return;
                }

                // Success - close modal and return result
                cleanup();
                bootstrapModal.hide();
                resolve({ type, duration });
            };

            const cleanup = () => {
                addBtn.removeEventListener('click', validateAndSubmit);
                durationInput.removeEventListener('keydown', handleEnter);
                modal.removeEventListener('hidden.bs.modal', handleHidden);
            };

            const handleEnter = (e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                    validateAndSubmit();
                }
            };

            const handleHidden = () => {
                cleanup();
                resolve(null);
            };

            addBtn.addEventListener('click', validateAndSubmit);
            durationInput.addEventListener('keydown', handleEnter);
            modal.addEventListener('hidden.bs.modal', handleHidden);
            
            bootstrapModal.show();
            
            // Focus duration input after modal is shown
            setTimeout(() => {
                durationInput.focus();
                durationInput.select();
            }, ModalUtils.TIMING.MODAL_FOCUS_DELAY);
        });
    }
}