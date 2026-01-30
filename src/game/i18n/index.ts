import i18next from 'i18next';
import { resources } from './resources';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from './types';

const STORAGE_KEY = 'language';
const DEFAULT_LANGUAGE: SupportedLanguage = 'ja';

export async function initI18n(): Promise<void> {
    const storedLanguage = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
    const initialLanguage = storedLanguage && SUPPORTED_LANGUAGES.includes(storedLanguage)
        ? storedLanguage
        : DEFAULT_LANGUAGE;

    await i18next.init({
        lng: initialLanguage,
        fallbackLng: DEFAULT_LANGUAGE,
        resources,
        interpolation: {
            escapeValue: false
        }
    });

    document.documentElement.lang = initialLanguage;
}

export function t(key: string, options?: Record<string, unknown>): string {
    return i18next.t(key, options);
}

export async function setLanguage(language: SupportedLanguage): Promise<void> {
    if (!SUPPORTED_LANGUAGES.includes(language)) {
        return;
    }

    await i18next.changeLanguage(language);
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
}

export function getLanguage(): SupportedLanguage {
    return (i18next.language as SupportedLanguage) || DEFAULT_LANGUAGE;
}

export function onLanguageChanged(callback: (language: SupportedLanguage) => void): void {
    i18next.on('languageChanged', (language: string) => {
        callback(language as SupportedLanguage);
    });
}
