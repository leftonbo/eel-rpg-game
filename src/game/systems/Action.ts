import { Actor } from '../entities/Actor';
import { StatusEffectType } from './StatusEffectTypes';

/**
 * アクション対象の種類
 */
export enum ActionTarget {
    Self = 'self',      // 自分自身
    Enemy = 'enemy'     // 敵
}

/**
 * 成功率計算タイプ
 */
export enum AccuracyType {
    Fixed = 'fixed',    // 固定値
    Evade = 'evade'     // 使用者の命中補正と対象の回避率を参照
}

/**
 * ダメージ対象ステータス
 */
export enum TargetStatus {
    HP = 'HP',
    MP = 'MP',
    MaxHP = 'maxHP',
    MaxMP = 'maxMP'
}

/**
 * ダメージタイプ
 */
export enum DamageType {
    Damage = 'damage',  // ダメージ
    Heal = 'heal',      // 回復
}

/**
 * ダメージ計算パラメータ
 */
export interface DamageParameter {
    /**
     * ダメージの対象ステータス
     */
    targetStatus: TargetStatus;

    /**
     * ダメージのタイプ
     */
    type: DamageType;

    /**
     * 吸収効果
     */
    absorbRatio?: number;

    /**
     * ダメージ計算式
     * @param user 使用者 Actor
     * @param target 対象 Actor
     * @param userMult 使用者のダメージ倍率
     * @param targetMult 対象のダメージ倍率
     */
    formula: (user: Actor, target: Actor, userMult: number, targetMult: number) => number;
    
    /**
     * カスタム効力倍率計算
     */
    customUserMultiplier?: (user: Actor, target: Actor, isCritical: boolean) => number;

    /**
     * ダメージのゆらぎ係数 (デフォルト: 0.2)
     */
    fluctuation?: number;
}

/**
 * ステート付与効果
 */
export interface StateApplyEffect {
    /**
     * 効果タイプ
     */
    type: 'apply-state';

    /**
     * ステートの種類
     */
    state: StatusEffectType;

    /**
     * 発生率 (0.0 - 1.0) 0 または 1 以外の場合、使用者や対象の補正値を参照する
     */
    probability: number;

    /**
     * 継続ターン数 (省略時はステートのデフォルト継続ターン数)
     */
    duration?: number;

    /**
     * 効果値 (例: 毒の毎ターンダメージ量など、省略時はステートのデフォルト値)
     */
    value?: number;
}

/**
 * ステート解除効果
 */
export interface StateRemoveEffect {
    /**
     * 効果タイプ
     */
    type: 'remove-state';

    /**
     * 解除するステートの種類
     */
    state: StatusEffectType;

    /**
     * 解除の成功率 (0.0 - 1.0)
     */
    probability: number;
}

/**
 * 追加効果の共用体型
 */
export type ExtraEffect = StateApplyEffect | StateRemoveEffect;

/**
 * 攻撃やスキルなどの行動を表すクラス
 */
export interface Action {
    /**
     * 繰り返し回数 (通常は1。2以上で「命中判定→ダメージ→特殊効果」の処理を繰り返す)
     * 省略時は 1
     */
    repeatCount?: number;

    /**
     * 成功率 (0.0 - 1.0) 失敗時はダメージや特殊効果は発生しない
     */
    accuracy: number;

    /**
     * 成功率計算タイプ ('fixed':固定、または 'evade': 使用者の命中補正と対象の回避率を参照)
     */
    accuracyType?: AccuracyType;

    /**
     * クリティカル率 (デフォルト: 0)
     */
    criticalRate?: number;

    /**
     * ダメージ計算パラメータ
     */
    damageParameters: DamageParameter[];

    /**
     * 対象に発生する追加効果のリスト (複数かつ異なるタイプの効果を指定可能)
     */
    extraEffects?: ExtraEffect[];
    
    /**
     * カスタム関数 (オプション)
     * 使用者と対象の Actor を引数に取り、SingleActionResult を返す関数
     * この関数は、通常のダメージ計算やステート付与とは異なるカスタム処理を行うために使用されます。
     */
    customFunction?: (user: Actor, target: Actor, currentResult: SingleActionResult) => SingleActionResult;
}

/**
 * Action 結果を表すインターフェース
 */
export interface ActionResult {
    /**
     * 元となる行動
     */
    action: Action;

    /**
     * 使用者 Actor
     */
    user: Actor;

    /**
     * 対象 Actor
     */
    target: Actor;

    /**
     * 各行動の結果
     */
    results: SingleActionResult[];
}

/**
 * 1回分の行動結果を表すインターフェース
 */
