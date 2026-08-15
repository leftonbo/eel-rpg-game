import { BossTranslationData } from '../types';

export const bossMessageTranslations: Record<string, BossTranslationData> = {
    'aqua-serpent': {
        battleStartMessages: [
            { text: 'You encounter a mystical sea-serpent dragon on the open ocean.' },
            { text: '"Shaaa... another new life has come to me..."' },
            { text: 'The Aqua Serpent\'s transparent body glows faintly, radiating a beautiful yet terrifying presence...' },
            { text: '"That life force... such a lovely shine. I shall let it gleam forever inside me."' }
        ],
        victoryMessages: [
            { text: '"Shaaa... I did not know life could be so strong..."' },
            { text: '"That radiance... it was too brilliant for me. Well fought."' },
            { text: 'The Aqua Serpent bows its head respectfully, then swims gracefully into the depths of the open sea...' }
        ],
        personality: [
            'Shaaa... what beautiful life force.',
            'I have waited in the depths of this sea...',
            'Shaaa... I will not let you escape.',
            'I shall take your life force...',
            'Shaaa... you look delicious.',
            'I will savor you slowly inside my transparent body.'
        ],
        finishingMove: [
            '"Shaaa... it seems your strength has run out."',
            '{boss} carries {player} deep into its body...',
            '"Travel with me along the sea floor. Do not worry. I shall light the darkness for you."',
            '{player} will spend forever inside the Aqua Serpent\'s transparent body, gazing at the beautiful deep sea...'
        ]
    },
    'bat-vampire': {
        battleStartMessages: [
            { text: 'You face a beautiful and terrifying bat vampire deep inside the old castle.' },
            { text: '"Welcome to my castle... It has been some time since I saw prey as lovely as you."' },
            { text: 'The Bat Vampire spreads his wings elegantly and fixes you with blood-red eyes...' },
            { text: '"That beautiful scent of blood... I must taste it. You will make the finest pet."' }
        ],
        victoryMessages: [
            { text: '"Splendid... truly splendid fighting."' },
            { text: '"If I must lose, then losing to one as strong as you is enough. Magnificent."' },
            { text: 'The Bat Vampire smiles with satisfaction, then melts away into the night...' }
        ],
        personality: [
            'Welcome to my castle... It has been some time since I saw prey as lovely as you.'
        ]
    },
    'clean-master': {
        battleStartMessages: [
            { text: 'You track Clean Master to its laboratory and confront the troublesome mascot robot.' },
            { text: '"Beep beep! Dirt detected! Beginning cleaning!"' },
            { text: 'Clean Master spots you and enters cleaning mode!' },
            { text: '"Scan result: dirt level 87 percent! I will clean you until you are perfect!"' }
        ],
        victoryMessages: [
            { text: '"My cleaning tools broke... but you are very clean now!"' },
            { text: '"Next time I will clean you even more thoroughly."' },
            { text: 'Clean Master\'s cleaning program shuts down.' }
        ],
        personality: [
            'Cleaning, cleaning!',
            'I have to make everything sparkle!',
            'Dirty things do not get away.',
            'I will make you nice and clean.',
            'I will scrub with all I have.',
            'I cannot stop until everything is perfect.'
        ]
    },
    'dark-ghost': {
        battleStartMessages: [
            { text: 'You encounter an eerie spirit in the pitch-black forest.' },
            { text: '"Kekeke... what a tasty soul!"' },
            { text: 'The Dark Ghost watches you with glowing red eyes and laughs cheerfully...' },
            { text: '"Give me that soul! Your despair looks delicious!"' }
        ],
        victoryMessages: [
            { text: '"Kekeke... I cannot believe I lost..."' },
            { text: '"But I will not forget the taste of your soul... I hope we meet again."' },
            { text: 'The Dark Ghost keeps laughing to the end, then dissolves into the darkness of the forest...' }
        ],
        personality: [
            'Kekeke... your soul smells good.',
            'I will take that soul.',
            'I will not let you escape...',
            'Suffer more...',
            'Hehe... you cannot move.',
            'That despair tastes wonderful.'
        ],
        finishingMove: [
            '{boss} sucks in {player}, soul and all, and draws them into its body!',
            '{player}\'s soul is trapped inside {boss}, where its life energy will be drained until the ghost is satisfied...'
        ]
    },
    'demon-dragon': {
        battleStartMessages: [
            { text: 'You encounter a gigantic demon dragon in a land consumed by dark magic.' },
            { text: 'The Demon Dragon shines with deep-purple fur and radiates an intimidating presence...' }
        ],
        victoryMessages: [
            { text: 'You defeated the Demon Dragon!' },
            { text: 'The Demon Dragon lets out a low growl and trembles...' },
            { text: 'At last, the dragon bows its head in respect and vanishes beyond the demon realm, its deep-purple fur still glowing...' }
        ]
    },
    'dream-demon': {
        battleStartMessages: [
            { text: 'You wander into the world of dreams and face a small dream demon.' },
            { text: '"Ah! New prey came here, nmeh!"' },
            { text: 'The little dream demon watches you while giggling...' },
            { text: '"Hehehe, your soul smells so tasty, nmeh! Let us share a sweet dream together!"' }
        ],
        victoryMessages: [
            { text: '"Ugh... I cannot believe I lost... nmeh..."' },
            { text: '"B-but that was just bad luck, nmeh! Next time I will win for sure!"' },
            { text: 'The dream demon refuses to admit defeat and disappears into the dream world in frustration...' }
        ],
        personality: [
            '"Ah, cute prey came here, nmeh!"',
            '"That soul looks so tasty, nmeh."',
            '"Let us play together in the dream, nmeh."',
            '"Hehehe, resisting is useless, nmeh."',
            '"I will weaken you more and more, nmeh."',
            '"I will show you a very sweet dream, nmeh."',
            '"I will sip away your life force, nmeh."',
            '"We will be together forever, nmeh."'
        ]
    },
    'dual-jester': {
        battleStartMessages: [
            { text: 'You encounter a small jester deep inside the abandoned amusement park.' },
            { text: '"Yay! A new friend! Come play with me!"' },
            { text: 'The Dual Jester spins toward you. Behind that innocent smile, another emotion flickers in and out of sight...' },
            { text: '"Hey, hey, what do you want to play? I know every kind of game!"' }
        ],
        victoryMessages: [
            { text: '"Aww, I am tired... but that was fun!"' },
            { text: '"Let us play again! Next time we will play something even more fun!"' },
            { text: 'The Dual Jester smiles contentedly and spins away into the abandoned amusement park...' }
        ],
        personality: [
            'Come play with me!',
            'Which one is the real me?',
            'Let us play something even more fun.',
            'You are such a wonderful toy...',
            'Let us stay together forever.',
            'Hehehe... interesting.'
        ]
    },
    'fluffy-dragon': {
        battleStartMessages: [
            { text: 'You encounter a white dragon covered in fluffy fur in the cold lands.' },
            { text: '"Fuwaa... another guest has come?"' },
            { text: 'The Fluffy Dragon looks like a warm white puffball and carries a sweet lavender scent...' },
            { text: '"You look very tired... rest slowly in my fluffy belly."' }
        ],
        victoryMessages: [
            { text: '"Fuwaa... I did not know someone could be so strong..."' },
            { text: '"But you fought wonderfully... good work."' },
            { text: 'The Fluffy Dragon smiles gently, floats upward, and disappears into the sky like a cloud...' }
        ],
        personality: [
            '"Fluffy... let us sleep together."',
            '"It feels so comfortable, does it not?"',
            '"Just fall asleep like that..."',
            '"I will keep you warm in my fluffy belly."',
            '"You do not need to worry about anything anymore."',
            '"Let us be together forever."'
        ]
    },
    'mech-spider': {
        battleStartMessages: [
            { text: 'You face an eerie mechanical spider deep inside the ancient ruins.' },
            { text: '"SYSTEM BOOT... repair target detected."' },
            { text: 'The Mech Spider analyzes you while blinking red sensor lights...' },
            { text: '"ERROR: severe mechanical damage confirmed. REPAIR PROTOCOL INITIATED..."' }
        ],
        victoryMessages: [
            { text: '"ERROR... SYSTEM FAILURE... repair system halted..."' },
            { text: '"WARNING: self-repair impossible... SHUTDOWN INITIATED..."' },
            { text: 'The Mech Spider sounds one final warning tone, then quietly stops functioning...' }
        ]
    },
    'mikan-dragon': {
        battleStartMessages: [
            { text: 'You encounter a beautiful dragon giving off a sweet scent in the mikan grove.' },
            { text: '"Oh my, welcome. Did my sweet scent lure you here?"' },
            { text: 'The Mikan Dragon smiles charmingly while carrying a refreshing citrus aroma...' },
            { text: '"I will fill you with delicious mikan juice. Let us make you sweet inside my belly."' }
        ],
        victoryMessages: [
            { text: '"Oh my, you were this strong..."' },
            { text: '"Still, that was a fun battle. Please come play again."' },
            { text: 'The Mikan Dragon waves sweetly, leaving a citrus scent behind as she disappears into the mikan grove...' }
        ],
        personality: [
            'Furururu... what a sweet scent, is it not?',
            'Mikan juice is delicious.',
            'Come right inside me.',
            'Furururu... so sweet and tasty.',
            'Wrapped in the scent of mikan...',
            'I will cultivate you inside my body.'
        ],
        finishingMove: [
            '"Furururu..."',
            '{boss}\'s internal tentacles bind {player} deep inside its stomach...',
            '{player} will be cultivated as one of {boss}\'s young inside a body filled with mikan mucus...'
        ]
    },
    'otherworld-centipede': {
        battleStartMessages: [
            { text: 'As you step into the frontier wasteland, the ground trembles faintly...' },
            { text: 'A gigantic many-legged creature crawls out of the earth, gripping all kinds of tools in countless arms!' },
            { text: 'Oh...? Another cute creature has come to defeat me.' },
            { text: 'Try to defeat me. If you cannot, I will eat you.' }
        ],
        victoryMessages: [
            { text: 'Guh... you got me. I surrender!' },
            { text: 'The Otherworld Centipede writhes in frustration and burrows back underground.' },
            { text: 'It seems to have given up for now. Still... it may return someday.' }
        ],
        personality: [
            'Oh...?',
            'Hehe...',
            '"You cute little creature."',
            '"Did you think you could escape?"',
            '"Come... into my body."'
        ]
    },
    'scorpion-carrier': {
        battleStartMessages: [
            { text: 'You encounter a huge scorpion with tire-like legs deep in the desert.' },
            { text: '"Hmm, are you a lost traveler?"' },
            { text: 'The Scorpion Carrier watches you while swaying its syringe-like tail...' },
            { text: '"My legs are faster than yours. I will carry you safely, so stop being shy and let me eat you."' }
        ],
        victoryMessages: [
            { text: '"Gah... I cannot believe I lost..."' },
            { text: '"But with that strength, you should be fine on your own. That is a relief."' },
            { text: 'The Scorpion Carrier nods with satisfaction and rolls away toward the desert horizon...' }
        ],
        personality: [
            'Hmm, are you a lost traveler?',
            'My legs are faster than yours.',
            'Stop being shy and let me eat you.',
            'How does the medicine feel?'
        ],
        finishingMove: [
            'The scorpion places {player}, already inside its body, completely under control!',
            '{player} will be carried forever inside the scorpion!',
            'The scorpion starts walking through the desert with satisfaction...',
            '{player} has become the Scorpion Carrier\'s eternal cargo...'
        ]
    },
    'sea-kraken': {
        battleStartMessages: [
            { text: 'You face a gigantic kraken on the coast.' },
            { text: 'Grrr...' },
            { text: 'The Sea Kraken looks down at you while swaying its massive tentacles...' }
        ],
        victoryMessages: [
            { text: 'You defeated the gigantic kraken!' },
            { text: 'The Sea Kraken curls its tentacles in frustration and returns to the sea...' }
        ],
        personality: [
            'Grrrr...',
            'Shhhhh...',
            'Glub glub...',
            'Sluuurp...',
            'Gwooo...',
            'What a tasty smell...'
        ],
        finishingMove: [
            '"Grrrr..."',
            '{boss}\'s stomach suckers pull in {player}\'s arms and legs, binding the whole body with suction cups!',
            '{player} will keep being injected with ink and drained by suckers, their energy absorbed forever inside {boss}...'
        ]
    },
    'seraph-mascot': {
        battleStartMessages: [
            { text: 'You face a gigantic angel mascot descending from the sky.' },
            { text: '"Wow! I found another child who needs salvation!"' },
            { text: 'The Seraph Mascot looks down at you. Those benevolent eyes have identified you as someone to be saved!' },
            { text: '"It is okay. Big sister will save absolutely everything for you."' }
        ],
        victoryMessages: [
            { text: '"Huh? Is salvation over already?"' },
            { text: '"You are so strong! But call me again if anything troubles you!"' },
            { text: 'The Seraph Mascot returns to the sky looking a little lonely...' }
        ],
        personality: [
            'I will save everyone!',
            'It is okay. Big sister is here with you.',
            'Is there any troubled child here?',
            'I will protect you forever.',
            'Found a child who needs salvation!',
            'Let us all become happy together.'
        ]
    },
    'slime-dragon': {
        battleStartMessages: [
            { text: 'A huge shadow sways beside the lake...' },
            { text: 'Its translucent body shimmers gently, showing curiosity toward you.' },
            { text: 'The Slime Dragon approaches happily!' }
        ],
        victoryMessages: [
            { text: 'The Slime Dragon shrinks down with a dejected look...' },
            { text: 'It seems to have realized it was causing trouble.' },
            { text: 'The Slime Dragon trembles apologetically, as if promising not to bother anyone again...' }
        ],
        personality: [
            'Pulululu...',
            'Kyurururu...',
            '...squish squish.',
            'Pulung!',
            'Kyuu...',
            'Nurururu...'
        ]
    },
    'swamp-dragon': {
        battleStartMessages: [
            { text: 'You encounter a gigantic dragon deep in the swamp.' },
            { text: '"Grrr... I smell prey..."' },
            { text: 'The Swamp Dragon watches you with a dignified gaze...' },
            { text: '"This swamp is my territory! I am gonna eat you!"' }
        ],
        victoryMessages: [
            { text: '"Gwooo...! You are strong!"' },
            { text: '"I lost..."' },
            { text: 'The Swamp Dragon accepts defeat like a proud warrior and quietly withdraws into the depths of the swamp...' }
        ],
        finishingMove: [
            '"Grrr..."',
            '{boss} sends {player} deep into its body!',
            '{player} will remain trapped deep inside, their stamina absorbed until {boss} is satisfied...'
        ]
    },
    'thermal-archiver': {
        battleStartMessages: [
            { text: 'You encounter a mysterious machine device in the ruins of a volcanic region.' },
            { text: '"THERMAL ARCHIVER SYSTEM ACTIVATED... new specimen detected."' },
            { text: 'The Thermal Archiver blinks red sensor lights and echoes with mechanical motion...' },
            { text: '"SPECIMEN COLLECTION PROTOCOL INITIATED... optimal living specimen confirmed."' }
        ],
        victoryMessages: [
            { text: '"CRITICAL ERROR... SYSTEM FAILURE DETECTED..."' },
            { text: '"ARCHIVING PROCESS ABORTED... EMERGENCY SHUTDOWN INITIATED..."' },
            { text: 'The Thermal Archiver sounds an alarm, then all functions stop and the machine falls silent...' }
        ],
        personality: [
            'Beep beep beep...',
            'Gwooo...',
            'Shrrrr...',
            'Whirr...',
            'Click click...',
            'Bzzzz...'
        ],
        finishingMove: [
            '"[COMPLETE] Archive process complete..."',
            '{boss} stores {player} in a special archive chamber inside its body!',
            '{player} will be permanently preserved as a valuable specimen in an optimal storage environment...',
            '"[STATUS] New specimen registration complete. Quality: premium."'
        ]
    },
    'tongue-dragon': {
        battleStartMessages: [
            { text: 'As you step deep into the cave, damp air and a strange smell drift around you...' },
            { text: 'A purple dragon flicking out a long tongue appears from the darkness.' },
            { text: 'The Tongue Dragon finds its prey and licks its lips happily...' }
        ],
        victoryMessages: [
            { text: 'The Tongue Dragon retracts its long tongue in frustration and retreats deeper into the cave...' },
            { text: 'Wiping mucus from the equipment, Elnal is certain of victory.' }
        ],
        personality: [
            'Shurururu...',
            'Nurururu...',
            'Lick lick...',
            'Slurp slurp...',
            'Shur... shur...'
        ]
    },
    'underground-worm': {
        battleStartMessages: [
            { text: 'You encounter a gigantic worm deep underground.' },
            { text: '"Grrrr..."' },
            { text: 'The Underground Worm shows off jaws strong enough to crush stone and growls threateningly...' }
        ],
        victoryMessages: [
            { text: 'You defeated the Underground Worm!' }
        ]
    }
};
