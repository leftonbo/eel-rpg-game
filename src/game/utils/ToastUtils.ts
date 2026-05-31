import { t } from '../i18n';

export enum ToastType {
    Success = 'success',
    Error = 'error',
    Info = 'info',
    Warning = 'warning',
}

export interface ToastRequest {
    message: string;
    title?: string;
    type: ToastType;
}

export interface ToastController {
    showToast(request: ToastRequest): void;
}

let toastController: ToastController | null = null;
const pendingToasts: ToastRequest[] = [];

export function registerToastController(controller: ToastController | null): void {
    toastController = controller;

    if (!toastController) return;

    while (pendingToasts.length > 0) {
        const request = pendingToasts.shift();
        if (request) {
            toastController.showToast(request);
        }
    }
}

export class ToastUtils {
    static showToast(message: string, type: ToastType): void;
    static showToast(message: string, title: string, type: ToastType): void;
    static showToast(message: string, arg2: string | ToastType, arg3?: ToastType): void {
        const { title, type } = this.parseArgs(arg2, arg3);
        const request: ToastRequest = { message, title, type };

        if (toastController) {
            toastController.showToast(request);
            return;
        }

        pendingToasts.push(request);
    }

    private static parseArgs(arg2: string | ToastType, arg3?: ToastType): { title?: string; type: ToastType } {
        if (Object.values(ToastType).includes(arg2 as ToastType) && !arg3) {
            return {
                title: undefined,
                type: arg2 as ToastType,
            };
        }

        return {
            title: arg2,
            type: arg3 || ToastType.Info,
        };
    }

    static getDefaultTitle(type: ToastType): string {
        switch (type) {
            case ToastType.Success:
                return t('toasts.types.success');
            case ToastType.Error:
                return t('toasts.types.error');
            case ToastType.Warning:
                return t('toasts.types.warning');
            case ToastType.Info:
            default:
                return t('toasts.types.info');
        }
    }
}