export interface SingleActionResult {
    /**
     * 行動が成功したかどうか
     */
    success: boolean;

    /**
     * クリティカルヒットが発生したかどうか
     */
    criticalHit?: boolean;

    /**
     * User パラメーターの変化量
     */
    userValueChange?: ValueChangeResult[];
    
    /**
     * Target パラメーターの変化量
     */
    targetValueChange?: ValueChangeResult[];

    /**
     * Target 追加されたステートのリスト
     */
    targetAddStates?: StatusEffectType[];

    /**
     * Target 解除されたステートのリスト
     */
    targetRemoveStates?: StatusEffectType[];
}

/**
 * 値の変化結果を表すインターフェース
 */
export interface ValueChangeResult {
    /**
     * 変化した値の種類 (HP, MP, MaxHP, MaxMP)
     */
    type: TargetStatus;

    /**
     * 変化量 (正の値は回復、負の値はダメージ)
     */
    change: number;
}

/**
 * アクションを実行し、結果を計算するクラス
 */
export class ActionExecutor {
    /**
     * クリティカル時の基本倍率
     */
    public static CRITICAL_MULTIPLIER: number = 3.0;
    
    /**
     * デフォルトのダメージ計算式
     */
    public static defaultDamageFormula(user: Actor, target: Actor, userMult: number = 1, targetMult: number = 1): number {
        // 基本ダメージ計算式 (例: 攻撃力 - 防御力)
        return user.attackPower * userMult - target.defense * targetMult;
    }
    
    /**
     * アクションを実行し、結果を返す
     */
    public static execute(action: Action, user: Actor, target: Actor): ActionResult {
        const result: ActionResult = {
            action,
            user,
            target,
            results: []
        };

        if (action.repeatCount === undefined || action.repeatCount <= 1) {
            // 単一回の実行
            const singleResult = this.executeSingle(action, user, target);
            result.results.push(singleResult);
            return result;
        }
        
        // repeatCount に応じて繰り返し実行
        for (let i = 0; i < action.repeatCount; i++) {
            const singleResult = this.executeSingle(action, user, target);
            result.results.push(singleResult);
        }

        return result;
    }

    /**
     * 命中判定を行う
     */
    private static checkAccuracy(action: Action, _user: Actor, target: Actor): boolean {
        switch (action.accuracyType) {
            case AccuracyType.Fixed:
                return Math.random() < action.accuracy;

            case AccuracyType.Evade:
                // 使用者の命中補正と対象の回避率を参照
                // 基本的には action.accuracy を基準とし、将来的に補正値を追加可能
                let finalAccuracy = action.accuracy;

                // 対象が気絶している場合は必中
                if (target.isKnockedOut()) {
                    finalAccuracy = 1.0;
                }

                // 将来的に使用者の命中補正や対象の回避率を追加する場合はここで計算
                // finalAccuracy = Math.min(1.0, action.accuracy + userHitBonus - targetEvadeRate);

                return Math.random() < finalAccuracy;

            default:
                return Math.random() < action.accuracy;
        }
    }

    /**
     * 単一回の実行処理
     */
    private static executeSingle(action: Action, user: Actor, target: Actor): SingleActionResult {
        // 命中判定
        const isHit = this.checkAccuracy(action, user, target);

        if (!isHit) {
            // ミスした場合
            return {
                success: false
            }
        }

        // クリティカル判定
        const isCritical = action.criticalRate ? Math.random() < action.criticalRate : false;
        
        // 値変化配列
        const userValueChanges: ValueChangeResult[] = [];
        const targetValueChanges: ValueChangeResult[] = [];

        // ダメージ計算
        for (const param of action.damageParameters) {

            const damageResult = this.calculateValueChange(param, user, target, isCritical);
            
            // Target のステータスを更新
            switch (param.targetStatus) {
                case TargetStatus.HP:
                    target.hp += damageResult.valueChange;
                    break;
                case TargetStatus.MP:
                    target.mp += damageResult.valueChange;
                    break;
                case TargetStatus.MaxHP:
                    target.maxHp += damageResult.valueChange;
                    break;
                case TargetStatus.MaxMP:
                    target.maxMp += damageResult.valueChange;
                    break;
            }

            // Target のパラメーター変化を記録
            const targetChange: ValueChangeResult = {
                type: param.targetStatus,
                change: damageResult.valueChange
            };
            targetValueChanges.push(targetChange);
            
            // Absorb 効果がある場合は、使用者のパラメータを回復
            if (param.absorbRatio) {
                const absorbAmount = Math.round(Math.abs(-damageResult.valueChange) * param.absorbRatio);
                
                switch (param.targetStatus) {
                    case TargetStatus.HP:
                        user.hp += absorbAmount;
                        break;
                    case TargetStatus.MP:
                        user.mp += absorbAmount;
                        break;
                    case TargetStatus.MaxHP:
                        user.maxHp += absorbAmount;
                        break;
                    case TargetStatus.MaxMP:
                        user.maxMp += absorbAmount;
                        break;
                }
            }
        }

        // 追加効果処理
        const effectResult = action.extraEffects
            ? this.applyExtraEffects(action.extraEffects, user, target)
            : { addStates: [], removeStates: [] };

        // 結果をまとめる
        let result: SingleActionResult = {
            success: true,
            criticalHit: isCritical,
            userValueChange: userValueChanges.length > 0 ? userValueChanges : undefined,
            targetValueChange: targetValueChanges.length > 0 ? targetValueChanges : undefined,
            targetAddStates: effectResult.addStates.length > 0 ? effectResult.addStates : undefined,
            targetRemoveStates: effectResult.removeStates.length > 0 ? effectResult.removeStates : undefined
        };
        
        // カスタム関数が指定されている場合は、結果をさらに処理
        if (action.customFunction) {
            result = action.customFunction(user, target, result);
        }
        
        return result;
    }

