// ─── Game Data: Storyline, Quests, Dialogue, Map ─────────────────────────────
// "The Great WiFi Outage" — A hilarious campus RPG

export type ZoneName = 'Library' | 'Lab' | 'Cafeteria' | 'Gym' | 'Dorm';

// ─── IMAGE ASSETS ───────────────────────────────────────────────────────────
export const ASSETS = {
  campusMap: '/game/campus-map.png',
  player: '/game/player.png',
  npcs: {
    Library: '/game/npc-librarian.png',
    Lab: '/game/npc-professor.png',
    Cafeteria: '/game/npc-chef.png',
    Gym: '/game/npc-chad.png',
    Dorm: '/game/npc-roommate.png',
  } as Record<ZoneName, string>,
};

// ─── ZONE VISUAL CONFIG ─────────────────────────────────────────────────────
export const ZONE_CONFIG: Record<ZoneName, { emoji: string; color: string; gradient: string; icon: string }> = {
  Library:    { emoji: '📚', color: '#8B5E3C', gradient: 'from-amber-600 to-amber-800',   icon: '🏛️' },
  Lab:        { emoji: '🔬', color: '#546E7A', gradient: 'from-slate-500 to-slate-700',   icon: '💻' },
  Cafeteria:  { emoji: '🍚', color: '#E67E22', gradient: 'from-orange-500 to-red-600',    icon: '🍽️' },
  Gym:        { emoji: '🏋️', color: '#5D4037', gradient: 'from-red-600 to-red-800',       icon: '💪' },
  Dorm:       { emoji: '🏠', color: '#7B68EE', gradient: 'from-indigo-500 to-purple-700', icon: '🛏️' },
};

export const ZONES: ZoneName[] = ['Library', 'Lab', 'Cafeteria', 'Gym', 'Dorm'];

// ─── QUESTS (Legacy Export) ──────────────────────────────────────────────────
export const QUESTS: any[] = []; // Now driven by Ink scripts in src/stories/

// ─── ITEM DEFINITIONS ───────────────────────────────────────────────────────
export interface GameItem {
  name: string;
  emoji: string;
  description: string;
}

export const COLLECTIBLE_ITEMS: GameItem[] = [
  { name: 'Ancient Router', emoji: '📡', description: 'A router from 2003. Still has WEP encryption.' },
  { name: 'Crypto Evidence', emoji: '💎', description: 'Screenshot of Prof mining 0.0003 DOGE.' },
  { name: 'Monster Energy', emoji: '⚡', description: '400mg of caffeine. Your hands are shaking.' },
  { name: 'WiFi Password', emoji: '🔑', description: 'ChadLifts225. Peak security.' },
  { name: 'Campus Hero Badge', emoji: '🏆', description: 'You restored WiFi. You are legend.' },
];

// ─── NPC POSITIONS (tile coordinates) ────────────────────────────────────────
export interface NPCDef {
  id: string;
  name: string;
  zone: ZoneName;
  tileX: number;
  tileY: number;
  spriteFrame: number;   // frame index in RPG urban tilemap
  dialogueKey: ZoneName;
}

export const NPC_DEFS: NPCDef[] = [
  { id: 'librarian', name: 'Librarian Ada', zone: 'Library',    tileX: 10, tileY: 8,  spriteFrame: 408, dialogueKey: 'Library' },
  { id: 'professor', name: 'Prof. Nakamoto', zone: 'Lab',        tileX: 58, tileY: 8,  spriteFrame: 420, dialogueKey: 'Lab' },
  { id: 'chef',      name: 'Chef Mama B',    zone: 'Cafeteria',  tileX: 66, tileY: 37, spriteFrame: 432, dialogueKey: 'Cafeteria' },
  { id: 'chad',      name: 'Chad Thunderlift', zone: 'Gym',      tileX: 18, tileY: 48, spriteFrame: 444, dialogueKey: 'Gym' },
  { id: 'roommate',  name: 'Roommate Deji',  zone: 'Dorm',       tileX: 58, tileY: 48, spriteFrame: 456, dialogueKey: 'Dorm' },
];

