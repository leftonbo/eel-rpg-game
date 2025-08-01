/**
 * プレイヤー関連の定数定義
 */

/** デフォルトプレイヤー名 */
export const DEFAULT_PLAYER_NAME = 'エルナル';

/** デフォルトプレイヤーアイコン */
export const DEFAULT_PLAYER_ICON = '🐍';

/** 基本最大HP */
export const BASE_MAX_HP = 100;

/** 基本最大MP */
export const BASE_MAX_MP = 50;

/** 基本攻撃力 */
export const BASE_ATTACK_POWER = 10;

/** セーブデータバージョン */
export const SAVE_DATA_VERSION = 4;

/** HP/MP計算用の基本乗数 */
export const STAT_MULTIPLIER_BASE = 1;

/** 戦闘不能からの回復率（50%） */
export const KNOCKEDOUT_RECOVERY_RATE = 0.5;

/** クラフトワーク回復の基本乗数 */
export const CRAFTWORK_HEALING_MULTIPLIER_BASE = 1;

/** 防御時の100%ダメージカット率 */
export const DEFEND_DAMAGE_CUT_RATE = 1.0;

/** もがく行動の基本成功率（20%） */
export const STRUGGLE_BASE_SUCCESS_RATE = 0.2;

/** もがく試行回数ごとの成功率増加（20%） */
export const STRUGGLE_SUCCESS_INCREASE_PER_ATTEMPT = 0.2;

/** もがく行動の最大成功率（90%） */
export const STRUGGLE_MAX_SUCCESS_RATE = 0.9;

/** もがく強化時の成功率倍率 */
export const STRUGGLE_ENHANCED_SUCCESS_MULTIPLIER = 2;

/** MP不足時のもがく強化倍率 */
export const STRUGGLE_ENHANCED_SUCCESS_MULTIPLIER_NO_MP = 4;

/** じっとする時のHP回復率（最大HPの5%） */
export const STAY_STILL_HEAL_RATE = 0.05;

/** じっとする時のMP回復率（最大MPの25%） */
export const STAY_STILL_MP_RECOVERY_RATE = 0.25;

/** 脱出成功時のアジリティ経験値 */
export const AGILITY_EXP_SUCCESS_ESCAPE = 50;

/** 脱出失敗時のアジリティ経験値 */
export const AGILITY_EXP_FAILED_ESCAPE = 100;

/** 強化脱出失敗時のアジリティ経験値 */
export const AGILITY_EXP_ENHANCED_FAILED_ESCAPE = 400;

/** 再生パッシブの回復量計算用除数（最大HP÷50） */
export const REGENERATION_HEAL_DIVISOR = 50;

/** 脱出回復パッシブの回復率（失った最大HPの20%） */
export const ESCAPE_RECOVERY_RATE = 0.2;

/** パワーアタックのデフォルトダメージ倍率 */
export const POWER_ATTACK_DEFAULT_MULTIPLIER = 2.5;

/** MP不足時のパワーアタック倍率 */
export const POWER_ATTACK_NO_MP_MULTIPLIER = 2;

/** ウルトラスマッシュの基本ダメージ倍率 */
export const ULTRA_SMASH_BASE_DAMAGE_MULTIPLIER = 1;

/** ウルトラスマッシュのMPダメージ倍率 */
export const ULTRA_SMASH_MP_DAMAGE_MULTIPLIER = 1;

/** もがく時のダメージ倍率（アジリティLv5+時） */
export const STRUGGLE_DAMAGE_MULTIPLIER = 1.5;

/** もがく成功時の試行回数増加 */
export const STRUGGLE_ATTEMPT_INCREASE_SUCCESS = 0;

/** もがく失敗時の試行回数増加 */
export const STRUGGLE_ATTEMPT_INCREASE_FAIL = 4;

/** MP不足時のもがく失敗試行回数増加 */
export const STRUGGLE_ATTEMPT_INCREASE_FAIL_NO_MP = 8;

/** エンデュランスでフルMP回復が可能なレベル */
export const ENDURANCE_FULL_MP_RECOVERY_LEVEL = 3;

/** アジリティでもがく時ダメージが発生するレベル */
export const AGILITY_DAMAGE_DEALING_LEVEL = 5;

/** タフネスで防御時100%カットが可能なレベル */
export const TOUGHNESS_DEFEND_CUT_LEVEL = 7;

/** 探索者レベル表示でスキップするレベル（ゲストキャラ関係） */
export const EXPLORER_LEVEL_SKIP = 3;

/** アクセス可能地形が存在しない場合のデフォルト表示 */
export const DEFAULT_UNKNOWN_TERRAIN = '未知の領域';

/**
 * アビリティの重み付け（パワーレーティング用）
 */
export const ABILITY_WEIGHT = {
    /** 戦闘アビリティの重み */
    COMBAT: 2.0,
    /** タフネスアビリティの重み */
    TOUGHNESS: 1.5,
    /** エンデュランスアビリティの重み */
    ENDURANCE: 1.2,
    /** アジリティアビリティの重み */
    AGILITY: 1.3,
    /** クラフトワークアビリティの重み */
    CRAFTWORK: 1.0,
    /** 探索者アビリティの重み */
    EXPLORER: 0.8
} as const;