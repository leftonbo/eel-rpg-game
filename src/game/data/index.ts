import { BossData } from '../entities/Boss';

// Dynamic boss data loader cache
const bossDataCache: Map<string, BossData> = new Map();

// Boss metadata for display purposes (lightweight data only)
export interface BossMetadata {
    id: string;
    name: string;
    displayName: string;
    description: string;
    questNote: string;
    difficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard';
    maxHp: number;
    attackPower: number;
    icon: string;
    explorerLevelRequired: number;
    guestCharacterInfo?: {
        creator: string;
    };
}

// Lightweight boss metadata for boss selection (no AI strategies or detailed data)
export const bossMetadata: Map<string, BossMetadata> = new Map([
    ['swamp-dragon', { 
        id: 'swamp-dragon', 
        name: 'SwampDragon',
        displayName: '🐲 沼のドラゴン', 
        description: '沼地に生息するドラゴン', 
        questNote: '沼地に生息する焼け茶色のドラゴンが、通りかかる旅人を襲い続けている。そのドラゴンを討伐し、平和を取り戻すことがあなたの任務だ。',
        difficulty: 'Easy', 
        maxHp: 400,
        attackPower: 18,
        icon: '🐲',
        explorerLevelRequired: 0
    }],
    ['dark-ghost', { 
        id: 'dark-ghost', 
        name: 'DarkGhost',
        displayName: '👻 闇のおばけ', 
        description: '闇に住まう不気味なおばけ', 
        questNote: '闇の森の奥で旅人を脅かし続ける不気味なおばけの話を聞いたことがある。そのおばけを成仏させ、森に平和を取り戻すのがあなたの任務だ。',
        difficulty: 'Easy', 
        maxHp: 150,
        attackPower: 8,
        icon: '👻',
        explorerLevelRequired: 0
    }],
    ['mech-spider', { 
        id: 'mech-spider', 
        name: 'MechSpider',
        displayName: '🕷️ 機械のクモ', 
        description: '機械と生物が融合した巨大クモ', 
        questNote: '廃墟となった研究所で、機械と生物が融合した巨大なクモが目撃されている。そのクモを倒し、研究所の危険を取り除くのがあなたの任務だ。',
        difficulty: 'Easy', 
        maxHp: 180,
        attackPower: 12,
        icon: '🕷️',
        explorerLevelRequired: 0
    }],
    ['dream-demon', { 
        id: 'dream-demon', 
        name: 'DreamDemon',
        displayName: '😈 ドリームデーモン', 
        description: '夢の世界から来た悪魔', 
        questNote: '街の人々が悪夢に悩まされている。夢の世界から現れた悪魔が原因らしい。その悪魔を倒し、人々を悪夢から解放するのがあなたの任務だ。',
        difficulty: 'Medium', 
        maxHp: 240,
        attackPower: 16,
        icon: '😈',
        explorerLevelRequired: 1
    }],
    ['scorpion-carrier', { 
        id: 'scorpion-carrier', 
        name: 'ScorpionCarrier',
        displayName: '🦂 スコーピオンキャリア', 
        description: '巨大なサソリのようなクリーチャー', 
        questNote: '砂漠の遺跡で巨大なサソリのようなクリーチャーが発見された。そのクリーチャーを倒し、遺跡の調査を安全にするのがあなたの任務だ。',
        difficulty: 'Medium', 
        maxHp: 260,
        attackPower: 18,
        icon: '🦂',
        explorerLevelRequired: 1
    }],
    ['mikan-dragon', { 
        id: 'mikan-dragon', 
        name: 'MikanDragon',
        displayName: '🍊 みかんドラゴン', 
        description: 'みかんの力を操る可愛いドラゴン', 
        questNote: 'みかん畑で不思議な現象が起きている。みかんの力を操る可愛らしいドラゴンが原因らしい。そのドラゴンと対話し、平和的に解決するのがあなたの任務だ。',
        difficulty: 'Medium', 
        maxHp: 320,
        attackPower: 22,
        icon: '🍊',
        explorerLevelRequired: 2
    }],
    ['sea-kraken', { 
        id: 'sea-kraken', 
        name: 'SeaKraken',
        displayName: '🐙 海のクラーケン', 
        description: '深海から現れた巨大なクラーケン', 
        questNote: '港町の漁師たちが巨大な海の怪物に襲われている。深海から現れたクラーケンが原因だ。そのクラーケンを倒し、港町に平和を取り戻すのがあなたの任務だ。',
        difficulty: 'Hard', 
        maxHp: 350,
        attackPower: 24,
        icon: '🐙',
        explorerLevelRequired: 3
    }],
    ['aqua-serpent', { 
        id: 'aqua-serpent', 
        name: 'AquaSerpent',
        displayName: '🐍 アクアサーペント', 
        description: '水を操る巨大な海蛇', 
        questNote: '湖の近くで水を操る巨大な海蛇が目撃されている。その海蛇を倒し、湖の安全を確保するのがあなたの任務だ。',
        difficulty: 'Hard', 
        maxHp: 350,
        attackPower: 26,
        icon: '🐍',
        explorerLevelRequired: 3
    }],
    ['clean-master', { 
        id: 'clean-master', 
        name: 'CleanMaster',
        displayName: '🧹 クリーンマスター', 
        description: '清潔さを極めた掃除の達人', 
        questNote: '街中が異常なほど清潔になり、住民が困惑している。清潔さを極めたクリーンマスターが原因らしい。その掃除の達人と対話し、適度な清潔さに戻すのがあなたの任務だ。',
        difficulty: 'Hard', 
        maxHp: 280,
        attackPower: 20,
        icon: '🧹',
        explorerLevelRequired: 3
    }],
    ['bat-vampire', { 
        id: 'bat-vampire', 
        name: 'BatVampire',
        displayName: '🦇 コウモリヴァンパイア', 
        description: '吸血鬼と化した巨大コウモリ', 
        questNote: '夜な夜な街を襲う吸血鬼の噂が絶えない。巨大なコウモリの姿をした吸血鬼が原因だ。そのヴァンパイアを倒し、街に安らかな夜を取り戻すのがあなたの任務だ。',
        difficulty: 'Very Hard', 
        maxHp: 380,
        attackPower: 28,
        icon: '🦇',
        explorerLevelRequired: 4
    }]
]);

