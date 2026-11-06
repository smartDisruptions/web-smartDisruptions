/**
 * The projects that get their own page under /built.
 *
 * WHY THIS EXISTS: Josh's call, 2026-09-20. Broom & Blade is two separate
 * things — a game a family uses, and a website that explains it — and the
 * single highlight on /built was describing the game in its headline and the
 * website in its bullets. Same for The Pembroke File (taken off the site
 * 2026-10-07). So a project is now a
 * list of PARTS, each with its own address, its own description and its own
 * evidence. /about lists the parts (it holds What I Built's index since
 * October 2026); /built/<slug> describes them.
 *
 * VOICE: written for the average person. No analogies, no wordplay, no
 * sentence that has to be read twice. In-game names (Armory, Skill Grove) are
 * used as names only — never to carry the meaning of a sentence.
 *
 * FACTS: the website parts come from the verified /websites write-ups. The
 * game parts come from this repo's own records in src/data/apps.ts, written
 * when each shipped. Translated into plain words here, never widened.
 * Broom & Blade's two parts were rewritten on 2026-11-06 for the new game
 * and the new website: the facts come from the game's code and from what the
 * website itself tells players, and they stop where the website does, so
 * nothing it keeps sealed is given away here.
 */

export type ProjectPart = {
  /** Shown as a small label, and on the index as the list of parts. */
  kind: 'Website' | 'Game' | 'App';
  heading: string;
  /** Where the part actually lives. */
  href: string;
  linkLabel: string;
  image: string;
  imageAlt: string;
  /** The file's real pixel size. Wrong values here crop the screenshot. */
  imageWidth: number;
  imageHeight: number;
  what: string;
  body: string;
  bullets: string[];
  receipts: { value: string; label: string }[];
};

export type Project = {
  slug: string;
  name: string;
  eyebrow: string;
  /** The one line the index card shows. */
  summary: string;
  image: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  parts: ProjectPart[];
  /**
   * Kinds the project also counts as on /about, beyond the kinds of its
   * parts. Broom & Blade's game is the chore app the family uses every day,
   * so it hangs under Apps as well as Games (Josh, 2026-11-06).
   */
  alsoKinds?: ProjectPart['kind'][];
};

/** Every kind a project counts as: its parts' kinds, then `alsoKinds`. */
export function kindsOfProject(p: Project): ProjectPart['kind'][] {
  return [
    ...new Set([...p.parts.map((part) => part.kind), ...(p.alsoKinds ?? [])]),
  ];
}

