import { BossTranslation } from '../types';

export const xenoTendrilBeastTranslations: BossTranslation = {
    ja: {},
    en: {
        displayName: 'Xeno Tendril Beast',
        description: 'A wordless, tentacle-covered alien predator lurking in a meteor crater.',
        appearanceNote: 'An alien beast with gray-white hide, a split maw, countless tendrils over its body, and a pale blue core glowing inside. It does not speak, hunting through growls, scent, and vibrations.',
        questNote: 'At the edge of the industrial zone, witnesses report a tentacle-covered alien creature inside a meteor crater. It moves like a wild beast and tracks prey by scent and vibration. Drive off the Xeno Tendril Beast before the danger spreads.',
        actions: {
            'tendril-rake': {
                name: 'Tendril Rake',
                description: 'Rakes prey with a quick lash of countless thin tendrils.'
            },
            'maw-feint': {
                name: 'Maw Feint',
                description: 'Fakes a bite, then strikes from the side with tendrils.'
            },
            'biolume-spores': {
                name: 'Bioluminescent Spore Spray',
                description: 'Sprays glowing spores from tendril tips to disturb vision.'
            },
            'scent-lock': {
                name: 'Prey-Scent Mark',
                description: 'Marks prey with antennae and slime, making restraint easier.'
            },
            'tendril-snare': {
                name: 'Tendril Swarm Snare',
                description: 'Restrains prey with tendrils stretching from the floor and walls.'
            },
            'pounce-prepare': {
                name: 'Pounce Stance',
                description: 'Plants tendrils into the ground and prepares a beastlike leap.'
            },
            'coil-crush': {
                name: 'Tendril Crush',
                description: 'Squeezes restrained prey with pulsing tendrils.'
            },
            'sensory-buzz': {
                name: 'Sensory Buzz',
                description: 'Scrambles the prey’s senses with vibrations through the tendrils.'
            },
            'feeding-tendrils': {
                name: 'Feeding Tendrils',
                description: 'Slowly drains vitality from restrained prey.'
            },
            'inner-pulse': {
                name: 'Internal Pulse',
                description: 'The inner tendril walls pulse and push prey deeper.'
            },
            'acidic-hum': {
                name: 'Acidic Hum',
                description: 'A low internal growl and warm fluids wear prey down.'
            },
            'stomach-tendrils': {
                name: 'Stomach Tendrils',
                description: 'Thin inner tendrils probe around prey and siphon vitality.'
            },
            'ravage-pounce': {
                name: 'Ravage Pounce',
                description: 'Leaps with beastlike force using stored tendril recoil.'
            },
            'xeno-swallow': {
                name: 'Alien Swallow',
                description: 'Carries exhausted prey to its maw and swallows them whole.'
            },
            'inner-core-pulse': {
                name: 'Inner Core Pulse',
                description: 'The inner core flashes once, weakening prey with a full-body pulse.'
            },
            'core-nest-finish': {
                name: 'Core Nest Fixation',
                description: 'Fixes helpless prey beside the glowing core inside its body.'
            },
            'post-core-rocking': {
                name: 'Core Nest Cradle',
                description: 'Keeps prey fixed in a tendril cradle near the core.'
            },
            'post-biolume-soak': {
                name: 'Biolume Slime Soak',
                description: 'Wraps prey in glowing internal slime and dulls outside senses.'
            },
            'post-tendril-nest': {
                name: 'Tendril Nest Reweave',
                description: 'Reweaves the inner nest and wraps prey even deeper.'
            },
            'post-molt-cycle': {
                name: 'Internal Molt Cycle',
                description: 'Replaces its inner membrane every eight turns and seals prey in fresh nest material.'
            }
        },
        victoryTrophy: {
            name: 'Xeno Beast Carapace Chip',
            description: 'A hard gray-white fragment from the Xeno Tendril Beast’s hide. Fine grooves like tendril traces cross its surface, and it glows faintly blue.'
        },
        defeatTrophy: {
            name: 'Core-Nest Luminous Slime',
            description: 'Warm glowing slime gathered near the beast’s inner core. Touching it carries a low vibration and a trace of alien vitality.'
        },
        battleStartMessages: [
            { text: 'At the bottom of the meteor crater, a wet metallic sound echoes around you.' },
            { text: 'A gray-white alien creature appears, dragging countless tendrils over the floor.' },
            { text: 'Giiiiii...' },
            { text: 'The Xeno Tendril Beast does not speak. It crouches like an animal and searches for your scent.' }
        ],
        victoryMessages: [
            { text: 'The Xeno Tendril Beast curls its tendrils inward and retreats into the depths of the crater.' },
            { text: 'You drove off the dangerous alien predator!' }
        ],
        personality: [
            'Giiiiii...',
            'Shrrrrrr...',
            'Vuuuuuu...',
            'Once it learns a prey scent, its tendrils move much faster.',
            'It does not understand words, but never ignores a weakened target.',
            'When satisfied, it growls low and flashes its inner core pale blue.'
        ]
    }
};