// Dynamic boss data loader
async function loadBossData(id: string): Promise<BossData> {
    if (bossDataCache.has(id)) {
        return bossDataCache.get(id)!;
    }

    let bossModule;
    switch (id) {
        case 'swamp-dragon':
            bossModule = await import('./bosses/swamp-dragon');
            break;
        case 'dark-ghost':
            bossModule = await import('./bosses/dark-ghost');
            break;
        case 'mech-spider':
            bossModule = await import('./bosses/mech-spider');
            break;
        case 'dream-demon':
            bossModule = await import('./bosses/dream-demon');
            break;
        case 'scorpion-carrier':
            bossModule = await import('./bosses/scorpion-carrier');
            break;
        case 'mikan-dragon':
            bossModule = await import('./bosses/mikan-dragon');
            break;
        case 'sea-kraken':
            bossModule = await import('./bosses/sea-kraken');
            break;
        case 'aqua-serpent':
            bossModule = await import('./bosses/aqua-serpent');
            break;
        case 'clean-master':
            bossModule = await import('./bosses/clean-master');
            break;
        case 'bat-vampire':
            bossModule = await import('./bosses/bat-vampire');
            break;
        default:
            throw new Error(`Unknown boss ID: ${id}`);
    }

    // Extract boss data from the default export
    const bossData = Object.values(bossModule)[0] as BossData;
    bossDataCache.set(id, bossData);
    return bossData;
}

// Updated synchronous function - now async
export async function getBossData(id: string): Promise<BossData> {
    return await loadBossData(id);
}

// Get boss metadata for selection screen (lightweight)
export function getBossMetadata(id: string): BossMetadata | undefined {
    return bossMetadata.get(id);
}

// Get all boss metadata for selection screen
export function getAllBossMetadata(): BossMetadata[] {
    return Array.from(bossMetadata.values());
}

// Legacy synchronous functions for backward compatibility - deprecated
export function getBossDataSync(id: string): BossData | undefined {
    return bossDataCache.get(id);
}

export function getAllBossDataSync(): BossData[] {
    return Array.from(bossDataCache.values());
}