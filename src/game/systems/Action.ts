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
export class Action {
    /**
     * スキル名
     */
    public name: string;

    /**
     * スキルの説明
     */
    public description: string;

    /**
     * 対象 (自分自身か、敵か)
     */
    public target: ActionTarget;

    /**
     * マナ消費量
     */
    public mpCost: number;

    /**
     * 行動時のメッセージ (リストで複数行のメッセージを指定可能)
     * メッセージはフォーマット指定可能 (例: '<USER>は<TARGET>に<ACTION>を使った！')
     */
    public message: string[];

    /**
     * 繰り返し回数 (通常は1。2以上で「命中判定→ダメージ→特殊効果」の処理を繰り返す)
     * 省略時は 1
     */
    public repeatCount: number;

    /**
     * 成功率 (0.0 - 1.0) 失敗時はダメージや特殊効果は発生しない
     */
    public accuracy: number;

    /**
     * 成功率計算タイプ ('fixed':固定、または 'evade': 使用者の命中補正と対象の回避率を参照)
     */
    public accuracyType: AccuracyType;

    /**
     * クリティカル率 (デフォルト: 0)
     */
    public criticalRate: number;

    /**
     * ダメージ計算パラメータ
     */
    public damageParameters: DamageParameter[];

    /**
     * 対象に発生する追加効果のリスト (複数かつ異なるタイプの効果を指定可能)
     */
    public extraEffects: ExtraEffect[];
    
    /**
     * カスタム関数 (オプション)
     * 使用者と対象の Actor を引数に取り、SingleActionResult を返す関数
     * この関数は、通常のダメージ計算やステート付与とは異なるカスタム処理を行うために使用されます。
     */
    public customFunction?: (user: Actor, target: Actor, currentResult: SingleActionResult) => SingleActionResult;

    constructor(
        name: string,
        description: string,
        target: ActionTarget,
        mpCost: number = 0,
        message: string[] = [],
        repeatCount: number = 1,
        accuracy: number = 1.0,
        accuracyType: AccuracyType = AccuracyType.Fixed,
        criticalRate: number = 0,
        damageParameters: DamageParameter[] = [],
        extraEffects: ExtraEffect[] = [],
        customFunction?: (user: Actor, target: Actor, currentResult: SingleActionResult) => SingleActionResult
    ) {
        this.name = name;
        this.description = description;
        this.target = target;
        this.mpCost = mpCost;
        this.message = message;
        this.repeatCount = repeatCount;
        this.accuracy = accuracy;
        this.accuracyType = accuracyType;
        this.criticalRate = criticalRate;
        this.damageParameters = damageParameters;
        this.extraEffects = extraEffects;
        this.customFunction = customFunction;
    }
}

/**
 * Action 結果を表すクラス
 */
export class ActionResult {
    /**
     * 元となる行動
     */
    public action: Action;

    /**
     * 使用者 Actor
     */
    public user: Actor;

    /**
     * 対象 Actor
     */
    public target: Actor;

    /**
     * 各行動の結果
     */
    public results: SingleActionResult[];

    constructor(action: Action, user: Actor, target: Actor) {
        this.action = action;
        this.user = user;
        this.target = target;
        this.results = [];
    }
}

/**
 * 1回分の行動結果を表すクラス
 */
export class SingleActionResult {
    /**
     * 行動が成功したかどうか
     */
    public success: boolean;

    /**
     * クリティカルヒットが発生したかどうか
     */
    public criticalHit: boolean;

    /**
     * User パラメーターの変化量
     */
    public userValueChange: ValueChangeResult[];
    
    /**
     * Target パラメーターの変化量
     */
    public targetValueChange: ValueChangeResult[];

    /**
     * Target 追加されたステートのリスト
     */
    public targetAddStates: StatusEffectType[];

    /**
     * Target 解除されたステートのリスト
     */
    public targetRemoveStates: StatusEffectType[];

