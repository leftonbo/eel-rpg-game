import type { BossData } from '../entities/Boss';

export function countUnlockedBosses(
    bosses: Pick<BossData, 'explorerLevelRequired'>[],
    explorerLevel: number
): number {
    return bosses.filter(boss => {
        const requiredLevel = boss.explorerLevelRequired ?? 0;
        return requiredLevel <= explorerLevel;
    }).length;
}
