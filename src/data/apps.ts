export interface App {
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  thumbnailUrl: string;
  screenshotUrls: string[];
  techStack: string[];
  category: string;
  status: 'live' | 'beta' | 'development';
  outcomes: string[];
  buildDate: string;
  hasFullBreakdown: boolean;
  buildPlanAvailable: boolean;
  liveUrl?: string;
}

export const apps: App[] = [
  {
    slug: 'samurai-kitchen',
    name: 'Samurai Kitchen',
    description:
      "A food truck's website, where customers order and pay online.",
    longDescription:
      "The ordering site for Samurai Kitchen, a Japanese food truck and catering business, live on its own domain since August 2026. The menu, prices, opening hours and sold-out items all come straight from the owner's Square account — the same system his kiosk runs on — so nothing on the site can go stale. Customers build a cart with the truck's own customisations, pick a pickup time drawn from the live hours, and pay through Square; checkout locks when the truck is closed and stops taking orders half an hour before it shuts. The owner connected his own Square account through OAuth, so no access key ever changed hands, and the catering section takes inquiries for events.",
    thumbnailUrl: '/images/apps/samurai-kitchen-thumbnail.png',
    screenshotUrls: [
      '/images/apps/samurai-kitchen-1.webp',
      '/images/apps/samurai-kitchen-2.png',
      '/images/apps/samurai-kitchen-3.png',
    ],
    techStack: [
      'Next.js',
      'React',
      'TypeScript',
      'Square API',
      'Neon Postgres',
      'Tailwind CSS',
    ],
    category: 'Commerce',
    status: 'live',
    outcomes: [
      "Live since August 2026 — real orders and real payments on the truck's own domain",
      "Menu, prices, hours and sold-outs read live from the owner's Square account, refreshed every minute",
      'Checkout locks outside opening hours and stops 30 minutes before close; scheduled pickups hold until due',
      'Owner connected his own Square account via OAuth — tokens encrypted at rest, renewed automatically',
    ],
    buildDate: '2025-02',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: 'https://samuraikitchencatering.com',
  },
  {
    slug: 'pomodoro-timer',
    name: 'Pomodoro Timer',
    description:
      'A timer that splits work into short bursts with breaks in between, and keeps a record of what you got done.',
    longDescription:
      'You set a timer, work until it rings, then take a break. This app keeps track of that for you. Attach a task to each session so you can see where the time actually went, and a chart of the last twelve weeks shows which days you worked and which you missed. There are ten badges to unlock and a streak to keep up. You can change how long the work and break periods run, play a background sound, and put the timer full screen so nothing else is on show. After each session you can rate how well it went. Everything stays on your own device, and you can download the lot as a file whenever you want.',
    thumbnailUrl: '/images/apps/pomodoro-thumbnail.png',
    screenshotUrls: [
      '/images/apps/pomodoro-1.png',
      '/images/apps/pomodoro-2.png',
      '/images/apps/pomodoro-3.png',
    ],
    techStack: [
      'Next.js',
      'React',
      'TypeScript',
      'Tailwind CSS',
      'Zustand',
      'shadcn/ui',
    ],
    category: 'Productivity',
    status: 'live',
    outcomes: [
      'A chart of the last twelve weeks shows the days you worked and the days you missed, so a pattern is easy to spot.',
      'Ten badges and a running streak give you a reason to come back tomorrow.',
      'You rate each session afterwards, so you can see whether your focus is actually getting better.',
      'A background sound and a full screen mode keep everything else off the screen while the timer runs.',
    ],
    buildDate: '2025-03',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: 'https://app-pomodoro-blush.vercel.app',
  },
  {
    slug: 'spacex-mars',
    name: 'SpaceX Mars Transfer Simulation',
    description:
      'Shows the path a spacecraft takes from Earth to Mars. You can change the settings and watch the trip play out.',
    longDescription:
      'Earth and Mars are only close enough for a trip every couple of years, and the route between them is a long curve rather than a straight line. This shows both. The planets move at their real speeds and distances, worked out from real orbital calculations rather than drawn by hand, so a launch only becomes possible when the two planets line up properly. You can speed the clock up or slow it down, zoom in and out, turn the orbit lines on and off, and click a planet to see where it is and how fast it is going. A log lists every launch, journey and arrival as they happen.',
    thumbnailUrl: '/images/apps/spacex-mars-thumbnail.png',
    screenshotUrls: [
      '/images/apps/spacex-mars-1.png',
      '/images/apps/spacex-mars-2.png',
      '/images/apps/spacex-mars-3.png',
    ],
    techStack: [
      'HTML5 Canvas',
      'Vanilla JavaScript',
      'CSS3',
      'Orbital Mechanics',
    ],
    category: 'Simulation',
    status: 'live',
    outcomes: [
      'The planets move at their true speeds and distances, so a launch only becomes possible when they line up, the same as in real life.',
      'You can speed the clock up, slow it down, zoom in and out, and click a planet to see where it is and how fast it is going.',
      'A log lists every launch, every journey and every arrival as they happen.',
      'The planet surfaces are drawn by the page rather than photographed, and it works with a mouse or a finger.',
    ],
    buildDate: '2025-03',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: 'https://app-spacex-mars.vercel.app',
  },
  {
    slug: 'cloth-simulator',
    name: 'Cloth Simulator',
    description:
      'A sheet of cloth you can pull, tear, burn and blow around with wind.',
    longDescription:
      'A piece of cloth hanging on the screen that behaves like real fabric. It is built from a grid of points joined to their neighbours, and everything it does follows from that. It sags under its own weight, swings when you pull it, and rips when you pull too hard. Drag it with the mouse, tear a hole in it, turn the wind on, or set it alight and watch the flames travel along the threads. There are ready made setups to try, including a flag, a curtain, a hammock, a spider web and a cape, and you can switch the material between cotton, silk, denim and chain, which changes how heavy and how stretchy it is.',
    thumbnailUrl: '/images/apps/cloth-simulator-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/cloth-simulator-1.png',
      '/images/apps/cloth-simulator-2.png',
      '/images/apps/cloth-simulator-3.png',
    ],
    techStack: ['HTML5 Canvas', 'Vanilla JavaScript', 'CSS3', 'Physics Engine'],
    category: 'Simulation',
    status: 'live',
    outcomes: [
      'The cloth is not an animation. Every point is worked out as you watch, sixty times a second, with no outside code doing the job.',
      'Five things to do to it: grab it, tear it, burn it, pin it, and blow wind at it.',
      'Ready made setups to try: a flag, a curtain, a hammock, a spider web and a cape, each hanging from different points.',
      'Four materials to switch between. Cotton, silk, denim and chain each have their own weight, stiffness and tearing point.',
    ],
    buildDate: '2025-03',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: 'https://app-cloth-simulator.vercel.app',
  },
  {
    slug: 'ai-diary',
    name: 'AI Diary',
    description:
      'A private journal. It tracks your mood over time and has a companion you can talk to about what you wrote.',
    longDescription:
      'Write about your day the way you would in any notebook. The app reads it back and shows you things you would not spot yourself: how your mood moves over the weeks, which subjects keep coming up, and how your writing changes. There is also a companion you can talk to about an entry, and it can pull out the things you said you would do and turn them into a list. Everything you write is kept on your own device rather than on a server.',
    thumbnailUrl: '/images/apps/ai-diary-thumbnail.png',
    screenshotUrls: [
      '/images/apps/ai-diary-1.png',
      '/images/apps/ai-diary-2.png',
      '/images/apps/ai-diary-3.png',
    ],
    techStack: [
      'Next.js',
      'React',
      'TypeScript',
      'Tailwind CSS',
      'OpenRouter API',
      'Zod',
    ],
    category: 'Productivity',
    status: 'live',
    outcomes: [
      'A companion you can talk to about an entry. It can also pull out the things you said you would do and turn them into a list.',
      'A mood line across your entries shows how you have been over weeks, not just today.',
      'It builds a picture of your personality from your writing, using the five traits psychologists commonly measure.',
      'Everything you write is kept on your own device rather than on a server.',
    ],
    buildDate: '2025-03',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: 'https://app-ai-diary.vercel.app',
  },
  {
    slug: 'aureum-snake',
    name: 'AUREUM Snake',
    description:
      'The snake game you already know, in gold and black. Eat, grow, and do not hit anything.',
    longDescription:
      'The snake game you already know, dressed in gold and black. You steer a snake around a board eighteen squares across, eating to grow, and it ends when you run into a wall or into yourself. Catching food without pausing builds a chain that is worth more points, and there are ten ranks to climb across however many games you play. It remembers your best score. There is a pad of arrows on screen for phones, and every sound is made by the game as you play, so nothing extra has to load. The whole thing is one file.',
    thumbnailUrl: '/images/apps/aureum-snake-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/aureum-snake-1.png',
      '/images/apps/aureum-snake-2.png',
      '/images/apps/aureum-snake-3.png',
    ],
    techStack: ['HTML5', 'CSS3', 'Vanilla JavaScript', 'Web Audio API'],
    category: 'Game',
    status: 'live',
    outcomes: [
      'Eating without a break builds a chain worth more points, so there is a reason to keep moving.',
      'Ten ranks to climb, counted across every game you play rather than just this one.',
      'A pad of arrows on screen means it plays properly on a phone.',
      'Every sound is made by the game as you play, so nothing extra has to load.',
    ],
    buildDate: '2026-03',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: 'https://app-snake-smoky.vercel.app',
  },
  {
    slug: 'pebble-kart',
    name: 'Pebble Kart',
    description:
      'A kart racing game my son Gabe built himself, using the same AI tools I use.',
    longDescription:
      'This is the one thing on the site I did not build. My son Gabe did. I showed him how to ask an AI for a first working version of a game, and then how to keep asking for changes until it was the game he wanted. He did the rest himself. What he made is a kart race: you drive a kart around a track he designed, and it times your laps.',
    thumbnailUrl: '/images/apps/pebble-kart-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/pebble-kart-1.png',
      '/images/apps/pebble-kart-2.png',
      '/images/apps/pebble-kart-3.png',
    ],
    techStack: ['HTML5', 'TypeScript', 'Canvas', 'Web Audio API'],
    category: 'Game',
    status: 'live',
    outcomes: [
      'Gabe built it himself, from the first rough version to the finished one.',
      'The first version that could be played came out of a single request to an AI. Everything after that came from asking for changes.',
      'A kid ran the whole loop on his own: ask, try it, ask again.',
      'You drive a kart around a track he designed, and it times your laps.',
    ],
    buildDate: '2026-05',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: 'https://pebble-kart-ten.vercel.app',
  },
  {
    slug: 'field-office',
    name: 'The Pembroke File',
    description:
      'A mystery game. You search a locked filing cabinet, solve five puzzles, and work out who took a diamond.',
    longDescription:
      'A noir mystery you solve by reading the case. The Pembroke Diamond — thirty-four carats — left the Ashford Museum in three minutes of dark, and the insurance investigator who worked the claim vanished, leaving his file locked in a cabinet: five drawers behind a brass dial, a letter lock, an alarm panel, a wire board, and a lever. Every answer is written somewhere in the documents you have already opened, and each drawer turns the case — an inside job, a rehearsed route, a canvass that came back empty, an appraisal that proves the stone was glass. Physical puzzles gate the locks: the museum’s shuffled night-reel plates, the investigator’s reconstruction torn to twelve pieces, a jammed card tray, a sabotaged lamp circuit — and a pencil rubbing that raises the one name he never dared file out of a blank desk pad. Verlet chain physics, synthesized Web Audio, keyboard paths for every puzzle, progress that survives reloads — all in a single HTML file with zero dependencies.',
    thumbnailUrl: '/images/apps/field-office-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/field-office-1.png',
      '/images/apps/field-office-2.png',
      '/images/apps/field-office-3.png',
    ],
    techStack: [
      'HTML5',
      'Canvas',
      'Vanilla JavaScript',
      'Web Audio API',
      'CSS3',
    ],
    category: 'Game',
    status: 'live',
    outcomes: [
      'A five-act mystery where every clue is diegetic — the puzzles are the case artifacts',
      'Sliding-block and 8-puzzle boards generated and difficulty-verified by breadth-first search',
      'A pencil-rubbing canvas where the final name is never drawn — only revealed by shading around it',
      'Zero-dependency single-file build with keyboard access and reduced-motion support throughout',
    ],
    buildDate: '2026-08',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: 'https://app-field-office.vercel.app',
  },
  {
    slug: 'grove',
    name: 'Grove',
    description:
      'A quiet puzzle game. Put matching tiles together on a honeycomb board and watch them grow into something bigger.',
    longDescription:
      'A slow puzzle game on a honeycomb board. Put two matching tiles next to each other and they join into the next thing up. You start with a seed and work up through twelve stages to a forest and beyond, and the colours of the board change as you climb, from dark soil to late afternoon light to silver. Joining several in a row is worth more. It remembers your best score and the furthest you have reached. It plays on a phone, works with no internet, and is one file.',
    thumbnailUrl: '/images/apps/grove-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/grove-1.png',
      '/images/apps/grove-2.png',
      '/images/apps/grove-3.png',
    ],
    techStack: ['HTML5', 'SVG', 'Vanilla JavaScript', 'CSS3'],
    category: 'Game',
    status: 'live',
    outcomes: [
      'Twelve stages to climb, each with its own colours, so the board looks different the further you get.',
      'Joining several tiles in a row is worth more than joining them one at a time.',
      'It remembers your best score and the furthest stage you have reached.',
      'It plays on a phone, works with no internet connection, and is a single file.',
    ],
    buildDate: '2026-04',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: 'https://app-grove.vercel.app',
  },
  {
    slug: 'going-traveling',
    name: 'Going Traveling',
    description:
      'A twelve day plan for a trip to Japan. Two versions of each day to choose between, a budget that changes with the size of your group, and an allergy list you set yourself.',
    longDescription:
      'A plan for twelve days across Tokyo, Hakone and Kyoto, built around a problem every travel plan has: the best thing to do next is usually the thing nearest to where you already are. So every day comes with two complete plans, and the stops in each were picked for being close together. If you want to swap something out, each alternative tells you how many extra minutes of travel it will cost from where that day already has you, before you pick it rather than after. There are 106 places in it, each with a map link and a review link that were checked rather than assumed. The allergy section is yours to set: pick from eleven things you cannot eat and the page rewrites itself around them, down to a card written in Japanese you can hand across a counter. The budget is kept in yen, converts at whatever rate you set, and changes with how many people are going, so travelling alone correctly costs more per person than travelling as a pair. It is one file with 91 photographs inside it, and it works with no internet.',
    thumbnailUrl: '/images/apps/going-traveling-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/going-traveling-1.webp',
      '/images/apps/going-traveling-2.webp',
      '/images/apps/going-traveling-3.webp',
    ],
    techStack: ['HTML5', 'Vanilla JavaScript', 'CSS3', 'SVG', 'Node.js'],
    category: 'Travel',
    status: 'live',
    outcomes: [
      'Pick from eleven things you cannot eat and the whole page rewrites itself around them, down to a card written in Japanese you can hand across a counter.',
      'Every alternative shows how many extra minutes of travel it costs before you choose it, so a bad choice is visible in advance.',
      'All 106 places carry a map link and a review link that were checked, not assumed.',
      'It is one file with 91 photographs inside it, and it needs no internet once it has opened.',
    ],
    buildDate: '2026-08',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: 'https://going-traveling.vercel.app',
  },
  {
    slug: 'broom-blade',
    name: 'Broom & Blade',
    description:
      'Household chores turned into a game. Chores become quests that pay points and gold, and everyone in the family has their own character.',
    longDescription:
      'Built for my household: a candlelit guild hall where the chores hang as parchment quest slips on a board. Completing one pays XP and gold — XP climbs the hero through titles from Dust Squire to Legend of the Loom, gold buys avatar gear in the Armory, and every piece of gear carries a hidden flavor line and origin tale you can only read once you own it. Each family member runs their own hero on the same board; a Tourney Board compares the party on a radar crest and ranked duel bars, and a Skill Grove grows a glowing rune for every chore you master. Sealing a quest takes a held press, not a tap, so a scroll can never claim one by accident. Clear every daily quest and a hooded merchant offers three mystery boxes — a fortune, a gift, or a curse — and every fifth clean-sweep day he bows with a choice: a purse of gold, or a box holding one of thirty relics that cannot be bought, from a booger to Mjölnir. It ships as one HTML file with zero dependencies, installs to the home screen as a PWA, and synthesizes every sound with the Web Audio API.',
    thumbnailUrl: '/images/apps/broom-blade-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/broom-blade-1.webp',
      '/images/apps/broom-blade-2.webp',
      '/images/apps/broom-blade-3.webp',
    ],
    techStack: ['HTML5', 'Vanilla JavaScript', 'CSS3', 'SVG', 'Web Audio API'],
    category: 'Productivity',
    status: 'live',
    outcomes: [
      'Chores become quests with XP, gold, titles, and per-chore skill ranks — a full progression loop in a single HTML file',
      'Hold-to-seal completion and a password-gated reset make it safe in a kid\u2019s hands without an approval queue',
      'Every one of 67 items carries hidden flavor text and an origin tale, revealed only once earned',
      'A nightly mystery-box chance and a five-day clean-sweep milestone turn a finished board into a ritual worth keeping',
    ],
    buildDate: '2026-08',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: 'https://broom-blade.vercel.app',
  },
  {
    slug: 'lantern-night',
    name: "Kiru's Lantern Night",
    description:
      'Kiru throws spirit flames into festival lanterns on a moonlit rooftop. Every lantern you light bursts into fireworks on the beat of the music.',
    longDescription:
      'It is the night of a festival and the lanterns have gone dark. Kiru stands on a rooftop with 30 spirit flames to light them with. You drag up to throw: the longer the drag, the farther the flame flies, and it only catches if it drops into the top of a lantern. Every lantern you light bursts into fireworks on the beat, and lighting every lantern on a rope sends the whole rope up into the sky. Light several in a row and the band joins in, from a koto and a soft drum up to the full festival band. When the flames run out there is a finale of fireworks, and the night’s score is tallied on a paper slip. The game plays all of its own music while you play: koto, shamisen, taiko drums and a bamboo flute, with no recordings to download. It plays on a phone held either way up and on a computer, with touch, a mouse, the keyboard or a game controller. It remembers your best score, and it is one file.',
    thumbnailUrl: '/images/apps/lantern-night-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/lantern-night-1.webp',
      '/images/apps/lantern-night-2.webp',
      '/images/apps/lantern-night-3.webp',
    ],
    techStack: ['HTML5', 'Canvas', 'Vanilla JavaScript', 'Web Audio API'],
    category: 'Game',
    status: 'live',
    outcomes: [
      'Every lantern you light sets off fireworks in time with the music, and lighting a whole rope sends it up into the sky.',
      'The music builds as you play well, from a koto and a soft drum up to the full festival band, and all of it is made by the game as you play.',
      'It plays properly on a phone held either way up and on a computer, with touch, a mouse, the keyboard or a game controller.',
      'Eight AI agents built it side by side, each owning one part of the game. Two more went over their work and caught 13 bugs and 12 things that looked wrong before it went live.',
    ],
    buildDate: '2026-10',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: '/games/lantern-night',
  },
  {
    slug: 'night-parade',
    name: "Kiru's Night Parade",
    description:
      'Yokai rise out of nine spirit wells in a moonlit temple garden. Tap a well and Kiru leaps there and cuts whatever comes up in two.',
    longDescription:
      'It is the night of the Hyakki Yagy\u014d, the parade of a hundred demons, and the yokai are coming up through nine spirit wells in a moonlit temple garden. Tap a well and Kiru leaps there and cuts whatever is rising out of it in two. Most of them are small oni worth a point and the golden kitsune are worth three, but two are friends you must not cut: the Moon Rabbit, and a tanuki hiding behind an oni mask. A round lasts 75 seconds and speeds up as it goes. Along the way come three of four events (a golden night, a new moon where only their eyes show, a moon-viewing night full of rabbits, and a parade round the wells), powers that slow time, double your points or send shadow clones down the row, and a meter that fills into BLUE FIRE. In the last twelve seconds the Parade Lord rises from the centre well, and he blocks every third strike with his club: wait for him to bring it down, and the first strike in the opening is a counter. The game plays all of its own music and sound while you play, with no recordings to download. It plays on a phone held either way up and on a computer, with touch, a mouse or the keyboard. It remembers your best score and the blades you unlock, and it is one file.',
    thumbnailUrl: '/images/apps/night-parade-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/night-parade-1.webp',
      '/images/apps/night-parade-2.webp',
      '/images/apps/night-parade-3.webp',
    ],
    techStack: ['HTML5', 'Canvas', 'Vanilla JavaScript', 'Web Audio API'],
    category: 'Game',
    status: 'live',
    outcomes: [
      'Every tap is a cut: Kiru leaps to the well and his blade lands within a quarter of a second, and a tap made in time always counts.',
      'The Parade Lord blocks every third strike, so the last fight of each round is a duel: wait for his club to come down, then counter.',
      'It plays properly on a phone held either way up and on a computer. Turned sideways, the garden spreads out and the wells get bigger.',
      'Ten AI agents built it: eight each owned one part of the game, a ninth played it hunting for problems, and a tenth checked every fix before it went live.',
    ],
    buildDate: '2026-10',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: '/games/night-parade',
  },
  {
    slug: 'tokaido-run',
    name: "Kiru's T\u014dkaid\u014d Run",
    description:
      'Kiru runs the old road from Edo to Ky\u014dto, from morning to night. Swipe to change lanes, jump and roll, and tap to cut whatever gets in his way.',
    longDescription:
      'The T\u014dkaid\u014d was the great road of Edo Japan, from Nihonbashi to Ky\u014dto through 53 post stations, and Kiru runs all of it. Swipe left or right to change lanes, up to jump and down to roll, and tap to cut. Paper sh\u014dji walls, barrels and bamboo stakes split in two along the line of the blade, and so do lantern ghosts and diving tengu. A rival ninja leaves a log behind when cut, an oni bursts into beans and runs off crying, and fox fires fill the Ki meter for a Bolt Dash. Stumble once and an Edo constable and his shiba inu give chase; stumble again and he has you. The road runs from morning to night through five places: a post town, a hillside of a thousand vermilion torii, a bamboo grove, a mountain temple in autumn and a night festival, with rain and snow at the stations Hiroshige painted that way. Along it come a lucky cat that pulls in coins, a paper crane to ride over the rooftops and a daruma for double score. When the run ends, the game writes it up as a farewell haiku. It is drawn in 3D in the browser and makes all of its own music as you play, taiko and shamisen, with no recordings to download. It plays on a phone held either way up and on a computer, with touch, a mouse, the keyboard or a game controller, and it is one file.',
    thumbnailUrl: '/images/apps/tokaido-run-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/tokaido-run-1.webp',
      '/images/apps/tokaido-run-2.webp',
      '/images/apps/tokaido-run-3.webp',
    ],
    techStack: ['HTML5', 'Three.js', 'WebGL', 'Web Audio API'],
    category: 'Game',
    status: 'live',
    outcomes: [
      'A 3D runner in one file: the road, the towns, Kiru, every texture and every sound are made in the browser as it loads.',
      'Cutting is the point: walls, barrels and bamboo stakes split in two along the line of the blade, and every yokai cut gets a brush stroke across the screen.',
      'Every stretch of road is checked before it is laid down: a solver proves it can be run from any lane, and 10,000 simulated stretches found none that could not.',
      'Ten AI agents built it side by side, each owning one part of the game. After the first play, the torii hillside was rebuilt so it no longer flashes red at speed, and a flicker test measured all five places against the photosensitivity limit.',
    ],
    buildDate: '2026-10',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: '/games/tokaido-run',
  },
  {
    slug: 'neo-dojo-survivors',
    name: 'Neo Dojo Survivors',
    description:
      'Tengu-9, the mech samurai of the Neo Dojo, holds a neon rooftop for fifteen minutes against six rogues and their hordes. You only move him: his weapons fire on their own.',
    longDescription:
      'A horde game in the style of Vampire Survivors, starring Tengu-9 from the Neo Dojo Cast, the heroes and rogues I drew on Kiru\u2019s rig. You only steer him, his weapons fire on their own, and for fifteen minutes the dojo roof fills with hundreds of rogues. Each act belongs to one rogue, and its minions are its jokes: buzzwords that pivot when you hit them, pitch decks shouting 10\u00d7, porcelain deepfakes of Tengu-9 that bow to him, flocks of em-dashes and six-fingered hands. At the end of each act the rogue arrives as its boss. Bagu splits every time it is patched, Bazu runs a keynote with sweeping spotlights, Kusarigumo fences you in and charges an exit fee, and Emperor Kemuri hides behind a COMING SOON shield whose release date slips with every pillar you cut. Each level up offers a new weapon or an upgrade, and from six minutes on, a weapon at its top level with its partner upgrade turns into something bigger when you open a chest. The game makes all of its own music as you play, taiko drums and synthesizers that build with each act, with no recordings to download. It plays on a phone with one thumb and on a computer with the keyboard, a mouse or a game controller, and it is one file.',
    thumbnailUrl: '/images/apps/neo-dojo-survivors-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/neo-dojo-survivors-1.webp',
      '/images/apps/neo-dojo-survivors-2.webp',
      '/images/apps/neo-dojo-survivors-3.webp',
    ],
    techStack: ['HTML5', 'WebGL2', 'Vanilla JavaScript', 'Web Audio API'],
    category: 'Game',
    status: 'live',
    outcomes: [
      'Hundreds of enemies on screen at once, drawn in WebGL with no game engine and no libraries, and every weapon lights the ground in its own colour.',
      'Six acts and six bosses, each one a rogue from the Neo Dojo Cast with a fight built around its joke.',
      'Ten AI agents built it side by side, each owning one part of the game: the hero, the horde, the bosses, two sets of weapons, levelling up, the world, the effects, the music and the screens.',
      'After the first play it was rebalanced with an autopilot that plays whole runs in fast-forward. It used to reach level 168 by the end; now it reaches about 42, and the last minutes fight back.',
    ],
    buildDate: '2026-10',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: '/games/neo-dojo-survivors',
  },
  {
    slug: 'path-not-taken',
    name: 'Path Not Taken (Pre Alpha)',
    description:
      'A rhythm duel I am still building. These are the first gameplay tests: you face a greybox attacker on three film-score battles, and one miss is death.',
    longDescription:
      'A first-person rhythm duel, and a pre-alpha: what is here are the first gameplay tests, with a greybox attacker standing in for the real one. Every glowing line that falls down the three lanes is a hit in the music. Dodge left, down or right as it touches its pad, hold a blue line for bullet time while one slow blow crawls in, dodge a burst of quick blows after an orange one, and strike when the red button comes up. One miss is death, and a death skips the intro, so you are straight back in. The three songs are short film-score battle cues I made with ElevenLabs Music: about ten seconds of intro, a minute of fighting and ten seconds to close. The story comes later.',
    thumbnailUrl: '/images/apps/path-not-taken-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/path-not-taken-1.webp',
      '/images/apps/path-not-taken-2.webp',
      '/images/apps/path-not-taken-3.webp',
    ],
    techStack: ['HTML5', 'Canvas', 'Vanilla JavaScript', 'Web Audio API', 'ElevenLabs Music'],
    category: 'Game',
    status: 'development',
    outcomes: [
      'Every tile sits on a hit in the recording. I measured each song\u2019s tempo to a thousandth of a beat and its hits slot by slot, and the chart refuses a tile where the music has nothing to hit.',
      'Three songs at 140, 150 and 162 BPM, each shaped as about ten seconds of intro, a minute of play and ten seconds of exit. A death restarts the song two seconds before the first tile.',
      'One miss is death, judged within 200 ms on the forgiving setting, with a tap-along calibration for Bluetooth headphones and slow screens.',
      'Pre-alpha, and it says so: the attacker is a greybox stand-in, and the game is still being built.',
    ],
    buildDate: '2026-10',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: '/games/path-not-taken',
  },
  /*
   * The Broom & Blade Arcade: the five machines of Broom & Blade's games room,
   * free to play here. The games themselves live in Josh's vault
   * (Tools/broom-blade/<booth>/ and Tools/kid-volt/); public/games/<slug> holds
   * the site's copy, rewritten for free play.
   */
  {
    slug: 'hoop-quest',
    name: 'Hoop Quest',
    description:
      'Flick basketballs at a hoop in a candlelit cellar. Thirty balls, a basket that starts moving after ten, and three points for a shot that clears the backboard.',
    longDescription:
      'Hoop Quest started the fair in Broom & Blade, the chore game I built for my family: it felt like a carnival game, so the guild hall grew a booth for each game. You drag a ball up off the rack and flick it at the hoop: thirty balls, two points a basket, and three for a Sky Shot thrown from down low that flies over the backboard. The basket holds still for the first ten balls, then starts to slide from side to side. Three baskets in a row set the ball on fire, eight turn the fire blue, and the callouts climb from NICE! to LEGENDARY!. Pip the guild mouse rides the top of the backboard: he watches the ball, cheers every make, backflips for a swish, waves a pennant on a streak and hides his eyes when you miss. A secret Space Shot, flicked so hard it leaves the top of the screen and still drops in, is worth five and turns Pip into a giant hype man. Every sound is made by the game as you play, with no recordings, and the whole game is one file. Here every round is free.',
    thumbnailUrl: '/images/apps/hoop-quest-thumbnail.webp',
    screenshotUrls: ['/images/apps/hoop-quest-1.webp', '/images/apps/hoop-quest-2.webp', '/images/apps/hoop-quest-3.webp'],
    techStack: ['HTML5', 'Canvas', 'Vanilla JavaScript', 'Web Audio API'],
    category: 'Game',
    status: 'live',
    outcomes: [
      'Thirty balls: two points a basket, three for a Sky Shot over the backboard and five for the secret Space Shot, so a perfect round is 150.',
      'The basket holds still for the first ten balls and then slides; three baskets in a row set the ball on fire, and eight turn the fire blue.',
      'Every shot leaves the hand at the same power, so the skill is your aim and how far up you carry the ball: my own tuning, set after I made 20 of 30 on my phone.',
      'Every sound, from the swish and the clank of the rim to Pip’s squeaks, is made by the Web Audio API as you play, with no recordings.',
    ],
    buildDate: '2026-09',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: '/games/hoop-quest',
  },
  {
    slug: 'kid-volt-knockout',
    name: 'Kid Volt Knockout',
    description:
      'A boxing game I built for phones. Kid Volt vs Disco Danny on a rooftop: he punches on the beat, a sparkle shows where he’s open, and three knockdowns is a TKO.',
    longDescription:
      'A boxing game I built for phones, from a study of the 16-bit boxing classics. Kid Volt fights Disco Danny on a rooftop dance floor. Danny throws every punch on the beat of a disco loop, and during a real wind-up a sparkle marks where he’s open. Punch that spot to counter and charge your super: one charge is a Volt Hook, three is a Supernova. Dodge, duck or hold block, hit him as he sways back to center when he’s dizzy, and put him down three times for a TKO before the fight clock runs out. Every pixel is drawn into a 120 by 140 frame, and every sound is synthesised in the browser.',
    thumbnailUrl: '/images/apps/kid-volt-knockout-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/kid-volt-knockout-1.webp',
      '/images/apps/kid-volt-knockout-2.webp',
      '/images/apps/kid-volt-knockout-3.webp',
    ],
    techStack: ['HTML5', 'Canvas', 'Vanilla JavaScript', 'Web Audio API'],
    category: 'Game',
    status: 'live',
    outcomes: [
      'Danny punches on the beat: 104 beats a minute to start, 116 after his first knockdown and 128 for the last dance.',
      'A counter charges half a super, and saving three charges unlocks the Supernova.',
      'The fight clock starts at 3:00, runs one and a half times faster than real time, and stops while Danny is dizzy.',
      'Three knockdowns is a TKO, and your fastest win is kept on your device as your best KO time.',
    ],
    buildDate: '2026-09',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: '/games/kid-volt-knockout',
  },
  {
    slug: 'whack-a-dust-bunny',
    name: 'Whack-a-Dust-Bunny',
    description:
      'A booth from the chore game I built for my family. Bonk dust bunnies for 75 seconds, grab the golden ones, survive the Horde, and whatever you do, don’t bonk Pip.',
    longDescription:
      'At home this is a booth in Broom & Blade, the chore game I built for my family: a finished chore earns a ticket, and a ticket buys a round. Here every round is free. Dust bunnies pop out of nine holes in a candlelit cellar and you have 75 seconds to bonk them. Golden ones are worth three, helmets take two bonks, and two bonks in a flash is a DOUBLE BONK. Sneezy bunnies, hoppers, mama bunnies, socks and three surprise events a round keep it changing, your bonks fill the sign for FEVER, and the last twelve seconds bring the Horde. Pip pops up too. Don’t bonk Pip.',
    thumbnailUrl: '/images/apps/whack-a-dust-bunny-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/whack-a-dust-bunny-1.webp',
      '/images/apps/whack-a-dust-bunny-2.webp',
      '/images/apps/whack-a-dust-bunny-3.webp',
    ],
    techStack: ['HTML5', 'Canvas', 'Vanilla JavaScript', 'Web Audio API'],
    category: 'Game',
    status: 'live',
    outcomes: [
      'A round is 75 seconds across nine holes, and the last 12 are the frenzy, when the Horde arrives: eight bonks turn it to dust for a 10-point bonus.',
      'Twenty bonks fill the sign (a broken streak knocks four off), and tapping it gives six seconds of FEVER, when every bunny is gold.',
      'Each round plays three surprise events drawn from four: Golden Rush, Lights Out, Pip’s Cousins and the Conga Line.',
      'Five brooms, four of them unlocked by playing well, from bonking 50 bunnies in a round to a streak of 40.',
    ],
    buildDate: '2026-09',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: '/games/whack-a-dust-bunny',
  },
  {
    slug: 'ring-toss',
    name: 'Ring Toss',
    description:
      'Flick rings onto twenty bottles under a striped awning. Thirty rings, a golden bottle worth ten, bonuses for rows, columns and corners, and a BLACKOUT for all twenty.',
    longDescription:
      'A carnival ring toss, the second booth at the Broom & Blade fair, and Pip runs it. You grab a ring off the peg and flick it at a table of twenty bottles: a soft flick lands up front, a hard one reaches the back row, and the slant of the flick carries it sideways. The rows are worth two to five, one bottle is golden and worth ten, and each bottle takes one ring. A full row pays five times its value, a column pays 15 and the four corners 20. Three rows in, the string lights go rainbow and a heartbeat starts under the last bottles. Ring all twenty and the round ends in a BLACKOUT: the lights cut out, a spotlight snaps on, the word stamps in letter by letter, and the fair goes wild while Pip screams. Every sound is made by the game as you play, and the whole game is one file. Here every round is free.',
    thumbnailUrl: '/images/apps/ring-toss-thumbnail.webp',
    screenshotUrls: ['/images/apps/ring-toss-1.webp', '/images/apps/ring-toss-2.webp', '/images/apps/ring-toss-3.webp'],
    techStack: ['HTML5', 'Canvas', 'Vanilla JavaScript', 'Web Audio API'],
    category: 'Game',
    status: 'live',
    outcomes: [
      'Twenty bottles in four rows worth 2, 3, 4 and 5, plus a golden bottle worth 10 that is never in the front row.',
      'A full row pays five times its value, a column 15 and the four corners 20, so the bonuses can outscore the bottles.',
      'Ringing all twenty ends the round in a BLACKOUT worth 50, plus 5 for every ring you didn’t need, so a perfect round is 342.',
      'The blackout is a six-second show: the lights cut out, a spotlight snaps on, the word stamps in letter by letter, then fireworks, disco beams and confetti.',
    ],
    buildDate: '2026-09',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: '/games/ring-toss',
  },
  {
    slug: 'milk-bottle-knockdown',
    name: 'Milk Bottle Knockdown',
    description:
      'Twenty balls, three pyramids of milk bottles. Clear a pyramid with one ball for a CLEAN KNOCK, find the secret golden bottle, and clear the whole shelf.',
    longDescription:
      'The carnival milk-bottle throw from the Broom & Blade fair. You drag a ball up and flick it at three pyramids of six bottles: a soft flick hits low, a hard one hits high, and too soft falls short. A bottle only counts once it leaves the shelf. One ball through a whole pyramid is a CLEAN KNOCK, one bottle is secretly golden, and clearing all three pyramids lights the lamps for a FULL SHELF. The bottles fly in 3D: they bowl each other over, land on the shelf or drop to the booth floor, and a hard landing smashes them into glass and milk. Now and then one flies straight at you and cracks the screen, and a clean knock rolls an instant replay at a third of the speed. Pip watches from the counter and ducks when bottles come his way. Every sound is made by the game as you play, and the whole game is one file. Here every round is free.',
    thumbnailUrl: '/images/apps/milk-bottle-knockdown-thumbnail.webp',
    screenshotUrls: [
      '/images/apps/milk-bottle-knockdown-1.webp',
      '/images/apps/milk-bottle-knockdown-2.webp',
      '/images/apps/milk-bottle-knockdown-3.webp',
    ],
    techStack: ['HTML5', 'Canvas', 'Vanilla JavaScript', 'Web Audio API'],
    category: 'Game',
    status: 'live',
    outcomes: [
      'Twenty balls at three pyramids of six: a bottle knocked off the shelf is a point, and one ball through a whole pyramid is a CLEAN KNOCK worth 5 more.',
      'One of the first eighteen bottles is secretly golden and worth 5, and you only find out which when it falls.',
      'Clearing all three pyramids lights the lamps for a FULL SHELF worth 10, and a perfect round is 284.',
      'A CLEAN KNOCK or a FULL SHELF rolls an instant replay at a third of the speed, and about one direct hit in seven (twice a round at most) sends a bottle into the screen.',
    ],
    buildDate: '2026-09',
    hasFullBreakdown: false,
    buildPlanAvailable: false,
    liveUrl: '/games/milk-bottle-knockdown',
  },
];

