
import { LogEntry, Phase, AircraftCategory } from '../types';

// Coordinates for key locations
const LOCATIONS = {
  KIRTON: { lat: 53.476, lng: -0.584, name: "Kirton-in-Lindsay (OTU)" },
  ASTON_DOWN: { lat: 51.706, lng: -2.128, name: "Aston Down" },
  TANGMERE: { lat: 50.849, lng: -0.710, name: "RAF Tangmere" },
  NORMANDY_BEACH: { lat: 49.369, lng: -0.871, name: "Normandy Beach Head" },
  B10_PLUMETOT: { lat: 49.283, lng: -0.366, name: "B.10 Plumetot (France)" },
  HAMBURG: { lat: 53.551, lng: 9.993, name: "Hamburg" },
  STUTTGART: { lat: 48.775, lng: 9.182, name: "Stuttgart" },
  MUNSTER: { lat: 51.960, lng: 7.626, name: "Munster" },
  FLUSHING: { lat: 51.453, lng: 3.570, name: "Flushing (Vlissingen)" },
  PARIS: { lat: 48.856, lng: 2.352, name: "Paris" },
  LITTLE_RISSINGTON: { lat: 51.867, lng: -1.733, name: "Little Rissington" },
  KARACHI: { lat: 24.860, lng: 67.001, name: "Karachi" },
  ALLAHABAD: { lat: 25.435, lng: 81.846, name: "Allahabad" },
  NAGPUR: { lat: 21.145, lng: 79.088, name: "Nagpur" },
  DELHI: { lat: 28.704, lng: 77.102, name: "Delhi" },
  CALCUTTA: { lat: 22.572, lng: 88.363, name: "Calcutta" },
  RANGOON: { lat: 16.840, lng: 96.173, name: "Rangoon" },
  LONDON: { lat: 51.507, lng: -0.127, name: "London" }, // Generic UK
  LYMPNE: { lat: 51.076, lng: 1.026, name: "RAF Lympne" },
  MANTON: { lat: 53.528, lng: -0.598, name: "Manton" }
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
  'Stirling': {
    name: "Short Stirling",
    role: "Heavy Bomber / Transport",
    maxSpeed: "255 mph",
    range: "2,330 miles",
    description: "The first four-engined British heavy bomber of WWII. Later relegated to transport and glider-towing duties due to limitations in altitude and bomb bay size."
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
        remarks: 'Local area orientation.',
        origin: LOCATIONS.KIRTON,
        destination: LOCATIONS.KIRTON,
        isSignificant: false
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
        origin: LOCATIONS.ASTON_DOWN,
        destination: LOCATIONS.ASTON_DOWN,
        isSignificant: false
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
        origin: LOCATIONS.ASTON_DOWN,
        destination: LOCATIONS.KIRTON,
        isSignificant: false
    },
    // Phase 2: Combat (313 Squadron)
    {
        id: '4',
        date: '1944-06-06',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Convoy Patrol',
        time: '1:50',
        remarks: 'Beach Head Patrol. Acted as invasion flight.',
        origin: LOCATIONS.TANGMERE,
        destination: LOCATIONS.NORMANDY_BEACH,
        isSignificant: true,
        historicalNote: "D-Day: Operation Overlord. 313 Squadron provided air cover for the invasion fleet. 'Invasion flight' implies direct support of the landings.",
        missionBrief: {
            images: [
                `${BASE_ASSET_URL}dday-note.png`,
                `${BASE_ASSET_URL}dday-full.jpg`
            ],
            text: "Robin's flight notes for the day of D-Day: At our very detailed and comprehensive 'briefing' on the evening before the invasion - we were told that the outcome of the War required the armies to get safely ashore at all costs. And - as far as the 2nd Tactical Air Force was concerned there were enough pilots and aircraft in reserve for all squadrons to suffer 90% casualties on the first day - and they'd be fully up to strength and operational in pilots and planes on Day 2."
        },
    },
    {
        id: '5',
        date: '1944-06-18',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Dive Bombing (Noball)',
        time: '1:10',
        remarks: 'Attack on V1 launch sites.',
        origin: LOCATIONS.TANGMERE,
        destination: LOCATIONS.TANGMERE,
        isSignificant: true,
        historicalNote: "'Noball' was the code name for missions attacking V-1 flying bomb launch sites in France. These 'Diver' attacks were a priority to stop the V-1 blitz on London."
    },
    {
        id: '6',
        date: '1944-06-26',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Transfer to Forward Base',
        time: '0:55',
        remarks: 'Moved to B.10 Plumetot (France).',
        origin: LOCATIONS.TANGMERE,
        destination: LOCATIONS.B10_PLUMETOT,
        isSignificant: true,
        historicalNote: "Relocation to an Advanced Landing Ground (ALG) in Normandy allowed the squadron to operate closer to the front lines, increasing loiter time over targets."
    },
    // NEW ENTRIES (July 1944)
    {
        id: 'new-1',
        date: '1944-07-04',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'BOMBER ESCORT',
        time: '1:50',
        remarks: '"One E/A got plenty of flak from us, and we turned him back"',
        origin: LOCATIONS.B10_PLUMETOT,
        destination: LOCATIONS.B10_PLUMETOT,
        isSignificant: true,
        historicalNote: "E/A stands for Enemy Aircraft. This entry confirms active engagement where defensive fire (flak) or aggressive maneuvering forced a German plane to retreat."
    },
    {
        id: 'new-2',
        date: '1944-07-06',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'BOMBER ESCORT',
        time: '1:55',
        remarks: '"I saw a flak burst above me (15,000 ft) and heard fragments hit my engine cowling, I looped out of the area..."',
        origin: LOCATIONS.B10_PLUMETOT,
        destination: LOCATIONS.B10_PLUMETOT,
        isSignificant: true,
        historicalNote: "A close call with Anti-Aircraft fire (Flak). Damage to the engine cowling at 15,000ft indicates intense German ground defenses protecting the bombers' target."
    },
    // NEW ENTRY (Oct 1944)
    {
        id: 'new-3',
        date: '1944-10-12',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'BOMBER ESCORT (Flushing)',
        time: '2:00',
        remarks: '"Bomber Escort: saw one F.W. 190 flash past below"',
        origin: LOCATIONS.LYMPNE,
        destination: LOCATIONS.FLUSHING,
        isSignificant: true,
        historicalNote: "Sighting of a Focke-Wulf 190 (F.W. 190), a highly capable German fighter. Flushing (Vlissingen) was a strategic port city heavily defended."
    },
    // NEW ENTRY (Nov 1944)
    {
        id: 'new-4',
        date: '1944-11-18',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'BOMBER ESCORT (Munster)',
        time: '3:55',
        remarks: '"Escort to Manton... Wx poor"',
        origin: LOCATIONS.LYMPNE,
        destination: LOCATIONS.MUNSTER,
        isSignificant: true,
        historicalNote: "A long-endurance mission (nearly 4 hours). 'Wx poor' indicates bad weather, adding significant risk to navigation and formation flying."
    },
    {
        id: '7',
        date: '1944-11-27',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Deep Bomber Escort (Rhinpus)',
        time: '2:35',
        remarks: 'Escort to Hamburg.',
        origin: LOCATIONS.LYMPNE,
        destination: LOCATIONS.HAMBURG,
        isSignificant: true
    },
    {
        id: '8',
        date: '1944-11-30',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire IX',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Deep Bomber Escort (Bottrop)',
        time: '2:30',
        remarks: 'Target: Synthetic Oil Plants.',
        origin: LOCATIONS.LYMPNE,
        destination: LOCATIONS.STUTTGART,
        isSignificant: true
    },
    {
        id: '9',
        date: '1945-05-17',
        phase: Phase.COMBAT,
        aircraftType: 'Spitfire XIV',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Paris to Little Rissington',
        time: '1:30',
        remarks: 'Post-VE Day transit.',
        origin: LOCATIONS.PARIS,
        destination: LOCATIONS.LITTLE_RISSINGTON,
        isSignificant: false
    },
    // Phase 3: Ferry
    {
        id: '10',
        date: '1945-07-15',
        phase: Phase.FERRY,
        aircraftType: 'Dakota',
        aircraftCategory: AircraftCategory.TRANSPORT,
        duty: 'Ferry Logistics',
        time: '5:00',
        remarks: 'Transit to India base.',
        origin: LOCATIONS.KARACHI,
        destination: LOCATIONS.DELHI,
        isSignificant: false
    },
    // NEW ENTRY (July 1945)
    {
        id: 'new-5',
        date: '1945-07-22',
        phase: Phase.FERRY,
        aircraftType: 'Spitfire XIV',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Local flight (India/Burma)',
        time: '5:30',
        remarks: 'Flew RAAF Spitfire. Total 10:30 flying today.',
        origin: LOCATIONS.KARACHI,
        destination: LOCATIONS.KARACHI,
        isSignificant: true,
        historicalNote: "Flying a Royal Australian Air Force (RAAF) aircraft highlights the inter-allied cooperation in the South East Asia Command (SEAC) theatre."
    },
    {
        id: '11',
        date: '1945-10-02',
        phase: Phase.FERRY,
        aircraftType: 'Dakota',
        aircraftCategory: AircraftCategory.TRANSPORT,
        duty: 'Transport Leg 1',
        time: '4:30',
        remarks: 'Routine cargo haul.',
        origin: LOCATIONS.KARACHI,
        destination: LOCATIONS.ALLAHABAD,
        isSignificant: false
    },
    {
        id: '12',
        date: '1945-10-05',
        phase: Phase.FERRY,
        aircraftType: 'Dakota',
        aircraftCategory: AircraftCategory.TRANSPORT,
        duty: 'Transport Leg 2',
        time: '3:15',
        remarks: 'Continuing ferry route.',
        origin: LOCATIONS.ALLAHABAD,
        destination: LOCATIONS.NAGPUR,
        isSignificant: false
    },
    // NEW ENTRY (Dec 1945)
    {
        id: 'new-6',
        date: '1945-12-07',
        phase: Phase.FERRY,
        aircraftType: 'Dakota',
        aircraftCategory: AircraftCategory.TRANSPORT,
        duty: 'Rangoon - Calcutta',
        time: '8:30',
        remarks: 'Night flight.',
        origin: LOCATIONS.RANGOON,
        destination: LOCATIONS.CALCUTTA,
        isSignificant: true,
        historicalNote: "An 8.5-hour night flight in a Dakota over the terrain of Burma and India demonstrates high navigational skill and endurance."
    },
    {
        id: '13',
        date: '1946-01-12',
        phase: Phase.FERRY,
        aircraftType: 'Dakota',
        aircraftCategory: AircraftCategory.TRANSPORT,
        duty: 'Nagpur-Hyd-Madras-Calcutta',
        time: '3:20',
        remarks: 'Multi-stop ferry.',
        origin: LOCATIONS.NAGPUR,
        destination: LOCATIONS.CALCUTTA,
        isSignificant: false
    },
    // NEW ENTRY (Feb 1946)
    {
        id: 'new-7',
        date: '1946-02-05',
        phase: Phase.FERRY,
        aircraftType: 'Harvard III',
        aircraftCategory: AircraftCategory.TRAINING,
        duty: 'Cross Country (Karachi - Nagpur)',
        time: '2:10',
        remarks: 'Ferrying trainer aircraft.',
        origin: LOCATIONS.KARACHI,
        destination: LOCATIONS.NAGPUR,
        isSignificant: false,
        historicalNote: "The Harvard was a standard advanced trainer. Ferrying them across India suggests re-equipping or redistributing assets post-war."
    },
    {
        id: '14',
        date: '1946-03-01',
        phase: Phase.FERRY,
        aircraftType: 'Spitfire XIV',
        aircraftCategory: AircraftCategory.FIGHTER,
        duty: 'Aerodrome Test',
        time: '0:30',
        remarks: 'Final logs.',
        origin: LOCATIONS.KARACHI,
        destination: LOCATIONS.KARACHI,
        isSignificant: false
    }
];
