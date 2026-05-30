import React, { useState, useEffect, useCallback } from 'react';
import Button from 'react-bootstrap/Button';
import { useGameContext } from '../../context/GameContext';
import { AbilitySystem, AbilityType, Equipment, EquipmentType } from '../../systems/AbilitySystem';
import { t } from '../../i18n';
import { ToastUtils, ToastType } from '../../utils/ToastUtils';
import type { SkillData } from '../../data/skills/types';
import type { PlayerItem } from '../../entities/PlayerItemManager';
import { PlayerInfoEditModal } from './PlayerInfoEditModal';

// ---- 型定義 ----

interface AbilityCardInfo {
    type: AbilityType;
    icon: string;
    level: number;
    experience: number;
    nextRequirement: number;
    progressPercentage: number;
    isMaxLevel: boolean;
}

interface PlayerDetailData {
    name: string;
    icon: string;
    maxHp: number;
    maxMp: number;
    attackPower: number;
    weaponBonus: number;
    armorBonus: number;
    glovesBonus: number;
    beltBonus: number;
    abilities: AbilityCardInfo[];
    weapons: Equipment[];
    armors: Equipment[];
    gloves: Equipment[];
    belts: Equipment[];
    equippedWeaponId: string | null;
    equippedArmorId: string | null;
    equippedGlovesId: string | null;
    equippedBeltId: string | null;
    activeSkills: SkillData[];
    passiveSkills: SkillData[];
    items: PlayerItem[];
    isDebugMode: boolean;
}

// ---- 定数 ----

const ABILITY_ICONS: Record<AbilityType, string> = {
    [AbilityType.Combat]: '⚔️',
    [AbilityType.Toughness]: '🛡️',
    [AbilityType.CraftWork]: '🔧',
    [AbilityType.Endurance]: '💪',
    [AbilityType.Agility]: '🏃',
    [AbilityType.Explorer]: '🗺️',
};

// ---- ヘルパー関数 ----

function getEquipmentBonusText(equipment: Equipment, equipmentType: EquipmentType): string {
    if (equipmentType === EquipmentType.Weapons) {
        return `(+${equipment.attackPowerBonus ?? 0} ${t('common.attack')})`;
    } else if (equipmentType === EquipmentType.Armors) {
        return `(+${equipment.hpBonus ?? 0} ${t('common.hp')})`;
    } else if (equipmentType === EquipmentType.Gloves) {
        return `(+${Math.round((equipment.escapeRateBonus ?? 0) * 100)} ${t('common.escapePower')})`;
    } else if (equipmentType === EquipmentType.Belts) {
        return `(+${equipment.mpBonus ?? 0} ${t('common.mp')})`;
    }
    return '';
}

function getSkillCategoryColor(category: string): string {
    switch (category) {
        case 'combat': return 'danger';
        case 'defense': return 'primary';
        case 'support': return 'success';
        default: return 'secondary';
    }
}

function getSkillCategoryName(category: string): string {
    switch (category) {
        case 'combat': return t('skills.categories.combat');
        case 'defense': return t('skills.categories.defense');
        case 'support': return t('skills.categories.support');
        default: return category;
    }
}

// ---- サブコンポーネント ----

interface AbilityCardProps {
    info: AbilityCardInfo;
}

function AbilityCard({ info }: AbilityCardProps): React.ReactElement {
    const progressBarClass = info.isMaxLevel
        ? 'progress-bar bg-warning progress-bar-striped progress-bar-animated'
        : 'progress-bar bg-info';

    return (
        <div className="col-md-6 mb-3">
            <div className="card bg-secondary">
                <div className="card-body">
                    <h6 className="card-title">
                        {info.icon}{' '}
                        {t(`abilities.names.${info.type}`)}
                        {' '}{t('common.levelShort')}{' '}
                        <span>{info.level}</span>
                    </h6>
                    <div className="progress mb-2">
                        <div
                            className={progressBarClass}
                            role="progressbar"
                            style={{ width: `${info.progressPercentage}%` }}
                        />
                    </div>
                    <small className="text-muted">
                        {t('common.expLabel')}: {info.experience} / {info.nextRequirement}
                    </small>
                    <p className="mt-2 mb-0 small">
                        {t(`abilities.descriptions.${info.type}`)}
                    </p>
                </div>
            </div>
        </div>
    );
}

