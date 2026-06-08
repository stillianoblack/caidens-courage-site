import { VALE_CLASSIC_HOME_URL } from './valeLinks';
import { BRAVE_MIND_CLUB_PATH } from './courageRoutes';

export type PersonaCta = {
  label: string;
  href: string;
  external?: boolean;
};

export type PersonaPricingTier = {
  title: string;
  price: string;
  description?: string;
  badges?: readonly string[];
  includes?: readonly string[];
  notes?: readonly string[];
  licenseNote?: string;
  launchOffer?: string;
  notIncluded?: readonly string[];
  featured?: boolean;
  cta?: PersonaCta;
};

export type PersonaFaqItem = {
  question: string;
  answer: string;
};

export type PersonaPageConfig = {
  slug: 'parents' | 'teachers' | 'camps' | 'schools';
  documentTitle: string;
  eyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  intro: string;
  primaryCta: PersonaCta;
  secondaryCta: PersonaCta;
  whoItsFor: readonly string[];
  benefits: readonly string[];
  whatsIncluded: readonly string[];
  pricing: readonly PersonaPricingTier[];
  pricingFooterNotes?: readonly string[];
  howItWorksTitle?: string;
  howItWorks?: readonly PersonaFaqItem[];
  faq?: readonly PersonaFaqItem[];
};

export const PARENTS_PAGE: PersonaPageConfig = {
  slug: 'parents',
  documentTitle: "Focus Flame Academy for Families | Caiden's Courage",
  eyebrow: 'Focus Flame Academy',
  heroTitle: 'Focus Flame Academy for Families',
  heroSubtitle: 'Help your child build confidence, focus, and emotional language at home.',
  intro:
    "Caiden's Courage gives families story-powered tools to help kids talk about feelings, practice focus, and see their differences as strengths.",
  primaryCta: { label: 'Start with the Family Portal', href: '/portal?audience=parents' },
  secondaryCta: { label: 'Explore Kids Activities', href: '/kids' },
  whoItsFor: ['Parents and caregivers', 'Homeschool families', 'Kids ages 7–12', 'Neurodivergent-friendly home learning'],
  benefits: [
    'Helps kids name feelings',
    'Builds confidence through story',
    'Encourages focus and reflection',
    'Offers screen-light printable activities',
    'Supports parent-child conversations',
  ],
  whatsIncluded: [
    'Family activities',
    'Coloring pages',
    'Printable tools',
    'B-4 focus exercises',
    'Kid-friendly story access',
    'Brave reflection prompts',
  ],
  pricing: [
    {
      title: 'Family Portal',
      price: '$79/year',
      includes: [
        'Family activities',
        'Coloring pages',
        'Printable tools',
        'B-4 focus exercises',
        'Character games',
        'Parent Corner',
      ],
      cta: { label: 'Request Family Access', href: '/contact?subject=Family%20Portal%20Access' },
    },
    {
      title: 'Digital Book + Family Portal',
      price: '$129/year',
      includes: [
        'Digital graphic novel access',
        'One year of Family Portal resources',
        'Character missions',
        'Parent training tools',
        'Premium downloads',
      ],
      notes: ['Physical books sold separately'],
      featured: true,
      cta: { label: 'Join Family Waitlist', href: '/contact?subject=Family%20Portal%20Waitlist' },
    },
  ],
  pricingFooterNotes: [
    'Classroom materials, facilitator guides, assessments, and school-wide usage are not included in the Family Portal.',
  ],
  howItWorksTitle: 'How it works at home',
  howItWorks: [
    {
      question: 'Read or explore together',
      answer: 'Start with short story moments from Caiden Vale that give kids language for focus, feelings, and courage.',
    },
    {
      question: 'Print and practice',
      answer: 'Use coloring pages, B-4 reset tools, and reflection prompts for screen-light practice at the kitchen table.',
    },
    {
      question: 'Talk it through',
      answer: 'Family conversation guides help parents ask brave questions without turning every moment into a lecture.',
    },
  ],
};

