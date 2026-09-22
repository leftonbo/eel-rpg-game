import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { Player } from '../src/game/entities/Player';
import { Boss } from '../src/game/entities/Boss';
import { AbilitySystem, AbilityType, ARMORS, EquipmentType, WEAPONS } from '../src/game/systems/AbilitySystem';
import { BattleResultStatus, calculateBattleResult } from '../src/game/scenes/BattleResultScene';
import { SkillRegistry } from '../src/game/data/skills';

vi.mock('../src/game/data', () => ({
    getBossData: () => undefined,
    getAllBossData: () => [],
}));
vi.mock('../src/game/i18n', () => ({ t: (key: string) => key }));

beforeEach(() => {
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => {} });
});

afterEach(() => vi.unstubAllGlobals());

test('複数レベル上昇では途中の装備・アイテム・スキルも通知し、既存の解禁は再通知しない', () => {
    const player = new Player();
    const previousLevel = 1;
    const nextLevel = 5;
    const before = player.abilitySystem.getRequiredExperienceForLevel(previousLevel);
    const after = player.abilitySystem.getRequiredExperienceForLevel(nextLevel);
    for (const type of Object.values(AbilityType)) {
        player.abilitySystem.setAbilityExperience(type, before);
    }
    const delta = after - before;
    const result = calculateBattleResult(player, { id: 'test' } as Boss,
        BattleResultStatus.Interrupted, delta / 4, delta / 4, 0, delta);
    const crossed = (level: number) => level > previousLevel && level <= nextLevel;

    expect(result.newUnlocks.weapons).toEqual(WEAPONS.filter(x => crossed(x.requiredLevel))
        .map(x => AbilitySystem.getEquipmentName(EquipmentType.Weapons, x)));
    expect(result.newUnlocks.armors).toEqual(ARMORS.filter(x => crossed(x.requiredLevel))
        .map(x => AbilitySystem.getEquipmentName(EquipmentType.Armors, x)));
    expect(result.newUnlocks.items).toEqual(['アドレナリン注射', 'エリクサー']);

    const oldSkills = SkillRegistry.getUnlockedSkills(new Map(Object.values(AbilityType).map(type => [type, previousLevel])));
    const newSkills = SkillRegistry.getUnlockedSkills(new Map(Object.values(AbilityType)
        .map(type => [type, player.abilitySystem.getAbility(type)!.level])));
    expect(result.newUnlocks.skills.sort()).toEqual(newSkills.filter(id => !oldSkills.includes(id))
        .map(id => SkillRegistry.getSkill(id)!.name).sort());

    const noLevelUp = calculateBattleResult(player, { id: 'test' } as Boss,
        BattleResultStatus.Interrupted, 0, 0, 0);
    expect(Object.values(noLevelUp.newUnlocks).flat()).toEqual([]);
});
