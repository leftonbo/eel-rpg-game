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
 * 攻撃結果を計算する（ミス、クリティカル、通常攻撃）
 */
export function calculateAttackResult(
    baseDamage: number, 
    isTargetKnockedOut: boolean = false,
    customHitRate?: number,
    customCriticalRate?: number
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
        const criticalDamage = applyDamageVariance(baseDamage * 3);
        return {
            damage: criticalDamage,
            isMiss: false,
            isCritical: true,
            message: 'クリティカルヒット！'
        };
    } else {
        // 通常攻撃
        const normalDamage = applyDamageVariance(baseDamage);
        return {
            damage: normalDamage,
            isMiss: false,
            isCritical: false,
            message: ''
        };
    }
}