// ─── BUILDING DEFINITIONS ───────────────────────────────────────────────────
export interface BuildingDef {
  name: ZoneName;
  col: number;
  row: number;
  w: number;
  h: number;
  color: number;
  roofColor: number;
  doorColor: number;
  label: string;
}

export const BUILDINGS: BuildingDef[] = [
  { name: 'Library',    col: 4,  row: 3,  w: 14, h: 10, color: 0x8B5E3C, roofColor: 0x6B3A2A, doorColor: 0x4A2C0A, label: '📚 Library' },
  { name: 'Lab',        col: 52, row: 3,  w: 14, h: 10, color: 0x546E7A, roofColor: 0x37474F, doorColor: 0x1B2838, label: '🔬 CS Lab' },
  { name: 'Cafeteria',  col: 58, row: 32, w: 16, h: 10, color: 0xE67E22, roofColor: 0xC0392B, doorColor: 0x7F2B0A, label: '🍚 Cafeteria' },
  { name: 'Gym',        col: 10, row: 42, w: 16, h: 10, color: 0x5D4037, roofColor: 0x3E2723, doorColor: 0x1A0E0A, label: '🏋️ Gym' },
  { name: 'Dorm',       col: 50, row: 42, w: 16, h: 10, color: 0x7B68EE, roofColor: 0x5B4BD0, doorColor: 0x3A2FAA, label: '🏠 Dorm' },
];

// ─── ENEMY SPAWNS ───────────────────────────────────────────────────────────
export interface EnemyDef {
  x: number; // tile coords
  y: number;
  type: 'procrastination' | 'deadline' | 'bug';
  color: number;
  hp: number;
  speed: number;
  name: string;
}

export const ENEMY_SPAWNS: EnemyDef[] = [
  { x: 22, y: 22, type: 'procrastination', color: 0xE53935, hp: 3, speed: 40, name: 'TikTok Demon' },
  { x: 55, y: 22, type: 'deadline',        color: 0x8E24AA, hp: 4, speed: 50, name: 'Assignment Ghost' },
  { x: 35, y: 15, type: 'bug',             color: 0xF57F17, hp: 2, speed: 60, name: 'Syntax Error' },
  { x: 15, y: 52, type: 'procrastination', color: 0x00838F, hp: 3, speed: 45, name: 'Netflix Phantom' },
  { x: 60, y: 55, type: 'deadline',        color: 0xD84315, hp: 5, speed: 35, name: 'Final Exam Wraith' },
  { x: 40, y: 48, type: 'bug',             color: 0x1B5E20, hp: 2, speed: 70, name: 'NullPointerException' },
  { x: 30, y: 5,  type: 'procrastination', color: 0xAD1457, hp: 3, speed: 45, name: 'Instagram Crawler' },
];

// ─── RANDOM CAMPUS SIGNS (funny) ────────────────────────────────────────────
export const CAMPUS_SIGNS = [
  '"Free WiFi" — This sign is decorative.',
  'NO RUNNING IN THE HALLWAY\n(Exception: when deadline < 1hr)',
  'LIBRARY RULES:\n1. Be quiet\n2. No food\n3. No crying about assignments\n(Rule 3 is rarely enforced)',
  'CS LAB NOTICE:\nThe computers are not for mining.\nYes, we know about you, Professor.',
  'GYM HOURS: 6AM-10PM\nWiFi password changes every\ntime Chad gets a new PR.',
  'CAFETERIA: Today\'s special\nJollof Rice (better than yours)',
  'DORM QUIET HOURS: 10PM-8AM\nAnime with headphones ONLY',
  'NOTICE: Whoever keeps\nresetting the WiFi router\nwith a fork — please stop.',
];

export interface DialogueLine {
  speaker: string;
  text: string;
}
