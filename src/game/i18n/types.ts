export const SUPPORTED_LANGUAGES = ['ja', 'en'] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export interface BossTranslationData {
    displayName?: string;
    description?: string;
    questNote?: string;
    appearanceNote?: string;
    guestCharacterInfo?: {
        characterName?: string;
        creator?: string;
    };
    victoryTrophy?: {
        name?: string;
        description?: string;
    };
    defeatTrophy?: {
        name?: string;
        description?: string;
    };
    actions?: Record<string, {
        name?: string;
        description?: string;
        messages?: string[];
    }>;
    battleStartMessages?: Array<{
        text: string;
    }>;
    victoryMessages?: Array<{
        text: string;
    }>;
    personality?: string[];
}

export interface BossTranslation {
    ja: BossTranslationData;
    en: BossTranslationData;
}
