import React, { useEffect } from 'react';
import CourageFooter from '../components/courage/CourageFooter';
import CourageHeader from '../components/courage/CourageHeader';
import { VALE_COMICBOOK_URL } from '../config/valeLinks';

type HolidayGift = {
  name: string;
  price: string;
  image: string;
  imageAlt: string;
  details: string[];
  disclosure: string;
  action?: { label: string; href: string };
  status?: string;
};

const BOOK_HERO = '/images/backgrounds/caidenvale_book_hero.webp';
const BOOK_COVER = '/images/Caiden-vale-book/Caiden-vale-book.webp';

const GIFTS: HolidayGift[] = [
  {
    name: 'Hardcover',
    price: '$49.99',
    image: BOOK_HERO,
    imageAlt: 'Caiden Vale and the Focus Flame hardcover graphic novel',
    details: [
      '132-page premium hardcover graphic novel',
      'One collectible bookmark and one sticker',
    ],
    disclosure: 'Opens the current bookstore checkout. Shipping is added there.',
    action: { label: 'Order the hardcover', href: VALE_COMICBOOK_URL },
  },
  {
    name: 'Paperback',
    price: '$30',
    image: BOOK_COVER,
    imageAlt: 'Caiden Vale and the Focus Flame book cover',
    details: [
      '132-page full-color paperback graphic novel',
      'A gift that is easy to share and read together',
    ],
    disclosure: 'Opens the current bookstore checkout.',
    action: { label: 'Order the paperback', href: VALE_COMICBOOK_URL },
  },
  {
    name: 'Holiday Adventure Bundle',
    price: '$59.99',
    image: BOOK_COVER,
    imageAlt: 'Caiden Vale and the Focus Flame book cover',
    details: [
      '132-page full-color paperback graphic novel',
      'Courage Companion Activity Workbook',
      '30 days of Focus Flame Academy access, after a parent activates it',
      'Collectible bookmark and one sticker',
    ],
    disclosure: 'Checkout is not open. This page does not start Academy access.',
    status: 'Checkout is not open',
  },
  {
    name: 'Holiday Signature Bundle',
    price: '$75.99',
    image: BOOK_HERO,
    imageAlt: 'Caiden Vale and the Focus Flame hardcover graphic novel',
    details: [
      'Signed first-edition hardcover graphic novel',
      'Courage Companion Activity Workbook',
      '90 days of Focus Flame Academy access, after a parent activates it',
      'Collectible bookmark and one sticker',
    ],
    disclosure: 'Checkout is not open. This page does not start Academy access.',
    status: 'Checkout is not open',
  },
];

export default function HolidayPage() {
  useEffect(() => {
    document.title = "The Season of Courage | Caiden's Courage";
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f3ee] text-[#16284a]">
      <CourageHeader />
      <main>
        <section className="relative overflow-hidden bg-[#071830] text-white">
          <img
            src="/images/backgrounds/holiday_carousel_slide_1.webp"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071830]/95 via-[#071830]/78 to-[#071830]/35" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] lg:py-20">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#E5C06A]">The Season of Courage</p>
              <h1 className="mt-3 max-w-xl font-display text-4xl font-extrabold leading-tight sm:text-5xl">
                Give the Gift of Courage This Holiday Season
              </h1>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-[#E7F4F6]">
                Big imagination. Brave hearts. A little holiday magic. Give the kids in your life a story they can hold, and a world they can explore.
              </p>
            </div>
            <img
              src="/images/backgrounds/holidayseason_text.webp"
              alt="The Season of Courage"
              className="mx-auto w-full max-w-md"
            />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-extrabold">A small collection for a brave gift</h2>
            <p className="mt-3 text-lg leading-relaxed">
              Choose the book by itself, or look at a bundle that gathers the companion pieces already listed in the Caiden Vale catalog. Paperback and hardcover can be ordered today. The holiday bundles are shown here, and their checkout is not open.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {GIFTS.map((gift) => (
              <article key={gift.name} className="flex h-full flex-col overflow-hidden rounded-3xl border border-[#203864]/10 bg-white shadow-[0_16px_40px_-28px_rgba(22,40,74,0.45)]">
                <div className="flex h-56 items-center justify-center bg-[#10233f] px-5 py-4">
                  <img src={gift.image} alt={gift.imageAlt} className="max-h-full max-w-full object-contain" />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-2xl font-bold">{gift.name}</h3>
                  <p className="mt-2 text-2xl font-extrabold text-[#8a6414]">{gift.price}</p>
                  <ul className="mt-4 space-y-2 text-sm leading-relaxed">
                    {gift.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                  <p className="mt-4 text-sm leading-relaxed text-[#3d4d6b]">{gift.disclosure}</p>
                  <div className="mt-auto pt-5">
                    {gift.action ? (
                      <a className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#F2D06B] px-5 text-center text-base font-bold text-[#16284a]" href={gift.action.href}>
                        {gift.action.label}
                      </a>
                    ) : (
                      <p className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#203864]/20 px-5 text-center text-base font-bold text-[#3d4d6b]">
                        {gift.status}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="mt-8 rounded-3xl border border-[#203864]/10 bg-white px-5 py-4 sm:px-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8a6414]">Sold out</p>
            <h2 className="mt-1 font-display text-2xl font-bold">Founder&apos;s Edition</h2>
            <p className="mt-2 max-w-3xl text-base leading-relaxed">
              Sold out. This edition cannot be purchased. Every Founder&apos;s Edition preorder was upgraded to the new hardcover as a thank-you.
            </p>
          </aside>

          <div className="mt-10 grid gap-3">
            <h2 className="font-display text-2xl font-bold">Before you give</h2>
            <details className="rounded-2xl border border-[#203864]/10 bg-white px-5 py-4">
              <summary className="cursor-pointer font-bold">Where do paperback and hardcover orders go?</summary>
              <p className="mt-3 text-base leading-relaxed">
                Both buttons open the current bookstore at caidenvale.com/story/books. That is the verified checkout for the $30 paperback and the $49.99 hardcover.
              </p>
            </details>
            <details className="rounded-2xl border border-[#203864]/10 bg-white px-5 py-4">
              <summary className="cursor-pointer font-bold">Why is bundle checkout closed?</summary>
              <p className="mt-3 text-base leading-relaxed">
                The $59.99 Holiday Adventure Bundle and the $75.99 Holiday Signature Bundle do not have a verified checkout at those prices. An older bundle link charges $59.00, and this page does not use it.
              </p>
            </details>
            <details className="rounded-2xl border border-[#203864]/10 bg-white px-5 py-4">
              <summary className="cursor-pointer font-bold">Does this page start Academy access?</summary>
              <p className="mt-3 text-base leading-relaxed">
                No. This page does not start Academy access. Bundle Academy time begins only when a parent activates it, and that activation is not available here.
              </p>
            </details>
          </div>
        </section>
      </main>
      <CourageFooter />
    </div>
  );
}
