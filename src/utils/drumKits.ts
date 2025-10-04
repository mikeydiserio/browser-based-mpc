// Preset drum machine kits available in public/drum-machines/
export type DrumKitPreset = {
  id: string;
  name: string;
  path: string;
  samples: string[];
  image: string;
};

export const DRUM_KIT_PRESETS: DrumKitPreset[] = [
  {
    id: "akai-linndrum",
    name: "Akai Linndrum",
    path: `${import.meta.env.BASE_URL}drum-machines/Akai Linndrum`,
    image: `${import.meta.env.BASE_URL}drum-machines/Akai Linndrum/machine.jpg`,
    samples: [
      "Bassdrum.wav",
      "SD.wav",
      "Clap.wav",
      "Closed Hat.wav",
      "Open Hat.wav",
      "Tom L.wav",
      "Tom M.wav",
      "Tom H.wav",
      "Crash.wav",
      "Ride.wav",
      "Cowbell.wav",
      "Tambourin.wav",
      "Shuffle.wav",
    ],
  },
  {
    id: "akai-mpc60",
    name: "Akai MPC-60",
    path: `${import.meta.env.BASE_URL}drum-machines/Akai MPC-60`,
    image: `${import.meta.env.BASE_URL}drum-machines/Akai MPC-60/machine.jpg`,
    samples: [
      "Bassdrum.wav",
      "Bassdrum Gated.wav",
      "Snare 1.wav",
      "Snare 2.wav",
      "Snare 3.wav",
      "Clap.wav",
      "Closed Hat.wav",
      "Open Hat.wav",
      "Tom L.wav",
      "Tom M.wav",
      "Tom H.wav",
      "Crash.wav",
      "Ride.wav",
      "Rim Gated.wav",
      "Conga L.wav",
      "Conga H.wav",
    ],
  },
  {
    id: "oberheim-dmx",
    name: "Oberheim DMX",
    path: `${import.meta.env.BASE_URL}drum-machines/Oberheim DMX`,
    image: `${import.meta.env.BASE_URL}drum-machines/Oberheim DMX/machine.jpg`,
    samples: [
      "Bassdrum-01.wav",
      "Bassdrum-02.wav",
      "Bassdrum-03.wav",
      "Snaredrum-01.wav",
      "Snaredrum-02.wav",
      "Snaredrum-03.wav",
      "Clap.wav",
      "Hat Closed.wav",
      "Hat Open.wav",
      "Tom L.wav",
      "Tom M.wav",
      "Tom H.wav",
      "Crash.wav",
      "Ride.wav",
      "Rim Shot.wav",
      "Cabasa.wav",
    ],
  },
  {
    id: "roland-tr606",
    name: "Roland TR-606",
    path: `${import.meta.env.BASE_URL}drum-machines/Roland TR-606`,
    image: `${import.meta.env.BASE_URL}drum-machines/Roland TR-606/machine.jpg`,
    samples: [
      "Bassdrum.wav",
      "Snaredrum.wav",
      "Hat Closed.wav",
      "Hat Open.wav",
      "Tom L.wav",
      "Tom H.wav",
      "Cymbal.wav",
    ],
  },
  {
    id: "roland-tr707",
    name: "Roland TR-707",
    path: `${import.meta.env.BASE_URL}drum-machines/Roland TR-707`,
    image: `${import.meta.env.BASE_URL}drum-machines/Roland TR-707/machine.jpg`,
    samples: [
      "Bassdrum-01.wav",
      "Bassdrum-02.wav",
      "Snaredrum-01.wav",
      "Snaredrum-02.wav",
      "Clap.wav",
      "Hat Closed.wav",
      "Hat Open.wav",
      "Tom L.wav",
      "Tom M.wav",
      "Tom H.wav",
      "Crash.wav",
      "Rimshot.wav",
      "Cowbell.wav",
      "Tambourine.wav",
    ],
  },
  {
    id: "roland-tr808",
    name: "Roland TR-808",
    path: `${import.meta.env.BASE_URL}drum-machines/Roland TR-808`,
    image: `${import.meta.env.BASE_URL}drum-machines/Roland TR-808/machine.jpg`,
    samples: [
      "Bassdrum-01.wav",
      "Bassdrum-02.wav",
      "Bassdrum-03.wav",
      "Bassdrum-04.wav",
      "Bassdrum-05.wav",
      "Snaredrum.wav",
      "Clap.wav",
      "Hat Closed.wav",
      "Hat Open.wav",
      "Tom L.wav",
      "Tom M.wav",
      "Tom H.wav",
      "Crash-01.wav",
      "Crash-02.wav",
      "Rimshot.wav",
      "Cowbell.wav",
    ],
  },
  {
    id: "roland-tr909",
    name: "Roland TR-909",
    path: `${import.meta.env.BASE_URL}drum-machines/Roland TR-909`,
    image: `${import.meta.env.BASE_URL}drum-machines/Roland TR-909/machine.jpg`,
    samples: [
      "Bassdrum-01.wav",
      "Bassdrum-02.wav",
      "Bassdrum-03.wav",
      "Bassdrum-04.wav",
      "naredrum.wav",
      "Clap.wav",
      "Hat Closed.wav",
      "Hat Open.wav",
      "Tom L.wav",
      "Tom M.wav",
      "Tom H.wav",
      "Crash.wav",
      "Ride.wav",
      "Rimhot.wav",
    ],
  },
  {
    id: "yamaha-rx5",
    name: "Yamaha RX-5",
    path: `${import.meta.env.BASE_URL}drum-machines/Yamaha RX-5`,
    image: `${import.meta.env.BASE_URL}drum-machines/Yamaha RX-5/machine.jpg`,
    samples: [
      "Bassdrum.wav",
      "Bassdrum-02.wav",
      "Snaredrum.wav",
      "Snaredrum-02.wav",
      "Snaredrum-03.wav",
      "Hat Closed.wav",
      "Hat Open.wav",
      "Tom.wav",
      "Rimshot.wav",
      "Cowbell.wav",
      "Shaker.wav",
      "Tambourine.wav",
      "SFX.wav",
    ],
  },
];

/**
 * Load samples from a drum kit preset and return their URLs
 */
export function getDrumKitSampleUrls(kitId: string): string[] {
  const kit = DRUM_KIT_PRESETS.find((k) => k.id === kitId);
  if (!kit) return [];

  return kit.samples.map((sample) => `${kit.path}/${sample}`);
}

/**
 * Get a drum kit preset by ID
 */
export function getDrumKitPreset(kitId: string): DrumKitPreset | undefined {
  return DRUM_KIT_PRESETS.find((k) => k.id === kitId);
}
