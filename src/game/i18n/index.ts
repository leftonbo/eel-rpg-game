import i18next, { TOptions } from 'i18next';
import { resources } from './resources';

export type LanguageCode = 'ja' | 'en';

const LANGUAGE_STORAGE_KEY = 'game_language';

export async function initI18n(): Promise<void> {
    const storedLanguage = getStoredLanguage();
    await i18next.init({
        resources,
        lng: storedLanguage,
        fallbackLng: 'ja',
        interpolation: {
            escapeValue: false
        }
    });
}

export function t(key: string, options?: TOptions): string {
    return i18next.t(key, options) as string;
}

export function getLanguage(): LanguageCode {
    const lang = i18next.language as LanguageCode | undefined;
    return lang === 'en' ? 'en' : 'ja';
}

export function setLanguage(language: LanguageCode): void {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    void i18next.changeLanguage(language);
}

export function getStoredLanguage(): LanguageCode {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored === 'en' ? 'en' : 'ja';
}

export function applyI18nToDocument(root: ParentNode = document): void {
    const textElements = root.querySelectorAll<HTMLElement>('[data-i18n]');
    textElements.forEach(element => {
        const key = element.dataset.i18n;
        if (!key) return;
        element.textContent = t(key);
    });

    const htmlElements = root.querySelectorAll<HTMLElement>('[data-i18n-html]');
    htmlElements.forEach(element => {
        const key = element.dataset.i18nHtml;
        if (!key) return;
        element.innerHTML = t(key);
    });

    const attrElements = root.querySelectorAll<HTMLElement>('[data-i18n-attr]');
    attrElements.forEach(element => {
        const attrData = element.dataset.i18nAttr;
        if (!attrData) return;

        attrData.split(';').forEach(pair => {
            const [attr, key] = pair
                .split(':')
                .map(part => part.trim())
                .filter(Boolean);
            if (!attr || !key) return;
            element.setAttribute(attr, t(key));
        });
    });
}

export function tBoss<T = string>(bossId: string, key: string, options?: TOptions): T {
    const resolvedKey = `bosses.${bossId}.${key}`;
    return i18next.t(resolvedKey, { returnObjects: true, ...options }) as T;
}

export function getBossText<T>(bossId: string): T {
    return i18next.t(`bosses.${bossId}`, { returnObjects: true }) as T;
}
