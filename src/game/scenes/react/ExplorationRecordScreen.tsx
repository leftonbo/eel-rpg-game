import { useState, useEffect, ReactElement } from 'react';
import { useGameContext } from '../../context/GameContext';
import { AbilitySystem, AbilityType } from '../../systems/AbilitySystem';
import { MemorialSystem, Trophy, TrophyType } from '../../systems/MemorialSystem';
import { getAllBossData, getBossData } from '../../data';
import { countUnlockedBosses } from '../../utils/BossUnlockUtils';
import { t } from '../../i18n';

// ---- 定数 ----

const TERRAIN_COLORS: Record<string, string> = {
    '近隣の地方': 'secondary',
    '砂漠': 'warning',
    '海': 'info',
    'ジャングル': 'success',
    '洞窟': 'dark',
    '遺跡': 'danger',
    '廃墟': 'danger',
    '寒冷地': 'light text-dark',
    '火山': 'danger',
    '天空': 'primary',
    '魔界': 'dark',
};

function getTrophyTypeIcon(type: TrophyType | string): string {
    switch (type) {
        case TrophyType.Victory:
            return '🏆';
        case TrophyType.Defeat:
            return '💀';
        case 'achievement':
            return '🎖️';
        case 'milestone':
            return '⭐';
        default:
            return '🏅';
    }
}

function getTrophyTypeBadgeClass(type: TrophyType | string): string {
    switch (type) {
        case TrophyType.Victory:
            return 'success';
        case TrophyType.Defeat:
            return 'info';
        case 'achievement':
            return 'warning';
        case 'milestone':
            return 'primary';
        default:
            return 'secondary';
    }
}

