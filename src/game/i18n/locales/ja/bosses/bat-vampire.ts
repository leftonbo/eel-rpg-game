export const batVampire = {
    displayName: '蝙蝠のヴァンパイア',
    description: '古城に住む蝙蝠の獣人',
    questNote: 'あなたの元に奇妙な招待状が届いた。そこには「君の成果を称える宴に招待する」とだけ書かれたメッセージと、古城の地図が添えられていた。あなたはその城へ向かうことにした...',
    appearanceNote: '蝙蝠獣人、ヴァンパイア',
    battleStartMessages: [
        {
            speaker: 'player',
            style: 'default',
            text: 'あなたは古城の奥で美しく恐ろしい蝙蝠のヴァンパイアと対峙した。'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「ようこそ、我が城へ...君のような美しい獲物は久々だ」'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: '蝙蝠のヴァンパイアは優雅に羽根を広げ、血のように赤い瞳でこちらを見つめている...'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「その美しい血の香り...是非とも味わわせてもらおう。君は最高のペットになるだろう」'
        }
    ],
    victoryMessages: [
        {
            speaker: 'boss',
            style: 'talk',
            text: '「素晴らしい...実に素晴らしい戦いぶりだった」'
        },
        {
            speaker: 'boss',
            style: 'talk',
            text: '「君のような強者に敗れるのなら...本望だ。見事、見事だよ」'
        },
        {
            speaker: 'boss',
            style: 'default',
            text: '蝙蝠のヴァンパイアは満足そうに微笑むと、夜の闇に溶けるように姿を消していった...'
        }
    ],
    personality: [
        'ようこそ、我が城へ...君のような美しい獲物は久々だ'
    ],
    victoryTrophy: {
        name: '蝙蝠の羽根',
        description: '蝙蝠のヴァンパイアの美しい漆黒の羽根。夜空を舞う優雅な証として輝いている。'
    },
    defeatTrophy: {
        name: '古城のワイングラス',
        description: '蝙蝠のヴァンパイアが愛用していた血の赤い液体が入ったワイングラス。甘美な記憶が宿っている。'
    }
};

