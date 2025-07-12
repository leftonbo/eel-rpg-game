export interface AttackResult {
    damage: number;
    isMiss: boolean;
    isCritical: boolean;
    message: string;
}

/**
 * ダメージにランダムなゆらぎを適用する（±20%）
 */
export function applyDamageVariance(baseDamage: number): number {
    if (baseDamage <= 0) return 0;
    
    // 80% - 120% のランダム係数を適用
    const variance = 0.8 + Math.random() * 0.4;
    return Math.floor(baseDamage * variance);
}

/**
 * ダメージにカスタムゆらぎを適用する
 * @param baseDamage 基本ダメージ
 * @param minPercent 最小ゆらぎ（％）例: -20
 * @param maxPercent 最大ゆらぎ（％）例: +50
 */
export function applyCustomDamageVariance(baseDamage: number, minPercent: number = -20, maxPercent: number = 20): number {
    if (baseDamage <= 0) return 0;
    
    // パーセンテージを係数に変換（例: -20% → 0.8, +50% → 1.5）
    const minVariance = 1 + minPercent / 100;
    const maxVariance = 1 + maxPercent / 100;
    
    // ランダム係数を計算
    const variance = minVariance + Math.random() * (maxVariance - minVariance);
    return Math.floor(baseDamage * variance);
}

/**
 * 攻撃結果を計算する（ミス、クリティカル、通常攻撃）
 */
export function calculateAttackResult(
    baseDamage: number, 
    isTargetKnockedOut: boolean = false,
    customHitRate?: number,
    customCriticalRate?: number,
    damageVarianceMin?: number,
    damageVarianceMax?: number
): AttackResult {
    if (baseDamage <= 0) {
        return {
            damage: 0,
            isMiss: false,
            isCritical: false,
            message: ''
        };
    }
    
    const random = Math.random();
    
    // プレイヤーが行動不能の場合、ボスの攻撃はミスしない
    const baseHitRate = customHitRate !== undefined ? customHitRate / 100 : 0.95;
    const hitRate = isTargetKnockedOut ? 1.0 : baseHitRate;
    const missChance = 1 - hitRate;
    const criticalChance = customCriticalRate !== undefined ? customCriticalRate / 100 : 0.05;
    
    if (random < missChance) {
        // ミス
        return {
            damage: 0,
            isMiss: true,
            isCritical: false,
            message: 'ミス！'
        };
    } else if (random < missChance + criticalChance) {
        // クリティカルヒット
        const criticalDamage = damageVarianceMin !== undefined && damageVarianceMax !== undefined
            ? applyCustomDamageVariance(baseDamage * 3, damageVarianceMin, damageVarianceMax)
            : applyDamageVariance(baseDamage * 3);
        return {
            damage: criticalDamage,
            isMiss: false,
            isCritical: true,
            message: 'クリティカルヒット！'
        };
    } else {
        // 通常攻撃
        const normalDamage = damageVarianceMin !== undefined && damageVarianceMax !== undefined
            ? applyCustomDamageVariance(baseDamage, damageVarianceMin, damageVarianceMax)
            : applyDamageVariance(baseDamage);
        return {
            damage: normalDamage,
            isMiss: false,
            isCritical: false,
            message: ''
        };
    }
}