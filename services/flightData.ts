
import { LogEntry, Phase, AircraftCategory } from '../types';

// Coordinates for key locations
export const LOCATIONS = {
  // UK Bases
  KIRTON: { lat: 53.476, lng: -0.584, name: "Kirton-in-Lindsay (OTU)" },
  ASTON_DOWN: { lat: 51.706, lng: -2.128, name: "Aston Down" },
  TANGMERE: { lat: 50.849, lng: -0.710, name: "RAF Tangmere" },
  APPLEDRAM: { lat: 50.817, lng: -0.817, name: "RAF Appledram" },
  LYMPNE: { lat: 51.076, lng: 1.026, name: "RAF Lympne" },
  SKEABRAE: { lat: 59.050, lng: -3.250, name: "RAF Skeabrae (Orkney)" },
  SUMBURGH: { lat: 59.878, lng: -1.295, name: "RAF Sumburgh (Shetland)" },
  NORTH_WEALD: { lat: 51.712, lng: 0.163, name: "RAF North Weald" },
  BRADWELL_BAY: { lat: 51.733, lng: 0.883, name: "RAF Bradwell Bay" },
  MANSTON: { lat: 51.343, lng: 1.353, name: "RAF Manston" },
  WARMWELL: { lat: 50.683, lng: -2.350, name: "RAF Warmwell" },
  POOLE: { lat: 50.715, lng: -1.987, name: "Poole" },
  JERSEY: { lat: 49.214, lng: -2.131, name: "Jersey" },
  LITTLE_RISSINGTON: { lat: 51.867, lng: -1.733, name: "Little Rissington" },
  TEALING: { lat: 56.527, lng: -2.972, name: "RAF Tealing" },

  // European Theater Locations & Targets
  NORMANDY_BEACH: { lat: 49.369, lng: -0.871, name: "Normandy Beach Head" },
  B10_PLUMETOT: { lat: 49.283, lng: -0.366, name: "B.10 Plumetot (France)" },
  CAEN: { lat: 49.182, lng: -0.370, name: "Caen" },
  V1_SITE: { lat: 50.0, lng: 1.5, name: "V1 Launch Site (Approx)" }, // Pas-de-Calais area
  DUISBURG: { lat: 51.434, lng: 6.762, name: "Duisburg" },
  FLUSHING: { lat: 51.453, lng: 3.570, name: "Flushing (Vlissingen)" },
  HOMBERG: { lat: 51.450, lng: 6.683, name: "Homberg" },
  MUNSTER: { lat: 51.960, lng: 7.626, name: "Munster" },
  HAMBURG: { lat: 53.551, lng: 9.993, name: "Hamburg" },
  DORTMUND: { lat: 51.513, lng: 7.465, name: "Dortmund" },
  BOTTROP: { lat: 51.523, lng: 6.927, name: "Bottrop" },
  KAMEN: { lat: 51.591, lng: 7.662, name: "Kamen" },
  COLOGNE: { lat: 50.937, lng: 6.960, name: "Cologne" },
  HANNA: { lat: 51.600, lng: 7.200, name: "Hanna (Target)" }, // Approx
  GELSENKIRCHEN: { lat: 51.517, lng: 7.099, name: "Gelsenkirchen" },
  RECKLINGHAUSEN: { lat: 51.616, lng: 7.198, name: "Recklinghausen" },
  OSNABRUCK: { lat: 52.279, lng: 8.047, name: "Osnabruck" },
  HELIGOLAND: { lat: 54.180, lng: 7.890, name: "Heligoland" },
  PETIT_BROGEL: { lat: 51.166, lng: 5.466, name: "Petit Brogel (B.90)" },
  PARIS: { lat: 48.856, lng: 2.352, name: "Paris" },
  BRUSSELS: { lat: 50.846, lng: 4.352, name: "Brussels" },

  // Asian Theater (Ferry)
  KARACHI: { lat: 24.860, lng: 67.001, name: "Karachi (Drigh Road)" },
  JODHPUR: { lat: 26.258, lng: 73.048, name: "Jodhpur" },
  ALLAHABAD: { lat: 25.435, lng: 81.846, name: "Allahabad" },
  CALCUTTA: { lat: 22.572, lng: 88.363, name: "Calcutta" },
  AKYAB: { lat: 20.138, lng: 92.887, name: "Akyab (Sittwe)" },
  RANGOON: { lat: 16.840, lng: 96.173, name: "Rangoon" },
  BANGKOK: { lat: 13.913, lng: 100.607, name: "Bangkok (Don Muang)" },
  DELHI: { lat: 28.704, lng: 77.102, name: "Delhi" },
  LAHORE: { lat: 31.520, lng: 74.358, name: "Lahore" },
  KOHAT: { lat: 33.565, lng: 71.442, name: "Kohat" },
  NAGPUR: { lat: 21.145, lng: 79.088, name: "Nagpur" },
  HAKIMPET: { lat: 17.554, lng: 78.523, name: "Hakimpet" },
  YELLAHANKA: { lat: 13.136, lng: 77.606, name: "Yellahanka" },
  BANGALORE: { lat: 12.956, lng: 77.662, name: "Bangalore" },
  BOMBAY: { lat: 19.090, lng: 72.868, name: "Bombay (Juhu)" },
  BARODA: { lat: 22.332, lng: 73.226, name: "Baroda" },
  RANCHI: { lat: 23.314, lng: 85.322, name: "Ranchi" },
};

const BASE_ASSET_URL = import.meta.env.BASE_URL;

