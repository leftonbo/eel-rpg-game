import { countUnlockedBosses } from '../src/game/scenes/OutGameExplorationRecordScene';

describe('countUnlockedBosses', () => {
    test('探索者レベル以下のボスだけをアンロック済みとして数える', () => {
        const bosses = [
            {},
            { explorerLevelRequired: 0 },
            { explorerLevelRequired: 1 },
            { explorerLevelRequired: 5 }
        ];

        expect(countUnlockedBosses(bosses, 0)).toBe(2);
        expect(countUnlockedBosses(bosses, 1)).toBe(3);
        expect(countUnlockedBosses(bosses, 4)).toBe(3);
        expect(countUnlockedBosses(bosses, 5)).toBe(4);
    });
});
