import { SkillData, UnlockCondition } from '../../data/skills';
import { t } from '../../i18n';

/**
 * スキル表示の共通コンポーネント
 * アクティブスキルとパッシブスキルの表示ロジックを統一化
 */
export class SkillDisplayComponent {
    /**
     * スキル要素を作成する
     * @param skill スキルデータ
     * @param isPassive パッシブスキルかどうか
     * @returns 作成されたスキル要素
     */
    static createSkillElement(skill: SkillData, isPassive: boolean = false): HTMLElement {
        const skillElement = document.createElement('div');
        skillElement.className = 'skill-item mb-3 p-3 border rounded';
        
        if (isPassive) {
            skillElement.innerHTML = this.createPassiveSkillHTML(skill);
        } else {
            skillElement.innerHTML = this.createActiveSkillHTML(skill);
        }
        
        return skillElement;
    }

    /**
     * アクティブスキルのHTMLを作成する
     * @param skill スキルデータ
     * @returns HTML文字列
     */
    private static createActiveSkillHTML(skill: SkillData): string {
        const categoryColor = this.getSkillCategoryColor(skill.category);
        const categoryName = this.getSkillCategoryName(skill.category);
        const mpCostText = t('skills.mpCost', { cost: skill.mpCost });
        
        return `
            <div class="skill-header d-flex justify-content-between align-items-start mb-2">
                <div class="skill-info flex-grow-1 me-3">
                    <h6 class="skill-name mb-1">${skill.name}</h6>
                    <p class="skill-description mb-0">${skill.description}</p>
                </div>
                <div class="skill-meta text-end flex-shrink-0">
                    <span class="badge bg-${categoryColor} mb-1">${categoryName}</span>
                    <div class="skill-cost">${mpCostText}</div>
                </div>
            </div>
            ${this.getSkillDetails(skill)}
        `;
    }

    /**
     * パッシブスキルのHTMLを作成する
     * @param skill スキルデータ
     * @returns HTML文字列
     */
    private static createPassiveSkillHTML(skill: SkillData): string {
        return `
            <div class="skill-header d-flex justify-content-between align-items-start mb-2">
                <div class="skill-info flex-grow-1 me-3">
                    <h6 class="skill-name mb-1">${skill.name}</h6>
                    <p class="skill-description mb-0">${skill.description}</p>
                </div>
                <div class="skill-meta text-end flex-shrink-0">
                    <span class="badge bg-info">${t('skills.passiveBadge')}</span>
                </div>
            </div>
            ${this.getSkillUnlockCondition(skill)}
        `;
    }

    /**
     * スキルの詳細情報を取得する
     * @param skill スキルデータ
     * @returns 詳細情報のHTML文字列
     */
    private static getSkillDetails(skill: SkillData): string {
        const details = [];
        
        if (skill.damageMultiplier && skill.damageMultiplier > 1) {
            details.push(t('skills.details.damageMultiplier', { value: skill.damageMultiplier }));
        }
        
        if (skill.criticalRate && skill.criticalRate > 0.05) {
            details.push(t('skills.details.criticalRate', { value: Math.round(skill.criticalRate * 100) }));
        }
        
        if (skill.hitRate && skill.hitRate < 1) {
            details.push(t('skills.details.hitRate', { value: Math.round(skill.hitRate * 100) }));
        }
        
        if (skill.healAmount) {
            details.push(t('skills.details.healAmount', { value: skill.healAmount }));
        }
        
        if (skill.healPercentage) {
            details.push(t('skills.details.healPercentage', { value: Math.round(skill.healPercentage * 100) }));
        }
        
        const unlockCondition = this.getSkillUnlockCondition(skill);
        
        if (details.length > 0 || unlockCondition) {
            return `
                <div class="skill-details">
                    ${details.length > 0 ? `<div class="skill-stats mb-1">${details.join(' / ')}</div>` : ''}
                    ${unlockCondition}
                </div>
            `;
        }
        
        return '';
    }

