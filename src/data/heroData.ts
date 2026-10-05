export interface HeadlineLetter {
  id: string;
  char: string;
  wordIndex: 0 | 1;
  charIndexInWord: number;
  globalIndex: number;
}

export interface HeroStatItem {
  id: string;
  value: string;
  label: string;
  detail: string;
  activationProgress: number;
  coordCode: string;
}

export const WELCOME_CHARS = ['W', 'E', 'L', 'C', 'O', 'M', 'E'] as const;
export const ITZFIZZ_CHARS = ['I', 'T', 'Z', 'F', 'I', 'Z', 'Z'] as const;

export const HEADLINE_LETTERS: HeadlineLetter[] = [
  ...WELCOME_CHARS.map((char, idx) => ({
    id: `welcome-${idx}-${char}`,
    char,
    wordIndex: 0 as const,
    charIndexInWord: idx,
    globalIndex: idx,
  })),
  ...ITZFIZZ_CHARS.map((char, idx) => ({
    id: `itzfizz-${idx}-${char}`,
    char,
    wordIndex: 1 as const,
    charIndexInWord: idx,
    globalIndex: WELCOME_CHARS.length + idx,
  })),
];

export const HERO_STATS: HeroStatItem[] = [
  {
    id: 'stat-engagement',
    value: '+58%',
    label: 'INCREASE IN ENGAGEMENT',
    detail: 'Scroll-synchronized spatial storytelling',
    activationProgress: 0.22,
    coordCode: 'M-01 / 022',
  },
  {
    id: 'stat-interaction',
    value: '+32%',
    label: 'FASTER INTERACTION',
    detail: 'Compositor-driven 60fps WebGL & GSAP scrub',
    activationProgress: 0.46,
    coordCode: 'M-02 / 046',
  },
  {
    id: 'stat-conversion',
    value: '+41%',
    label: 'IMPROVED CONVERSION',
    detail: 'Deliberate typographic & visual hierarchy',
    activationProgress: 0.68,
    coordCode: 'M-03 / 068',
  },
  {
    id: 'stat-retention',
    value: '+27%',
    label: 'HIGHER USER RETENTION',
    detail: 'Tactile motion response across viewports',
    activationProgress: 0.88,
    coordCode: 'M-04 / 088',
  },
];

export interface StudioPrinciple {
  index: string;
  title: string;
  summary: string;
  specification: string;
}

export const STUDIO_PRINCIPLES: StudioPrinciple[] = [
  {
    index: '01. Spatial Choreography',
    title: 'Direct Scroll-to-Motion Coupling',
    summary:
      'Every frame is bound directly to user scroll displacement through a single master timeline—zero autonomous loops, zero detached timers.',
    specification: 'GSAP ScrollTrigger · Scrub 1:1',
  },
  {
    index: '02. Tactile Paper Geometry',
    title: 'Procedural Folded Sheet Construction',
    summary:
      'Constructed as a single folded sheet of warm cotton paper with central spine ridge, double-folded nose layers, and subtle organic edge camber.',
    specification: 'Three.js BufferGeometry · Matte Ivory',
  },
  {
    index: '03. Performance Architecture',
    title: 'Zero-Reflow Render Pipeline',
    summary:
      'DOM updates are restricted to GPU-composited transforms and opacity while WebGL updates mutate refs directly outside the React render cycle.',
    specification: '60 FPS Target · Reduced-Motion Ready',
  },
];