export const AIRCRAFT_SPECS: Record<string, { name: string, role: string, maxSpeed: string, range: string, description: string }> = {
  'Master II': {
    name: "Miles Master II",
    role: "Advanced Trainer",
    maxSpeed: "242 mph",
    range: "393 miles",
    description: "A British two-seat monoplane advanced trainer built by Miles Aircraft for the RAF. It was the most widely used advanced trainer of the war."
  },
  'Spitfire I': {
    name: "Supermarine Spitfire Mk I",
    role: "Fighter",
    maxSpeed: "362 mph",
    range: "395 miles",
    description: "The early variant of the legendary British single-seat fighter aircraft. It played a crucial role during the Battle of Britain."
  },
  'Spitfire V': {
    name: "Supermarine Spitfire Mk V",
    role: "Fighter",
    maxSpeed: "370 mph",
    range: "470 miles",
    description: "The most produced variant of the Spitfire. Used extensively in 1941-1942 and later in other theaters."
  },
  'Spitfire IX': {
    name: "Supermarine Spitfire Mk IX",
    role: "Fighter / Fighter-Bomber",
    maxSpeed: "408 mph",
    range: "434 miles (clean)",
    description: "Originally a stop-gap measure to counter the Focke-Wulf 190, the Mk IX became the most produced Spitfire variant. Powered by the Merlin 60 series engine."
  },
  'Spitfire XIV': {
    name: "Supermarine Spitfire Mk XIV",
    role: "Fighter / Reconnaissance",
    maxSpeed: "448 mph",
    range: "460 miles",
    description: "A significant evolution using the Rolls-Royce Griffon engine and a five-bladed propeller. It offered superior performance, especially at low altitudes, and was used against V-1 flying bombs."
  },
  'Hurricane IIc': {
    name: "Hawker Hurricane Mk IIc",
    role: "Fighter / Ground Attack",
    maxSpeed: "340 mph",
    range: "460 miles",
    description: "Known as the 'Hurribomber', this variant was fitted with four 20mm Hispano cannons, making it a devastating ground attack platform."
  },
  'Dakota': {
    name: "Douglas C-47 Dakota",
    role: "Military Transport",
    maxSpeed: "224 mph",
    range: "1,600 miles",
    description: "The military version of the DC-3. A workhorse of the war, used for transport, paratroop drops, and towing gliders. Known for its rugged reliability."
  },
  'Sunderland': {
    name: "Short Sunderland",
    role: "Flying Boat / Patrol",
    maxSpeed: "210 mph",
    range: "1,780 miles",
    description: "A large, four-engine flying boat used for maritime patrol and antisubmarine warfare. Heavily armed, earning it the German nickname 'Flying Porcupine'."
  },
  'Harvard III': {
    name: "North American Harvard III",
    role: "Advanced Trainer",
    maxSpeed: "205 mph",
    range: "750 miles",
    description: "The British Commonwealth name for the T-6 Texan. A ubiquitous advanced trainer aircraft used to train pilots of the RAF and other air forces."
  }
};

