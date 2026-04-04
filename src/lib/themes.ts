export interface ThemeDefinition {
  id: string;
  name: string;
  category: string;
  colors?: {
    primary: string;
    secondary: string;
    text: string;
  };
}

export const THEMES: ThemeDefinition[] = [
  // ─── Specials ──────────────────────────────────────────────────
  { id: 'theme-glass', name: 'Glassmorphism (Default)', category: 'Specials', colors: { primary: '#10b981', secondary: '#34d39966', text: '#ffffff' } },
  { id: 'theme-solid', name: 'Solid Core', category: 'Specials', colors: { primary: '#10b981', secondary: '#064e3b', text: '#ffffff' } },
  { id: 'theme-neon', name: 'Neon Pulse', category: 'Specials', colors: { primary: '#10b981', secondary: '#10b981', text: '#34d399' } },

  // ─── Materials ──────────────────────────────────────────────────
  { id: 'theme-obsidian', name: 'Obsidian', category: 'Materials', colors: { primary: '#0a0a0c', secondary: '#4c1d95', text: '#ffffff' } },
  { id: 'theme-weathered-oak', name: 'Weathered Oak', category: 'Materials', colors: { primary: '#451a03', secondary: '#78350f', text: '#ffffff' } },
  { id: 'theme-carrara-marble', name: 'Carrara Marble', category: 'Materials', colors: { primary: '#f8fafc', secondary: '#94a3b8', text: '#1e293b' } },
  { id: 'theme-verdigris-copper', name: 'Verdigris Copper', category: 'Materials', colors: { primary: '#134e4a', secondary: '#2dd4bf', text: '#ffffff' } },
  { id: 'theme-bioluminescent', name: 'Bioluminescent', category: 'Materials', colors: { primary: '#064e3b', secondary: '#22d3ee', text: '#ffffff' } },
  { id: 'theme-frosted-glacier', name: 'Frosted Glacier', category: 'Materials', colors: { primary: '#bae6fd', secondary: '#e0f2fe', text: '#0c4a6e' } },
  { id: 'theme-volcanic-basalt', name: 'Volcanic Basalt', category: 'Materials', colors: { primary: '#18181b', secondary: '#fb7185', text: '#ffffff' } },
  { id: 'theme-ancient-parchment', name: 'Ancient Parchment', category: 'Materials', colors: { primary: '#fef3c7', secondary: '#78350f', text: '#451a03' } },
  { id: 'theme-jade-imperium', name: 'Jade Imperium', category: 'Materials', colors: { primary: '#065f46', secondary: '#fbbf24', text: '#ffffff' } },
  { id: 'theme-starry-night', name: 'Starry Night', category: 'Materials', colors: { primary: '#0f172a', secondary: '#94a3b8', text: '#ffffff' } },

  // ─── Magic ──────────────────────────────────────────────────
  { id: 'theme-arcane-leyline', name: 'Arcane Leyline', category: 'Magic', colors: { primary: '#4c1d95', secondary: '#22d3ee', text: '#ffffff' } },
  { id: 'theme-spirit-wisp', name: 'Spirit Wisp', category: 'Magic', colors: { primary: '#ecfeff', secondary: '#a5f3fc', text: '#083344' } },
  { id: 'theme-phoenix-ember', name: 'Phoenix Ember', category: 'Magic', colors: { primary: '#991b1b', secondary: '#f59e0b', text: '#ffffff' } },
  { id: 'theme-void-dweller', name: 'Void Dweller', category: 'Magic', colors: { primary: '#000000', secondary: '#5b21b6', text: '#ffffff' } },
  { id: 'theme-celestial-gold', name: 'Celestial Gold', category: 'Magic', colors: { primary: '#f59e0b', secondary: '#ffffff', text: '#78350f' } },
  { id: 'theme-moonstone', name: 'Moonstone', category: 'Magic', colors: { primary: '#e2e8f0', secondary: '#818cf8', text: '#1e1b4b' } },
  { id: 'theme-cursed-ichor', name: 'Cursed Ichor', category: 'Magic', colors: { primary: '#14532d', secondary: '#4ade80', text: '#ffffff' } },
  { id: 'theme-chronos-sand', name: 'Chronos Sand', category: 'Magic', colors: { primary: '#d97706', secondary: '#fef3c7', text: '#451a03' } },
  { id: 'theme-dreamweaver', name: 'Dreamweaver', category: 'Magic', colors: { primary: '#fdf2f8', secondary: '#f472b6', text: '#1e293b' } },
  { id: 'theme-shadowfell', name: 'Shadowfell', category: 'Magic', colors: { primary: '#18181b', secondary: '#27272a', text: '#52525b' } },

  // ─── Sci-Fi ──────────────────────────────────────────────────
  { id: 'theme-cyberpunk-2077', name: 'Cyberpunk 2077', category: 'Sci-Fi', colors: { primary: '#fde047', secondary: '#db2777', text: '#000000' } },
  { id: 'theme-monochrome-hud', name: 'Monochrome HUD', category: 'Sci-Fi', colors: { primary: '#052e16', secondary: '#22c55e', text: '#22c55e' } },
  { id: 'theme-carbon-fiber', name: 'Carbon Fiber', category: 'Sci-Fi', colors: { primary: '#09090b', secondary: '#3f3f46', text: '#ffffff' } },
  { id: 'theme-plasma-reactor', name: 'Plasma Reactor', category: 'Sci-Fi', colors: { primary: '#083344', secondary: '#06b6d4', text: '#ffffff' } },
  { id: 'theme-circuit-board', name: 'Circuit Board', category: 'Sci-Fi', colors: { primary: '#1e293b', secondary: '#ea580c', text: '#ffffff' } },
  { id: 'theme-liquid-mercury', name: 'Liquid Mercury', category: 'Sci-Fi', colors: { primary: '#cbd5e1', secondary: '#f8fafc', text: '#1e293b' } },
  { id: 'theme-industrial-hazard', name: 'Industrial Hazard', category: 'Sci-Fi', colors: { primary: '#eab308', secondary: '#000000', text: '#000000' } },
  { id: 'theme-holographic-foil', name: 'Holographic Foil', category: 'Sci-Fi', colors: { primary: '#ffffff66', secondary: '#ffffff', text: '#1e293b' } },
  { id: 'theme-synthwave-sky', name: 'Synthwave Sky', category: 'Sci-Fi', colors: { primary: '#4c1d95', secondary: '#ec4899', text: '#ffffff' } },
  { id: 'theme-interstellar-warp', name: 'Interstellar Warp', category: 'Sci-Fi', colors: { primary: '#000000', secondary: '#ffffff', text: '#ffffff' } },

  // ─── Artistic ──────────────────────────────────────────────────
  { id: 'theme-sumie-ink', name: 'Sumie Ink', category: 'Artistic', colors: { primary: '#fafafa', secondary: '#000000', text: '#000000' } },
  { id: 'theme-vibrant-pop-art', name: 'Vibrant Pop Art', category: 'Artistic', colors: { primary: '#22d3ee', secondary: '#db2777', text: '#000000' } },
  { id: 'theme-watercolor-wash', name: 'Watercolor Wash', category: 'Artistic', colors: { primary: '#22d3ee4d', secondary: '#0ea5e9', text: '#0c4a6e' } },
  { id: 'theme-pixel-dungeon', name: 'Pixel Dungeon', category: 'Artistic', colors: { primary: '#3f3f46', secondary: '#18181b', text: '#ffffff' } },
  { id: 'theme-gold-leaf', name: 'Gold Leaf', category: 'Artistic', colors: { primary: '#fbbf24', secondary: '#d97706', text: '#451a03' } },
  { id: 'theme-blueprint', name: 'Blueprint', category: 'Artistic', colors: { primary: '#1e3a8a', secondary: '#ffffff', text: '#ffffff' } },
  { id: 'theme-retro-comic', name: 'Retro Comic', category: 'Artistic', colors: { primary: '#ef4444', secondary: '#000000', text: '#000000' } },
  { id: 'theme-lava-lamp', name: 'Lava Lamp', category: 'Artistic', colors: { primary: '#ef444466', secondary: '#ef4444', text: '#ffffff' } },
  { id: 'theme-stained-glass', name: 'Stained Glass', category: 'Artistic', colors: { primary: '#60a5fa80', secondary: '#1e293b', text: '#ffffff' } },
  { id: 'theme-chalkboard', name: 'Chalkboard', category: 'Artistic', colors: { primary: '#18181b', secondary: '#52525b', text: '#e4e4e7' } },

  // ─── Playful ──────────────────────────────────────────────────
  { id: 'theme-candy-cane', name: 'Candy Cane', category: 'Playful', colors: { primary: '#ef4444', secondary: '#ffffff', text: '#000000' } },
  { id: 'theme-galaxy-swirl', name: 'Galaxy Swirl', category: 'Playful', colors: { primary: '#1e1b4b', secondary: '#818cf8', text: '#ffffff' } },
  { id: 'theme-royal-velvet', name: 'Royal Velvet', category: 'Playful', colors: { primary: '#7f1d1d', secondary: '#fde047', text: '#ffffff' } },
  { id: 'theme-steampunk-brass', name: 'Steampunk Brass', category: 'Playful', colors: { primary: '#78350f', secondary: '#ca8a04', text: '#fde047' } },
  { id: 'theme-honey-hive', name: 'Honey Hive', category: 'Playful', colors: { primary: '#f59e0b', secondary: '#000000', text: '#000000' } },
  { id: 'theme-triton-deep', name: 'Triton Deep', category: 'Playful', colors: { primary: '#172554', secondary: '#3b82f6', text: '#ffffff' } },
  { id: 'theme-autumn-leaves', name: 'Autumn Leaves', category: 'Playful', colors: { primary: '#9a3412', secondary: '#ea580c', text: '#ffffff' } },
  { id: 'theme-frozen-tundra', name: 'Frozen Tundra', category: 'Playful', colors: { primary: '#f8fafc', secondary: '#38bdf8', text: '#0ea5e9' } },
  { id: 'theme-dragon-scale', name: 'Dragon Scale', category: 'Playful', colors: { primary: '#14532d', secondary: '#d97706', text: '#ffffff' } },
];