export const TEACHERS_PAGE: PersonaPageConfig = {
  slug: 'teachers',
  documentTitle: "Focus Flame Academy for Teachers | Caiden's Courage",
  eyebrow: 'Focus Flame Academy',
  heroTitle: 'Focus Flame Academy for Teachers',
  heroSubtitle: 'Story-powered SEL lessons for one classroom.',
  intro:
    "Bring Caiden's Courage into your classroom with ready-to-use discussion guides, reflection prompts, printable activities, and story-based SEL lessons.",
  primaryCta: { label: 'Explore Teacher Portal', href: '/portal?audience=educators' },
  secondaryCta: { label: 'View Focus Flame Academy', href: '/schools' },
  whoItsFor: [
    'Classroom teachers',
    'Counselors and advisors',
    'Reading specialists',
    'One classroom, up to 35 students',
  ],
  benefits: [
    'Easy to use in one classroom',
    'Supports emotional awareness and focus',
    'Encourages discussion and reflection',
    'Gives students creative ways to respond',
    'Works for SEL blocks, advisory, counseling groups, and reading time',
  ],
  whatsIncluded: [
    'Digital story access',
    'Discussion guides',
    'Lesson plans',
    'Limited worksheets',
    'Printable activities',
    'One classroom license',
  ],
  pricing: [
    {
      title: 'Teacher Portal',
      price: '$99/year',
      description:
        'Classroom-ready SEL prompts, worksheets, discussion guides, and Focus Flame activities.',
      badges: ['For Educators'],
      includes: [
        'Lesson plans',
        'Discussion guides',
        'Printable activities',
        'Focus Flame reflection tools',
        'One classroom license',
      ],
      licenseNote: 'Valid for one teacher and one classroom, up to 35 students.',
      cta: { label: 'Request Teacher Access', href: '/contact?subject=Teacher%20Portal%20Access' },
    },
    {
      title: 'Digital Novel + Teacher Portal',
      price: '$129/year',
      description:
        'Includes digital access to the graphic novel plus one year of classroom-ready SEL resources for educators.',
      badges: ['Digital Access', 'For Educators'],
      includes: [
        'Full digital graphic novel access',
        'Everything in Teacher Portal',
        'Guided SEL modules',
        'Printable classroom activities',
        'One classroom license',
      ],
      notes: ['Physical books are sold separately.'],
      featured: true,
      cta: { label: 'Join Teacher Waitlist', href: '/contact?subject=Teacher%20Portal%20Waitlist' },
    },
  ],
  howItWorksTitle: 'How it works in your classroom',
  howItWorks: [
    {
      question: 'Choose a story moment',
      answer: 'Open a chapter or SEL module tied to focus, feelings, or courage — built for ages 7–12.',
    },
    {
      question: 'Facilitate with guides',
      answer: 'Discussion prompts and lesson plans help you lead reflection without extra prep time.',
    },
    {
      question: 'Extend with printables',
      answer: 'Worksheets and B-4 reset tools give students a creative way to respond and practice focus.',
    },
  ],
};