export function getAppBySlug(slug: string): App | undefined {
  return apps.find((app) => app.slug === slug);
}

/**
 * The Arcade line-up, in cabinet order. Josh's call on the ordering.
 *
 * Since 2026-10-05 the Arcade's front room is Kiru's games and Neo Dojo
 * Survivors, right below them (Josh's call); every other game moved to the
 * archive at /games/archive, linked from the bottom of /games. Path Not Taken,
 * a rhythm duel in pre-alpha, is the last cabinet before the archive's door
 * (Josh's call, the same day).
 *
 * These live here rather than in the games page because /built reads them too:
 * anything in the arcade, front room or archive, is deliberately absent from
 * the catalogue, so the pages must not keep separate lists that can drift apart.
 */
export const ARCADE_SLUGS = ['lantern-night', 'night-parade', 'tokaido-run', 'neo-dojo-survivors', 'path-not-taken'];

/**
 * The Broom & Blade Arcade, the last room on /games before the archive's door
 * (Josh's call, 2026-10-05): the five machines of Broom & Blade's games room,
 * hosted by Pip the guild mouse, in machine order.
 */
export const BROOM_BLADE_ARCADE_SLUGS = [
  'hoop-quest',
  'kid-volt-knockout',
  'whack-a-dust-bunny',
  'ring-toss',
  'milk-bottle-knockdown',
];

/** The Arcade's archive, /games/archive: the older cabinets, in their old order. */
export const ARCADE_ARCHIVE_SLUGS = ['field-office', 'cloth-simulator', 'broom-blade', 'grove', 'pebble-kart', 'aureum-snake'];

/**
 * Every game on the site, the front room, the Broom & Blade Arcade and the
 * archive: what the catalogue, the search index and the home page's counts
 * treat as a game.
 */
export const GAME_SLUGS = [...ARCADE_SLUGS, ...BROOM_BLADE_ARCADE_SLUGS, ...ARCADE_ARCHIVE_SLUGS];

/** Projects with a full write-up on /websites, so they skip the catalogue. */
// Slugs that live on /websites as a full write-up and are therefore filtered out
// of the /apps catalogue, so nothing is listed twice.
//
// Emptied 2026-08-26: Samurai Kitchen came off /websites (replaced by the
// Kitsune Kitchen demo), so it returns to the catalogue here rather than
// disappearing from the site altogether — this list is the only thing that was
// hiding it.
export const WEBSITE_SLUGS: string[] = [];

export function getAppCategories(): string[] {
  return Array.from(new Set(apps.map((app) => app.category)));
}
