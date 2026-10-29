import type { BookstoreAvailability } from '../types/commerce';

/** Stable catalog keys. Titles can change; historical orders keep the key and a title snapshot. */
export const BOOKSTORE_KEYS = {
  foundersEdition: 'founders_edition',
  digitalEdition: 'digital_edition',
  paperback: 'paperback',
  hardcover: 'hardcover',
  paperbackBundle: 'courage_adventure_paperback_bundle',
  adventureBundle: 'courage_adventure_bundle',
  /** Previous pre-order bundle. Left untouched so older checkout settings are not rewritten. */
  legacyHardcoverBundle: 'hardcover_bundle',
} as const;

export const HARDCOVER_BUNDLE_UPGRADE_NOTE =
  'Upgrading from the paperback bundle to the hardcover bundle costs $16.';

export const BUNDLE_CLAIM_WINDOW_NOTE =
  'Included Academy access starts when a parent activates it and must be activated within 180 days of purchase. It does not start a paid membership.';

export const AMAZON_AUTHOR_PAGE_URL = 'https://www.amazon.com/author/tarusdstills';

export const AMAZON_AUTHOR_LINK_LABEL = 'Visit My Amazon Author Page';

export const AMAZON_AUTHOR_LINK_NOTE =
  'Opens the Amazon author page. Kindle purchases use the separate Buy on Amazon Kindle link.';

/** Direct Kindle product page. ASIN B0HNDXXRBV. This is not the author page. */
export const AMAZON_KINDLE_PRODUCT_URL = 'https://www.amazon.com/dp/B0HNDXXRBV';

export const AMAZON_KINDLE_ASIN = 'B0HNDXXRBV';

export const AMAZON_KINDLE_LINK_LABEL = 'Buy on Amazon Kindle';

export const FOUNDERS_EDITION_MESSAGE =
  "Thank you to everyone who believed in Caiden from the very beginning. Every Founder's Edition preorder has been upgraded to the new premium paperback edition, complete with a collectible bookmark and sticker as a special thank-you. You'll always be the first Guardians of the Focus Flame.";

export const DIGITAL_COVER_SRC = '/images/Caiden-vale-book/Caiden-vale-book.webp';

export const DIGITAL_SALES_CLOSED_NOTE =
  'Digital sales stay closed until KDP Select compatibility is confirmed and secure EPUB delivery has been tested.';

export type BookstoreProductDefinition = {
  key: string;
  title: string;
  priceCents: number | null;
  currency: string;
  eyebrow?: string;
  description: string;
  details: string[];
  formatLabel?: string;
  coverSrc?: string;
  featured: boolean;
  purchasable: boolean;
  fulfillment: 'legacy' | 'digital' | 'physical' | 'bundle';
  defaultAvailability: BookstoreAvailability;
  ctaInStock?: string;
  ctaPreorder?: string;
};

export const BOOKSTORE_PRODUCTS: BookstoreProductDefinition[] = [
  {
    key: BOOKSTORE_KEYS.digitalEdition,
    title: 'Caiden Vale and the Focus Flame',
    priceCents: 1599,
    currency: 'usd',
    description: 'Volume 1 · Full-color digital graphic novel',
    details: ['Volume 1 · Full-color digital graphic novel'],
    formatLabel: 'EPUB',
    coverSrc: DIGITAL_COVER_SRC,
    featured: false,
    purchasable: true,
    fulfillment: 'digital',
    defaultAvailability: 'in_stock',
    ctaInStock: 'Buy Digital Edition',
    ctaPreorder: 'Buy Digital Edition',
  },
  {
    key: BOOKSTORE_KEYS.paperback,
    title: 'Paperback Edition',
    priceCents: 3000,
    currency: 'usd',
    description: '132-page full-color paperback graphic novel.',
    details: [
      '132-page full-color paperback graphic novel',
      'Perfect for young readers and classrooms',
    ],
    featured: false,
    purchasable: true,
    fulfillment: 'physical',
    defaultAvailability: 'preorder',
    ctaInStock: 'Order Paperback',
    ctaPreorder: 'Pre-order Paperback',
  },
  {
    key: BOOKSTORE_KEYS.hardcover,
    title: 'Hardcover Edition',
    priceCents: 4999,
    currency: 'usd',
    description: '132-page premium hardcover graphic novel.',
    details: [
      '132-page premium hardcover graphic novel',
      'Includes one collectible bookmark and one sticker',
    ],
    featured: false,
    purchasable: true,
    fulfillment: 'physical',
    defaultAvailability: 'preorder',
    ctaInStock: 'Order Hardcover',
    ctaPreorder: 'Pre-order Hardcover',
  },
  {
    key: BOOKSTORE_KEYS.paperbackBundle,
    title: 'Paperback Adventure Bundle',
    priceCents: 5999,
    currency: 'usd',
    description: 'The paperback Courage adventure with the companion extras.',
    details: [
      '132-page full-color paperback graphic novel',
      'Courage Companion Activity Workbook',
      '30 days of Focus Flame Academy access, starting when a parent activates it',
      'Collectible bookmark',
      'One sticker',
    ],
    featured: false,
    purchasable: true,
    fulfillment: 'bundle',
    defaultAvailability: 'preorder',
    ctaInStock: 'Get the Paperback Bundle',
    ctaPreorder: 'Get the Paperback Bundle',
  },
  {
    key: BOOKSTORE_KEYS.adventureBundle,
    title: 'Signature Reserve Hardcover Bundle',
    priceCents: 7599,
    currency: 'usd',
    eyebrow: 'Premium upgrade',
    description: 'The signed hardcover Courage adventure with the companion extras.',
    details: [
      'Signed first-edition hardcover graphic novel',
      'Courage Companion Activity Workbook',
      '90 days of Focus Flame Academy access, starting when a parent activates it',
      'Collectible bookmark',
      'One sticker',
    ],
    featured: true,
    purchasable: true,
    fulfillment: 'bundle',
    defaultAvailability: 'preorder',
    ctaInStock: 'Get the Hardcover Bundle',
    ctaPreorder: 'Get the Hardcover Bundle',
  },
  {
    key: BOOKSTORE_KEYS.foundersEdition,
    title: "Founder's Edition",
    priceCents: null,
    currency: 'usd',
    eyebrow: 'Sold Out',
    description: FOUNDERS_EDITION_MESSAGE,
    details: [],
    featured: false,
    purchasable: false,
    fulfillment: 'legacy',
    defaultAvailability: 'sold_out',
  },
];

export const BOOKSTORE_SERVER_KEYS = [
  BOOKSTORE_KEYS.paperbackBundle,
  BOOKSTORE_KEYS.adventureBundle,
  BOOKSTORE_KEYS.hardcover,
  BOOKSTORE_KEYS.paperback,
  BOOKSTORE_KEYS.digitalEdition,
];