export const CAMPS_PAGE: PersonaPageConfig = {
  slug: 'camps',
  documentTitle: "Focus Flame Academy for Camps | Caiden's Courage",
  eyebrow: 'Focus Flame Academy',
  heroTitle: 'Focus Flame Academy for Camps',
  heroSubtitle: 'An easy-to-run SEL adventure for camps, after-school programs, and youth groups.',
  intro:
    'Focus Flame Academy helps camp leaders turn storytelling into confidence-building activities kids can read, discuss, color, act out, and reflect on together.',
  primaryCta: { label: 'Start a Camp Pilot', href: '/contact?subject=Camp%20Pilot%20License' },
  secondaryCta: { label: 'Download Sample Guide', href: `${BRAVE_MIND_CLUB_PATH}?type=teacher-pack` },
  whoItsFor: [
    'Summer camps',
    'After-school programs',
    'Youth organizations',
    'Enrichment and community programs',
    'Group leaders and counselors',
  ],
  benefits: [
    'Built for groups',
    'Easy for counselors to run',
    'Combines story, discussion, and activities',
    'Supports teamwork, focus, courage, and emotional awareness',
    'Great for summer camps, after-school programs, youth organizations, and enrichment programs',
  ],
  whatsIncluded: [
    'Digital story access',
    '9 weekly SEL modules',
    'Facilitator guide',
    'Coloring pages',
    'Printable activities',
    'Team pledge pages',
    'Reflection journals',
    'Interactive Focus Flame Lab access',
    'Up to 100 participants',
  ],
  pricing: [
    {
      title: 'Camp Pilot',
      price: '$750',
      description: 'For small camps, after-school programs, and youth groups.',
      badges: ['Pilot'],
      includes: [
        'Digital story access',
        '9 weekly SEL modules',
        'Facilitator guide',
        'Printable activities & coloring pages',
        'Focus Flame Lab access',
        'Up to 50 participants',
      ],
      licenseNote: 'Valid for one camp or youth program.',
      cta: {
        label: 'Start Camp Pilot',
        href: 'https://buy.stripe.com/dRmfZg0rJ1dC4078Ry3Ru05',
        external: true,
      },
    },
    {
      title: 'Camp Plus',
      price: '$1,000',
      description: 'For larger camps and youth programs that want to serve more students.',
      badges: ['Best Value', 'Launch Offer'],
      includes: [
        'Everything in Camp Pilot',
        'Up to 100 participants',
        'Expanded group activity use',
        'Priority pilot support',
        'Parent book purchase link',
      ],
      launchOffer: 'Launch offer: get Camp Plus for the Camp Pilot price for a limited time.',
      notes: [
        'Physical books are not included. Camps receive digital access. Families can purchase physical books separately.',
      ],
      featured: true,
      cta: {
        label: 'Claim Launch Offer',
        href: 'https://buy.stripe.com/6oUcN45M33lK1RZ3xe3Ru06',
        external: true,
      },
    },
  ],
  howItWorksTitle: 'How it works at camp',
  howItWorks: [
    {
      question: 'Run weekly SEL modules',
      answer: 'Nine story-powered sessions combine reading, discussion, and hands-on activities counselors can lead with minimal prep.',
    },
    {
      question: 'Mix digital and print',
      answer: 'Coloring pages, pledge sheets, and reflection journals keep groups engaged without relying on screens all day.',
    },
    {
      question: 'Practice in Focus Flame Lab',
      answer: 'Interactive story moments help kids name feelings, make brave choices, and build focus together.',
    },
  ],
};

export const SCHOOLS_PAGE: PersonaPageConfig = {
  slug: 'schools',
  documentTitle: "Focus Flame Academy for Schools & Districts | Caiden's Courage",
  eyebrow: 'Focus Flame Academy',
  heroTitle: 'Focus Flame Academy for Schools & Districts',
  heroSubtitle: 'A story-powered SEL pilot for classrooms, counselors, and school communities.',
  intro:
    'Focus Flame Academy gives schools a flexible SEL experience built around story, reflection, discussion, creativity, and student engagement.',
  primaryCta: { label: 'Request a School Pilot', href: '/schools#pilot' },
  secondaryCta: { label: 'View Sample Materials', href: `${BRAVE_MIND_CLUB_PATH}?type=teacher-pack` },
  whoItsFor: [
    'Elementary and middle schools',
    'School counselors',
    'District SEL leaders',
    'After-school and community partners',
    'Multi-classroom rollouts',
  ],
  benefits: [
    'Supports school-wide SEL goals',
    'Gives educators ready-to-use materials',
    'Helps students build emotional language',
    'Encourages focus, confidence, communication, and teamwork',
    'Works across classrooms, counseling groups, and after-school programs',
  ],
  whatsIncluded: [
    'Everything in the Teacher Portal',
    'Multi-classroom usage',
    'Implementation guide',
    'School-wide rights',
    'Pre/post reflection templates',
    'Reporting templates',
    'Educator training video',
    'Priority support',
  ],
  pricing: [
    {
      title: 'School License',
      price: '$999–$2,500/year',
      includes: ['Multi-classroom usage', 'Implementation guide', 'School-wide rights', 'Educator training video', 'Priority support'],
      cta: { label: 'Request School Pilot', href: '/contact?subject=School%20Pilot' },
    },
    {
      title: 'District / Pilot Partner',
      price: '$1,999–$5,000+',
      includes: [
        'Multiple schools',
        'Custom rollout',
        'Outcomes tracking',
        'Pilot support',
        'Implementation consultation',
        'Quarterly review',
      ],
      featured: true,
      cta: { label: 'Schedule a Pilot Call', href: '/contact?subject=District%20Pilot%20Call' },
    },
  ],
  howItWorksTitle: 'How a school pilot works',
  howItWorks: [
    {
      question: 'Start with a pilot conversation',
      answer: 'Tell us about your school or district goals — we help match the right license and rollout plan.',
    },
    {
      question: 'Train and implement',
      answer: 'Educators receive training video, implementation guide, and ready-to-use classroom materials.',
    },
    {
      question: 'Reflect and report',
      answer: 'Pre/post reflection templates and reporting tools help you observe growth in focus, confidence, and emotional awareness.',
    },
  ],
};

