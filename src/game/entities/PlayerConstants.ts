/**
 * プレイヤー関連の定数定義
 */

// デフォルト値
export const DEFAULT_PLAYER_NAME = 'エルナル';
export const DEFAULT_PLAYER_ICON = '🐍';

// 基本ステータス
export const BASE_MAX_HP = 100;
export const BASE_MAX_MP = 50;
export const BASE_ATTACK_POWER = 5;

// セーブデータバージョン
export const SAVE_DATA_VERSION = 4;

// HP/MP計算用の乗数
export const STAT_MULTIPLIER_BASE = 1;

// 回復関連
export const KNOCKEDOUT_RECOVERY_RATE = 0.5; // 50%
export const CRAFTWORK_HEALING_MULTIPLIER_BASE = 1;

// アクションの成功率・ダメージ関連
export const DEFEND_DAMAGE_CUT_RATE = 1.0; // 100%カット

// バトル関連定数
export const STRUGGLE_BASE_SUCCESS_RATE = 0.3; // 30%
export const STRUGGLE_SUCCESS_INCREASE_PER_ATTEMPT = 0.2; // 20%
export const STRUGGLE_MAX_SUCCESS_RATE = 0.9; // 90%
export const STRUGGLE_ENHANCED_SUCCESS_MULTIPLIER = 2;
export const STRUGGLE_ENHANCED_SUCCESS_MULTIPLIER_NO_MP = 4;

export const STAY_STILL_HEAL_RATE = 0.05; // 5% of max HP
export const STAY_STILL_MP_RECOVERY_RATE = 0.25; // 25% of max MP

// 経験値関連
export const AGILITY_EXP_SUCCESS_ESCAPE = 50;
export const AGILITY_EXP_FAILED_ESCAPE = 100;
export const AGILITY_EXP_ENHANCED_FAILED_ESCAPE = 400;

// パッシブスキル関連
export const REGENERATION_HEAL_DIVISOR = 50; // maxHp / 50
export const ESCAPE_RECOVERY_RATE = 0.2; // 20% of lost max HP

// スキル関連定数
export const POWER_ATTACK_DEFAULT_MULTIPLIER = 2.5;
export const POWER_ATTACK_NO_MP_MULTIPLIER = 2;

export const ULTRA_SMASH_BASE_DAMAGE_MULTIPLIER = 1;
export const ULTRA_SMASH_MP_DAMAGE_MULTIPLIER = 1;

export const STRUGGLE_DAMAGE_MULTIPLIER = 1.5; // アジリティLv5+時
export const STRUGGLE_ATTEMPT_INCREASE_SUCCESS = 0;
export const STRUGGLE_ATTEMPT_INCREASE_FAIL = 4;
export const STRUGGLE_ATTEMPT_INCREASE_FAIL_NO_MP = 8;

// レベル制限
export const ENDURANCE_FULL_MP_RECOVERY_LEVEL = 3;
export const AGILITY_DAMAGE_DEALING_LEVEL = 5;
export const TOUGHNESS_DEFEND_CUT_LEVEL = 7;

// 探索者レベル関連
export const EXPLORER_LEVEL_SKIP = 3; // ゲストキャラ関係でスキップするレベル

// アビリティの重み付け（パワーレーティング用）
export const ABILITY_WEIGHT = {
    COMBAT: 2.0,
    TOUGHNESS: 1.5,
    ENDURANCE: 1.2,
    AGILITY: 1.3,
    CRAFTWORK: 1.0,
    EXPLORER: 0.8
} as const;