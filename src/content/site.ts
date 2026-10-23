/**
 * ALL copy, links, prices, flags and gallery items for the site (M-10).
 *
 * Editing guide (plain language):
 * - Text in [BRACKETS] is a placeholder that only Wale can fill in. Replace the whole
 *   bracketed text, including the brackets, when you have the real words.
 * - Words wrapped in *asterisks* inside a heading show as italic brass.
 * - `null` means “not known yet”: the element hides or shows a safe fallback.
 * - Fields marked CONFIRM are best guesses. Check them with Wale before launch.
 * - Use typographic apostrophes and quotes (’ “ ”) in all copy.
 */

export type GalleryItem = {
  id: string;
  kind: 'photo' | 'video';
  /** File name inside public/images/ */
  image: string;
  alt: string;
  caption: string;
  /** Self-hosted video, e.g. '/videos/live-set.mp4' (video items only) */
  videoSrc?: string | null;
  /** Instagram or YouTube link (video items only) */
  externalUrl?: string | null;
};

export type ContactKind = 'booking' | 'lessons' | 'general';

export const site = {
  siteUrl: 'https://YOUR-DOMAIN.com', // CONFIRM before launch (used for canonical/OG/sitemap)
  name: 'Wale',
  fullName: null as string | null, // e.g. 'Wale Adebayo' — shown in footer/JSON-LD if set
  role: 'Saxophonist',
  base: 'Ajah, Lagos',
  whatsapp: { number: '2347040149133', display: '0704 014 9133' },
  phoneHref: 'tel:+2347040149133',
  instagram: { handle: null as string | null, url: null as string | null }, // null → shows “[@handle]” as plain text
  photoCredit: 'Portrait by Efizzy Studios',
  stats: [
    { value: '[00]+', label: 'events played' },
    { value: '[00]+', label: 'students taught' },
    { value: '[0] years', label: 'on stage' },
  ],
  performance: {
    startingPrice: null as string | null, // e.g. '₦150,000' → adds “Packages start from ₦150,000.” to the price FAQ
    bringsSound: null as null | 'own' | 'venue' | 'either', // null hides that FAQ item
    genres: ['Afrobeats', 'Highlife', 'Gospel & worship', 'Jazz standards', 'R&B & soul', 'Amapiano'], // CONFIRM
  },
  lessons: {
    home: true, // CONFIRM: teaches at the student’s home in Lagos
    online: false, // CONFIRM: video-call lessons
    group: false, // CONFIRM: siblings/friends/church band together
    youngLearners: { enabled: true, minAge: null as number | null }, // CONFIRM
    lessonLength: null as string | null, // e.g. '60 minutes'
    price: null as string | null, // e.g. '₦40,000 / month · 4 lessons'
    trial: null as string | null, // e.g. 'First lesson free' or 'Trial lesson ₦10,000'
    advisesOnInstruments: true, // CONFIRM: will tell students what sax to buy
  },
  areas: ['Ajah', 'Lekki', 'Sangotedo', 'Ibeju-Lekki', 'Victoria Island', 'Ikoyi', 'Yaba', 'Surulere', 'Ikeja', 'Magodo', 'Festac'],
  audioSample: null as string | null, // e.g. '/audio/wale-sample.mp3' → enables the “Hear a phrase” button
  gallery: [
    { id: 'live-video', kind: 'video', image: 'gal-video.jpg', alt: 'Wale performing live', caption: 'Live set', videoSrc: null, externalUrl: null },
    { id: 'live-1', kind: 'photo', image: 'EFIZ1638.jpg', alt: 'Wale holding his saxophone in a dark studio portrait', caption: 'Studio portrait' },
    { id: 'live-2', kind: 'photo', image: 'EFIZ1639.jpg', alt: 'Wale performing with his saxophone under stage lighting', caption: 'On stage' },
    { id: 'live-3', kind: 'photo', image: 'EFIZ1647.jpg', alt: 'Wale with his saxophone in a red-lit portrait', caption: 'Saxophone portrait' },
    { id: 'live-4', kind: 'photo', image: 'EFIZ1654.jpg', alt: 'Wale seated with his saxophone', caption: 'Between sets' },
    { id: 'live-5', kind: 'photo', image: 'EFIZ1656.jpg', alt: 'Wale holding his saxophone in a dark studio portrait', caption: 'Studio portrait' },
    { id: 'live-6', kind: 'photo', image: 'EFIZ1659.jpg', alt: 'Wale holding a red flower beside his saxophone', caption: 'Portrait' },
    { id: 'live-7', kind: 'photo', image: 'wedding.jpeg', alt: 'Wale playing saxophone at a wedding celebration', caption: 'Wedding performance' },
    { id: 'live-8', kind: 'photo', image: 'EFIZ1562 3.JPG', alt: 'Wale dressed for a performance', caption: 'Ready for the occasion' },
    { id: 'live-9', kind: 'photo', image: 'EFIZ1565.jpg', alt: 'Wale in a black suit', caption: 'Portrait' },
    { id: 'live-10', kind: 'photo', image: 'EFIZ1565 2.jpg', alt: 'Wale in a black suit', caption: 'Portrait' },
    { id: 'live-11', kind: 'photo', image: 'EFIZ1565 3.jpg', alt: 'Wale in a black suit', caption: 'Portrait' },
    { id: 'live-12', kind: 'photo', image: 'EFIZ1575.jpg', alt: 'Wale in a grey suit', caption: 'Portrait' },
    { id: 'live-13', kind: 'photo', image: 'EFIZ1575 2.jpg', alt: 'Wale in a grey suit', caption: 'Portrait' },
    { id: 'live-14', kind: 'photo', image: 'EFIZ1575 3.jpg', alt: 'Wale in a grey suit', caption: 'Portrait' },
    { id: 'live-15', kind: 'photo', image: 'EFIZ1577.jpg', alt: 'Wale in a black suit', caption: 'Portrait' },
    { id: 'live-16', kind: 'photo', image: 'EFIZ1577 2.jpg', alt: 'Wale in a black suit', caption: 'Portrait' },
    { id: 'live-17', kind: 'photo', image: 'EFIZ1577 3.jpg', alt: 'Wale in a black suit', caption: 'Portrait' },
    { id: 'live-18', kind: 'photo', image: 'EFIZ1585 2.jpg', alt: 'Wale seated in a chair', caption: 'Portrait' },
    { id: 'live-19', kind: 'photo', image: 'EFIZ1585 3.jpg', alt: 'Wale seated in a chair', caption: 'Portrait' },
    { id: 'live-20', kind: 'photo', image: 'EFIZ1595.jpg', alt: 'Wale seated with his saxophone', caption: 'Portrait' },
    { id: 'live-21', kind: 'photo', image: 'EFIZ1595 2.jpg', alt: 'Wale seated with his saxophone', caption: 'Portrait' },
    { id: 'live-22', kind: 'photo', image: 'EFIZ1595 3.jpg', alt: 'Wale seated with his saxophone', caption: 'Portrait' },
    { id: 'live-23', kind: 'photo', image: 'EFIZ1596.jpg', alt: 'Wale seated with his saxophone', caption: 'Portrait' },
    { id: 'live-24', kind: 'photo', image: 'EFIZ1596 2.jpg', alt: 'Wale seated with his saxophone', caption: 'Portrait' },
    { id: 'live-25', kind: 'photo', image: 'EFIZ1639 3.jpg', alt: 'Wale performing with his saxophone under stage lighting', caption: 'On stage' },
    { id: 'live-26', kind: 'photo', image: 'EFIZ1647 2.jpg', alt: 'Wale holding his saxophone in a red-lit portrait', caption: 'Saxophone portrait' },
    { id: 'live-27', kind: 'photo', image: 'EFIZ1647 3.jpg', alt: 'Wale holding his saxophone in a red-lit portrait', caption: 'Saxophone portrait' },
    { id: 'live-28', kind: 'photo', image: 'IMG_0671.jpg', alt: 'A decorated room set up for a celebration', caption: 'A celebration setup' },
    { id: 'live-29', kind: 'photo', image: 'birthday.jpg', alt: 'A birthday celebration at home', caption: 'Birthday celebration' },
    { id: 'live-30', kind: 'photo', image: 'propsal.jpg', alt: 'A decorated room prepared for a proposal', caption: 'Proposal setup' },
    { id: 'live-31', kind: 'photo', image: 'dinning.jpg', alt: 'A dining table prepared for an event', caption: 'Dinner setup' },
  ] as GalleryItem[],

  // ─── SEO ──────────────────────────────────────────────────────────────
  seo: {
    title: 'Wale | Saxophonist for Hire & Saxophone Lessons in Lagos',
    description:
      'Book Wale, a live saxophonist based in Ajah, for weddings, birthdays and events anywhere in Lagos, or learn the sax with one-on-one lessons at home.',
    services: ['Live saxophone performance', 'Saxophone lessons'],
    city: 'Lagos',
    locality: 'Ajah',
    region: 'Lagos',
    country: 'NG',
  },

  // ─── Shared UI labels ─────────────────────────────────────────────────
  ui: {
    skipLink: 'Skip to content',
    menu: 'Menu',
    close: 'Close',
    motionLabel: 'Motion',
    motionOn: 'On',
    motionOff: 'Off',
    newTab: '(opens in a new tab)',
  },

  // ─── Global elements (§6.3) ───────────────────────────────────────────
  nav: {
    label: 'Sections',
    links: [
      { label: 'Performances', href: '#performances' },
      { label: 'Lessons', href: '#lessons' },
      { label: 'Gallery', href: '#gallery' },
      { label: 'FAQ', href: '#faq' },
    ],
    cta: 'Message Wale',
  },
  widget: {
    ariaLabel: 'Chat with Wale on WhatsApp',
    chip: 'Chat with Wale',
    title: 'Wale · Saxophonist',
    status: 'Replies on WhatsApp',
  },
  contactOptions: [
    { kind: 'booking', label: 'Book a performance' },
    { kind: 'lessons', label: 'Ask about lessons' },
    { kind: 'general', label: 'Just a question' },
  ] as { kind: ContactKind; label: string }[],
  footer: {
    tagline: 'Live saxophonist & teacher · Ajah, Lagos · Plays and teaches anywhere in Lagos',
    whatsappLabel: 'WhatsApp · 0704 014 9133',
    instagramLabel: 'Instagram',
    instagramPlaceholder: '[@handle]',
    copyright: '© 2026 · Portrait by Efizzy Studios',
  },

  // ─── Hero (§6.4) ──────────────────────────────────────────────────────
  hero: {
    eyebrow: 'Live saxophonist & teacher · Ajah, Lagos',
    h1Words: ['Live', 'saxophone,', 'delivered', 'to', 'your', 'door.'],
    h1EmphasisIndex: 2,
    lead: 'Book Wale to play your wedding, birthday or dinner — or learn to play yourself, with one-on-one lessons at home. Anywhere in Lagos.',
    primaryCta: 'Book Wale for your event',
    secondaryCta: 'Start saxophone lessons',
    microcopy: 'Both start with one WhatsApp message.',
    image: {
      file: 'wale-hero.jpg',
      alt: 'Wale in a black pinstripe suit and coral bow tie, holding a gold alto saxophone',
    },
    hearPhrase: 'Hear a phrase',
    stop: 'Stop',
  },

  // ─── Paths (§6.5) ─────────────────────────────────────────────────────
  paths: {
    eyebrow: 'Two ways in',
    heading: 'Two ways to bring the saxophone *home.*',
    cards: [
      {
        label: '01 · Performances',
        title: 'Hear him live',
        body: 'Weddings, birthdays, proposals, dinners and church events. He arrives suited, plays your moments on cue, and leaves your guests talking.',
        bodyNoYoung: null as string | null,
        link: 'Explore performances',
        href: '#performances',
      },
      {
        label: '02 · Lessons',
        title: 'Learn to play',
        body: 'One-on-one saxophone lessons in your own living room — for complete beginners, young learners and church instrumentalists.',
        // Used when lessons.youngLearners.enabled is false (drops “young learners and”).
        bodyNoYoung: 'One-on-one saxophone lessons in your own living room — for complete beginners, church instrumentalists.' as string | null,
        link: 'Explore lessons',
        href: '#lessons',
      },
    ],
  },

  chapters: {
    performances: 'I · Performances',
    lessons: 'II · Lessons',
    watch: 'III · Watch',
  },

  // ─── Chapter I — Performances (§6.6) ──────────────────────────────────
  why: {
    eyebrow: 'Why live sax',
    heading: 'Every party has a playlist. Yours can have a *moment.*',
    body: 'You know the kind of event. Same speaker, same playlist as the last three you went to, and half the guests are on their phones before the small chops run out. A week later, nobody remembers it.',
    emphasis:
      'Then a saxophonist walks in playing the celebrant’s favourite song — and the whole room turns around. The phones come out again, this time to film. That is the moment people carry home.',
    features: [
      { n: '01', title: 'Fits any room.', body: 'One performer, minimal setup. A corner of your living room is enough of a stage.' },
      { n: '02', title: 'Plays to your crowd.', body: 'Afrobeats for the dancers, highlife for the uncles, worship for the thanksgiving, smooth jazz for the dinner.' },
      { n: '03', title: 'Hits your cues.', body: 'The entrance, the cake, the “yes”. Tell him the moment and he plays it right on time.' },
    ],
  },
  occasions: {
    eyebrow: 'Occasions',
    heading: 'Wherever there’s something to celebrate.',
    cards: [
      { image: 'wedding.jpeg', title: 'Weddings.', body: 'The walk down the aisle, the grand entrance, the first dance — live, and timed to the second.', alt: 'Wale playing saxophone at a wedding celebration' },
      { image: 'birthday.jpg', title: 'Birthdays & surprises.', body: 'He walks in playing their favourite song. You get to watch their face.', alt: 'A birthday celebration at home' },
      { image: 'propsal.jpg', title: 'Proposals & anniversaries.', body: 'A private serenade at home or over dinner, for the question that matters most.', alt: 'A decorated room prepared for a proposal' },
      { image: 'dinning.jpg', title: 'Dinners, launches & lounges.', body: 'Smooth live jazz that keeps guests at the table — for corporate nights, restaurants and beach clubs.', alt: 'A dining table prepared for an event' },
    ],
    footer: 'Also thanksgiving services, naming ceremonies, graduations, house parties and album launches. If there are guests, he can play it.',
    cta: 'Ask about your event',
  },
  pullQuote: {
    quote: '“[A client’s words about the moment Wale walked in — ask a happy client for two sentences and paste them here.]”',
    caption: '[Client name] · [Occasion], [Area]',
    placeholder: true,
  },
  bookingSteps: {
    eyebrow: 'How booking works',
    heading: 'Booked in three messages.',
    steps: [
      { n: '1', title: 'Send your date & location.', body: 'One WhatsApp message: when, where, and what you’re celebrating.' },
      { n: '2', title: 'Choose your songs.', body: 'Tell him the moments that matter and the songs that matter to you. Not sure? He’ll suggest a set for your crowd.' },
      { n: '3', title: 'He arrives and plays.', body: 'Dressed for the occasion and ready to go. You get to enjoy your own event.' },
    ],
    genresLabel: 'He plays',
    yourSong: 'Your song',
  },
  hosts: {
    eyebrow: 'Kind words',
    heading: 'What hosts say after the night.',
    cards: [
      { quote: '“[Before Wale: what they were worried about. After: what their guests said when he started playing.]”', name: '[Client name]', meta: '[Wedding · Lekki]', placeholder: true },
      { quote: '“[The surprise moment: who it was for, how they reacted, what it meant.]”', name: '[Client name]', meta: '[Birthday · Ikoyi]', placeholder: true },
      { quote: '“[Why they would book him again, or who they have already recommended him to.]”', name: '[Client name]', meta: '[Corporate dinner · Victoria Island]', placeholder: true },
    ],
  },

  // ─── Coverage bridge (§6.7) ───────────────────────────────────────────
  coverage: {
    eyebrow: 'Home delivery',
    heading: 'Based in Ajah. *Plays\u00A0— and teaches —\u00A0anywhere.*', // D-018
    body: 'You don’t go to the music — the music comes to you. Your living room, your rooftop, the church hall, the hotel ballroom.',
    lessonsBody: 'Lessons work the same way: Wale comes to your home, so Lagos traffic never stands between you and your practice.',
    moreChip: '…and everywhere in between',
    note: 'Outside Lagos? Send the location and ask.',
    mapCaption: 'Stylised map — not to scale.',
    baseLabel: 'Base',
    areasLabel: 'Areas Wale plays and teaches',
  },

  // ─── Chapter II — Lessons (§6.8) ──────────────────────────────────────
  lessonsIntro: {
    eyebrow: 'Saxophone lessons',
    heading: 'Learn the saxophone\u00A0from someone\u00A0who *plays it for a living.*', // \u00A0 = no-break space (D-018)
    leadHome: 'One-on-one lessons at your home in Lagos. Start from zero, or finally fix the habits YouTube taught you.',
    leadOnline: 'One-on-one lessons by video call, wherever you are.',
    leadBoth: 'One-on-one lessons at your home in Lagos, or by video call.',
    cta: 'Book a trial lesson',
    microTrial: '{trial} · Send your level and area on WhatsApp.',
    microDefault: 'Send your level and area on WhatsApp — Wale will suggest a plan.',
    image: { file: 'wale-sax-detail.jpg', alt: 'Close-up of Wale’s hands on the bell of his gold saxophone' },
  },
  lessonsPas: {
    eyebrow: 'Sound familiar?',
    heading: 'The saxophone isn’t hard. *Learning\u00A0it alone is.*', // D-018
    p1: 'You’ve wanted to play for years. Maybe there’s a saxophone in your house right now, sitting in its case.',
    p2: 'So you try YouTube. You get a squeak, a sore lip and a lot of frustration — and nobody there to tell you why. The wrong habit sets in, progress stops, and the case closes for another year.',
    p3: 'Lessons with Wale fix that from the first session. He sits beside you, hears every note and corrects it on the spot. Then he teaches you the songs you actually want to play — not just exercises.',
  },
  lessonsWho: {
    eyebrow: 'Who it’s for',
    heading: 'Built for where you’re *starting from.*',
    cards: [
      { key: 'beginner', title: 'Complete beginners.', body: 'Never held a saxophone? You start at the beginning: how to hold it, how to breathe, your first notes.' },
      { key: 'young', title: 'Young learners.', body: 'Patient, structured lessons that keep children and teens practising — and proud to play for the family.' },
      { key: 'church', title: 'Church & choir instrumentalists.', body: 'Learn to play hymns and praise songs by ear, follow the key the choir is in, and lead with confidence on Sunday.' },
      { key: 'advanced', title: 'Players who want more.', body: 'Already play? Work on tone, runs, improvisation and the Afrobeats, highlife and jazz lines you hear on stage.' },
    ] as { key: 'beginner' | 'young' | 'church' | 'advanced'; title: string; body: string }[],
    minAgeSuffix: ' From age {minAge}.',
  },
  lessonsPath: {
    eyebrow: 'The path',
    heading: 'From first note to *first performance.*',
    intro: 'Every student moves at their own pace. This is the road.',
    stages: [
      { n: '01', title: 'First sound.', body: 'Posture, breathing and embouchure. Clean, steady notes before anything else.' },
      { n: '02', title: 'First song.', body: 'A full song you choose, played start to finish. This is where it gets fun.' },
      { n: '03', title: 'Read & hear.', body: 'Reading music, scales, and the skill most self-taught players never get: playing by ear.' },
      { n: '04', title: 'Play out.', body: 'Improvising, playing with backing tracks, and performing for real people — family, church, your first event.' },
    ],
  },
  lessonsFormats: {
    eyebrow: 'Lesson formats',
    heading: 'Lessons that *come to you.*',
    cards: {
      home: { title: 'Home lessons', body: 'Wale comes to your home, anywhere in Lagos. One-on-one{length}.' },
      online: { title: 'Online lessons', body: 'Live video lessons from wherever you are. Same teacher, same feedback.' },
      group: { title: 'Learn together', body: 'Siblings, friends or a church band learning side by side.' },
    },
    lengthSuffix: ', {lessonLength} per lesson',
    priceFallback: 'Ask for a price on WhatsApp',
    instrumentNote: 'No saxophone yet? Ask Wale before you buy — a bad beginner instrument makes everything harder.',
    cta: 'Book a trial lesson',
  },
  students: {
    eyebrow: 'Students',
    heading: 'What students say after a few lessons.',
    cards: [
      { quote: '“[Before: what they had tried — YouTube, teaching themselves. After: what they can play now.]”', name: '[Student name]', meta: '[Adult beginner · Lekki]', placeholder: true },
      { quote: '“[A parent: how their child feels about practising and playing now.]”', name: '[Parent name]', meta: '[Parent of a student · Ajah]', placeholder: true },
      { quote: '“[A church instrumentalist: what changed on Sunday.]”', name: '[Student name]', meta: '[Church instrumentalist · Sangotedo]', placeholder: true },
    ],
  },

  // ─── Chapter III — Gallery (§6.9) ─────────────────────────────────────
  watch: {
    eyebrow: 'Watch',
    heading: 'See him live *before you book.*',
    instagramLink: 'More on Instagram',
    instagramPlaceholder: '[@handle]',
    hint: 'Drag to orbit · Tap to open',
    counterSep: ' / ',
  },

  // ─── FAQ (§6.10) ──────────────────────────────────────────────────────
  faq: {
    eyebrow: 'Questions',
    heading: 'Before you message.',
    groups: { performances: 'Performances', lessons: 'Lessons' },
    performances: {
      cost: {
        q: 'How much does it cost?',
        a: 'It depends on the date, how long you want him to play and where the event is. Send the details on WhatsApp and you’ll get a clear quote.',
        withPrice: ' Packages start from {startingPrice}.',
      },
      travel: {
        q: 'How far will he travel?',
        a: 'Anywhere in Lagos — from Ajah and Lekki to the Island and the Mainland. Planning something outside Lagos? Send the location and ask.',
      },
      song: {
        q: 'Can he play a specific song?',
        a: 'Yes. Send it ahead of time and he’ll prepare it — entrance songs, birthday favourites and first dances are exactly what he’s there for.',
      },
      sound: {
        q: 'Does he bring his own sound?',
        own: 'Yes — he brings his own speaker and mic, so all he needs is a power socket.',
        venue: 'He plugs into your venue’s or DJ’s sound system — just let him know who’s handling sound.',
        either: 'Either works. He can bring his own speaker and mic, or plug into your venue’s or DJ’s system.',
      },
      early: {
        q: 'How early should I book?',
        a: 'As early as you can. He can only play one event at a time, and weekends go first.',
      },
    },
    lessons: {
      never: {
        q: 'I’ve never played. Is that okay?',
        a: 'Yes. Lessons start from the very beginning: holding the saxophone, breathing, and your first notes.',
      },
      own: {
        q: 'Do I need my own saxophone?',
        advises: 'You’ll need one to practise between lessons. If you don’t have one yet, ask Wale before you buy — he’ll tell you what to look for.',
        plain: 'You’ll need one to practise between lessons.',
      },
      age: {
        q: 'How old do you have to be?',
        withMinAge: 'Lessons are for adults and young learners from age {minAge}.',
        noMinAge: 'Adults and young learners are both welcome — send the student’s age on WhatsApp and Wale will tell you if it’s a good time to start.',
      },
      often: {
        q: 'How often are lessons, and how much?',
        a: 'Send your level, area and preferred days on WhatsApp, and Wale will suggest a schedule and price.',
        withPrice: ' Lessons are {price}.',
      },
      genres: {
        q: 'Can I learn gospel, Afrobeats or jazz specifically?',
        a: 'Yes. Tell him the music you love in your first message — your lessons are built around the songs you want to play.',
      },
    },
  },

  // ─── Final CTA (§6.11) ────────────────────────────────────────────────
  finalCta: {
    eyebrow: 'Your move',
    heading: 'Hear him live, or learn to play. *Either way, he comes to you.*',
    body: 'One saxophonist, one event a night — and only so many lesson slots in a week. If your date or your start matters, send the message now.',
    cta1: 'Check Wale’s availability',
    cta2: 'Book a trial lesson',
    callPrefix: 'Prefer to call?',
  },

  // ─── 404 (§6.12) ──────────────────────────────────────────────────────
  notFound: {
    eyebrow: 'Lost in space',
    heading: 'This page drifted *off the map.*',
    body: 'The music is still playing on the home page.',
    home: 'Back to the home page',
  },

  // ─── Booking and Lessons consoles (§9.2, §9.3) ────────────────────────
  consoles: {
    booking: {
      title: 'Book Wale',
      subtitle: 'Answer a few quick questions — your WhatsApp message writes itself.',
      occasionLegend: 'Occasion',
      occasions: ['Wedding', 'Birthday or surprise', 'Proposal or anniversary', 'Dinner or corporate event', 'Church or thanksgiving', 'Something else'],
      dateLabel: 'Date',
      dateUnfixed: 'Date not fixed yet',
      locationLabel: 'Location',
      locationPlaceholder: 'e.g. Lekki Phase 1',
      guestsLegend: 'Guests',
      guests: ['Under 30', '30–100', '100–300', '300+', 'Not sure'],
      notesLabel: 'Anything else?',
      notesPlaceholder: 'Songs, timings, dress code…',
      preview: 'Your message',
      send: 'Send on WhatsApp',
      sayHi: 'Just want to say hi?',
    },
    lessons: {
      title: 'Start lessons',
      subtitle: 'Tell Wale where you’re starting — he’ll suggest a plan.',
      whoLegend: 'Who’s learning?',
      who: ['Me', 'My child', 'Someone else'],
      /** Which “who” answers show the Age field (index into `who`). */
      whoWithAge: [1, 2],
      ageLabel: 'Age',
      experienceLegend: 'Experience',
      experience: ['Never played', 'A little', 'I already play'],
      formatLegend: 'Format',
      formats: { home: 'Home lessons', online: 'Online lessons', group: 'Learning together', notSure: 'Not sure' },
      areaLabel: 'Area',
      daysLegend: 'Preferred days',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Flexible'],
    },
  },

  // ─── Lightbox (§9.5) ──────────────────────────────────────────────────
  lightbox: {
    label: 'Gallery',
    close: 'Close',
    prev: 'Previous',
    next: 'Next',
    watchOnInstagram: 'Watch on Instagram',
    watchOnYouTube: 'Watch on YouTube',
  },

  // ─── WhatsApp message templates (§9.6, OQ-7) ──────────────────────────
  messages: {
    bookingIntro: 'Hi Wale, I found your website and I’d like to book you.',
    bookingLabels: { occasion: 'Occasion', date: 'Date', location: 'Location', guests: 'Guests' },
    dateNotFixed: 'Not fixed yet',
    lessonsIntro: 'Hi Wale, I found your website and I’d like saxophone lessons.',
    lessonsLabels: {
      who: 'Who’s learning',
      age: ' (age {age})',
      experience: 'Experience',
      format: 'Format',
      area: 'Area',
      days: 'Preferred days',
    },
    generalIntro: 'Hi Wale, I found your website and I have a question:',
  },
};

export type Site = typeof site;
