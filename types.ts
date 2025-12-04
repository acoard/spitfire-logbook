export enum Phase {
  TRAINING = 'Training',
  COMBAT = 'Combat Operations',
  FERRY = 'Post-War Ferry',
}

export enum AircraftCategory {
  TRAINING = 'Training', // Yellow
  FIGHTER = 'Fighter',   // Red
  TRANSPORT = 'Transport' // Blue
}

export interface Coordinate {
  lat: number;
  lng: number;
  name: string;
}

export interface MissionBriefSlide {
  image: string;
  text?: string;
}

export interface MissionBrief {
  slides: MissionBriefSlide[];
}

export interface LogEntry {
  id: string;
  date: string;
  phase: Phase;
  aircraftType: string;
  aircraftCategory: AircraftCategory;
  duty: string;
  time: string; // e.g., "1:15"
  remarks: string;
  origin: Coordinate;
  destination?: Coordinate; // Optional, some flights are local/patrols
  target?: Coordinate; // Optional, for mission objectives distinct from destination
  targetIsApproximate?: boolean; // Flag if target location is estimated
  isSignificant: boolean; // For special highlighting
  historicalNote?: string; // Enhanced static historical context
  missionBrief?: MissionBrief;
  sourceDocument?: string; // Filename of the original logbook page (e.g. "062.jpg")
  pilotNotes?: string; // Full transcribed text from the pilot's notes
  customView?: string; // Identifier for custom rendering (e.g. 'gradebook')
}