    /**
     * スキルの解放条件を取得する
     * @param skill スキルデータ
     * @returns 解放条件のHTML文字列
     */
    private static getSkillUnlockCondition(skill: SkillData): string {
        if (skill.unlockConditions && skill.unlockConditions.length > 0) {
            const conditions = skill.unlockConditions.map((condition: UnlockCondition) => {
                const abilityKey = `abilities.names.${condition.abilityType}`;
                const abilityName = t(abilityKey);
                return t('skills.unlockConditionItem', { ability: abilityName, level: condition.requiredLevel });
            });
            return `<div class="skill-unlock-condition">${t('skills.unlockConditionsLabel')}: ${conditions.join(', ')}</div>`;
        }
        return '';
    }

    /**
     * スキルカテゴリの色を取得する
     * @param category カテゴリ
     * @returns Bootstrap色クラス
     */
    private static getSkillCategoryColor(category: string): string {
        switch (category) {
            case 'combat': return 'danger';
            case 'defense': return 'primary';
            case 'support': return 'success';
            case 'passive': return 'info';
            default: return 'secondary';
        }
    }
    
    /**
     * スキルカテゴリの日本語名を取得する
     * @param category カテゴリ
     * @returns 日本語名
     */
    private static getSkillCategoryName(category: string): string {
        switch (category) {
            case 'combat': return t('skills.categories.combat');
            case 'defense': return t('skills.categories.defense');
            case 'support': return t('skills.categories.support');
            case 'passive': return t('skills.categories.passive');
            default: return t('skills.categories.other');
        }
    }


    /**
     * スキルリストを更新する
     * @param containerId コンテナ要素のID
     * @param skills スキルデータの配列
     * @param isPassive パッシブスキルかどうか
     * @param emptyMessage スキルがない場合のメッセージ
     */
    static updateSkillsList(
        containerId: string, 
        skills: SkillData[], 
        isPassive: boolean = false,
        emptyMessage: string = t('skills.empty.default')
    ): void {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Skill container with id '${containerId}' not found`);
            return;
        }

        // コンテナをクリア
        container.innerHTML = '';

        if (skills.length === 0) {
            container.innerHTML = `<div class="text-muted">${emptyMessage}</div>`;
            return;
        }

        // 各スキルの要素を作成して追加
        skills.forEach(skill => {
            const skillElement = this.createSkillElement(skill, isPassive);
            container.appendChild(skillElement);
        });
    }

    /**
     * アクティブスキルリストを更新する
     * @param containerId コンテナ要素のID
     * @param skills 全スキルデータの配列
     */
    static updateActiveSkillsList(containerId: string, skills: SkillData[]): void {
        const activeSkills = skills.filter(skill => !skill.isPassive);
        this.updateSkillsList(containerId, activeSkills, false, t('skills.empty.active'));
    }

    /**
     * パッシブスキルリストを更新する
     * @param containerId コンテナ要素のID
     * @param skills パッシブスキルデータの配列
     */
    static updatePassiveSkillsList(containerId: string, skills: SkillData[]): void {
        this.updateSkillsList(containerId, skills, true, t('skills.empty.passive'));
    }

    /**
     * スキル情報をテキスト形式で取得する（デバッグ用）
     * @param skill スキルデータ
     * @returns スキル情報のテキスト
     */
    static getSkillInfoText(skill: SkillData): string {
        const parts = [
            t('skills.info.name', { name: skill.name }),
            t('skills.info.description', { description: skill.description }),
            t('skills.info.category', { category: this.getSkillCategoryName(skill.category) })
        ];

        if (skill.mpCost > 0) {
            parts.push(t('skills.info.mpCost', { cost: skill.mpCost }));
        }

        if (skill.damageMultiplier && skill.damageMultiplier > 1) {
            parts.push(t('skills.details.damageMultiplier', { value: skill.damageMultiplier }));
        }

        if (skill.unlockConditions && skill.unlockConditions.length > 0) {
            const conditions = skill.unlockConditions.map(condition => {
                const abilityName = t(`abilities.names.${condition.abilityType}`);
                return t('skills.unlockConditionItem', { ability: abilityName, level: condition.requiredLevel });
            });
            parts.push(`${t('skills.unlockConditionsLabel')}: ${conditions.join(', ')}`);
        }

        return parts.join('\n');
    }
}