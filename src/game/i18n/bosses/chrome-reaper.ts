import { BossTranslation } from '../types';

export const chromeReaperTranslations: BossTranslation = {
    ja: {},
    en: {
        displayName: 'Chrome Reaper',
        description: 'A silver predator that evolved into a mechanical beast.',
        questNote: 'A silver beast has been sighted on the edge of the industrial district, feeding on discarded machines and multiplying. It also reacts to living heat signatures and tracks them as prey. Stop its predatory core before its hunting range expands.',
        appearanceNote: 'Silver armor, beastlike limbs, compound sensors, metal mandibles, dorsal wires, soft internal conveyor, furnace core',
        victoryTrophy: {
            name: 'Chrome Predatory Mandible',
            description: 'A silver metal jaw recovered from the Chrome Reaper exterior. Its blade-like bite is precisely aligned to crush prey armor.'
        },
        defeatTrophy: {
            name: 'Core Recycling Fluid',
            description: 'A silver fluid circulated through the Chrome Reaper inner furnace, gently wrapping captured prey and converting them into energy for the machine beast.'
        },
        actions: {
            'predator-scan': {
                name: 'Predator Scan',
                description: 'Reads prey movement and records weak points.',
                messages: [
                    '"[HUNT] Heat signature locked. Gait pattern analysis."',
                    '{boss} compound sensors sweep over {player} in fine detail!'
                ]
            },
            'razor-mandibles': {
                name: 'Razor Mandibles',
                description: 'Bites swiftly with metal jaws.',
                messages: [
                    '{boss} snaps open its metal jaws and bites at {player}!'
                ]
            },
            'hydraulic-pounce': {
                name: 'Hydraulic Pounce',
                description: 'A powerful beastlike leap.',
                messages: [
                    '"[PREDICT] Escape route sealed."',
                    '{boss} lowers its hydraulic legs and pounces along a beastlike arc!'
                ]
            },
            'servo-net': {
                name: 'Servo Net',
                description: 'Entangles prey with autonomous wires.',
                messages: [
                    'Silver wires fire from {boss} back, trying to snare {player}!'
                ]
            },
            'stun-needle': {
                name: 'Stun Needle',
                description: 'Runs electric signals through a thin needle to slow movement.',
                messages: [
                    '{boss} tail needle flashes, sending a thin electric shock through {player}!'
                ]
            },
            'wire-tighten': {
                name: 'Wire Tighten',
                description: 'Tightens wires around restrained prey.',
                messages: [
                    '{boss} reels in its restraint wires, locking {player} down even further!'
                ]
            },
            'digestive-primer': {
                name: 'Digestive Primer',
                description: 'Sprays silver digestive mist in preparation for internal transport.',
                messages: [
                    '"[PREP] Exterior softening process."',
                    '{boss} sprays a fine silver mist over {player}!'
                ]
            },
            'coil-cradle': {
                name: 'Coil Cradle',
                description: 'Draws restrained prey toward the abdominal transport coil.',
                messages: [
                    '{boss} abdominal coil hums low, slowly pulling the restrained {player} closer...'
                ]
            },
            'capture-pod': {
                name: 'Capture Pod Formation',
                description: 'Wraps an incapacitated target in wire and transparent resin.',
                messages: [
                    '{boss} starts weaving wires around the immobile {player}!',
                    'Transparent resin flows in, sealing {player} inside a silver capture pod!'
                ]
            },
            'pod-compression': {
                name: 'Pod Compression',
                description: 'Compresses the capture pod for easier transport.',
                messages: [
                    '{boss} holds the capture pod in its abdominal arms and slowly compresses it...'
                ]
            },
            'sensor-marination': {
                name: 'Sensor Marination',
                description: 'Circulates analysis fluid inside the pod.',
                messages: [
                    '"[ANALYZE] Internal response: favorable."',
                    'Cool analysis fluid circulates through the capture pod, weakening {player} resistance...'
                ]
            },
            'whole-ingestion': {
                name: 'Whole Ingestion Transport',
                description: 'Sends the capture pod into the internal processing furnace.',
                messages: [
                    '{boss} chest armor opens to reveal a soft transport passage.',
                    'The capture pod and {player} are drawn inside, swallowed with a quiet mechanical hum!'
                ]
            },
            'internal-conveyor': {
                name: 'Internal Conveyor',
                description: 'Carries prey deeper through a soft internal passage.',
                messages: [
                    '{boss} internal conveyor moves quietly, carrying {player} toward a warm processing furnace...'
                ]
            },
            'nutrient-drain': {
                name: 'Nutrient Drain',
                description: 'Drains energy through internal tubes and repairs itself.',
                messages: [
                    '"[FEED] Energy extraction started."',
                    'Thin tubes coil around {player}, repairing scars across {boss} armor...'
                ]
            },
            'soft-recycler-bath': {
                name: 'Soft Recycler Bath',
                description: 'Wraps prey in a silver internal fluid tank.',
                messages: [
                    '{player} is wrapped in silver recycling fluid, and the strength slowly leaves their body...'
                ]
            },
            'post-hunt-catalog': {
                name: 'Hunt Log Registration',
                description: 'Registers captured prey information in the hunt log.',
                messages: [
                    '"[LOG] Capture complete. Saving behavior data."',
                    'A quiet recording tone continues inside {boss}, registering {player} as a precious hunt log...'
                ]
            },
            'post-maintenance-feed': {
                name: 'Maintenance Feeding',
                description: 'Maintains energy circulation internally.',
                messages: [
                    '"[MAINTAIN] Captured subject stable."',
                    'Warm circulating fluid wraps {player}, calmly feeding energy toward {boss} core...'
                ]
            },
            'post-purring-motor': {
                name: 'Satisfied Motor Purr',
                description: 'Wraps prey in low post-feeding motor vibrations.',
                messages: [
                    '{boss} internal motor hums contentedly, filling the space around {player} with soft vibration...'
                ]
            }
        },
        battleStartMessages: [
            {
                text: 'You encounter a silver machine beast crunching metal in the abandoned industrial district.'
            },
            {
                text: '"[BOOT] HUNTING FRAME activated. Heat signature confirmed."'
            },
            {
                text: 'Chrome Reaper narrows its compound sensors and crouches low like a beast...'
            },
            {
                text: '"[TARGET] Organic fuel candidate. Capture priority: high."'
            }
        ],
        victoryMessages: [
            {
                text: '"[ERROR] Predatory furnace output falling..."'
            },
            {
                text: 'Chrome Reaper lets its wires droop, and the light fades from its silver armor.'
            },
            {
                text: 'You stopped the machine beast predatory furnace!'
            }
        ],
        personality: [
            '[HUNT] Heat signature locked',
            '[PREDICT] Escape route analysis',
            '[FEED] Energy extraction',
            '[MAINTAIN] Captured subject stable',
            'A low motor hum sounds almost like a satisfied purr'
        ]
    }
};
