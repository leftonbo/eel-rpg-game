import { t } from '../i18n';
import type { Boss } from '../entities/Boss';
import type { Player } from '../entities/Player';

export type BossModalMode = 'select' | 'info';
export type ChangelogModalResult = 'closed' | 'goto';

export interface SelectOption {
    value: string;
    text: string;
}

export interface CustomVarResult {
    key: string;
    value: string | number | boolean;
}

export interface StatusEffectModalResult {
    type: string;
    duration: number;
}

export interface BossModalRequest {
    bossId: string;
    mode: BossModalMode;
}

export interface ChangelogModalRequest {
    htmlContent: string;
}

export interface BattleDebugModalRequest {
    player: Player;
    boss: Boss;
}

export interface DialogController {
    showAlert(message: string, title: string): Promise<void>;
    showConfirm(message: string, title: string): Promise<boolean>;
    showPrompt(message: string, defaultValue: string, title: string, inputType: string): Promise<string | null>;
    showSelect(message: string, options: SelectOption[], title: string): Promise<string | null>;
    showCustomVarModal(): Promise<CustomVarResult | null>;
    showStatusEffectModal(target: 'player' | 'boss', statusTypes: string[]): Promise<StatusEffectModalResult | null>;
    showBossModal(request: BossModalRequest): Promise<boolean>;
    showChangelogModal(request: ChangelogModalRequest): Promise<ChangelogModalResult>;
    showBattleDebugModal(request: BattleDebugModalRequest): Promise<boolean>;
}

let dialogController: DialogController | null = null;

export function registerDialogController(controller: DialogController | null): void {
    dialogController = controller;
}

export class ModalUtils {
    static async showAlert(message: string, title: string = t('dialogs.common.alert.title')): Promise<void> {
        if (!dialogController) return Promise.resolve();
        return dialogController.showAlert(message, title);
    }

    static async showConfirm(message: string, title: string = t('dialogs.common.confirm.title')): Promise<boolean> {
        if (!dialogController) return Promise.resolve(false);
        return dialogController.showConfirm(message, title);
    }

    static async showPrompt(
        message: string,
        defaultValue: string = '',
        title: string = t('dialogs.common.prompt.title'),
        inputType: string = 'text'
    ): Promise<string | null> {
        if (!dialogController) return Promise.resolve(null);
        return dialogController.showPrompt(message, defaultValue, title, inputType);
    }

    static async showSelect(
        message: string,
        options: SelectOption[],
        title: string = t('dialogs.common.selectTitle')
    ): Promise<string | null> {
        if (!dialogController) return Promise.resolve(null);
        return dialogController.showSelect(message, options, title);
    }

    static async showCustomVarModal(): Promise<CustomVarResult | null> {
        if (!dialogController) return Promise.resolve(null);
        return dialogController.showCustomVarModal();
    }

    static async showStatusEffectModal(
        target: 'player' | 'boss',
        statusTypes: string[]
    ): Promise<StatusEffectModalResult | null> {
        if (!dialogController) return Promise.resolve(null);
        return dialogController.showStatusEffectModal(target, statusTypes);
    }

    static async showBossModal(request: BossModalRequest): Promise<boolean> {
        if (!dialogController) return Promise.resolve(false);
        return dialogController.showBossModal(request);
    }

    static async showChangelogModal(request: ChangelogModalRequest): Promise<ChangelogModalResult> {
        if (!dialogController) return Promise.resolve('closed');
        return dialogController.showChangelogModal(request);
    }

    static async showBattleDebugModal(request: BattleDebugModalRequest): Promise<boolean> {
        if (!dialogController) return Promise.resolve(false);
        return dialogController.showBattleDebugModal(request);
    }
}
