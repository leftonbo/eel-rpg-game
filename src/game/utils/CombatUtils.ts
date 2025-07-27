/**
 * 攻撃結果のインターフェース
 */
export interface AttackResult {
    damage: number;
    isMiss: boolean;
    isCritical: boolean;
    message: string;
}

/**
 * ダメージにランダムなゆらぎを適用する（±20%）
 * @param baseDamage 基本ダメージ（小数点を許可）
 * @returns ゆらぎを適用したダメージ(小数点は処理されない)
 */
export function applyDamageVariance(baseDamage: number): number {
    return applyCustomDamageVariance(baseDamage, -0.2, 0.2);
}

/**
 * ダメージにカスタムゆらぎを適用する
 * @param baseDamage 基本ダメージ（小数点を許可）
 * @param minVariance 最小ゆらぎ倍率 例: -0.2
 * @param maxVariance 最大ゆらぎ倍率 例: +0.5
 * @returns ゆらぎを適用したダメージ(小数点は処理されない)
 */
export function applyCustomDamageVariance(baseDamage: number, minVariance: number = -0.2, maxVariance: number = 0.2): number {
    if (baseDamage <= 0) return 0;
    
    // ランダム係数を計算
    // 2 つの乱数を生成し、1つは正のゆらぎ、もう1つは負のゆらぎを適用
    // (足し合わせることで、比較的中央に寄った値を得る)
    const variance = 1 + Math.random() * maxVariance + Math.random() * minVariance;
    return baseDamage * variance;
}

/**
 * 攻撃結果を計算する（ミス、クリティカル、通常攻撃）
 * @param baseDamage 基本ダメージ（小数点を許可）
 * @param isTargetKnockedOut ターゲットが行動不能かどうか
 * @param customHitRate カスタムヒット率（デフォルトは1.0）
 * @param customCriticalRate カスタムクリティカル率（デフォルトは0.0）
 * @param damageVarianceMin ダメージの最小ゆらぎ（デフォルトは-0.2）
 * @param damageVarianceMax ダメージの最大ゆらぎ（デフォルトは0.2）
 * @param accuracyModifier 状態異常による命中率修正（デフォルトは1.0）
 * @returns 攻撃結果オブジェクト
 * @property {number} damage - 実際のダメージ
 * @property {boolean} isMiss - ミスしたかどうか
 * @property {boolean} isCritical - クリティカルヒットかどうか
 * @property {string} message - 攻撃メッセージ（現在は空文字列）
 * @remarks
 * - `baseDamage` が0以下の場合、ダメージは0として扱われます。
 * - `isTargetKnockedOut` がtrueの場合、ヒット率は1.0（必ずヒット）になります。
 * - `customHitRate` と `customCriticalRate` を指定することで、ヒット率とクリティカル率をカスタマイズできます。
 * - `damageVarianceMin` と `damageVarianceMax` を指定することで、ダメージのゆらぎをカスタマイズできます。
 * - `accuracyModifier` で状態異常による命中率修正を適用できます。
 * - クリティカルヒットの場合、ダメージは通常の3倍になります。
 * - ミスした場合、ダメージは0になります。
 * - ダメージは最終計算時に四捨五入されます。
 */
export function calculateAttackResult(
    baseDamage: number, 
    isTargetKnockedOut: boolean = false,
    customHitRate?: number,
    customCriticalRate?: number,
    damageVarianceMin?: number,
    damageVarianceMax?: number,
    accuracyModifier: number = 1.0
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
    // 状態異常による命中率修正を適用
    const adjustedHitRate = isTargetKnockedOut ? 1.0 : baseHitRate * accuracyModifier;
    const hitRate = Math.max(0, Math.min(1, adjustedHitRate)); // 0-1の範囲に制限
    
    if (!isTargetKnockedOut && Math.random() >= hitRate) {
        // ミス
        return {
            damage: 0,
            isMiss: true,
            isCritical: false,
            message: ''
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
            message: ''
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