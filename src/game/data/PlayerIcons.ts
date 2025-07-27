export interface PlayerIcon {
    id: string;
    emoji: string;
    name: string;
    category: string;
}

export const PLAYER_ICONS: PlayerIcon[] = [
    // 動物・生き物系
    { id: 'snake', emoji: '🐍', name: 'ヘビ', category: '動物' },
    { id: 'dragon', emoji: '🐉', name: 'ドラゴン', category: '動物' },
    { id: 'bird', emoji: '🐤', name: 'ひよこ', category: '動物' },
    { id: 'cat', emoji: '🐈', name: 'ネコ', category: '動物' },
    { id: 'dog', emoji: '🐕', name: 'イヌ', category: '動物' },
    { id: 'wolf', emoji: '🐺', name: 'オオカミ', category: '動物' },
    { id: 'fox', emoji: '🦊', name: 'キツネ', category: '動物' },
    { id: 'lion', emoji: '🦁', name: 'ライオン', category: '動物' },
    { id: 'tiger', emoji: '🐯', name: 'トラ', category: '動物' },
    { id: 'bear', emoji: '🐻', name: 'クマ', category: '動物' },
    { id: 'panda', emoji: '🐼', name: 'パンダ', category: '動物' },
    { id: 'rabbit', emoji: '🐰', name: 'ウサギ', category: '動物' },
    { id: 'octopus', emoji: '🐙', name: 'タコ', category: '動物' },
    { id: 'whale', emoji: '🐋', name: 'クジラ', category: '動物' },
    { id: 'shark', emoji: '🦈', name: 'サメ', category: '動物' },
    { id: 'fish', emoji: '🐟', name: '魚', category: '動物' },
    { id: 'eagle', emoji: '🦅', name: 'ワシ', category: '動物' },
    { id: 'owl', emoji: '🦉', name: 'フクロウ', category: '動物' },
    { id: 'penguin', emoji: '🐧', name: 'ペンギン', category: '動物' },
    { id: 'duck', emoji: '🦆', name: 'カモ', category: '動物' },
    
    // ファンタジー・神話系
    { id: 'unicorn', emoji: '🦄', name: 'ユニコーン', category: 'ファンタジー' },
    { id: 'phoenix', emoji: '🐦‍🔥', name: 'フェニックス', category: 'ファンタジー' },
    { id: 'crystal', emoji: '💎', name: 'クリスタル', category: 'ファンタジー' },
    { id: 'crown', emoji: '👑', name: '王冠', category: 'ファンタジー' },
    { id: 'wizard', emoji: '🧙', name: '魔法使い', category: 'ファンタジー' },
    { id: 'knight', emoji: '⚔️', name: '騎士', category: 'ファンタジー' },
    { id: 'witch', emoji: '🧙‍♀️', name: '魔女', category: 'ファンタジー' },
    { id: 'fairy', emoji: '🧚', name: '妖精', category: 'ファンタジー' },
    { id: 'ghost', emoji: '👻', name: 'ゴースト', category: 'ファンタジー' },
    { id: 'bat', emoji: '🦇', name: 'コウモリ', category: 'ファンタジー' },
    { id: 'spider', emoji: '🕷️', name: 'スパイダー', category: 'ファンタジー' },
    { id: 'shooting_star', emoji: '🌟', name: '流れ星', category: 'ファンタジー' },
    
    // 自然・天体系
    { id: 'sun', emoji: '☀️', name: '太陽', category: '自然' },
    { id: 'moon', emoji: '🌙', name: '月', category: '自然' },
    { id: 'star', emoji: '⭐', name: '星', category: '自然' },
    { id: 'lightning', emoji: '⚡', name: '雷', category: '自然' },
    { id: 'flower', emoji: '🌸', name: '桜', category: '自然' },
    { id: 'tree', emoji: '🌳', name: '木', category: '自然' },
    { id: 'snow', emoji: '❄️', name: '雪', category: '自然' },
    { id: 'wave', emoji: '🌊', name: '波', category: '自然' },
    { id: 'maple_leaf', emoji: '🍁', name: '紅葉', category: '自然' },
    { id: 'cactus', emoji: '🌵', name: 'サボテン', category: '自然' },
    
    // アイテム・武器系
    { id: 'sword', emoji: '🗡️', name: '剣', category: '武器' },
    { id: 'shield', emoji: '🛡️', name: '盾', category: '武器' },
    { id: 'bow', emoji: '🏹', name: '弓', category: '武器' },
    { id: 'magic-wand', emoji: '🪄', name: '魔法の杖', category: '武器' },
    { id: 'hammer', emoji: '🔨', name: 'ハンマー', category: '武器' },
    { id: 'jar', emoji: '🏺', name: '壺', category: '武器' },
    { id: 'gold_coin', emoji: '💰', name: '金貨', category: '武器' },
    
    // エレメント
    { id: 'flame', emoji: '🔥', name: '炎', category: 'エレメント' },
    { id: 'water', emoji: '💧', name: '水', category: 'エレメント' },
    { id: 'earth', emoji: '🌍', name: '大地', category: 'エレメント' },
    { id: 'wind', emoji: '💨', name: '風', category: 'エレメント' },
    { id: 'ice', emoji: '🧊', name: '氷', category: 'エレメント' },
    
    // 職業・役職系
    { id: 'ninja', emoji: '🥷', name: '忍者', category: '職業' },
    { id: 'robot', emoji: '🤖', name: 'ロボット', category: '職業' },
    { id: 'astronaut', emoji: '👨‍🚀', name: '宇宙飛行士', category: '職業' },
    { id: 'genie', emoji: '🧞‍♂️', name: 'ジーニー', category: '職業' },
    { id: 'mask', emoji: '🎭', name: '仮面', category: '職業' },
    { id: 'circus', emoji: '🎪', name: 'サーカス', category: '職業' },
    
    // 食べ物系
    { id: 'apple', emoji: '🍎', name: 'リンゴ', category: '食べ物' },
    { id: 'mushroom', emoji: '🍄', name: 'キノコ', category: '食べ物' },
    { id: 'pizza', emoji: '🍕', name: 'ピザ', category: '食べ物' },
    { id: 'cupcake', emoji: '🧁', name: 'カップケーキ', category: '食べ物' },
];

export const getIconById = (id: string): PlayerIcon | undefined => {
    return PLAYER_ICONS.find(icon => icon.id === id);
};

export const getIconByEmoji = (emoji: string): PlayerIcon | undefined => {
    return PLAYER_ICONS.find(icon => icon.emoji === emoji);
};

export const getIconsByCategory = (category: string): PlayerIcon[] => {
    return PLAYER_ICONS.filter(icon => icon.category === category);
};

export const getAllCategories = (): string[] => {
    return Array.from(new Set(PLAYER_ICONS.map(icon => icon.category)));
};