export interface ThemeDefinition {
  id: string;
  name: string;
  category: string;
}

export const THEMES: ThemeDefinition[] = [
  // ─── Specials ──────────────────────────────────────────────────
  { id: 'theme-glass', name: 'Glassmorphism (Default)', category: 'Specials' },
  { id: 'theme-solid', name: 'Solid Core', category: 'Specials' },
  { id: 'theme-neon', name: 'Neon Pulse', category: 'Specials' },

  // ─── Materials ──────────────────────────────────────────────────
  { id: 'theme-obsidian', name: 'Obsidian', category: 'Materials' },
  { id: 'theme-weathered-oak', name: 'Weathered Oak', category: 'Materials' },
  { id: 'theme-carrara-marble', name: 'Carrara Marble', category: 'Materials' },
  { id: 'theme-verdigris-copper', name: 'Verdigris Copper', category: 'Materials' },
  { id: 'theme-bioluminescent', name: 'Bioluminescent', category: 'Materials' },
  { id: 'theme-frosted-glacier', name: 'Frosted Glacier', category: 'Materials' },
  { id: 'theme-volcanic-basalt', name: 'Volcanic Basalt', category: 'Materials' },
  { id: 'theme-ancient-parchment', name: 'Ancient Parchment', category: 'Materials' },
  { id: 'theme-jade-imperium', name: 'Jade Imperium', category: 'Materials' },
  { id: 'theme-starry-night', name: 'Starry Night', category: 'Materials' },

  // ─── Magic ──────────────────────────────────────────────────
  { id: 'theme-arcane-leyline', name: 'Arcane Leyline', category: 'Magic' },
  { id: 'theme-spirit-wisp', name: 'Spirit Wisp', category: 'Magic' },
  { id: 'theme-phoenix-ember', name: 'Phoenix Ember', category: 'Magic' },
  { id: 'theme-void-dweller', name: 'Void Dweller', category: 'Magic' },
  { id: 'theme-celestial-gold', name: 'Celestial Gold', category: 'Magic' },
  { id: 'theme-moonstone', name: 'Moonstone', category: 'Magic' },
  { id: 'theme-cursed-ichor', name: 'Cursed Ichor', category: 'Magic' },
  { id: 'theme-chronos-sand', name: 'Chronos Sand', category: 'Magic' },
  { id: 'theme-dreamweaver', name: 'Dreamweaver', category: 'Magic' },
  { id: 'theme-shadowfell', name: 'Shadowfell', category: 'Magic' },

  // ─── Sci-Fi ──────────────────────────────────────────────────
  { id: 'theme-cyberpunk-2077', name: 'Cyberpunk 2077', category: 'Sci-Fi' },
  { id: 'theme-monochrome-hud', name: 'Monochrome HUD', category: 'Sci-Fi' },
  { id: 'theme-carbon-fiber', name: 'Carbon Fiber', category: 'Sci-Fi' },
  { id: 'theme-plasma-reactor', name: 'Plasma Reactor', category: 'Sci-Fi' },
  { id: 'theme-circuit-board', name: 'Circuit Board', category: 'Sci-Fi' },
  { id: 'theme-liquid-mercury', name: 'Liquid Mercury', category: 'Sci-Fi' },
  { id: 'theme-industrial-hazard', name: 'Industrial Hazard', category: 'Sci-Fi' },
  { id: 'theme-holographic-foil', name: 'Holographic Foil', category: 'Sci-Fi' },
  { id: 'theme-synthwave-sky', name: 'Synthwave Sky', category: 'Sci-Fi' },
  { id: 'theme-interstellar-warp', name: 'Interstellar Warp', category: 'Sci-Fi' },

  // ─── Artistic ──────────────────────────────────────────────────
  { id: 'theme-sumie-ink', name: 'Sumie Ink', category: 'Artistic' },
  { id: 'theme-vibrant-pop-art', name: 'Vibrant Pop Art', category: 'Artistic' },
  { id: 'theme-watercolor-wash', name: 'Watercolor Wash', category: 'Artistic' },
  { id: 'theme-pixel-dungeon', name: 'Pixel Dungeon', category: 'Artistic' },
  { id: 'theme-gold-leaf', name: 'Gold Leaf', category: 'Artistic' },
  { id: 'theme-blueprint', name: 'Blueprint', category: 'Artistic' },
  { id: 'theme-retro-comic', name: 'Retro Comic', category: 'Artistic' },
  { id: 'theme-lava-lamp', name: 'Lava Lamp', category: 'Artistic' },
  { id: 'theme-stained-glass', name: 'Stained Glass', category: 'Artistic' },
  { id: 'theme-chalkboard', name: 'Chalkboard', category: 'Artistic' },

  // ─── Playful ──────────────────────────────────────────────────
  { id: 'theme-candy-cane', name: 'Candy Cane', category: 'Playful' },
  { id: 'theme-galaxy-swirl', name: 'Galaxy Swirl', category: 'Playful' },
  { id: 'theme-gummy-bear', name: 'Gummy Bear', category: 'Playful' },
  { id: 'theme-royal-velvet', name: 'Royal Velvet', category: 'Playful' },
  { id: 'theme-steampunk-brass', name: 'Steampunk Brass', category: 'Playful' },
  { id: 'theme-honey-hive', name: 'Honey Hive', category: 'Playful' },
  { id: 'theme-triton-deep', name: 'Triton Deep', category: 'Playful' },
  { id: 'theme-autumn-leaves', name: 'Autumn Leaves', category: 'Playful' },
  { id: 'theme-frozen-tundra', name: 'Frozen Tundra', category: 'Playful' },
  { id: 'theme-dragon-scale', name: 'Dragon Scale', category: 'Playful' },
];
