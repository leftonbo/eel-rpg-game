export interface AttackResult {
    damage: number;
    isMiss: boolean;
    isCritical: boolean;
    message: string;
}

/**
 * ダメージにランダムなゆらぎを適用する（±20%）
 * @returns ゆらぎを適用したダメージ(小数点は処理されない)
 */
export function applyDamageVariance(baseDamage: number): number {
    return applyCustomDamageVariance(baseDamage, -0.2, 0.2);
}

/**
 * ダメージにカスタムゆらぎを適用する
 * @param baseDamage 基本ダメージ
 * @param minVariance 最小ゆらぎ倍率 例: -0.2
 * @param maxVariance 最大ゆらぎ倍率 例: +0.5
 * @returns ゆらぎを適用したダメージ(小数点は処理されない)
 */
export function applyCustomDamageVariance(baseDamage: number, minVariance: number = -0.2, maxVariance: number = 0.2): number {
    if (baseDamage <= 0) return 0;
    
    // ランダム係数を計算
    // 2 つの乱数を生成し、1つは正のゆらぎ、もう1つは負のゆらぎを適用
    // (足し合わせることで、比較的中央に寄った値を得る)
    const variance = Math.random() * maxVariance + Math.random() * (-minVariance);
    return baseDamage * variance;
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
    
    // プレイヤーが行動不能の場合、ボスの攻撃はミスしない
    const baseHitRate = customHitRate !== undefined ? customHitRate : 1.0;
    const hitRate = isTargetKnockedOut ? 1.0 : baseHitRate;
    
    if (!isTargetKnockedOut && Math.random() >= hitRate) {
        // ミス
        return {
            damage: 0,
            isMiss: true,
            isCritical: false,
            message: 'ミス！'
        };
    }
    
    // ダメージにゆらぎを適用
    const damage = damageVarianceMin !== undefined && damageVarianceMax !== undefined
        ? applyCustomDamageVariance(baseDamage, damageVarianceMin, damageVarianceMax)
        : applyDamageVariance(baseDamage);
    
    const criticalChance = customCriticalRate !== undefined ? customCriticalRate : 0.0;
    const isCritical = Math.random() < criticalChance;
    
    if (isCritical) {
        // クリティカルヒット
        const critDamage = Math.round(damage * 3.0); // クリティカルダメージは通常の3倍
        return {
            damage: critDamage,
            isMiss: false,
            isCritical: true,
            message: 'クリティカルヒット！'
        };
    } else {
        // 通常攻撃
        const normalDamage = Math.round(damage);
        return {
            damage: normalDamage,
            isMiss: false,
            isCritical: false,
            message: ''
        };
    }
}