    /**
     * ダメージ計算処理
     */
    private static calculateValueChange(param: DamageParameter, user: Actor, target: Actor, isCritical: boolean): {
        isCritical: boolean; valueChange: number;
    } {
        let totalValueChange = 0;

        // クリティカル時の倍率を適用
        let userMult = isCritical ? ActionExecutor.CRITICAL_MULTIPLIER : 1
        const targetMult = 1; // 対象のダメージ倍率は現在は固定
        
        if (param.customUserMultiplier) {
            // カスタム効力倍率計算が指定されている場合はそれを使用
            userMult = param.customUserMultiplier(user, target, isCritical);
        }
        
        // 計算式を実行してベースダメージを取得
        const baseDamage = param.formula(user, target, userMult, targetMult);

        // ダメージのゆらぎを適用
        let finalDamage = baseDamage;
        if (param.fluctuation !== undefined) {
            finalDamage = ActionExecutor.applyCustomDamageVariance(finalDamage, param.fluctuation);
        }

        // ダメージタイプに応じて符号を調整
        // 負の値はダメージ、正の値は回復
        // 最終結果は四捨五入して整数にする
        // ただし 0 にならないようにする
        switch (param.type) {
            case DamageType.Damage:
                totalValueChange = Math.min(-Math.round(finalDamage), -1); // 負の値（ダメージ）
                break;
            case DamageType.Heal:
                totalValueChange = Math.max(Math.round(finalDamage), 1); // 正の値（回復）
                break;
        }

        return {
            isCritical: isCritical,
            valueChange: totalValueChange
        };
    }

    /**
     * 追加効果処理
     */
    private static applyExtraEffects(effects: ExtraEffect[], _user: Actor, target: Actor): { addStates: StatusEffectType[]; removeStates: StatusEffectType[] } {
        const addStates: StatusEffectType[] = [];
        const removeStates: StatusEffectType[] = [];

        for (const effect of effects) {
            switch (effect.type) {
                case 'apply-state':
                    // 確率判定
                    if (Math.random() < effect.probability) {
                        target.statusEffects.addEffect(effect.state);
                        addStates.push(effect.state);
                        // TODO: effect.duration と effect.value の処理は将来的に
                        // StatusEffectManager の拡張が必要
                    }
                    break;

                case 'remove-state':
                    // 解除判定
                    if (Math.random() < effect.probability) {
                        if (target.statusEffects.hasEffect(effect.state)) {
                            target.statusEffects.removeEffect(effect.state);
                            removeStates.push(effect.state);
                        }
                    }
                    break;
            }
        }

        return { addStates, removeStates };
    }

    /**
     * カスタムゆらぎを適用する
     * @param base 基本値
     * @param variance ゆらぎ倍率 例: 0.2
     * @returns ゆらぎを適用した値 (小数点は処理されない)
     */
    public static applyCustomDamageVariance(base: number, variance: number = 0.2): number {
        if (base <= 0) return 0;

        // ランダム係数を計算
        // 2 つの乱数を生成し、1つは正のゆらぎ、もう1つは負のゆらぎを適用
        // (足し合わせることで、比較的中央に寄った値を得る)
        const rolledVariance = 1 + Math.random() * variance + Math.random() * variance;
        return base * rolledVariance;
    }
}