export const FLIGHT_LOG: LogEntry[] = [
    // Phase 1: Training
    {
        id: '1',
        date: '1944-03-15',
        phase: Phase.TRAINING,
        aircraftType: 'Master II',
        aircraftCategory: AircraftCategory.TRAINING,
        duty: 'Check flight, local familiarization',
        time: '0:45',
        remarks: 'A check ride for solo flight.',
        historicalNote: "A check ride was a required test for pilots to demonstrate their ability to fly solo. It was a chance to practice flying solo and to get a feel for the aircraft. This was Robin's first in his logbook. Most of Robin's time at RAF Tealing was spent in various training missions.",
        origin: LOCATIONS.TEALING,
        destination: LOCATIONS.TEALING,
        isSignificant: false,
        sourceDocument: '058.jpg'
    },
    {
        id: '2',
        date: '1944-04-02',
        phase: Phase.TRAINING,
        aircraftType: 'Spitfire I',
        aircraftCategory: AircraftCategory.TRAINING,
        duty: 'Formation flying and aerobatics',
        time: '1:10',
        remarks: 'Formation practice at altitude.',
        origin: LOCATIONS.TEALING,
        destination: LOCATIONS.TEALING,
        isSignificant: false,
        sourceDocument: '059.jpg'
    },
    {
        id: '3',
        date: '1944-05-10',
        phase: Phase.TRAINING,
        aircraftType: 'Hurricane IIc',
        aircraftCategory: AircraftCategory.TRAINING,
        duty: 'Low-level cross-country',
        time: '1:30',
        remarks: 'Navigation exercise.',
        origin: LOCATIONS.TEALING,
        destination: LOCATIONS.TEALING,
        isSignificant: false,
        sourceDocument: '060.jpg'
    },
    {
        id: '4',
        date: '1944-05-26',
        phase: Phase.TRAINING,
        aircraftType: 'Spitfire I',
        aircraftCategory: AircraftCategory.TRAINING,
        duty: 'Flight Assessment - 414',
        time: '0:00',
        remarks: 'Robin earns his wings',
        origin: LOCATIONS.ASTON_DOWN,
        destination: LOCATIONS.ASTON_DOWN,
        isSignificant: true,
        sourceDocument: '061.jpg',
        customView: 'gradebook',
        historicalNote: 'Robin graduates to become a full pilot after extensive training, finally "earning his wings." The rating system was known for being honest, and "Average" was not a euphemism for "bad" - it meant he was ready for combat.',
        pilotNotes: 'On May 30 1944 I was posted from 84 G.S.U. (RAF Aston Down) to 313 Squadron in 2nd Tactical Air Force. I\'d had my pilot\'s wings for 30 months - and arrived on a Grey Spitfire Mk. IX at a temporary airfield at Appledram. We were there about a week before the Invasion.'
    },

    // Phase 2: Combat (313 Squadron) - Reconstructed from Logbooks 062-074
    // June 1944 - Base: APPLEDRAM
    {
        id: 'c-062-1',
        date: '1944-06-02',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Convoy PATROL',
        time: '2:00',
        remarks: "Robin's first ever mission with his wings",
        historicalNote: "Robin's very first operational mission as a combat pilot - patrolling over what he maybe didn't yet know was the gathering invasion fleet for D-Day. After 30 months of training, and now finally assigned to a squadron, his war was about to begin in the most dramatic way possible.",
        origin: LOCATIONS.APPLEDRAM,
        destination: LOCATIONS.APPLEDRAM,
        isSignificant: true,
        sourceDocument: '062.jpg',
        pilotNotes: 'This "Convoy" was in Part - the Invasion Fleet.'
    },
    {
        id: 'c-062-2',
        date: '1944-06-05',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Beach HEAD PATROL',
        time: '1:50',
        remarks: 'Patrol over invasion fleet.',
        origin: LOCATIONS.APPLEDRAM,
        target: LOCATIONS.NORMANDY_BEACH,
        destination: LOCATIONS.APPLEDRAM,
        isSignificant: true,
        historicalNote: "The day before D-Day. The greatest amphibious invasion in history was about to begin, and Robin was patrolling over the massing fleet.",
        sourceDocument: '062.jpg',
        // pilotNotes: '30 mths elapsed from the time I got my pilot\'s "wings" to getting to a squadron - and what could be a more dramatic way of starting on ops than to fly daily over the tiny beach head where the Allies struggled to get ashore and open up the second front.'
    },
    {
        id: 'c-062-3',
        date: '1944-06-06',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Beach HEAD PATROL',
        time: '2:00',
        remarks: 'D-Day Patrol.',
        origin: LOCATIONS.APPLEDRAM,
        target: LOCATIONS.NORMANDY_BEACH,
        destination: LOCATIONS.APPLEDRAM,
        isSignificant: true,
        historicalNote: "D-Day: June 6, 1944 - Operation Overlord. 313 Squadron flew air cover over the Normandy beaches as 156,000 Allied troops stormed ashore. At the briefing, pilots were told their squadrons could suffer 90% casualties and still be fully operational by Day 2 - that's how many reserves were waiting.",
        sourceDocument: '062.jpg',
        pilotNotes: 'Normandy provided the Beach Head for the invasion on D Day.\n\nAt our very detailed and comprehensive "briefing" on the morning before the invasion - we were told that the outcome of the war required the armies to get safely ashore at all costs - and (as far as the 2nd Tactical Air Force was concerned) there were enough pilots and aircraft - in close reserve for all squadrons to suffer 90% casualties on the first day - and they\'d be fully up to strength and operational pilots and planes on Day 2.',
        missionBrief: {
            slides: [
                {
                    image: `${BASE_ASSET_URL}dday-note.png`,
                    text: "At our very detailed and comprehensive 'briefing' on the evening before the invasion - we were told that the outcome of the War required the armies to get safely ashore at all costs."
                },
                {
                    image: `${BASE_ASSET_URL}dday-full.jpg`,
                    text: "Full logbook spread recorded immediately after Operation Overlord."
                }
            ]
        }
    },
    {
        id: 'c-062-4',
        date: '1944-06-07',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Beach HEAD PATROL',
        time: '2:00',
        remarks: 'Continued invasion support.',
        origin: LOCATIONS.APPLEDRAM,
        target: LOCATIONS.NORMANDY_BEACH,
        destination: LOCATIONS.APPLEDRAM,
        isSignificant: false,
        sourceDocument: '062.jpg'
    },
    {
        id: 'c-062-5',
        date: '1944-06-19',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Dive Bombing',
        time: '1:40',
        remarks: 'Attack on V.1 Rocket launching site.',
        origin: LOCATIONS.APPLEDRAM,
        target: LOCATIONS.V1_SITE,
        targetIsApproximate: true,
        destination: LOCATIONS.APPLEDRAM,
        isSignificant: true,
        historicalNote: "A \"noball\" mission was a bombing mission on a German V-1 site, their flying bombs that Robin refers to as \"Doodlebug\" launch sites. This mission took place in the Pas-de-Calais. The V-1 flying bombs were terrorizing London, and Spitfire pilots were tasked with destroying the launch ramps before the rockets could be fired. A dangerous mission requiring precision dive-bombing into heavily defended areas.",
        sourceDocument: '062.jpg',
        pilotNotes: 'Attack on V.1 Rocket launching site - with 500 lb bomb. (Spitfire Mk IX was capable of carrying a 1000 lb bomb)\n\n* Also known as "Doodle bug"'
    },
    // Move to Tangmere / Ops continue
    {
        id: 'c-063-1',
        date: '1944-06-22',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Beach Head Patrol',
        time: '2:15',
        remarks: 'Patrol duties.',
        origin: LOCATIONS.TANGMERE,
        target: LOCATIONS.NORMANDY_BEACH,
        destination: LOCATIONS.TANGMERE,
        isSignificant: false,
        sourceDocument: '063.jpg'
    },
    {
        id: 'c-063-2',
        date: '1944-06-24',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Beach Head Patrol',
        time: '2:05',
        remarks: 'Got shot up - tailplane sustaining Ack Ack damage.',
        origin: LOCATIONS.TANGMERE,
        target: LOCATIONS.NORMANDY_BEACH,
        destination: LOCATIONS.TANGMERE,
        isSignificant: true,
        historicalNote: "A close call with anti-aircraft fire - Robin's Spitfire's tailplane was hit by flak (which he calls \"Ack Ack\"). One of the many dangers pilots faced patrolling over the heavily defended Normandy beachhead, where Allied and German guns alike filled the sky with fire.",
        sourceDocument: '063.jpg',
        pilotNotes: 'The first of 2 nights just behind the Front Line - under shellfire.\n\nGot shot up - my plane\'s tailplane sustaining Ack Ack damage.',
        missionBrief: {
            slides: [
                {
                    image: `${BASE_ASSET_URL}ack-ack-notes.png`,
                    text: "Damage to the engine cowling means Robin was very close to being shot down."
                },
                {
                    image: `${BASE_ASSET_URL}064.jpg`,
                    text: "Robin's note pinpoints the ack ack burst and damage."
                }
            ]
        }
    },
    {
        id: 'c-063-3',
        date: '1944-06-24',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Base - B.10. A.L.G. in France',
        time: '0:45',
        remarks: 'Deploying to Advanced Landing Ground in France.',
        origin: LOCATIONS.TANGMERE,
        destination: LOCATIONS.B10_PLUMETOT,
        isSignificant: true,
        historicalNote: "Moved to B.10 Plumetot, an Advanced Landing Ground hastily constructed in the Normandy fields just behind the front line. These temporary airstrips brought fighters closer to the action but put pilots under German artillery fire even on the ground.",
        sourceDocument: '063.jpg',
        pilotNotes: 'The first of 2 nights just behind the Front Line - under shellfire.',
        missionBrief: {
            slides: [
                {
                    image: `${BASE_ASSET_URL}plumetot-1.jpg`,
                    text: "Soldiers of the Pioneer Corps laying prefabricated bitumised strips (PBS) for a new runway at B-10 Plumetot, Normandy, as a Hawker Typhoon of No. 198 Squadron RAF takes off on the airstrip. (Royal Air Force, 2nd Tactical Air Force, 1943-1945 © IWM (CL 468)) (Not from Robin's logbook)"
                },
                {
                    image: `${BASE_ASSET_URL}plumetot-2.jpg`,
                    text: "Hawker Typhoon Mark IB, JP963 'TP-T', of No. 198 Squadron RAF, parked by the perimeter track at B-10 Plumetot, Normandy, as a bomb-disposal squad explodes German mines in the background. (Royal Air Force, 2nd Tactical Air Force, 1943-1945 © IWM (CL 473)) (Not from Robin's logbook)"
                }
            ]
        }
    },
    {
        id: 'c-063-4',
        date: '1944-06-28',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Front Line Patrol',
        time: '1:05',
        remarks: 'Operating from French soil.',
        origin: LOCATIONS.B10_PLUMETOT,
        target: LOCATIONS.CAEN, // Front line area
        targetIsApproximate: true,
        destination: LOCATIONS.B10_PLUMETOT,
        isSignificant: false,
        sourceDocument: '063.jpg'
    },
    {
        id: 'c-063-5',
        date: '1944-06-29',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'B.10. ALG in France - Base',
        time: '0:35',
        remarks: 'Return to UK Base.',
        origin: LOCATIONS.B10_PLUMETOT,
        destination: LOCATIONS.LYMPNE,
        isSignificant: true,
        historicalNote: "Returning from the forward operating base after two intense nights behind the front lines under German artillery fire. Back in England, the squadron posed for PR photographs around the CO's aircraft - a moment of relief captured on film.",
        sourceDocument: '063.jpg',
        pilotNotes: 'Back to B.10/ALG - it was after we landed back from France that we had some P.R. photographs taken of our plane around the C.O.\'s plane. (See Photos in "Memorabilia Album")',
        missionBrief: {
            slides: [
                {
                    image: `${BASE_ASSET_URL}squadron-by-spitfire-media-gallery.jpg`,
                    text: "Robin's squadron posing for PR photographs around a Spitfire."
                }
            ]
        }
        
    },
    // July 1944 - Base: LYMPNE
    {
        id: 'c-064-1',
        date: '1944-07-02',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Bomber Escort',
        time: '1:20',
        remarks: 'Caen raids support.',
        origin: LOCATIONS.LYMPNE,
        target: LOCATIONS.CAEN,
        destination: LOCATIONS.LYMPNE,
        isSignificant: true,
        historicalNote: "This mission took place in the days prior to Operation Charnwood and formed part of the sustained Allied air effort over Caen. While not directly part of Charnwood itself, such bomber escort missions were crucial in softening German defenses and limiting their response ahead of the main offensive. Operation Charnwood, launched a few days later (July 8-9, 1944), was the Allied push to capture Caen, a D-Day objective, and was preceded by massive bombing raids supported by ongoing fighter operations in the region.",
        sourceDocument: '064.jpg',
        pilotNotes: 'The V.1 A.A.F. (German show) - 700-800 per hour daylight-raids on Caen. The pattern bombing was devastating. So was the ack ack.'
    },
    {
        id: 'c-064-2',
        date: '1944-07-08',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Ramrod',
        time: '1:25',
        remarks: 'Low level sweep N. France.',
        origin: LOCATIONS.LYMPNE,
        target: LOCATIONS.V1_SITE, // General N France area
        targetIsApproximate: true,
        destination: LOCATIONS.LYMPNE,
        isSignificant: true,
        historicalNote: "Ramrod was another name for a bombing escort mission. Usually bombing escorts were high altitude, but this time Robin reports going low and hitting an anti-air site. Attacking anti-air was one of the most dangerous missions for a pilot.",
        sourceDocument: '064.jpg',
        pilotNotes: 'Just one flight (low level sweep in N. France). We flew well into occupied France at about 15,000ft and flew low level sweep in open formation. At one point we swept across an airfield and I wiped out the crew of an A.A. post scrambling to train their guns on the landing planes.'
    },
    // August 1944: SKEABRAE (Orkneys) & SUMBURGH (Shetlands) - defense patrols
    // First period at Skeabrae
    {
        id: 'c-065-1',
        date: '1944-08-03',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire V',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'G.C.I',
        time: '0:25',
        remarks: 'Ground Controlled Interception practice.',
        origin: LOCATIONS.SKEABRAE,
        destination: LOCATIONS.SKEABRAE,
        isSignificant: false,
        sourceDocument: '065.jpg',
        historicalNote: "After the intense combat of Normandy, 313 Squadron was redeployed to the Orkney Islands to defend Scapa Flow - the Royal Navy's main base. A quieter posting, but still on alert for German reconnaissance aircraft. It's not clear how Robin got from Lympne to Skeabrae, but he and his squadron did.",
        pilotNotes: 'Looking down on the Fleet in Scapa Flow.'
    },
    {
        id: 'c-065-2',
        date: '1944-08-03',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire V',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Dusk Flying',
        time: '0:20',
        remarks: 'Evening flying practice.',
        origin: LOCATIONS.SKEABRAE,
        destination: LOCATIONS.SKEABRAE,
        isSignificant: false,
        sourceDocument: '065.jpg'
    },
    {
        id: 'c-065-3',
        date: '1944-08-03',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire V',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Air Test',
        time: '0:45',
        remarks: 'Aircraft serviceability check.',
        origin: LOCATIONS.SKEABRAE,
        destination: LOCATIONS.SKEABRAE,
        isSignificant: false,
        sourceDocument: '065.jpg'
    },
    {
        id: 'c-065-4',
        date: '1944-08-04',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire V',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Dusk Patrol',
        time: '0:15',
        remarks: 'Evening patrol over Scapa Flow.',
        origin: LOCATIONS.SKEABRAE,
        destination: LOCATIONS.SKEABRAE,
        isSignificant: false,
        sourceDocument: '065.jpg'
    },
    {
        id: 'c-065-5',
        date: '1944-08-04',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire V',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Formation',
        time: '0:25',
        remarks: 'Formation flying practice.',
        origin: LOCATIONS.SKEABRAE,
        destination: LOCATIONS.SKEABRAE,
        isSignificant: false,
        sourceDocument: '065.jpg'
    },
    {
        id: 'c-065-6',
        date: '1944-08-08',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire V',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Air Firing',
        time: '0:35',
        remarks: 'Gunnery practice.',
        origin: LOCATIONS.SKEABRAE,
        destination: LOCATIONS.SKEABRAE,
        isSignificant: false,
        sourceDocument: '065.jpg'
    },
    {
        id: 'c-065-7',
        date: '1944-08-09',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire V',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Skeabrae - Sumburgh',
        time: '0:35',
        remarks: 'Transfer to Shetland Islands.',
        origin: LOCATIONS.SKEABRAE,
        destination: LOCATIONS.SUMBURGH,
        isSignificant: false,
        sourceDocument: '065.jpg'
    },
    // Flights at Sumburgh Shetlands
    {
        id: 'c-065-8',
        date: '1944-08-14',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire V',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Affiliation with Sunderland',
        time: '1:05',
        remarks: 'Training/Patrol with flying boats.',
        origin: LOCATIONS.SUMBURGH,
        destination: LOCATIONS.SUMBURGH,
        isSignificant: false,
        sourceDocument: '065.jpg'
    },
    {
        id: 'c-065-9',
        date: '1944-08-22',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire V',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Formation',
        time: '0:35',
        remarks: 'Formation flying at Sumburgh.',
        origin: LOCATIONS.SUMBURGH,
        destination: LOCATIONS.SUMBURGH,
        isSignificant: false,
        sourceDocument: '065.jpg'
    },
    {
        id: 'c-065-10',
        date: '1944-08-24',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire V',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Sumburgh - Skeabrae',
        time: '0:30',
        remarks: 'Return to Orkney Islands.',
        origin: LOCATIONS.SUMBURGH,
        destination: LOCATIONS.SKEABRAE,
        isSignificant: false,
        sourceDocument: '065.jpg'
    },
    // Back at RAF Skeabrae (Orkneys)
    {
        id: 'c-065-11',
        date: '1944-08-26',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire V',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Dusk Patrol',
        time: '1:10',
        remarks: 'Evening patrol over Scapa Flow.',
        origin: LOCATIONS.SKEABRAE,
        destination: LOCATIONS.SKEABRAE,
        isSignificant: false,
        sourceDocument: '065.jpg'
    },
    {
        id: 'c-065-12',
        date: '1944-08-28',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire V',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Dive Bombing',
        time: '1:00',
        remarks: 'Dive bombing practice.',
        origin: LOCATIONS.SKEABRAE,
        destination: LOCATIONS.SKEABRAE,
        isSignificant: false,
        sourceDocument: '065.jpg'
    },
    {
        id: 'c-065-13',
        date: '1944-08-28',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire V',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Dusk Patrol',
        time: '1:10',
        remarks: 'Evening patrol.',
        origin: LOCATIONS.SKEABRAE,
        destination: LOCATIONS.SKEABRAE,
        isSignificant: false,
        sourceDocument: '065.jpg'
    },
    {
        id: 'c-065-14',
        date: '1944-08-30',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire V',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Dusk Patrol',
        time: '1:10',
        remarks: 'Evening patrol.',
        origin: LOCATIONS.SKEABRAE,
        destination: LOCATIONS.SKEABRAE,
        isSignificant: false,
        sourceDocument: '065.jpg'
    },
    {
        id: 'c-065-15',
        date: '1944-08-31',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire V',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Dusk Patrol',
        time: '0:20',
        remarks: 'Final patrol of August.',
        origin: LOCATIONS.SKEABRAE,
        destination: LOCATIONS.SKEABRAE,
        isSignificant: false,
        sourceDocument: '065.jpg',
        historicalNote: "After the intense combat of Normandy, 313 Squadron was redeployed to the Orkney Islands to defend Scapa Flow - the Royal Navy's main base. A quieter posting, but still on alert for German reconnaissance aircraft.",
        pilotNotes: 'Looking down on the Fleet in Scapa Flow.'
    },
     // October 1944 - Moves to NORTH WEALD
    {
        id: 'c-067-1',
        date: '1944-10-13',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Bomber Escort (Duisburg)',
        time: '2:55',
        remarks: 'Long range escort.',
        origin: LOCATIONS.NORTH_WEALD,
        target: LOCATIONS.DUISBURG,
        destination: LOCATIONS.NORTH_WEALD,
        isSignificant: true,
        historicalNote: "313 Squadron's new mission: long-range bomber escort deep into Germany. Moving from the Orkneys to North Weald put them within range to escort heavy bombers to industrial targets in the Ruhr Valley. Duisburg was a major inland port and industrial center.",
        sourceDocument: '067.jpg',
        pilotNotes: 'At this time the Squadron had moved from the Orkneys to R.A.F. Station North Weald - north east of London.\n\nWhen the squadron left the Orkneys for N. Weald one Spitfire was u/s - and I was left behind to follow on in the Auster. The C.O. at Skeabrae and our Squadron were at Lossiemouth - and I recall the particular sight as our Squadron took off & circled for the last time. 10 tons of twisted metal tissues - the R.A.F\'s best "dump" came fluttering down. Two or three days later I flew the long way from the south of Britain to rejoin the Squadron. I can\'t think we had not recorded operations here - since it was not operational. Some pilots did not record operational flights - so that they could stay longer in the Squadron!'
    },
    {
        id: 'c-067-2',
        date: '1944-10-28',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Bomber Escort (Flushing)',
        time: '2:05',
        remarks: 'Escort mission.',
        origin: LOCATIONS.NORTH_WEALD,
        target: LOCATIONS.FLUSHING,
        destination: LOCATIONS.NORTH_WEALD,
        isSignificant: false,
        sourceDocument: '067.jpg'
    },
    // November 1944 - Heavy Bomber Escorts
    {
        id: 'c-068-1',
        date: '1944-11-08',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'BOMBER ESCORT (Homberg)',
        time: '2:50',
        remarks: 'Deep penetration escort.',
        origin: LOCATIONS.NORTH_WEALD,
        target: LOCATIONS.HOMBERG,
        destination: LOCATIONS.NORTH_WEALD,
        isSignificant: false,
        sourceDocument: '068.jpg',
        pilotNotes: 'North Weald - a peacetime airfield (Regular RAF Station) was just a low, decent underground (Tube) journey from The flat at 27, Upper Addiso Gdns - off Holland Pk Road. It was here I got my Commission. The Airn Ack Ack. Recruiting officer was a strikingly attractive blonde - I remember, too well. North Weald was definitely my favourite RAF Station.'
    },
    {
        id: 'c-068-2',
        date: '1944-11-20',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'BOMBER ESCORT (Munster)',
        time: '3:15',
        remarks: 'Long duration mission.',
        origin: LOCATIONS.NORTH_WEALD,
        target: LOCATIONS.MUNSTER,
        destination: LOCATIONS.NORTH_WEALD,
        isSignificant: false,
        sourceDocument: '068.jpg'
    },
    {
        id: 'c-068-3',
        date: '1944-11-21',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'BOMBER ESCORT (Hamburg)',
        time: '2:35',
        remarks: 'Escort to major port city.',
        origin: LOCATIONS.NORTH_WEALD,
        target: LOCATIONS.HAMBURG,
        destination: LOCATIONS.MANSTON,
        isSignificant: true,
        historicalNote: "A deep penetration escort mission to Hamburg - Germany's second-largest city and a major target throughout the war. These long-range missions pushed Spitfire range to its limits.",
        sourceDocument: '068.jpg'
    },
    {
        id: 'c-068-4',
        date: '1944-11-27',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'To Manston / Escort',
        time: '2:35',
        remarks: '1000 Bomber Raid.',
        origin: LOCATIONS.NORTH_WEALD, // Inferred start
        destination: LOCATIONS.MANSTON,
        isSignificant: true,
        historicalNote: "A thousand-bomber raid - the culmination of Bomber Command's strategic campaign. From his escort position, Robin witnessed the awesome and terrible sight of concentrated aerial bombardment: 'Even the clouds were red – and fires were raging underneath.'",
        sourceDocument: '068.jpg',
        pilotNotes: 'Gloomy but a clear day was a 1000 Bomber Raid. What devastation.\n\nThese Bomber Escort trips took place in all weather. This day was cloudless - the covering flights had a fantastic view of pattern bombing by ± 1000 bombers. But sometimes we never saw the target – God knew where it was by the ack ack aimed at the bombers. I read a comment in a fellow pilot\'s log book: "Even the clouds were red – and fires were raging underneath..."'
    },
    {
        id: 'c-068-5',
        date: '1944-11-30',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'BOMBER ESCORT (Bottrop)',
        time: '3:10', // Combined time from log roughly
        remarks: 'Target: Oil Plants.',
        origin: LOCATIONS.BRADWELL_BAY,
        target: LOCATIONS.BOTTROP,
        destination: LOCATIONS.BRADWELL_BAY,
        isSignificant: false,
        sourceDocument: '068.jpg'
    },
    // December 1944 - The Lucky Two
    {
        id: 'c-069-1',
        date: '1944-12-08',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Radio Relay (Brussels)',
        time: '2:30',
        remarks: 'One of only two to make it back to England.',
        origin: LOCATIONS.NORTH_WEALD,
        target: LOCATIONS.BRUSSELS,
        destination: LOCATIONS.BRADWELL_BAY,
        isSignificant: true,
        historicalNote: "A harrowing mission during rapidly deteriorating weather. Robin was tasked with relaying radio messages from the Wing Commander at 15,000 feet over Brussels. Of the 37 Spitfires in the wing, only two made it back across the sea to England - a testament to both skill and luck.",
        sourceDocument: '069.jpg',
        pilotNotes: "My mission was to fly over Brussels at 15,000' to relay radio messages from Wing Commander. I passed on a message to abort the operational mission on account of rapid deteriorating weather. The weather was too bad for bombers and fighters, mission was for Germany. Of the 37 Spitfires in our wing, I was one of only two who made it across the sea back to England. I made it to Bradwell Bay. Flight Commander actually got back to North Weald."
    },
    // March 1945 - Base: BRADWELL BAY
    {
        id: 'c-071-1',
        date: '1945-03-01',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Bomber Escort (Kamen)',
        time: '2:20',
        remarks: 'Escort mission.',
        origin: LOCATIONS.BRADWELL_BAY,
        target: LOCATIONS.KAMEN,
        destination: LOCATIONS.BRADWELL_BAY,
        isSignificant: false,
        sourceDocument: '071.jpg'
    },
    {
        id: 'c-071-2',
        date: '1945-03-02',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Bomber Escort (Cologne)',
        time: '2:50',
        remarks: 'Escort to Cologne.',
        origin: LOCATIONS.BRADWELL_BAY,
        target: LOCATIONS.COLOGNE,
        destination: LOCATIONS.BRADWELL_BAY,
        isSignificant: false,
        sourceDocument: '071.jpg'
    },
    {
        id: 'c-071-3',
        date: '1945-03-17',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Bomber Escort (Gelsenkirchen)',
        time: '2:00',
        remarks: 'Escort mission.',
        origin: LOCATIONS.BRADWELL_BAY,
        target: LOCATIONS.GELSENKIRCHEN,
        destination: LOCATIONS.BRADWELL_BAY,
        isSignificant: false,
        sourceDocument: '071.jpg'
    },
    {
        id: 'c-071-4',
        date: '1945-03-30',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Fighter Sweep (Osnabruck)',
        time: '2:35',
        remarks: 'Offensive sweep.',
        origin: LOCATIONS.MANSTON,
        target: LOCATIONS.OSNABRUCK,
        destination: LOCATIONS.MANSTON,
        isSignificant: false,
        sourceDocument: '071.jpg'
    },
    // April 1945
    {
        id: 'c-072-1',
        date: '1945-04-19',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Fighter Cover (Heligoland)',
        time: '2:25',
        remarks: 'Covering bombing raid.',
        origin: LOCATIONS.PETIT_BROGEL, // Staging from B.90
        target: LOCATIONS.HELIGOLAND,
        destination: LOCATIONS.PETIT_BROGEL,
        isSignificant: true,
        historicalNote: "Providing fighter cover for the attack on Heligoland - a heavily fortified German island fortress in the North Sea. With the war in Europe clearly ending, Robin's thoughts were turning to what came next.",
        sourceDocument: '072.jpg',
        pilotNotes: 'With the war in Europe obviously about to end I volunteered for the Far East. Incredibly my application was turned down as I had not given any reason. I then wrote that while there were many tens of thousands of British and Allied prisoners of war still in Japanese hands I would consider it a disgrace to stay in England.'
    },
    {
        id: 'c-072-2',
        date: '1945-04-25',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Bomber Escort (Heligoland)',
        time: '2:55',
        remarks: 'Massive raid on island fortress.',
        origin: LOCATIONS.PETIT_BROGEL,
        target: LOCATIONS.HELIGOLAND,
        destination: LOCATIONS.PETIT_BROGEL,
        isSignificant: true,
        historicalNote: "The massive RAF bombardment of Heligoland on April 18-19, 1945 - nearly 1,000 aircraft dropping over 4,000 tons of bombs on the tiny 1km² island fortress. One of the last major bombing operations of the war in Europe.",
        sourceDocument: '072.jpg',
        pilotNotes: 'What a spectacle! Heligoland is a tiny island Fortress in North Sea - and to see it receive everything Bomber Command could dump on it.'
    },
    // June 1945 - Victory & Escort
    {
        id: 'c-074-1',
        date: '1945-06-07',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Escort King & Queen',
        time: '3:05',
        remarks: 'Jersey to Warmwell to Poole.',
        origin: LOCATIONS.JERSEY,
        target: LOCATIONS.WARMWELL,
        destination: LOCATIONS.POOLE,
        isSignificant: true,
        historicalNote: "A fitting end to Robin's combat career with 313 Squadron - escorting King George VI and Queen Elizabeth on their victory tour of the liberated Channel Islands. Shortly after, Robin would answer a new call: ferrying Spitfires to the Far East where the war against Japan continued.",
        sourceDocument: '074.jpg',
        pilotNotes: 'A great honour for the Squadron to escort Their Majesties - but we all just about ran out of gas!\n\nAnd then a W.A.A.F. from no less Biggin Hill to ask if I\'d be interested in ferrying Spitfires to the Far East. Ferrying Spitfires! I didn\'t have to be asked twice.\n\nA couple of weeks leave - a few days in Morecambe (Transit Camp) - and then I was on my way.'
    },

    // Phase 3: Post-War Ferry (SEAC)
    {
        id: 'f-080-1',
        date: '1945-10-28',
        phase: Phase.FERRY,
        aircraftType: 'Spitfire XIV',
        aircraftCategory: AircraftCategory.TRANSPORT,
        duty: 'Ferry: Karachi - Jodhpur',
        time: '1:40',
        remarks: 'Start of cross-India ferry.',
        origin: LOCATIONS.KARACHI,
        destination: LOCATIONS.JODHPUR,
        isSignificant: true,
        historicalNote: "Beginning a long series of ferry flights across the Indian subcontinent. After the war, experienced pilots were needed to deliver Spitfires to squadrons throughout South-East Asia Command (SEAC).",
        sourceDocument: '080.jpg'
    },
    {
        id: 'f-080-2',
        date: '1945-10-31',
        phase: Phase.FERRY,
        aircraftType: 'Spitfire XIV',
        aircraftCategory: AircraftCategory.TRANSPORT,
        duty: 'Ferry: Allahabad - Calcutta',
        time: '2:00',
        remarks: 'Visited with Frank.',
        origin: LOCATIONS.ALLAHABAD,
        destination: LOCATIONS.CALCUTTA,
        isSignificant: false,
        sourceDocument: '080.jpg',
        pilotNotes: 'Visited with Frank again.\n\nThe special free mess for Army Command air crew in Calcutta (Park St) - just off Chowringhee - was only 2 blocks from Frank\'s apartment.'
    },
    {
        id: 'f-080-3',
        date: '1945-11-01',
        phase: Phase.FERRY,
        aircraftType: 'Spitfire XIV',
        aircraftCategory: AircraftCategory.TRANSPORT,
        duty: 'Ferry: Calcutta - Akyab',
        time: '1:30',
        remarks: 'Moving east into Burma.',
        origin: LOCATIONS.CALCUTTA,
        destination: LOCATIONS.AKYAB,
        isSignificant: false,
        sourceDocument: '080.jpg'
    },
    {
        id: 'f-080-4',
        date: '1945-11-04',
        phase: Phase.FERRY,
        aircraftType: 'Spitfire XIV',
        aircraftCategory: AircraftCategory.TRANSPORT,
        duty: 'Ferry: Rangoon - Bangkok',
        time: '1:30',
        remarks: 'Delivery to Thailand.',
        origin: LOCATIONS.RANGOON,
        destination: LOCATIONS.BANGKOK,
        isSignificant: true,
        historicalNote: "The furthest east Robin would fly - delivering a Spitfire XIV to Bangkok, Thailand. Just three months after Japan's surrender, the RAF was still repositioning aircraft throughout the former battlefields of South-East Asia.",
        sourceDocument: '080.jpg'
    },
    {
        id: 'f-080-5',
        date: '1945-11-13',
        phase: Phase.FERRY,
        aircraftType: 'Spitfire XIV',
        aircraftCategory: AircraftCategory.TRANSPORT,
        duty: 'Ferry: Karachi - Jodhpur',
        time: '1:40',
        remarks: 'Another delivery run.',
        origin: LOCATIONS.KARACHI,
        destination: LOCATIONS.JODHPUR,
        isSignificant: false,
        sourceDocument: '080.jpg'
    },
    {
        id: 'f-080-6',
        date: '1945-11-16',
        phase: Phase.FERRY,
        aircraftType: 'Spitfire XIV',
        aircraftCategory: AircraftCategory.TRANSPORT,
        duty: 'Ferry: Lahore - Kohat',
        time: '1:00',
        remarks: 'Near Khyber Pass.',
        origin: LOCATIONS.LAHORE,
        destination: LOCATIONS.KOHAT,
        isSignificant: true,
        historicalNote: "Delivering a Spitfire to Kohat, just 50 miles from the legendary Khyber Pass on the North West Frontier - the gateway between Afghanistan and the Indian subcontinent, rich with military history.",
        sourceDocument: '080.jpg',
        pilotNotes: 'Kohat - about 50 miles from the Khyber Pass.'
    },
    {
        id: 'f-082-1',
        date: '1946-01-03',
        phase: Phase.FERRY,
        aircraftType: 'Spitfire XIV',
        aircraftCategory: AircraftCategory.TRANSPORT,
        duty: 'Ferry: Karachi - Nagpur',
        time: '3:30', // Combined
        remarks: 'Karachi -> Jodhpur -> Nagpur.',
        origin: LOCATIONS.KARACHI,
        destination: LOCATIONS.NAGPUR,
        isSignificant: false,
        sourceDocument: '082.jpg',
        pilotNotes: 'Bris. Willcock was stationed at Nagpur'
    },
    {
        id: 'f-082-2',
        date: '1946-01-04',
        phase: Phase.FERRY,
        aircraftType: 'Spitfire XIV',
        aircraftCategory: AircraftCategory.TRANSPORT,
        duty: 'Ferry: Nagpur - Yellahanka',
        time: '2:30', // Combined
        remarks: 'Nagpur -> Hakimpet -> Yellahanka.',
        origin: LOCATIONS.NAGPUR,
        destination: LOCATIONS.YELLAHANKA,
        isSignificant: false,
        sourceDocument: '082.jpg'
    },
    {
        id: 'f-082-3',
        date: '1946-01-23',
        phase: Phase.FERRY,
        aircraftType: 'Spitfire XIV',
        aircraftCategory: AircraftCategory.TRANSPORT,
        duty: 'Ferry: Karachi - Baroda',
        time: '1:40',
        remarks: 'Ferry flight.',
        origin: LOCATIONS.KARACHI,
        destination: LOCATIONS.BARODA,
        isSignificant: false,
        sourceDocument: '082.jpg'
    },
    {
        id: 'f-083-1',
        date: '1946-02-06',
        phase: Phase.FERRY,
        aircraftType: 'Spitfire XIV',
        aircraftCategory: AircraftCategory.TRANSPORT,
        duty: 'Ferry: Karachi - Ranchi',
        time: '5:10', // Combined
        remarks: 'Long haul: Karachi -> Jodhpur -> Allahabad -> Ranchi.',
        origin: LOCATIONS.KARACHI,
        destination: LOCATIONS.RANCHI,
        isSignificant: true,
        historicalNote: "Robin's final significant flight of the war - a delivery to Ranchi that gave him the chance to visit family one last time before demobilization. After over six years in the RAF, he would soon travel home by sea on the M.V. Durham Castle, closing a remarkable chapter of service.",
        sourceDocument: '083.jpg',
        pilotNotes: 'Had to deliver a Spitfire to Ranchi - of all places - so stayed on with F.P.O. at Ranchi for 10 Days. What a life.\n\nAfter F/Lt Pederson (a ferry pilot) married in Allahabad, Dennis Yeardly flew me to Ranchi this time - and it was my pleasure to show him Mesra - and stay on with Frank for another week! Said goodbye to Frank. This was my last visit - as my "demob" ticket was coming up. Travelled to Bombay by train and back home by sea - on the M.V. "Durham Castle" - after over 6 years in RAF.'
    },
    {
        id: 'f-083-2',
        date: '1946-03-03',
        phase: Phase.FERRY,
        aircraftType: 'Spitfire XIV',
        aircraftCategory: AircraftCategory.TRANSPORT,
        duty: 'Ferry: Karachi - Maharajpur',
        time: '3:00', // Combined
        remarks: 'Final ferry flights.',
        origin: LOCATIONS.KARACHI,
        destination: LOCATIONS.JODHPUR, // Intermediate
        isSignificant: false,
        sourceDocument: '083.jpg'
    }
];
