import { SkillData, UnlockCondition } from '../../data/skills';
import { AbilityNameResolver } from '../utils/AbilityNameResolver';

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
        const mpCostText = skill.mpCost > 0 ? `MP: ${skill.mpCost}` : 'MP: 0';
        
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
                    <span class="badge bg-info">パッシブ</span>
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
            details.push(`威力: ${skill.damageMultiplier}倍`);
        }
        
        if (skill.criticalRate && skill.criticalRate > 0.05) {
            details.push(`クリティカル率: ${Math.round(skill.criticalRate * 100)}%`);
        }
        
        if (skill.hitRate && skill.hitRate < 1) {
            details.push(`命中率: ${Math.round(skill.hitRate * 100)}%`);
        }
        
        if (skill.healAmount) {
            details.push(`回復量: ${skill.healAmount}`);
        }
        
        if (skill.healPercentage) {
            details.push(`回復率: ${Math.round(skill.healPercentage * 100)}%`);
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
                const abilityName = AbilityNameResolver.getAbilityName(condition.abilityType);
                return `${abilityName}レベル ${condition.requiredLevel}`;
            });
            return `<div class="skill-unlock-condition">解放条件: ${conditions.join(', ')}</div>`;
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
            case 'combat': return '攻撃';
            case 'defense': return '防御';
            case 'support': return '支援';
            case 'passive': return 'パッシブ';
            default: return 'その他';
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
        emptyMessage: string = '解放されたスキルがありません'
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
        this.updateSkillsList(containerId, activeSkills, false, '解放されたアクティブスキルがありません');
    }

    /**
     * パッシブスキルリストを更新する
     * @param containerId コンテナ要素のID
     * @param skills パッシブスキルデータの配列
     */
    static updatePassiveSkillsList(containerId: string, skills: SkillData[]): void {
        this.updateSkillsList(containerId, skills, true, '解放されたパッシブスキルがありません');
    }

    /**
     * スキル情報をテキスト形式で取得する（デバッグ用）
     * @param skill スキルデータ
     * @returns スキル情報のテキスト
     */
    static getSkillInfoText(skill: SkillData): string {
        const parts = [
            `名前: ${skill.name}`,
            `説明: ${skill.description}`,
            `カテゴリ: ${this.getSkillCategoryName(skill.category)}`
        ];

        if (skill.mpCost > 0) {
            parts.push(`MP消費: ${skill.mpCost}`);
        }

        if (skill.damageMultiplier && skill.damageMultiplier > 1) {
            parts.push(`威力: ${skill.damageMultiplier}倍`);
        }

        if (skill.unlockConditions && skill.unlockConditions.length > 0) {
            const conditions = skill.unlockConditions.map(condition => 
                `${AbilityNameResolver.getAbilityName(condition.abilityType)}Lv.${condition.requiredLevel}`
            );
            parts.push(`解放条件: ${conditions.join(', ')}`);
        }

        return parts.join('\n');
    }
}