export type RelatedPathCard = {
  title: string;
  eyebrow?: string;
  description: string;
  bullets: readonly string[];
  cta: string;
  to: string;
  imageSrc?: string;
  imageAlt?: string;
  featured?: boolean;
  external?: boolean;
};

export const ALL_PATH_CARDS: RelatedPathCard[] = [
  {
    title: 'Kids',
    description: 'Play, read, and practice focus in a kid-friendly hub.',
    bullets: ['Focus Flame Lab & activities', 'For kids ages 7–12', 'Build courage through play'],
    cta: 'Explore Kids',
    to: '/kids',
    imageSrc: '/images/caidenscourage/Choose_your_path/kid_card.webp',
    imageAlt: 'Kid exploring Caiden’s Courage activities',
  },
  {
    title: 'Parents',
    description: 'Story-powered tools for families at home.',
    bullets: ['Family activities & printables', 'For parents & caregivers', 'Support emotional confidence'],
    cta: 'Explore for Families',
    to: '/parents',
    imageSrc: '/images/caidenscourage/Choose_your_path/The Opportunity_kid_Courage.webp',
    imageAlt: 'Parent and child exploring Caiden’s Courage together',
  },
  {
    title: 'Teachers',
    description: 'Ready-to-use SEL for one classroom.',
    bullets: ['Discussion guides & lesson plans', 'For one classroom', 'Story-powered SEL blocks'],
    cta: 'Explore for Teachers',
    to: '/teachers',
    imageSrc: '/images/caidenscourage/schooldistrict/teacher.webp',
    imageAlt: 'Teacher using Caiden’s Courage classroom materials',
  },
  {
    title: 'Camps',
    description: 'An easy-to-run SEL adventure for youth programs.',
    bullets: ['9 weekly SEL modules', 'For camps & after-school', 'Up to 100 participants'],
    cta: 'Explore Camp Pilot',
    to: '/camps',
    imageSrc: '/images/caidenscourage/schooldistrict/camps.webp',
    imageAlt: 'Kids participating in a camp SEL activity',
    featured: true,
  },
  {
    title: 'Schools & Districts',
    description: 'School-wide SEL pilots and district partnerships.',
    bullets: ['Multi-classroom usage', 'For schools & districts', 'Implementation support'],
    cta: 'Explore for Schools',
    to: '/schools',
    imageSrc: '/images/caidenscourage/Choose_your_path/superintendent_card.webp',
    imageAlt: 'School leader reviewing Caiden’s Courage materials',
  },
  {
    title: 'Caiden Vale Story World',
    description: 'The graphic novel adventure behind Focus Flame Academy.',
    bullets: ['Graphic novel & characters', 'For story lovers', 'Discover the Focus Flame journey'],
    cta: 'Explore the Story',
    to: VALE_CLASSIC_HOME_URL,
    imageSrc: '/images/caidenscourage/Choose_your_path/caidenvale_card_1.webp',
    imageAlt: 'Caiden Vale story world',
    external: true,
  },
];

export function getRelatedPathCards(excludeSlug?: string): RelatedPathCard[] {
  const slugToPath: Record<string, string> = {
    parents: '/parents',
    teachers: '/teachers',
    camps: '/camps',
    schools: '/schools',
  };
  const excludePath = excludeSlug ? slugToPath[excludeSlug] : undefined;
  return ALL_PATH_CARDS.filter((card) => card.to !== excludePath);
}
