export const ECOSYSTEM_NAV_ITEMS = [
  { label: 'Home', href: '/', activePaths: ['/'] },
  { label: 'Kids', href: '/kids', activePaths: ['/kids'] },
  {
    label: "Caiden's Courage for Schools",
    href: '/schools',
    activePaths: ['/schools', '/focus-flame-academy', '/camp-courage'],
  },
  { label: 'Focus Flame Lab', href: '/focus-flame-lab', activePaths: ['/focus-flame-lab'] },
] as const;
