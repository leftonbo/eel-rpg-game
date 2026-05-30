import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import { useGameContext } from '../../context/GameContext';
import { getAllBossData } from '../../data';
import { AbilitySystem, Equipment, EquipmentType } from '../../systems/AbilitySystem';
import { t } from '../../i18n';
import { ModalUtils } from '../../utils/ModalUtils';
import { ToastType, ToastUtils } from '../../utils/ToastUtils';

interface PlayerSummary {
    name: string;
    icon: string;
    maxHp: number;
    maxMp: number;
    attackPower: number;
    weapon: string;
    armor: string;
    gloves: string;
    belt: string;
}

interface BossCardInfo {
    id: string;
    icon: string;
    displayName: string;
    description: string;
    explorerLevelRequired: number;
    isUnlocked: boolean;
    hasVictory: boolean;
    hasDefeat: boolean;
}

function getEquipmentDisplayName(equipment: Equipment | null, type: EquipmentType): string {
    return equipment ? AbilitySystem.getEquipmentName(type, equipment) : t('common.unknown');
}

export function BossSelectScreen(): React.ReactElement {
    const { game } = useGameContext();
    const [playerSummary, setPlayerSummary] = useState<PlayerSummary | null>(null);
    const [bossCards, setBossCards] = useState<BossCardInfo[]>([]);

    useEffect(() => {
        const player = game.getPlayer();
        const equipment = player.getEquipmentInfo();
        const explorerLevel = player.getExplorerLevel();
        const memorialData = player.memorialSystem.exportData();

        setPlayerSummary({
            name: player.name,
            icon: player.icon,
            maxHp: player.maxHp,
            maxMp: player.maxMp,
            attackPower: player.getAttackPower(),
            weapon: getEquipmentDisplayName(equipment.weapon, EquipmentType.Weapons),
            armor: getEquipmentDisplayName(equipment.armor, EquipmentType.Armors),
            gloves: getEquipmentDisplayName(equipment.gloves, EquipmentType.Gloves),
            belt: getEquipmentDisplayName(equipment.belt, EquipmentType.Belts),
        });

        const allBossData = getAllBossData().sort((a, b) => {
            const aLevel = a.explorerLevelRequired || 0;
            const bLevel = b.explorerLevelRequired || 0;
            if (aLevel !== bLevel) return aLevel - bLevel;
            return a.id.localeCompare(b.id);
        });

        setBossCards(
            allBossData.map(boss => {
                const memorial = memorialData.bossMemorials.find(m => m.bossId === boss.id);
                const required = boss.explorerLevelRequired || 0;
                const isUnlocked = explorerLevel >= required;
                return {
                    id: boss.id,
                    icon: boss.icon,
                    displayName: boss.displayName,
                    description: isUnlocked
                        ? boss.description
                        : t('bossSelect.unlockRequirement', { level: required }),
                    explorerLevelRequired: required,
                    isUnlocked,
                    hasVictory: !!memorial?.dateFirstWin,
                    hasDefeat: !!memorial?.dateFirstLost,
                };
            })
        );
    }, [game]);

    const handleBossCardClick = async (bossId: string, isUnlocked: boolean) => {
        if (!isUnlocked) return;
        const confirmed = await ModalUtils.showBossModal({
            bossId,
            mode: 'select',
        });

        if (!confirmed) return;

        try {
            game.selectBoss(bossId);
        } catch (error) {
            console.error('Failed to load boss:', error);
            const errorMessage = error instanceof Error ? error.message : t('errors.unknown.message');
            ToastUtils.showToast(
                t('errors.bossLoadFailed.message', { error: errorMessage }),
                t('errors.bossLoadFailed.title'),
                ToastType.Error
            );
        }
    };

    return (
        <div id="out-game-boss-select-screen" className="scene">
            <div className="container-fluid flex-grow-1 d-flex flex-column">
                {/* Player Status Area */}
                {playerSummary && (
                    <div className="row mt-4">
                        <div className="col-12">
                            <div className="card bg-primary">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">
                                        <span>{playerSummary.icon}</span>{' '}
                                        <span>{playerSummary.name}</span>
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-3">
                                            <strong>{t('common.hp')}</strong>:{' '}
                                            {playerSummary.maxHp}
                                        </div>
                                        <div className="col-md-3">
                                            <strong>{t('common.mp')}</strong>:{' '}
                                            {playerSummary.maxMp}
                                        </div>
                                        <div className="col-md-3">
                                            <strong>{t('common.attack')}</strong>:{' '}
                                            {playerSummary.attackPower}
                                        </div>
                                    </div>
                                    <div className="row mt-2">
                                        <div className="col-md-3">
                                            <strong>{t('common.weapon')}</strong>:{' '}
                                            {playerSummary.weapon}
                                        </div>
                                        <div className="col-md-3">
                                            <strong>{t('common.armor')}</strong>:{' '}
                                            {playerSummary.armor}
                                        </div>
                                        <div className="col-md-3">
                                            <strong>{t('common.gloves')}</strong>:{' '}
                                            {playerSummary.gloves}
                                        </div>
                                        <div className="col-md-3">
                                            <strong>{t('common.belt')}</strong>:{' '}
                                            {playerSummary.belt}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Boss Selection Area */}
                <div className="row mt-4 flex-grow-1">
                    <div className="col-12">
                        <h2 className="text-center mb-4">{t('bossSelect.title')}</h2>
                        <div className="row justify-content-center">
                            {bossCards.map(boss => (
                                <div
                                    key={boss.id}
                                    className={`col-md-4 mb-4${!boss.isUnlocked ? ' d-none' : ''}`}
                                >
                                    <div
                                        className="card bg-secondary h-100 boss-card"
                                        data-boss={boss.id}
                                        onClick={() => handleBossCardClick(boss.id, boss.isUnlocked)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="boss-status-container">
                                            <div
                                                className="boss-status-badge victory"
                                                style={{ display: boss.hasVictory ? 'flex' : 'none' }}
                                                title={t('bossSelect.status.victory')}
                                            >
                                                🏆
                                            </div>
                                            <div
                                                className="boss-status-badge defeat"
                                                style={{ display: boss.hasDefeat ? 'flex' : 'none' }}
                                                title={t('bossSelect.status.defeat')}
                                            >
                                                💀
                                            </div>
                                        </div>
                                        <div className="card-body text-center">
                                            <h3 className="card-title">
                                                {boss.icon} {boss.displayName}
                                            </h3>
                                            <p className="card-text">{boss.description}</p>
                                            <Button variant="success" className="w-100">
                                                {t('bossSelect.selectButton')}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