    constructor(
        success: boolean = false,
        criticalHit: boolean = false,
        userValueChange: ValueChangeResult[] = [],
        targetValueChange: ValueChangeResult[] = [],
        addStates: StatusEffectType[] = [],
        removeStates: StatusEffectType[] = []
    ) {
        this.success = success;
        this.criticalHit = criticalHit;
        this.userValueChange = userValueChange;
        this.targetValueChange = targetValueChange;
        this.targetAddStates = addStates;
        this.targetRemoveStates = removeStates;
    }
}

/**
 * 値の変化結果を表すクラス
 */
export class ValueChangeResult {
    /**
     * 変化した値の種類 (HP, MP, MaxHP, MaxMP)
     */
    public type: TargetStatus;

    /**
     * 変化量 (正の値は回復、負の値はダメージ)
     */
    public change: number;

    constructor(type: TargetStatus, change: number) {
        this.type = type;
        this.change = change;
    }
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
        return Math.max(1, user.attackPower * userMult - target.defense * targetMult);
    }
    
    /**
     * アクションを実行し、結果を返す
     */
    public static execute(action: Action, user: Actor, target: Actor): ActionResult {
        const result = new ActionResult(action, user, target);

        // MP消費チェック
        if (!user.consumeMp(action.mpCost)) {
            // MP不足でも実行は継続（MP不足時の特別効果などがある場合）
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
            return new SingleActionResult(false, false, [], [], [], []);
        }

        // クリティカル判定
        const isCritical = action.criticalRate ? Math.random() < action.criticalRate : false;
        
        // 値変化配列
        const userValueChanges: ValueChangeResult[] = [];
        const targetValueChanges: ValueChangeResult[] = [];

        // ダメージ計算
        for (const param of action.damageParameters) {

            const damageResult = this.calculateValueChange(param, user, target, isCritical);

            // User のパラメーター変化を記録
            const userChange = new ValueChangeResult(param.targetStatus, damageResult.valueChange);
            userValueChanges.push(userChange);
            
            // Target のパラメーター変化を記録
            const targetChange = new ValueChangeResult(param.targetStatus, -damageResult.valueChange);
            targetValueChanges.push(targetChange);
            
            // User と Target のステータスを更新
            switch (param.targetStatus) {
                case TargetStatus.HP:
                    target.hp += targetChange.change;
                    if (param.absorbRatio)
                        user.hp += Math.round(damageResult.valueChange * param.absorbRatio); // 吸収ダメージは使用者にも適用
                    break;
                case TargetStatus.MP:
                    target.mp += targetChange.change;
                    if (param.absorbRatio) {
                        user.mp += Math.round(damageResult.valueChange * param.absorbRatio); // 吸収ダメージは使用者にも適用
                    }
                    break;
                case TargetStatus.MaxHP:
                    target.maxHp += targetChange.change;
                    if (param.absorbRatio) {
                        user.maxHp += Math.round(damageResult.valueChange * param.absorbRatio); // 吸収ダメージは使用者にも適用
                    }
                    break;
                case TargetStatus.MaxMP:
                    target.maxMp += targetChange.change;
                    if (param.absorbRatio) {
                        user.maxMp += Math.round(damageResult.valueChange * param.absorbRatio); // 吸収ダメージは使用者にも適用
                    }
                    break;
            }
        }

        // 追加効果処理
        const effectResult = this.applyExtraEffects(action.extraEffects, user, target);

        // 結果をまとめる
        let result = new SingleActionResult(
            true,
            isCritical,
            userValueChanges,
            targetValueChanges,
            effectResult.addStates,
            effectResult.removeStates
        );
        
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
        const userMult = isCritical ? ActionExecutor.CRITICAL_MULTIPLIER : 1
        const targetMult = 1; // 対象のダメージ倍率は現在は固定
        
        // 計算式を実行してベースダメージを取得
        const baseDamage = param.formula(user, target, userMult, targetMult);

        if (baseDamage <= 0)
        {
            return {
                isCritical: isCritical,
                valueChange: 0
            };
        }

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
