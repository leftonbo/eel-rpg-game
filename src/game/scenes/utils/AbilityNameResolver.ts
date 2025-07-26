/**
 * アビリティ名変換の共通ユーティリティクラス
 * アビリティタイプと日本語名の相互変換を提供
 */
export class AbilityNameResolver {
    /**
     * アビリティタイプから日本語名への変換マップ
     */
    private static readonly ABILITY_NAME_MAP: { [key: string]: string } = {
        'combat': 'コンバット',
        'toughness': 'タフネス', 
        'craftwork': 'クラフトワーク',
        'endurance': 'エンデュランス',
        'agility': 'アジリティ',
        'explorer': 'エクスプローラー'
    };

    /**
     * 日本語名からアビリティタイプへの逆引きマップ
     */
    private static readonly REVERSE_ABILITY_NAME_MAP: { [key: string]: string } = {
        'コンバット': 'combat',
        'タフネス': 'toughness',
        'クラフトワーク': 'craftwork', 
        'エンデュランス': 'endurance',
        'アジリティ': 'agility',
        'エクスプローラー': 'explorer'
    };

    /**
     * アビリティタイプから日本語名に変換する
     * @param abilityType アビリティタイプ（英語）
     * @returns 日本語名、未知のタイプの場合は元の値をそのまま返す
     */
    static getAbilityName(abilityType: string): string {
        return this.ABILITY_NAME_MAP[abilityType] || abilityType;
    }

    /**
     * 日本語名からアビリティタイプに変換する
     * @param japaneseName 日本語名
     * @returns アビリティタイプ（英語）、未知の名前の場合は元の値をそのまま返す
     */
    static getAbilityType(japaneseName: string): string {
        return this.REVERSE_ABILITY_NAME_MAP[japaneseName] || japaneseName;
    }

    /**
     * 有効なアビリティタイプかどうかを判定する
     * @param abilityType 判定するアビリティタイプ
     * @returns 有効なアビリティタイプの場合はtrue
     */
    static isValidAbilityType(abilityType: string): boolean {
        return abilityType in this.ABILITY_NAME_MAP;
    }

    /**
     * 有効な日本語名かどうかを判定する
     * @param japaneseName 判定する日本語名
     * @returns 有効な日本語名の場合はtrue
     */
    static isValidJapaneseName(japaneseName: string): boolean {
        return japaneseName in this.REVERSE_ABILITY_NAME_MAP;
    }

    /**
     * 全ての有効なアビリティタイプを取得する
     * @returns アビリティタイプの配列
     */
    static getAllAbilityTypes(): string[] {
        return Object.keys(this.ABILITY_NAME_MAP);
    }

    /**
     * 全ての日本語名を取得する
     * @returns 日本語名の配列
     */
    static getAllJapaneseNames(): string[] {
        return Object.values(this.ABILITY_NAME_MAP);
    }

    /**
     * アビリティタイプと日本語名のペアを取得する
     * @returns [アビリティタイプ, 日本語名]のタプル配列
     */
    static getAllAbilityPairs(): [string, string][] {
        return Object.entries(this.ABILITY_NAME_MAP);
    }

    /**
     * 複数のアビリティタイプを一括で日本語名に変換する
     * @param abilityTypes アビリティタイプの配列
     * @returns 日本語名の配列
     */
    static getAbilityNames(abilityTypes: string[]): string[] {
        return abilityTypes.map(type => this.getAbilityName(type));
    }

    /**
     * 複数の日本語名を一括でアビリティタイプに変換する
     * @param japaneseNames 日本語名の配列
     * @returns アビリティタイプの配列
     */
    static getAbilityTypes(japaneseNames: string[]): string[] {
        return japaneseNames.map(name => this.getAbilityType(name));
    }

    /**
     * アビリティレベル表示用の文字列を生成する
     * @param abilityType アビリティタイプ
     * @param level レベル
     * @returns "コンバットレベル 5" のような形式の文字列
     */
    static formatAbilityLevel(abilityType: string, level: number): string {
        const japaneseName = this.getAbilityName(abilityType);
        return `${japaneseName}レベル ${level}`;
    }

    /**
     * アビリティの解放条件文字列を生成する
     * @param conditions {abilityType: string, requiredLevel: number}の配列
     * @returns "コンバットレベル 3, タフネスレベル 2" のような形式の文字列
     */
    static formatUnlockConditions(conditions: {abilityType: string, requiredLevel: number}[]): string {
        return conditions.map(condition => 
            this.formatAbilityLevel(condition.abilityType, condition.requiredLevel)
        ).join(', ');
    }

    /**
     * デバッグ用：現在登録されているすべてのマッピングを表示
     * @returns マッピング情報のオブジェクト
     */
    static getDebugInfo(): { 
        abilityNameMap: typeof AbilityNameResolver.ABILITY_NAME_MAP,
        reverseMap: typeof AbilityNameResolver.REVERSE_ABILITY_NAME_MAP,
        totalMappings: number
    } {
        return {
            abilityNameMap: { ...this.ABILITY_NAME_MAP },
            reverseMap: { ...this.REVERSE_ABILITY_NAME_MAP },
            totalMappings: Object.keys(this.ABILITY_NAME_MAP).length
        };
    }
}