export const projects: Project[] = [
  {
    slug: 'broom-blade',
    name: 'Broom & Blade',
    eyebrow: 'My own project · online now',
    summary:
      'Household chores turned into a game for kids, and the website that tells its story.',
    image: '/images/websites/broom-blade-paper-guild.webp',
    imageAlt:
      'The Broom & Blade website in its Paper Guild look: the name in big cream letters on a wooden wall, and a hero card pinned beside it, a smiling hero in a straw sunhat with a cat, a dog on a shield and a big yellow sponge.',
    imageWidth: 1200,
    imageHeight: 750,
    alsoKinds: ['App'],
    parts: [
      {
        kind: 'Game',
        heading: 'The game',
        href: 'https://broom-blade.vercel.app',
        linkLabel: 'Try the app',
        image: '/images/apps/broom-blade-board.webp',
        imageAlt:
          'The Broom & Blade chore board on a phone, in the Paper Guild look. Each chore hangs as a paper slip with the points and gold it pays and a round button to seal it.',
        imageWidth: 780,
        imageHeight: 1688,
        what: 'The app the family actually uses.',
        body: 'A parent puts the chores on a board. Every chore a child finishes pays out points and gold. One code signs the whole family in, so everyone shares the same board and each person has their own character.',
        bullets: [
          'Points move a child up through sixteen titles. Gold buys gear in the Shop: 180 pieces, from Tools to fight with to helmets, outfits, companions and charms, and every one has a short story. Some can never be bought, only won.',
          'Every level a child gains opens one fight in the Colosseum, against a monster made of dust. There are fifty of them across five rooms, and each of the 26 Tools attacks with its own animation and sound.',
          'Sweep Co. is a small game on the side: sweep up dust for silver and hire help. The helpers only work on hours earned by doing chores, so it never takes their place.',
          'Marking a chore done takes a press and hold rather than a tap, so it cannot happen by accident. A parent has the final say on whether a chore is really done.',
          'Finish every daily chore and a hooded merchant comes with three boxes. Two hold gold and one holds a fortune. Every fifth day like that, he offers 100 gold or a mystery box with a prize inside.',
          'Each child picks one of two looks for the whole game, Warband or Paper Guild, in light or dark. Every hero, piece of gear and monster is drawn for both.',
          'It is free, needs no account, and installs on a phone like any other app. The music and the sound of each Tool were made with ElevenLabs, and the app makes every other sound itself.',
          'The carnival games from its first version play on their own, free, in the Broom & Blade Arcade at the bottom of my Arcade page, where Pip the guild mouse runs the room.',
        ],
        receipts: [
          {
            value: '180',
            label: 'Pieces of gear, each with its own story',
          },
          { value: '50', label: 'Dust monsters to beat, across five rooms' },
          { value: 'Free', label: 'No account and no payment, on any phone' },
        ],
      },
      {
        kind: 'Website',
        heading: 'The website',
        href: 'https://web-broom-blade.vercel.app',
        linkLabel: 'See the website',
        image: '/images/websites/broom-blade-shop.webp',
        imageAlt:
          'The Shop chapter of the Broom & Blade website in its Warband look: a grid of Tools to fight with, from the Trusty Broom to the Feather Duster, a row of sealed cards marked with question marks, and the Trusty Broom shown large beside them with a button to take it into the Colosseum.',
        imageWidth: 1200,
        imageHeight: 750,
        what: 'The page that tells the game’s story, written for the kid who will play it.',
        body: 'The website tells the story rather than explaining the rules. An old wizard tells it in seven short chapters, and each chapter lets you try a piece of the game right on the page.',
        bullets: [
          'You can seal a chore with a press and hold, grow a hero from level 1 to 12 with a slider, take a Tool from the Shop into a fight, start a tiny sweeping business, and open the merchant’s boxes after dark.',
          'Every hero, Tool and monster on it is the game’s own art. A switch at the top dresses the whole page in either of the game’s two looks. It opens in Paper Guild.',
          'It keeps the game’s secrets. It shows the first twelve levels and the first room of the Colosseum and seals everything past them, so there is still something to find when you play.',
          'The Tools you can pick up attack with the same animation and sound as in the game. The fight and the sweeping game each have a song, but the music stays off until you turn it on.',
          'Five dust bunnies are hidden around the page for anyone who looks.',
        ],
        receipts: [
          {
            value: '7',
            label: 'Chapters, each with a piece of the game to try',
          },
          { value: '2', label: 'Looks, and the whole page can wear either' },
          {
            value: '12',
            label: 'Levels it shows. The rest stay sealed for players',
          },
        ],
      },
    ],
  },
  {
    slug: 'samurai-kitchen',
    name: 'Samurai Kitchen',
    eyebrow: 'Made for a client · online now',
    summary: 'A food truck’s website, where customers order and pay online.',
    image: '/images/websites/samurai-kitchen.webp',
    imageAlt:
      'The Samurai Kitchen website, showing catering and online ordering.',
    imageWidth: 1200,
    imageHeight: 750,
    parts: [
      {
        kind: 'Website',
        heading: 'The website',
        href: 'https://samuraikitchencatering.com',
        linkLabel: 'See the website',
        image: '/images/websites/samurai-kitchen.webp',
        imageAlt:
          'The Samurai Kitchen website, showing catering and online ordering.',
        imageWidth: 1200,
        imageHeight: 750,
        what: 'A real food truck, taking real orders.',
        body: 'The old site could not take an order. Every catering request arrived as an email, and nobody could pay online. This one handles the whole order, from picking the food to paying for it.',
        bullets: [
          'Customers choose from the menu, build an order and pay by card without leaving the site. Card details go straight to Square. This site never sees them.',
          'Customers collect points on every order and spend them at the checkout. That is the part that turns a first order into a second one.',
          'Catering is handled separately, with set packages at set prices, so an enquiry arrives as an order rather than an email to answer.',
          'Prices come from the same Square account the kitchen uses at the truck, so an order is always charged what the kitchen set, and nothing on the site can go out of date.',
          'The owner placed a full order through it himself, start to finish, before it went anywhere near a customer.',
        ],
        receipts: [
          {
            value: '3',
            label: 'Parts of Square it uses: payments, menu and points',
          },
          { value: '0', label: 'Card numbers this site ever sees' },
          {
            value: 'Live',
            label: 'Taking real orders on the truck’s own website',
          },
        ],
      },
    ],
  },
  {
    slug: 'voltic',
    name: 'VOLTIC',
    eyebrow: 'A practice project · online now',
    summary: 'A launch page for an energy drink that does not exist.',
    image: '/images/websites/voltic.webp',
    imageAlt:
      'The VOLTIC website. A black energy drink can lit in blue and green, covered in water droplets.',
    imageWidth: 1200,
    imageHeight: 750,
    parts: [
      {
        kind: 'Website',
        heading: 'The website',
        href: 'https://web-voltic.vercel.app',
        linkLabel: 'See the website',
        image: '/images/websites/voltic.webp',
        imageAlt:
          'The VOLTIC website. A black energy drink can lit in blue and green, covered in water droplets.',
        imageWidth: 1200,
        imageHeight: 750,
        what: 'A product launch page, built to find out how good I could make one.',
        body: 'I made the brand up, so nothing on the page belongs to anyone else. The can in the middle is not a photograph. It is a 3D model, which is why it still looks right when you turn it around.',
        bullets: [
          'Scroll down and the can turns all the way round. You can also grab it and spin it yourself.',
          'The label and the nutrition panel on the back are real typed text, not part of a picture. Images made by AI usually get small print wrong. Typed text does not have that problem.',
          'The turn slows down as the back of the can comes round, so there is time to read the panel before the can fades out and the nutrition card takes its place.',
          'The water droplets on the can are not photographed either. The page builds those too.',
          'Getting the can to turn took two attempts. The first stitched video between two real photographs, which only looked right from the angles the photographs were taken at. Building the can in 3D fixed that.',
          'A check for accessibility problems runs automatically at six points down the page, and it stops the site going out if anything fails.',
        ],
        receipts: [
          {
            value: '0',
            label: 'Problems found by the automatic accessibility check',
          },
          { value: '33 KB', label: 'The size of the file that draws the page' },
          { value: '360°', label: 'You can look at the can from any angle' },
        ],
      },
    ],
  },
  {
    // A restaurant that does not exist, built to show a small food business's
    // whole website working. Facts from the Moonbowl repo (its README and
    // docs/IMAGES.md) and its checks on 2026-10-12: axe on every page at
    // phone and desktop sizes, and the demo order walked end to end.
    slug: 'moonbowl',
    name: 'Moonbowl Ramen',
    eyebrow: 'A demo website · online now',
    summary:
      'A website for a ramen truck that does not exist, where you can try ordering.',
    image: '/images/websites/moonbowl.webp',
    imageAlt:
      'The Moonbowl Ramen website. The words Slurp After Dark beside a grid of night-lit food photos: tonkotsu ramen, pan-fried gyoza, noodles lifted on chopsticks, spicy miso ramen and fried chicken.',
    imageWidth: 1200,
    imageHeight: 750,
    parts: [
      {
        kind: 'Website',
        heading: 'The website',
        href: 'https://web-moonbowl.vercel.app',
        linkLabel: 'See the website',
        image: '/images/websites/moonbowl.webp',
        imageAlt:
          'The Moonbowl Ramen website. The words Slurp After Dark beside a grid of night-lit food photos: tonkotsu ramen, pan-fried gyoza, noodles lifted on chopsticks, spicy miso ramen and fried chicken.',
        imageWidth: 1200,
        imageHeight: 750,
        what: 'A whole restaurant website, with a menu, ordering, rewards and catering, for a business I made up.',
        body: 'Nothing on it is real, and the site says so. The menu, the prices, the address and the phone number are all invented, so you can try every part of it and nothing happens.',
        bullets: [
          'You can order a full meal. Pick a size, choose how firm the noodles are, add toppings and a tip, and get a receipt at the end. There is no card form, and nothing is charged.',
          'The rewards page works with two demo phone numbers, so you can see what a points balance looks like.',
          'The location page opens by saying this is a demo. The map is a drawing of a place that does not exist, and the phone number is a 555 number that cannot ring anyone.',
          'Every photo was made with AI. Before making them, I gave three AI image tools the same bowl of ramen to draw and used the one that came back sharpest for its price.',
          'Three AI agents built it side by side. One wrote the code, one made the pictures, and one tested the speed and checked for accessibility problems.',
          'Every page is built ahead of time, so it opens fast, and nothing you type on it leaves your browser.',
        ],
        receipts: [
          {
            value: '0',
            label: 'Card numbers it asks for. The checkout is a demo',
          },
          { value: '17', label: 'Pictures made with AI for it' },
          {
            value: '0',
            label: 'Problems found by the automatic accessibility check',
          },
        ],
      },
    ],
  },
  {
    // A barbershop that does not exist, kept as my template for a small
    // shop's booking page. Built in the vault's Tools/gilt-and-lather and
    // served from public/demo/gilt-and-lather (see next.config.ts). Facts
    // from that folder's README and its lab runs on 2026-10-21: Lighthouse,
    // the old-phone test (360×640, 6× CPU, Slow 4G) and axe.
    slug: 'gilt-and-lather',
    name: 'Gilt & Lather Barber Co.',
    eyebrow: 'A demo website · online now',
    summary:
      'A website for a barbershop that does not exist, built to get people booked.',
    image: '/images/websites/gilt-and-lather.webp',
    imageAlt:
      'The Gilt & Lather Barber Co. website. Classic cuts, hot towels, done right, in gold letters beside a barber lifting a steaming hot towel.',
    imageWidth: 1200,
    imageHeight: 750,
    parts: [
      {
        kind: 'Website',
        heading: 'The website',
        href: '/demo/gilt-and-lather',
        linkLabel: 'See the website',
        // The phone view, so the part shows what the hero's laptop shot
        // can't: the booking bar held at the bottom of the screen.
        image: '/images/websites/gilt-and-lather-phone.webp',
        imageAlt:
          'The Gilt & Lather Barber Co. website on a phone. The section The classic cut, start to finish, above a photo of a leather barber chair, with a bar along the bottom of the screen that says Open now until 6 pm and Book your cut.',
        imageWidth: 780,
        imageHeight: 1688,
        what: 'A one-page website for a one-chair barbershop, with one job: getting a visitor into the chair.',
        body: 'I made the shop up, and the page says so. The barber, the address, the hours, the prices and the reviews are all invented, so you can press everything on it and nothing reaches anyone.',
        bullets: [
          'Every section answers one question a first-time visitor has, then ends in the same gold Book your cut button. On a phone, a booking bar stays where your thumb is.',
          'Every link that would leave the page, like booking, directions or reviews, opens a sign instead. It says the link does not go anywhere real yet, and which link it was.',
          'The phone number is a 555 number that cannot ring anyone.',
          'The photos were made with AI, and none of them shows a face.',
          'Six AI agents built it from one written set of rules. One of them only checked whether each section helped someone book, and another tested it on a slow old phone.',
          'The fonts, styles and code are all inside the one page, and it asks no other website for anything while it loads.',
        ],
        receipts: [
          {
            value: '100',
            label: 'Speed score on a phone, out of 100, in a lab test',
          },
          {
            value: '1',
            label: 'Second until Book can be pressed on an old phone with slow data',
          },
          {
            value: '0',
            label: 'Problems found by the automatic accessibility check',
          },
        ],
      },
    ],
  },
  {
    // Built at Josh's day job, so it belongs to the University of Idaho (its
    // policy FSH 5300). Added 2026-11-06 on Josh's word. Facts were read from
    // the live file on banner.uidaho.edu that day: its CONFIG, computeSAI,
    // meritFor and SAFE_SHARE_KEYS, and a worked estimate run in a browser. The
    // 23 checks come from his own record of the build. Left out on purpose:
    // the vendor it replaced and what that cost, until the university says
    // that can be public.
    slug: 'net-price-calculator',
    name: 'Net Price Calculator',
    eyebrow: 'Made at work · online now',
    summary:
      'The University of Idaho’s calculator that tells a family what a year there will really cost them.',
    image: '/images/websites/net-price-calculator.webp',
    imageAlt:
      'The University of Idaho Net Price Calculator results screen: an estimated net price of $15,616 a year, from a $30,791 cost of attendance less $15,175 in gift aid.',
    imageWidth: 1200,
    imageHeight: 750,
    parts: [
      {
        kind: 'App',
        heading: 'The calculator',
        href: 'https://banner.uidaho.edu/net-price-calculator/index.html',
        linkLabel: 'Try the calculator',
        image: '/images/websites/net-price-calculator-phone.webp',
        imageAlt:
          'The calculator on a phone, after the first step: a 3.60 GPA earns the Go Idaho Excellence Award of $4,000 a year, with Idaho’s state scholarships below it.',
        imageWidth: 780,
        imageHeight: 1688,
        what: 'A family answers a few questions and sees what a year at the University of Idaho would cost after scholarships and grants.',
        body: 'Every college in the United States that takes federal student aid has to offer one of these. I built the university’s own, at my day job, so it belongs to the university. It takes about three minutes, and the scholarships a student qualifies for appear after the first step.',
        bullets: [
          'It asks three sets of questions: the student’s grades and where they live, their family situation, and the family’s money.',
          'The need-based part follows the federal government’s own formula for 2026–27, the Student Aid Index. It covers students who rely on their parents and students who don’t, with or without people of their own to support.',
          'It knows the university’s scholarships: the Go Idaho awards by grade point average, National Merit, the Western Undergraduate Exchange discount for students from 20 western states and territories, and awards for transfer students.',
          'Every figure it uses, from tuition to each award, is kept in one list, so a new year means changing that list and nothing else.',
          'A set of 23 checks on the aid math had to pass after every change, so no change to the screens could quietly change what a family is told.',
          'Nothing a family types leaves their device. It never asks for a name or a Social Security number, and a link to share an estimate carries only the school answers, never income.',
          'A comparison with what similar families usually pay is built in, but it stays switched off until the university supplies real figures, so it never shows a made-up number.',
        ],
        receipts: [
          { value: '3 min', label: 'To an estimate, in three short steps' },
          {
            value: '23',
            label: 'Checks on the aid math, run after every change',
          },
          { value: '0', label: 'Answers that ever leave the family’s device' },
        ],
      },
    ],
  },
  {
    // The look this site had before Kiru, kept online as a working copy built
    // from its own code (scripts/archive-site.mjs → public/archive/notebook).
    // Facts from the Notebook pull request (#105) and its DESIGN.md.
    slug: 'notebook',
    name: 'The Notebook design',
    eyebrow: 'This site, before Kiru · online now',
    summary:
      'How this website looked before its redesign, kept online exactly as it was.',
    image: '/images/websites/notebook.webp',
    imageAlt:
      'The Notebook design of this site. Handwritten headlines on white graph paper, a photo of Josh taped to the page and a yellow sticky note.',
    imageWidth: 1200,
    imageHeight: 750,
    parts: [
      {
        kind: 'Website',
        heading: 'The website',
        href: '/archive/notebook',
        linkLabel: 'See the old site',
        image: '/images/websites/notebook.webp',
        imageAlt:
          'The Notebook design of this site. Handwritten headlines on white graph paper, a photo of Josh taped to the page and a yellow sticky note.',
        imageWidth: 1200,
        imageHeight: 750,
        what: 'This website as it looked from September 28 to October 1, 2026. I kept a working copy online so I can go back and look at it.',
        body: 'The design was called Notebook. Every page sat on graph paper and every headline was handwritten. The copy is the old site itself, not pictures of it, so the menu, night mode and the links between its pages all still work.',
        bullets: [
          'Headlines were set in a handwriting typeface. Anything long, like a post, was set in a typeface made for reading on a screen.',
          'Anything you could press was blue. Underlines and marks were red.',
          'The graph paper, the tape, the sticky notes and the lined cards were all drawn by the page’s styles. None of them is a picture file.',
          'In night mode the paper turned dark slate and the sticky notes stayed yellow.',
          'The copy keeps the main pages, four posts and four Market Storm reports. A link to anything else opens the current site.',
          'Every page in the copy tells search engines not to list it, so searches still lead to the current pages.',
        ],
        receipts: [
          { value: '27', label: 'Pages kept in the working copy' },
          {
            value: '0',
            label: 'Picture files used for the paper, tape and sticky notes',
          },
          { value: '3', label: 'Typefaces: handwriting, reading and labels' },
        ],
      },
    ],
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/**
 * App slugs already covered by a project page above, so /about does not list
 * them twice and /built/<app-slug> hands over to the project page instead.
 */
export const PROJECT_APP_SLUGS: Record<string, string> = {
  'broom-blade': 'broom-blade',
  'samurai-kitchen': 'samurai-kitchen',
};

/** The page for an app slug — its project page when it has one. */
export function builtHref(appSlug: string): string {
  return `/built/${PROJECT_APP_SLUGS[appSlug] ?? appSlug}`;
}