interface EquipmentSectionProps {
    label: string;
    equipmentType: EquipmentType;
    equipments: Equipment[];
    currentEquipmentId: string | null;
    onEquip: (id: string) => void;
}

function EquipmentSection({
    label,
    equipmentType,
    equipments,
    currentEquipmentId,
    onEquip,
}: EquipmentSectionProps): React.ReactElement {
    return (
        <div className="col-lg-3 col-md-6">
            <h6>{label}</h6>
            <div className="mb-3">
                {equipments.length === 0 ? (
                    <div className="text-muted">{t('playerEquipment.noEquipment')}</div>
                ) : (
                    equipments.map((eq) => {
                        const inputId = `${equipmentType}-${eq.id}`;
                        const bonusText = getEquipmentBonusText(eq, equipmentType);
                        const name = AbilitySystem.getEquipmentName(equipmentType, eq);
                        const description = AbilitySystem.getEquipmentDescription(equipmentType, eq);
                        return (
                            <div className="form-check" key={eq.id}>
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name={equipmentType}
                                    id={inputId}
                                    value={eq.id}
                                    checked={currentEquipmentId === eq.id}
                                    onChange={() => onEquip(eq.id)}
                                />
                                <label className="form-check-label" htmlFor={inputId}>
                                    <strong>{name}</strong> {bonusText}
                                    <br />
                                    <small className="text-muted">{description}</small>
                                </label>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

interface SkillItemProps {
    skill: SkillData;
    isPassive: boolean;
}

function SkillItem({ skill, isPassive }: SkillItemProps): React.ReactElement {
    const unlockConditionText = skill.unlockConditions && skill.unlockConditions.length > 0
        ? `${t('skills.unlockConditionsLabel')}: ${skill.unlockConditions
            .map(c => t('skills.unlockConditionItem', { ability: t(`abilities.names.${c.abilityType}`), level: c.requiredLevel }))
            .join(', ')}`
        : '';

    const details: string[] = [];
    if (!isPassive) {
        if (skill.damageMultiplier && skill.damageMultiplier > 1) {
            details.push(t('skills.details.damageMultiplier', { value: skill.damageMultiplier }));
        }
        if (skill.criticalRate && skill.criticalRate > 0.05) {
            details.push(t('skills.details.criticalRate', { value: Math.round(skill.criticalRate * 100) }));
        }
        if (skill.hitRate && skill.hitRate < 1) {
            details.push(t('skills.details.hitRate', { value: Math.round(skill.hitRate * 100) }));
        }
        if (skill.healAmount) {
            details.push(t('skills.details.healAmount', { value: skill.healAmount }));
        }
        if (skill.healPercentage) {
            details.push(t('skills.details.healPercentage', { value: Math.round(skill.healPercentage * 100) }));
        }
    }

    return (
        <div className="skill-item mb-3 p-3 border rounded">
            <div className="skill-header d-flex justify-content-between align-items-start mb-2">
                <div className="skill-info flex-grow-1 me-3">
                    <h6 className="skill-name mb-1">{skill.name}</h6>
                    <p className="skill-description mb-0">{skill.description}</p>
                </div>
                <div className="skill-meta text-end flex-shrink-0">
                    {isPassive ? (
                        <span className="badge bg-info">{t('skills.passiveBadge')}</span>
                    ) : (
                        <>
                            <span className={`badge bg-${getSkillCategoryColor(skill.category)} mb-1`}>
                                {getSkillCategoryName(skill.category)}
                            </span>
                            <div className="skill-cost">{t('skills.mpCost', { cost: skill.mpCost })}</div>
                        </>
                    )}
                </div>
            </div>
            {(details.length > 0 || unlockConditionText) && (
                <div className="skill-details">
                    {details.length > 0 && (
                        <div className="skill-stats mb-1">{details.join(' / ')}</div>
                    )}
                    {unlockConditionText && (
                        <div className="skill-unlock-condition">{unlockConditionText}</div>
                    )}
                </div>
            )}
        </div>
    );
}

// ---- メインコンポーネント ----

type ActiveTab = 'stats' | 'equipment' | 'skills' | 'items';

interface PlayerDetailScreenProps {
    isActive: boolean;
}

export function PlayerDetailScreen({ isActive }: PlayerDetailScreenProps): React.ReactElement {
    const { game } = useGameContext();
    const [activeTab, setActiveTab] = useState<ActiveTab>('stats');
    const [data, setData] = useState<PlayerDetailData | null>(null);
    const [showPlayerInfoEditModal, setShowPlayerInfoEditModal] = useState(false);
    const [debugInputs, setDebugInputs] = useState<Record<AbilityType, string>>(
        () => Object.fromEntries(Object.values(AbilityType).map(t => [t, '0'])) as Record<AbilityType, string>
    );

    const buildData = useCallback((): PlayerDetailData => {
        const player = game.getPlayer();
        const abilityLevels = player.getAbilityLevels();
        const equipInfo = player.getEquipmentInfo();

        const abilities: AbilityCardInfo[] = Object.values(AbilityType).map((type) => {
            const raw = abilityLevels[type] ?? { level: 0, experience: 0, experienceToNext: 0 };
            const isMaxLevel = raw.level >= AbilitySystem.MAX_LEVEL;

            let progressPercentage = 0;
            let nextRequirement: number;

            if (isMaxLevel) {
                progressPercentage = 100;
                nextRequirement = player.abilitySystem.getRequiredExperienceForLevel(AbilitySystem.MAX_LEVEL);
            } else {
                const currentLevelReq = player.abilitySystem.getRequiredExperienceForLevel(raw.level);
                const nextLevelReq = player.abilitySystem.getRequiredExperienceForLevel(raw.level + 1);
                const currentLevelExp = raw.experience - currentLevelReq;
                const levelRangeExp = nextLevelReq - currentLevelReq;
                progressPercentage = levelRangeExp > 0 ? (currentLevelExp / levelRangeExp) * 100 : 0;
                nextRequirement = raw.experience + raw.experienceToNext;
            }

            return {
                type,
                icon: ABILITY_ICONS[type],
                level: raw.level,
                experience: raw.experience,
                nextRequirement,
                progressPercentage,
                isMaxLevel,
            };
        });

        return {
            name: player.name,
            icon: player.icon,
            maxHp: player.maxHp,
            maxMp: player.maxMp,
            attackPower: player.getAttackPower(),
            weaponBonus: player.equipmentManager.getWeaponAttackBonus(),
            armorBonus: player.equipmentManager.getArmorHpBonus(),
            glovesBonus: Math.round(player.equipmentManager.getGlovesEscapeRateBonus() * 100),
            beltBonus: player.equipmentManager.getBeltMpBonus(),
            abilities,
            weapons: player.getAvailableWeapons(),
            armors: player.getAvailableArmors(),
            gloves: player.getAvailableGloves(),
            belts: player.getAvailableBelts(),
            equippedWeaponId: equipInfo.weapon?.id ?? null,
            equippedArmorId: equipInfo.armor?.id ?? null,
            equippedGlovesId: equipInfo.gloves?.id ?? null,
            equippedBeltId: equipInfo.belt?.id ?? null,
            activeSkills: player.getUnlockedSkills(),
            passiveSkills: player.getUnlockedPassiveSkills(),
            items: player.itemManager.getUsableItems(),
            isDebugMode: game.isDebugMode(),
        };
    }, [game]);

    const refresh = useCallback(() => {
        setData(buildData());
        if (game.isDebugMode()) {
            const player = game.getPlayer();
            const levels = player.getAbilityLevels();
            setDebugInputs(
                Object.fromEntries(
                    Object.values(AbilityType).map(type => [type, String(levels[type]?.level ?? 0)])
                ) as Record<AbilityType, string>
            );
        }
    }, [buildData, game]);

    // 初回ロードと updatePlayerSummary イベントでリフレッシュ
    useEffect(() => {
        refresh();

        const handleUpdate = () => refresh();
        document.addEventListener('updatePlayerSummary', handleUpdate);
        return () => {
            document.removeEventListener('updatePlayerSummary', handleUpdate);
        };
    }, [refresh]);

    useEffect(() => {
        if (isActive) {
            refresh();
        }
    }, [isActive, refresh]);

    if (!data) {
        return (
            <div className="container flex-grow-1 d-flex flex-column">
                <div className="row mt-4 mb-4 flex-grow-1">
                    <div className="col-12">
                        <div className="card bg-dark">
                            <div className="card-body text-center py-5">
                                <div
                                    className="spinner-border text-primary"
                                    role="status"
                                    style={{ width: '3rem', height: '3rem' }}
                                >
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 装備ハンドラ
    const handleEquipWeapon = (id: string) => {
        game.getPlayer().equipWeapon(id);
        refresh();
    };
    const handleEquipArmor = (id: string) => {
        game.getPlayer().equipArmor(id);
        refresh();
    };
    const handleEquipGloves = (id: string) => {
        game.getPlayer().equipGloves(id);
        refresh();
    };
    const handleEquipBelt = (id: string) => {
        game.getPlayer().equipBelt(id);
        refresh();
    };

    const handleEquipBest = () => {
        const player = game.getPlayer();
        const success = player.equipBestEquipments();
        if (success) {
            ToastUtils.showToast(
                t('playerEquipment.toasts.equipBestSuccess.message'),
                t('playerEquipment.toasts.equipBestSuccess.title'),
                ToastType.Success
            );
        } else {
            ToastUtils.showToast(
                t('playerEquipment.toasts.equipBestFailure.message'),
                t('playerEquipment.toasts.equipBestFailure.title'),
                ToastType.Error
            );
        }
        refresh();
    };

    const handleUnequipAll = () => {
        const player = game.getPlayer();
        const success = player.unequipAllEquipments();
        if (success) {
            ToastUtils.showToast(
                t('playerEquipment.toasts.unequipAllSuccess.message'),
                t('playerEquipment.toasts.unequipAllSuccess.title'),
                ToastType.Success
            );
        } else {
            ToastUtils.showToast(
                t('playerEquipment.toasts.unequipAllFailure.message'),
                t('playerEquipment.toasts.unequipAllFailure.title'),
                ToastType.Error
            );
        }
        refresh();
    };

    const handleEditPlayerInfo = () => {
        setShowPlayerInfoEditModal(true);
    };

    // デバッグ: 個別アビリティ変更
    const handleDebugAbilityChange = (type: AbilityType) => {
        const newLevel = parseInt(debugInputs[type], 10);
        if (isNaN(newLevel) || newLevel < 0 || newLevel > AbilitySystem.MAX_LEVEL) {
            ToastUtils.showToast(
                t('playerStats.toasts.invalidLevel.message', { maxLevel: AbilitySystem.MAX_LEVEL }),
                t('playerStats.toasts.invalidLevel.title'),
                ToastType.Error
            );
            return;
        }
        const player = game.getPlayer();
        const requiredExp = player.abilitySystem.getRequiredExperienceForLevel(newLevel);
        player.abilitySystem.setAbilityExperience(type, requiredExp);
        player.saveToStorage();
        const abilityName = t(`abilities.names.${type}`);
        ToastUtils.showToast(
            t('playerStats.toasts.changeSuccess.message', { ability: abilityName, level: newLevel }),
            t('playerStats.toasts.changeSuccess.title'),
            ToastType.Success
        );
        refresh();
    };

    // デバッグ: 全アビリティ一括変更
    const handleDebugAllAbilitiesChange = (allLevel: number) => {

        if (isNaN(allLevel) || allLevel < 0 || allLevel > AbilitySystem.MAX_LEVEL) {
            ToastUtils.showToast(
                t('playerStats.toasts.invalidLevel.message', { maxLevel: AbilitySystem.MAX_LEVEL }),
                t('playerStats.toasts.invalidLevel.title'),
                ToastType.Error
            );
            return;
        }
        const player = game.getPlayer();
        const requiredExp = player.abilitySystem.getRequiredExperienceForLevel(allLevel);
        Object.values(AbilityType).forEach(type => {
            player.abilitySystem.setAbilityExperience(type, requiredExp);
        });
        player.saveToStorage();
        ToastUtils.showToast(
            t('playerStats.toasts.bulkChangeSuccess.message', { level: allLevel }),
            t('playerStats.toasts.bulkChangeSuccess.title'),
            ToastType.Success
        );
        refresh();
    };

    const tabClass = (tab: ActiveTab) =>
        `nav-link${activeTab === tab ? ' active' : ''}`;

    return (
        <div className="container flex-grow-1 d-flex flex-column">
            <div className="row mt-4 mb-4 flex-grow-1">
                <div className="col-12">
                    <div className="card bg-dark">
                        <div className="card-header">
                            <h5 className="mb-0">
                                <span>{data.icon}</span>
                                <span>{data.name}</span>
                                {t('playerDetail.titleSuffix')}
                                <Button
                                    type="button"
                                    variant="outline-info"
                                    size="sm"
                                    className="ms-2"
                                    onClick={handleEditPlayerInfo}
                                >
                                    {t('playerDetail.editButton')}
                                </Button>
                            </h5>
                        </div>
                        <div className="card-body">
                            {/* タブ */}
                            <ul className="nav nav-tabs mb-3">
                                <li className="nav-item">
                                    <Button
                                        variant="link"
                                        className={tabClass('stats')}
                                        onClick={() => setActiveTab('stats')}
                                    >
                                        {t('playerDetail.tabs.stats')}
                                    </Button>
                                </li>
                                <li className="nav-item">
                                    <Button
                                        variant="link"
                                        className={tabClass('equipment')}
                                        onClick={() => setActiveTab('equipment')}
                                    >
                                        {t('playerDetail.tabs.equipment')}
                                    </Button>
                                </li>
                                <li className="nav-item">
                                    <Button
                                        variant="link"
                                        className={tabClass('skills')}
                                        onClick={() => setActiveTab('skills')}
                                    >
                                        {t('playerDetail.tabs.skills')}
                                    </Button>
                                </li>
                                <li className="nav-item">
                                    <Button
                                        variant="link"
                                        className={tabClass('items')}
                                        onClick={() => setActiveTab('items')}
                                    >
                                        {t('playerDetail.tabs.items')}
                                    </Button>
                                </li>
                            </ul>

                            {/* タブコンテンツ */}
                            {activeTab === 'stats' && (
                                <StatsPanel data={data} isDebugMode={data.isDebugMode} debugInputs={debugInputs} setDebugInputs={setDebugInputs} onDebugAbilityChange={handleDebugAbilityChange} onDebugAllChange={handleDebugAllAbilitiesChange} />
                            )}
                            {activeTab === 'equipment' && (
                                <EquipmentPanel
                                    data={data}
                                    onEquipWeapon={handleEquipWeapon}
                                    onEquipArmor={handleEquipArmor}
                                    onEquipGloves={handleEquipGloves}
                                    onEquipBelt={handleEquipBelt}
                                    onEquipBest={handleEquipBest}
                                    onUnequipAll={handleUnequipAll}
                                />
                            )}
                            {activeTab === 'skills' && (
                                <SkillsPanel data={data} />
                            )}
                            {activeTab === 'items' && (
                                <ItemsPanel data={data} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <PlayerInfoEditModal
                show={showPlayerInfoEditModal}
                player={game.getPlayer()}
                onHide={() => setShowPlayerInfoEditModal(false)}
                onSaved={refresh}
            />
        </div>
    );
}

// ---- タブパネルサブコンポーネント ----

interface StatsPanelProps {
    data: PlayerDetailData;
    isDebugMode: boolean;
    debugInputs: Record<AbilityType, string>;
    setDebugInputs: React.Dispatch<React.SetStateAction<Record<AbilityType, string>>>;
    onDebugAbilityChange: (type: AbilityType) => void;
    onDebugAllChange: (level: number) => void;
}

function StatsPanel({ data, isDebugMode, debugInputs, setDebugInputs, onDebugAbilityChange, onDebugAllChange }: StatsPanelProps): React.ReactElement {
    const [allLevelInput, setAllLevelInput] = useState('0');

    const handleAllChange = () => {
        const allLevel = parseInt(allLevelInput, 10);
        if (isNaN(allLevel) || allLevel < 0 || allLevel > AbilitySystem.MAX_LEVEL) {
            return;
        }
        setDebugInputs(Object.fromEntries(Object.values(AbilityType).map(type => [type, String(allLevel)])) as Record<AbilityType, string>);
        onDebugAllChange(allLevel);
    };

    return (
        <>
            <div className="row mb-3">
                <div className="col-md-6">
                    <h6>{t('playerStats.baseStats')}</h6>
                    <div className="mb-2">{t('common.hp')}: <span>{data.maxHp}</span></div>
                    <div className="mb-2">{t('common.mp')}: <span>{data.maxMp}</span></div>
                    <div className="mb-2">{t('common.attack')}: <span>{data.attackPower}</span></div>
                </div>
                <div className="col-md-6">
                    <h6>{t('playerStats.equipmentEffects')}</h6>
                    <div className="mb-2">{t('common.armor')}: +<span>{data.armorBonus}</span> {t('common.hp')}</div>
                    <div className="mb-2">{t('common.belt')}: +<span>{data.beltBonus}</span> {t('common.mp')}</div>
                    <div className="mb-2">{t('common.weapon')}: +<span>{data.weaponBonus}</span> {t('common.attack')}</div>
                    <div className="mb-2">{t('common.gloves')}: +<span>{data.glovesBonus}</span> {t('common.escapePower')}</div>
                </div>
            </div>

            <h6>{t('playerStats.abilities')}</h6>
            <div className="row">
                {data.abilities.map(ability => (
                    <AbilityCard key={ability.type} info={ability} />
                ))}
            </div>

            {/* デバッグコントロール */}
            {isDebugMode && (
                <div className="mt-4">
                    <h6>{t('playerStats.debugAbilityTitle')}</h6>
                    <div className="row">
                        {Object.values(AbilityType).map(type => (
                            <div className="col-md-4 mb-3" key={type}>
                                <div className="card bg-secondary">
                                    <div className="card-body">
                                        <h6 className="card-title">{ABILITY_ICONS[type]} {t(`abilities.names.${type}`)}</h6>
                                        <div className="input-group mb-2">
                                            <span className="input-group-text">{t('common.levelShort')}</span>
                                            <input
                                                type="number"
                                                className="form-control"
                                                min={0}
                                                max={AbilitySystem.MAX_LEVEL}
                                                value={debugInputs[type]}
                                                onChange={e => setDebugInputs(prev => ({ ...prev, [type]: e.target.value }))}
                                            />
                                            <Button
                                                variant="outline-warning"
                                                size="sm"
                                                onClick={() => onDebugAbilityChange(type)}
                                            >
                                                {t('common.change')}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="col-md-4 mb-3">
                            <div className="card bg-secondary">
                                <div className="card-body">
                                    <h6 className="card-title">{t('playerStats.bulkTitle')}</h6>
                                    <div className="input-group mb-2">
                                        <span className="input-group-text">{t('common.levelShort')}</span>
                                        <input
                                            type="number"
                                            className="form-control"
                                            min={0}
                                            max={AbilitySystem.MAX_LEVEL}
                                            value={allLevelInput}
                                            onChange={e => setAllLevelInput(e.target.value)}
                                        />
                                        <Button
                                            variant="outline-warning"
                                            size="sm"
                                            onClick={handleAllChange}
                                        >
                                            {t('playerStats.bulkChange')}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

interface EquipmentPanelProps {
    data: PlayerDetailData;
    onEquipWeapon: (id: string) => void;
    onEquipArmor: (id: string) => void;
    onEquipGloves: (id: string) => void;
    onEquipBelt: (id: string) => void;
    onEquipBest: () => void;
    onUnequipAll: () => void;
}

function EquipmentPanel({ data, onEquipWeapon, onEquipArmor, onEquipGloves, onEquipBelt, onEquipBest, onUnequipAll }: EquipmentPanelProps): React.ReactElement {
    return (
        <>
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex gap-2 flex-wrap">
                        <Button variant="primary" onClick={onEquipBest}>
                            {t('playerEquipment.equipBest')}
                        </Button>
                        <Button variant="secondary" onClick={onUnequipAll}>
                            {t('playerEquipment.unequipAll')}
                        </Button>
                    </div>
                </div>
            </div>
            <div className="row">
                <EquipmentSection
                    label={t('common.weapon')}
                    equipmentType={EquipmentType.Weapons}
                    equipments={data.weapons}
                    currentEquipmentId={data.equippedWeaponId}
                    onEquip={onEquipWeapon}
                />
                <EquipmentSection
                    label={t('common.armor')}
                    equipmentType={EquipmentType.Armors}
                    equipments={data.armors}
                    currentEquipmentId={data.equippedArmorId}
                    onEquip={onEquipArmor}
                />
                <EquipmentSection
                    label={t('common.gloves')}
                    equipmentType={EquipmentType.Gloves}
                    equipments={data.gloves}
                    currentEquipmentId={data.equippedGlovesId}
                    onEquip={onEquipGloves}
                />
                <EquipmentSection
                    label={t('common.belt')}
                    equipmentType={EquipmentType.Belts}
                    equipments={data.belts}
                    currentEquipmentId={data.equippedBeltId}
                    onEquip={onEquipBelt}
                />
            </div>
        </>
    );
}

function SkillsPanel({ data }: { data: PlayerDetailData }): React.ReactElement {
    return (
        <div className="row">
            <div className="col-md-6">
                <h6>{t('playerSkills.activeTitle')}</h6>
                <div className="skills-list">
                    {data.activeSkills.length === 0 ? (
                        <p className="text-muted">{t('playerSkills.noActiveSkills')}</p>
                    ) : (
                        data.activeSkills.map(skill => (
                            <SkillItem key={skill.id} skill={skill} isPassive={false} />
                        ))
                    )}
                </div>
            </div>
            <div className="col-md-6">
                <h6>{t('playerSkills.passiveTitle')}</h6>
                <div className="skills-list">
                    {data.passiveSkills.length === 0 ? (
                        <p className="text-muted">{t('playerSkills.noPassiveSkills')}</p>
                    ) : (
                        data.passiveSkills.map(skill => (
                            <SkillItem key={skill.id} skill={skill} isPassive={true} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function ItemsPanel({ data }: { data: PlayerDetailData }): React.ReactElement {
    return (
        <>
            <h6>{t('playerItems.title')}</h6>
            {data.items.length === 0 ? (
                <p className="text-muted">{t('playerItems.noItems')}</p>
            ) : (
                data.items.map(item => (
                    <div className="mb-2 p-2 border rounded" key={item.id}>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <strong>{item.icon} {t(`items.${item.id}.name`)}</strong> x{item.count}
                                <br />
                                <small className="text-muted">{t(`items.${item.id}.description`)}</small>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </>
    );
}
