/**
 * Bootstrap Modal Utilities
 * Replaces browser's alert(), confirm(), prompt() with Bootstrap modals
 */

export class ModalUtils {
    /**
     * Show a toast notification (replacement for showMessage)
     */
    static showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toastId = `toast-${Date.now()}`;
        const bgClass = this.getToastBgClass(type);
        const iconClass = this.getToastIcon(type);

        const toastHtml = `
            <div id="${toastId}" class="toast show" role="alert">
                <div class="toast-header ${bgClass} text-white">
                    <span class="me-2">${iconClass}</span>
                    <strong class="me-auto">${this.getToastTitle(type)}</strong>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        `;

        toastContainer.insertAdjacentHTML('beforeend', toastHtml);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            const toastElement = document.getElementById(toastId);
            if (toastElement) {
                const toast = new (window as any).bootstrap.Toast(toastElement);
                toast.hide();
                setTimeout(() => {
                    toastElement.remove();
                }, 300);
            }
        }, 4000);
    }

    /**
     * Show alert modal (replacement for alert())
     */
    static async showAlert(message: string, title: string = '通知'): Promise<void> {
        return new Promise((resolve) => {
            const modal = document.getElementById('alert-modal') as HTMLElement;
            const titleElement = document.getElementById('alert-modal-title') as HTMLElement;
            const bodyElement = document.getElementById('alert-modal-body') as HTMLElement;

            titleElement.textContent = title;
            bodyElement.textContent = message;

            const bootstrapModal = new (window as any).bootstrap.Modal(modal);
            
            const handleHidden = () => {
                modal.removeEventListener('hidden.bs.modal', handleHidden);
                resolve();
            };

            modal.addEventListener('hidden.bs.modal', handleHidden);
            bootstrapModal.show();
        });
    }

    /**
     * Show confirm modal (replacement for confirm())
     */
    static async showConfirm(message: string, title: string = '確認'): Promise<boolean> {
        return new Promise((resolve) => {
            const modal = document.getElementById('confirm-modal') as HTMLElement;
            const titleElement = document.getElementById('confirm-modal-title') as HTMLElement;
            const bodyElement = document.getElementById('confirm-modal-body') as HTMLElement;
            const okBtn = document.getElementById('confirm-ok-btn') as HTMLButtonElement;
            const cancelBtn = document.getElementById('confirm-cancel-btn') as HTMLButtonElement;

            titleElement.textContent = title;
            bodyElement.textContent = message;

            const bootstrapModal = new (window as any).bootstrap.Modal(modal);
            
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
     * Show prompt modal (replacement for prompt())
     */
    static async showPrompt(message: string, defaultValue: string = '', title: string = '入力', inputType: string = 'text'): Promise<string | null> {
        return new Promise((resolve) => {
            const modal = document.getElementById('prompt-modal') as HTMLElement;
            const titleElement = document.getElementById('prompt-modal-title') as HTMLElement;
            const bodyElement = document.getElementById('prompt-modal-body') as HTMLElement;
            const inputElement = document.getElementById('prompt-modal-input') as HTMLInputElement;
            const okBtn = document.getElementById('prompt-ok-btn') as HTMLButtonElement;
            const cancelBtn = document.getElementById('prompt-cancel-btn') as HTMLButtonElement;

            titleElement.textContent = title;
            bodyElement.textContent = message;
            inputElement.type = inputType;
            inputElement.value = defaultValue;

            const bootstrapModal = new (window as any).bootstrap.Modal(modal);
            
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
            }, 300);
        });
    }

    /**
     * Show select modal (replacement for prompt() with predefined options)
     */
    static async showSelect(message: string, options: { value: string; text: string }[], title: string = '選択'): Promise<string | null> {
        return new Promise((resolve) => {
            const modal = document.getElementById('select-modal') as HTMLElement;
            const titleElement = document.getElementById('select-modal-title') as HTMLElement;
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

            const bootstrapModal = new (window as any).bootstrap.Modal(modal);
            
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

    private static getToastBgClass(type: string): string {
        switch (type) {
            case 'success': return 'bg-success';
            case 'error': return 'bg-danger';
            case 'warning': return 'bg-warning';
            case 'info':
            default: return 'bg-info';
        }
    }

    private static getToastIcon(type: string): string {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'info':
            default: return 'ℹ️';
        }
    }

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