function formatTrophyDate(timestamp: number | null): string {
    if (!timestamp) return '不明';
    try {
        const date = new Date(timestamp);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch {
        return '不明';
    }
}

// ---- サブコンポーネント ----

interface TrophyCardProps {
    trophy: Trophy;
    playerExplorerLevel: number;
}

function TrophyCard({ trophy, playerExplorerLevel }: TrophyCardProps): ReactElement | null {
    const typeIcon = getTrophyTypeIcon(trophy.type);

    if (!trophy.dateObtained) {
        const bossData = getBossData(trophy.bossId);
        if (!bossData) return null;

        // 対応ボスが未解禁の場合は表示しない
        if (bossData.explorerLevelRequired && playerExplorerLevel < bossData.explorerLevelRequired) {
            return null;
        }

        return (
            <div className="col-md-6 mb-3">
                <div className="card bg-secondary disabled">
                    <div className="card-body">
                        <h6 className="card-title d-flex justify-content-between align-items-center text-muted">
                            {typeIcon} ？？？？？
                        </h6>
                        <p className="card-text small text-muted">？？？？？</p>
                        <small className="text-muted">{bossData.displayName} からアンロックできる</small>
                    </div>
                </div>
            </div>
        );
    }

    const typeClass = getTrophyTypeBadgeClass(trophy.type);
    const dateStr = formatTrophyDate(trophy.dateObtained);

    return (
        <div className="col-md-6 mb-3">
            <div className="card bg-secondary">
                <div className="card-body">
                    <h6 className="card-title d-flex justify-content-between align-items-center">
                        {typeIcon} {trophy.name}
                        <span className={`badge bg-${typeClass}`}>+{trophy.explorerExp} EXP</span>
                    </h6>
                    <p className="card-text small">{trophy.description}</p>
                    <small className="text-muted">獲得日: {dateStr}</small>
                </div>
            </div>
        </div>
    );
}

// ---- メインコンポーネントデータ型 ----

interface ExplorationData {
    explorerLevel: number;
    explorerExp: number;
    explorerNext: number;
    explorerProgressPct: number;
    explorerIsMaxLevel: boolean;
    unlockedBossCount: number;
    totalBossCount: number;
    earnedTrophyCount: number;
    totalExplorerExp: number;
    terrains: string[];
    trophies: Trophy[];
    progressPercentage: string;
    progressRatio: number;
}

function buildExplorationData(
    game: ReturnType<typeof useGameContext>['game']
): ExplorationData {
    const player = game.getPlayer();
    const abilityLevels = player.getAbilityLevels();
    const explorerData = abilityLevels[AbilityType.Explorer];

    let explorerLevel = 0;
    let explorerExp = 0;
    let explorerNext = 0;
    let explorerProgressPct = 0;
    let explorerIsMaxLevel = false;

    if (explorerData) {
        explorerLevel = explorerData.level;
        explorerExp = explorerData.experience;
        explorerIsMaxLevel = explorerData.level >= AbilitySystem.MAX_LEVEL;

        if (explorerIsMaxLevel) {
            explorerNext = player.abilitySystem.getRequiredExperienceForLevel(AbilitySystem.MAX_LEVEL);
            explorerProgressPct = 100;
        } else {
            explorerNext = explorerData.experience + explorerData.experienceToNext;

            const currentLevelReq = player.abilitySystem.getRequiredExperienceForLevel(explorerData.level);
            const nextLevelReq = player.abilitySystem.getRequiredExperienceForLevel(explorerData.level + 1);
            const levelRange = nextLevelReq - currentLevelReq;
            const levelCurrent = explorerData.experience - currentLevelReq;
            explorerProgressPct = levelRange > 0 ? (levelCurrent / levelRange) * 100 : 0;
        }
    }

    const allBossData = getAllBossData();
    const unlockedBossCount = countUnlockedBosses(allBossData, player.getExplorerLevel());
    const earnedTrophies = player.memorialSystem.getEarnedTrophies();

    // ゲーム進行度
    const currentScoreAbilities = player.abilitySystem.calculateProgressScore();
    const maxScoreAbilities = AbilitySystem.getMaximumScore();
    const currentScoreMemorial = player.memorialSystem.calculateProgressScore();
    const maxScoreMemorial = MemorialSystem.getMaximumScore();
    const totalScore = currentScoreAbilities + currentScoreMemorial;
    const totalMaxScore = maxScoreAbilities + maxScoreMemorial;
    const progressRatio = totalMaxScore > 0 ? totalScore / totalMaxScore : 0;

    return {
        explorerLevel,
        explorerExp,
        explorerNext,
        explorerProgressPct,
        explorerIsMaxLevel,
        unlockedBossCount,
        totalBossCount: allBossData.length,
        earnedTrophyCount: earnedTrophies.length,
        totalExplorerExp: explorerData?.experience ?? 0,
        terrains: player.getAccessibleTerrains(),
        trophies: player.memorialSystem.getAllTrophiesSorted(),
        progressPercentage: `${(progressRatio * 100).toFixed(1)}%`,
        progressRatio,
    };
}

// ---- メインコンポーネント ----

export function ExplorationRecordScreen(): ReactElement {
    const { game } = useGameContext();
    const [data, setData] = useState<ExplorationData>(() => buildExplorationData(game));

    useEffect(() => {
        setData(buildExplorationData(game));
    }, [game]);

    const explorerProgressBarClass = data.explorerIsMaxLevel
        ? 'progress-bar bg-warning progress-bar-striped progress-bar-animated'
        : 'progress-bar bg-info';

    return (
        <div className="container flex-grow-1 d-flex flex-column">
            <div className="row mt-4 mb-4 flex-grow-1">
                <div className="col-12">
                    <div className="card bg-dark">
                        <div className="card-header">
                            <h5 className="mb-0">{t('explorationRecord.title')}</h5>
                        </div>
                        <div className="card-body">
                            {/* ゲーム進行度 */}
                            <h6>{t('explorer.progressTitle')}</h6>
                            <div className="row mb-4">
                                <div className="col-md-12 mb-3">
                                    <div className="card bg-secondary">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-center mb-1">
                                                <span className="fs-5 fw-bold">{data.progressPercentage}</span>
                                            </div>
                                            <div className="mb-2">
                                                <div className="progress" style={{ height: '30px' }}>
                                                    <div
                                                        className="progress-bar bg-success"
                                                        role="progressbar"
                                                        style={{ width: `${data.progressRatio * 100}%` }}
                                                        aria-valuenow={data.progressRatio * 100}
                                                        aria-valuemin={0}
                                                        aria-valuemax={100}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* エクスプローラーアビリティ */}
                            <h6>{t('explorer.explorerTitle')}</h6>
                            <div className="row mb-4">
                                {/* アビリティカード */}
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-secondary">
                                        <div className="card-body">
                                            <h6 className="card-title">
                                                🗺️{' '}
                                                {t('abilities.names.explorer')}{' '}
                                                {t('common.levelShort')}
                                                {data.explorerLevel}
                                            </h6>
                                            <div className="progress mb-2">
                                                <div
                                                    className={explorerProgressBarClass}
                                                    role="progressbar"
                                                    style={{ width: `${data.explorerProgressPct}%` }}
                                                />
                                            </div>
                                            <small className="text-muted">
                                                {t('common.expLabel')}: {data.explorerExp} / {data.explorerNext}
                                            </small>
                                            <p className="mt-2 mb-0 small">
                                                {t('abilities.descriptions.explorer')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* 探検統計カード */}
                                <div className="col-md-6 mb-3">
                                    <div className="card bg-secondary">
                                        <div className="card-body">
                                            <h6 className="card-title">{t('explorer.statsTitle')}</h6>
                                            <div className="mb-2">
                                                {t('explorer.unlockedBosses')}:{' '}
                                                {data.unlockedBossCount} / {data.totalBossCount}
                                            </div>
                                            <div className="mb-2">
                                                {t('explorer.trophiesCollected')}:{' '}
                                                {data.earnedTrophyCount}
                                            </div>
                                            <div className="mb-1">
                                                {t('explorer.totalExplorerExp')}:{' '}
                                                {data.totalExplorerExp}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* アクセス可能な地形 */}
                            <h6>{t('explorer.terrainTitle')}</h6>
                            <div className="row mb-4">
                                <div className="col-12">
                                    <div className="card bg-secondary">
                                        <div className="card-body">
                                            <h6 className="card-title">{t('explorer.currentTerrainsTitle')}</h6>
                                            <div className="d-flex flex-wrap gap-2">
                                                {data.terrains.map((terrain) => {
                                                    const colorClass =
                                                        TERRAIN_COLORS[terrain] ?? 'secondary';
                                                    return (
                                                        <span
                                                            key={terrain}
                                                            className={`badge bg-${colorClass} fs-6`}
                                                        >
                                                            {terrain}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                            <p className="mt-2 mb-0 small text-muted">
                                                {t('explorer.terrainHint')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 記念品コレクション */}
                            <h6>{t('explorer.trophyCollectionTitle')}</h6>
                            {data.trophies.length === 0 ||
                            !data.trophies.some((tr) => tr.dateObtained !== null) ? (
                                <div className="text-center mt-3">
                                    <p className="text-muted">
                                        {t('explorer.noTrophiesLine1')}
                                        <br />
                                        {t('explorer.noTrophiesLine2')}
                                    </p>
                                </div>
                            ) : null}
                            <div className="row">
                                {data.trophies.map((trophy) => (
                                    <TrophyCard
                                        key={trophy.id}
                                        trophy={trophy}
                                        playerExplorerLevel={data.explorerLevel}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
