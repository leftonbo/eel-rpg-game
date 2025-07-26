/**
 * プログレスバー計算の共通ユーティリティクラス
 * アビリティレベルの経験値とプログレスバーの計算を統一化
 */
export class ProgressCalculator {
    /**
     * アビリティの現在レベルでの経験値進行度を計算する
     * @param level 現在のレベル
     * @param experience 現在の経験値
     * @returns 0-100の範囲のパーセンテージ
     */
    static calculateAbilityProgress(level: number, experience: number): number {
        if (level <= 0) {
            // レベル0の場合、次のレベル（レベル1）までの進行度
            const nextLevelExp = this.getRequiredExperienceForLevel(1);
            return Math.min((experience / nextLevelExp) * 100, 100);
        }

        const currentLevelBaseExp = this.getRequiredExperienceForLevel(level);
        const nextLevelExp = this.getRequiredExperienceForLevel(level + 1);
        
        // 現在レベルでの経験値進行度
        const currentLevelExp = experience - currentLevelBaseExp;
        const expNeededForNextLevel = nextLevelExp - currentLevelBaseExp;
        
        if (expNeededForNextLevel <= 0) {
            return 100; // 最大レベルに達している場合
        }
        
        const percentage = (currentLevelExp / expNeededForNextLevel) * 100;
        return Math.min(Math.max(percentage, 0), 100); // 0-100の範囲に制限
    }

    /**
     * 指定されたレベルに必要な累積経験値を計算する
     * @param level 目標レベル
     * @returns 累積経験値
     */
    static getRequiredExperienceForLevel(level: number): number {
        if (level <= 0) return 0;
        return Math.pow(level, 3) * 50;
    }

    /**
     * 現在の経験値から次のレベルまでに必要な経験値を計算する
     * @param level 現在のレベル
     * @param experience 現在の経験値
     * @returns 次のレベルまでに必要な経験値
     */
    static calculateExperienceToNext(level: number, experience: number): number {
        const nextLevelExp = this.getRequiredExperienceForLevel(level + 1);
        const remaining = nextLevelExp - experience;
        return Math.max(remaining, 0);
    }

    /**
     * 経験値からレベルを逆算する
     * @param experience 経験値
     * @returns 対応するレベル
     */
    static calculateLevelFromExperience(experience: number): number {
        if (experience <= 0) return 0;
        
        // 立方根を使って効率的にレベルを計算
        const level = Math.floor(Math.cbrt(experience / 50));
        
        // 境界値チェック
        if (this.getRequiredExperienceForLevel(level + 1) <= experience) {
            return level + 1;
        }
        
        return level;
    }

    /**
     * プログレスバーのHTML要素を更新する
     * @param elementId プログレスバー要素のID
     * @param level 現在のレベル
     * @param experience 現在の経験値
     */
    static updateProgressBar(elementId: string, level: number, experience: number): void {
        const progressElement = document.getElementById(elementId);
        if (!progressElement) {
            console.warn(`Progress bar element with id '${elementId}' not found`);
            return;
        }

        const percentage = this.calculateAbilityProgress(level, experience);
        progressElement.style.width = `${percentage}%`;
        
        // アクセシビリティのためのaria属性を設定
        progressElement.setAttribute('aria-valuenow', percentage.toString());
        progressElement.setAttribute('aria-valuemin', '0');
        progressElement.setAttribute('aria-valuemax', '100');
    }

    /**
     * アビリティデータからプログレス情報を取得する
     * @param abilityData アビリティデータオブジェクト
     * @returns プログレス情報
     */
    static getProgressInfo(abilityData: { level: number; experience: number }): {
        percentage: number;
        currentLevelExp: number;
        nextLevelExp: number;
        experienceToNext: number;
    } {
        const { level, experience } = abilityData;
        const percentage = this.calculateAbilityProgress(level, experience);
        const currentLevelBaseExp = this.getRequiredExperienceForLevel(level);
        const nextLevelExp = this.getRequiredExperienceForLevel(level + 1);
        const experienceToNext = this.calculateExperienceToNext(level, experience);
        
        return {
            percentage,
            currentLevelExp: experience - currentLevelBaseExp,
            nextLevelExp: nextLevelExp - currentLevelBaseExp,
            experienceToNext
        };
    }

    /**
     * 複数のプログレスバーを一括更新する
     * @param updates 更新する要素とアビリティデータのマップ
     */
    static updateMultipleProgressBars(updates: { [elementId: string]: { level: number; experience: number } }): void {
        Object.entries(updates).forEach(([elementId, abilityData]) => {
            this.updateProgressBar(elementId, abilityData.level, abilityData.experience);
        });
    }

    /**
     * レベルアップに必要な経験値を表示用にフォーマットする
     * @param experienceToNext 次のレベルまでの経験値
     * @returns フォーマットされた文字列
     */
    static formatExperienceToNext(experienceToNext: number): string {
        if (experienceToNext <= 0) {
            return 'MAX';
        }
        
        // 大きな数値の場合は単位を付ける
        if (experienceToNext >= 1000000) {
            return `${(experienceToNext / 1000000).toFixed(1)}M`;
        } else if (experienceToNext >= 1000) {
            return `${(experienceToNext / 1000).toFixed(1)}K`;
        }
        
        return experienceToNext.toString();
    }

    /**
     * レベルと経験値の表示を更新する
     * @param prefix 要素IDのプレフィックス
     * @param abilityData アビリティデータ
     */
    static updateLevelDisplay(prefix: string, abilityData: { level: number; experience: number; experienceToNext: number }): void {
        const levelElement = document.getElementById(`${prefix}-level`);
        const expElement = document.getElementById(`${prefix}-exp`);
        const nextElement = document.getElementById(`${prefix}-next`);
        const progressElement = document.getElementById(`${prefix}-progress`);

        if (levelElement) levelElement.textContent = abilityData.level.toString();
        if (expElement) expElement.textContent = abilityData.experience.toString();
        if (nextElement) nextElement.textContent = (abilityData.experience + abilityData.experienceToNext).toString();
        
        if (progressElement) {
            this.updateProgressBar(`${prefix}-progress`, abilityData.level, abilityData.experience);
        }
    }
}