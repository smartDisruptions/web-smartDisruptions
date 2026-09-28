/**
 * The four projects that get their own page under /built.
 *
 * WHY THIS EXISTS: Josh's call, 2026-09-20. Broom & Blade is two separate
 * things — a game a family uses, and a website that explains it — and the
 * single highlight on /built was describing the game in its headline and the
 * website in its bullets. Same for The Pembroke File. So a project is now a
 * list of PARTS, each with its own address, its own description and its own
 * evidence. /built lists the parts; /built/<slug> describes them.
 *
 * VOICE: written for the average person. No analogies, no wordplay, no
 * sentence that has to be read twice. In-game names (Armory, Skill Grove) are
 * used as names only — never to carry the meaning of a sentence.
 *
 * FACTS: the website parts come from the verified /websites write-ups. The
 * game parts come from this repo's own records in src/data/apps.ts, written
 * when each shipped. Translated into plain words here, never widened. The
 * "no picture files" claim was re-checked against the live site on
 * 2026-09-20: 83,629 bytes, zero <img> tags, zero url() backgrounds.
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
};

export const projects: Project[] = [
  {
    slug: 'broom-blade',
    name: 'Broom & Blade',
    eyebrow: 'My own project · online now',
    summary:
      'Household chores turned into a game for kids, and the website that explains it.',
    image: '/images/websites/broom-blade.webp',
    imageAlt:
      'The Broom & Blade website. A candlelit hall under a night sky, with the name of the app in large gold letters.',
    imageWidth: 1200,
    imageHeight: 750,
    parts: [
      {
        kind: 'Game',
        heading: 'The game',
        href: 'https://broom-blade.vercel.app',
        linkLabel: 'Try the app',
        image: '/images/apps/broom-blade-1.webp',
        imageAlt:
          'The Broom & Blade chore board, showing the day’s chores as quests with rewards beside them.',
        imageWidth: 1200,
        imageHeight: 753,
        what: 'The app the family actually uses.',
        body: 'A parent puts the chores on a board. Every chore a child finishes pays out points and gold. One code signs the whole family in, so everyone shares the same board and each person has their own character.',
        bullets: [
          'Points move a child up through ranks as they go. Gold buys gear for their character in the shop.',
          'Every piece of gear and every prize has a short story attached, and you can only read it once you have earned the item. There are 67 of them.',
          'Marking a chore done takes a press and hold rather than a tap, so it cannot happen by accident. Clearing the whole board needs a password, so a child cannot wipe it.',
          'Finish every chore for the day and a merchant offers three boxes to choose from. One holds a reward, one a gift, and one a curse.',
          'Every fifth day with a clean board you get a choice: a bag of gold, or a box holding one of thirty items that can never be bought.',
          'It is free, needs no account, and installs on a phone like any other app. Every sound is made by the app itself, so there is nothing extra to download.',
        ],
        receipts: [
          {
            value: '67',
            label: 'Pieces of gear and prizes, each with its own story',
          },
          { value: '30', label: 'Items you can only win, never buy' },
          { value: 'Free', label: 'No account and no payment, on any phone' },
        ],
      },
      {
        kind: 'Website',
        heading: 'The website',
        href: 'https://web-broom-blade.vercel.app',
        linkLabel: 'See the website',
        image: '/images/websites/broom-blade.webp',
        imageAlt:
          'The Broom & Blade website. A candlelit hall under a night sky, with the name of the app in large gold letters.',
        imageWidth: 1200,
        imageHeight: 750,
        what: 'The page that explains the game, written for the kid who will play it.',
        body: 'The website is built to feel like the game rather than describe it. You can seal a quest on the page the same way you would in the app, turn gear cards over, and look along a shelf of prizes.',
        bullets: [
          'The website contains no picture files at all. The sky, the hills, the candles and the smoke are built by the page while it loads, in six layers that move separately as you scroll or move the mouse.',
          'Sealing a quest on the page takes a press and hold while a ring fills up, exactly as it does in the game.',
          'It does not give the game away. Six of the nine ranks stay hidden, gear you have not earned shows its back, most prizes stay dark, and one box never opens at all.',
          'There are things to find: a moon that grants a wish, candles you can blow out, dust to sweep up, a sleeping dragon, a rat in the footer, and a purse that counts the gold you pick up on the way down.',
          'Every sound is made by the page as you go, so nothing has to be downloaded. It works with a keyboard, and it calms its movement for anyone whose phone is set to reduce motion.',
        ],
        receipts: [
          {
            value: '81 KB',
            label: 'The size of the whole website, so it opens fast',
          },
          {
            value: '0',
            label: 'Pictures to load. The artwork is part of the page',
          },
          { value: '6', label: 'Layers that move separately as you scroll' },
        ],
      },
    ],
  },
  {
    slug: 'pembroke-file',
    name: 'The Pembroke File',
    eyebrow: 'My own project · online now',
    summary:
      'A mystery game you play in a browser tab, and the website that sells it.',
    image: '/images/websites/pembroke-file.png',
    imageAlt:
      'The Pembroke File website. A dark office lit by a single desk lamp.',
    imageWidth: 1200,
    imageHeight: 630,
    parts: [
      {
        kind: 'Game',
        heading: 'The game',
        href: 'https://app-field-office.vercel.app',
        linkLabel: 'Play the game',
        image: '/images/apps/field-office-1.png',
        imageAlt:
          'The Pembroke File game. A filing cabinet on a desk under a lamp, with a brass dial on the first drawer.',
        imageWidth: 1440,
        imageHeight: 1000,
        what: 'Five drawers, five puzzles, one stolen diamond.',
        body: 'A thirty-four carat diamond left a museum during three minutes of darkness, and the investigator who worked the case disappeared. He left his files locked in a cabinet. You open the drawers one at a time and work out what happened.',
        bullets: [
          'Every answer is somewhere in the papers you have already read. Nothing needs a guess or outside knowledge.',
          'The puzzles are things you handle rather than riddles. A lamp swings on its cable, a card tray jams, and one answer only appears when you shade a pencil over a blank notepad.',
          'One puzzle cannot be solved in fewer than seventeen moves. I had a program work that out before I released the game, so the number is checked rather than guessed.',
          'You can play the whole game using only a keyboard, and it remembers where you got to. A drawer you opened tonight is still open tomorrow.',
          'There is nothing to install and no account to make. The whole game is one file, so once the page has opened it keeps working even if your internet drops.',
        ],
        receipts: [
          { value: '0', label: 'Things to download, install or sign up for' },
          { value: '130 KB', label: 'The size of the whole game' },
          {
            value: '5',
            label: 'Drawers, each one a puzzle and a piece of the story',
          },
        ],
      },
      {
        kind: 'Website',
        heading: 'The website',
        href: 'https://web-pembroke-file.vercel.app',
        linkLabel: 'See the website',
        image: '/images/websites/pembroke-file.png',
        imageAlt:
          'The Pembroke File website. A dark office lit by a single desk lamp.',
        imageWidth: 1200,
        imageHeight: 630,
        what: 'The page that has to make someone want to play it.',
        body: 'The game is free and takes a few minutes to start, so the website only has one job: show enough of the room to make you curious, and load fast enough that you do not leave first.',
        bullets: [
          'The office moves as you scroll and dust drifts through the lamplight, so the page feels like the game before you have played it.',
          'All the artwork was cut down from 4.2 MB to 176 KB. It looks the same and opens far faster, which matters most on a phone.',
        ],
        receipts: [
          {
            value: '176 KB',
            label: 'The size of all the artwork, cut from 4.2 MB',
          },
          { value: '0', label: 'Steps between seeing the page and playing' },
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
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/**
 * App slugs already covered by a project page above, so /built does not list
 * them twice and /built/<app-slug> hands over to the project page instead.
 */
export const PROJECT_APP_SLUGS: Record<string, string> = {
  'broom-blade': 'broom-blade',
  'field-office': 'pembroke-file',
  'samurai-kitchen': 'samurai-kitchen',
};

/** The page for an app slug — its project page when it has one. */
export function builtHref(appSlug: string): string {
  return `/built/${PROJECT_APP_SLUGS[appSlug] ?? appSlug}`;
}
