export const aquaSerpent = {
    displayName: 'アクアサーペント',
    description: '大海原を泳ぐ神秘的な海蛇型の龍',
    questNote: '大海原の深くに潜む、青い体を持つ巨大な海蛇型の龍。体内が淡く光っており、透明なお腹から内部が見える神秘的な存在。獲物を体内に閉じ込めて生命力を吸収する習性を持つ。その美しくも恐ろしい力を止めることができるのか？',
    appearanceNote: '青い鱗、海蛇型の龍、透明な体内、淡く光る体内',
    battleStartMessages: [
        {
            speaker: 'player',
            style: 'default',
            text: 'あなたは大海原で神秘的な海蛇型の龍と遭遇した。'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「シャアアア...また新しき命が我が元に...」'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: 'アクアサーペントの透明な体が淡く光り、美しくも恐ろしい存在感を放っている...'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「その生命力...とても美しい輝きじゃ。我が体内で永遠に輝かせてやろう」'
        }
    ],
    victoryMessages: [
        {
            speaker: 'boss',
            style: 'talk',
            text: '「シャアアア...こんなに強き命があったとは...」'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「その輝き...我にはまばゆすぎたようじゃ...見事じゃ」'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: 'アクアサーペントは敬意を込めて頭を下げると、優雅に大海原の深くへと泳ぎ去っていった...'
        }
    ],
    victoryTrophy: {
        name: '透明な鱗',
        description: 'アクアサーペントの美しく透明な鱗。水の中でも光を反射する神秘的な外皮。'
    },
    defeatTrophy: {
        name: '生命の水',
        description: 'アクアサーペントの体内を循環していた純粋な生命の水。治癒力を持つと言われる。'
    },
    personality: [
        'シャアアア...美しい生命力じゃ',
        'この海の奥深くで...待ち望んでいた',
        'シャアアア...逃がしはせぬぞ',
        'お主の生命力を...いただこう',
        'シャアアア...美味しそうじゃ',
        '透明な体内で...ゆっくり味わってやろう'
    ]
};

